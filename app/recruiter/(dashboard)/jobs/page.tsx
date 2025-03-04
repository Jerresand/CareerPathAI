import { redirect } from 'next/navigation';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { jobListings, jobApplications } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, ExternalLink, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function JobsPage() {
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

  // Fetch all job listings with application counts
  const jobsWithCounts = await db
    .select({
      job: jobListings,
      applicationCount: count(jobApplications.id),
    })
    .from(jobListings)
    .leftJoin(jobApplications, eq(jobListings.id, jobApplications.jobId))
    .where(eq(jobListings.teamId, team.id))
    .groupBy(jobListings.id)
    .orderBy(jobListings.createdAt);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Job Listings</h1>
          <p className="text-gray-500">
            Manage your job listings and track applications
          </p>
        </div>
        <Link href="/recruiter/jobs/create" passHref>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Job
          </Button>
        </Link>
      </div>

      {jobsWithCounts.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-medium mb-2">No job listings yet</h2>
          <p className="text-gray-500 mb-6">
            Create your first job listing to start matching with talents
          </p>
          <Link href="/recruiter/jobs/create" passHref>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Job Listing
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobsWithCounts.map(({ job, applicationCount }) => (
            <Card key={job.id} className="overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-2 line-clamp-1">{job.title}</h2>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">{applicationCount}</span> applications
                  </div>
                  <Link href={`/recruiter/jobs/${job.id}`} passHref>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Created {formatDate(job.createdAt, 'display')}
                </div>
                <div className="text-xs font-medium">
                  <span className={`px-2 py-1 rounded-full ${
                    job.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : job.status === 'draft'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 