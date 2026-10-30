import React from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'success' | 'warning' | 'info' | 'academic';
  actionLabel?: string;
  actionTab?: 'setup' | 'arena' | 'scorecard' | 'archive' | 'documents';
}

interface NotificationsPopoverProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onSelectAction: (tab: 'setup' | 'arena' | 'scorecard' | 'archive' | 'documents') => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <span className="material-symbols-outlined text-primary text-[19px]">verified</span>;
      case 'warning':
        return <span className="material-symbols-outlined text-amber-600 text-[19px]">warning</span>;
      case 'academic':
        return <span className="material-symbols-outlined text-secondary text-[19px]">school</span>;
      default:
        return <span className="material-symbols-outlined text-primary-container text-[19px]">notifications</span>;
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Popover Card */}
      <div className="absolute right-4 top-18 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl border border-surface-container-high shadow-2xl overflow-hidden anim-float-slow">
        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
            <h3 className="font-headline font-semibold text-base text-on-surface">Thông Báo Học Thuật</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-label font-bold bg-primary text-white">
                {unreadCount} mới
              </span>
            )}
          </div>
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-label text-primary hover:underline font-semibold cursor-pointer border-none bg-transparent"
          >
            Đã đọc tất cả
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-surface-container-high/60">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant font-body text-xs">
              <span className="material-symbols-outlined text-3xl text-outline mb-2 block">notifications_off</span>
              Hiện chưa có thông báo mới nào
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 transition-colors hover:bg-surface-container-low/80 flex items-start gap-3 relative ${
                  item.unread ? 'bg-primary-fixed/10' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0 mt-0.5 border border-surface-container-high/60">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-label font-bold text-xs text-on-surface truncate">
                      {item.title}
                    </h4>
                    <span className="font-label text-[10px] text-on-surface-variant whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>

                  <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-2">
                    {item.description}
                  </p>

                  {item.actionLabel && item.actionTab && (
                    <button
                      onClick={() => {
                        onSelectAction(item.actionTab!);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-label font-bold text-primary hover:text-primary-container transition-colors cursor-pointer border-none bg-transparent p-0"
                    >
                      <span>{item.actionLabel}</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  )}
                </div>

                {item.unread && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-surface-container-high/60 bg-surface-container-low/40 flex items-center justify-between text-[11px] font-label text-on-surface-variant">
          <span>Trung tâm Thông báo VivaArena</span>
          <button
            onClick={onClose}
            className="text-primary font-semibold hover:underline cursor-pointer border-none bg-transparent"
          >
            Đóng
          </button>
        </div>
      </div>
    </>
  );
};
