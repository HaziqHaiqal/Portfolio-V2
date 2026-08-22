import React from 'react';
import { useTheme } from '@components/Provider/ThemeProvider';

const glyphs = [
  {
    content: '{',
    className: 'absolute left-10 top-20 text-6xl',
    tone: ['text-blue-300', 'text-blue-200'],
    style: {
      '--glyph-duration': '20s',
      '--glyph-y': '-20px',
      '--glyph-rotate-mid': '180deg',
      '--glyph-rotate-end': '360deg',
    },
  },
  {
    content: '</>',
    className: 'absolute right-20 top-40 text-4xl',
    tone: ['text-purple-300', 'text-purple-200'],
    style: {
      '--glyph-duration': '15s',
      '--glyph-y': '20px',
      '--glyph-rotate-mid': '-180deg',
      '--glyph-rotate-end': '-360deg',
    },
  },
  {
    content: '\u{1F680}',
    className: 'absolute bottom-20 right-10 text-3xl opacity-30',
    tone: ['text-green-300', 'text-green-200'],
    style: {
      '--glyph-duration': '25s',
      '--glyph-y': '-15px',
      '--glyph-rotate-mid': '90deg',
      '--glyph-rotate-end': '180deg',
    },
  },
] as const;

const FloatingElements = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className="pointer-events-none fixed inset-0">
      {glyphs.map((glyph) => (
        <div
          key={glyph.content}
          className={`float-glyph ${glyph.className} ${
            isDarkMode ? glyph.tone[0] : glyph.tone[1]
          }`}
          style={glyph.style as React.CSSProperties}
        >
          {glyph.content}
        </div>
      ))}
    </div>
  );
};

export default FloatingElements;
