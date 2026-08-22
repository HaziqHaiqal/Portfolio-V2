const GridBackground = () => (
  <div
    className="pointer-events-none absolute inset-0 z-0"
    style={{
      backgroundImage: `
        linear-gradient(var(--grid-line) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
    }}
  />
);

export default GridBackground;
