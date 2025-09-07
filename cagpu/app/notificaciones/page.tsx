'use client'
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatTimeAgo } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, RefreshCcw, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ACTIONS = [
  { value: 'all', label: 'Todas las acciones' },
  { value: 'activate', label: 'Activaciones' },
  { value: 'deactivate', label: 'Desactivaciones' },
  { value: 'update', label: 'Actualizaciones' },
];

function getActionIcon(title: string) {
  if (title.toLowerCase().includes('activado')) return <CheckCircle className="text-green-500 w-6 h-6" />;
  if (title.toLowerCase().includes('desactivado')) return <XCircle className="text-red-500 w-6 h-6" />;
  if (title.toLowerCase().includes('actualizado')) return <RefreshCcw className="text-blue-500 w-6 h-6" />;
  return <Bell className="text-gray-400 w-6 h-6" />;
}

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/notifications?page=${page}&limit=${pageSize}&all=1`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setTotal(data.total || 0);
        setLoading(false);
      });
  }, [page]);

  // Extraer posibles usuarios de las notificaciones
  const userList = Array.from(new Set(notifications.map(n => {
    const match = n.message?.match(/por ([a-zA-Z0-9_\-.@]+)/);
    return match ? match[1] : null;
  }).filter(Boolean)));

  const filtered = notifications.filter(n => {
    if (filter === 'read' && !n.isRead) return false;
    if (filter === 'unread' && n.isRead) return false;
    if (actionFilter !== 'all') {
      if (actionFilter === 'activate' && !n.title.toLowerCase().includes('activado')) return false;
      if (actionFilter === 'deactivate' && !n.title.toLowerCase().includes('desactivado')) return false;
      if (actionFilter === 'update' && !n.title.toLowerCase().includes('actualizado')) return false;
    }
    if (userFilter && (!n.message || !n.message.includes(userFilter))) return false;
    return true;
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 px-4 pt-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Historial de notificaciones</h1>
        <Button variant="secondary" className="rounded-lg shadow" onClick={() => router.push('/dashboard')}>
          ← Regresar al dashboard
        </Button>
      </div>
      <main className="flex-1 container mx-auto p-4 md:p-6 max-w-6xl">
        <div className="flex flex-wrap gap-2 mb-6 items-center bg-muted/80 p-3 rounded-lg shadow-sm">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} className="rounded-full px-4">Todas</Button>
          <Button variant={filter === 'unread' ? 'default' : 'outline'} onClick={() => setFilter('unread')} className="rounded-full px-4">No leídas</Button>
          <Button variant={filter === 'read' ? 'default' : 'outline'} onClick={() => setFilter('read')} className="rounded-full px-4">Leídas</Button>
          <select
            className="ml-4 border rounded-full px-3 py-1 text-sm bg-white shadow"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
          >
            {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
          <select
            className="border rounded-full px-3 py-1 text-sm bg-white shadow"
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
          >
            <option value="">Todos los usuarios</option>
            {userList.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-4 mt-2">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground text-lg">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-lg">No hay notificaciones</div>
          ) : (
            filtered.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-5 rounded-lg border bg-white transition hover:shadow-md ${!n.isRead ? 'border-blue-400/60 bg-blue-50/60' : 'border-slate-200'}`}
              >
                <div className="pt-1">{getActionIcon(n.title)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-base ${!n.isRead ? 'text-blue-900' : 'text-slate-800'}`}>{n.title}</span>
                    {!n.isRead && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">Nueva</span>}
                  </div>
                  <span className="block text-sm text-slate-600 mt-1">{n.message}</span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    {formatTimeAgo(new Date(n.createdAt))}
                    {" • "}
                    {format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </span>
                </div>
                {!n.isRead && (
                  <Button size="sm" variant="ghost" className="ml-2 mt-1 text-blue-700 hover:bg-blue-100" onClick={async () => {
                    await fetch('/api/notifications', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: n.id })
                    });
                    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
                  }}>
                    Marcar como leído
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center gap-2 mt-10 mb-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Button key={p} size="sm" variant={p === page ? 'default' : 'outline'} className="rounded-full" onClick={() => setPage(p)}>
              {p}
            </Button>
          ))}
        </div>
      </main>
    </div>
  );
} 