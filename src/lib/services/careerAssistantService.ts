import { supabase } from '../supabase';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  content: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export const careerAssistantService = {
  async getConversations(): Promise<ChatConversation[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data, error } = await supabase
      .from('ai_chat_conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ChatConversation[];
  },

  async startConversation(title = 'Career Discussion'): Promise<ChatConversation> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('ai_chat_conversations')
      .insert({ user_id: userData.user.id, title })
      .select()
      .single();

    if (error) throw error;
    return data as ChatConversation;
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ChatMessage[];
  },

  async sendMessage(conversationId: string, content: string): Promise<ChatMessage[]> {
    // Save user message
    const { data: userMsg, error: userErr } = await supabase
      .from('ai_chat_messages')
      .insert({ conversation_id: conversationId, sender: 'user', content })
      .select()
      .single();

    if (userErr) throw userErr;

    // Simulate AI Advisor chatbot response (high-fidelity career agent)
    let aiResponse = 'Fascinating question. In terms of current 2026 SaaS benchmarks, developing expertise in TypeScript, PostgreSQL indexes, and modular bundle optimization is highly valuable. Let me know if you would like me to compile a personalized training roadmap!';
    if (content.toLowerCase().includes('salary') || content.toLowerCase().includes('money')) {
      aiResponse = 'For Frontend Engineers in mid-level roles, we see local base ranges of $110,000 - $140,000. Leveraging senior credentials in cloud server configuration or full-stack databases can lift offers up to $165,000.';
    }

    const { data: aiMsg, error: aiErr } = await supabase
      .from('ai_chat_messages')
      .insert({ conversation_id: conversationId, sender: 'ai', content: aiResponse })
      .select()
      .single();

    if (aiErr) throw aiErr;

    return [userMsg, aiMsg] as ChatMessage[];
  }
};
