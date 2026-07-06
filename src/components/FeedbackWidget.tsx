import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const FeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);

    try {
      // Save feedback report to database audit_logs or analytics
      await supabase.from('audit_logs').insert({
        action: 'submit_beta_feedback',
        target_table: 'audit_logs',
        metadata: {
          feedback: text,
          user_email: email || 'anonymous',
          timestamp: new Date().toISOString()
        }
      });
      setSubmitted(true);
      setText('');
      setEmail('');
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
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-xl flex items-center gap-2 transition-all group scale-100 hover:scale-105"
        >
          <MessageSquare className="w-5 h-5 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out text-sm font-semibold whitespace-nowrap">
            Feedback
          </span>
        </button>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl w-80 shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Beta Feedback
            </span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
              <p className="text-sm font-bold text-slate-800">Thank you!</p>
              <p className="text-xs text-slate-400 px-4">Your report has been captured for review by our launch team.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Your email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-100 rounded-xl text-xs focus:border-emerald-400 outline-none"
              />
              <textarea
                placeholder="What can we improve? Report bugs or recommend modifications..."
                value={text}
                required
                rows={4}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 border border-slate-100 rounded-xl text-xs resize-none focus:border-emerald-400 outline-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {sending ? 'Submitting...' : (
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
