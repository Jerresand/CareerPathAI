import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { talentProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const parsedDataStr = formData.get('parsedData') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Parse the parsed data JSON
    let parsedData;
    try {
      if (parsedDataStr) {
        parsedData = JSON.parse(parsedDataStr);
      }
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      return NextResponse.json(
        { error: 'Invalid JSON data' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}.${fileExtension}`;
    
    // Create a path with user ID as folder
    const filePath = `${userId}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to Supabase Storage with user ID as folder
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    const resumeUrl = urlData.publicUrl;

    // Store the parsed data in the database if available
    if (parsedData) {
      try {
        // First check if a profile already exists for this user
        const existingProfiles = await db
          .select()
          .from(talentProfiles)
          .where(eq(talentProfiles.userId, parseInt(userId)));
        
        if (existingProfiles.length > 0) {
          // Update existing profile
          await db
            .update(talentProfiles)
            .set({
              resumeUrl,
              parsedData: JSON.stringify(parsedData),
              skills: parsedData.skills?.join(', ') || '',
              experience: JSON.stringify(parsedData.workExperience || []),
              education: JSON.stringify(parsedData.education || []),
              updatedAt: new Date(),
            })
            .where(eq(talentProfiles.userId, parseInt(userId)));
          
          console.log('Updated existing talent profile');
        } else {
          // Insert new profile
          await db
            .insert(talentProfiles)
            .values({
              userId: parseInt(userId),
              resumeUrl,
              parsedData: JSON.stringify(parsedData),
              skills: parsedData.skills?.join(', ') || '',
              experience: JSON.stringify(parsedData.workExperience || []),
              education: JSON.stringify(parsedData.education || []),
            });
          
          console.log('Created new talent profile');
        }
        
        console.log('Data stored in database successfully');
      } catch (dbError: any) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: `Database error: ${dbError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      url: resumeUrl,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Failed to upload file: ${error.message}` },
      { status: 500 }
    );
  }
}