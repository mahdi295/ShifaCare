import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Stethoscope, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';

const STORAGE_KEY = 'shifacare_chat_history';

const WELCOME = {
  role: 'assistant',
  content:
    "Hi! I'm the ShifaCare Assistant. Ask me about booking, payments, or describe your symptoms and I'll point you to the right department and doctor.\n\nNote: I don't give diagnoses — for that, please book a real doctor.",
};

function loadSavedMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch { /* ignore corrupt storage, fall back to welcome */ }
  return [WELCOME];
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadSavedMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Persist conversation so it survives a page reload — and so "delete"
  // actually clears something real, not just in-memory state.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* storage full or unavailable — non-critical, ignore */ }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chatbot/message', {
        message: text,
        // Only send role+content, capped, so we don't leak unrelated state
        history: nextMessages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Sorry, something went wrong. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Start a fresh conversation — keeps the welcome message, drops everything else.
  const startNewChat = () => {
    setMessages([WELCOME]);
  };

  // Fully delete the conversation, including from storage.
  const deleteChat = () => {
    if (messages.length <= 1) return; // nothing to delete besides the welcome message
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    setMessages([WELCOME]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat assistant"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3 flex items-center gap-2">
            <Stethoscope size={20} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">ShifaCare Assistant</p>
              <p className="text-[11px] text-white/80 leading-tight">Not a substitute for a real doctor</p>
            </div>
            <button
              onClick={startNewChat}
              title="Start a new chat"
              aria-label="Start a new chat"
              className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors shrink-0"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={deleteChat}
              title="Delete this conversation"
              aria-label="Delete this conversation"
              className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-background">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2 text-sm text-muted">
                  <Loader2 size={14} className="animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Quick action */}
          <div className="px-3 pt-2 pb-1 bg-background">
            <Link
              to="/doctors"
              className="text-xs text-primary font-medium hover:underline"
              onClick={() => setOpen(false)}
            >
              Or browse all doctors directly →
            </Link>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptom or ask a question…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-24"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-dark transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
