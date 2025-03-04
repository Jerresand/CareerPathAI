# Talent Data Setup

This document provides instructions on how to set up mock talent data for your CareerPathAI application.

## What This Setup Does

1. Runs the talent profile migration to enhance the talent profile table with comprehensive fields.
2. Creates 10 mock talent users with realistic profiles including:
   - Personal information (name, phone, location)
   - Professional information (current title, company, years of experience)
   - Skills and qualifications
   - Detailed work experience
   - Education history
   - Career preferences
   - Availability status

## Running the Setup

To run the complete talent data setup (migration + seeding), execute:

```bash
npm run db:setup-talent-data
```

### Running Individual Steps

If you want to run the steps individually:

1. To only run the migration (enhance the talent profile table):
   ```bash
   npm run db:migrate-talent-profiles
   ```

2. To only seed the talent data (create mock users and profiles):
   ```bash
   npm run db:seed-talent-data
   ```

## Mock Talent Data

The seeding script creates 10 diverse talent profiles with different:
- Professional backgrounds (Software Engineers, Product Managers, Designers, etc.)
- Experience levels (3-8 years)
- Locations (San Francisco, New York, Seattle, etc.)
- Skills and qualifications
- Career preferences

All mock talent users have the password: `password123`

## Using the Talent Data

After running the setup, you can:
1. Log in as a recruiter to view all talents in the talent pool
2. Filter and search talents based on their skills, experience, location, etc.
3. Export talent data to a spreadsheet with all the comprehensive profile information

## Customizing the Mock Data

If you want to customize the mock data, you can edit the `mockTalents` array in:
```
lib/db/seed-talent-data.ts
``` 