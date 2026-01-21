import React from 'react';
import { KeyIcon, PlugIcon, BrainCircuitIcon, ClockIcon, ZapIcon, RocketIcon } from '../Icons.js';
import { Button } from './StyledComponents';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tabType: 'apiKeys' | 'integrations' | 'ai' | 'cron' | 'automation' | 'deploy';
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, tabType }) => {
  const getIcon = () => {
    switch (tabType) {
      case 'apiKeys': return <KeyIcon className="h-5 w-5" />;
      case 'integrations': return <PlugIcon className="h-5 w-5" />;
      case 'ai': return <BrainCircuitIcon className="h-5 w-5" />;
      case 'cron': return <ClockIcon className="h-5 w-5" />;
      case 'automation': return <ZapIcon className="h-5 w-5" />;
      case 'deploy': return <RocketIcon className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <Button
      variant={active ? 'primary' : 'ghost'}
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 ${active ? '' : 'justify-start'}`}
    >
      {getIcon()}
      {children}
    </Button>
  );
};