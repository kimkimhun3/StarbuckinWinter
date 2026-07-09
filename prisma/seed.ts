import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  })

  console.log('Admin user created:', admin)

  // "Moments, Captured" starter photos. Fixed ids + upsert make this safe to
  // re-run. Edit or delete these later from /admin/moments.
  const moments = [
    { id: 'seed-vol-06', title: 'Vol.06', coverImage: 'https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg' },
    { id: 'seed-vol-05', title: 'Vol.05', coverImage: 'https://res.cloudinary.com/duvusa8ck/image/upload/v1783438262/IMG_7236_hh2zxf.jpg' },
    { id: 'seed-vol-04', title: 'Vol.04', coverImage: 'https://res.cloudinary.com/duvusa8ck/image/upload/v1783438771/techojpg_qvso1x.jpg' },
    { id: 'seed-vol-03', title: 'Vol.03', coverImage: 'https://res.cloudinary.com/duvusa8ck/image/upload/v1783438276/IMG_7644_mkyuty.jpg' },
    { id: 'seed-vol-02', title: 'Vol.02', coverImage: 'https://res.cloudinary.com/duvusa8ck/image/upload/v1783439055/IMG_4648_fg9ibe.jpg' },
    { id: 'seed-vol-01', title: 'Vol.01', coverImage: 'https://res.cloudinary.com/duvusa8ck/image/upload/v1783438242/IMG_8579_a3oqov.jpg' },
    { id: 'seed-vol-00', title: 'Vol.00', coverImage: 'https://res.cloudinary.com/duvusa8ck/image/upload/v1783439238/okayamacastle_d5tlnz.jpg' },
    { id: 'seed-vol-000', title: 'Vol.000', coverImage: 'https://res.cloudinary.com/duvusa8ck/image/upload/v1783439356/IMG_6933_vjo9li.jpg' },
  ]

  for (let index = 0; index < moments.length; index++) {
    const moment = moments[index]
    await prisma.moment.upsert({
      where: { id: moment.id },
      update: { title: moment.title, coverImage: moment.coverImage, order: index },
      create: {
        id: moment.id,
        title: moment.title,
        coverImage: moment.coverImage,
        order: index,
        published: true,
      },
    })
  }

  console.log(`Seeded ${moments.length} moments`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })