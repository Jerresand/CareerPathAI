// Test script for PDF parsing
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function parsePdf(filePath) {
  try {
    console.log('\n=== PDF Resume Parser Test ===\n');
    console.log(`Step 1: Reading PDF file from ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    console.log('\nStep 2: Extracting text from PDF');
    // Extract text from PDF
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text;
    
    console.log('\nPDF Information:');
    console.log('----------------');
    console.log(`Title: ${pdfData.info.Title || 'No title'}`);
    console.log(`Pages: ${pdfData.numpages}`);
    console.log(`Characters extracted: ${extractedText.length}`);
    
    if (extractedText.length === 0) {
      throw new Error('No text was extracted from the PDF. The file might be empty or corrupted.');
    }
    
    console.log('\nStep 3: Sending text to OpenAI for parsing');
    console.log('Please wait, this may take a few moments...');
    
    // Send to OpenAI for parsing
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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

Return ONLY valid JSON without any explanations or markdown formatting. If you can't find certain information, use null or empty arrays as appropriate.

Here's the resume text:
${extractedText}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000,
    });

    console.log('\nStep 4: Parsing and validating the JSON response');
    // Parse the JSON response
    const parsedData = JSON.parse(response.choices[0].message.content);
    
    console.log('\nStep 5: Results');
    console.log('-------------');
    
    // Print a summary first
    console.log('Summary:');
    console.log(`- Name: ${parsedData.fullName || 'Not found'}`);
    console.log(`- Email: ${parsedData.email || 'Not found'}`);
    console.log(`- Phone: ${parsedData.phone || 'Not found'}`);
    console.log(`- Skills found: ${parsedData.skills?.length || 0}`);
    console.log(`- Work experiences: ${parsedData.workExperience?.length || 0}`);
    console.log(`- Education entries: ${parsedData.education?.length || 0}`);
    console.log(`- Languages: ${parsedData.languages?.length || 0}`);
    console.log(`- Certifications: ${parsedData.certifications?.length || 0}`);
    
    console.log('\nDetailed Results:');
    console.log(JSON.stringify(parsedData, null, 2));
    
    return parsedData;
  } catch (error) {
    console.error('\nError:', error.message);
    if (error.message.includes('OPENAI_API_KEY')) {
      console.error('\nMake sure you have set your OPENAI_API_KEY in the .env file!');
    }
    throw error;
  }
}

// Main function
async function main() {
  if (process.argv.length < 3) {
    console.error('\nError: No PDF file specified');
    console.log('\nUsage:');
    console.log('  node scripts/test-pdf-parse.js <path-to-pdf-file>');
    console.log('\nExample:');
    console.log('  node scripts/test-pdf-parse.js ./test-files/CVFeb25.pdf');
    process.exit(1);
  }
  
  const filePath = process.argv[2];
  
  try {
    await parsePdf(filePath);
  } catch (error) {
    process.exit(1);
  }
}

main(); 