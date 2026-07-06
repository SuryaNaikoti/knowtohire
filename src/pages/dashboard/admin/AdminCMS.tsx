import React, { useState, useEffect, useCallback } from 'react';
import { blogService, BlogPost } from '../../../lib/services/blogService';
import { analyticsService, DashboardStats } from '../../../lib/services/analyticsService';
import { leadMagnetService } from '../../../lib/services/contentService';
import {
  LayoutDashboard, FileText, Download, BarChart3, Shield, Eye, TrendingUp,
  Users, Plus, Edit3, Globe, Clock, Sparkles, AlertTriangle, ChevronRight
} from 'lucide-react';

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.FC<any>;
  color: string;
  trend?: string;
}> = ({ label, value, icon: Icon, color, trend }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-800 mb-1">{value}</p>
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

// ── Blog Post Row ─────────────────────────────────────────────────────────────
const BlogPostRow: React.FC<{ post: BlogPost; onPublish: (id: string) => void; onUnpublish: (id: string) => void }> = ({
  post, onPublish, onUnpublish
}) => {
  const isPublished = !!post.published_at;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
          {post.title}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          {post.category && <span className="text-emerald-600 font-medium">{post.category}</span>}
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.view_count}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.read_time_minutes}m</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {isPublished ? 'Published' : 'Draft'}
        </span>
        <button
          onClick={() => isPublished ? onUnpublish(post.id) : onPublish(post.id)}
          className="opacity-0 group-hover:opacity-100 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-all"
        >
          {isPublished ? 'Unpublish' : 'Publish'}
        </button>
      </div>
    </div>
  );
};

// ── Tabs ──────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'blog' | 'resources' | 'analytics' | 'audit';

const tabs: { key: Tab; label: string; icon: React.FC<any> }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'blog', label: 'Blog CMS', icon: FileText },
  { key: 'resources', label: 'Resources', icon: Download },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'audit', label: 'Audit Logs', icon: Shield },
];

// ── Main Component ────────────────────────────────────────────────────────────
export const AdminCMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [magnets, setMagnets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [captures, setCaptures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsData, postsData, magnetsData] = await Promise.all([
        analyticsService.getAdminStats(30),
        blogService.getPosts({ limit: 20 }),
        leadMagnetService.getAll(),
      ]);
      setStats(analyticsData);
      setPosts(postsData.posts);
      setMagnets(magnetsData);
    } catch (err) {
      console.error('Admin CMS load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    try {
      const { auditService } = await import('../../../lib/services/analyticsService');
      const logs = await auditService.getAdminLogs({ limit: 50 });
      setAuditLogs(logs ?? []);
    } catch (_err) { /* intentionally silent */ }
  }, []);

  const loadCaptures = useCallback(async () => {
    try {
      const data = await leadMagnetService.getAllCaptures();
      setCaptures(data ?? []);
    } catch (_err) { /* intentionally silent */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (activeTab === 'audit') loadAuditLogs();
    if (activeTab === 'resources') loadCaptures();
  }, [activeTab, loadAuditLogs, loadCaptures]);

  const handlePublish = async (id: string) => {
    await blogService.publishPost(id);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, published_at: new Date().toISOString() } : p));
  };

  const handleUnpublish = async (id: string) => {
    await blogService.unpublishPost(id);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, published_at: undefined } : p));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    setSaving(true);
    try {
      const created = await blogService.createPost(newPost);
      setPosts((prev) => [created, ...prev]);
      setNewPost({});
      setShowCreatePost(false);
      setSaveMsg('✅ Post created successfully');
    } catch (err: any) {
      setSaveMsg(`❌ ${err?.message ?? 'Failed to create post'}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const severityColor: Record<string, string> = {
    info: 'text-blue-600 bg-blue-50',
    warning: 'text-amber-600 bg-amber-50',
    error: 'text-red-600 bg-red-50',
    critical: 'text-red-800 bg-red-100',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Admin CMS
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">Content & Analytics Management</p>
            </div>
            {saveMsg && (
              <div className="text-sm font-medium text-slate-700 bg-slate-100 px-4 py-2 rounded-xl">
                {saveMsg}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 overflow-x-auto">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === key
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
            Loading…
          </div>
        )}

        {!loading && (
          <>
            {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total Events (30d)" value={stats.totalEvents.toLocaleString()} icon={BarChart3} color="bg-blue-100 text-blue-600" />
                  <StatCard label="Unique Users (30d)" value={stats.totalUsers.toLocaleString()} icon={Users} color="bg-emerald-100 text-emerald-600" />
                  <StatCard label="Blog Posts" value={posts.length} icon={FileText} color="bg-violet-100 text-violet-600" />
                  <StatCard label="Free Resources" value={magnets.length} icon={Download} color="bg-amber-100 text-amber-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top pages */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      Top Pages
                    </h2>
                    <div className="space-y-2">
                      {stats.topPages.slice(0, 8).map((p, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <span className="text-slate-400 w-5 text-right">{i + 1}</span>
                          <span className="flex-1 truncate text-slate-600">{p.page_url.replace(window.location.origin, '')}</span>
                          <span className="font-semibold text-slate-800">{p.count}</span>
                        </div>
                      ))}
                      {stats.topPages.length === 0 && <p className="text-sm text-slate-400">No page view data yet.</p>}
                    </div>
                  </div>

                  {/* Event breakdown */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Event Breakdown
                    </h2>
                    <div className="space-y-2">
                      {stats.eventBreakdown.slice(0, 8).map((e, i) => {
                        const maxCount = stats.eventBreakdown[0]?.count ?? 1;
                        const pct = Math.round((e.count / maxCount) * 100);
                        return (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <span className="w-36 truncate text-slate-500">{e.event_type.replace(/_/g, ' ')}</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="font-semibold text-slate-800 w-8 text-right">{e.count}</span>
                          </div>
                        );
                      })}
                      {stats.eventBreakdown.length === 0 && <p className="text-sm text-slate-400">No events recorded yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── BLOG CMS ─────────────────────────────────────────────────── */}
            {activeTab === 'blog' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Blog Posts</h2>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Post
                  </button>
                </div>

                {showCreatePost && (
                  <div className="bg-white rounded-2xl border border-emerald-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-emerald-600" />
                      Create New Post
                    </h3>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Post title *"
                        value={newPost.title ?? ''}
                        onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Slug (auto-generated if empty)"
                          value={newPost.slug ?? ''}
                          onChange={(e) => setNewPost((p) => ({ ...p, slug: e.target.value }))}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Category"
                          value={newPost.category ?? ''}
                          onChange={(e) => setNewPost((p) => ({ ...p, category: e.target.value }))}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm"
                        />
                      </div>
                      <textarea
                        placeholder="Excerpt (optional)"
                        value={newPost.excerpt ?? ''}
                        onChange={(e) => setNewPost((p) => ({ ...p, excerpt: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm resize-none"
                      />
                      <textarea
                        placeholder="Content (HTML or Markdown) *"
                        value={newPost.content ?? ''}
                        onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))}
                        required
                        rows={6}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm resize-none font-mono text-xs"
                      />
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={!!newPost.is_featured}
                            onChange={(e) => setNewPost((p) => ({ ...p, is_featured: e.target.checked }))}
                            className="rounded"
                          />
                          Featured
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={!!newPost.is_gated}
                            onChange={(e) => setNewPost((p) => ({ ...p, is_gated: e.target.checked }))}
                            className="rounded"
                          />
                          Gated (requires lead capture)
                        </label>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowCreatePost(false)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                        >
                          {saving ? 'Saving…' : 'Save as Draft'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                  {posts.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">No posts yet. Create your first post!</p>
                  ) : (
                    posts.map((post) => (
                      <BlogPostRow key={post.id} post={post} onPublish={handlePublish} onUnpublish={handleUnpublish} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── RESOURCES ────────────────────────────────────────────────── */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800">Lead Magnet Captures</h2>
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  {captures.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-10">No captures yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-left">Email</th>
                          <th className="px-4 py-3 text-left">Resource</th>
                          <th className="px-4 py-3 text-left">Source</th>
                          <th className="px-4 py-3 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {captures.slice(0, 50).map((c: any) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{c.email}</td>
                            <td className="px-4 py-3 text-slate-500">{c.lead_magnet?.title ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-400">{c.source ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── ANALYTICS ────────────────────────────────────────────────── */}
            {activeTab === 'analytics' && stats && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800">Analytics (Last 30 Days)</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Page Views" value={stats.eventBreakdown.find(e => e.event_type === 'page_view')?.count ?? 0} icon={Eye} color="bg-blue-100 text-blue-600" />
                  <StatCard label="Unique Users" value={stats.totalUsers} icon={Users} color="bg-emerald-100 text-emerald-600" />
                  <StatCard label="Total Events" value={stats.totalEvents} icon={BarChart3} color="bg-violet-100 text-violet-600" />
                  <StatCard label="Resource Downloads" value={stats.eventBreakdown.find(e => e.event_type === 'lead_magnet_download')?.count ?? 0} icon={Download} color="bg-amber-100 text-amber-600" />
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="font-bold text-slate-700 mb-4">Recent Events</h3>
                  <div className="space-y-2">
                    {stats.recentEvents.slice(0, 15).map((e: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-slate-50">
                        <span className="w-32 text-slate-400">{new Date(e.created_at).toLocaleString()}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">{e.event_type}</span>
                        <span className="text-slate-500 truncate">{e.page_url}</span>
                      </div>
                    ))}
                    {stats.recentEvents.length === 0 && <p className="text-sm text-slate-400">No events yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── AUDIT LOGS ───────────────────────────────────────────────── */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-500" />
                  Audit Logs
                </h2>
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-10">No audit logs yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-left">Time</th>
                          <th className="px-4 py-3 text-left">Action</th>
                          <th className="px-4 py-3 text-left">Table</th>
                          <th className="px-4 py-3 text-left">Severity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {auditLogs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 text-slate-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                            <td className="px-4 py-2.5 font-medium text-slate-700">{log.action}</td>
                            <td className="px-4 py-2.5 text-slate-500">{log.table_name ?? '—'}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColor[log.severity] ?? 'bg-slate-100 text-slate-600'}`}>
                                {log.severity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCMS;
