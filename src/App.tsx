import { startTransition, useEffect, useEffectEvent, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import './App.css'

type ProjectDirectory = {
  name: string
  description: string
  demo:
    | {
        type: 'link'
        label: string
        href: string
      }
    | {
        type: 'embed'
        title: string
        src: string
      }
    | {
        type: 'text'
        label: string
      }
  stack: string
}

const glyphs: Record<string, string[]> = {
  A: [
    '000111000',
    '001111100',
    '011000110',
    '011000110',
    '011000110',
    '011111110',
    '011111110',
    '011000110',
    '011000110',
    '011000110',
    '011000110',
  ],
  D: [
    '111110000',
    '111111000',
    '110001100',
    '110000110',
    '110000110',
    '110000110',
    '110000110',
    '110000110',
    '110001100',
    '111111000',
    '111110000',
  ],
  I: [
    '111111111',
    '111111111',
    '000111000',
    '000111000',
    '000111000',
    '000111000',
    '000111000',
    '000111000',
    '000111000',
    '111111111',
    '111111111',
  ],
  L: [
    '110000000',
    '110000000',
    '110000000',
    '110000000',
    '110000000',
    '110000000',
    '110000000',
    '110000000',
    '110000000',
    '111111111',
    '111111111',
  ],
  N: [
    '110000110',
    '111000110',
    '111100110',
    '111110110',
    '110111110',
    '110011110',
    '110001110',
    '110000110',
    '110000110',
    '110000110',
    '110000110',
  ],
  O: [
    '001111000',
    '011111100',
    '110001110',
    '110000110',
    '110000110',
    '110000110',
    '110000110',
    '110000110',
    '110001110',
    '011111100',
    '001111000',
  ],
  V: [
    '110000110',
    '110000110',
    '110000110',
    '110000110',
    '110000110',
    '110000110',
    '011001100',
    '011001100',
    '001111000',
    '001111000',
    '000110000',
  ],
}

const densityBands = [
  ['.', '`', "'", ','],
  [':', ';', '~'],
  ['-', '=', '_'],
  ['+', '*', 'x'],
  ['#', '%', '&'],
  ['@', '8', '$', '0', '9'],
] as const

const name = 'DONOVAN LIAO'
const letterGap = ' '
const wordGap = '\n\n'
const targetRowCount = 8
const animationIntervalMs = 120
const switchHoldTicks = 4
const themeStorageKey = 'theme'
const projectDirectories: ProjectDirectory[] = [
  {
    name: 'garden',
    description:
      'An internal tool-sharing platform for my company. Like Reddit with a sprinkle of Product Hunt and Github. >150 users internally.',
    demo: {
      type: 'link',
      label: 'projectgarden.dev',
      href: 'https://projectgarden.dev',
    },
    stack:
      'Next.js, Convex: cloud -> self-hosted with Docker + EC2 (with RDS Postgres and S3) + Nginx, Vercel -> Amplify, Clerk -> WorkOS -> Cognito + Entra ID (identity level restriction), ALB + WAF (network level restriction), AWS SES',
  },
  {
    name: 'binder',
    description:
      'An agentic lesson planner that turns a single prompt into anything you need to teach your lesson: slides, worksheets, videos, and more. The video below shows an example of a generated lesson plan.',
    demo: {
      type: 'embed',
      title: 'Binder demo video',
      src: 'https://www.youtube.com/embed/DtywpVV41R4?si=mhtxt9HYMTIzJ3Lu',
    },
    stack: 'Next.js, Supabase, Flask, LangGraph, Heroku',
  },
  {
    name: 'qard',
    description:
      'A mobile app that recommends the best credit card for a purchase based on location and context, with a broader prototype for automatic transaction routing.',
    demo: {
      type: 'link',
      label: 'qard.dev',
      href: 'https://qard.dev',
    },
    stack: 'Flutter, AWS Lambda, DynamoDB, GCP, Lithic',
  },
  {
    name: 'ips-hackathon-mvp',
    description:
      'A first-place hackathon prototype for indoor positioning that combined BLE, magnetometer, and ultrawideband sensor data to solve the Honda Challenge at HackOHI/O.',
    demo: {
      type: 'text',
      label: 'Private / no public demo',
    },
    stack: 'BLE, magnetometer, ultrawideband, MVP prototype',
  },
]

function getPreferredTheme() {
  if (typeof window === 'undefined') {
    return false
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey)

  if (storedTheme === 'dark') {
    return true
  }

  if (storedTheme === 'light') {
    return false
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getNoiseSeed(
  tick: number,
  rowIndex: number,
  globalOffset: number,
  columnIndex: number,
  wordIndex: number,
) {
  return (
    Math.imul(tick + 1, 2654435761) ^
    Math.imul(rowIndex + 1, 2246822519) ^
    Math.imul(globalOffset + columnIndex + 1, 3266489917) ^
    Math.imul(wordIndex + 1, 668265263)
  ) >>> 0
}

function hasFilledPixel(glyph: string[], rowIndex: number, columnIndex: number) {
  if (rowIndex < 0 || rowIndex >= glyph.length) {
    return false
  }

  if (columnIndex < 0 || columnIndex >= glyph[rowIndex].length) {
    return false
  }

  return glyph[rowIndex][columnIndex] === '1'
}

function countFilledNeighbors(
  glyph: string[],
  rowIndex: number,
  columnIndex: number,
) {
  let count = 0

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) {
        continue
      }

      if (hasFilledPixel(glyph, rowIndex + rowOffset, columnIndex + columnOffset)) {
        count += 1
      }
    }
  }

  return count
}

function getShadeBandIndex(glyph: string[], rowIndex: number, columnIndex: number) {
  const filledNeighbors = countFilledNeighbors(glyph, rowIndex, columnIndex)
  const topOpen = Number(!hasFilledPixel(glyph, rowIndex - 1, columnIndex))
  const leftOpen = Number(!hasFilledPixel(glyph, rowIndex, columnIndex - 1))
  const bottomOpen = Number(!hasFilledPixel(glyph, rowIndex + 1, columnIndex))
  const rightOpen = Number(!hasFilledPixel(glyph, rowIndex, columnIndex + 1))
  const lightBias = topOpen + leftOpen - bottomOpen - rightOpen
  const weightedDensity = Math.max(0, Math.min(8, filledNeighbors - lightBias))

  return Math.round((weightedDensity / 8) * (densityBands.length - 1))
}

function getAnimatedCharacter(
  shadeBandIndex: number,
  tick: number,
  rowIndex: number,
  globalOffset: number,
  columnIndex: number,
  wordIndex: number,
) {
  const pool = densityBands[shadeBandIndex]
  const baseIndex =
    getNoiseSeed(0, rowIndex, globalOffset, columnIndex, wordIndex) % pool.length

  const stateSeed = getNoiseSeed(
    1,
    rowIndex,
    globalOffset,
    columnIndex,
    wordIndex,
  )
  const phaseOffset = stateSeed % (switchHoldTicks * pool.length)
  const stateStep = Math.floor((tick + phaseOffset) / switchHoldTicks) % pool.length

  return pool[(baseIndex + stateStep) % pool.length]
}

function renderWordmark(text: string, tick: number) {
  const words = text.split(' ').filter(Boolean)

  return words
    .map((word, wordIndex) => {
      const rows: string[] = []
      const sourceRowCount = glyphs[word[0]].length

      for (let rowIndex = 0; rowIndex < targetRowCount; rowIndex += 1) {
        const sourceRowIndex = Math.round(
          (rowIndex * (sourceRowCount - 1)) / (targetRowCount - 1),
        )

        const line = word
          .split('')
          .map((letter, letterIndex) => {
            const glyph = glyphs[letter]
            const glyphWidth = glyph[sourceRowIndex].length
            const globalOffset = letterIndex * (glyphWidth + letterGap.length)

            return glyph[sourceRowIndex]
              .split('')
              .map((pixel, columnIndex) => {
                if (pixel === '0') {
                  return ' '
                }

                const shadeBandIndex = getShadeBandIndex(
                  glyph,
                  sourceRowIndex,
                  columnIndex,
                )

                return getAnimatedCharacter(
                  shadeBandIndex,
                  tick,
                  rowIndex,
                  globalOffset,
                  columnIndex,
                  wordIndex,
                )
              })
              .join('')
          })
          .join(letterGap)

        rows.push(line)
      }

      return rows.join('\n')
    })
    .join(wordGap)
}

function App() {
  const [animationTick, setAnimationTick] = useState(0)
  const [isDark, setIsDark] = useState(getPreferredTheme)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)

  const advanceBrush = useEffectEvent(() => {
    startTransition(() => {
      setAnimationTick((tick) => tick + 1)
    })
  })

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      advanceBrush()
    }, animationIntervalMs)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle('dark', isDark)
    window.localStorage.setItem(themeStorageKey, isDark ? 'dark' : 'light')
  }, [isDark])

  const asciiName = renderWordmark(name, animationTick)

  return (
    <main className="landing">
      <button
        type="button"
        className="theme-toggle"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
        onClick={() => {
          setIsDark((currentTheme) => !currentTheme)
        }}
      >
        <span className="theme-toggle__icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            className="theme-toggle__glyph"
            role="presentation"
          >
            <circle className="theme-toggle__sun" cx="12" cy="12" r="4.25" />
            <path
              className="theme-toggle__moon"
              d="M14.8 4.7a7.5 7.5 0 1 0 4.5 13.6 8.4 8.4 0 1 1-4.5-13.6Z"
            />
            <g className="theme-toggle__rays">
              <path d="M12 2.25v2.1" />
              <path d="M12 19.65v2.1" />
              <path d="M2.25 12h2.1" />
              <path d="M19.65 12h2.1" />
              <path d="m5.1 5.1 1.48 1.48" />
              <path d="m17.42 17.42 1.48 1.48" />
              <path d="m5.1 18.9 1.48-1.48" />
              <path d="m17.42 6.58 1.48-1.48" />
            </g>
          </svg>
        </span>
      </button>
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title" className="sr-only">
          Donovan Liao
        </h1>
        <pre className="name-mark" aria-hidden="true">{asciiName}</pre>
        <div className="project-directory" aria-label="Projects">
          <p className="project-directory__label">Projects</p>
          <Accordion
            type="single"
            collapsible
            className="project-directory__list"
            value={expandedProject ?? undefined}
            onValueChange={setExpandedProject}
          >
            {projectDirectories.map((project) => (
              <AccordionItem
                key={project.name}
                value={project.name}
                className="project-directory__item"
              >
                <AccordionTrigger className="project-directory__trigger">
                  <span className="project-directory__caret" aria-hidden="true">
                    {'>'}
                  </span>
                  <span className="project-directory__name">{project.name}</span>
                </AccordionTrigger>
                <AccordionContent className="project-directory__content">
                  <div className="project-directory__panel">
                    <dl className="project-directory__meta">
                      <div className="project-directory__field">
                        <dd className="project-directory__field-value">
                          {project.description}
                        </dd>
                      </div>
                      <div className="project-directory__field">
                        <dd className="project-directory__field-value">
                          {project.demo.type === 'link' ? (
                            <a
                              className="project-directory__demo"
                              href={project.demo.href}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {project.demo.label}
                            </a>
                          ) : project.demo.type === 'embed' ? (
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
                      <div className="project-directory__field">
                        <dd className="project-directory__field-value">
                          {project.stack}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
  )
}

export default App
