import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { talentProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ParsedResumeData {
  skills: string[];
  workExperience: any[];
  education: any[];
}

export async function POST(request: Request) {
  try {
    const { userId, resumeUrl } = await request.json();

    if (!userId || !resumeUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Download the PDF file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(resumeUrl.split('/').pop()!);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download resume' },
        { status: 500 }
      );
    }

    // Convert the file to base64
    const base64File = Buffer.from(await fileData.arrayBuffer()).toString('base64');

    // Call OpenAI's GPT-4 Vision API to parse the resume
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Please extract the following information from this resume in JSON format:\n1. Full Name\n2. Email\n3. Phone\n4. Skills (as an array)\n5. Work Experience (as an array of objects with company, title, dates, and description)\n6. Education (as an array of objects with school, degree, dates)\n7. Languages (if any)\n8. Certifications (if any)" },
            { type: "image", image_url: { url: `data:application/pdf;base64,${base64File}` } }
          ] as const
        }
      ],
      max_tokens: 4000,
    });

    const parsedData = JSON.parse(response.choices[0].message.content || '{}') as ParsedResumeData;
    
    // Store the parsed data in the database
    await db
      .insert(talentProfiles)
      .values({
        userId,
        resumeUrl,
        parsedData: JSON.stringify(parsedData),
        skills: parsedData.skills?.join(', ') || '',
        experience: JSON.stringify(parsedData.workExperience || []),
        education: JSON.stringify(parsedData.education || []),
      })
      .onConflictDoUpdate({
        target: [talentProfiles.userId],
        set: {
          resumeUrl,
          parsedData: JSON.stringify(parsedData),
          skills: parsedData.skills?.join(', ') || '',
          experience: JSON.stringify(parsedData.workExperience || []),
          education: JSON.stringify(parsedData.education || []),
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    );
  }
} 