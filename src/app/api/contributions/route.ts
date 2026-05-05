import { NextResponse } from 'next/server';

export const revalidate = 3600;

const ENDPOINT = 'https://api.github.com/graphql';
const LOGIN = process.env.GITHUB_LOGIN ?? 'donovan0902';

const QUERY = `
  query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          colors
          months { firstDay name totalWeeks year }
          weeks {
            firstDay
            contributionDays { date contributionCount color weekday }
          }
        }
      }
    }
  }
`;

export async function GET() {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: 'GitHub token not configured' },
      { status: 503 }
    );
  }

  const now = new Date();
  const from = new Date(now);
  from.setUTCFullYear(now.getUTCFullYear() - 1);

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'donovan-landing-contribution-heatmap',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { login: LOGIN, from: from.toISOString(), to: now.toISOString() },
    }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `GitHub GraphQL request failed: ${res.status}` },
      { status: 502 }
    );
  }

  const payload = await res.json() as Record<string, unknown>;
  const user = (payload?.data as Record<string, unknown>)?.user as Record<string, unknown> | undefined;
  const cal = (user?.contributionsCollection as Record<string, unknown> | undefined)
    ?.contributionCalendar as Record<string, unknown> | undefined;

  if (!cal) {
    return NextResponse.json(
      { error: `No contribution calendar returned for ${LOGIN}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    login: LOGIN,
    generatedAt: now.toISOString(),
    from: from.toISOString(),
    to: now.toISOString(),
    totalContributions: cal.totalContributions,
    colors: cal.colors,
    months: cal.months,
    weeks: cal.weeks,
  });
}
