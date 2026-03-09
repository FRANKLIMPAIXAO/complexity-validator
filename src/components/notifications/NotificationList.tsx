import React from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCheck, Trash2, Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const NotificationList = () => {
  const { 
    notifications, 
    isLoading, 
    unreadCount,
    markAllAsRead, 
    clearAll 
  } = useNotificationContext();

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              ({unreadCount} não lidas)
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7"
              onClick={markAllAsRead}
              title="Marcar todas como lidas"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={clearAll}
              title="Limpar todas"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">Nenhuma notificação</p>
          <p className="text-xs mt-1">
            Você receberá alertas sobre prazos, subprecificação e colaboradores em risco
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
