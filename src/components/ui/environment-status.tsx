import React from 'react';
import { Badge } from './badge';
import { getCurrentEnvironment, isWindowsBackend, isLocalDevelopment } from '../../config/environment';

interface EnvironmentStatusProps {
  className?: string;
}

export const EnvironmentStatus: React.FC<EnvironmentStatusProps> = ({ className = '' }) => {
  const currentEnv = getCurrentEnvironment();
  
  const getBadgeVariant = () => {
    if (isLocalDevelopment()) return 'default';
    if (isWindowsBackend()) return 'secondary';
    return 'destructive';
  };

  const getStatusIcon = () => {
    if (isLocalDevelopment()) return '🖥️';
    if (isWindowsBackend()) return '🪟';
    return '🌐';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">Backend:</span>
      <Badge variant={getBadgeVariant()} className="text-xs">
        {getStatusIcon()} {currentEnv.name}
      </Badge>
    </div>
  );
};

export default EnvironmentStatus;
