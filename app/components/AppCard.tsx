'use client';

import { DatabricksApp, AppState } from '@/app/types/databricks';
import { useState } from 'react';

interface AppCardProps {
  app: DatabricksApp;
  currentState: AppState;
  onStateChange: (appName: string, newState: AppState) => void;
}

export default function AppCard({ app, currentState, onStateChange }: AppCardProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const appKey = app.name.replace(/-/g, '_');
  const displayName = appKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const handleStartApp = async () => {
    setIsStarting(true);
    try {
      const response = await fetch(`/api/databricks/apps/${app.name}/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start app');
      }

      onStateChange(app.name, AppState.LOADING);
    } catch (error: any) {
      console.error('Error starting app:', error);
      alert(error.message || 'Failed to start app. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const getStatusColor = () => {
    switch (currentState) {
      case AppState.ON:
        return 'bg-green-500';
      case AppState.LOADING:
        return 'bg-yellow-500';
      case AppState.OFF:
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-3 h-3 rounded-full ${getStatusColor()}`}></span>
        <h3 className="text-xl font-semibold">{displayName}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          {/* Screenshot image - place images in public/images/{appKey}/screenshot.png */}
          <div className="w-full aspect-video bg-gray-200 rounded overflow-hidden flex items-center justify-center">
            {!imageError ? (
              <img
                src={`/images/${appKey}/screenshot.png`}
                alt={`${displayName} screenshot`}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-gray-400">Screenshot</span>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          {app.description && (
            <p className="mb-2">
              <strong>Description:</strong> {app.description}
            </p>
          )}

          <div className="mb-4">
            <strong>Contacts:</strong>
            {/* Add contacts here if available */}
          </div>

          {currentState === AppState.OFF && (
            <button
              onClick={handleStartApp}
              disabled={isStarting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isStarting ? 'Starting...' : 'Start Demo'}
            </button>
          )}

          {currentState === AppState.ON && app.url && (
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to App
            </a>
          )}

          {currentState === AppState.LOADING && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                Demo is loading... This process may take 2 to 3 minutes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
