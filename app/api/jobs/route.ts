import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { jobListings, jobApplications } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { z } from 'zod';

// Schema for validating the request body
const createJobSchema = z.object({
  teamId: z.number(),
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(1, 'Job description is required'),
  requirements: z.string().optional(),
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
        { error: 'Only recruiters can create job listings' },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = createJobSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { teamId, title, description, requirements, talentIds } = validationResult.data;

    // Create the job listing
    const [newJob] = await db
      .insert(jobListings)
      .values({
        teamId,
        title,
        description,
        requirements: requirements || null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create job applications for each selected talent
    const jobApplicationsData = talentIds.map(talentId => ({
      jobId: newJob.id,
      talentId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(jobApplications).values(jobApplicationsData);

    return NextResponse.json(
      { 
        message: 'Job listing created successfully',
        job: newJob,
        applicationsSent: talentIds.length
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating job listing:', error);
    return NextResponse.json(
      { error: 'Failed to create job listing' },
      { status: 500 }
    );
  }
} 