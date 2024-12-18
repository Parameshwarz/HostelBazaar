export const lightTheme = {
  colors: {
    primary: '#3B82F6',
    primaryGradient: 'linear-gradient(145deg, #3B82F6, #60A5FA)',
    secondary: '#F3F4F6',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      inverse: '#FFFFFF',
    },
    background: {
      main: '#FFFFFF',
      secondary: '#F9FAFB',
      hover: '#F3F4F6',
    },
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  animations: {
    messageIn: `
      @keyframes messageIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    typing: `
      @keyframes typingDots {
        0%, 20% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
        80%, 100% { transform: translateY(0); }
      }
    `,
    fadeIn: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
  },
};

export const darkTheme = {
  colors: {
    primary: '#60A5FA',
    primaryGradient: 'linear-gradient(145deg, #60A5FA, #3B82F6)',
    secondary: '#374151',
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      inverse: '#1F2937',
    },
    background: {
      main: '#1F2937',
      secondary: '#111827',
      hover: '#374151',
    },
    border: '#374151',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  },
  animations: lightTheme.animations,
};
