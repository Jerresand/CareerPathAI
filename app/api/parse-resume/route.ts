import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { talentProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import pdfParse from 'pdf-parse';

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
  isResume: boolean;
  errorMessage?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  skills: string[];
  workExperience: any[];
  education: any[];
  languages?: string[];
  certifications?: string[];
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

    console.log(`Processing resume for user ${userId} with URL ${resumeUrl}`);

    // Extract the file path from the URL
    // The URL format is like: https://[supabase-project].supabase.co/storage/v1/object/public/resumes/[userId]/[filename]
    const urlParts = resumeUrl.split('/');
    const filePath = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
    
    console.log(`Extracting file from path: ${filePath}`);
    
    // Download the PDF file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download resume' },
        { status: 500 }
      );
    }

    console.log('PDF file downloaded successfully');

    // Step 1: Extract text from PDF using pdf-parse
    try {
      const buffer = Buffer.from(await fileData.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      const extractedText = pdfData.text;
      
      console.log(`Extracted ${extractedText.length} characters from PDF`);
      
      if (extractedText.length === 0) {
        throw new Error('No text was extracted from the PDF');
      }
      
      // Step 2 & 3: Send extracted text to OpenAI for parsing with a detailed prompt
      console.log('Sending text to OpenAI for parsing...');
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Using a more cost-effective model
        messages: [
          {
            role: "system",
            content: "You are a resume parsing assistant. Extract structured information from the resume text provided. Be thorough and accurate."
          },
          {
            role: "user",
            content: `First, determine if this document is a resume. Then extract the following information from this resume text in JSON format:

0. isResume: Boolean indicating whether this document appears to be a resume
1. fullName: The person's full name
2. email: Email address
3. phone: Phone number
4. skills: An array of skills mentioned in the resume
5. workExperience: An array of objects, each containing:
   - company: Company name
   - title: Job title
   - dates: Employment period (e.g., "Jan 2020 - Present" or "Jan 2020 - Dec 2022")
   - description: Job description or achievements
6. education: An array of objects, each containing:
   - school: Institution name
   - degree: Degree obtained
   - dates: Study period (e.g., "Sep 2015 - Jun 2019")
   - gpa: GPA if mentioned
7. languages: An array of languages the person knows
8. certifications: An array of certifications

Important notes:
- For dates, always use the format "MMM YYYY - MMM YYYY" (e.g., "Jan 2020 - Dec 2022") or "MMM YYYY - Present" for current positions
- Sort workExperience and education arrays with the most recent experiences first (based on end date)
- If you can't determine exact dates, make your best guess based on the context

Return ONLY valid JSON without any explanations or markdown formatting. If this is not a resume, set isResume to false and include an error message field. If you can't find certain information, write "TOO LITTLE INFORMATION" as the only JSON output, to help me debug. 

Here's the resume text:
${extractedText}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 4000,
      });
      
      console.log('Received response from OpenAI');
      
      // Step 4: Parse the JSON response
      if (!response.choices[0].message.content) {
        throw new Error('Empty response from OpenAI');
      }
      
      try {
        const parsedData = JSON.parse(response.choices[0].message.content) as ParsedResumeData;
        console.log('Successfully parsed JSON response');
        
        // Check if the document is a resume
        if (!parsedData.isResume) {
          return NextResponse.json(
            { 
              success: false, 
              error: parsedData.errorMessage || 'The uploaded document does not appear to be a resume. Please upload a resume document.' 
            },
            { status: 400 }
          );
        }
        
        // Step 5: Store the parsed data in the database
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
        
        console.log('Data stored in database successfully');
        
        return NextResponse.json({
          success: true,
          data: parsedData
        });
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        console.error('Raw response content:', response.choices[0].message.content);
        return NextResponse.json(
          { error: 'Failed to parse OpenAI response as JSON' },
          { status: 500 }
        );
      }
    } catch (pdfError: any) {
      console.error('Error processing PDF:', pdfError);
      return NextResponse.json(
        { error: `PDF processing error: ${pdfError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: `Failed to parse resume: ${error.message}` },
      { status: 500 }
    );
  }
} 