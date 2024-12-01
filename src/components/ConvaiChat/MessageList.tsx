import React from 'react';
import { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  userText: string;
  npcText: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function MessageList({ messages, userText, npcText, messagesEndRef }: MessageListProps) {
  return (
    <div className="h-96 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-xl px-4 py-2 ${
              message.sender === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300'
            }`}
          >
            {message.text}
          </div>
        </div>
      ))}
      {(userText || npcText) && (
        <div className="text-sm text-gray-400 italic">
          {userText && <div>You: {userText}</div>}
          {npcText && <div>Assistant: {npcText}</div>}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}