import React from 'react';

export type WidgetCategory =
  | 'Profile'
  | 'Career'
  | 'Jobs'
  | 'Knowledge'
  | 'Marketplace'
  | 'AI'
  | 'Notifications'
  | 'Analytics'
  | 'System';

export interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  icon: string; // name of lucide-react icon
  category: WidgetCategory;
  priority: number; // lower number = higher priority
  permission?: string; // required role (e.g. 'candidate')
  featureFlag?: string;
  analyticsKey: string;
  isEnabled: boolean;
  refreshInterval?: number; // in milliseconds

  initialize?(): Promise<void>;
  load(): Promise<any>;
  render(data: any, actions?: any): React.ReactNode;
  refresh?(): Promise<void>;
  dispose?(): void;
  analytics?(event: string, properties?: any): void;
}
