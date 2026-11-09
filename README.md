# BiasharaOS

BiasharaOS is a business management platform for Kenyan SMEs, with POS, inventory, financial reporting, invoicing, customer management, employee management, subscriptions, and a Gemini-powered business assistant.

## Render deployment

This repository includes a Render Blueprint at `render.yaml`.

1. Open [Render Blueprints](https://dashboard.render.com/blueprints).
2. Select **New Blueprint Instance**.
3. Connect `ederstoneCorp/Biashara-OS` and select the `main` branch.
4. Render will read the Blueprint and create the web service.
5. Enter the required environment variables when prompted, then apply the Blueprint.

The service uses Node.js 22.14.0, Singapore region, and the Free web-service plan.

## Required environment variables

| Variable | Purpose |
| --- | --- |
| `SQL_HOST` | PostgreSQL hostname |
| `SQL_USER` | PostgreSQL username |
| `SQL_PASSWORD` | PostgreSQL password |
| `SQL_DB_NAME` | PostgreSQL database name |
| `SQL_SSL` | Set to `true` when the PostgreSQL provider requires TLS; otherwise `false` |
| `GEMINI_API_KEY` | Google Gemini API key for the AI business assistant |

The application requires a reachable PostgreSQL database. The Blueprint does not create a database automatically; supply credentials for your PostgreSQL instance. Keep passwords and API keys in Render environment settings, never in Git.

## Initialize the database schema

After configuring PostgreSQL credentials, initialize the tables from the Drizzle schema. From a trusted local environment with the repository dependencies installed and the SQL environment variables configured, run:

```bash
npm install
npm run db:push
```

Run this once for a new, empty database, and review schema changes before applying them to a database containing production data.

## Build and run

```bash
npm install
npm run build
npm start
```

The Express server serves the Vite production build and exposes `/api/health` for Render health checks.

## Notes

- The app requires PostgreSQL; the frontend alone is not a complete deployment.
- Gemini AI features require a valid `GEMINI_API_KEY`. Core database-backed features still require the PostgreSQL connection.
- M-Pesa Daraja credentials and a live payment callback integration are not configured by this deployment Blueprint. Configure those separately before accepting real payments.
- Render Free web services may spin down when idle.
