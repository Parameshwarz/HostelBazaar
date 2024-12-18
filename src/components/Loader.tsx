import { Loader2 } from 'lucide-react';

type Props = {
  className?: string;
};

export default function Loader({ className }: Props) {
  return <Loader2 className={`animate-spin ${className || ''}`} />;
} 