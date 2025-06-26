import { NextResponse } from 'next/server';
import { graphql } from '@octokit/graphql';

const github = graphql.defaults({
  headers: { authorization: `token ${process.env.GITHUB_TOKEN}` },
});

type GitHubData = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: any[];
        totalContributions: number;
      };
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalIssueContributions: number;
      totalRepositoryContributions: number;
    };
    repositories: {
      totalCount: number;
    };
    followers: {
      totalCount: number;
    };
    following: {
      totalCount: number;
    };
    createdAt: string;
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '') || new Date().getFullYear();
    
    const { user } = await github<GitHubData>(
      `query ($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                  weekday
                }
              }
              totalContributions
            }
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            totalRepositoryContributions
          }
          repositories(first: 1, ownerAffiliations: OWNER) {
            totalCount
          }
          followers {
            totalCount
          }
          following {
            totalCount
          }
          createdAt
        }
      }`,
      { 
        login: 'HaziqHaiqal',
        from: `${year}-01-01T00:00:00Z`,
        to: `${year}-12-31T23:59:59Z`
      }
    );

    const accountCreationDate = new Date(user.createdAt);
    const accountCreationYear = accountCreationDate.getFullYear();
    
    const data = {
      calendar: user.contributionsCollection.contributionCalendar,
      stats: {
        currentYear: year,
        totalContributions: user.contributionsCollection.contributionCalendar.totalContributions,
        totalCommits: user.contributionsCollection.totalCommitContributions,
        totalPRs: user.contributionsCollection.totalPullRequestContributions,
        totalIssues: user.contributionsCollection.totalIssueContributions,
        totalRepos: user.repositories.totalCount,
        followers: user.followers.totalCount,
        following: user.following.totalCount,
        accountAge: Math.floor((Date.now() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24 * 365)),
        accountCreationYear: accountCreationYear,
        accountCreatedAt: user.createdAt
      }
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('GitHub API Error:', error);
    return NextResponse.json({ error: 'GitHub fetch failed' }, { status: 500 });
  }
}
