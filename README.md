# Git Messaging Scheduler

A web application that integrates git providers (GitHub, Bitbucket, GitLab) with messaging providers (Slack, MS Teams, Discord) to send scheduled reminders about open pull requests.

## Features

- **Modern Stack**: Built with Node.js v22, Hono, React, and TypeScript
- **Git Integration**: Connect GitHub, GitLab, and Bitbucket
- **Messaging Platforms**: Send notifications to Slack, Teams, and Discord
- **Flexible Scheduling**: Configure custom cron schedules
- **Type Safety**: End-to-end type safety with Hono RPC and arktype
- **Authentication**: Secure authentication with Clerk

## Development Setup

### Prerequisites

- Node.js v22 or higher
- PostgreSQL database (or Neon)
- Git

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd git-messaging-scheduler
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development servers:

```bash
npm run dev
```

This will start:

- **Backend API server** on http://localhost:3000 (serves API routes only)
- **Frontend dev server** on http://localhost:5173 (with HMR and proxy to API)

In development:

- Visit http://localhost:5173 for the frontend (with hot reloading)
- API endpoints are available at http://localhost:3000/api/\* (proxied through Vite)
- The backend serves only API routes, frontend is handled by Vite

In production:

- The backend serves both API routes and static frontend files
- Only one server runs on the configured PORT

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:server` - Start only the backend server
- `npm run dev:client` - Start only the frontend development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── server.ts              # Hono server entry point
├── main.tsx              # React app entry point
├── App.tsx               # Main React component
├── routes/               # Hono routes (pages + API)
├── components/           # React components
├── pages/               # React pages
├── lib/                 # Shared libraries and services
└── static/              # Static assets

tests/
├── unit/                # Unit tests
├── integration/         # Integration tests
└── e2e/                # End-to-end tests
```

## Architecture

The application uses a modern full-stack architecture:

- **Frontend**: React with Vite for fast development
- **Backend**: Hono server with RPC routes for type-safe APIs
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk for secure user management
- **Validation**: arktype for runtime validation with excellent TypeScript integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run `npm run lint` and `npm run test`
6. Submit a pull request

## License

MIT License
