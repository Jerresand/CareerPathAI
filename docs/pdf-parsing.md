# PDF Resume Parsing

This document explains how CareerPathAI parses PDF resumes to extract structured information.

## Overview

The PDF parsing process follows these steps:

1. **PDF Upload**: User uploads a PDF resume through the UI
2. **Text Extraction**: We extract all text from the PDF using the `pdf-parse` library
3. **AI Processing**: The extracted text is sent to OpenAI's API for intelligent parsing
4. **Data Structuring**: The AI returns structured data in JSON format
5. **Database Storage**: The structured data is stored in the database for use in the application

## Implementation Details

### Text Extraction

We use the `pdf-parse` library to extract text from PDF files. This is a lightweight, efficient library that works well for most PDF documents.

```javascript
const pdfParse = require('pdf-parse');
const buffer = Buffer.from(await fileData.arrayBuffer());
const pdfData = await pdfParse(buffer);
const extractedText = pdfData.text;
```

### AI Processing

We use OpenAI's GPT-3.5 Turbo model to parse the extracted text. This model is cost-effective while still providing high-quality parsing results.

```javascript
const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: "You are a resume parsing assistant. Extract structured information from the resume text provided."
    },
    {
      role: "user",
      content: `Extract the following information from this resume text in JSON format:
      
1. fullName: The person's full name
2. email: Email address
3. phone: Phone number
4. skills: An array of skills mentioned in the resume
5. workExperience: An array of objects with company, title, dates, and description
6. education: An array of objects with school, degree, dates, and GPA
7. languages: An array of languages
8. certifications: An array of certifications

Here's the resume text:
${extractedText}`
    }
  ],
  response_format: { type: "json_object" },
  temperature: 0.3,
  max_tokens: 4000,
});
```

### Data Structure

The parsed data is structured as follows:

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1 (555) 123-4567",
  "skills": ["JavaScript", "React", "Node.js", "Python"],
  "workExperience": [
    {
      "company": "Tech Company Inc.",
      "title": "Senior Developer",
      "dates": "Jan 2020 - Present",
      "description": "Led development of web applications using React and Node.js."
    }
  ],
  "education": [
    {
      "school": "University of Technology",
      "degree": "Bachelor of Science in Computer Science",
      "dates": "2016 - 2020",
      "gpa": "3.8"
    }
  ],
  "languages": ["English", "Spanish"],
  "certifications": ["AWS Certified Developer", "Google Cloud Professional"]
}
```

## Testing

You can test the PDF parsing functionality using the provided test script:

```bash
node scripts/test-pdf-parse.js path/to/resume.pdf
```

This script will:
1. Extract text from the provided PDF
2. Send the text to OpenAI for parsing
3. Display the structured data returned by the AI

## Troubleshooting

### Common Issues

1. **Poor Text Extraction**: Some PDFs may have text embedded in images or use unusual fonts that make extraction difficult. In these cases, the extracted text may be incomplete or garbled.

2. **Missing Information**: If the AI doesn't find certain information in the resume, those fields will be empty or null in the returned JSON.

3. **Rate Limiting**: OpenAI has rate limits that may affect processing if you're parsing many resumes in a short period.

### Solutions

1. For PDFs with poor text extraction, consider using OCR (Optical Character Recognition) tools before parsing.

2. If important information is consistently missing, you may need to adjust the prompt to the AI to better target that information.

3. For rate limiting issues, implement a queue system for processing resumes during high-volume periods.

## Future Improvements

- Implement OCR for better text extraction from complex PDFs
- Add support for more document formats (DOCX, RTF, etc.)
- Create a feedback loop to improve parsing accuracy over time
- Implement a fallback mechanism for when the AI parsing fails 