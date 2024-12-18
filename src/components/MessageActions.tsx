import React from 'react';
import { Edit2, Trash2, Reply, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageActionsProps {
  onReply: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  onCopy: () => void;
  canEdit?: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  onReply,
  onEdit,
  onDelete,
  onCopy,
  canEdit = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-1 min-w-[120px] z-50"
    >
      <button
        onClick={onReply}
        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
      >
        <Reply className="w-4 h-4" />
        Reply
      </button>
      
      {canEdit && (
        <button
          onClick={onEdit}
          className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      )}
      
      <button
        onClick={onCopy}
        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Copy
      </button>
      
      <button
        onClick={onDelete}
        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </motion.div>
  );
};
