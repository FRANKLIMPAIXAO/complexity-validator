import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Clock, 
  AlertTriangle, 
  UserX, 
  Info, 
  CheckCircle, 
  X,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'deadline':
      return <Clock className="h-4 w-4 text-orange-500" />;
    case 'underpricing':
      return <DollarSign className="h-4 w-4 text-red-500" />;
    case 'employee_risk':
      return <UserX className="h-4 w-4 text-amber-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'deadline':
      return 'border-l-orange-500';
    case 'underpricing':
      return 'border-l-red-500';
    case 'employee_risk':
      return 'border-l-amber-500';
    case 'warning':
      return 'border-l-yellow-500';
    case 'success':
      return 'border-l-green-500';
    default:
      return 'border-l-blue-500';
  }
};

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const navigate = useNavigate();
  const { markAsRead, deleteNotification } = useNotificationContext();

  const handleClick = async () => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on related entity
    if (notification.related_entity_type && notification.related_entity_id) {
      switch (notification.related_entity_type) {
        case 'client':
          navigate(`/clients/${notification.related_entity_id}`);
          break;
        case 'employee':
          navigate('/employees');
          break;
        case 'goal':
          navigate('/strategy');
          break;
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { 
    addSuffix: true,
    locale: ptBR 
  });

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-l-2",
        getNotificationColor(notification.type),
        !notification.is_read && "bg-muted/30"
      )}
      onClick={handleClick}
    >
      <div className="mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm line-clamp-1",
            !notification.is_read && "font-semibold"
          )}>
            {notification.title}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
            onClick={handleDelete}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {timeAgo}
        </p>
      </div>

      {!notification.is_read && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </div>
  );
};
