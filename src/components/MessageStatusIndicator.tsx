import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { Message } from '../types';
import { motion } from 'framer-motion';

type Props = {
  status: Message['status'];
  read_at: string | null;
};

export const MessageStatusIndicator = ({ status, read_at }: Props) => {
  const variants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 }
  };

  if (status === 'sent') {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.2 }}
      >
        <Check className="w-4 h-4 text-gray-400" />
      </motion.div>
    );
  }

  if (status === 'delivered') {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.2 }}
      >
        <CheckCheck className="w-4 h-4 text-gray-400" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      <CheckCheck className="w-4 h-4 text-indigo-500" />
      {read_at && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
        />
      )}
    </motion.div>
  );
}; 