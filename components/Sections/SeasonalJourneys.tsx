'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const seasons = [
  {
    en: 'Spring',
    jp: '春',
    tag: 'spring',
    image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=900',
    note: 'Cherry blossoms over Nakano, and the year beginning again.',
  },
  {
    en: 'Summer',
    jp: '夏',
    tag: 'summer',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900',
    note: 'Alpine ridgelines, festival nights, and the long climb to Kamikochi.',
  },
  {
    en: 'Autumn',
    jp: '秋',
    tag: 'autumn',
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=900',
    note: 'Momiji season — the countryside turning the colour of embers.',
  },
  {
    en: 'Winter',
    jp: '冬',
    tag: 'winter',
    image: 'https://images.unsplash.com/photo-1517816428104-797678c7cf0c?w=900',
    note: 'Hokkaido snowfields and the quiet of a country asleep.',
  },
]

export default function SeasonalJourneys() {
  return (
    <section className="bg-paper-dim py-24 dark:bg-midnight-surface md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-widest2 text-ink-muted dark:text-ink-faint">
            Seasonal Journeys
          </p>
          <h2 className="font-display text-3xl italic text-ink-soft text-balance dark:text-paper md:text-5xl">
            Four Seasons, One Unknown Road
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {seasons.map((season, i) => (
            <motion.div
              key={season.en}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/all?tag=${encodeURIComponent(season.tag)}`} className="group block">
                <div className="relative mb-4 aspect-[3/4] overflow-hidden">
                  <img
                    src={season.image}
                    alt={season.en}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                  <span className="absolute bottom-4 left-4 font-jp text-3xl text-white">{season.jp}</span>
                </div>
                <h3 className="mb-1 text-lg font-medium text-ink-soft dark:text-paper">{season.en}</h3>
                <p className="text-sm leading-relaxed text-ink-muted dark:text-ink-faint">{season.note}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
