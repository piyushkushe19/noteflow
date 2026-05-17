import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { FileText, Archive, Sparkles, TrendingUp, Clock, Tag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardStats } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function StatCard({
  icon: Icon,
  label,
  value,
  color = 'text-primary',
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 animate-fade-in">
      <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const chartData = stats.weeklyActivity.map((d) => ({
    ...d,
    date: format(parseISO(d.date), 'EEE'),
  }));

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your productivity overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Total Notes" value={stats.totalNotes} />
        <StatCard icon={Archive} label="Archived" value={stats.archivedNotes} color="text-amber-400" />
        <StatCard icon={TrendingUp} label="This Week" value={stats.weeklyNotes} color="text-green-400" />
        <StatCard icon={Sparkles} label="AI Usages" value={stats.aiUsageCount} color="text-purple-400" />
      </div>

      {/* Weekly activity chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Weekly Activity
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221,83%,60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(221,83%,60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,14%)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(215,20%,55%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(215,20%,55%)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,14%)', borderRadius: 8 }}
              labelStyle={{ color: 'hsl(210,40%,98%)' }}
              itemStyle={{ color: 'hsl(221,83%,60%)' }}
            />
            <Area type="monotone" dataKey="count" stroke="hsl(221,83%,60%)" strokeWidth={2} fill="url(#colorCount)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top tags */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Top Tags
          </h2>
          {stats.topTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.topTags} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="tag" tick={{ fontSize: 12, fill: 'hsl(215,20%,55%)' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222,47%,8%)', border: '1px solid hsl(217,33%,14%)', borderRadius: 8 }}
                  cursor={{ fill: 'hsl(217,33%,14%)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stats.topTags.map((_, i) => (
                    <Cell key={i} fill={`hsl(221,83%,${50 + i * 5}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent notes */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Recent Notes
          </h2>
          {stats.recentNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentNotes.map((note) => (
                <li key={note._id}>
                  <Link
                    to={`/notes/${note._id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {note.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {note.category && (
                      <Badge variant="muted" className="ml-2 flex-shrink-0 text-xs">
                        {note.category}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
