import { db } from '../lib/db/drizzle';
import { users, teams, teamMembers, talentProfiles } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function setupRecruiterAndTeam() {
  console.log('Setting up recruiter and team...');

  try {
    // Check if recruiter already exists
    const [existingRecruiter] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'recruiter@example.com'));

    let recruiterId: number;

    if (existingRecruiter) {
      console.log(`Recruiter already exists with ID: ${existingRecruiter.id}`);
      recruiterId = existingRecruiter.id;
    } else {
      // Create a recruiter user
      const passwordHash = await bcrypt.hash('password123', 10);
      const [recruiter] = await db
        .insert(users)
        .values({
          name: 'John Recruiter',
          email: 'recruiter@example.com',
          passwordHash,
          userType: 'recruiter',
          role: 'admin',
        })
        .returning({ id: users.id });

      recruiterId = recruiter.id;
      console.log(`Created recruiter with ID: ${recruiterId}`);
    }

    // Check if team already exists
    const [existingTeam] = await db
      .select()
      .from(teams)
      .where(eq(teams.name, 'TalentHunters Inc.'));

    let teamId: number;

    if (existingTeam) {
      console.log(`Team already exists with ID: ${existingTeam.id}`);
      teamId = existingTeam.id;
    } else {
      // Create a team
      const [team] = await db
        .insert(teams)
        .values({
          name: 'TalentHunters Inc.',
          stripeCustomerId: 'cus_mock123',
          stripeSubscriptionId: 'sub_mock123',
          stripeProductId: 'prod_mock123',
          planName: 'Enterprise',
          subscriptionStatus: 'active',
        })
        .returning({ id: teams.id });

      teamId = team.id;
      console.log(`Created team with ID: ${teamId}`);
    }

    // Check if recruiter is already a team member
    const [existingTeamMember] = await db
      .select()
      .from(teamMembers)
      .where(
        eq(teamMembers.userId, recruiterId) && 
        eq(teamMembers.teamId, teamId)
      );

    if (!existingTeamMember) {
      // Add recruiter to team
      await db.insert(teamMembers).values({
        userId: recruiterId,
        teamId,
        role: 'admin',
      });
      console.log(`Added recruiter to team`);
    } else {
      console.log(`Recruiter is already a team member`);
    }

    console.log('Recruiter and team setup completed successfully');
    return { recruiterId, teamId };
  } catch (error) {
    console.error('Error setting up recruiter and team:', error);
    throw error;
  }
}

async function createTalentGroups() {
  console.log('Creating talent groups...');

  try {
    // Get all talent profiles
    const talents = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        profile: talentProfiles,
      })
      .from(users)
      .leftJoin(talentProfiles, eq(users.id, talentProfiles.userId))
      .where(eq(users.userType, 'talent'));

    console.log(`Found ${talents.length} talents`);

    // Group talents by skills
    const frontendTalents = talents.filter(talent => 
      talent.profile?.skills?.toLowerCase().includes('react') || 
      talent.profile?.skills?.toLowerCase().includes('javascript')
    );

    const backendTalents = talents.filter(talent => 
      talent.profile?.skills?.toLowerCase().includes('python') || 
      talent.profile?.skills?.toLowerCase().includes('java') ||
      talent.profile?.skills?.toLowerCase().includes('backend')
    );

    const designTalents = talents.filter(talent => 
      talent.profile?.skills?.toLowerCase().includes('design') || 
      talent.profile?.skills?.toLowerCase().includes('ux') ||
      talent.profile?.skills?.toLowerCase().includes('ui')
    );

    console.log(`Grouped talents: Frontend (${frontendTalents.length}), Backend (${backendTalents.length}), Design (${designTalents.length})`);

    console.log('Talent grouping completed successfully');
  } catch (error) {
    console.error('Error creating talent groups:', error);
    throw error;
  }
}

async function main() {
  console.log('Setting up talent data...');
  
  try {
    // Setup recruiter and team
    await setupRecruiterAndTeam();
    
    // Create talent groups
    await createTalentGroups();
    
    console.log('Talent data setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Talent data setup failed:', error);
    process.exit(1);
  }
}

// Run the setup function if this file is executed directly
if (require.main === module) {
  main();
} 