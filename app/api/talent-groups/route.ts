import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { talentGroups } from '@/lib/db/schema';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { z } from 'zod';

// Schema for validating the request body
const createTalentGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  talentIds: z.array(z.number()).min(1, 'At least one talent must be selected'),
});

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a recruiter
    if (user.userType !== 'recruiter') {
      return NextResponse.json(
        { error: 'Only recruiters can create talent groups' },
        { status: 403 }
      );
    }

    // Get the team for the user
    const team = await getTeamForUser(user.id);
    if (!team) {
      return NextResponse.json(
        { error: 'User is not associated with a team' },
        { status: 400 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = createTalentGroupSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { name, talentIds } = validationResult.data;

    // Create the talent group
    const [newGroup] = await db
      .insert(talentGroups)
      .values({
        teamId: team.id,
        name,
        filterCriteria: JSON.stringify({ talentIds }),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { 
        message: 'Talent group created successfully',
        group: newGroup
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating talent group:', error);
    return NextResponse.json(
      { error: 'Failed to create talent group' },
      { status: 500 }
    );
  }
} 