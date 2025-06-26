export type ContributionDay = {
  date: string;
  contributionCount: number;
  weekday: number;
};

export type Week = {
  contributionDays: ContributionDay[];
};

export type GitHubCalendar = {
    weeks: Week[];
    totalContributions: number;
}

export type GitHubStats = {
    currentYear: number;
    totalContributions: number;
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    totalRepos: number;
    followers: number;
    following: number;
    accountAge: number;
    accountCreationYear: number;
    accountCreatedAt: string;
}

export type GitHubData = {
    calendar: GitHubCalendar;
    stats: GitHubStats;
} 