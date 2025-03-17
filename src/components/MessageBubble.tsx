import React from 'react';
import { motion } from 'framer-motion';
import { MessageMenu } from './MessageMenu';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { Message, MessageStatus, MessageReaction, ReactionGroup } from '../types';
import { toast } from 'react-hot-toast';

interface Props {
  message: Message;
  isOwn: boolean;
  onReply: (messageId: string) => void;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onRetry?: (messageId: string) => void;
  onScrollToMessage?: (messageId: string) => void;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export const MessageBubble: React.FC<Props> = ({
  message,
  isOwn,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onRetry,
  onScrollToMessage,
  showAvatar = true,
  showTimestamp = true,
}) => {
  const formatMessageTimestamp = (date: string) => {
    try {
      const messageDate = new Date(date);
      if (isToday(messageDate)) {
        return format(messageDate, 'HH:mm');
      } else if (isYesterday(messageDate)) {
        return 'Yesterday ' + format(messageDate, 'HH:mm');
      } else if (messageDate.getFullYear() === new Date().getFullYear()) {
        return format(messageDate, 'MMM d, HH:mm');
      } else {
        return format(messageDate, 'MMM d, yyyy HH:mm');
      }
    } catch (error) {
      console.error('Error formatting message timestamp:', error);
      return 'Invalid date';
    }
  };

  const reactionGroups = React.useMemo(() => {
    try {
      return message.reactions.reduce((acc: Record<string, ReactionGroup>, reaction: MessageReaction) => {
        if (!reaction) return acc;
        const username = reaction.user?.username || reaction.username;
        acc[reaction.emoji] = {
          count: (acc[reaction.emoji]?.count || 0) + 1,
          users: [...(acc[reaction.emoji]?.users || []), username]
        };
        return acc;
      }, {} as Record<string, ReactionGroup>);
    } catch (error) {
      console.error('Error processing message reactions:', error);
      return {};
    }
  }, [message.reactions]);

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'seen':
        return <CheckCheck className="w-3.5 h-3.5 text-indigo-500" aria-label="Message seen" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-gray-400" aria-label="Message delivered" />;
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-gray-400" aria-label="Message sent" />;
      default:
        return null;
    }
  };

  const handleEdit = () => {
    try {
      const newContent = prompt('Edit message:', message.content);
      if (newContent && newContent !== message.content) {
        onEdit(message.id, newContent.trim());
      }
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleReply = () => {
    try {
      onReply(message.id);
    } catch (error) {
      console.error('Error replying to message:', error);
      toast.error('Failed to reply to message');
    }
  };

  const handleDelete = () => {
    try {
      if (window.confirm('Are you sure you want to delete this message?')) {
        onDelete(message.id);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
      role="listitem"
      aria-label={`Message from ${message.sender.username}`}
      data-testid="message-bubble"
    >
      {showAvatar && message.sender && (
        <div className="flex-shrink-0 pt-1">
          {message.sender.avatar_url ? (
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={message.sender.avatar_url}
              alt={`${message.sender.username}'s avatar`}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 hover:border-indigo-300 transition-colors shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.png';
              }}
            />
          ) : (
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white border-2 border-transparent shadow-sm
                ${isOwn ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}
              aria-label={`${message.sender.username}'s initial`}
            >
              {message.sender.username[0].toUpperCase()}
            </motion.div>
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs font-medium text-gray-500 mb-1 ml-1">
            {message.sender.username}
          </span>
        )}

        {message.reply_to && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => onScrollToMessage?.(message.reply_to!.id)}
            className={`mb-1 px-3 py-1.5 text-xs rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors ${
              isOwn ? 'mr-1' : 'ml-1'
            } max-w-full border border-gray-100 shadow-sm`}
            aria-label={`Reply to ${message.reply_to.sender.username}'s message`}
          >
            <span className="text-gray-500 font-medium">
              Replying to {message.reply_to.sender.username}
            </span>
            <div className="text-gray-700 truncate max-w-[200px] mt-0.5">
              {message.reply_to.content}
            </div>
          </motion.button>
        )}

        <div className={`relative group flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`px-4 py-2.5 rounded-2xl break-words shadow-md hover:shadow-lg transition-shadow ${
              isOwn
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                : 'bg-white text-gray-900 border border-gray-100'
            }`}
            role="article"
          >
            {message.content}
          </motion.div>

          <div className={`absolute ${isOwn ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
            <MessageMenu
              isOwn={isOwn}
              onReply={handleReply}
              onEdit={isOwn ? handleEdit : undefined}
              onDelete={isOwn ? handleDelete : undefined}
              onCopy={() => navigator.clipboard.writeText(message.content)}
              onReact={(emoji) => onReact(message.id, emoji)}
            />
          </div>
        </div>

        {Object.entries(reactionGroups).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactionGroups).map(([emoji, group]) => {
              const typedGroup = group as ReactionGroup;
              return (
                <motion.div
                  key={emoji}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-white border shadow-sm
                    ${typedGroup.users.includes(message.sender.username)
                      ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100'
                      : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors`}
                  title={`Reactions from: ${typedGroup.users.join(', ')}`}
                  role="button"
                  aria-label={`${typedGroup.count} ${emoji} reactions`}
                >
                  <span className="mr-1">{emoji}</span>
                  <span className="text-gray-600 font-medium">{typedGroup.count}</span>
                </motion.div>
              );
            })}
          </div>
        )}

        {showTimestamp && (
          <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}>
            <span className="font-medium">{formatMessageTimestamp(message.created_at)}</span>
            {isOwn && (
              <div className="flex items-center">
                {message.status === 'error' ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => onRetry?.(message.id)}
                    className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                    aria-label="Message failed to send. Click to retry"
                  >
                    <span className="text-xs font-medium">Error</span>
                    <span className="text-xs">·</span>
                    <span className="text-xs underline">Retry</span>
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-0.5" aria-label={`Message status: ${message.status}`}>
                    {getStatusIcon(message.status)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};