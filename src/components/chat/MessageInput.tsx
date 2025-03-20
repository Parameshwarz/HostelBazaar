import React, { useRef, useEffect } from 'react';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: (e: React.FormEvent) => Promise<void>;
  sendingMessage: boolean;
  replyingTo: any;
  setReplyingTo: (message: any) => void;
}

const MIN_MESSAGE_LENGTH = 1;
const MAX_MESSAGE_LENGTH = 1000;

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  sendMessage,
  sendingMessage,
  replyingTo,
  setReplyingTo
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [newMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim().length >= MIN_MESSAGE_LENGTH) {
        sendMessage(e);
      }
    }
  };

  return (
    <form onSubmit={sendMessage} className="flex items-end gap-2 p-2 border-t">
      {replyingTo && (
        <div className="absolute bottom-full left-0 right-0 bg-gray-100 p-2 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Replying to: {replyingTo.content}
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        value={newMessage}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length <= MAX_MESSAGE_LENGTH) {
            setNewMessage(value);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="w-full px-3 py-2 max-h-[150px] rounded-md bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        disabled={sendingMessage}
        rows={1}
      />
      
      <button
        type="submit"
        disabled={!newMessage.trim() || sendingMessage || newMessage.length < MIN_MESSAGE_LENGTH}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sendingMessage ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          'Send'
        )}
      </button>
    </form>
  );
};

export default MessageInput; 