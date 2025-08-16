import React from 'react';
import { config, getApiUrl, getWsUrl } from '../../config/environment';

export const DebugEnv: React.FC = () => {
  if (import.meta.env.PROD) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}>
        <div><strong>Environment Debug:</strong></div>
        <div>API URL: {config.apiUrl}</div>
        <div>WS URL: {config.wsUrl}</div>
        <div>App Env: {config.appEnv}</div>
        <div>Mode: {import.meta.env.MODE}</div>
        <div>Dev: {import.meta.env.DEV ? 'true' : 'false'}</div>
        <div>Prod: {import.meta.env.PROD ? 'true' : 'false'}</div>
      </div>
    );
  }
  
  return null;
};
