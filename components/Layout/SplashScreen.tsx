import { Fragment } from 'react';
import type { CSSProperties } from 'react';

type Variant = 'pr' | 'gg' | 'df' | 'sk' | 'ci' | 'tr' | 'dp' | 'bk' | 'pc';

const VARIANT: Variant = 'pr';

const TIMING: Record<Variant, { hold: number; fade: number }> = {
  pr: { hold: 900, fade: 300 },
  gg: { hold: 900, fade: 280 },
  df: { hold: 780, fade: 260 },
  sk: { hold: 820, fade: 260 },
  ci: { hold: 940, fade: 280 },
  tr: { hold: 900, fade: 260 },
  dp: { hold: 860, fade: 260 },
  bk: { hold: 760, fade: 240 },
  pc: { hold: 750, fade: 350 },
};

const v = (o: Record<string, string | number>) => o as CSSProperties;

const PulseRings = () => (
  <div className="splash-pr">
    {[0, 1, 2].map((i) => (
      <i key={i} style={v({ '--d': `${i * 466}ms` })} />
    ))}
  </div>
);

const GitGraph = () => (
  <div className="splash-gg">
    <div
      className="splash-gg__seg splash-gg__seg--v"
      style={v({ left: 60, top: 20, height: 150, '--d': '0ms' })}
    />
    <div
      className="splash-gg__seg splash-gg__seg--h"
      style={v({ left: 60, top: 63, width: 110, '--d': '180ms' })}
    />
    <div
      className="splash-gg__seg splash-gg__seg--v"
      style={v({ left: 168, top: 63, height: 64, '--d': '300ms' })}
    />
    <div
      className="splash-gg__seg splash-gg__seg--hr"
      style={v({ left: 60, top: 126, width: 110, '--d': '600ms' })}
    />

    <div
      className="splash-gg__node"
      style={v({ left: 61, top: 22, '--c': 'var(--t-id)', '--d': '60ms' })}
    />
    <div
      className="splash-gg__node"
      style={v({ left: 61, top: 64, '--c': 'var(--t-id)', '--d': '240ms' })}
    />
    <div
      className="splash-gg__node"
      style={v({ left: 169, top: 100, '--c': 'var(--t-key)', '--d': '440ms' })}
    />
    <div
      className="splash-gg__node"
      style={v({ left: 61, top: 127, '--c': 'var(--t-id)', '--d': '660ms' })}
    />
    <div
      className="splash-gg__node splash-gg__node--head"
      style={v({ left: 61, top: 168, '--d': '840ms' })}
    />

    <div
      className="splash-gg__lbl"
      style={v({ left: 84, top: 12, '--d': '60ms' })}
    >
      init
    </div>
    <div
      className="splash-gg__lbl"
      style={v({ left: 192, top: 90, '--d': '440ms' })}
    >
      feat/hero
    </div>
    <div
      className="splash-gg__lbl"
      style={v({ left: 84, top: 117, '--d': '660ms' })}
    >
      merge
    </div>
    <div
      className="splash-gg__lbl splash-gg__lbl--head"
      style={v({ left: 84, top: 158, '--d': '840ms' })}
    >
      HEAD → main
    </div>
  </div>
);

const DIFF_ROWS: [string, string, string][] = [
  ['ctx', ' ', '56%'],
  ['ctx', ' ', '38%'],
  ['del', '−', '64%'],
  ['del', '−', '47%'],
  ['add', '+', '72%'],
  ['add', '+', '58%'],
  ['add', '+', '41%'],
  ['ctx', ' ', '52%'],
];

const DIFF_DELAYS = [0, 60, 180, 250, 360, 430, 500, 590];

const DiffHunk = () => (
  <div className="splash-df">
    {DIFF_ROWS.map(([kind, mark, w], i) => (
      <div
        key={i}
        className={`splash-df__r splash-df__r--${kind}`}
        style={v({ '--d': `${DIFF_DELAYS[i]}ms` })}
      >
        <span>{mark}</span>
        <i style={v({ '--w': w })} />
      </div>
    ))}
  </div>
);

const SK_LINES: { i: number; bars: [string, number, number][] }[] = [
  {
    i: 0,
    bars: [
      ['key', 38, 0],
      ['id', 64, 60],
      ['dim', 14, 110],
    ],
  },
  {
    i: 1,
    bars: [
      ['id', 52, 160],
      ['str', 96, 210],
    ],
  },
  {
    i: 1,
    bars: [
      ['id', 44, 260],
      ['num', 28, 310],
    ],
  },
  {
    i: 2,
    bars: [
      ['key', 30, 360],
      ['id', 78, 410],
    ],
  },
  { i: 2, bars: [['str', 110, 460]] },
  { i: 1, bars: [['dim', 20, 520]] },
  {
    i: 0,
    bars: [
      ['key', 46, 580],
      ['id', 58, 630],
    ],
  },
];

const SyntaxSkeleton = () => (
  <div className="splash-sk">
    {SK_LINES.map((line, li) => (
      <div key={li} className="splash-sk__l" style={v({ '--i': line.i })}>
        {line.bars.map(([tone, w, d], bi) => (
          <i
            key={bi}
            style={v({
              '--c': `var(--t-${tone})`,
              '--w': `${w}px`,
              '--d': `${d}ms`,
            })}
          />
        ))}
        {li === SK_LINES.length - 1 && <span className="splash-sk__cur" />}
      </div>
    ))}
  </div>
);

const CI_STAGES: [string, number][] = [
  ['install', 120],
  ['build', 340],
  ['test', 560],
  ['deploy', 780],
];

const CiPipeline = () => (
  <div className="splash-ci">
    {CI_STAGES.map(([name, p], i) => (
      <Fragment key={name}>
        {i > 0 && (
          <div
            className="splash-ci__link"
            style={v({ '--d': `${p - 190}ms` })}
          />
        )}
        <div className="splash-ci__st" style={v({ '--p': `${p}ms` })}>
          <span className="splash-ci__dot" style={v({ '--p': `${p}ms` })} />
          {name}
        </div>
      </Fragment>
    ))}
  </div>
);

const TestRunner = () => (
  <div className="splash-tr">
    <div className="splash-tr__dots">
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          className="splash-tr__d"
          style={v({ '--d': `${i * 24}ms` })}
        />
      ))}
    </div>
    <div className="splash-tr__sum">28 passed &nbsp;·&nbsp; 0 failed</div>
  </div>
);

const DEPS: [string, string, string, number][] = [
  ['', 'portfolio', '1.0.0', 0],
  ['├─', 'next', '16.2.4', 140],
  ['├─', 'react', '19.2.0', 280],
  ['├─', 'framer-motion', '12.19', 420],
  ['├─', 'tailwindcss', '3.4.17', 560],
  ['└─', 'supabase-js', '2.x', 700],
];

const DependencyTree = () => (
  <div className="splash-dp">
    {DEPS.map(([glyph, name, version, d], i) => (
      <div key={name} className="splash-dp__r" style={v({ '--d': `${d}ms` })}>
        {glyph && <span className="splash-dp__g">{glyph}</span>}
        <span className="splash-dp__n">{name}</span>
        <span className="splash-dp__v">{version}</span>
        {i > 0 && (
          <span className="splash-dp__ok" style={v({ '--dk': `${d + 160}ms` })}>
            ✓
          </span>
        )}
      </div>
    ))}
  </div>
);

const BRACKETS: [string, string, number, number, string, number, number][] = [
  ['{', '}', 104, 120, 'dim', 0, 420],
  ['(', ')', 80, 86, 'id', 80, 470],
  ['[', ']', 60, 58, 'key', 160, 520],
  ['<', '>', 42, 34, 'num', 240, 560],
];

const BracketCollapse = () => (
  <div className="splash-bk">
    {BRACKETS.map(([open, close, fs, gap, tone, d, dc]) => (
      <div
        key={open}
        className="splash-bk__p"
        style={v({
          '--fs': `${fs}px`,
          '--gap': `${gap}px`,
          '--c': `var(--t-${tone})`,
          '--d': `${d}ms`,
          '--dc': `${dc}ms`,
        })}
      >
        <span>{open}</span>
        <span>{close}</span>
      </div>
    ))}
    <div className="splash-bk__core" />
  </div>
);

const PercentCounter = () => (
  <div>
    <div className="splash-count">
      <div className="splash-count__win">
        <div className="splash-count__strip">
          {Array.from({ length: 101 }, (_, n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>
      <span className="splash-count__pct">%</span>
    </div>
    <div className="splash-rule" />
  </div>
);

const VARIANTS: Record<Variant, () => React.JSX.Element> = {
  pr: PulseRings,
  gg: GitGraph,
  df: DiffHunk,
  sk: SyntaxSkeleton,
  ci: CiPipeline,
  tr: TestRunner,
  dp: DependencyTree,
  bk: BracketCollapse,
  pc: PercentCounter,
};

export default function SplashScreen() {
  const Loader = VARIANTS[VARIANT];
  const { hold, fade } = TIMING[VARIANT];

  return (
    <div
      className="splash-screen"
      aria-hidden
      style={v({ '--splash-hold': `${hold}ms`, '--splash-fade': `${fade}ms` })}
    >
      <Loader />
    </div>
  );
}
