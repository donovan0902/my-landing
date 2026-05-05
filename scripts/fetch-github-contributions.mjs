import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const endpoint = "https://api.github.com/graphql";
const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
const login = process.env.GITHUB_LOGIN ?? "donovan0902";
const outputPath = resolve(
  process.cwd(),
  process.env.GITHUB_CONTRIBUTIONS_OUTPUT ?? "public/github-contributions.json",
);

if (!token) {
  console.error(
    "Missing GH_TOKEN or GITHUB_TOKEN. Create a token with read:user if you want private contribution counts included.",
  );
  process.exit(1);
}

const now = new Date();
const from = new Date(now);
from.setUTCFullYear(now.getUTCFullYear() - 1);

const query = `
  query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          colors
          months {
            firstDay
            name
            totalWeeks
            year
          }
          weeks {
            firstDay
            contributionDays {
              date
              contributionCount
              color
              weekday
            }
          }
        }
      }
    }
  }
`;

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "donovan-landing-contribution-heatmap",
  },
  body: JSON.stringify({
    query,
    variables: {
      login,
      from: from.toISOString(),
      to: now.toISOString(),
    },
  }),
});

if (!response.ok) {
  throw new Error(`GitHub GraphQL request failed: ${response.status}`);
}

const payload = await response.json();

if (payload.errors?.length) {
  throw new Error(payload.errors.map((error) => error.message).join("\n"));
}

const calendar =
  payload.data?.user?.contributionsCollection?.contributionCalendar;

if (!calendar) {
  throw new Error(`No contribution calendar returned for ${login}.`);
}

const data = {
  login,
  generatedAt: now.toISOString(),
  from: from.toISOString(),
  to: now.toISOString(),
  totalContributions: calendar.totalContributions,
  colors: calendar.colors,
  months: calendar.months,
  weeks: calendar.weeks,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(`${outputPath}.tmp`, `${JSON.stringify(data, null, 2)}\n`);
await rename(`${outputPath}.tmp`, outputPath);

console.log(
  `Wrote ${calendar.totalContributions} contributions for ${login} to ${outputPath}`,
);
