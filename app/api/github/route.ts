import { NextResponse } from 'next/server'
import { graphql } from '@octokit/graphql'
import { z } from 'zod'
import type { GitHubData as LocalGitHubData } from 'types/github'

// This route is dynamic because it reads `request.url` for the `year` query
// parameter. Cache the response at the edge / browser via the Cache-Control
// header below.
export const dynamic = 'force-dynamic'

const github = graphql.defaults({
  headers: { authorization: `token ${process.env.GITHUB_TOKEN}` },
})

const QuerySchema = z.object({
  year: z.coerce
    .number()
    .int()
    .gte(2008)
    .lte(new Date().getFullYear() + 1)
    .default(new Date().getFullYear()),
})

const GITHUB_QUERY = /* GraphQL */ `
  query ($login: String!, $from: DateTime!, $to: DateTime!) {
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
  }
`

interface GitHubAPIResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: {
          contributionDays: {
            date: string
            contributionCount: number
            weekday: number
          }[]
        }[]
        totalContributions: number
      }
      totalCommitContributions: number
      totalPullRequestContributions: number
      totalIssueContributions: number
      totalRepositoryContributions: number
    }
    repositories: { totalCount: number }
    followers: { totalCount: number }
    following: { totalCount: number }
    createdAt: string
  }
}

const LOGIN = process.env.GITHUB_LOGIN || 'HaziqHaiqal'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams))
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query', issues: parsed.error.issues },
        { status: 400 },
      )
    }
    const { year } = parsed.data

    const { user } = await github<GitHubAPIResponse>(GITHUB_QUERY, {
      login: LOGIN,
      from: `${year}-01-01T00:00:00Z`,
      to: `${year}-12-31T23:59:59Z`,
    })

    const accountCreationDate = new Date(user.createdAt)
    const data: LocalGitHubData = {
      calendar: user.contributionsCollection.contributionCalendar,
      stats: {
        currentYear: year,
        totalContributions:
          user.contributionsCollection.contributionCalendar.totalContributions,
        totalCommits: user.contributionsCollection.totalCommitContributions,
        totalPRs: user.contributionsCollection.totalPullRequestContributions,
        totalIssues: user.contributionsCollection.totalIssueContributions,
        totalRepos: user.repositories.totalCount,
        followers: user.followers.totalCount,
        following: user.following.totalCount,
        accountAge: Math.floor(
          (Date.now() - accountCreationDate.getTime()) /
            (1000 * 60 * 60 * 24 * 365),
        ),
        accountCreationYear: accountCreationDate.getFullYear(),
        accountCreatedAt: user.createdAt,
      },
    }

    return NextResponse.json(data, {
      headers: {
        // Edge + browser cache: 5min fresh, 25min stale-while-revalidate.
        'Cache-Control':
          'public, max-age=300, s-maxage=300, stale-while-revalidate=1500',
      },
    })
  } catch (error) {
    console.error('GitHub API Error:', error)
    return NextResponse.json(
      { error: 'GitHub fetch failed' },
      { status: 502 },
    )
  }
}
