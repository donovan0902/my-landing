"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import githubIconBlack from "./assets/GitHub_Invertocat_Black.png";
import githubIconWhite from "./assets/GitHub_Invertocat_White.png";
import "./App.css";

type ProjectDirectory = {
  name: string;
  repoHref?: string;
  siteHref?: string;
  siteLabel?: string;
  description: string;
  demo?:
    | {
        type: "link";
        label: string;
        href: string;
      }
    | {
        type: "embed";
        title: string;
        src: string;
      }
    | {
        type: "text";
        label: string;
      };
  stack: string;
};

const glyphs: Record<string, string[]> = {
  A: [
    "000111000",
    "001111100",
    "011000110",
    "011000110",
    "011000110",
    "011111110",
    "011111110",
    "011000110",
    "011000110",
    "011000110",
    "011000110",
  ],
  D: [
    "111110000",
    "111111000",
    "110001100",
    "110000110",
    "110000110",
    "110000110",
    "110000110",
    "110000110",
    "110001100",
    "111111000",
    "111110000",
  ],
  I: [
    "111111111",
    "111111111",
    "000111000",
    "000111000",
    "000111000",
    "000111000",
    "000111000",
    "000111000",
    "000111000",
    "111111111",
    "111111111",
  ],
  L: [
    "110000000",
    "110000000",
    "110000000",
    "110000000",
    "110000000",
    "110000000",
    "110000000",
    "110000000",
    "110000000",
    "111111111",
    "111111111",
  ],
  N: [
    "110000110",
    "111000110",
    "111100110",
    "111110110",
    "110111110",
    "110011110",
    "110001110",
    "110000110",
    "110000110",
    "110000110",
    "110000110",
  ],
  O: [
    "001111000",
    "011111100",
    "110001110",
    "110000110",
    "110000110",
    "110000110",
    "110000110",
    "110000110",
    "110001110",
    "011111100",
    "001111000",
  ],
  V: [
    "110000110",
    "110000110",
    "110000110",
    "110000110",
    "110000110",
    "110000110",
    "011001100",
    "011001100",
    "001111000",
    "001111000",
    "000110000",
  ],
};

const densityBands = [
  [".", "`", "'", ","],
  [":", ";", "~"],
  ["-", "=", "_"],
  ["+", "*", "x"],
  ["#", "%", "&"],
  ["@", "8", "$", "0", "9"],
] as const;

const name = "DONOVAN LIAO";
const letterGap = " ";
const wordGap = "\n\n";
const targetRowCount = 8;
const animationIntervalMs = 120;
const switchHoldTicks = 4;
const currentContextItems = [
  "Currently an embedded systems test engineer at Honda",
  "I enjoy working at the intersection of product and software",
  "I build in my free time outside of work",
] as const;
const currentContextTypingIntervalMs = 20;
const currentContextTypingStep = 1;
const maxCurrentContextLength = Math.max(
  ...currentContextItems.map((item) => item.length),
);
const themeStorageKey = "theme";
type SocialLink = {
  label: string;
  href: string;
};

const socialLinks: SocialLink[] = [
  {
    label: "github",
    href: "https://github.com/donovan0902",
  },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/donovanliao/",
  },
  {
    label: "music",
    href: "https://www.instagram.com/lonni0503/",
  },
  {
    label: "climb time",
    href: "https://www.instagram.com/switchclimb/",
  },
  {
    label: ":)",
    href: "https://youtu.be/l4whHpf_D1Y?si=A4AvLOpYVPUHWXcW",
  },
] as const;

const projectDirectories: ProjectDirectory[] = [
  {
    name: "surveyhero",
    repoHref: "https://github.com/donovan0902/surveyhero",
    siteHref: "https://surveyhero.vercel.app",
    siteLabel: "Visit surveyhero.vercel.app",
    description:
      "A survey building platform that lets respondents have a conversation with a voice agent instead of filling out a static form. Built with Next.js, Convex, and ElevenLabs. Continuation of SurveyHuman into a fully functioning product.",
    stack: "Next.js, Convex, ElevenLabs, WorkOS",
  },
  {
    name: "garden",
    repoHref: "https://github.com/donovan0902/project-hunt",
    siteHref: "https://projectgarden.dev",
    siteLabel: "Visit projectgarden.dev",
    description:
      "Internal tool-sharing platform for my company. Like Reddit with a sprinkle of Product Hunt and GitHub. 400+ internal users. The link for this project is a public-facing demo with mock data.",
    stack:
      "Next.js, Convex: cloud -> self-hosted with Docker + Nginx on EC2, Vercel -> Amplify, ALB + WAF (network level restriction), NAT Gateway + Private Subnet (self-hosted github runner), AWS RDS Postgres + S3, AWS SES, Clerk -> WorkOS -> Cognito + Entra ID (identity level restriction), Convex Agents",
  },
  {
    name: "surveyhuman",
    repoHref: "https://github.com/donovan0902/survey-human",
    description:
      "Weekend prototype I built after getting frustrated with employee engagement surveys that asked personal questions and reduced the answers to a 1-5 score. Instead of a static form, SurveyHuman uses a voice agent to ask follow-up questions and better understand why people feel the way they do.",
    demo: {
      type: "embed",
      title: "SurveyHuman demo video",
      src: "https://www.youtube.com/embed/SmlRMyXofbA?si=3HIsZLusJiTTDV88",
    },
    stack: "Next.js, Supabase, ElevenLabs",
  },
  {
    name: "qard",
    siteHref: "https://qard.dev",
    siteLabel: "Visit qard.dev",
    description:
      "A mobile app that recommends the best credit card for a purchase based on location and context, with a broader prototype for real-time automatic transaction routing.",
    stack:
      "Flutter + Swift, Expressjs, GCP -> AWS Lambda, Firebase, DynamoDB, Lithic",
  },
  {
    name: "binder",
    siteHref: "https://binderstudio.org",
    siteLabel: "Visit binderstudio.org",
    description:
      "My first real app with users (80+). An agentic lesson planner that turns a single prompt into anything you need to teach your lesson: slides, worksheets, videos, and more. Built on low-level agent framework LangGraph served from a Flask app. Winner of 2025 ShowOHI/O pitch competition. Lesson generation can take a couple minutes; you can watch the demo if you don't feel like waiting.",
    demo: {
      type: "embed",
      title: "Binder demo video",
      src: "https://www.youtube.com/embed/2bw5VEtrB1I?si=qU7Y_mm6ig4PpOGo",
    },
    stack:
      "Next.js, Supabase, Flask, LangGraph, Langsmith, ElevenLabs, Stripe, Heroku",
  },
  {
    name: "pryva",
    description:
      "Started as a hackathon project that we won against 200+ teams. Eventually pivoted into safety and health monitoring platform for senior living, with integrations like Nobi Smart Lamps for fall detection and Nami.ai for motion sensing. Outreached to senior homes in Central Ohio through cold emails, calls, and in-person visits. Built a POC in Angular and Go before shipping an MVP in Bubble. Finalists in the 2024 Ohio State President's Buckeye Accelerator startup pitch competition. Check out the pitch deck:",
    demo: {
      type: "embed",
      title: "Pryva pitch deck",
      src: "/pitch-deck.pdf",
    },
    stack: "Angular, Go, Bubble.io",
  },
  {
    name: "aims",
    repoHref: "https://github.com/omptl1/AIMS",
    description:
      "Won first place in annual Ohio Hackathon with 240+ teams. Developed a program for interior mapping without relying on GPS or maps.",
    stack: "Pillow, gTTS",
  },
  {
    name: "ipfs-share",
    description:
      "Built freshman year of high school so I could share photos and videos with relatives in China who deal with restrictive online censorship. Global file-sharing site built on the IPFS API: users upload to nodes worldwide and get a shareable link for photos and other media.",
    demo: {
      type: "embed",
      title: "IPFS share demo video",
      src: "https://www.youtube.com/embed/q-GvCjngCyw?si=JJw3VQe9-svN9-2p",
    },
    stack: "IPFS",
  },
];

function getPreferredTheme() {
  if (typeof window === "undefined") {
    return true;
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey);

  if (storedTheme === "dark") {
    return true;
  }

  if (storedTheme === "light") {
    return false;
  }

  return true;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getNoiseSeed(
  tick: number,
  rowIndex: number,
  globalOffset: number,
  columnIndex: number,
  wordIndex: number,
) {
  return (
    (Math.imul(tick + 1, 2654435761) ^
      Math.imul(rowIndex + 1, 2246822519) ^
      Math.imul(globalOffset + columnIndex + 1, 3266489917) ^
      Math.imul(wordIndex + 1, 668265263)) >>>
    0
  );
}

function hasFilledPixel(
  glyph: string[],
  rowIndex: number,
  columnIndex: number,
) {
  if (rowIndex < 0 || rowIndex >= glyph.length) {
    return false;
  }

  if (columnIndex < 0 || columnIndex >= glyph[rowIndex].length) {
    return false;
  }

  return glyph[rowIndex][columnIndex] === "1";
}

function countFilledNeighbors(
  glyph: string[],
  rowIndex: number,
  columnIndex: number,
) {
  let count = 0;

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) {
        continue;
      }

      if (
        hasFilledPixel(glyph, rowIndex + rowOffset, columnIndex + columnOffset)
      ) {
        count += 1;
      }
    }
  }

  return count;
}

function getShadeBandIndex(
  glyph: string[],
  rowIndex: number,
  columnIndex: number,
) {
  const filledNeighbors = countFilledNeighbors(glyph, rowIndex, columnIndex);
  const topOpen = Number(!hasFilledPixel(glyph, rowIndex - 1, columnIndex));
  const leftOpen = Number(!hasFilledPixel(glyph, rowIndex, columnIndex - 1));
  const bottomOpen = Number(!hasFilledPixel(glyph, rowIndex + 1, columnIndex));
  const rightOpen = Number(!hasFilledPixel(glyph, rowIndex, columnIndex + 1));
  const lightBias = topOpen + leftOpen - bottomOpen - rightOpen;
  const weightedDensity = Math.max(0, Math.min(8, filledNeighbors - lightBias));

  return Math.round((weightedDensity / 8) * (densityBands.length - 1));
}

function getAnimatedCharacter(
  shadeBandIndex: number,
  tick: number,
  rowIndex: number,
  globalOffset: number,
  columnIndex: number,
  wordIndex: number,
) {
  const pool = densityBands[shadeBandIndex];
  const baseIndex =
    getNoiseSeed(0, rowIndex, globalOffset, columnIndex, wordIndex) %
    pool.length;

  const stateSeed = getNoiseSeed(
    1,
    rowIndex,
    globalOffset,
    columnIndex,
    wordIndex,
  );
  const phaseOffset = stateSeed % (switchHoldTicks * pool.length);
  const stateStep =
    Math.floor((tick + phaseOffset) / switchHoldTicks) % pool.length;

  return pool[(baseIndex + stateStep) % pool.length];
}

function renderWordmark(text: string, tick: number) {
  const words = text.split(" ").filter(Boolean);

  return words
    .map((word, wordIndex) => {
      const rows: string[] = [];
      const sourceRowCount = glyphs[word[0]].length;

      for (let rowIndex = 0; rowIndex < targetRowCount; rowIndex += 1) {
        const sourceRowIndex = Math.round(
          (rowIndex * (sourceRowCount - 1)) / (targetRowCount - 1),
        );

        const line = word
          .split("")
          .map((letter, letterIndex) => {
            const glyph = glyphs[letter];
            const glyphWidth = glyph[sourceRowIndex].length;
            const globalOffset = letterIndex * (glyphWidth + letterGap.length);

            return glyph[sourceRowIndex]
              .split("")
              .map((pixel, columnIndex) => {
                if (pixel === "0") {
                  return " ";
                }

                const shadeBandIndex = getShadeBandIndex(
                  glyph,
                  sourceRowIndex,
                  columnIndex,
                );

                return getAnimatedCharacter(
                  shadeBandIndex,
                  tick,
                  rowIndex,
                  globalOffset,
                  columnIndex,
                  wordIndex,
                );
              })
              .join("");
          })
          .join(letterGap);

        rows.push(line);
      }

      return rows.join("\n");
    })
    .join(wordGap);
}

function App() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [animationTick, setAnimationTick] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [expandedProject, setExpandedProject] = useState("");
  const [revealedContextLength, setRevealedContextLength] = useState(() =>
    shouldReduceMotion ? maxCurrentContextLength : 0,
  );
  const visibleContextLength = shouldReduceMotion
    ? maxCurrentContextLength
    : revealedContextLength;
  const isProjectDirectoryVisible =
    shouldReduceMotion || visibleContextLength >= maxCurrentContextLength;

  const advanceBrush = useEffectEvent(() => {
    startTransition(() => {
      setAnimationTick((tick) => tick + 1);
    });
  });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        setShouldReduceMotion(prefersReducedMotion());
        setIsDark(getPreferredTheme());
      });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      advanceBrush();
    }, animationIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) {
      return undefined;
    }

    if (revealedContextLength >= maxCurrentContextLength) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setRevealedContextLength((currentLength) =>
        Math.min(
          currentLength + currentContextTypingStep,
          maxCurrentContextLength,
        ),
      );
    }, currentContextTypingIntervalMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [revealedContextLength, shouldReduceMotion]);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", isDark);
    window.localStorage.setItem(themeStorageKey, isDark ? "dark" : "light");
  }, [isDark]);

  const asciiName = renderWordmark(name, animationTick);

  return (
    <main className="landing">
      <nav className="social-links" aria-label="Social links">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            className="social-links__link"
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <button
        type="button"
        className="theme-toggle"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={isDark}
        onClick={() => {
          setIsDark((currentTheme) => !currentTheme);
        }}
      >
        <span className="theme-toggle__icon" aria-hidden="true">
          <svg
            viewBox="0 0 28 20"
            className="theme-toggle__glyph"
            role="presentation"
          >
            <rect
              className="theme-toggle__block theme-toggle__block--light"
              x="2"
              y="4"
              width="14"
              height="12"
              rx="3"
            />
            <rect
              className="theme-toggle__overlay theme-toggle__overlay--light"
              x="2"
              y="4"
              width="14"
              height="12"
              rx="3"
            />
            <rect
              className="theme-toggle__block theme-toggle__block--dark"
              x="12"
              y="2"
              width="14"
              height="12"
              rx="3"
            />
            <rect
              className="theme-toggle__overlay theme-toggle__overlay--dark"
              x="12"
              y="2"
              width="14"
              height="12"
              rx="3"
            />
          </svg>
        </span>
      </button>
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title" className="sr-only">
          Donovan Liao
        </h1>
        <div className="hero__left">
          <pre className="name-mark" aria-hidden="true">
            {asciiName}
          </pre>
          <section
            className="current-context"
            aria-labelledby="current-context-title"
          >
            <h2 id="current-context-title" className="sr-only">
              Current context
            </h2>
            <ul className="current-context__list">
              {currentContextItems.map((item) => {
                const isTyping = visibleContextLength < item.length;

                return (
                  <li key={item} className="current-context__item">
                    <span className="sr-only">{item}</span>
                    <span
                      aria-hidden="true"
                      className={`current-context__text${
                        isTyping ? " current-context__text--typing" : ""
                      }`}
                    >
                      {item.slice(0, visibleContextLength)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
          {isProjectDirectoryVisible ? <ContributionHeatmap /> : null}
        </div>
        {isProjectDirectoryVisible ? (
          <div className="project-directory" aria-label="Projects">
            <div className="project-directory__inner">
              <p className="project-directory__label">Projects</p>
              <Accordion
                type="single"
                collapsible
                className="project-directory__list"
                value={expandedProject}
                onValueChange={(projectName) => {
                  setExpandedProject(projectName);
                }}
              >
                {projectDirectories.map((project) => (
                  <AccordionItem
                    key={project.name}
                    value={project.name}
                    className="project-directory__item"
                  >
                    <div className="project-directory__header">
                      <AccordionTrigger className="project-directory__trigger">
                        <span
                          className="project-directory__caret"
                          aria-hidden="true"
                        >
                          {">"}
                        </span>
                        <span className="project-directory__name">
                          {project.name}
                        </span>
                      </AccordionTrigger>
                      {project.siteHref ? (
                        <a
                          className="project-directory__site-link"
                          href={project.siteHref}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={
                            project.siteLabel ?? `Visit ${project.name}`
                          }
                        >
                          <svg
                            className="project-directory__site-icon"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M6 3H13V10"
                              stroke="currentColor"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M13 3L4 12"
                              stroke="currentColor"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M11 13H3V5"
                              stroke="currentColor"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      ) : null}
                      {project.repoHref ? (
                        <a
                          className="project-directory__repo-link"
                          href={project.repoHref}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View ${project.name} repository on GitHub`}
                        >
                          <Image
                            className="project-directory__repo-icon"
                            src={isDark ? githubIconWhite : githubIconBlack}
                            alt=""
                          />
                        </a>
                      ) : null}
                    </div>
                    <AccordionContent className="project-directory__content">
                      <div className="project-directory__panel">
                        <dl className="project-directory__meta">
                          <div className="project-directory__field project-directory__field--description">
                            <dd className="project-directory__field-value project-directory__field-value--description">
                              {project.description}
                            </dd>
                          </div>
                          {project.demo ? (
                            <div className="project-directory__field project-directory__field--demo">
                              <dd className="project-directory__field-value project-directory__field-value--demo">
                                {project.demo.type === "link" ? (
                                  <a
                                    className="project-directory__demo"
                                    href={project.demo.href}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {project.demo.label}
                                  </a>
                                ) : project.demo.type === "embed" ? (
                                  <div className="project-directory__video-shell">
                                    <iframe
                                      className="project-directory__video"
                                      src={project.demo.src}
                                      title={project.demo.title}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      referrerPolicy="strict-origin-when-cross-origin"
                                      allowFullScreen
                                    />
                                  </div>
                                ) : (
                                  <span className="project-directory__demo project-directory__demo--muted">
                                    {project.demo.label}
                                  </span>
                                )}
                              </dd>
                            </div>
                          ) : null}
                          <div className="project-directory__field project-directory__field--stack">
                            <dd className="project-directory__field-value">
                              <ul className="project-directory__stack-list">
                                {project.stack
                                  .split(",")
                                  .map((item) => item.trim())
                                  .filter(Boolean)
                                  .map((item) => (
                                    <li
                                      key={`${project.name}-${item}`}
                                      className="project-directory__stack-item"
                                    >
                                      {item}
                                    </li>
                                  ))}
                              </ul>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default App;
