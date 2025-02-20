import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export default async function TalentPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Welcome back{user.name ? `, ${user.name}` : ''}</h1>
          <p className="text-gray-600 mt-2">Manage your career journey from here</p>
        </div>
        <Avatar className="h-12 w-12">
          <div className="flex h-full w-full items-center justify-center bg-orange-100 text-orange-900">
            {user.name ? user.name[0].toUpperCase() : 'T'}
          </div>
        </Avatar>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-orange-50 border-orange-100">
          <CardHeader>
            <CardTitle>Resume Status</CardTitle>
            <CardDescription>Your career profile visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-orange-600">70%</span>
            </div>
            <div className="w-full h-2 bg-orange-100 rounded-full mt-2">
              <div className="w-[70%] h-full bg-orange-500 rounded-full"></div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
              <a href="/talent/resume">Update Resume</a>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Matches</CardTitle>
            <CardDescription>Personalized opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>New matches</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">5 new</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Match accuracy</span>
                <span className="text-orange-600">85%</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <a href="/talent/matches">View Matches</a>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Profile visibility</span>
                <span className="text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Job alerts</span>
                <span className="text-green-600">Enabled</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <a href="/talent/profile">Edit Profile</a>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Resume Updated</p>
                <p className="text-sm text-gray-600">Your resume was successfully updated</p>
              </div>
              <span className="ml-auto text-sm text-gray-500">2 days ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">New Job Match</p>
                <p className="text-sm text-gray-600">You have a new job match from TechCorp</p>
              </div>
              <span className="ml-auto text-sm text-gray-500">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 