'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DatabricksApp, AppState } from '@/app/types/databricks';
import AppCard from './AppCard';

export default function AppCatalog() {
  const { data: session, status } = useSession();
  const [apps, setApps] = useState<DatabricksApp[]>([]);
  const [appStates, setAppStates] = useState<Record<string, AppState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Check if any app is in loading state
  const hasLoadingApps = Object.values(appStates).some(state => state === AppState.LOADING);

  // Determine app state from deployment status
  const determineAppState = (app: DatabricksApp): AppState => {
    try {
      if (app.active_deployment?.status?.state === 'SUCCEEDED') {
        return AppState.ON;
      }
      if (app.active_deployment?.status?.state === 'PENDING' || 
          app.active_deployment?.status?.state === 'RUNNING') {
        return AppState.LOADING;
      }
      return AppState.OFF;
    } catch {
      return AppState.OFF;
    }
  };

  // Fetch apps list
  const fetchApps = async () => {
    try {
      const response = await fetch('/api/databricks/apps');
      if (!response.ok) {
        throw new Error('Failed to fetch apps');
      }
      const data = await response.json();
      const appsList = data.apps || [];
      setApps(appsList);
      
      // Initialize app states
      const states: Record<string, AppState> = {};
      appsList.forEach((app: DatabricksApp) => {
        const appKey = app.name.replace(/-/g, '_');
        states[appKey] = determineAppState(app);
      });
      setAppStates(states);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching apps:', err);
      setError(err.message || 'Failed to fetch apps');
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  // Check status of a specific app
  const checkAppStatus = async (appName: string) => {
    try {
      const response = await fetch(`/api/databricks/apps/${appName}/status`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      const app = data.app;
      const appKey = app.name.replace(/-/g, '_');
      
      // Use state from response if available, otherwise determine from app
      const newState = data.state 
        ? (data.state as AppState)
        : determineAppState(app);
      
      setAppStates(prev => ({
        ...prev,
        [appKey]: newState,
      }));

      // Update app in apps list
      setApps(prev => prev.map(a => a.name === appName ? app : a));
    } catch (err) {
      console.error(`Error checking status for ${appName}:`, err);
    }
  };

  // Poll for app statuses when apps are loading
  useEffect(() => {
    if (hasLoadingApps) {
      const interval = setInterval(() => {
        // Check status of all loading apps
        Object.entries(appStates).forEach(([appKey, state]) => {
          if (state === AppState.LOADING) {
            const app = apps.find(a => a.name.replace(/-/g, '_') === appKey);
            if (app) {
              checkAppStatus(app.name);
            }
          }
        });
      }, 2000); // Poll every 2 seconds

      setPollingInterval(interval);
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [hasLoadingApps, appStates, apps]);

  // Initial fetch when session is available
  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchApps();
    }
  }, [status, session]);

  const handleStateChange = (appName: string, newState: AppState) => {
    const appKey = appName.replace(/-/g, '_');
    setAppStates(prev => ({
      ...prev,
      [appKey]: newState,
    }));
  };

  if (status === 'loading') {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-8 text-center">
        <p>Please sign in to view the demo catalog.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center">Loading apps...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchApps}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const userName = session?.user?.email?.split('.')[0] || 'User';
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome {displayName}</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-blue-800">
          The Data & AI Demo Catalog is a centralized hub for discovering and accessing all Data & AI demos across DAISE. 
          Users can quickly search and browse available demos, view screenshots and descriptions, and find key contacts for each demo. 
          Where available, demos can be accessed directly via a live link, or started on demand using the Start Demo button, 
          with the environment becoming available after a short setup period.
        </p>
        <p className="text-blue-800 mt-2">
          <strong>Note:</strong> On-demand demos are automatically turned off at the end of each business day (EOD).
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Data & AI Demo Catalogue</h2>
        
        {apps.length === 0 ? (
          <p className="text-gray-500">No apps available.</p>
        ) : (
          <div>
            {apps.map((app) => {
              const appKey = app.name.replace(/-/g, '_');
              return (
                <AppCard
                  key={app.name}
                  app={app}
                  currentState={appStates[appKey] || AppState.OFF}
                  onStateChange={handleStateChange}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
