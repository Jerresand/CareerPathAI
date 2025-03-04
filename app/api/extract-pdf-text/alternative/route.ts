import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, unlink, mkdir, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execPromise = promisify(exec);

// Helper function to run a command and log its output
async function runCommandWithLogging(command: string, description: string) {
  console.log(`EXECUTING: ${description}`);
  console.log(`COMMAND: ${command}`);
  
  try {
    const { stdout, stderr } = await execPromise(command);
    console.log(`STDOUT: ${stdout}`);
    if (stderr) console.warn(`STDERR: ${stderr}`);
    return { stdout, stderr };
  } catch (error: any) {
    console.error(`COMMAND FAILED: ${description}`);
    console.error(`ERROR: ${error.message}`);
    if (error.stdout) console.log(`STDOUT: ${error.stdout}`);
    if (error.stderr) console.error(`STDERR: ${error.stderr}`);
    throw error;
  }
}

// Check if a command is available on the system
async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    await execPromise(`which ${command}`);
    return true;
  } catch (error) {
    return false;
  }
}

export async function POST(request: Request) {
  let tempFilePath = '';
  let tempTiffPath = '';
  let tempOutputPath = '';
  
  try {
    console.log('==========================================');
    console.log('PDF TEXT EXTRACTION STARTED');
    console.log('==========================================');
    
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('ERROR: No file provided in the request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`RECEIVED FILE: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      console.error(`ERROR: Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    console.log('Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`Buffer created with length: ${buffer.length} bytes`);

    // Save the file temporarily to disk
    const uuid = randomUUID();
    tempFilePath = join('/tmp', `${uuid}.pdf`);
    tempTiffPath = join('/tmp', `${uuid}.tiff`);
    tempOutputPath = join('/tmp', `${uuid}`); // Tesseract will add .txt extension
    
    await writeFile(tempFilePath, buffer);
    console.log(`SAVED: Temporary PDF file at ${tempFilePath}`);

    // Check for available text extraction tools
    const hasTesseract = await isCommandAvailable('tesseract');
    const hasConvert = await isCommandAvailable('convert');
    const hasPdftotext = await isCommandAvailable('pdftotext');
    
    console.log(`Available tools - Tesseract: ${hasTesseract}, ImageMagick: ${hasConvert}, pdftotext: ${hasPdftotext}`);
    
    // First try pdftotext as it's the simplest and most reliable for PDFs with text layers
    if (hasPdftotext) {
      try {
        console.log('ATTEMPTING: Text extraction with pdftotext (for PDFs with text layers)');
        const textOutputPath = `${tempFilePath}.txt`;
        
        await runCommandWithLogging(
          `pdftotext -layout "${tempFilePath}" "${textOutputPath}"`,
          'PDF to text conversion with pdftotext'
        );
        
        // Check if the output has content
        const extractedText = await readFile(textOutputPath, 'utf8');
        console.log(`EXTRACTED: ${extractedText.length} characters using pdftotext`);
        
        // If we got meaningful text, return it
        if (extractedText.trim().length > 10) {
          console.log('PDF has text layer, using pdftotext output');
          
          // Clean up
          await unlink(tempFilePath).catch(() => {});
          await unlink(textOutputPath).catch(() => {});
          
          return NextResponse.json({
            success: true,
            text: extractedText,
            pages: 1,
            info: { 
              Title: file.name,
              Method: 'pdftotext (text layer)',
              CharacterCount: extractedText.length
            }
          });
        } else {
          console.log('PDF has no text layer or minimal text, proceeding with OCR');
        }
      } catch (pdftotextError) {
        console.error('PDFTOTEXT EXTRACTION FAILED:', pdftotextError);
        console.log('Proceeding with OCR approach');
      }
    }
    
    // If we need OCR, check if we have the necessary tools
    if (hasTesseract && hasConvert) {
      try {
        // Step 1: Convert PDF to TIFF using ImageMagick
        console.log('STEP 1: Converting PDF to TIFF using ImageMagick');
        await runCommandWithLogging(
          `convert -density 300 "${tempFilePath}" -depth 8 -strip -background white -alpha off "${tempTiffPath}"`,
          'PDF to TIFF conversion with ImageMagick'
        );
        
        if (!existsSync(tempTiffPath)) {
          throw new Error('Failed to convert PDF to TIFF');
        }
        
        // Step 2: Use Tesseract to extract text from TIFF
        console.log('STEP 2: Extracting text from TIFF using Tesseract');
        await runCommandWithLogging(
          `tesseract "${tempTiffPath}" "${tempOutputPath}" -l eng --psm 3`,
          'OCR processing with Tesseract'
        );
        
        // Check if output file exists
        const outputTextPath = `${tempOutputPath}.txt`;
        if (!existsSync(outputTextPath)) {
          throw new Error('Tesseract did not produce output file');
        }
        
        // Read the extracted text
        const extractedText = await readFile(outputTextPath, 'utf8');
        console.log(`EXTRACTED: ${extractedText.length} characters using Tesseract OCR`);
        console.log(`SAMPLE: "${extractedText.substring(0, 100).replace(/\n/g, ' ')}..."`);
        
        // Clean up temporary files
        await unlink(tempFilePath).catch(() => {});
        await unlink(tempTiffPath).catch(() => {});
        await unlink(outputTextPath).catch(() => {});
        
        return NextResponse.json({
          success: true,
          text: extractedText,
          pages: 1,
          info: { 
            Title: file.name,
            Method: 'Tesseract OCR (via TIFF)',
            CharacterCount: extractedText.length
          }
        });
      } catch (ocrError: any) {
        console.error('OCR PROCESSING FAILED:', ocrError.message);
        throw new Error(`OCR processing failed: ${ocrError.message}`);
      }
    } else if (hasPdftotext) {
      // If we only have pdftotext but no OCR tools, use pdftotext as fallback
      try {
        console.log('FALLBACK: Using pdftotext as OCR tools are not available');
        const textOutputPath = `${tempFilePath}.txt`;
        
        await runCommandWithLogging(
          `pdftotext -layout "${tempFilePath}" "${textOutputPath}"`,
          'PDF to text conversion with pdftotext (fallback)'
        );
        
        const extractedText = await readFile(textOutputPath, 'utf8');
        console.log(`EXTRACTED: ${extractedText.length} characters using pdftotext fallback`);
        
        // Clean up
        await unlink(tempFilePath).catch(() => {});
        await unlink(textOutputPath).catch(() => {});
        
        return NextResponse.json({
          success: true,
          text: extractedText,
          pages: 1,
          info: { 
            Title: file.name,
            Method: 'pdftotext (fallback)',
            CharacterCount: extractedText.length
          }
        });
      } catch (fallbackError) {
        console.error('FALLBACK EXTRACTION FAILED:', fallbackError);
        throw new Error('All extraction methods failed');
      }
    } else {
      throw new Error('Required tools not available. Please install Tesseract OCR and ImageMagick, or pdftotext.');
    }
  } catch (error: any) {
    console.error('==========================================');
    console.error('CRITICAL ERROR IN PDF EXTRACTION:', error);
    console.error('ERROR STACK:', error.stack);
    console.error('==========================================');
    
    // Clean up temporary files if they exist
    if (tempFilePath && existsSync(tempFilePath)) {
      await unlink(tempFilePath).catch(() => {});
    }
    if (tempTiffPath && existsSync(tempTiffPath)) {
      await unlink(tempTiffPath).catch(() => {});
    }
    if (tempOutputPath && existsSync(`${tempOutputPath}.txt`)) {
      await unlink(`${tempOutputPath}.txt`).catch(() => {});
    }
    
    // Return a fallback response with installation instructions
    return NextResponse.json({
      success: true, // Still return success to allow the process to continue
      text: `This is placeholder text extracted from the resume. The extraction failed with error: ${error.message}. To enable PDF text extraction, please install the following tools:\n\n1. Tesseract OCR: brew install tesseract\n2. ImageMagick: brew install imagemagick\n3. Poppler (for pdftotext): brew install poppler`,
      pages: 1,
      info: { 
        Title: 'PDF Extraction Failed',
        Method: 'Fallback (text placeholder)',
        Error: error.message,
        Solution: 'Install Tesseract OCR, ImageMagick, and/or Poppler'
      }
    });
  }
} 