import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, talentProfiles } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser(userId: number) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      teamMembers: {
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.teamMembers[0]?.team || null;
}

export async function getTalentProfile(userId: number) {
  const [profile] = await db
    .select()
    .from(talentProfiles)
    .where(eq(talentProfiles.userId, userId));
  
  return profile;
}

/**
 * Creates a talent profile for a user if one doesn't exist
 * @param userId The ID of the user to create a profile for
 * @returns The created or existing talent profile
 */
export async function ensureTalentProfileExists(userId: number) {
  // Check if profile already exists
  const existingProfile = await getTalentProfile(userId);
  
  if (existingProfile) {
    return existingProfile;
  }
  
  // Get user data to pre-fill some profile fields
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }
  
  // Create a new profile with basic information from user
  const [newProfile] = await db
    .insert(talentProfiles)
    .values({
      userId,
      fullName: user.name || null,
      // Initialize with empty values for required fields
      skills: null,
      experience: null,
      education: null,
      openToOpportunities: true,
    })
    .returning();
  
  return newProfile;
}

/**
 * Updates a talent profile with new data
 * @param userId The ID of the user whose profile to update
 * @param profileData The new profile data
 * @returns The updated talent profile
 */
export async function updateTalentProfile(userId: number, profileData: Partial<typeof talentProfiles.$inferInsert>) {
  // Ensure profile exists
  await ensureTalentProfileExists(userId);
  
  // Update the profile
  const [updatedProfile] = await db
    .update(talentProfiles)
    .set({
      ...profileData,
      updatedAt: new Date(),
    })
    .where(eq(talentProfiles.userId, userId))
    .returning();
  
  return updatedProfile;
}

/**
 * Gets all talent users with their profiles
 * Creates profiles for talents that don't have one
 * @returns Array of talent users with their profiles
 */
export async function getAllTalentsWithProfiles() {
  // Get all talent users
  const talentUsers = await db
    .select()
    .from(users)
    .where(eq(users.userType, 'talent'));
  
  // Ensure each talent has a profile
  for (const user of talentUsers) {
    await ensureTalentProfileExists(user.id);
  }
  
  // Get all talents with their profiles
  const talents = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      profile: talentProfiles,
    })
    .from(users)
    .leftJoin(talentProfiles, eq(users.id, talentProfiles.userId))
    .where(eq(users.userType, 'talent'));
  
  return talents;
}
