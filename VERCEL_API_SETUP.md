# Vercel API setup

The frontend calls `/api/analyze-model`.

Vercel serves that endpoint from `api/analyze-model.mjs`.

Add this server-side environment variable in Vercel:

- `GROQ_API_KEY` = your Groq API key

Optional:
- `GROQ_MODEL` = `qwen/qwen3.6-27b`

Do not expose the Groq key in any `VITE_*` variable.

For local development, `server.mjs` remains available via `npm run server`.
