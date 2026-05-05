export type ContributionDay = {
  date: string;
  contributionCount: number;
  color: string;
  weekday: number;
};

export type ContributionWeek = {
  firstDay: string;
  contributionDays: ContributionDay[];
};

export type ContributionMonth = {
  firstDay: string;
  name: string;
  totalWeeks: number;
  year: number;
};

export type GithubContributions = {
  login: string;
  generatedAt: string;
  from: string;
  to: string;
  totalContributions: number;
  colors: string[];
  months: ContributionMonth[];
  weeks: ContributionWeek[];
};

export const githubContributionsPath = "/api/contributions";

function isContributionDay(value: unknown): value is ContributionDay {
  if (!value || typeof value !== "object") {
    return false;
  }

  const day = value as Record<string, unknown>;

  return (
    typeof day.date === "string" &&
    typeof day.contributionCount === "number" &&
    typeof day.color === "string" &&
    typeof day.weekday === "number"
  );
}

function isContributionWeek(value: unknown): value is ContributionWeek {
  if (!value || typeof value !== "object") {
    return false;
  }

  const week = value as Record<string, unknown>;

  return (
    typeof week.firstDay === "string" &&
    Array.isArray(week.contributionDays) &&
    week.contributionDays.every(isContributionDay)
  );
}

function isContributionMonth(value: unknown): value is ContributionMonth {
  if (!value || typeof value !== "object") {
    return false;
  }

  const month = value as Record<string, unknown>;

  return (
    typeof month.firstDay === "string" &&
    typeof month.name === "string" &&
    typeof month.totalWeeks === "number" &&
    typeof month.year === "number"
  );
}

export function isGithubContributions(
  value: unknown,
): value is GithubContributions {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.login === "string" &&
    typeof data.generatedAt === "string" &&
    typeof data.from === "string" &&
    typeof data.to === "string" &&
    typeof data.totalContributions === "number" &&
    Array.isArray(data.colors) &&
    data.colors.every((color) => typeof color === "string") &&
    Array.isArray(data.months) &&
    data.months.every(isContributionMonth) &&
    Array.isArray(data.weeks) &&
    data.weeks.every(isContributionWeek)
  );
}

export async function fetchGithubContributions(
  signal?: AbortSignal,
): Promise<GithubContributions> {
  const response = await fetch(githubContributionsPath, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Contribution data request failed: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!isGithubContributions(data)) {
    throw new Error("Contribution data has an unexpected shape.");
  }

  return data;
}
