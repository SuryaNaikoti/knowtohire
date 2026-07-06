import React, { useState, useEffect, useRef } from 'react';
import { careerAssistantService } from '../../../lib/services/careerAssistantService';
import type { ChatConversation, ChatMessage } from '../../../lib/services/careerAssistantService';
import { Send, Sparkles, MessageSquare, Compass, Plus } from 'lucide-react';

export const CareerAssistant: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  const handleSelectConversation = async (conv: ChatConversation) => {
    setActiveConv(conv);
    try {
      const list = await careerAssistantService.getMessages(conv.id);
      setMessages(list);
      setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await careerAssistantService.getConversations();
      setConversations(data);
      if (data.length > 0) {
        handleSelectConversation(data[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleStartNew = async () => {
    try {
      const conv = await careerAssistantService.startConversation(`Chat ${conversations.length + 1}`);
      setConversations((prev) => [conv, ...prev]);
      setActiveConv(conv);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || sending) return;
    const text = inputText;
    setInputText('');
    setSending(true);

    // Optimistic user insert
    const tempUserMsg: ChatMessage = {
      id: Math.random().toString(),
      conversation_id: activeConv.id,
      sender: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const added = await careerAssistantService.sendMessage(activeConv.id, text);
      // Replace last user message with db message + add ai message
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), ...added]);
      setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            AI Career Assistant
          </h1>
          <p className="text-sm text-slate-500 mt-1">Converse with your senior advisor agent on roadmaps, salaries, and technical interviews.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* History Sidebar */}
          <div className="md:col-span-1 bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
            <button
              onClick={handleStartNew}
              className="w-full py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Conversation
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">Conversations</span>
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectConversation(c)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    activeConv?.id === c.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Pane */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-100 flex flex-col h-[550px] overflow-hidden shadow-sm">
            {/* Thread Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mr-2" />
                  Syncing discussion history...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-6">
                  <Compass className="w-10 h-10 text-slate-200 mb-3 animate-spin" style={{ animationDuration: '6s' }} />
                  <p className="font-semibold text-slate-600 mb-1">Ask anything</p>
                  <p className="text-xs max-w-xs leading-relaxed">Inquire about career paths, typical senior engineer salaries, or resume matching keywords.</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 max-w-[80%] ${
                      m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                      m.sender === 'user' ? 'bg-slate-700' : 'bg-emerald-600'
                    }`}>
                      {m.sender === 'user' ? 'U' : 'AI'}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-slate-800 text-white rounded-tr-none font-medium'
                        : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none font-medium'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={msgEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-50 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={activeConv ? "Discuss salary ranges, roadmaps, optimization tips..." : "Select or create conversation..."}
                disabled={!activeConv || sending}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 focus:border-emerald-400 outline-none rounded-xl text-sm transition-colors"
              />
              <button
                type="submit"
                disabled={!activeConv || !inputText.trim() || sending}
                className="px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerAssistant;
