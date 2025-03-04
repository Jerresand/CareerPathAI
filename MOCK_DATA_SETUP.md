# Mock Data Setup for CareerPathAI

This document provides instructions on how to set up mock data for the CareerPathAI application.

## What This Setup Does

1. **Talent Profiles**: Creates 10 talent users with comprehensive profiles including:
   - Personal information (name, phone, location)
   - Professional information (current title, company, years of experience)
   - Skills and qualifications
   - Work experience and education history
   - Career preferences and availability
   - Recruiter notes and ratings

2. **Recruiter and Team**: Creates a recruiter user and a team, and assigns the recruiter to the team.

## Running the Setup

To set up the mock data, follow these steps:

1. First, ensure your database schema is up to date by running the talent profile migration:

```bash
npm run db:migrate-talent-profiles
```

2. Seed the talent data:

```bash
npm run db:seed-talent-data
```

3. Set up a recruiter and team:

```bash
npm run db:setup-talent-data
```

## Using the Mock Data

After running the setup, you can sign in with the following credentials:

### Recruiter Account
- Email: recruiter@example.com
- Password: password123

### Talent Accounts
All talent accounts use the same password:
- Password: password123

Talent emails:
- alex.johnson@example.com (Frontend Developer)
- samantha.lee@example.com (Full Stack Developer)
- michael.chen@example.com (DevOps Engineer)
- emily.rodriguez@example.com (Data Scientist)
- david.kim@example.com (Mobile Developer)
- sarah.wilson@example.com (UX/UI Designer)
- james.taylor@example.com (Backend Developer)
- olivia.martinez@example.com (Product Manager)
- ryan.patel@example.com (Data Engineer)
- emma.thompson@example.com (QA Engineer)

## Data Structure

The mock data is structured to provide a realistic representation of talent profiles with various skills, experience levels, and career preferences. Each talent profile includes:

- Structured work experience (as JSON)
- Structured education history (as JSON)
- Primary skills for filtering
- Career preferences and availability status
- Recruiter notes and ratings

This makes the data suitable for testing all features of the talent pool, including filtering, sorting, and exporting to spreadsheets. 