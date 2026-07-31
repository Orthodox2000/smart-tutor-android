'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Megaphone, ShieldAlert, MessageSquare, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiFetch } from '../../../lib/api';
import PageBackButton from '../../../components/PageBackButton';
import Link from 'next/link';

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    fetchNotifications();
  }, [profile]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/notifications');
      setNotifications(data.notifications || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Megaphone className="text-blue-500" size={18} />;
      case 'alert': return <ShieldAlert className="text-red-500" size={18} />;
      case 'message': return <MessageSquare className="text-emerald-500" size={18} />;
      default: return <Bell className="text-academy-orange-500" size={18} />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <header className="flex items-center gap-2">
        <PageBackButton />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Stay Updated</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 opacity-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"></div>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {notifications.length > 0 ? (
            notifications.map((notif, i) => (
              <motion.div
                key={notif.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white p-4 rounded-2xl border shadow-sm flex items-start gap-3 ${
                  notif.read ? 'border-slate-100' : 'border-academy-orange-100 bg-academy-orange-50/30'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{notif.title || 'Notification'}</h3>
                    {!notif.read && <span className="w-2 h-2 bg-academy-orange-500 rounded-full flex-shrink-0"></span>}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10px] text-slate-300 font-bold">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''}
                    </p>
                    {notif.link && (
                      <Link href={notif.link} className="text-[10px] font-bold text-academy-orange-600 hover:underline">
                        View
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-1.5 text-slate-300 hover:text-emerald-500 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
              <Bell size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No notifications yet</p>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
