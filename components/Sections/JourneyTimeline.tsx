'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

type Chapter = {
  year: string
  title: string
  titleJp: string
  description: string
  tag: string
}

const chapters: Chapter[] = [
  {
    year: '2021',
    title: 'Arrival',
    titleJp: 'とうちゃく',
    description: 'Landing in Tokyo with a backpack, a laptop, and no idea how deep the roads would go.',
    tag: 'tokyo',
  },
  {
    year: '2022',
    title: 'The Mountains',
    titleJp: 'やま',
    description: 'Trading the office chair for crampons — Fuji, the Japan Alps, and the quiet above the clouds.',
    tag: 'mountains',
  },
  {
    year: '2023',
    title: 'Unknown Roads',
    titleJp: 'しらないみち',
    description: 'Chasing the towns that don’t appear in guidebooks — Shobara, Kanazawa, the back roads of Tohoku.',
    tag: 'countryside',
  },
  {
    year: '2024',
    title: 'Through the Lens',
    titleJp: 'レンズをとおして',
    description: 'Photography becomes the language — documenting seasons instead of just visiting them.',
    tag: 'photography',
  },
  {
    year: '2025',
    title: 'Still Walking',
    titleJp: 'まだあるく',
    description: 'The journey keeps writing itself, one prefecture, one season, one unknown road at a time.',
    tag: 'journal',
  },
]

export default function JourneyTimeline() {
  return (
    <section className="relative bg-paper py-24 dark:bg-midnight md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center md:mb-24"
        >
          <p className="mb-3 text-xs uppercase tracking-widest2 text-ink-muted dark:text-ink-faint">
            The Timeline
          </p>
          <h2 className="font-display text-3xl italic text-ink-soft text-balance dark:text-paper md:text-5xl">
            A Life Documented, Year by Year
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[28px] top-0 hidden h-full w-px bg-ink/15 dark:bg-paper/15 md:block" />

          <ol className="space-y-12 md:space-y-20">
            {chapters.map((chapter, i) => (
              <motion.li
                key={chapter.year}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col gap-4 md:flex-row md:items-baseline md:gap-10 md:pl-[72px]"
              >
                <div className="absolute left-0 hidden h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-ember bg-paper dark:bg-midnight md:block" style={{ left: '28px' }} />

                <span className="font-display text-2xl italic text-ember md:w-20 md:flex-shrink-0 md:text-3xl">
                  {chapter.year}
                </span>

                <div className="max-w-2xl">
                  <div className="mb-2 flex items-baseline gap-3">
                    <h3 className="text-xl font-medium text-ink-soft dark:text-paper md:text-2xl">
                      {chapter.title}
                    </h3>
                    <span className="font-jp text-sm text-ink-faint">{chapter.titleJp}</span>
                  </div>
                  <p className="leading-relaxed text-ink-muted dark:text-ink-faint">
                    {chapter.description}
                  </p>
                  <Link
                    href={`/all?tag=${encodeURIComponent(chapter.tag)}`}
                    className="mt-3 inline-block border-b border-ink-soft/40 pb-0.5 text-xs uppercase tracking-wide text-ink-soft transition-colors hover:border-ember hover:text-ember dark:border-paper/30 dark:text-paper"
                  >
                    Read this chapter
                  </Link>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
