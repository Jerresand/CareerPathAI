import { Button } from '@/components/ui/button';
import { Users, FileSpreadsheet, CreditCard, Send } from 'lucide-react';

export default function RecruiterDashboard() {
  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your talent pool and job listings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Available Credits</h3>
            <p className="text-2xl font-semibold mt-2">50</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Active Job Listings</h3>
            <p className="text-2xl font-semibold mt-2">3</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Total Applications</h3>
            <p className="text-2xl font-semibold mt-2">127</p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Talent Pool Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Talent Pool</h2>
                <p className="text-gray-600 mt-1">Filter and manage candidates</p>
              </div>
              <FileSpreadsheet className="text-gray-400" />
            </div>
            <div className="mt-4">
              <Button className="w-full">
                View Talent Pool
              </Button>
            </div>
          </div>

          {/* Post Job Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Post a Job</h2>
                <p className="text-gray-600 mt-1">Create and manage job listings</p>
              </div>
              <Send className="text-gray-400" />
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                Create Job Listing
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Talent Groups */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Saved Talent Groups</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* This will be populated with actual talent groups */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Senior Developers</h3>
                  <p className="text-sm text-gray-600">42 candidates matching criteria</p>
                </div>
                <Button size="sm" variant="outline">View Group</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">UI/UX Designers</h3>
                  <p className="text-sm text-gray-600">28 candidates matching criteria</p>
                </div>
                <Button size="sm" variant="outline">View Group</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
