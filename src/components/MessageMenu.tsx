import React, { useState } from 'react';
import { MessageReactions } from './MessageReactions';
import { Reply, Copy, Edit2, Trash2, Smile, MoreHorizontal } from 'lucide-react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal
} from '@floating-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOwn: boolean;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy: () => void;
  onReact: (emoji: string) => void;
}

export const MessageMenu: React.FC<Props> = ({
  isOwn,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  onReact
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: isOwn ? 'left-start' : 'right-start',
    middleware: [
      offset({ mainAxis: 4, crossAxis: 0 }),
      flip(),
      shift()
    ],
    whileElementsMounted: autoUpdate
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss
  ]);

  return (
    <>
      <motion.button
        ref={refs.setReference}
        {...getReferenceProps()}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <FloatingPortal>
            <motion.div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl shadow-lg py-1.5 min-w-[180px] z-[9999] border border-gray-200/50 backdrop-blur-sm"
            >
              <motion.button
                whileHover={{ backgroundColor: '#F3F4F6' }}
                onClick={() => setShowReactions(true)}
                className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2.5 font-medium"
              >
                <Smile className="w-4 h-4 text-gray-500" />
                Add Reaction
              </motion.button>

              <motion.button
                whileHover={{ backgroundColor: '#F3F4F6' }}
                onClick={() => {
                  onReply();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2.5 font-medium"
              >
                <Reply className="w-4 h-4 text-gray-500" />
                Reply
              </motion.button>

              <motion.button
                whileHover={{ backgroundColor: '#F3F4F6' }}
                onClick={() => {
                  onCopy();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2.5 font-medium"
              >
                <Copy className="w-4 h-4 text-gray-500" />
                Copy
              </motion.button>

              {isOwn && onEdit && (
                <motion.button
                  whileHover={{ backgroundColor: '#F3F4F6' }}
                  onClick={() => {
                    onEdit();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2.5 font-medium"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                  Edit
                </motion.button>
              )}

              {isOwn && onDelete && (
                <>
                  <div className="h-px bg-gray-100 my-1 mx-3" />
                  <motion.button
                    whileHover={{ backgroundColor: '#FEE2E2' }}
                    onClick={() => {
                      onDelete();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors flex items-center gap-2.5 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </>
              )}
            </motion.div>
          </FloatingPortal>
        )}
      </AnimatePresence>

      <MessageReactions
        isOpen={showReactions}
        onClose={() => {
          setShowReactions(false);
          setIsOpen(false);
        }}
        onReact={(emoji) => {
          onReact(emoji);
          setShowReactions(false);
          setIsOpen(false);
        }}
      />
    </>
  );
}; 