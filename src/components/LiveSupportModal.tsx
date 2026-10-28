import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Headphones, 
  Bot, 
  User, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ThumbsUp,
  RefreshCw
} from 'lucide-react';
import { AppSettings } from '../types';
import { getT } from '../utils/translations';
import { playAlertChime } from '../utils/storage';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface LiveSupportModalProps {
  settings: AppSettings;
  onClose: () => void;
}

export const LiveSupportModal: React.FC<LiveSupportModalProps> = ({
  settings,
  onClose,
}) => {
  const t = getT(settings.language);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: `مرحباً بك يا ${settings.accountManagerName.split('(')[0].trim()}! 👋\nأنا مساعدك الذكي ومسؤول الدعم الفني المباشر 24/7 في أكاونت برو.\nيمكنك سؤالي عن أي ميزة في المنصة، أو استشارتي في مفاوضات تجديد العقود، وكيفية التعامل مع العملاء. كيف أساعدك اليوم؟`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    'كيف أصدر بيانات العملاء إلى إكسل بصيغة صحيحة؟',
    'عميل يطلب خفض سعر التجديد بنسبة 30%، كيف أتفاوض معه؟',
    'ما هي أفضل طريقة للتعامل مع عميل يهدد بفسخ العقد؟',
    'كيف أخصص مراحل دورة العميل لتناسب شركتي؟',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ sender: m.sender, text: m.text })),
          userRole: 'Account Manager',
        }),
      });
      const data = await res.json();
      const botMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'bot',
        text: data.reply || 'تم استلام رسالتك، وسأكون سعيداً بمساعدتك في أي استفسار آخر.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
      if (settings.soundEnabled) playAlertChime('click');
    } catch (e) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          sender: 'bot',
          text: 'شكراً لتواصلك! أنا معك دائماً. يمكنك أيضاً تصفح قسم الإعدادات لتخصيص خيارات المنصة أو تنزيل نسخة احتياطية.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl h-[650px] max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 eye-care:border-[#e0d6c5] flex items-center justify-between bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white eye-care:text-[#2c2720]">
                  الدعم الفني المباشر ومساعد الحسابات
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  متاح 24/7
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>دعم تقني واستشارات إدارة الحسابات الفورية</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/30 eye-care:bg-[#efe8dc]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 eye-care:border-[#e0d6c5] rounded-tl-xs shadow-xs'
                }`}
              >
                {m.text}
                <div
                  className={`mt-1.5 text-[10px] ${
                    m.sender === 'user' ? 'text-blue-200 text-left' : 'text-slate-400 text-right'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>المساعد يكتب رداً مفيداً...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Pills */}
        <div className="p-2.5 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {promptSuggestions.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill)}
              disabled={loading}
              className="text-[11px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 eye-care:border-[#e0d6c5] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 transition-colors"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 eye-care:bg-[#f6f2e9] border-t border-slate-100 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب استفسارك التقني أو مشكلتك مع العميل هنا..."
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 eye-care:bg-[#efe8dc] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
