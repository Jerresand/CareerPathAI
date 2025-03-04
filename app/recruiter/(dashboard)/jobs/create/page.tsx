import { redirect } from 'next/navigation';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import JobCreationForm from './job-creation-form';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

export default async function CreateJobPage({
  searchParams,
}: {
  searchParams: { talents?: string };
}) {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.userType !== 'recruiter') {
    redirect('/talent');
  }

  const team = await getTeamForUser(user.id);
  if (!team) {
    throw new Error('Team not found');
  }

  // Parse the talents from the query params
  let selectedTalents: { id: number; name: string | null; email: string }[] = [];
  
  if (searchParams.talents) {
    const talentIds = searchParams.talents.split(',').map(Number);
    
    if (talentIds.length > 0) {
      // Fetch the talent details
      selectedTalents = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(inArray(users.id, talentIds));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Job Listing</h1>
        <p className="text-gray-500">
          Create a new job listing and send it to selected talents
        </p>
      </div>

      <JobCreationForm teamId={team.id} selectedTalents={selectedTalents} />
    </div>
  );
} 