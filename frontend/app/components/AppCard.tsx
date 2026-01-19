'use client';

import { DatabricksApp, AppState } from '@/app/types/databricks';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface AppCardProps {
  app: DatabricksApp;
  currentState: AppState;
  onStateChange: (appName: string, newState: AppState) => void;
}

export default function AppCard({ app, currentState, onStateChange }: AppCardProps) {
  const { data: session } = useSession();
  const [isStarting, setIsStarting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const appKey = app.name.replace(/-/g, '_');
  const displayName = appKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const idToken = (session as any)?.id_token as string | undefined;

  const authHeaders = (): HeadersInit => {
    return idToken ? { Authorization: `Bearer ${idToken}` } : {};
  };

  const handleStartApp = async () => {
    setIsStarting(true);
    try {
      if (!BASE_URL) {
        throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
      }

      const response = await fetch(`${BASE_URL}/databricks/apps/${app.name}/start`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to start app' }));
        throw new Error(errorData.detail || errorData.error || 'Failed to start app');
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-1 flex justify-center md:justify-start">
          {/* Screenshot image - place images in public/images/{appKey}/screenshot.png */}
          <div
            className="w-[150px] aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200
                       dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden shadow-md
                       border border-gray-200 dark:border-gray-700 flex items-center justify-center
                       group shrink-0"
          >
            {!imageError ? (
              <img
                src={`/images/${appKey}/screenshot.png`}
                alt={`${displayName} screenshot`}
                className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400">Screenshot</span>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-4">
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
              <p className="text-yellow-800">Demo is loading... This process may take 2 to 3 minutes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
