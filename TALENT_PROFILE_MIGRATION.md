# Talent Profile Migration

This document provides instructions on how to run the migration that enhances the talent profile table and ensures every talent user has a corresponding profile.

## What This Migration Does

1. Adds new fields to the `talent_profiles` table to store comprehensive talent information:
   - Personal information (full name, phone number, location)
   - Professional information (current title, company, years of experience)
   - Skills and qualifications (skills, primary skills)
   - Career preferences (desired role, salary, location, remote preference)
   - Availability and status (availability date, employment status, open to opportunities)
   - Recruiter notes and ratings

2. Makes the `userId` column unique to ensure a one-to-one relationship between users and talent profiles.

3. Creates talent profiles for any talent users that don't already have one.

## Running the Migration

To run the migration, execute the following command:

```bash
npm run db:migrate-talent-profiles
```

## Using the Enhanced Talent Profiles

After running the migration, you can use the following functions to work with talent profiles:

- `ensureTalentProfileExists(userId)`: Creates a talent profile for a user if one doesn't exist
- `updateTalentProfile(userId, profileData)`: Updates a talent profile with new data
- `getAllTalentsWithProfiles()`: Gets all talent users with their profiles, creating profiles for talents that don't have one

## Spreadsheet Integration

The enhanced talent profile table now contains all necessary fields for a comprehensive spreadsheet view, including:

- Personal and contact information
- Professional background
- Skills and qualifications
- Career preferences
- Availability and status
- Recruiter notes and ratings

This eliminates the need to join multiple tables when exporting talent data to a spreadsheet. 