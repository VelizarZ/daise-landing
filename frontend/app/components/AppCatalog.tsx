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

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const idToken = (session as any)?.id_token as string | undefined;

  const authHeaders = (): HeadersInit => {
    // If you want to hard-fail when missing:
    // if (!idToken) throw new Error("Missing id_token in session");
    return idToken ? { Authorization: `Bearer ${idToken}` } : {};
  };

  const hasLoadingApps = Object.values(appStates).some(state => state === AppState.LOADING);

  const determineAppState = (app: DatabricksApp): AppState => {
    try {
      if (app.active_deployment?.status?.state === 'SUCCEEDED') return AppState.ON;
      if (
        app.active_deployment?.status?.state === 'PENDING' ||
        app.active_deployment?.status?.state === 'RUNNING'
      ) return AppState.LOADING;
      return AppState.OFF;
    } catch {
      return AppState.OFF;
    }
  };

  const fetchApps = async () => {
    try {
      if (!BASE_URL) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

      const response = await fetch(`${BASE_URL}/databricks/apps`, {
        headers: {
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch apps');
      }

      const data = await response.json();
      const appsList = data.apps || [];
      setApps(appsList);

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

  const checkAppStatus = async (appName: string) => {
    try {
      if (!BASE_URL) return;

      const response = await fetch(`${BASE_URL}/databricks/apps/${appName}/status`, {
        headers: {
          ...authHeaders(),
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const app = data.app;
      const appKey = app.name.replace(/-/g, '_');

      const newState = data.state ? (data.state as AppState) : determineAppState(app);

      setAppStates(prev => ({
        ...prev,
        [appKey]: newState,
      }));

      setApps(prev => prev.map(a => (a.name === appName ? app : a)));
    } catch (err) {
      console.error(`Error checking status for ${appName}:`, err);
    }
  };

  useEffect(() => {
    if (hasLoadingApps) {
      const interval = setInterval(() => {
        Object.entries(appStates).forEach(([appKey, state]) => {
          if (state === AppState.LOADING) {
            const app = apps.find(a => a.name.replace(/-/g, '_') === appKey);
            if (app) checkAppStatus(app.name);
          }
        });
      }, 2000);

      setPollingInterval(interval);
      return () => clearInterval(interval);
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [hasLoadingApps, appStates, apps]);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchApps();
    }
  }, [status, session]);

  const handleStateChange = (appName: string, newState: AppState) => {
    const appKey = appName.replace(/-/g, '_');
    setAppStates(prev => ({ ...prev, [appKey]: newState }));
  };

  if (status === 'loading') return <div className="p-8 text-center">Loading...</div>;

  if (status === 'unauthenticated') {
    return (
      <div className="p-8 text-center">
        <p>Please sign in to view the demo catalog.</p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Loading apps...</div>;

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
      {/* ...rest unchanged */}
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
