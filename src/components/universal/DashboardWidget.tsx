import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WidgetProps {
  title: string;
  value: string | number;
  trend?: { direction: 'UP' | 'DOWN'; percentage: number };
  icon?: React.ReactNode;
  alertStatus?: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export const DashboardWidget: React.FC<WidgetProps> = ({ title, value, trend, icon, alertStatus = 'NORMAL' }) => {
  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300", 
      alertStatus === 'CRITICAL' ? "border-red-500 shadow-red-500/20" : 
      alertStatus === 'WARNING' ? "border-yellow-500 shadow-yellow-500/20" : ""
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black">{value}</div>
        {trend && (
          <p className={cn("text-xs mt-2 font-bold", 
            trend.direction === 'UP' ? "text-green-500" : "text-red-500"
          )}>
            {trend.direction === 'UP' ? '↑' : '↓'} {trend.percentage}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
};
