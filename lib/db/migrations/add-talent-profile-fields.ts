import { sql } from 'drizzle-orm';
import { db } from '../drizzle';
import { users, talentProfiles } from '../schema';
import { eq } from 'drizzle-orm';

export async function migrate() {
  console.log('Starting migration: Adding fields to talent_profiles table');

  try {
    // 1. Add new columns to the talent_profiles table
    await db.execute(sql`
      ALTER TABLE talent_profiles
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS current_title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS current_company VARCHAR(255),
      ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
      ADD COLUMN IF NOT EXISTS primary_skills TEXT,
      ADD COLUMN IF NOT EXISTS desired_role VARCHAR(255),
      ADD COLUMN IF NOT EXISTS desired_salary VARCHAR(100),
      ADD COLUMN IF NOT EXISTS desired_location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS remote_preference VARCHAR(50),
      ADD COLUMN IF NOT EXISTS availability_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS currently_employed BOOLEAN,
      ADD COLUMN IF NOT EXISTS open_to_opportunities BOOLEAN,
      ADD COLUMN IF NOT EXISTS recruiter_notes TEXT,
      ADD COLUMN IF NOT EXISTS talent_rating INTEGER;
    `);

    console.log('Added new columns to talent_profiles table');

    // 2. Make the userId column unique to ensure one-to-one relationship
    // First check if the constraint already exists
    const constraintExists = await db.execute(sql`
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'unique_user_id' 
      LIMIT 1;
    `);

    if (constraintExists.length === 0) {
      await db.execute(sql`
        ALTER TABLE talent_profiles
        ADD CONSTRAINT unique_user_id UNIQUE (user_id);
      `);
      console.log('Added unique constraint to user_id column');
    } else {
      console.log('Unique constraint already exists, skipping');
    }

    // 3. Create profiles for talents that don't have one
    const talentUsers = await db
      .select()
      .from(users)
      .where(eq(users.userType, 'talent'));

    console.log(`Found ${talentUsers.length} talent users`);

    // Get existing profiles
    const existingProfiles = await db.select().from(talentProfiles);
    const existingUserIds = new Set(existingProfiles.map(profile => profile.userId));

    console.log(`Found ${existingProfiles.length} existing talent profiles`);

    // Create profiles for users that don't have one
    const usersWithoutProfiles = talentUsers.filter(user => !existingUserIds.has(user.id));
    
    console.log(`Creating profiles for ${usersWithoutProfiles.length} users`);

    if (usersWithoutProfiles.length > 0) {
      const profilesToCreate = usersWithoutProfiles.map(user => ({
        userId: user.id,
        fullName: user.name || null,
        openToOpportunities: true,
      }));

      await db.insert(talentProfiles).values(profilesToCreate);
      console.log(`Created ${profilesToCreate.length} new talent profiles`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
} 