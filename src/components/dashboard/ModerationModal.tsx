import React, { useState, useEffect } from 'react';
import { jobsService } from '../../lib/services/jobsService';
import type { Job } from '../../lib/services/jobsService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { ShieldCheck, ShieldAlert, Star } from 'lucide-react';

interface ModerationModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onModerationSuccess: () => void;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({
  job,
  isOpen,
  onClose,
  onModerationSuccess,
}) => {
  const [notes, setNotes] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredUntil, setFeaturedUntil] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setNotes(job.moderator_notes || '');
      setIsFeatured(job.is_featured);
      setFeaturedUntil(job.featured_until ? job.featured_until.split('T')[0] : '');
    } else {
      setNotes('');
      setIsFeatured(false);
      setFeaturedUntil('');
    }
    setError('');
  }, [job, isOpen]);

  const handleModeration = async (status: 'approved' | 'rejected') => {
    if (!job) return;
    if (status === 'rejected' && !notes.trim()) {
      setError('Please provide moderator notes explaining the rejection reason.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Save Moderation Status
      await jobsService.moderateJob(job.id, status, notes);

      // 2. Save Featured Config
      if (status === 'approved') {
        const untilIso = isFeatured && featuredUntil ? new Date(featuredUntil).toISOString() : undefined;
        await jobsService.toggleFeatureJob(job.id, isFeatured, untilIso);
      }

      onModerationSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('An error occurred during job moderation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Vacancy Posting"
    >
      {job && (
        <div className="space-y-5 animate-fade-in-up">
          {error && <Alert type="error" className="text-xs" title="Moderation Failure">{error}</Alert>}

          {/* Job Overview Summary */}
          <div className="bg-gray-55/70 p-4 rounded-xl border border-gray-200 border-solid space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">{job.career_domain} Domain</span>
              <span className="text-[10px] bg-gray-100 text-gray-800 font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">{job.employment_type}</span>
            </div>
            <h4 className="font-heading font-black text-gray-900 text-base leading-tight">
              {job.title}
            </h4>
            <p className="text-xs font-semibold text-gray-500">
              Posted by {job.company_name} (City: {job.city}, Country: {job.country})
            </p>
          </div>

          {/* Featured Configuration */}
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 border-solid space-y-3">
            <label className="flex items-center space-x-2 text-xs font-bold text-gray-900 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Feature this posting (pins to top of candidate board)</span>
            </label>
            
            {isFeatured && (
              <Input
                label="Featured Until Date"
                type="date"
                required
                value={featuredUntil}
                onChange={(e) => setFeaturedUntil(e.target.value)}
                className="bg-white text-xs py-1.5"
              />
            )}
          </div>

          {/* Feedback note area */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-gray-700 tracking-wide">
              Moderator Audit Notes / Feedback
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-900 bg-white placeholder-gray-400 border-solid min-h-[90px] outline-none"
              placeholder="Provide context for approval or reasons for rejecting this listing..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t border-gray-150 border-solid pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} size="sm" className="bg-white text-xs font-bold">
              Cancel
            </Button>
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={() => handleModeration('rejected')}
                disabled={loading}
                variant="outline"
                size="sm"
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 text-xs font-bold"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Reject Job
              </Button>
              <Button
                type="button"
                onClick={() => handleModeration('approved')}
                isLoading={loading}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Approve Posting
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
