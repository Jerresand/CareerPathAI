import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">My Profile</h1>
      
      <div className="grid gap-6">
        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`/placeholder.svg?height=80&width=80`} alt={user.name || 'User'} />
                <AvatarFallback>
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user.name || 'Add your name'}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume Status */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-gray-500">Last updated: Not uploaded yet</p>
              <p>Upload your resume to start receiving job matches!</p>
            </div>
          </CardContent>
        </Card>

        {/* Job Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Job Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Desired Role</h3>
                <p className="text-gray-500">Not set</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Location Preference</h3>
                <p className="text-gray-500">Not set</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Experience Level</h3>
                <p className="text-gray-500">Not set</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 