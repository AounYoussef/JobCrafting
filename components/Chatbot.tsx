import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatbotProps {
  onComplete: (targetJob: string) => void;
}

// Gemini-format history entry
interface GeminiHistoryEntry {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const Chatbot: React.FC<ChatbotProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetJobInput, setTargetJobInput] = useState('');
  const historyRef = useRef<GeminiHistoryEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // As per original behavior: kick off the conversation with an intro message.
    const initiateChat = async () => {
      setLoading(true);
      try {
        const initialUserMessage = "Hello! Please introduce yourself as my AI career advisor.";
        const text = await sendChatMessage(historyRef.current, initialUserMessage);

        // Record this exchange in history so future turns have context
        historyRef.current = [
          ...historyRef.current,
          { role: 'user', parts: [{ text: initialUserMessage }] },
          { role: 'model', parts: [{ text: text || '' }] },
        ];

        const modelMsg: ChatMessage = {
          id: 'init',
          role: 'model',
          text: text || "Hello! I'm your AI career advisor. I'm here to help you find your ideal path.",
          timestamp: Date.now()
        };
        setMessages([modelMsg]);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setMessages([{
          id: 'init-error',
          role: 'model',
          text: "I'm having trouble connecting right now. Please try sending a message.",
          timestamp: Date.now()
        }]);
      } finally {
        setLoading(false);
      }
    };

    initiateChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const text = await sendChatMessage(historyRef.current, userText);

      historyRef.current = [
        ...historyRef.current,
        { role: 'user', parts: [{ text: userText }] },
        { role: 'model', parts: [{ text: text || '' }] },
      ];

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text || "I'm having trouble thinking right now. Can we try that again?",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I encountered a connection error. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[650px] max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-brand-600 p-6 text-white flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold">Career Advisor AI</h2>
          <p className="text-brand-100 text-sm">Reshaping your future, one question at a time.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm md:text-base ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="mb-4 p-4 bg-brand-50 rounded-xl border border-brand-100">
          <label className="block text-sm font-semibold text-brand-900 mb-2">
            Target Job Recommendation
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. UX Designer, Data Analyst..."
              className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 px-3 py-2 border text-sm"
              value={targetJobInput}
              onChange={(e) => setTargetJobInput(e.target.value)}
            />
            <button
              onClick={() => onComplete(targetJobInput)}
              disabled={!targetJobInput.trim()}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-all shadow-md active:scale-95"
            >
              Confirm Role
            </button>
          </div>
          <p className="text-[10px] text-brand-600 mt-2 opacity-75 uppercase tracking-wider font-bold">Confirm a role to unlock your dashboard</p>
        </div>

        <div className="relative">
          <input
            type="text"
            className="w-full border-gray-200 rounded-full pl-6 pr-14 py-4 shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none border transition-all"
            placeholder="Talk to your advisor..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 bottom-2 bg-brand-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 transition-all shadow-md active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;