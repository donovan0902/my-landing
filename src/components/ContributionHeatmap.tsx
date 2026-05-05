import {
  Fragment,
  startTransition,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  fetchGithubContributions,
  type GithubContributions,
  type ContributionDay,
} from "@/lib/githubContributions";

type ContributionHeatmapState =
  | {
      status: "loading";
      data: null;
    }
  | {
      status: "ready";
      data: GithubContributions;
    }
  | {
      status: "error";
      data: null;
    };

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const visibleWeekdayIndexes = new Set([1, 3, 5]);
const tooltipFadeOutMs = 220;
const emptyWeeks = Array.from({ length: 53 }, () => ({
  firstDay: "",
  contributionDays: Array.from({ length: 7 }, (_, weekday) => ({
    date: "",
    contributionCount: 0,
    color: "var(--heatmap-empty)",
    weekday,
  })),
}));

function formatDisplayDate(date: string) {
  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function getDayLabel(day: ContributionDay) {
  const countLabel =
    day.contributionCount === 1
      ? "1 contribution"
      : `${day.contributionCount} contributions`;

  return `${countLabel} on ${formatDisplayDate(day.date)}`;
}

function getContributionColor(
  day: ContributionDay,
  invertedColorScale: Map<string, string>,
) {
  if (day.contributionCount === 0) {
    return "var(--heatmap-empty)";
  }

  return invertedColorScale.get(day.color) ?? day.color;
}

function getWeekOffset(startDate: string, targetDate: string) {
  if (!startDate || !targetDate) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (Date.parse(`${targetDate}T00:00:00.000Z`) -
        Date.parse(`${startDate}T00:00:00.000Z`)) /
        604800000,
    ),
  );
}

function isBeforeDate(date: string, targetDate: string) {
  if (!date || !targetDate) {
    return false;
  }

  return (
    Date.parse(`${date}T00:00:00.000Z`) <
    Date.parse(`${targetDate}T00:00:00.000Z`)
  );
}

export function ContributionHeatmap() {
  const heatmapRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const activeTooltipLabelRef = useRef<string | null>(null);
  const lastTooltipAnchorRef = useRef({ x: 0, y: 0 });
  const tooltipFadeOutTimeoutRef = useRef<number | null>(null);
  const [state, setState] = useState<ContributionHeatmapState>({
    status: "loading",
    data: null,
  });
  const [activeTooltipLabel, setActiveTooltipLabel] = useState<string | null>(
    null,
  );
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const loadContributions = useEffectEvent((signal: AbortSignal) => {
    fetchGithubContributions(signal)
      .then((data) => {
        startTransition(() => {
          setState({ status: "ready", data });
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        startTransition(() => {
          setState({ status: "error", data: null });
        });
      });
  });

  useEffect(() => {
    const abortController = new AbortController();

    loadContributions(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (tooltipFadeOutTimeoutRef.current) {
        window.clearTimeout(tooltipFadeOutTimeoutRef.current);
      }
    };
  }, []);

  const data = state.data;
  const weeks = data?.weeks ?? emptyWeeks;
  const monthLabels = data?.months ?? [];
  const contributionColors = data?.colors ?? [];
  const invertedColorScale = new Map(
    contributionColors.map((color, index) => [
      color,
      contributionColors[contributionColors.length - 1 - index],
    ]),
  );
  const calendarStart = weeks[0]?.firstDay ?? "";
  const visibleMonthLabels = monthLabels.filter(
    (month) => !isBeforeDate(month.firstDay, calendarStart),
  );
  const isUnavailable = state.status === "error";
  const totalLabel =
    data && data.totalContributions === 1
      ? "1 contribution"
      : `${data?.totalContributions ?? 0} contributions`;

  function getClampedTooltipPosition(x: number, y: number) {
    const tooltip = tooltipRef.current;
    const margin = 12;
    const verticalOffset = 8;
    const tooltipWidth = tooltip?.offsetWidth ?? 0;
    const tooltipHeight = tooltip?.offsetHeight ?? 0;
    const minX = margin + tooltipWidth / 2;
    const maxX = window.innerWidth - margin - tooltipWidth / 2;
    const clampedX =
      minX > maxX
        ? window.innerWidth / 2
        : Math.min(Math.max(x, minX), maxX);
    const minY = margin + tooltipHeight + verticalOffset;

    return {
      x: clampedX,
      y: Math.max(y, minY),
    };
  }

  function updateTooltipPosition(tooltipTarget: HTMLElement) {
    if (typeof window === "undefined") {
      return;
    }

    const bounds = tooltipTarget.getBoundingClientRect();
    const nextAnchor = {
      x: bounds.left + bounds.width / 2,
      y: bounds.top,
    };

    lastTooltipAnchorRef.current = nextAnchor;
    setTooltipPosition(getClampedTooltipPosition(nextAnchor.x, nextAnchor.y));
  }

  function clearTooltip() {
    if (!activeTooltipLabelRef.current) {
      return;
    }

    activeTooltipLabelRef.current = null;
    setIsTooltipVisible(false);

    if (tooltipFadeOutTimeoutRef.current) {
      window.clearTimeout(tooltipFadeOutTimeoutRef.current);
    }

    tooltipFadeOutTimeoutRef.current = window.setTimeout(() => {
      tooltipFadeOutTimeoutRef.current = null;
      setActiveTooltipLabel(null);
    }, tooltipFadeOutMs);
  }

  function handleGridPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      clearTooltip();
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      clearTooltip();
      return;
    }

    const tooltipTarget = target.closest<HTMLElement>(
      "[data-heatmap-tooltip]",
    );

    if (!tooltipTarget || !event.currentTarget.contains(tooltipTarget)) {
      clearTooltip();
      return;
    }

    const nextLabel = tooltipTarget.dataset.heatmapTooltip ?? null;

    if (!nextLabel) {
      clearTooltip();
      return;
    }

    updateTooltipPosition(tooltipTarget);

    if (activeTooltipLabelRef.current === nextLabel) {
      return;
    }

    if (tooltipFadeOutTimeoutRef.current) {
      window.clearTimeout(tooltipFadeOutTimeoutRef.current);
      tooltipFadeOutTimeoutRef.current = null;
    }

    activeTooltipLabelRef.current = nextLabel;
    setActiveTooltipLabel(nextLabel);
    setIsTooltipVisible(true);
  }

  useLayoutEffect(() => {
    if (!activeTooltipLabel || typeof window === "undefined") {
      return;
    }

    const { x, y } = lastTooltipAnchorRef.current;
    setTooltipPosition(getClampedTooltipPosition(x, y));
  }, [activeTooltipLabel]);

  return (
    <section
      ref={heatmapRef}
      className="contribution-heatmap"
      aria-labelledby="activity-title"
    >
      <div
        className={`contribution-heatmap__panel${
          isUnavailable ? " contribution-heatmap__panel--unavailable" : ""
        }`}
        style={
          {
            "--heatmap-week-count": weeks.length,
          } as CSSProperties
        }
      >
        <div className="contribution-heatmap__months" aria-hidden="true">
          {visibleMonthLabels.map((month) => (
            <span
              key={`${month.year}-${month.name}-${month.firstDay}`}
              className="contribution-heatmap__month"
              style={{
                gridColumn: `${getWeekOffset(calendarStart, month.firstDay) + 1} / span ${month.totalWeeks}`,
              }}
            >
              {month.name.slice(0, 3)}
            </span>
          ))}
        </div>

        <div className="contribution-heatmap__body">
          <div className="contribution-heatmap__weekdays" aria-hidden="true">
            {weekdayLabels.map((label, index) => (
              <span key={label}>
                {visibleWeekdayIndexes.has(index) ? label : ""}
              </span>
            ))}
          </div>

          <div
            className="contribution-heatmap__grid"
            aria-label={
              data
                ? `${totalLabel} from ${formatDisplayDate(data.from.slice(0, 10))} to ${formatDisplayDate(data.to.slice(0, 10))}`
                : "GitHub contribution heatmap data is not available yet"
            }
            onPointerMove={handleGridPointerMove}
            onPointerOver={handleGridPointerMove}
            onPointerLeave={clearTooltip}
          >
            {weeks.map((week, weekIndex) => (
              <div
                key={week.firstDay || `empty-week-${weekIndex}`}
                className="contribution-heatmap__week"
              >
                {week.contributionDays.map((day) => {
                  const cellKey =
                    day.date || `empty-day-${weekIndex}-${day.weekday}`;
                  const dayLabel = day.date ? getDayLabel(day) : undefined;
                  const dayCell = (
                    <span
                      className="contribution-heatmap__day"
                      data-heatmap-tooltip={dayLabel}
                      style={
                        {
                          "--contribution-color": getContributionColor(
                            day,
                            invertedColorScale,
                          ),
                        } as CSSProperties
                      }
                      aria-label={dayLabel}
                    />
                  );

                  return <Fragment key={cellKey}>{dayCell}</Fragment>;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeTooltipLabel && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={tooltipRef}
              className={`contribution-heatmap__tooltip${
                isTooltipVisible ? " contribution-heatmap__tooltip--visible" : ""
              }`}
              style={
                {
                  "--heatmap-tooltip-x": `${tooltipPosition.x}px`,
                  "--heatmap-tooltip-y": `${tooltipPosition.y}px`,
                } as CSSProperties
              }
              aria-hidden="true"
            >
              {activeTooltipLabel}
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
