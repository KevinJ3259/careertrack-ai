# AI Job Application Tracker

A portfolio-ready full-stack starter for tracking job applications and generating AI-assisted cover-letter drafts.

## Stack

- React + TypeScript + Vite
- Node.js + Express + TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication
- OpenAI Responses API
- Docker Compose for PostgreSQL

## Included

- Register and login
- Protected API routes
- Create, read, update, and delete job applications
- Filter applications by status
- Dashboard summary cards
- AI cover-letter draft endpoint
- Form validation with Zod
- Responsive starter UI

## Project structure

```text
ai-job-tracker-starter/
├── client/
├── server/
├── docker-compose.yml
└── README.md
```

## 1. Requirements

Install:

- Node.js 20+
- Docker Desktop, or a local PostgreSQL installation
- An OpenAI API key only if you want to use the cover-letter generator

## 2. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

## 3. Configure and start the server

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```

The API will run at `http://localhost:4000`.

## 4. Start the client

Open another terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The application will run at `http://localhost:5173`.

## Demo workflow

1. Register an account.
2. Add a job application.
3. Change its status.
4. Generate a cover-letter draft.
5. Add screenshots and a live deployment link to this README before showing employers.

## API routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/applications` | List the user's applications |
| POST | `/api/applications` | Add an application |
| PATCH | `/api/applications/:id` | Update an application |
| DELETE | `/api/applications/:id` | Delete an application |
| POST | `/api/ai/cover-letter` | Generate a draft |

## Important security notes

- Never place `OPENAI_API_KEY` in the React client.
- Keep secrets only in `server/.env`.
- Replace the starter JWT secret before deployment.
- The generated cover letter is a draft. Users should verify and personalize it.
