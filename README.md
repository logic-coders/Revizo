# Revizo 

Your one-stop solution for software engineer interview preparation and last-minute revision.

Revizo is an AI-curated, static web platform that helps developers prep for technical interviews across the stack — Java 8, Java 17, Spring Boot, Kafka, Redis, Python, AI/ML, and more. Instead of scattered blog posts and outdated tutorials, every topic is broken down into the most frequently asked interview questions, each answered in a consistent, interview-ready format designed to help you explain concepts confidently — not just recognize them.

## Why Revizo?
* **Interview-first answers** — not textbook definitions. Every question includes a quick-answer hook, a mental model, trade-offs, likely follow-ups, and real-world usage.
* **AI-curated content** — questions are ranked by how frequently they're actually asked, sourced and structured via an AI content pipeline (NVIDIA Nemotron).
* **Built for speed** — fully static site (Next.js SSG, one route per question), deployed on Vercel's free tier, with CDN edge caching for near-instant page loads.
* **Structured for revision** — Subjects → Categories → Sub-topics → Questions, navigable via a persistent sidebar (direct-jump) plus linear Prev/Next flow.
* **Modern, focused UI** — dark-mode-first, distraction-free, one question at a time.

## How it looks

Each answer follows a fixed 9-section template, applied identically across every subject:

| Section | What it covers |
| :--- | :--- |
| **1. Quick Answer** | One-line, quotable definition |
| **2. Mental Model** | Real-world analogy for recall |
| **3. What It Is** | Precise technical explanation |
| **4. Why It Exists** | The problem it solves |
| **5. Demo** | Code / CLI / config / diagram (subject-dependent) |
| **6. Trade-offs** | When not to use it |
| **7. They Might Ask Next** | Pre-answered follow-up questions |
| **8. Used in Production** | Real-world grounding |
| **9. Related Topics** | Linked sub-topics for continued revision |

*(Screenshots coming soon)*

## Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (static export), Tailwind CSS v4 |
| **Content storage** | JSON files in Amazon S3 (source of truth) |
| **Content generation** | AI pipeline powered by NVIDIA Nemotron |
| **Hosting / CDN** | Vercel (free tier) |
| **Rebuild automation** | S3 event → Lambda → Vercel Deploy Hook |
| **Search** | Fuse.js (client-side, static) |
| **Code highlighting** | PrismJS |

### Architecture at a glance:

```text
AI Pipeline → writes JSON → S3 (content source of truth)
                                │
                     S3 event → Lambda → Vercel Deploy Hook
                                │
                Vercel build → static pages (one route per question)
                                │
                        Deployed to global CDN edge
```

Full architecture, content schema, and UX spec live in `requirement.md`.

## Project Structure 

```text
revizo/
├── src/
│   ├── app/                  # Next.js App Router (one route per question)
│   ├── components/           # Sidebar, QuestionCard, Header, SearchModal, etc.
│   ├── data/                 # Current fallback data / subjects
│   └── types/                # TypeScript interfaces
├── scripts/
│   └── generate-content.ts   # AI content-pipeline script (NVIDIA Nemotron)
├── public/                   # Static assets, PWA manifest, service worker
├── requirement.md            # Full product/technical spec
└── README.md
```

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/logic-coders/Revizo.git
cd Revizo

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Add your NVIDIA API key, AWS credentials, and S3 bucket name

# 4. Run the content pipeline (generates/updates question data)
npm run generate-content

# 5. Start the dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app locally.

## Environment Variables

| Variable | Description |
| :--- | :--- |
| `NVIDIA_API_KEY` | API key for the Nemotron model used in content generation |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS credentials for the S3 content bucket |
| `S3_BUCKET_NAME` | Bucket where generated question JSON is stored |

> **Note:** Never commit real credentials. Use `.env` locally and Vercel's Environment Variables in production.

## Deployment

Revizo is designed to run entirely on Vercel's free tier:

1. Push to `main` (or merge a PR).
2. New content in S3 triggers a Lambda → Vercel Deploy Hook.
3. Vercel rebuilds the static site, pulling the latest content from S3.
4. The rebuilt site is served from Vercel's global CDN — zero server-side compute at request time.

## Roadmap
- [x] Core subjects: Java 8, Java 17, Spring Boot, Kafka, Redis, Python, AI/ML
- [x] Bookmark / "mark as revised" tracking (local-storage based)
- [x] Per-subject progress indicators
- [x] PWA offline support for revision on the go
- [ ] System Design, SQL/Databases, DSA, DevOps subjects

## Contributing

Contributions are welcome! Please open an issue to discuss significant changes before submitting a PR. For content corrections (a question's answer is inaccurate or outdated), open an issue tagged `content` with the subject/topic/question ID.

## License

MIT — free to use, modify, and share.

*Built for developers, by developers preparing for their next interview. 💜*
