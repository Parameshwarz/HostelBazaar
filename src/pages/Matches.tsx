import React from 'react';
import MatchesInbox from '../components/requests/MatchesInbox';

export default function Matches() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Your Matches
        </h1>
        <MatchesInbox />
      </div>
    </div>
  );
} 