import { Button } from '@/components/ui/button';
import { Upload, Briefcase } from 'lucide-react';

export default function TalentDashboard() {
  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-2">Find your next opportunity</p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Resume Upload Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
                <p className="text-gray-600 mt-1">Upload your resume to get started</p>
              </div>
              <Upload className="text-gray-400" />
            </div>
            <div className="mt-4">
              <Button className="w-full">
                Upload Resume
              </Button>
            </div>
          </div>

          {/* Job Matches Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Job Matches</h2>
                <p className="text-gray-600 mt-1">Opportunities based on your profile</p>
              </div>
              <Briefcase className="text-gray-400" />
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View Matches
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Job Listings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Job Listings</h2>
          </div>
          <div className="p-6">
            {/* This will be populated with actual job listings */}
            <p className="text-gray-600">No job listings available yet. Upload your resume to get matched with opportunities.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
