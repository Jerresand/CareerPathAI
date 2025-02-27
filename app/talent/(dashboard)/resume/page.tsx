import { redirect } from 'next/navigation';
import { getUser, getTalentProfile } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';
import { ResumeUpload } from '@/components/ResumeUpload';
import { Button } from '@/components/ui/button';

export default async function ResumePage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const profile = await getTalentProfile(user.id);
  const parsedData = profile?.parsedData ? JSON.parse(profile.parsedData) : null;

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Your Resume Data</h1>
      
      <div className="grid gap-6">
        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResumeUpload />
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
                {profile?.skills ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.split(',').map((skill, index) => (
                      <span
                        key={index}
                        className="bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills extracted yet</p>
                )}
              </div>
              <div>
                <h3 className="font-medium mb-2">Experience</h3>
                {parsedData?.workExperience ? (
                  <div className="space-y-4">
                    {parsedData.workExperience.map((exp: any, index: number) => (
                      <div key={index} className="border-l-2 border-orange-200 pl-4">
                        <h4 className="font-medium">{exp.title}</h4>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.dates}</p>
                        <p className="text-sm mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No experience extracted yet</p>
                )}
              </div>
              <div>
                <h3 className="font-medium mb-2">Education</h3>
                {parsedData?.education ? (
                  <div className="space-y-4">
                    {parsedData.education.map((edu: any, index: number) => (
                      <div key={index} className="border-l-2 border-orange-200 pl-4">
                        <h4 className="font-medium">{edu.degree}</h4>
                        <p className="text-sm text-gray-600">{edu.school}</p>
                        <p className="text-sm text-gray-500">{edu.dates}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No education extracted yet</p>
                )}
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
            {profile?.resumeUrl ? (
              <div className="flex flex-col items-center">
                <FileText className="h-12 w-12 text-orange-500 mb-4" />
                <Button variant="outline" asChild>
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    View Resume
                  </a>
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-500">No resume uploaded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 