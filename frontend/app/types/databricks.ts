export enum AppState {
  OFF = 'off',
  ON = 'on',
  LOADING = 'loading',
}

export interface DatabricksApp {
  name: string;
  description?: string;
  url?: string;
  active_deployment?: {
    status: {
      state: string;
    };
  };
}

export interface AppInfo {
  name: string;
  description?: string;
  url?: string;
  state: AppState;
}
