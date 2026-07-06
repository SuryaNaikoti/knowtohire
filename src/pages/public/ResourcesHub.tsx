import React, { useState, useEffect } from 'react';
import { leadMagnetService, resourceRequestService } from '../../lib/services/contentService';
import type { LeadMagnet, ResourceRequest } from '../../lib/services/contentService';
import { analyticsService } from '../../lib/services/analyticsService';
import {
  Download, FileText, CheckSquare, BookOpen, Video, Globe, BarChart3,
  Plus, ThumbsUp, MessageSquare, Sparkles, Users, TrendingUp
} from 'lucide-react';

// ── Type icon map ─────────────────────────────────────────────────────────────
const typeIcon: Record<string, React.FC<any>> = {
  ebook: BookOpen,
  checklist: CheckSquare,
  template: FileText,
  course: Video,
  webinar: Globe,
  report: BarChart3,
};

const typeColors: Record<string, string> = {
  ebook: 'bg-violet-100 text-violet-700 border-violet-200',
  checklist: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  template: 'bg-blue-100 text-blue-700 border-blue-200',
  course: 'bg-amber-100 text-amber-700 border-amber-200',
  webinar: 'bg-pink-100 text-pink-700 border-pink-200',
  report: 'bg-slate-100 text-slate-700 border-slate-200',
};

// ── Lead Magnet Card ──────────────────────────────────────────────────────────
const LeadMagnetCard: React.FC<{ item: LeadMagnet; onDownload: (item: LeadMagnet) => void }> = ({ item, onDownload }) => {
  const Icon = typeIcon[item.type] ?? FileText;
  const colorClass = typeColors[item.type] ?? typeColors.report;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {item.thumbnail_url && (
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      {!item.thumbnail_url && (
        <div className="h-40 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
          <Icon className="w-16 h-16 text-emerald-300" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
            <Icon className="w-3.5 h-3.5" />
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Download className="w-3 h-3" />
            {item.download_count.toLocaleString()}
          </span>
        </div>
        <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-2 line-clamp-2">{item.title}</h3>
        {item.description && <p className="text-sm text-slate-500 line-clamp-2 mb-4">{item.description}</p>}
        <button
          onClick={() => onDownload(item)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          {item.gate_type === 'email' ? 'Get Free Access' : item.gate_type === 'subscription' ? 'Unlock with Plan' : 'Download Now'}
        </button>
      </div>
    </div>
  );
};

// ── Capture Modal ─────────────────────────────────────────────────────────────
const CaptureModal: React.FC<{
  item: LeadMagnet;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ item, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await leadMagnetService.capture({
        lead_magnet_id: item.id,
        email,
        first_name: firstName || undefined,
        source: 'resources_page',
      });
      analyticsService.track({
        event_type: 'lead_magnet_download',
        event_category: 'content',
        entity_type: 'lead_magnet',
        entity_id: item.id,
        properties: { gate_type: item.gate_type },
      });
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Download className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Get Free Access</h3>
            <p className="text-xs text-slate-500">{item.title}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name (optional)</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your first name"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? 'Processing…' : 'Send Me the Resource'}
          </button>
          <p className="text-xs text-slate-400 text-center">We respect your privacy. Unsubscribe any time.</p>
        </form>
      </div>
    </div>
  );
};

// ── Resource Request Form ─────────────────────────────────────────────────────
const RequestForm: React.FC<{ onSubmit: (data: any) => Promise<void> }> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ title, description, category: category || undefined });
      setTitle(''); setDescription(''); setCategory('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <Plus className="w-4 h-4 text-emerald-600" />
        Request a Resource
      </h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Resource title (e.g. 'LinkedIn Networking Templates')"
        required
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe what you'd like and how it would help you…"
        required
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm resize-none"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none text-sm text-slate-600"
      >
        <option value="">Select category (optional)</option>
        <option value="Job Search">Job Search</option>
        <option value="Interview Prep">Interview Prep</option>
        <option value="Resume & CV">Resume & CV</option>
        <option value="Networking">Networking</option>
        <option value="Salary Negotiation">Salary Negotiation</option>
        <option value="Career Development">Career Development</option>
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-emerald-600 font-medium">✅ Request submitted! Thank you.</p>}
      <button
        type="submit"
        disabled={submitting || !title.trim() || !description.trim()}
        className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all text-sm"
      >
        {submitting ? 'Submitting…' : 'Submit Request'}
      </button>
    </form>
  );
};

// ── Upvote Button ─────────────────────────────────────────────────────────────
const UpvoteButton: React.FC<{ requestId: string; count: number; hasVoted: boolean; onVote: () => void }> = ({
  count, hasVoted, onVote
}) => (
  <button
    onClick={onVote}
    className={`flex flex-col items-center gap-0.5 w-12 py-2 rounded-xl border transition-all duration-200 ${
      hasVoted ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-400 hover:border-emerald-200 hover:text-emerald-600'
    }`}
  >
    <ThumbsUp className="w-4 h-4" />
    <span className="text-xs font-semibold">{count}</span>
  </button>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export const ResourcesHub: React.FC = () => {
  const [magnets, setMagnets] = useState<LeadMagnet[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [userUpvotes, setUserUpvotes] = useState<string[]>([]);
  const [captureTarget, setCaptureTarget] = useState<LeadMagnet | null>(null);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [loadingMagnets, setLoadingMagnets] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeTab, setActiveTab] = useState<'magnets' | 'requests'>('magnets');

  const loadMagnets = async () => {
    setLoadingMagnets(true);
    try {
      const data = await leadMagnetService.getAll();
      setMagnets(data);
    } catch {
      // fallback gracefully
    } finally {
      setLoadingMagnets(false);
    }
  };

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const data = await resourceRequestService.getAll();
      setRequests(data);
    } catch {
      // fallback gracefully
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    analyticsService.trackPageView();
    loadMagnets();
    loadRequests();
  }, []);

  const handleDownload = (item: LeadMagnet) => {
    setCaptureTarget(item);
    setCaptureSuccess(false);
  };

  const handleCaptureSuccess = () => {
    setCaptureTarget(null);
    setCaptureSuccess(true);
    loadMagnets();
    setTimeout(() => setCaptureSuccess(false), 4000);
  };

  const handleUpvote = async (requestId: string) => {
    try {
      const added = await resourceRequestService.upvote(requestId);
      if (added) {
        setUserUpvotes((prev) => [...prev, requestId]);
      } else {
        setUserUpvotes((prev) => prev.filter((id) => id !== requestId));
      }
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, upvote_count: r.upvote_count + (userUpvotes.includes(requestId) ? -1 : 1) }
            : r
        )
      );
    } catch {
      // Handle auth error gracefully
    }
  };

  const handleRequestSubmit = async (data: any) => {
    const req = await resourceRequestService.create(data);
    setRequests((prev) => [req, ...prev]);
    analyticsService.track({ event_type: 'resource_request_submit', event_category: 'content' });
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600',
    under_review: 'bg-blue-100 text-blue-700',
    planned: 'bg-violet-100 text-violet-700',
    completed: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-600',
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-400/30 rounded-full text-violet-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Free Career Resources Hub
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight">
            Tools & Resources to<br className="hidden sm:block" />
            <span className="text-violet-400"> Accelerate Your Career</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Download free checklists, guides, templates, and playbooks curated by career experts.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-violet-400" />
              <span>{magnets.length} Free Resources</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              <span>Community Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <span>Updated Monthly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Success toast */}
      {captureSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in-up">
          ✅ Access granted! Check your email.
        </div>
      )}

      {/* Tab navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
          {[
            { key: 'magnets', label: 'Free Resources', icon: Download },
            { key: 'requests', label: 'Community Requests', icon: MessageSquare },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Free Resources Tab */}
        {activeTab === 'magnets' && (
          <>
            {loadingMagnets ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 h-72 animate-pulse" />
                ))}
              </div>
            ) : magnets.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Download className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p>No resources available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {magnets.map((item) => (
                  <LeadMagnetCard key={item.id} item={item} onDownload={handleDownload} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Community Requests Tab */}
        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 pb-16">
            {/* List */}
            <div className="space-y-3">
              {loadingRequests ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 h-24 animate-pulse" />
                ))
              ) : requests.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No requests yet. Be the first to submit!</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="bg-white rounded-xl border border-slate-100 p-4 flex gap-4 hover:border-violet-200 hover:shadow-sm transition-all">
                    <UpvoteButton
                      requestId={req.id}
                      count={req.upvote_count}
                      hasVoted={userUpvotes.includes(req.id)}
                      onVote={() => handleUpvote(req.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-800 text-sm">{req.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[req.status] ?? statusColor.pending}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{req.description}</p>
                      {req.category && (
                        <span className="mt-1.5 inline-block text-xs text-violet-600 font-medium">{req.category}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar form */}
            <aside>
              <RequestForm onSubmit={handleRequestSubmit} />
              <div className="mt-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
                <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  How it works
                </p>
                <ol className="text-xs text-slate-500 space-y-1.5 list-decimal list-inside">
                  <li>Submit your resource request</li>
                  <li>Community upvotes help prioritize</li>
                  <li>Our team reviews top requests monthly</li>
                  <li>Resources are created and made free for all</li>
                </ol>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Capture modal */}
      {captureTarget && (
        <CaptureModal
          item={captureTarget}
          onClose={() => setCaptureTarget(null)}
          onSuccess={handleCaptureSuccess}
        />
      )}
    </div>
  );
};

export default ResourcesHub;
