# Next.js SaaS Starter

This was a modern, full-featured SaaS starter template built with Next.js and TypeScript.

Now i want to build a SaaS app with this template. IT IS VERY IMPORTANT THAT THE CORE FUNCTIONALITIES OF THIS TEMPLATE ARE KEPT.

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
  - `db:setup` - Initial database setup
  - `db:seed` - Seed database with initial data
  - `db:generate` - Generate Drizzle migrations
  - `db:migrate` - Run migrations
  - `db:studio` - Launch Supabase Studio

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/               # Authentication pages (login, signup, etc.)
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (talent)/             # Talent-specific pages
│   │   ├── dashboard/        # Resume upload & job listings
│   │   └── profile/          # Profile management
│   ├── (recruiter)/          # Recruiter-specific pages
│   │   ├── dashboard/        # Talent pool & analytics
│   │   ├── talents/          # Talent filtering & management
│   │   └── jobs/            # Job posting management
│   └── api/                  # API routes
├── components/            # React components
│   ├── ui/               # UI components
├── lib/                   # Core functionality
│   ├── auth/             # Authentication logic
│   ├── db/               # Database configuration
│   ├── payments/         # Stripe integration
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
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database setup: `npm run db:setup`
5. Start development server: `npm run dev`

## Development Workflow

1. Make changes to the schema in `lib/db/schema.ts`
2. Generate migrations: `npm run db:generate`
3. Apply migrations: `npm run db:migrate`
4. Seed data if needed: `npm run db:seed`

## Production Deployment

The application is optimized for deployment on Vercel with the following features:
- Edge runtime support
- Automatic HTTPS
- Serverless functions
- Edge caching
- Asset optimization
