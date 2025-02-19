import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, MapPin, Clock, Briefcase } from 'lucide-react';

export default async function JobMatchesPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Mock job matches data
  const jobMatches = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      type: 'Full-time',
      matchScore: 95,
      postedAt: '2 days ago',
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'StartupX',
      location: 'Remote',
      type: 'Full-time',
      matchScore: 88,
      postedAt: '1 day ago',
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Job Matches</h1>
      
      <div className="grid gap-6">
        {/* Match Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Match Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-orange-500">12</p>
                <p className="text-sm text-gray-500">New Matches</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-orange-500">95%</p>
                <p className="text-sm text-gray-500">Highest Match</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-orange-500">35</p>
                <p className="text-sm text-gray-500">Total Opportunities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-4">
          {jobMatches.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <div className="flex items-center space-x-4 text-gray-500">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {job.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.type}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.postedAt}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Match Score</p>
                      <p className="text-2xl font-bold text-orange-500">{job.matchScore}%</p>
                    </div>
                    <Button>View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 