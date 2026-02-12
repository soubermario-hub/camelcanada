# Camel Canada Accounting SaaS (Monorepo)

## Structure
- `backend/` Laravel 11 REST API with PostgreSQL and Supabase JWT verification.
- `frontend/` React + TypeScript + Vite dashboard using TanStack Query.

## Core flows delivered
- Multi-tenant bootstrapping (`/auth/bootstrap`) and per-company scoping.
- Client CRUD (list/create).
- Invoice list/create with transactional item creation.
- Invoice PDF endpoint.
- Role enforcement for owner/admin/accountant on create actions.

## Local run
### Backend
```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Verification checklist
1. Login and ensure session remains active.
2. Confirm no refresh-token spam in network tab.
3. Create client; reload and confirm persistence.
4. Create invoice; reload and confirm persistence.
5. Download invoice PDF.
6. Ensure member role receives `403` for client/invoice create.
7. Validate every quick-create item routes to a valid page.
