'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Send, Plus } from 'lucide-react';

type SelectedTalent = {
  id: number;
  name: string | null;
  email: string;
};

type JobCreationFormProps = {
  teamId: number;
  selectedTalents: SelectedTalent[];
};

export default function JobCreationForm({ teamId, selectedTalents }: JobCreationFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [talents, setTalents] = useState<SelectedTalent[]>(selectedTalents);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Job title is required');
      return;
    }

    if (!description.trim()) {
      setError('Job description is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId,
          title,
          description,
          requirements,
          talentIds: talents.map(t => t.id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job listing');
      }

      setSuccess(`Job listing "${title}" created and sent to ${talents.length} talents`);
      
      // Reset form after successful submission
      setTitle('');
      setDescription('');
      setRequirements('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create job listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeTalent = (id: number) => {
    setTalents(talents.filter(talent => talent.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <Card className="p-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the job role, responsibilities, and company information"
            className="w-full min-h-[150px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
            Requirements
          </label>
          <textarea
            id="requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="List the skills, experience, and qualifications required"
            className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Selected Talents ({talents.length})</h2>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => window.location.href = '/recruiter/talent-pool'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add More Talents
          </Button>
        </div>

        {talents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No talents selected. Go to the Talent Pool to select talents.</p>
            <Button 
              type="button"
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.href = '/recruiter/talent-pool'}
            >
              Go to Talent Pool
            </Button>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {talents.map((talent) => (
                  <tr key={talent.id} className="border-b">
                    <td className="px-4 py-3 font-medium">{talent.name || 'N/A'}</td>
                    <td className="px-4 py-3">{talent.email}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTalent(talent.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="mr-2"
          onClick={() => window.location.href = '/recruiter/jobs'}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !title.trim() || !description.trim() || talents.length === 0}
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Creating...' : 'Create & Send Job'}
        </Button>
      </div>
    </form>
  );
} 