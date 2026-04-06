# tender-ai-audit
AI-powered platform to analyze tender documents and extract risks, gaps, and cost insights.

## Stack Overview
This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## How to Run
1. `npm install`
2. `npx prisma generate`
3. `npm run dev`

## CI/CD Pipeline
The project includes a professional-grade GitHub Actions pipeline (`.github/workflows/pipeline.yml`) that automates:
- **Quality Control**: Linting, formatting, and type-checking on every PR.
- **Security**: Automated dependency audits for high-risk vulnerabilities.
- **Build Verification**: Ensures Next.js and Prisma builds are successful.
- **Containerization**: Automatically builds and pushes Docker images (Next.js & Worker) to GitHub Container Registry (GHCR) when changes are pushed to `main`.

### Docker Images
Images available at `ghcr.io/<repo-owner>/tender-ai-audit`. 
Tags: `latest`, `sha-short`, `<branch-name>`.

## Learn More
To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:
- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq) — Awesome tutorials.
