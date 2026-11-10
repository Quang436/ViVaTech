import React, { useEffect } from 'react';
import {
  BadgeCheck,
  AlertTriangle,
  GraduationCap,
  Bell,
  BellOff,
  ArrowRight,
} from 'lucide-react';

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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <BadgeCheck className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#b45309]" strokeWidth={2} aria-hidden="true" />;
      case 'academic':
        return <GraduationCap className="w-4 h-4 text-[#0369a1]" strokeWidth={2} aria-hidden="true" />;
      default:
        return <Bell className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#0a1413]/15 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <section
        id="notifications-popover"
        aria-label="Thông báo học thuật"
        className="fixed right-4 top-20 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-[rgba(10,20,19,0.12)] shadow-[0_24px_60px_-15px_rgba(10,20,19,0.16)] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[rgba(10,20,19,0.08)] flex items-center justify-between bg-[#eff5f3]/70">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0b6e5e]" strokeWidth={2} aria-hidden="true" />
            <h2 className="font-sans font-semibold text-sm text-[#0a1413]">
              Thông Báo Học Thuật
            </h2>
            {unreadCount > 0 && (
              <span className="mint-tag mint">{unreadCount} mới</span>
            )}
          </div>
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-xs font-sans text-[#0b6e5e] hover:underline font-medium cursor-pointer border-none bg-transparent"
          >
            Đã đọc tất cả
          </button>
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-[rgba(10,20,19,0.07)]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-[#465754] font-sans text-xs flex flex-col items-center gap-2">
              <BellOff className="w-6 h-6 text-[#556361]" strokeWidth={1.7} aria-hidden="true" />
              <span>Hiện chưa có thông báo mới nào</span>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 transition-colors hover:bg-[#eff5f3]/70 flex items-start gap-3 relative ${
                  item.unread ? 'bg-[rgba(110,231,200,0.09)]' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#eff5f3] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[rgba(10,20,19,0.08)]">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-sans font-semibold text-xs text-[#0a1413] truncate">
                      {item.title}
                    </h3>
                    <span className="font-mono text-[10px] text-[#556361] whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-[#465754] leading-relaxed mb-2">
                    {item.description}
                  </p>

                  {item.actionLabel && item.actionTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectAction(item.actionTab!);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#0b6e5e] hover:underline transition-colors cursor-pointer border-none bg-transparent p-0"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
                    </button>
                  )}
                </div>

                {item.unread && (
                  <span
                    className="w-2 h-2 rounded-full bg-[#0b6e5e] flex-shrink-0 mt-1.5"
                    aria-label="Chưa đọc"
                  />
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-[rgba(10,20,19,0.08)] bg-[#eff5f3]/50 flex items-center justify-between text-[11px] font-mono text-[#556361]">
          <span>Trung tâm Thông báo VivaArena</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[#0b6e5e] font-sans font-medium hover:underline cursor-pointer border-none bg-transparent"
          >
            Đóng
          </button>
        </div>
      </section>
    </>
  );
};
