'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function ResumeUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload resume');
      }

      // Here you would typically:
      // 1. Call your AI parser service to extract information
      // 2. Save the parsed data to your database
      // 3. Redirect to profile completion if needed

      console.log('Upload successful:', result);
      router.push('/talent');
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`bg-white border-2 ${
          isDragActive ? 'border-orange-500' : 'border-orange-200'
        } border-dashed rounded-xl p-12 text-center hover:border-orange-500 transition-colors cursor-pointer relative ${
          uploading ? 'pointer-events-none' : ''
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
            <p className="mt-4 text-gray-600">Uploading your resume...</p>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop your resume here' : 'Drop your file here'}
            </h3>
            <p className="text-gray-600 mb-6">or click to upload</p>
            <Button size="lg" className="text-lg px-8">
              Upload Resume
            </Button>
          </>
        )}
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center justify-between">
          <p className="text-red-600">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 