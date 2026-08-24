import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { requestService, ContentRequest, RequestStatus } from '@/services/requestService';
import { Loader2, Edit3 } from 'lucide-react';

export const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<ContentRequest | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit modal state
  const [status, setStatus] = useState<RequestStatus>('under_review');
  const [adminNotes, setAdminNotes] = useState('');
  const [resourceId, setResourceId] = useState('');

  const fetchRequests = async () => {
    setIsLoading(true);
    const res = await requestService.getAllRequests();
    if (res.data) {
      setRequests(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenEdit = (req: ContentRequest) => {
    setSelectedReq(req);
    setStatus(req.status);
    setAdminNotes(req.admin_notes || '');
    setResourceId(req.completed_resource_id || '');
    setIsEditModalOpen(true);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    setIsUpdating(true);

    await requestService.updateRequestStatus(
      selectedReq.id,
      status,
      adminNotes.trim() || undefined,
      resourceId.trim() || undefined
    );

    setIsUpdating(false);
    setIsEditModalOpen(false);
    fetchRequests();
  };

  return (
    <AdminShell title="On-Demand Content Requests Queue" currentPath="/admin/requests">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div>
            <h2 className="font-display text-base font-bold text-kth-slate-900">User Content & Research Submissions</h2>
            <p className="text-xs text-kth-slate-500">Review custom content requests, track status, add editorial guidance, and link deliverables.</p>
          </div>
          <span className="text-xs font-mono text-kth-slate-500 font-bold">{requests.length} Requests</span>
        </div>

        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Loading requests queue...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">No on-demand content requests in the queue.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Title & Scope</th>
                    <th className="p-4">Type & Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-kth-slate-50/60 transition-colors">
                      <td className="p-4 max-w-sm">
                        <div className="font-bold text-kth-slate-900">{req.title}</div>
                        <div className="text-kth-slate-500 text-[11px] line-clamp-1">{req.description}</div>
                        {req.additional_requirements && (
                          <div className="text-[10px] text-kth-slate-400 mt-0.5 italic">
                            Req: {req.additional_requirements}
                          </div>
                        )}
                        {req.admin_notes && (
                          <div className="text-[10px] text-kth-primary-700 mt-1 font-medium bg-kth-primary-50 px-2 py-0.5 rounded border border-kth-primary-200 inline-block">
                            Note: {req.admin_notes}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="indigo">{req.type || 'Study Material'}</Badge>
                          <span className="text-[11px] text-kth-slate-500">{req.category}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            req.status === 'completed'
                              ? 'emerald'
                              : req.status === 'under_review'
                              ? 'cyan'
                              : req.status === 'rejected'
                              ? 'rose'
                              : 'amber'
                          }
                          className="capitalize font-mono"
                        >
                          {req.status === 'completed' ? 'Fulfilled' : req.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4 text-kth-slate-500 font-mono text-[11px]">
                        {new Date(req.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="secondary" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(req)}>
                          Review & Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Update Modal */}
        <Dialog
          isOpen={isEditModalOpen}
          onClose={() => !isUpdating && setIsEditModalOpen(false)}
          title="Review & Update Content Request"
          description={selectedReq?.title || ''}
          maxWidth="md"
        >
          <form onSubmit={handleSaveUpdate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RequestStatus)}
                className="w-full rounded-xl border border-kth-slate-200 p-2.5 text-xs text-kth-slate-900 bg-white"
              >
                <option value="pending">Pending Review</option>
                <option value="under_review">Under Active Review</option>
                <option value="completed">Completed & Published</option>
                <option value="rejected">Declined</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">Editorial / Review Notes</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Feedback visible to the requesting user..."
                className="w-full rounded-xl border border-kth-slate-200 p-2.5 text-xs text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20"
              />
            </div>

            <Input
              label="Completed Resource ID (Optional)"
              placeholder="UUID of published resource if completed"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-kth-slate-100">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                Save Request Status
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AdminShell>
  );
};
