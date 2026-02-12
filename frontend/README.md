# Frontend (React + TS + Vite)

## Setup
1. `cd frontend`
2. `npm install`
3. Create `.env` with:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL`
4. `npm run dev`

Auth is centralized in `AuthProvider`; API requests use one wrapper in `src/lib/api.ts`.
