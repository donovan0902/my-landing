import { startTransition, useEffect, useEffectEvent, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import githubIconBlack from './assets/GitHub_Invertocat_Black.png'
import githubIconWhite from './assets/GitHub_Invertocat_White.png'
import linkedInIconBlack from './assets/InBug-Black.png'
import linkedInIconWhite from './assets/InBug-White.png'
import './App.css'

type ProjectDirectory = {
  name: string
  repoHref?: string
  description: string
  descriptionSuffixLink?: {
    label: string
    href: string
  }
  demo?:
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
type SocialLink =
  | {
      label: string
      href: string
      kind: 'image'
      lightIcon: string
      darkIcon: string
    }
  | {
      label: string
      href: string
      kind: 'smiley'
    }

const socialLinks: SocialLink[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/donovanliao/',
    kind: 'image',
    lightIcon: linkedInIconBlack,
    darkIcon: linkedInIconWhite,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/donovan0902',
    kind: 'image',
    lightIcon: githubIconBlack,
    darkIcon: githubIconWhite,
  },
  {
    label: 'Climbing video',
    href: 'https://youtu.be/l4whHpf_D1Y?si=A4AvLOpYVPUHWXcW',
    kind: 'smiley',
  },
] as const

const projectDirectories: ProjectDirectory[] = [
  {
    name: 'garden',
    repoHref: 'https://github.com/donovan0902/project-hunt',
    description:
      'Internal tool-sharing platform for my company. Like Reddit with a sprinkle of Product Hunt and Github. >150 users internally. Public facing demo w/mock data:',
    descriptionSuffixLink: {
      label: 'projectgarden.dev',
      href: 'https://projectgarden.dev',
    },
    stack:
      'Next.js, Convex: cloud -> self-hosted with Docker + Nginx on EC2, Vercel -> Amplify, ALB + WAF (network level restriction), Clerk -> WorkOS -> Cognito + Entra ID (identity level restriction), AWS RDS Postgres + S3, AWS SES, Convex Agents',
  },
  {
    name: 'surveyhuman',
    repoHref: 'https://github.com/donovan0902/survey-human',
    description:
      'Weekend prototype I built after getting frustrated with employee engagement surveys that asked personal questions and reduced the answers to a 1-5 score. Instead of a static form, SurveyHuman uses a voice agent to ask follow-up questions and better understand why people feel the way they do.',
    demo: {
      type: 'embed',
      title: 'SurveyHuman demo video',
      src: 'https://www.youtube.com/embed/SmlRMyXofbA?si=X1heZfixy2k2x2-1',
    },
    stack: 'Next.js, Supabase, ElevenLabs',
  },
  {
    name: 'qard',
    description:
      'A mobile app that recommends the best credit card for a purchase based on location and context, with a broader prototype for real-time automatic transaction routing.',
    descriptionSuffixLink: {
      label: 'qard.dev',
      href: 'https://qard.dev',
    },
    stack: 'Flutter + Swift, GCP -> AWS Lambda, Firebase, DynamoDB, Lithic',
  },
  {
    name: 'binder',
    description:
      'An agentic lesson planner that turns a single prompt into anything you need to teach your lesson: slides, worksheets, videos, and more.',
    demo: {
      type: 'embed',
      title: 'Binder demo video',
      src: 'https://www.youtube.com/embed/DtywpVV41R4?si=mhtxt9HYMTIzJ3Lu',
    },
    stack: 'Next.js, Supabase, Flask, LangGraph, ElevenLabs, Heroku',
  },
  {
    name: 'pryva',
    description:
      'Started as a hackathon project that we won against 200+ teams. Eventually pivoted into safety and health monitoring platform for senior living, with integrations like Nobi Smart Lamps for fall detection and Nami.ai for motion sensing. Outreached to senior homes in Central Ohio through cold emails, calls, and in-person visits. Built a POC in Angular and Go before shipping an MVP in Bubble. Finalists in the 2024 Ohio State President\'s Buckeye Accelerator startup pitch competition.',
    stack: 'Angular, Go, Bubble.io',
  },
  {
    name: 'ipfs-share',
    description:
      'Built freshman year of high school so I could share photos and videos with relatives in China who deal with restrictive online censorship: global file-sharing site built on the IPFS API: users upload to nodes worldwide and get a shareable link for photos and other media.',
    demo: {
      type: 'embed',
      title: 'IPFS share demo video',
      src: 'https://www.youtube.com/embed/q-GvCjngCyw?si=IslCpntt3NKFg3ox',
    },
    stack: 'IPFS',
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
            {link.kind === 'image' ? (
              <img
                className="social-links__icon"
                src={isDark ? link.darkIcon : link.lightIcon}
                alt=""
              />
            ) : (
              <svg
                className="social-links__icon social-links__icon--smiley"
                viewBox="0 0 20 20"
                aria-hidden="true"
                role="presentation"
              >
                <circle
                  className="social-links__smiley-face"
                  cx="10"
                  cy="10"
                  r="9"
                />
                <circle
                  className="social-links__smiley-eye"
                  cx="7.1"
                  cy="8.4"
                  r="1"
                />
                <circle
                  className="social-links__smiley-eye"
                  cx="12.9"
                  cy="8.4"
                  r="1"
                />
                <path
                  className="social-links__smiley-mouth"
                  d="M6.7 11.5c.78 1.68 1.9 2.52 3.3 2.52s2.52-.84 3.3-2.52"
                />
              </svg>
            )}
          </a>
        ))}
      </nav>
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
              className="theme-toggle__block theme-toggle__block--dark"
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
                <div className="project-directory__header">
                  <AccordionTrigger className="project-directory__trigger">
                    <span className="project-directory__caret" aria-hidden="true">
                      {'>'}
                    </span>
                    <span className="project-directory__name">{project.name}</span>
                  </AccordionTrigger>
                  {project.repoHref ? (
                    <a
                      className="project-directory__repo-link"
                      href={project.repoHref}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View ${project.name} repository on GitHub`}
                    >
                      <img
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
                          {project.descriptionSuffixLink ? (
                            <>
                              {' '}
                              <a
                                className="project-directory__description-suffix-link"
                                href={project.descriptionSuffixLink.href}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {project.descriptionSuffixLink.label}
                              </a>
                            </>
                          ) : null}
                        </dd>
                      </div>
                      {project.demo ? (
                        <div className="project-directory__field project-directory__field--demo">
                          <dd className="project-directory__field-value project-directory__field-value--demo">
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
                                  width="560" 
                                  height="315" 
                                  src="https://www.youtube.com/embed/2bw5VEtrB1I?si=0spXcA5GNt3qmCAN" 
                                  title="YouTube video player" 
                                  frameborder="0" 
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                  referrerpolicy="strict-origin-when-cross-origin" 
                                  allowfullscreen>
                                </iframe>
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
                              .split(',')
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
        <section
          className="current-context"
          aria-labelledby="current-context-title"
        >
          <h2 id="current-context-title" className="sr-only">
            Current context
          </h2>
          <ul className="current-context__list">
            <li className="current-context__item">
              Currently implementing agentic automations for embedded systems
              testing/simulation at Honda
            </li>
            <li className="current-context__item">
              I like working at the intersection of product and software.
            </li>
            <li className="current-context__item">
              I build in my free time outside of work.
            </li>
          </ul>
        </section>
      </section>
    </main>
  )
}

export default App
