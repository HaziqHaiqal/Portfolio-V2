import { useState, useEffect, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Github, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useTheme } from "@components/providers/ThemeProvider";
import { COLORS } from "@constants/colors";
import { Week, GitHubData, GitHubStats, ContributionDay } from "types/github";

const MONTHS = [
  { short: "Jan", full: "January" },
  { short: "Feb", full: "February" },
  { short: "Mar", full: "March" },
  { short: "Apr", full: "April" },
  { short: "May", full: "May" },
  { short: "Jun", full: "June" },
  { short: "Jul", full: "July" },
  { short: "Aug", full: "August" },
  { short: "Sep", full: "September" },
  { short: "Oct", full: "October" },
  { short: "Nov", full: "November" },
  { short: "Dec", full: "December" },
] as const;

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const formatTooltip = (day: ContributionDay) => {
  const [, month, dayOfMonth] = day.date.split("-").map(Number);
  const count = day.contributionCount;
  const label =
    count === 0
      ? "No contributions"
      : `${count} contribution${count === 1 ? "" : "s"}`;
  return `${label} on ${MONTHS[month - 1].full} ${ordinal(dayOfMonth)}`;
};

const ActivityOverview = () => {
  const { isDarkMode } = useTheme();

  const [weeksData, setWeeksData] = useState<Week[]>([]);
  const [maxCount, setMaxCount] = useState(1);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [loadedYear, setLoadedYear] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  );

  const loading = loadedYear !== selectedYear;
  const [accountCreationYear, setAccountCreationYear] = useState<number | null>(
    null,
  );

  const [tooltip, setTooltip] = useState<{
    content: string;
    x: number;
    y: number;
  } | null>(null);

  const currentYear = new Date().getFullYear();
  const availableYears = accountCreationYear
    ? Array.from(
        { length: currentYear - accountCreationYear + 1 },
        (_, i) => accountCreationYear + i,
      ).reverse()
    : [currentYear];

  useEffect(() => {
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
              (prev) => prev ?? data.stats.accountCreationYear ?? null,
            );
          }

          const max = Math.max(
            ...data.calendar.weeks.flatMap((w) =>
              w.contributionDays.map((d) => d.contributionCount),
            ),
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
  }, [selectedYear]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const palette = isDarkMode
    ? COLORS.contribution.dark
    : COLORS.contribution.light;

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
    <section className={`py-16 md:py-32 px-4 md:px-6 relative`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-full font-bold text-sm md:text-xl mb-6 md:mb-8 shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <Github size={20} className="md:w-6 md:h-6" />
            github.exe
          </motion.div>
        </motion.div>

        <div className="flex justify-center">
          <motion.div
            className="relative w-full max-w-[920px]"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {loading ? (
              <div
                className={`backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl border w-full ${isDarkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-white/50"}`}
              >
                <div className="flex justify-center items-center py-12">
                  <motion.div
                    className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span
                    className={`ml-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Loading GitHub data...
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl border w-full ${isDarkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-white/50"}`}
                >
                  <div className="flex items-center justify-between mb-4 md:mb-6 gap-2 sm:gap-4">
                    <h3
                      className={`font-bold flex items-center gap-2 text-sm md:text-base min-w-0 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
                    >
                      <Github size={16} className="md:w-5 md:h-5 shrink-0" />
                      <span className="truncate">
                        {githubStats?.totalContributions ?? 0} contributions in{" "}
                        {selectedYear}
                      </span>
                    </h3>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <Calendar
                          size={14}
                          className={`hidden sm:block ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        />
                        <Select
                          value={selectedYear}
                          onValueChange={handleYearChange}
                        >
                          <SelectTrigger
                            className={`w-20 h-8 text-xs ${isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300"}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            className={
                              isDarkMode
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                            }
                          >
                            {availableYears.map((year) => (
                              <SelectItem
                                key={year}
                                value={year.toString()}
                                className={`text-xs ${isDarkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-900 hover:bg-gray-100"}`}
                              >
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 md:mb-6 flex justify-center">
                    <div className="max-w-full">
                      <div className="overflow-x-auto overflow-y-hidden">
                        <div className="inline-flex flex-col min-w-max">
                          <div className="flex gap-0.5 md:gap-1 mb-1 h-4">
                            {weeksData.map((_, wIdx) => (
                              <div key={wIdx} className="w-2 md:w-3 relative">
                                {monthLabelAt[wIdx] && (
                                  <span
                                    className={`absolute left-0 top-0 text-[9px] md:text-[10px] leading-none whitespace-nowrap ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
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
                                      <motion.div
                                        key={dIdx}
                                        className="w-2 h-2 md:w-3 md:h-3 rounded-sm cursor-pointer"
                                        style={{
                                          backgroundColor:
                                            intensityColor(count),
                                        }}
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        transition={{
                                          duration: 0.3,
                                          delay: (wIdx * 7 + dIdx) * 0.02,
                                          type: "spring",
                                          stiffness: 100,
                                        }}
                                        viewport={{ once: true }}
                                        whileHover={{ scale: 1.8, rotate: 45 }}
                                        onMouseEnter={(e) =>
                                          showTooltip(e, day)
                                        }
                                        onMouseLeave={hideTooltip}
                                      />
                                    );
                                  },
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`flex items-center justify-end gap-1 mt-2 text-[10px] md:text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        <span className="mr-1">Less</span>
                        {palette.map((color, i) => (
                          <span
                            key={i}
                            className="w-2 h-2 md:w-3 md:h-3 rounded-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <span className="ml-1">More</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                    <div className="flex items-center justify-between">
                      <span
                        className={
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Total commits
                      </span>
                      <span className="font-bold text-orange-600">
                        {githubStats?.totalCommits || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }
                      >
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
          </motion.div>
        </div>
      </div>

      {tooltip &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, calc(-100% - 6px))",
            }}
          >
            {tooltip.content}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>,
          document.body,
        )}
    </section>
  );
};

export default ActivityOverview;
