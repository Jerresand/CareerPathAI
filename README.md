# Next.js SaaS Starter

This was a modern, full-featured SaaS starter template built with Next.js and TypeScript.

Now i want to build a SaaS app with this template. IT IS VERY IMPORTANT THAT THE CORE FUNCTIONALITIES OF THIS TEMPLATE ARE KEPT.

I USE PNPM AS PACKAGE MANAGER.

THAT IS:

- Authentication
- Stripe Integration
- Database
- API
- Admin Dashboard



The app has two main users:
Job Searchers (Talents)
Companies (Recruiters)

The talents should only have two functionalities:

1. Drop their resume
2. Browse through a list of jobs, recommended by recruiters based on their profile

Recruiters should have the following functionalities:

1. A comprehensive dashboard/sheet where they can filter ALL talents based on their skills, experience, education, etc.
2. When they are happy with their filters, they can send a job listing to the talent pool.
3. This can either be done by creating and saving a talent group, or by directly sending a job to the talent pool.


What is the function behind it?

The talent side:

1. When a talent drops their resume, an AI document parser extracts the information from the resume and creates a profile. If the parser is not able to extract the information, the talent can manually fill in their information. 
2. The talent profile gets entered into the database and the master talent spreadsheet.


The recruiter side:

1. The spreadsheet is constantly updated with new talents based on the filters they have set.
2. The recruiters pay credits to send a job listing to a talent.
3. The recruiters have a dashboard with metrics about how many talents have actually clicked.

## Technical Stack

### Frontend
- **Framework**: Next.js 15.2 (with Turbopack)
- **Language**: TypeScript
- **UI Components**: 
  - Radix UI for accessible primitives
  - Custom components built on top of Radix UI
  - Lucide React for icons
- **Styling**: 
  - Tailwind CSS 4.0
  - CSS Variables for theming
  - Dark mode support
  - Responsive design

### Backend
- **Database**: PostgreSQL with Drizzle ORM
  - Type-safe schema definitions
  - Migrations support
  - Connection pooling
  - Supabase Studio integration for database management
- **Authentication**:
  - JWT-based authentication using jose
  - Secure password hashing with bcryptjs
  - Session management with HTTP-only cookies
  - Protected routes with middleware
  - Team-based authorization

### Database & Migrations
- **ORM & Schema Management**:
  - Drizzle ORM for type-safe database operations
  - Schema defined in `lib/db/schema.ts`
  - Migrations stored in `lib/db/migrations/`
  - Automatic migration generation with `drizzle-kit`

- **Migration Workflow**:
  1. Define schema in `lib/db/schema.ts`
  2. Generate migrations: `npx drizzle-kit generate:pg`
  3. Apply migrations: `npx drizzle-kit push:pg`
  4. View database in Supabase Studio: `supabase start`

- **Important Notes**:
  - Always use Drizzle migrations (in `lib/db/migrations/`) instead of Supabase migrations
  - Migration files are automatically named with incremental prefixes (e.g., `0000_`, `0001_`)
  - Each migration includes both "up" (apply) and "down" (rollback) operations
  - Relations are defined using Drizzle's type-safe relation builders

- **Database Tools Integration**:
  - Supabase for database GUI and management
  - pgAdmin for advanced database operations
  - Connection pooling with `postgres.js`
  - Environment variables in `.env` for database configuration

### Payments
- **Stripe Integration**:
  - Subscription management
  - Multiple pricing tiers (Base and Plus plans)
  - Trial periods
  - Customer portal
  - Webhook handling
  - Automatic subscription status updates

### Development Tools
- **Database Management**:
  - `npx drizzle-kit generate:pg` - Generate new migrations from schema changes
  - `npx drizzle-kit push:pg` - Apply migrations to database
  - `npm run db:seed` - Seed database with initial data (teams, users, etc.)
  - `supabase start` - Start Supabase services and Studio UI
  - `supabase stop` - Stop all Supabase services
  - `supabase status` - Check status of Supabase services

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/               # Authentication pages
│   │   ├── sign-in/            # Sign in functionality
│   │   ├── sign-up/            # Sign up functionality
│   │   ├── actions.ts          # Authentication server actions
│   │   └── login.tsx           # Login page component
│   ├── talent/               # Talent-specific pages
│   │   ├── (dashboard)/        # Resume upload & job listings dashboard
│   │   └── page.tsx            # Main talent landing page
│   ├── recruiter/            # Recruiter-specific pages
│   │   └── (dashboard)/        # Talent pool & analytics dashboard
│   ├── api/                  # API routes
│   │   ├── parse-resume/       # Resume parsing API
│   │   ├── upload/             # File upload API
│   │   └── stripe/             # Stripe payment API endpoints
│   ├── layout.tsx            # Root layout component
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
├── components/              # React components
│   ├── ui/                   # UI components
│   └── ResumeUpload.tsx      # Resume upload component
├── lib/                     # Core functionality
│   ├── auth/                 # Authentication logic
│   ├── db/                   # Database configuration
│   │   ├── migrations/         # Database migrations
│   │   ├── schema.ts           # Database schema definitions
│   │   ├── queries.ts          # Database query functions
│   │   ├── setup.ts            # Database setup utilities
│   │   └── seed.ts             # Database seeding script
│   ├── supabase/             # Supabase client configuration
│   └── payments/             # Stripe integration
├── middleware.ts            # Next.js middleware for auth and routing
├── scripts/                 # Utility scripts
├── supabase/                # Supabase configuration
├── docs/                    # Documentation files
├── test-files/              # Test files and fixtures
├── volumes/                 # Docker volumes
├── drizzle.config.ts        # Drizzle ORM configuration
├── next.config.ts           # Next.js configuration
├── docker-compose.yml       # Docker Compose configuration
└── docker-compose.supabase.yml # Supabase Docker configuration
```

## Features

### Authentication
- Email/password authentication
- JWT-based sessions
- Password reset functionality
- Team invitations
- Role-based access control

### Team Management
- Create and manage teams
- Invite team members
- Role management (owner, member)
- Activity logging

### Subscription Management
- Multiple subscription tiers
- Trial periods
- Upgrade/downgrade plans
- Cancel subscriptions
- Usage tracking

### Security
- CSRF protection
- XSS prevention
- Secure session handling
- Rate limiting
- Input validation with Zod

## Environment Setup

Required environment variables:
```
POSTGRES_URL=            # PostgreSQL connection URL
STRIPE_SECRET_KEY=       # Stripe secret key
STRIPE_WEBHOOK_SECRET=   # Stripe webhook secret
BASE_URL=               # Application base URL
AUTH_SECRET=            # JWT signing secret
```

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Run database setup: `pnpm run db:setup`
5. Start development server: `pnpm run dev`

## Development Workflow

### Database Changes
1. Edit the schema in `lib/db/schema.ts`
   ```typescript
   // Example: Adding a new field to users table
   export const users = pgTable('users', {
     // ... existing fields ...
     newField: varchar('new_field', { length: 100 }),
   });
   ```

2. Generate a new migration:
   ```bash
   npx drizzle-kit generate:pg
   ```
   This creates a new file in `lib/db/migrations/` with an incremental prefix

3. Review the generated migration file
   - Check both the "up" and "down" migrations
   - Ensure foreign key constraints are correct
   - Add any necessary indexes

4. Apply the migration:
   ```bash
   npx drizzle-kit push:pg
   ```

5. Update your TypeScript types:
   ```typescript
   // Update any affected type definitions
   export type User = typeof users.$inferSelect;
   export type NewUser = typeof users.$inferInsert;
   ```

6. Test the changes:
   - Verify in Supabase Studio (`supabase start`)
   - Run your seed script if needed (`pnpm run db:seed`)
   - Test affected API routes and components

### Other Development Tasks
// ... existing code ...

## Production Deployment

The application is optimized for deployment on Vercel with the following features:
- Edge runtime support
- Automatic HTTPS
- Serverless functions
- Edge caching
- Asset optimization
