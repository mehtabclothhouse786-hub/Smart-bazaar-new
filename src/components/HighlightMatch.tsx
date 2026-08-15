import React from 'react';

interface HighlightMatchProps {
  text?: string | null;
  query: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Robust, accessible text match highlighter for real-time predictive search.
 * Safely handles regex characters, Unicode/Hindi strings, and highlights matches.
 */
export const HighlightMatch: React.FC<HighlightMatchProps> = ({
  text,
  query,
  className = '',
  highlightClassName = 'bg-amber-300 text-stone-950 font-black px-1 py-0.5 rounded-sm shadow-2xs'
}) => {
  if (!text) return null;
  const trimmed = query ? query.trim() : '';
  if (!trimmed) {
    return <span className={className}>{text}</span>;
  }

  try {
    // Escape special regex characters in the query string
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          if (part.toLowerCase() === trimmed.toLowerCase()) {
            return (
              <mark key={index} className={highlightClassName}>
                {part}
              </mark>
            );
          }
          return <React.Fragment key={index}>{part}</React.Fragment>;
        })}
      </span>
    );
  } catch (err) {
    console.error('HighlightMatch error:', err);
    return <span className={className}>{text}</span>;
  }
};
