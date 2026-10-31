export function PlayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15l13-7.5z" />
    </svg>
  );
}

export function StopIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  );
}

export function KeyHint({ from = 'A', to = 'K' }: { from?: string; to?: string }) {
  return (
    <p className="sapa-kbd">
      Or play with <kbd>{from}</kbd> to <kbd>{to}</kbd>
    </p>
  );
}
