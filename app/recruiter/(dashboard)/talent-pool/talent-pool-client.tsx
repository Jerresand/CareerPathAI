'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, Send, Save } from 'lucide-react';
import { formatDate } from '@/lib/utils';

// Define the types for our talent data
type TalentProfile = {
  id: number;
  userId: number;
  resumeUrl: string | null;
  parsedData: string | null;
  
  // Personal information
  fullName: string | null;
  phoneNumber: string | null;
  location: string | null;
  
  // Professional information
  currentTitle: string | null;
  currentCompany: string | null;
  yearsOfExperience: number | null;
  
  // Skills and qualifications
  skills: string | null;
  primarySkills: string | null;
  
  // Experience and education
  experience: string | null;
  education: string | null;
  
  // Career preferences
  desiredRole: string | null;
  desiredSalary: string | null;
  desiredLocation: string | null;
  remotePreference: string | null;
  
  // Availability and status
  availabilityDate: Date | null;
  currentlyEmployed: boolean | null;
  openToOpportunities: boolean | null;
  
  // Recruiter notes and ratings
  recruiterNotes: string | null;
  talentRating: number | null;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
};

type Talent = {
  id: number;
  name: string | null;
  email: string;
  createdAt: Date;
  profile: TalentProfile | null;
};

type TalentPoolClientProps = {
  talents: Talent[];
};

export default function TalentPoolClient({ talents }: TalentPoolClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: '',
    experience: '',
    education: '',
  });
  const [selectedTalents, setSelectedTalents] = useState<number[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showGroupNameInput, setShowGroupNameInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Parse skills, experience, and education from the JSON string
  const processedTalents = useMemo(() => {
    return talents.map((talent) => {
      let skills: string[] = [];
      let latestExperience: any = null;
      let latestEducation: any = null;

      if (talent.profile?.skills) {
        try {
          skills = JSON.parse(talent.profile.skills);
        } catch (e) {
          skills = talent.profile.skills.split(',').map((s) => s.trim());
        }
      }

      // Process work experience to get the latest one
      if (talent.profile?.experience) {
        try {
          const experiences = JSON.parse(talent.profile.experience);
          if (Array.isArray(experiences) && experiences.length > 0) {
            // Find the latest experience based on end date
            latestExperience = experiences.reduce((latest, current) => {
              // Parse dates - handle "Present" or current dates
              const currentEndDate = current.dates?.split('-')?.[1]?.trim();
              const latestEndDate = latest.dates?.split('-')?.[1]?.trim();
              
              // If current position has "Present" as end date, it's the latest
              if (currentEndDate === 'Present') return current;
              if (latestEndDate === 'Present') return latest;
              
              // Otherwise compare dates if both exist
              if (currentEndDate && latestEndDate) {
                // Simple string comparison works for dates in format "MMM YYYY"
                return currentEndDate > latestEndDate ? current : latest;
              }
              
              // If dates can't be compared, prefer the first one in the array
              return latest;
            }, experiences[0]);
          }
        } catch (e) {
          console.error('Error parsing experience JSON:', e);
        }
      }

      // Process education to get the latest one
      if (talent.profile?.education) {
        try {
          const educations = JSON.parse(talent.profile.education);
          if (Array.isArray(educations) && educations.length > 0) {
            // Find the latest education based on end date
            latestEducation = educations.reduce((latest, current) => {
              // Parse dates
              const currentEndDate = current.dates?.split('-')?.[1]?.trim();
              const latestEndDate = latest.dates?.split('-')?.[1]?.trim();
              
              // If dates can be compared
              if (currentEndDate && latestEndDate) {
                // Simple string comparison works for dates in format "MMM YYYY"
                return currentEndDate > latestEndDate ? current : latest;
              }
              
              // If dates can't be compared, prefer the first one in the array
              return latest;
            }, educations[0]);
          }
        } catch (e) {
          console.error('Error parsing education JSON:', e);
        }
      }

      // Format the latest experience for display
      const formattedExperience = latestExperience ? 
        `${latestExperience.title || 'Role'} at ${latestExperience.company || 'Company'}${latestExperience.dates ? ` (${latestExperience.dates})` : ''}` : 
        '';

      // Format the latest education for display
      const formattedEducation = latestEducation ? 
        `${latestEducation.degree || 'Degree'} at ${latestEducation.school || 'School'}${latestEducation.dates ? ` (${latestEducation.dates})` : ''}` : 
        '';

      return {
        ...talent,
        processedSkills: Array.isArray(skills) ? skills : [skills],
        processedExperience: formattedExperience,
        processedEducation: formattedEducation,
        // Keep the raw data for potential detailed view
        rawExperience: talent.profile?.experience ? JSON.parse(talent.profile.experience) : [],
        rawEducation: talent.profile?.education ? JSON.parse(talent.profile.education) : []
      };
    });
  }, [talents]);

  // Filter talents based on search term and filters
  const filteredTalents = useMemo(() => {
    return processedTalents.filter((talent) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = talent.name?.toLowerCase().includes(searchLower) || false;
      const emailMatch = talent.email.toLowerCase().includes(searchLower);
      const skillsMatch = talent.processedSkills.some((skill) => 
        typeof skill === 'string' && skill.toLowerCase().includes(searchLower)
      );

      const searchMatch = nameMatch || emailMatch || skillsMatch;
      
      // Skills filter
      const skillsFilter = filters.skills === '' || 
        talent.processedSkills.some((skill) => 
          typeof skill === 'string' && skill.toLowerCase().includes(filters.skills.toLowerCase())
        );
      
      // Experience filter
      const experienceFilter = filters.experience === '' || 
        (talent.processedExperience && 
          talent.processedExperience.toLowerCase().includes(filters.experience.toLowerCase()));
      
      // Education filter
      const educationFilter = filters.education === '' || 
        (talent.processedEducation && 
          talent.processedEducation.toLowerCase().includes(filters.education.toLowerCase()));
      
      return searchMatch && skillsFilter && experienceFilter && educationFilter;
    });
  }, [processedTalents, searchTerm, filters]);

  // Toggle talent selection
  const toggleTalentSelection = (id: number) => {
    setSelectedTalents((prev) => 
      prev.includes(id) 
        ? prev.filter((talentId) => talentId !== id) 
        : [...prev, id]
    );
  };

  // Select all visible talents
  const selectAllVisible = () => {
    setSelectedTalents(filteredTalents.map((talent) => talent.id));
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedTalents([]);
  };

  // Save current selection as a talent group
  const saveAsTalentGroup = async () => {
    if (selectedTalents.length === 0) {
      setError('Please select at least one talent');
      return;
    }

    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/talent-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          talentIds: selectedTalents,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save talent group');
      }

      setSuccess(`Saved ${selectedTalents.length} talents as "${groupName}"`);
      setGroupName('');
      setShowGroupNameInput(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save talent group');
    } finally {
      setIsSaving(false);
    }
  };

  // Send job to selected talents
  const sendJobToTalents = () => {
    if (selectedTalents.length === 0) {
      setError('Please select at least one talent');
      return;
    }
    
    // Redirect to job creation page with selected talents
    window.location.href = `/recruiter/jobs/create?talents=${selectedTalents.join(',')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Talent Pool</h1>
        <div className="flex space-x-2">
          {showGroupNameInput ? (
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-48"
              />
              <Button 
                variant="outline" 
                onClick={() => setShowGroupNameInput(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={saveAsTalentGroup}
                disabled={isSaving || !groupName.trim() || selectedTalents.length === 0}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowGroupNameInput(true)}
                disabled={selectedTalents.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Group
              </Button>
              <Button 
                onClick={sendJobToTalents}
                disabled={selectedTalents.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Job
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <Card className="p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Filter by skills"
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                className="pl-10 w-40"
              />
            </div>
            <Input
              placeholder="Experience"
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              className="w-40"
            />
            <Input
              placeholder="Education"
              value={filters.education}
              onChange={(e) => setFilters({ ...filters, education: e.target.value })}
              className="w-40"
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input 
                    type="checkbox" 
                    checked={
                      filteredTalents.length > 0 && 
                      filteredTalents.every(t => selectedTalents.includes(t.id))
                    }
                    onChange={() => {
                      if (filteredTalents.every(t => selectedTalents.includes(t.id))) {
                        clearSelections();
                      } else {
                        selectAllVisible();
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Skills</th>
                <th className="px-4 py-3">Latest Experience</th>
                <th className="px-4 py-3">Latest Education</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Resume</th>
              </tr>
            </thead>
            <tbody>
              {filteredTalents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No talents found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredTalents.map((talent) => (
                  <tr 
                    key={talent.id} 
                    className={`border-b hover:bg-gray-50 ${
                      selectedTalents.includes(talent.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedTalents.includes(talent.id)}
                        onChange={() => toggleTalentSelection(talent.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{talent.name || 'N/A'}</td>
                    <td className="px-4 py-3">{talent.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {talent.processedSkills.length > 0 ? (
                          talent.processedSkills.slice(0, 3).map((skill, i) => (
                            <span 
                              key={i} 
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          'N/A'
                        )}
                        {talent.processedSkills.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{talent.processedSkills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {talent.processedExperience ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{talent.processedExperience}</span>
                          {talent.rawExperience && talent.rawExperience.length > 1 && (
                            <span className="text-xs text-gray-500">
                              +{talent.rawExperience.length - 1} more positions
                            </span>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {talent.processedEducation ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{talent.processedEducation}</span>
                          {talent.rawEducation && talent.rawEducation.length > 1 && (
                            <span className="text-xs text-gray-500">
                              +{talent.rawEducation.length - 1} more qualifications
                            </span>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(talent.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {talent.profile?.resumeUrl ? (
                        <a 
                          href={talent.profile.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          View
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedTalents.length} of {filteredTalents.length} talents selected
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearSelections}
              disabled={selectedTalents.length === 0}
            >
              Clear Selection
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={selectAllVisible}
              disabled={filteredTalents.length === 0 || 
                (filteredTalents.length > 0 && 
                filteredTalents.every(t => selectedTalents.includes(t.id)))}
            >
              Select All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}