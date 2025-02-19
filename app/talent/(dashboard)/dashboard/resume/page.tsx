import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';

export default async function ResumePage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Resume</h1>
      
      <div className="grid gap-6">
        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-gray-300 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">Drop your resume here</h3>
              <p className="mt-2 text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX (Max size: 5MB)
              </p>
              <Button className="mt-4">
                <FileText className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Parsed Information */}
        <Card>
          <CardHeader>
            <CardTitle>Parsed Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Skills</h3>
                <p className="text-gray-500">No skills extracted yet</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Experience</h3>
                <p className="text-gray-500">No experience extracted yet</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Education</h3>
                <p className="text-gray-500">No education extracted yet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">No resume uploaded yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 