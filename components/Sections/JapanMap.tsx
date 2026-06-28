'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const regions = [
  { name: 'Hokkaido', jp: '北海道', tag: 'hokkaido', note: 'Snowfields and the far north' },
  { name: 'Tohoku', jp: '東北', tag: 'tohoku', note: 'Quiet coasts, deep autumn' },
  { name: 'Kanto', jp: '関東', tag: 'tokyo', note: 'Tokyo — where the roads begin' },
  { name: 'Chubu', jp: '中部', tag: 'mountains', note: 'The Alps, Fuji, Kamikochi' },
  { name: 'Kansai', jp: '関西', tag: 'kansai', note: 'Kyoto, Osaka, old capitals' },
  { name: 'Chugoku', jp: '中国', tag: 'countryside', note: 'Shobara and the back roads' },
  { name: 'Shikoku', jp: '四国', tag: 'shikoku', note: 'Pilgrim trails, slow living' },
  { name: 'Kyushu / Okinawa', jp: '九州・沖縄', tag: 'okinawa', note: 'Southern light, island time' },
]

export default function JapanMap() {
  return (
    <section className="bg-paper py-24 dark:bg-midnight md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-widest2 text-ink-muted dark:text-ink-faint">
            Exploring Japan
          </p>
          <h2 className="font-display text-3xl italic text-ink-soft text-balance dark:text-paper md:text-5xl">
            North to South, One Region at a Time
          </h2>
        </motion.div>

        <div className="relative mx-auto max-w-2xl">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-ink/15 dark:bg-paper/15 md:left-1/2" />

          <ol className="space-y-3">
            {regions.map((region, i) => (
              <motion.li
                key={region.tag}
                initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/all?tag=${encodeURIComponent(region.tag)}`}
                  className="group relative flex items-center gap-4 py-4 pl-10 md:pl-0 md:odd:pr-[52%] md:even:pl-[52%]"
                >
                  <span className="absolute left-4 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ember bg-paper transition-transform group-hover:scale-150 dark:bg-midnight md:left-1/2" />
                  <div className="flex w-full items-baseline justify-between gap-3 border-b border-ink/10 pb-3 dark:border-paper/10">
                    <div>
                      <span className="text-base font-medium text-ink-soft transition-colors group-hover:text-ember dark:text-paper">
                        {region.name}
                      </span>
                      <span className="ml-2 font-jp text-sm text-ink-faint">{region.jp}</span>
                    </div>
                    <span className="hidden text-xs text-ink-faint sm:inline">{region.note}</span>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
