import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Github, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useTheme } from "./providers/ThemeProvider";
import { Week, GitHubStats, GitHubData } from "../types/github";

const ActivityOverview = () => {
  const { isDarkMode } = useTheme();

  const [weeksData, setWeeksData] = useState<Week[]>([]);
  const [maxCount, setMaxCount] = useState(1);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [accountCreationYear, setAccountCreationYear] = useState<number | null>(null);

  // Generate available years (from account creation to current year)
  const currentYear = new Date().getFullYear();
  const availableYears = accountCreationYear
    ? Array.from({ length: currentYear - accountCreationYear + 1 }, (_, i) => accountCreationYear + i).reverse()
    : [currentYear]; // Only show current year while loading account creation date

  const fetchGitHubData = useCallback((year: string) => {
    setLoading(true);
    fetch(`/api/github?year=${year}`)
      .then(r => r.json())
      .then((data: GitHubData) => {
        if (data.calendar && data.stats) {
          setWeeksData(data.calendar.weeks);
          setGithubStats(data.stats);

          // Set account creation year if not already set
          if (data.stats.accountCreationYear && !accountCreationYear) {
            setAccountCreationYear(data.stats.accountCreationYear);
          }

          // find maximum contribution count to scale intensity
          const max = Math.max(
            ...data.calendar.weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount))
          );
          setMaxCount(max || 1);
        }
        setLoading(false);
      })
      .catch(() => {
        setWeeksData([]);
        setLoading(false);
      });
  }, [accountCreationYear]);

  useEffect(() => {
    fetchGitHubData(selectedYear);
  }, [selectedYear, fetchGitHubData]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  const intensityClass = (count: number) => {
    // map raw count into 0-3 bucket relative to maxCount
    const frac = count / maxCount;
    const lvl = frac === 0 ? 0 : frac < 0.25 ? 1 : frac < 0.5 ? 2 : 3;
    const light = [
      "bg-gray-200",
      "bg-green-300",
      "bg-green-500",
      "bg-green-700",
    ];
    const dark = [
      "bg-gray-700",
      "bg-green-600",
      "bg-green-500",
      "bg-green-400",
    ];
    return (isDarkMode ? dark : light)[lvl];
  };

  // Calculate longest streak
  let currentStreak = 0;
  let longestStreak = 0;
  weeksData.flatMap((w) => w.contributionDays).forEach((d) => {
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
            Developer.exe
          </motion.div>
        </motion.div>

        <div className="flex justify-center">
          <motion.div
            className="relative w-full max-w-4xl"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {loading ? (
              <div className={`backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl border w-full ${isDarkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-white/50"}`}>
                <div className="flex justify-center items-center py-12">
                  <motion.div
                    className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className={`ml-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Loading GitHub data...
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Card */}
                <div className={`backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl border w-full overflow-x-auto ${isDarkMode ? "bg-gray-800/90 border-gray-700/50" : "bg-white/90 border-white/50"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
                    <h3 className={`font-bold flex items-center gap-2 text-sm md:text-base ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                      <Github size={16} className="md:w-5 md:h-5" />
                      Activity Overview
                    </h3>

                    {/* Year Selector */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className={isDarkMode ? "text-gray-400" : "text-gray-600"} />
                        <Select value={selectedYear} onValueChange={handleYearChange}>
                          <SelectTrigger className={`w-20 h-8 text-xs ${isDarkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300"}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
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

                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className={`text-xs md:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {selectedYear === currentYear.toString() ? 'Currently Active' : `Year ${selectedYear}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="mb-4 md:mb-6 overflow-x-auto md:overflow-x-visible">
                    <div className="flex gap-0.5 md:gap-1 min-w-max md:min-w-0">
                      {weeksData.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-0.5 md:gap-1">
                          {week.contributionDays.map((day, dIdx: number) => {
                            const count = day.contributionCount;
                            return (
                              <motion.div
                                key={dIdx}
                                className={`w-2 h-2 md:w-3 md:h-3 rounded-sm cursor-pointer transition-all duration-200 ${intensityClass(count)}`}
                                initial={{ scale: 0, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: (wIdx * 7 + dIdx) * 0.02, type: "spring", stiffness: 100 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.8, rotate: 45, backgroundColor: isDarkMode ? "#10b981" : "#059669" }}
                                animate={count > (maxCount * 0.8) ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1], transition: { duration: 2, repeat: Infinity, delay: (wIdx * 7 + dIdx) % 10 * 0.2 } } : {}}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Stats */}
                  <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Contributions this year</span>
                      <span className="font-bold text-green-600">{githubStats?.totalContributions || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Total commits</span>
                      <span className="font-bold text-orange-600">{githubStats?.totalCommits || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Longest streak</span>
                      <span className="font-bold text-blue-600">{longestStreak} days</span>
                    </div>
                  </div>
                </div>

                {/* Floating badges - hidden on mobile */}
                <motion.div
                  className="hidden md:block absolute -top-8 -right-8 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                  animate={{ rotate: [0, 5, -5, 0], y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >🏆 Problem Solver</motion.div>

                <motion.div
                  className="hidden md:block absolute -bottom-4 -left-8 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                  animate={{ rotate: [0, -5, 5, 0], y: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                >💡 Innovator</motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ActivityOverview; 