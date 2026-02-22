import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { ChatMessage, QuickAction } from '@/types/chatbot';
import { categories, findAnswer } from '@/data/kineticKidsKnowledge';

interface KineticChatBotProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const KineticChatBot: React.FC<KineticChatBotProps> = ({
  isOpen = false,
  onToggle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Привет! Я помощник клуба Kinetic Kids 🛹\n\nЯ знаю всё о наших занятиях, тренерах и ценах. О чём хотите узнать?',
      isUser: false,
      timestamp: new Date(),
      quickActions: [
        { text: '📝 Записаться', value: 'записаться', emoji: '📝' },
        { text: '🛹 Направления', value: 'направления', emoji: '🛹' },
        { text: '💰 Цены', value: 'цены', emoji: '💰' },
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const addBotMessage = (text: string, quickActions?: QuickAction[]) => {
    const botMessage: ChatMessage = {
      id: Date.now().toString() + '_bot',
      text,
      isUser: false,
      timestamp: new Date(),
      quickActions,
    };
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowCategories(false);
    setIsTyping(true);

    // Find and return answer after short delay
    setTimeout(() => {
      const result = findAnswer(text.trim());
      addBotMessage(result.answer, result.quickActions);
    }, 600);
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.value);
  };

  const handleCategoryClick = (categoryId: string) => {
    const catMessages: Record<string, string> = {
      general: 'расскажи о клубе',
      directions: 'направления',
      prices: 'цены',
      trainers: 'тренеры',
      safety: 'безопасность',
      contacts: 'как записаться',
    };
    handleSendMessage(catMessages[categoryId] || categoryId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 hover:shadow-orange-500/40"
        aria-label="Открыть чат"
      >
        <span className="text-2xl">🛹</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col" style={{ width: 360, maxHeight: '85vh' }}>
      <Card className="flex flex-col shadow-2xl border-0 overflow-hidden" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🛹
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-white">Kinetic Kids</CardTitle>
                <p className="text-xs text-white/80">Онлайн-помощник • Отвечаем быстро</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={() => setShowCategories(v => !v)}
                title="Категории"
              >
                <Icon name="LayoutGrid" size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={onToggle}
                title="Закрыть"
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Categories panel */}
        {showCategories && (
          <div className="bg-gray-50 border-b px-3 py-2 shrink-0">
            <p className="text-xs text-gray-500 mb-2 font-medium">Быстрые категории:</p>
            <div className="grid grid-cols-3 gap-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="text-center bg-white border border-gray-200 rounded-lg px-2 py-1.5 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <div className="text-lg">{cat.emoji}</div>
                  <div className="text-[10px] text-gray-600 leading-tight">{cat.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <CardContent
          className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50"
          style={{ minHeight: 0 }}
        >
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {/* Avatar for bot */}
                {!message.isUser && (
                  <div className="flex items-end gap-1.5">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-xs shrink-0">
                      🛹
                    </div>
                    <div className="bg-white text-gray-800 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm text-sm leading-relaxed">
                      {formatText(message.text)}
                    </div>
                  </div>
                )}

                {/* User message */}
                {message.isUser && (
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm text-sm leading-relaxed">
                    {message.text}
                  </div>
                )}

                {/* Timestamp */}
                <span className={`text-[10px] text-gray-400 ${message.isUser ? 'text-right' : 'text-left ml-8'}`}>
                  {formatTime(message.timestamp)}
                </span>

                {/* Quick actions */}
                {!message.isUser && message.quickActions && message.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-8 mt-1">
                    {message.quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickAction(action)}
                        className="text-xs bg-white border border-orange-200 text-orange-700 rounded-full px-2.5 py-1 hover:bg-orange-50 hover:border-orange-400 transition-colors shadow-sm"
                      >
                        {action.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-1.5">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-xs shrink-0">
                  🛹
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce inline-block"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="bg-white border-t px-3 py-2 shrink-0">
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите вопрос..."
              className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-orange-400 transition-colors bg-gray-50"
            />
            <Button
              size="icon"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shrink-0"
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
            >
              <Icon name="Send" size={15} className="text-white" />
            </Button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            📞 +7 920 416-36-06 · Пн–Вс 10:00–20:00
          </p>
        </div>
      </Card>
    </div>
  );
};

export default KineticChatBot;
