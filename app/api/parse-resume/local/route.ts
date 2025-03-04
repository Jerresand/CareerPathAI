import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { talentProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ParsedResumeData {
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
    const { userId, resumeText } = await request.json();

    if (!userId || !resumeText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`Processing resume text for user ${userId}`);
    console.log(`Text length: ${resumeText.length} characters`);
    
    // Send extracted text to OpenAI for parsing with a detailed prompt
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
          content: `Extract the following information from this resume text in JSON format:
          
1. fullName: The person's full name
2. email: Email address
3. phone: Phone number
4. skills: An array of skills mentioned in the resume
5. workExperience: An array of objects, each containing:
   - company: Company name
   - title: Job title
   - dates: Employment period (e.g., "Jan 2020 - Present")
   - description: Job description or achievements
6. education: An array of objects, each containing:
   - school: Institution name
   - degree: Degree obtained
   - dates: Study period
   - gpa: GPA if mentioned
7. languages: An array of languages the person knows
8. certifications: An array of certifications

Return ONLY valid JSON without any explanations or markdown formatting. If you can't find certain information, use null or empty arrays as appropriate.

Here's the resume text:
${resumeText}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000,
    });
    
    console.log('Received response from OpenAI');
    
    // Parse the JSON response
    if (!response.choices[0].message.content) {
      throw new Error('Empty response from OpenAI');
    }
    
    try {
      const parsedData = JSON.parse(response.choices[0].message.content) as ParsedResumeData;
      console.log('Successfully parsed JSON response');
      
      // We don't store the data in the database here - we'll do that after uploading the file
      // This keeps the data processing and storage in one place
      
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
  } catch (error: any) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: `Failed to parse resume: ${error.message}` },
      { status: 500 }
    );
  }
} 