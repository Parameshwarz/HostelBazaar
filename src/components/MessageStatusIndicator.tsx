import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { MessageStatus } from '../types';

type Props = {
  status: MessageStatus;
  read_at: string | null;
};

export const MessageStatusIndicator = ({ status, read_at }: Props) => {
  if (status === 'sent') {
    return <Check className="w-4 h-4 text-gray-400" />;
  }
  if (status === 'delivered') {
    return <CheckCheck className="w-4 h-4 text-gray-400" />;
  }
  return <CheckCheck className="w-4 h-4 text-blue-500" />;
}; 