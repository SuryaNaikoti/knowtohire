import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { interviewService, applicationService, JobApplication, Interview, InterviewType } from '@/services';
import { Video, MapPin, Send, AlertCircle } from 'lucide-react';

export interface ScheduleInterviewModalProps {
  application: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (interview: Interview) => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('Technical Assessment & Deep Dive');
  const [interviewType, setInterviewType] = useState<InterviewType>('technical_deep_dive');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/kth-interview');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!application) return null;

  const candidateName =
    application.candidate?.full_name ||
    (application.candidate_snapshot as Record<string, string>)?.full_name ||
    'Candidate';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!date) {
      setErrorMessage('Please select an interview date.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMessage('Please specify both start and end times.');
      return;
    }

    const scheduledStart = new Date(`${date}T${startTime}:00`).toISOString();
    const scheduledEnd = new Date(`${date}T${endTime}:00`).toISOString();

    if (new Date(scheduledEnd) <= new Date(scheduledStart)) {
      setErrorMessage('Interview end time must be after start time.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const { data, error } = await interviewService.scheduleInterview({
      application_id: application.id,
      job_id: application.job_id,
      company_id: application.company_id,
      candidate_id: application.candidate_id,
      title: title.trim(),
      interview_type: interviewType,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      meeting_link: meetingLink.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (error) {
      setIsSubmitting(false);
      setErrorMessage(error.message);
    } else if (data) {
      // Automatically advance application stage to 'interview' if it's in early stages
      if (application.stage === 'new' || application.stage === 'screening' || application.stage === 'shortlisted') {
        await applicationService.updateApplicationStage(application.id, 'interview');
      }
      setIsSubmitting(false);
      onSuccess?.(data);
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Interview — ${candidateName}`}
      description={`Position: ${application.job?.title || 'Job Opening'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans">
        {errorMessage && (
          <Alert variant="error" title="Scheduling Error">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Input
            label="Interview Round Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Technical Deep Dive"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Interview Format"
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value as InterviewType)}
            options={[
              { value: 'technical_deep_dive', label: 'Technical Deep Dive' },
              { value: 'cultural_fit', label: 'Cultural & Behavioral Fit' },
              { value: 'executive_round', label: 'Executive Round' },
              { value: 'hr_screening', label: 'HR Screening' },
            ]}
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Input
            label="Video Conference Meeting Link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            leftIcon={<Video className="w-4 h-4" />}
          />
        </div>

        <div className="space-y-1.5">
          <Input
            label="Office / Physical Location (If Onsite)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. EcoTower Level 4, Bengaluru"
            leftIcon={<MapPin className="w-4 h-4" />}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-kth-slate-700">
            Internal Recruiter & Interviewer Notes <span className="text-kth-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key focus areas, coding questions, or topics for this round..."
            className="w-full rounded-xl border border-kth-slate-200 px-3.5 py-2 text-xs text-kth-slate-900 placeholder:text-kth-slate-400 focus:outline-none focus:ring-2 focus:ring-kth-primary-500/20 focus:border-kth-primary-600 transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-kth-slate-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            leftIcon={!isSubmitting ? <Send className="w-3.5 h-3.5" /> : undefined}
          >
            {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
