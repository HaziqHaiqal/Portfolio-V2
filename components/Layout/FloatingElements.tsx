import { CSSProperties } from 'react';

const glyphs = [
  {
    content: '{',
    className: 'absolute left-10 top-20 text-6xl',
    tone: 'text-blue-200 dark:text-blue-300',
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
    tone: 'text-purple-200 dark:text-purple-300',
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
    tone: 'text-green-200 dark:text-green-300',
    style: {
      '--glyph-duration': '25s',
      '--glyph-y': '-15px',
      '--glyph-rotate-mid': '90deg',
      '--glyph-rotate-end': '180deg',
    },
  },
] as const;

const FloatingElements = () => {
  return (
    <div className="pointer-events-none fixed inset-0">
      {glyphs.map((glyph) => (
        <div
          key={glyph.content}
          className={`float-glyph ${glyph.className} ${glyph.tone}`}
          style={glyph.style as CSSProperties}
        >
          {glyph.content}
        </div>
      ))}
    </div>
  );
};

export default FloatingElements;
