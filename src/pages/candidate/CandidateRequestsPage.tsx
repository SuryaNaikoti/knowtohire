import React, { useState, useEffect } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { requestService, ContentRequest, RequestStatus } from '@/services/requestService';
import { HelpCircle, Plus, AlertCircle, Download, Loader2 } from 'lucide-react';

export const CandidateRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Environmental & ESG');
  const [type, setType] = useState('guide');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    const res = await requestService.getMyRequests();
    if (res.data) {
      setRequests(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setSubmitError('Please provide both a title and description for your request.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const res = await requestService.createRequest({
      title: title.trim(),
      description: description.trim(),
      category,
      type,
    });

    setIsSubmitting(false);

    if (res.error) {
      setSubmitError(res.error.message);
    } else {
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchRequests();
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="amber">Submitted</Badge>;
      case 'under_review':
        return <Badge variant="cyan">Under Review</Badge>;
      case 'completed':
        return <Badge variant="emerald">Completed</Badge>;
      case 'rejected':
        return <Badge variant="rose">Declined</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <CandidateShell title="On-Demand Content Requests" currentPath="/candidate/requests">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-kth-slate-900">Custom Research & Study Material Requests</h2>
            <p className="text-xs text-kth-slate-500">
              Request specialized ESG templates, EIA case studies, or regulatory guides created by our domain specialists.
            </p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            New Content Request
          </Button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500">Loading your content requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center bg-white border-kth-slate-200">
            <HelpCircle className="w-12 h-12 text-kth-slate-300 mx-auto mb-3" />
            <h3 className="font-display font-bold text-base text-kth-slate-900 mb-1">No Active Content Requests</h3>
            <p className="text-xs text-kth-slate-500 max-w-sm mx-auto mb-6">
              Need a specific regulatory handbook, legal clause template, or state environmental compliance checklist? Submit an on-demand request.
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Create Your First Request
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} className="p-6 transition-all hover:border-kth-slate-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(req.status)}
                      <Badge variant="indigo">{req.category}</Badge>
                      {req.type && <Badge variant="slate">{req.type}</Badge>}
                    </div>

                    <h3 className="font-display text-base font-bold text-kth-slate-900">{req.title}</h3>
                    <p className="text-xs text-kth-slate-700 leading-relaxed">{req.description}</p>

                    <div className="flex items-center gap-4 text-[11px] text-kth-slate-400 font-mono">
                      <span>Submitted: {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {req.admin_notes && (
                        <span className="text-kth-primary-700 font-sans font-medium bg-kth-primary-50 px-2 py-0.5 rounded border border-kth-primary-200">
                          Editor Note: {req.admin_notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {req.status === 'completed' && req.completed_resource_id && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Download className="w-4 h-4" />}
                      onClick={() => (window.location.href = `/knowledge/${req.completed_resource_id}`)}
                    >
                      Access Deliverable
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Submit Request Dialog */}
        <Dialog
          isOpen={isModalOpen}
          onClose={() => !isSubmitting && setIsModalOpen(false)}
          title="Submit On-Demand Content Request"
          description="Specify your research, handbook, or template requirements for our domain editorial team."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <Input
              label="Request Title"
              placeholder="e.g. CPCB Consent to Establish (CTE) Step-by-Step Guide for Chemical Units"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Domain Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Environmental & ESG', label: 'Environmental & ESG' },
                  { value: 'Sustainability & Climate', label: 'Sustainability & Climate' },
                  { value: 'Patent & IPR Law', label: 'Patent & IPR Law' },
                  { value: 'Clean Energy & Decarbonization', label: 'Clean Energy & Decarbonization' },
                  { value: 'Career & Resume Guide', label: 'Career & Resume Guide' },
                ]}
              />

              <Select
                label="Deliverable Format Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'guide', label: 'Compliance & Research Guide' },
                  { value: 'template', label: 'Document & Contract Template' },
                  { value: 'other', label: 'Other Regulatory Resource' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
                Detailed Scope & Objectives
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the specific regulations, industrial standards, target state, or document requirements..."
                className="w-full rounded-xl border border-kth-slate-200 p-3 text-xs text-kth-slate-900 bg-white placeholder:text-kth-slate-400 outline-none focus:ring-2 focus:ring-kth-primary-500/20 focus:border-kth-primary-600 transition-colors resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-kth-slate-100">
              <Button type="button" variant="secondary" size="sm" disabled={isSubmitting} onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Submit Request
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </CandidateShell>
  );
};
