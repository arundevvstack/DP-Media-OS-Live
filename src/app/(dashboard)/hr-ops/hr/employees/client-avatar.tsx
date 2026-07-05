'use client';
import React, { useState } from 'react';

export function ClientAvatar({ src, name, initials }: { src: string | null; name: string; initials: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <span className="text-xl font-bold text-primary">{initials}</span>;
  }

  return (
    <img 
      src={src} 
      alt={name} 
      className="h-full w-full object-cover" 
      onError={() => setError(true)} 
    />
  );
}
