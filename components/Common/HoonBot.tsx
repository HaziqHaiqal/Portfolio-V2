export default function HoonBot({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="4 8 40 40" aria-hidden="true" className={className}>
      <rect
        x="10.4"
        y="36.4"
        width="3.6"
        height="7.4"
        rx="1.8"
        fill="#94A3B8"
      />
      <rect x="34" y="36.4" width="3.6" height="7.4" rx="1.8" fill="#94A3B8" />
      <rect x="21" y="32" width="6" height="4" fill="#CBD5E1" />
      <rect
        x="14"
        y="34.6"
        width="20"
        height="12"
        rx="5"
        fill="#F1F5F9"
        stroke="#CBD5E1"
        strokeWidth="0.8"
      />
      <circle cx="24" cy="40.6" r="1.8" fill="#34D399" />

      <rect x="4.6" y="16.8" width="4" height="8.4" rx="2" fill="#94A3B8" />
      <rect x="39.4" y="16.8" width="4" height="8.4" rx="2" fill="#94A3B8" />
      <rect
        x="8"
        y="9"
        width="32"
        height="24"
        rx="9"
        fill="#F1F5F9"
        stroke="#CBD5E1"
        strokeWidth="0.8"
      />

      <rect
        x="11.8"
        y="12.8"
        width="24.4"
        height="16.4"
        rx="6"
        fill="#0F172A"
      />
      <circle cx="15.6" cy="24.6" r="1.2" fill="#F472B6" opacity="0.5" />
      <circle cx="32.4" cy="24.6" r="1.2" fill="#F472B6" opacity="0.5" />
      <ellipse
        className="hoon-eye"
        cx="19.6"
        cy="19.8"
        rx="2.1"
        ry="2.5"
        fill="#34D399"
      />
      <ellipse
        className="hoon-eye"
        cx="28.4"
        cy="19.8"
        rx="2.1"
        ry="2.5"
        fill="#34D399"
      />
      <path
        d="M21.4 24q2.6 2.2 5.2 0"
        stroke="#34D399"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
