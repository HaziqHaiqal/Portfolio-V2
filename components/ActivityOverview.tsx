'use client';

import { useState, useEffect, useRef, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { m } from 'framer-motion';
import { Github, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import SectionHeader from '@components/Common/SectionHeader';
import { getCurrentYear } from '@lib/format';
import { Week, GitHubData, GitHubStats, ContributionDay } from 'types/github';

const MONTHS = [
  { short: 'Jan', full: 'January' },
  { short: 'Feb', full: 'February' },
  { short: 'Mar', full: 'March' },
  { short: 'Apr', full: 'April' },
  { short: 'May', full: 'May' },
  { short: 'Jun', full: 'June' },
  { short: 'Jul', full: 'July' },
  { short: 'Aug', full: 'August' },
  { short: 'Sep', full: 'September' },
  { short: 'Oct', full: 'October' },
  { short: 'Nov', full: 'November' },
  { short: 'Dec', full: 'December' },
] as const;

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const formatTooltip = (day: ContributionDay) => {
  const [, month, dayOfMonth] = day.date.split('-').map(Number);
  const count = day.contributionCount;
  const label =
    count === 0
      ? 'No contributions'
      : `${count} contribution${count === 1 ? '' : 's'}`;
  return `${label} on ${MONTHS[month - 1].full} ${ordinal(dayOfMonth)}`;
};

const ActivityOverview = () => {
  const [weeksData, setWeeksData] = useState<Week[]>([]);
  const [maxCount, setMaxCount] = useState(1);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [loadedYear, setLoadedYear] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(
    getCurrentYear().toString()
  );

  const loading = loadedYear !== selectedYear;
  const [accountCreationYear, setAccountCreationYear] = useState<number | null>(
    null
  );

  const [tooltip, setTooltip] = useState<{
    content: string;
    x: number;
    y: number;
  } | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const currentYear = getCurrentYear();
  const availableYears = accountCreationYear
    ? Array.from(
        { length: currentYear - accountCreationYear + 1 },
        (_, i) => accountCreationYear + i
      ).reverse()
    : [currentYear];

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    fetch(`/api/github?year=${selectedYear}`)
      .then((r) => r.json())
      .then((data: GitHubData) => {
        if (cancelled) return;
        if (data.calendar && data.stats) {
          setWeeksData(data.calendar.weeks);
          setGithubStats(data.stats);

          if (data.stats.accountCreationYear) {
            setAccountCreationYear(
              (prev) => prev ?? data.stats.accountCreationYear ?? null
            );
          }

          const max = Math.max(
            ...data.calendar.weeks.flatMap((w) =>
              w.contributionDays.map((d) => d.contributionCount)
            )
          );
          setMaxCount(max || 1);
        }
        setLoadedYear(selectedYear);
      })
      .catch(() => {
        if (cancelled) return;
        setWeeksData([]);
        setLoadedYear(selectedYear);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedYear, inView]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const palette = [
    'var(--contrib-0)',
    'var(--contrib-1)',
    'var(--contrib-2)',
    'var(--contrib-3)',
  ];

  const intensityColor = (count: number) => {
    const frac = count / maxCount;
    const lvl = frac === 0 ? 0 : frac < 0.25 ? 1 : frac < 0.5 ? 2 : 3;
    return palette[lvl];
  };

  const monthLabelAt: Record<number, string> = {};
  const labeledWeeks: number[] = [];
  let lastMonth = -1;
  weeksData.forEach((week, i) => {
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;
    const month = Number(firstDay.date.slice(5, 7)) - 1;
    if (month !== lastMonth) {
      monthLabelAt[i] = MONTHS[month].short;
      labeledWeeks.push(i);
      lastMonth = month;
    }
  });
  if (labeledWeeks.length > 1 && labeledWeeks[1] - labeledWeeks[0] < 3) {
    delete monthLabelAt[labeledWeeks[0]];
  }

  const showTooltip = (e: MouseEvent<HTMLDivElement>, day: ContributionDay) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTooltip({
      content: formatTooltip(day),
      x: r.left + r.width / 2,
      y: r.top,
    });
  };

  const hideTooltip = () => setTooltip(null);

  let currentStreak = 0;
  let longestStreak = 0;
  weeksData
    .flatMap((w) => w.contributionDays)
    .forEach((d) => {
      if (d.contributionCount > 0) {
        currentStreak += 1;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

  return (
    <section
      ref={sectionRef}
      className={`relative px-4 py-16 md:px-6 md:py-32`}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          icon={Github}
          label="github.activity()"
          title="GitHub Activity"
          accentClass="text-cyan-500"
          gradientClass="from-cyan-600 to-cyan-400"
        />

        <div className="flex justify-center">
          <m.div
            className="relative w-full max-w-[920px]"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {loading ? (
              <div
                className={`min-h-[240px] w-full rounded-2xl border border-white/50 bg-white/90 p-4 shadow-2xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90 md:min-h-[344px] md:rounded-3xl md:p-8`}
              >
                <div className="flex items-center justify-center py-12">
                  <m.div
                    className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <span className={`ml-3 text-gray-700 dark:text-gray-300`}>
                    Loading GitHub data...
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`min-h-[240px] w-full rounded-2xl border border-white/50 bg-white/90 p-4 shadow-2xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/90 md:min-h-[344px] md:rounded-3xl md:p-8`}
                >
                  <div className="mb-4 flex items-center justify-between gap-2 sm:gap-4 md:mb-6">
                    <h3
                      className={`flex min-w-0 items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200 md:text-base`}
                    >
                      <Github size={16} className="shrink-0 md:h-5 md:w-5" />
                      <span className="truncate">
                        {githubStats?.totalContributions ?? 0} contributions in{' '}
                        {selectedYear}
                      </span>
                    </h3>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar
                          size={14}
                          className={`hidden text-gray-600 dark:text-gray-400 sm:block`}
                        />
                        <Select
                          value={selectedYear}
                          onValueChange={handleYearChange}
                        >
                          <SelectTrigger
                            className={`h-8 w-20 border-gray-300 bg-white text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                            {availableYears.map((year) => (
                              <SelectItem
                                key={year}
                                value={year.toString()}
                                className={`text-xs text-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700`}
                              >
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex justify-center md:mb-6">
                    <div className="max-w-full">
                      <div className="overflow-x-auto overflow-y-hidden">
                        <div className="inline-flex min-w-max flex-col">
                          <div className="mb-1 flex h-4 gap-0.5 md:gap-1">
                            {weeksData.map((_, wIdx) => (
                              <div key={wIdx} className="relative w-2 md:w-3">
                                {monthLabelAt[wIdx] && (
                                  <span
                                    className={`absolute left-0 top-0 whitespace-nowrap text-[9px] leading-none text-gray-500 dark:text-gray-400 md:text-[10px]`}
                                  >
                                    {monthLabelAt[wIdx]}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-0.5 md:gap-1">
                            {weeksData.map((week, wIdx) => (
                              <div
                                key={wIdx}
                                className="flex flex-col gap-0.5 md:gap-1"
                              >
                                {week.contributionDays.map(
                                  (day, dIdx: number) => {
                                    const count = day.contributionCount;
                                    return (
                                      <div
                                        key={dIdx}
                                        className="activity-cell h-2 w-2 cursor-pointer rounded-sm transition-transform hover:rotate-45 hover:scale-[1.8] md:h-3 md:w-3"
                                        style={{
                                          backgroundColor:
                                            intensityColor(count),
                                          animationDelay: `${(wIdx * 7 + dIdx) * 0.02}s`,
                                        }}
                                        onMouseEnter={(e) =>
                                          showTooltip(e, day)
                                        }
                                        onMouseLeave={hideTooltip}
                                      />
                                    );
                                  }
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`mt-2 flex items-center justify-end gap-1 text-[10px] text-gray-500 dark:text-gray-400 md:text-xs`}
                      >
                        <span className="mr-1">Less</span>
                        {palette.map((color, i) => (
                          <span
                            key={i}
                            className="h-2 w-2 rounded-sm md:h-3 md:w-3"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <span className="ml-1">More</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs md:space-y-3 md:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total commits
                      </span>
                      <span className="font-bold text-orange-600">
                        {githubStats?.totalCommits || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Longest streak
                      </span>
                      <span className="font-bold text-blue-600">
                        {longestStreak} days
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </m.div>
        </div>
      </div>

      {tooltip &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, calc(-100% - 6px))',
            }}
          >
            {tooltip.content}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>,
          document.body
        )}
    </section>
  );
};

export default ActivityOverview;
