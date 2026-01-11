--
-- PostgreSQL database dump
--

\restrict 5UirSHrL6CLHJBc3Xzruswk3AVgWGKDsaPOYhTEXiyWQ1bZxzrwmf5c4LVMePh6

-- Dumped from database version 15.14 (Homebrew)
-- Dumped by pg_dump version 15.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Comment" (
    id text NOT NULL,
    content text NOT NULL,
    "authorId" text NOT NULL,
    "postId" text NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Post" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    "coverImage" text,
    published boolean DEFAULT false NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "authorName" text,
    "loveCount" integer DEFAULT 0 NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    tags text[]
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Comment" (id, content, "authorId", "postId", approved, "createdAt", "updatedAt") FROM stdin;
cmicx9ni60003htlertcxm9vx	Thank you for reading! I hope you enjoy your trip too!	cmicvkyi10000sjdst4ksys5i	cmicvtz4y000127bwff3yscef	t	2025-11-24 09:06:03.966	2025-11-24 09:06:03.966
cmicx75uu0001htle97ubzn4q	Great post! I also visited Tokyo last year and loved it!	cmicvjb4w00008b62s9z5pzeg	cmicvtz4y000127bwff3yscef	t	2025-11-24 09:04:07.783	2025-11-24 09:11:31.665
cmicywgc70003w98nmtgkwfs8	Great post! I also visited Tokyo last year and loved it!	cmicvjb4w00008b62s9z5pzeg	cmicyudee0001w98njltzksfy	f	2025-11-24 09:51:47.384	2025-11-24 09:51:47.384
cmicyyfaf0005w98n7gruovwo	First!	cmicvjb4w00008b62s9z5pzeg	cmicyudee0001w98njltzksfy	f	2025-11-24 09:53:19.336	2025-11-24 09:53:19.336
cmicyyjir0007w98na1ptwf7y	Second!	cmicvjb4w00008b62s9z5pzeg	cmicyudee0001w98njltzksfy	f	2025-11-24 09:53:24.819	2025-11-24 09:53:24.819
cmid2z19n00015407fbsnlup7	HEY	cmicvkyi10000sjdst4ksys5i	cmiczu2tt0001n6opwrm689vn	t	2025-11-24 11:45:46.283	2025-11-24 11:45:46.283
cmid310ru00055407sx9dpwnu	Hui gaming	cmicvjb4w00008b62s9z5pzeg	cmicw653c000727bwwgdihtdx	t	2025-11-24 11:47:18.955	2025-11-24 11:47:28.313
cmid30git00035407v9a6707g	HEY	cmicvjb4w00008b62s9z5pzeg	cmicw653c000727bwwgdihtdx	t	2025-11-24 11:46:52.709	2025-11-24 11:47:29.57
cmilih4ky0001hkjbg99ve9xe	hi\n	cmicvkyi10000sjdst4ksys5i	cmicw653c000727bwwgdihtdx	t	2025-11-30 09:21:54.034	2025-11-30 09:21:54.034
cmitv5q2r0003v62qhkw7d8pd	Hello world	cmicvkyi10000sjdst4ksys5i	cmitv2d3c0001v62quv3aj5jm	t	2025-12-06 05:39:06.436	2025-12-06 05:39:06.436
cmitw1iu60005v62qm9x7r52x	Summer Break!	cmicvkyi10000sjdst4ksys5i	cmicyudee0001w98njltzksfy	t	2025-12-06 06:03:50.047	2025-12-06 06:03:50.047
cmjwi7ulx00011v01woe9ucyh	HEYHEY	cmicvkyi10000sjdst4ksys5i	cmicw653c000727bwwgdihtdx	t	2026-01-02 06:39:51.477	2026-01-02 06:39:51.477
cmid9oiww000754071x00abj4	jjjjjjj	cmicvjb4w00008b62s9z5pzeg	cmicvtz4y000127bwff3yscef	t	2025-11-24 14:53:33.248	2026-01-02 06:48:22.396
cmjwj0bv500041v01jfthiagb	I love you so!	cmjwiseot00021v01fdrtfvdm	cmicvza67000327bwpuakg2ts	t	2026-01-02 07:02:00.21	2026-01-02 07:02:49.004
cmjwj4q6r00071v01j151bhvx	Kyoto is crazy!	cmjwj3zl100051v01xxxaoxa4	cmicvza67000327bwpuakg2ts	t	2026-01-02 07:05:25.396	2026-01-02 07:05:51.196
cmjwl4yvy000a1v019zcghefp	I love you so!	cmjwl4onk00081v01tmrb03ny	cmiczu2tt0001n6opwrm689vn	t	2026-01-02 08:01:35.902	2026-01-02 08:02:19.14
cmjwozmj1000f1v01w6xo4mme	すごいいいいい！	cmjwozcss000d1v018jjsfzmk	cmjwldu53000c1v01gaax44zg	t	2026-01-02 09:49:25.069	2026-01-02 09:49:38.49
cmjxv0pwr00018vgerp1gdbxb	How's going man?	cmicvkyi10000sjdst4ksys5i	cmjx1i9lo0001pdwhlfuvo8zr	t	2026-01-03 05:25:59.979	2026-01-03 05:25:59.979
cmjy2x8ek0001r8e1babedp1c	Tell me you are rich without tell me you are rich!	cmicvkyi10000sjdst4ksys5i	cmitv2d3c0001v62quv3aj5jm	t	2026-01-03 09:07:14.252	2026-01-03 09:07:14.252
cmjy9wjni0002mu9rdcm38zrw	Fill your cup with joy!	cmjy9w53v0000mu9rwo5uez2y	cmiczu2tt0001n6opwrm689vn	t	2026-01-03 12:22:39.486	2026-01-03 12:22:53.736
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Post" (id, title, slug, content, excerpt, "coverImage", published, "authorId", "createdAt", "updatedAt", "publishedAt", "authorName", "loveCount", "viewCount", tags) FROM stdin;
cmicw653c000727bwwgdihtdx	A summer escape to Fukuoka. Lively streets, gentle moments.	my-first-trip-to-osaka-1763973320519	# A Spontaneous Summer in Kyushu: Fukuoka, Kitakyushu & Kumamoto\n\nThis summer, I took another **solo** and totally **unplanned** trip—kind of like my journey to Kagawa. Maybe it's because no one really gets me (lol), so I just decided to travel alone again. No real schedule, no stress, just vibes.\n\nThe destination this time: **Kyushu**, starting from **Fukuoka**, up to **Kitakyushu**, then down to **Kumamoto**, and eventually to **Kagoshima**. But let’s save Kagoshima for the next post.\n\n## The Night Before – From Office Desk to Airport Bench\n\nThe trip began on **Friday, July 18**. Right after work, I rushed from my office in Saitama to **Narita Airport**. My flight was at 5:00 AM the next morning, so I had no choice but to spend the night at the airport. It wasn’t exactly glamorous, but hey—it’s part of the solo adventure package.\n\nI was tired, but excited. I knew this trip had no structure, just the idea of meeting a friend in Kagoshima at the end. Everything else? Freestyle.\n\nThat night at the airport, I met a guy whose flight to Osaka got canceled. I helped him look up other flights, and we ended up talking for a while.\n\nLater, I met another guy on the same flight as me to Fukuoka. He was kind and friendly, and just like that, I made a new Japanese friend. Half-awake, I switched between guessing words and helping out, but it turned into a fun chat. It was a great way to start a trip—speaking Japanese with strangers in an empty airport at 1 AM.\n\n## Welcome to Fukuoka – And Then Immediately Gone\n\nI landed in **Fukuoka** early in the morning. First mission: throw my luggage into a locker at **Hakata Station**. Traveling light always feels better.\n\nWithout wasting time, I hopped on a **Shinkansen to Kitakyushu**.\n\n## Kitakyushu – Castles, Bridges, and Good Weather\n\nThe Shinkansen was fast, and the weather in **Kitakyushu** was surprisingly good—slightly cloudy, a bit of rain, but not too hot. Honestly, perfect for walking.\n\nI visited **Kokura Castle**, one of the area’s most iconic landmarks. The view from the grounds was peaceful, with the river flowing nearby and lots of greenery. I went inside the castle, bought an **omamori** (I’m slowly collecting these), and took my time enjoying the quiet atmosphere.\n\nAfter that, I wandered along the riverside and eventually reached the **Wakato Bridge**. The view there was amazing—one of those places where you just want to sit for a while and do nothing.\n\nI had lunch nearby, and by mid-afternoon, I was on my way back to Fukuoka.\n\n## Fukuoka Nights – Towers, Rain, and Street Food\n\nOnce I returned to Fukuoka, I checked into my **dorm-style hostel**. It was lively—people from all over the world staying there. Before the night fully kicked in, I headed out to **Fukuoka Tower**.\n\nNext stop: **Nakasu**. The area was full of lights, food stalls, and the sound of people laughing and eating under umbrellas. I grabbed some **street food** and a **cold beer** from one of the stalls. It started to rain a little, but in a good way. The drizzle gave everything a soft glow. Somehow, it felt cinematic.\n\nLater, I went downtown for a warm bowl of **udon**, then picked up a few more drinks and returned to the hostel. That’s when the real fun started.\n\n## International Dorm Party – 2AM Chats and Beer\n\nThe hostel common area turned into an accidental party. There were travelers from **Korea, Japan, the U.S., Russia**, and me—the only **Khmer** guy in the room. We shared drinks, travel stories, and random jokes in mixed languages.\n\nWe drank until **2:00 AM** before finally crashing into bed. It was one of those nights where nobody planned to hang out—but somehow, it just happened.\n\n## Kumamoto – Hot, but Worth It\n\nThe next morning, I took the **Shinkansen from Hakata to Kumamoto**. The heat hit me immediately—**Kumamoto was hot**. Like, seriously summer-level hot.\n\nBut I had missions to complete. First stop: the **Luffy statue** in the city center, part of a project to honor the *One Piece* creator from Kumamoto. I’m not a huge fan, but I had to see it.\n\nThen, I headed to **Kumamoto Castle**. It was huge, beautiful, and full of history. I picked up another **omamori**. I don’t even know why I keep buying them, but they feel like a tiny piece of each place I visit.\n\nIn the evening, I found myself at a local bar again—yes, drinking again. I don’t know why I always end up drinking on these trips, but maybe that’s part of the fun.\n\nLater that night, I caught the train to **Kagoshima**, ready to visit my friend and start the second half of this Kyushu adventure.\n\n## Wrapping Up the First Half of Kyushu\n\nThis part of the trip—**Fukuoka, Kitakyushu, and Kumamoto**—was everything I wanted: unplanned, relaxed, and full of little moments that made it feel real. No schedule. No pressure. Just me, the road, and wherever the next train took me.\n	An amazing adventure in Tokyo with cherry blossoms and great food!	https://travelwithminh.com/wp-content/uploads/2023/10/Kamikochi2023_10_29_09_17_DSCF0805.jpg	t	cmicvkyi10000sjdst4ksys5i	2025-11-24 08:35:20.52	2026-01-11 07:27:19.445	2025-11-24 09:48:44.987	Starbucks	1	12	\N
cmje2t7ra0001pga9m1y4dekm	Mt. Gassan wrapped in silence and sky. Where breath slows and thoughts become clear.	mt-gassan-1766221723267	# A Winter Ski Adventure at Ryuoo Ski Park\n\nOn **January 27, 2024**, I went on a ski trip to **Ryuoo Ski Park** in Nagano with my friend. It was a **one-day trip**, meaning we left in the morning and returned in the evening. We took a **highway bus** from **Tokyo** (Shinjuku station) to **Ryuoo**, and we had booked everything in advance—a week before the trip. This included our **ski clothes, snowboard, and bus tickets**.\n\n\n\n## Arriving at Ryuoo Ski Park\n\nWe left Tokyo at around 11 PM, and after a long bus ride, we finally arrived at Ryuoo Ski Park around 6 AM. The first thing we did was pick up our pre-booked snowboard, gloves, clothes, hat, and glasses. Once we got changed and ready, we grabbed some breakfast and took a 30-minute rest before heading to the slopes to start skiing.\n\n\nHowever, when we got to the ski rentals, we encountered a problem. The ski park only accepted cash and did not take credit cards, which was an issue because we didn’t have enough cash on hand. My Japanese was limited, but I decided to ask a kind Japanese man if he could help us exchange some money. We explained our situation, and he offered to help us. He suggested we transfer the amount via LINE Pay, and he would give us the cash in return. It was a bit of a stressful situation, but this gentleman’s kindness really saved us. We were finally able to get the cash and continue with our plans.\n## A Challenge with Skiing for the First Time\n\nIt was my **first time skiing**, and I had no experience. I wasn’t very good at snowboarding, and I fell down many times. Watching other skiers glide effortlessly made me feel a little nervous, but I was determined to keep going. The park was set on the mountain, with many **different ski slopes** to choose from. It took me a while to get used to snowboarding, but even though it was tough, I really enjoyed the challenge and the thrill of the experience.\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Tateyama" width="400" />\n\n## A Cold Afternoon and a Strange Drink Choice\n\nIn the afternoon, we went to the top of the mountain to enjoy some food. The temperature was around **-3°C**, which made the whole experience feel even more wintery. Despite the cold, I ordered my usual **iced latte**—yes, even at **-3°C**. I got some strange looks from the other skiers, but it was worth it for me!\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Tateyama" width="200" />\n\nWe also had **curry** for the first time in Japan, even though I wasn’t a big fan of curry. My friend recommended it, so I gave it a try—and I was surprised! It turned out to be delicious, and it was the perfect way to warm up in the freezing temperatures.\n\nAt this place, we also ran into the **man who helped us with the cash exchange issue** earlier. We had a nice chat with him, and it felt great to thank him in person for his kindness. It made the whole experience even more memorable.\n\n\n## Skiing in the Snow and Meeting Other Skilled Skiers\n\nAfter lunch, we went to a special area reserved for **advanced skiers**. It was impressive to watch people navigate those slopes with such skill. Everyone looked really good at it! We were amazed by their ability to master the difficult routes.\n\nOn our way back down, it was still very cold, but the snow was falling gently, and it felt magical to ski through the snowflakes. The whole atmosphere of being on the mountain surrounded by nature was something I’ll never forget.\n\n## A Surprise Encounter\n\nAt around **4 PM**, we headed to the bus station to begin our journey back to **Tokyo**. But something surprising happened during the highway bus ride. When the bus made a stop at another station, I accidentally ran into some friends who had gone skiing to a different location in **Nagano**—they were in **Hakuba**, while I was at Ryuoo! It was an amazing coincidence. We chatted for a bit and decided to have some **chicken** together before continuing our separate ways.\n\n\n## Returning to Tokyo\n\nFinally, we arrived in **Tokyo** around **9 PM**, and to top off the day, we had some **ramen** in Tokyo. It was a great way to end a day full of skiing, snow, and good memories.\n\n## A Memorable Experience\n\nThis trip to **Ryuoo Ski Park** was my first time skiing, and it was an experience I will always cherish. From the challenge of snowboarding to the beautiful winter views and the kindness of strangers, it made for a day filled with excitement and new experiences.	Mount Haguro, Mount Gassan and Mount Yudono, known as 	https://www.japan-guide.com/g21/7903_11.jpg	t	cmicvkyi10000sjdst4ksys5i	2025-12-20 09:08:43.269	2026-01-11 08:05:44.788	2025-12-21 07:55:27.954	ネズミ	1	13	{Mountain,Hiking}
cmitv2d3c0001v62quv3aj5jm	Mount Fuji stood quiet against the sky. A moment so still, it felt eternal. 	starbuck-today-1764999389637	# Tokyo Revenger\n\n### Fck Starbuck\n\n\n![BKK](https://theicedcoffee.com/wp-content/uploads/2025/07/p197-1.webp)	Mount Fuji is made up of four mountains	https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600	t	cmicvkyi10000sjdst4ksys5i	2025-12-06 05:36:29.639	2026-01-03 06:30:43.47	2025-12-06 05:36:29.637	\N	0	0	\N
cmicyudee0001w98njltzksfy	I used to be scared of Kanji, unable to read them for years, until I did this...	takasaki-trip-1763977810259	```python\nprint("Hello World")\n```\n* HEY\n* B\n![Tokyo](https://www.shutterstock.com/image-photo/travel-landscape-tokyo-tower-japan-600nw-2651661787.jpg)\n\n\nGALA Yuzawa has a unique setup with the main ski area high up on the mountain. We took a 15-minute ropeway ride to reach it, surrounded by a breathtaking, snowy landscape. It was a thrilling experience but extremely cold—yet it added to the excitement of the day.\n\n![](https://www.animationmagazine.net/wordpress/wp-content/uploads/Frieren-Beyond-Journeys-End-S2_EP02_130.jpg)\n\n> HEY\n\n![](https://static0.srcdn.com/wordpress/wp-content/uploads/2023/10/the-main-cast-of-frieren.jpg)	I will never fall in love again, until I found you.!	https://res.cloudinary.com/duvusa8ck/image/upload/v1767367635/Photographer-Oskar-Krawczyk-Japanese-Streets-1_qcewou.jpg	t	cmicvkyi10000sjdst4ksys5i	2025-11-24 09:50:10.261	2026-01-02 15:27:44.451	2025-11-24 09:50:10.26	\N	0	0	\N
cmjwldu53000c1v01gaax44zg	Warm udon, gentle Kagawa days. Simple flavors, deep comfort.	takahasi-san-mountant-1767341309652	\n# My First Trip to Kagawa – A Memorable Farewell 😭\n\n## A Sudden Plan ⚡️\n\nThis trip to Kagawa wasn't planned at all. One night, after drinking a little, during a video call with my friends, I booked a flight without thinking too much. Two of my friends were living in Kagawa, and somehow, it felt like the right time to visit. Maybe it was the alcohol, or maybe it was my heart telling me to go. Either way, I decided to take a short solo trip before they left Japan. It turned out to be one of the best decisions I've made.\n\n## First Day – Arrival in Takamatsu 🍻\n\nI flew from Narita to Sanuki Airport in Kagawa. When I arrived, my friend was already waiting to pick me up. We headed straight to Takamatsu City. That evening was simple but perfect. We ate our first bowl of Kagawa udon and enjoyed drinks together. Just like that, my unexpected journey began.\n\n## Exploring Takamatsu 🧭\n\nOn the second day, we explored more of Takamatsu City. We visited Ritsurin Park, which was peaceful and beautiful. Again, we had more udon. It became a daily thing. Thanks to my friend's car, getting around was easy and fun. We ended the day with drinks and laughter.\n\n## Handmade Udon and Mountain Views 🍜⛰\n\nThe third day was special. We went to try handmade udon. It was soft, fresh, and much cheaper than udon in Tokyo. I loved it. After that, we drove up a mountain where we could see the whole city from above. The view was amazing, but it was really cold. It was December, after all. That night, we made Cambodian food together, drank, and shared stories.\n\n## A Trip to Shodoshima Island 🏝️⛴️\n\nOn the fourth day, we took a speed boat and ferry to Shodoshima, a small island known for olives. The ocean view was stunning. I tried tororo udon there and it only cost 500 yen. The island felt calm and full of nature. After the trip, we came back home and yes, more drinks.\n\n## Road Trip to Okayama 🌉🏯\n\nThe fifth day was a road trip from Kagawa to Okayama. We drove across the Seto Ohashi Bridge. The view was beautiful but the wind was strong, so we had to drive carefully. In Okayama, I finally took a break from udon and ate ramen instead. We visited Okayama Castle and took photos. That night was New Year's Eve, so we celebrated the countdown with BBQ and drinks in Kagawa.\n\nOn the way back home, we actually got a little lost. For a moment, we weren't sure which road to take. But that didn't worry us too much. We laughed about it, turned around, and eventually found our way back by taking the same route we came from. It made the drive even more memorable. Sometimes getting lost is just part of the fun.\n\n## A Lazy Day In 🤪\n\nAfter all the adventures, we took it easy on the sixth day. We stayed home, played games, and watched anime. It was nice to just relax with friends. Sometimes, those quiet days are the most memorable.\n\nOne of the anime we watched that day was *Grave of the Fireflies*. It was a heavy and emotional story. By the end of it, one of my friends cried. The movie touched all of us deeply, and in that quiet moment, we felt something more than just entertainment—it was a reminder of the pain and beauty in life. That day, we didn't need to go anywhere. Being together was enough.\n\n## The Farewell 👋🥹\n\nThe final day was hard. My two friends were flying back to Cambodia, and we all knew it might be a long time before we'd meet again. In the early morning, we took the first train to Takamatsu City together. At the station, we split up. They took a bus to Kansai Airport, and I took another bus to Kobe, alone.\n\nAfter that, I stopped by Kyoto. I walked through the streets by myself, ate some good food, took quiet photos, and had a drink in silence. The excitement of the trip was over, but something deeper stayed with me. That day felt like the end of a chapter not just in travel, but in friendship, in life in Japan. It was emotional, but beautiful too.\n\n## Final Thoughts 💭😉\n\nThis trip was unexpected, but unforgettable. I didn't have a plan. I just followed a feeling and it led me to one of the most meaningful experiences I've ever had in Japan. It reminded me how much joy comes from simple things: eating good food, laughing with friends, sharing a car ride, or watching the view from a quiet mountain.\n\nIf you ever go to Kagawa, I really recommend trying handmade udon (手打ちうどん). It's soft, fresh, and full of local flavor. Visit the mountains, ride the ferry, and slow down.\n\n**Sometimes, the most unforgettable journeys are the ones we never plan.**  \n**This trip was more than just travel, it was a final goodbye to two friends, and a quiet, personal thank you to Japan.**\n	An amazing adventure in Tokyo with cherry blossoms and great food!	https://www.snowmonkeyresorts.com/wp-content/uploads/2017/10/4757308_m-2.jpg	t	cmicvkyi10000sjdst4ksys5i	2026-01-02 08:08:29.655	2026-01-11 08:13:57.983	2026-01-02 08:08:29.652	Kimhun	0	5	{Udon,Farewell,Kagawa}
cmiczu2tt0001n6opwrm689vn	Autumn in Matsumoto, painted in quiet reds and golds. Cool air, slow steps, and memories falling like leaves.	kagawa-1763979476174	\n# A Winter Adventure at GALA Yuzawa\n\nOn February 23, my friend and I set off on our second ski adventure, this time to GALA Yuzawa in Niigata, Japan. After our first ski trip to Ryuoo Ski Park, we were excited to hit the slopes again and enjoy the snowy mountains.\n\n## Journey to Yuzawa\n\nWe began our trip by taking the JR Line from Takasaki Station to Yuzawa Station, a scenic two-hour journey. The experience of traveling through a dark tunnel only to emerge into a snow-covered wonderland was magical—like crossing into a new world filled with fresh snow blanketing the trees and landscape.\n\n## Arriving and Preparing for Skiing\n\nOnce we arrived at GALA Yuzawa, we picked up all our reserved gear: ski clothes, snowboard, goggles, and lift tickets. We skipped breakfast at the station since we had already eaten on the train. After gearing up, we were ready to hit the slopes.\n\n## Heading Up the Mountain\n\nGALA Yuzawa has a unique setup with the main ski area high up on the mountain. We took a 15-minute ropeway ride to reach it, surrounded by a breathtaking, snowy landscape. It was a thrilling experience but extremely cold—yet it added to the excitement of the day.\n\n## Improving My Skiing Skills\n\nThis was my second time snowboarding, and I felt more confident with my technique. Despite the cold and the falling snow, we managed to ski further up the mountain with each lift ride, surrounded by a crowd of skilled skiers.\n\n## Skiing Until the Last Moment\n\nAfter lunch, we continued skiing, making the most of our time on the slopes. The snow kept falling, making it even more beautiful as we rode the lifts higher and higher.\n\n## Heading Home\n\nBy 3 PM, we were tired and decided to make our way down the mountain. We took the ropeway back to the base and headed to the Shinkansen station, which was conveniently located inside the ski station lobby. The Shinkansen ride was incredibly fast—just 30 minutes—compared to the two-hour JR line ride to get there.\n\nOn the way back, I also bought a souvenir from Yuzawa for my co-worker as a memento of the trip.\n\n## Reflections on a Winter Adventure\n\nIt was my second time skiing, and it was an amazing experience. The snow, the cold, the thrilling rides, and even the moments of surprise, like meeting the guy who helped us with the cash issue, made it an unforgettable winter adventure.\n\n---\n\n	An amazing adventure in Tokyo with cherry blossoms and great food!	https://res.cloudinary.com/duvusa8ck/image/upload/v1767431408/Gemini_Generated_Image_85oj0u85oj0u85oj_vhjh6j.png	t	cmicvkyi10000sjdst4ksys5i	2025-11-24 10:17:56.176	2026-01-03 09:10:40.492	2025-11-24 11:30:38.699	\N	0	0	\N
cmicvza67000327bwpuakg2ts	Kyoto walks, soft light, and peaceful thoughts, collecting quiet memories.	upcoming-trip-to-kyoto-1763973000509	# 画像サイズの調整方法\n\nこのガイドでは、ブログ投稿で画像のサイズを調整する方法を紹介します。\n\n## 方法1：標準のMarkdown（フル幅）\n\n通常のMarkdown記法を使用すると、画像は全幅で表示されます：\n\n![Tateyama](https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg)\n\nこれは記事全体の幅に合わせて表示されます。\n\n---\n\n## 方法2：固定幅の画像\n\nHTMLタグを使用して、特定の幅を指定できます：\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Tateyama Small" width="400" />\n\n**コード：**\n```html\n<img src="画像URL" alt="説明" width="400" />\n```\n\nこの画像は400pxの幅で表示されます（自動的に中央揃え）。\n\n---\n\n## 方法3：パーセンテージ指定\n\n画面サイズに対する割合で指定することもできます：\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Tateyama 50%" width="50%" />\n\n**コード：**\n```html\n<img src="画像URL" alt="説明" width="50%" />\n```\n\nこの画像は画面幅の50%で表示されます。\n\n---\n\n## 方法4：幅と高さの両方を指定\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Tateyama Custom" width="600" height="400" />\n\n**コード：**\n```html\n<img src="画像URL" alt="説明" width="600" height="400" />\n```\n\n特定のサイズボックスに収めたい場合に使用します。\n\n---\n\n## 方法5：小さいサムネイル\n\n記事内で小さなサムネイルを表示したい場合：\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Tateyama Thumbnail" width="200" />\n\n**コード：**\n```html\n<img src="画像URL" alt="説明" width="200" />\n```\n\n---\n\n## サイズ選択のガイドライン\n\n| 用途 | 推奨サイズ | 例 |\n|------|-----------|-----|\n| メイン画像 | フル幅 | `![Alt](url)` |\n| 中程度の画像 | 600-800px | `width="700"` |\n| サムネイル | 200-400px | `width="300"` |\n| アイコン/小画像 | 100-200px | `width="150"` |\n\n---\n\n## 実際の使用例\n\n### ブログ記事のヒーロー画像\n\n![Hero Image](https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg)\n\n### 本文中の参考画像\n\n記事の中で何かを説明する際には、中程度のサイズが適しています：\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Reference" width="500" />\n\nこのように、テキストと画像のバランスが取れます。\n\n### 複数の小画像を並べる場合\n\n商品紹介などで複数の画像を並べたい場合は、小さめのサイズを使用します：\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Product 1" width="250" />\n\n---\n\n## まとめ\n\n- **フル幅**：`![Alt](url)` - インパクトのある画像に\n- **カスタムサイズ**：`<img src="url" width="○○" />` - 柔軟なレイアウトに\n- **レスポンシブ**：すべての画像は自動的にモバイル対応\n\nこれらの方法を使い分けて、読みやすく美しいブログ記事を作成しましょう！	Next stop: Kyoto! I got lost :( an unexpected sth happen!	https://www.advantour.com/img/japan/kyoto/torii-path-fushimi-inari-shrine.jpg	t	cmicvkyi10000sjdst4ksys5i	2025-11-24 08:30:00.51	2026-01-11 06:52:10.805	2026-01-02 06:06:06.197	\N	0	2	\N
cmicvtz4y000127bwff3yscef	My First Trip to Tokyo - Updated	my-first-trip-to-tokyo-1763972752922	# 画像サイズの調整方法\n\nこのガイドでは、ブログ投稿で画像のサイズを調整する方法を紹介します。\n\n## 方法1：標準のMarkdown（フル幅）\n\n通常のMarkdown記法を使用すると、画像は全幅で表示されます：\n\n![Tateyama](https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg)\n\nこれは記事全体の幅に合わせて表示されます。\n\n---\n\n## 方法2：固定幅の画像\n\nHTMLタグを使用して、特定の幅を指定できます：\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Tateyama Small" width="400" />\n\n**コード：**\n```html\n<img src="画像URL" alt="説明" width="400" />\n```\n\nこの画像は400pxの幅で表示されます（自動的に中央揃え）。\n\n---\n\n## 方法3：パーセンテージ指定\n\n画面サイズに対する割合で指定することもできます：\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Tateyama 50%" width="50%" />\n\n**コード：**\n```html\n<img src="画像URL" alt="説明" width="50%" />\n```\n\nこの画像は画面幅の50%で表示されます。\n\n---\n\n## 方法4：幅と高さの両方を指定\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Tateyama Custom" width="600" height="400" />\n\n**コード：**\n```html\n<img src="画像URL" alt="説明" width="600" height="400" />\n```\n\n特定のサイズボックスに収めたい場合に使用します。\n\n---\n\n## 方法5：小さいサムネイル\n\n記事内で小さなサムネイルを表示したい場合：\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Tateyama Thumbnail" width="200" />\n\n**コード：**\n```html\n<img src="画像URL" alt="説明" width="200" />\n```\n\n---\n\n## サイズ選択のガイドライン\n\n| 用途 | 推奨サイズ | 例 |\n|------|-----------|-----|\n| メイン画像 | フル幅 | `![Alt](url)` |\n| 中程度の画像 | 600-800px | `width="700"` |\n| サムネイル | 200-400px | `width="300"` |\n| アイコン/小画像 | 100-200px | `width="150"` |\n\n---\n\n## 実際の使用例\n\n### ブログ記事のヒーロー画像\n\n![Hero Image](https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg)\n\n### 本文中の参考画像\n\n記事の中で何かを説明する際には、中程度のサイズが適しています：\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Reference" width="500" />\n\nこのように、テキストと画像のバランスが取れます。\n\n### 複数の小画像を並べる場合\n\n商品紹介などで複数の画像を並べたい場合は、小さめのサイズを使用します：\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767347570/1_kicahw.jpg" alt="Product 1" width="250" />\n\n---\n\n## まとめ\n\n- **フル幅**：`![Alt](url)` - インパクトのある画像に\n- **カスタムサイズ**：`<img src="url" width="○○" />` - 柔軟なレイアウトに\n- **レスポンシブ**：すべての画像は自動的にモバイル対応\n\nこれらの方法を使い分けて、読みやすく美しいブログ記事を作成しましょう！	An amazing adventure in Tokyo with cherry blossoms and great food!	https://travel.rakuten.com/contents/sites/contents/files/styles/max_1300x1300/public/2024-04/tokyo-tower_1.jpg?itok=-SbZOBay	t	cmicvkyi10000sjdst4ksys5i	2025-11-24 08:25:52.923	2026-01-11 07:18:55.585	2025-11-24 08:25:52.922	\N	1	2	\N
cmjxzszpj00038vge6jiuksxu	Green valleys, cool air, Kamikochi in summer. Time slowed between the mountains.	green-valleys-cool-air-kamikochi-in-summer-time-slowed-between-the-mountains-1767425997509	# Last Summer's Solo Adventure to Kamikochi\n\nIn July 2024, I set off on an unforgettable solo trip to Kamikochi, nestled in the heart of the Japanese Alps. The journey itself was a memorable part of the adventure, starting early in the morning with a ride on the Shinkansen from my home, Saitama, to Nagano Station. This was my third time visiting Nagano, following my ski trips to **Ryuoo** and **Karuizawa**.\n\n## Morning Journey on the Shinkansen\n\nAt around 7:00 AM, I boarded the Shinkansen, feeling both excited and a little nervous to be traveling alone. Watching the scenic countryside pass by, the quick ride set a perfect pace to kickstart my trip. By around 8:30 AM, I arrived in Nagano, ready for the next leg of the journey.\n\n## Highway Bus to Kamikochi\n\nFrom Nagano Station, I hopped on a highway bus bound for Kamikochi. The bus departed around 9:00 AM, winding through beautiful mountain landscapes and passing quaint towns. It felt as though I was leaving behind the bustling world and stepping into nature's sanctuary. After several hours on the road, with a couple of brief rest stops along the way, I reached Kamikochi around 1:00 PM, just in time to experience the breathtaking afternoon views.\n\n## Arriving in Kamikochi\n\nAs soon as I arrived in Kamikochi, I felt completely surrounded by nature. The fresh mountain air was refreshing, and I could immediately feel the coolness of summer in the Japanese Alps. The afternoon sun lit up the landscape, and I could see the clear blue waters of the Azusa River running through the valley. Tall, lush green trees lined the riverbanks, with the peaks of the Hotaka mountains towering in the background.\n\n## Hiking Along the Azusa River\n\nAfter taking in the initial views, I started walking along the trail that follows the Azusa River. The path stretched for about 10 kilometers, offering incredible views the entire way. The river sparkled under the sunlight, and I could see reflections of the mountains and trees in the water. Every turn along the trail seemed to open up to new scenery, each spot more beautiful than the last.\n\nAlong the way, I noticed signs reminding hikers about bears in the area, as well as the presence of crows. It added a bit of adventure to the hike, as it was a reminder to stay alert and keep my bell handy—a common practice for hikers in Japan to ward off bears. Although it added a sense of caution, it didn't take away from the experience. If anything, it made the walk even more memorable and exciting.\n\n## Friendly Encounters and Amazing Views\n\nOne of the best parts of the hike was meeting so many friendly people along the trail. Every hiker I passed greeted me with a cheerful "Hello" or "Konnichiwa," making the whole experience feel warm and welcoming. This simple friendliness added to the beauty of the journey and made it feel special.\n\nFinally, after hours of hiking, I was tired but happy. The views had been worth every step. As a souvenir, I bought a few beers with unique hiking designs to bring home.\n\n## Wrapping Up the Journey\n\nWith my adventure in Kamikochi coming to an end, I took a bus back to Nagano and then boarded the Shinkansen back to Saitama. Before leaving, I bought some local beer and a few souvenirs to remember the trip. It was the perfect finish to an incredible solo adventure, leaving me with memories I'd cherish.	I set off on an unforgettable solo trip to Kamikochi, nestled in the heart of the Japanese Alps.	https://japantravelsights.com/wp-content/uploads/2024/08/29454344_m-1280x960.jpg	t	cmicvkyi10000sjdst4ksys5i	2026-01-03 07:39:57.511	2026-01-11 08:27:42.87	2026-01-03 07:39:57.51	Hui Gaming	2	14	{Hello,Mountain,Climbing,Hiking}
cmjx1i9lo0001pdwhlfuvo8zr	Togakushi shrine in winter! Does Togakushi Shrine Live Up to the Hype?	togakushi-shrine-in-winter-drive-me-crazy-1767368390167	# A Winter Trip to Togakushi Shrine  \n\n## **Morning Journey on the Shinkansen**  \nOn **January 11, 2025**, I took the **Shinkansen** at **7:00 AM** from my home to **Nagano Station**. The train ride was smooth and quiet, and I enjoyed looking at the winter scenery along the way. This was my fourth time visiting Nagano, following my ski trips to [Ryuoo](https://hoon.pro/realm/ryuoo-ski-park), [Karuizawa](https://hoon.pro/realm/karuizawa-day-trip), and [Kamikochi](https://hoon.pro/realm/kamikochi). I don't know why I can't run away from this city.\n\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767368203/l_af1r4j.jpg" alt="First" width="400" />\n\n\n* comon\n\n<img src="https://res.cloudinary.com/duvusa8ck/image/upload/v1767368192/cc_trifar.jpg" alt="Second" width="300" />\n\n\n	A memorable winter journey to Togakushi Shrine in Nagano, experiencing beautiful snowy landscapes, spiritual traditions, and delicious local soba.	https://res.cloudinary.com/duvusa8ck/image/upload/v1767368203/main_slo6xg.jpg	t	cmicvkyi10000sjdst4ksys5i	2026-01-02 15:39:50.17	2026-01-11 08:06:37.826	2026-01-02 15:39:50.167	\N	0	5	{Winter,Snow,Shrine}
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, password, name, role, "createdAt", "updatedAt") FROM stdin;
cmicvjb4w00008b62s9z5pzeg	user@example.com	$2b$10$/lj1TFJnym9aLNr4cnz9PuMfD9Q4YWvpxaTrx6Ay.FPZ.cDoLHT1S	Test User	USER	2025-11-24 08:17:35.264	2025-11-24 08:17:35.264
cmicvkyi10000sjdst4ksys5i	admin@example.com	$2b$10$c3Rl3InL8xqgXxy7lPzKjOjvlM0oVXMUioEwiZuqfOrJEjPCd8BUa	Admin User	ADMIN	2025-11-24 08:18:52.201	2025-11-24 08:18:52.201
cmjwiseot00021v01fdrtfvdm	jkj@blog.com	$2b$10$/FedxWprK0MDVQARYqBC6Oxz4uvyMpvvvnkjWtxuXwOCr.lFL9lNO	\N	USER	2026-01-02 06:55:50.621	2026-01-02 06:55:50.621
cmjwj3zl100051v01xxxaoxa4	starbuck@blog.com	$2b$10$wlpbSQdVPcg4TunUYHhPZe4r4iJzzOS84UoAgqFgIHOqJGHzWNLQC	Starbuck	USER	2026-01-02 07:04:50.917	2026-01-02 07:04:50.917
cmjwl4onk00081v01tmrb03ny	nezumi@blog.com	$2b$10$/6CPyTPKZZg486t8qtD7oOiFYij2W6zikSpNWAdrDw8V5q24HkB7m	Nezumi	USER	2026-01-02 08:01:22.641	2026-01-02 08:01:22.641
cmjwozcss000d1v018jjsfzmk	bkk@gmail.com	$2b$10$hSAK4U5oeOoeJ90vOzLu5.4HUPoXLtZWcqMUx2qjk/ipY798RJDuq	BKK	USER	2026-01-02 09:49:12.461	2026-01-02 09:49:12.461
cmjy9w53v0000mu9rwo5uez2y	Niijima@gmail.com	$2b$10$p/Zx5LC2gUn3hL91VD6tuuPrFJsoVTXGwZz/KYJqsDIptxt3L8RHO	Niijima	USER	2026-01-03 12:22:20.635	2026-01-03 12:22:20.635
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
50a681d6-cad8-428d-b79d-7dd74b164856	4c5a3fcd88772456542d774a3f9cc3c81753ec4df5d26db117becb7581bae20c	2025-11-24 16:54:35.686753+09	20251124075435_init	\N	\N	2025-11-24 16:54:35.681082+09	1
0c607faa-9fac-4678-9ca4-e8198d37283a	77672a3e01c4fea7e83e226d67320c32cab1bf80a68f926b8649c7d0bd22a993	2026-01-11 15:04:59.60767+09	20260111060459_add_author_name_love_view_count	\N	\N	2026-01-11 15:04:59.60225+09	1
9bd3b7c1-4eac-44ed-8cfd-eb73de9fcaea	522717117c8c3098650233916fb440ac32ce00a0fd0f011b9b56329c5f8ed573	2026-01-11 16:39:45.35544+09	20260111073945_add_tags_to_posts	\N	\N	2026-01-11 16:39:45.353728+09	1
\.


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Comment_postId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Comment_postId_idx" ON public."Comment" USING btree ("postId");


--
-- Name: Post_published_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Post_published_idx" ON public."Post" USING btree (published);


--
-- Name: Post_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Post_slug_idx" ON public."Post" USING btree (slug);


--
-- Name: Post_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Post_slug_key" ON public."Post" USING btree (slug);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Comment Comment_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Comment Comment_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Post Post_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 5UirSHrL6CLHJBc3Xzruswk3AVgWGKDsaPOYhTEXiyWQ1bZxzrwmf5c4LVMePh6

