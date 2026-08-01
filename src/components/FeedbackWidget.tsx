import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, Star } from 'lucide-react';
import { telemetryService } from '../lib/services/telemetryService';
import { useAuth } from '../context/AuthContext';

export const FeedbackWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'Report Bug' | 'Suggest Improvement' | 'General Feedback'>('Report Bug');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);

    try {
      telemetryService.submitFeedback({
        user_id: user?.id || 'guest_user',
        user_role: user?.user_metadata?.role || 'candidate',
        feedback_type: feedbackType,
        rating,
        feedback_text: text,
        page_url: window.location.pathname,
        browser_info: navigator.userAgent,
      });

      setSubmitted(true);
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => { setIsOpen(true); setSubmitted(false); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-xl flex items-center gap-2 transition-all group scale-100 hover:scale-105 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out text-sm font-semibold whitespace-nowrap">
            Beta Feedback
          </span>
        </button>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl w-84 shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              In-App Beta Feedback
            </span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
              <p className="text-sm font-bold text-slate-800">Thank you!</p>
              <p className="text-xs text-slate-400 px-4">Your feedback has been logged to telemetry for Week 2 Beta review.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">Feedback Type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 font-medium"
                >
                  <option value="Report Bug">Report Bug</option>
                  <option value="Suggest Improvement">Suggest Improvement</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">Rate Experience (1-5)</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 cursor-pointer hover:scale-110 transition"
                    >
                      <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">Details</label>
                <textarea
                  placeholder="Describe bug or UX friction..."
                  value={text}
                  required
                  rows={3}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs resize-none focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 min-h-[38px]"
              >
                {sending ? 'Logging...' : (
                  <>
                    Submit Feedback
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
