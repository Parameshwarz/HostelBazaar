import React from 'react';

type Props = {
  user: {
    username: string;
    avatar_url?: string;
  };
  size?: "sm" | "md" | "lg";
};

export const Avatar = ({ user, size = "md" }: Props) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl"
  };

  return (
    <div className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center bg-gray-200 overflow-hidden`}>
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
      ) : (
        <span className="font-medium text-gray-600">
          {user.username[0].toUpperCase()}
        </span>
      )}
    </div>
  );
};
