// Script to set up Supabase storage buckets
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupStorage() {
  console.log('Checking Supabase connection...');
  
  try {
    // Test connection
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error connecting to Supabase:', listError.message);
      console.log('Please make sure Supabase is running and your environment variables are correct.');
      process.exit(1);
    }
    
    console.log('Successfully connected to Supabase!');
    console.log(`Found ${buckets.length} storage buckets.`);
    
    // Check if resumes bucket exists
    const resumesBucket = buckets.find(bucket => bucket.name === 'resumes');
    
    if (resumesBucket) {
      console.log('✅ "resumes" bucket already exists.');
    } else {
      console.log('Creating "resumes" bucket...');
      
      const { data, error } = await supabase.storage.createBucket('resumes', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['application/pdf']
      });
      
      if (error) {
        console.error('Error creating bucket:', error.message);
        process.exit(1);
      }
      
      console.log('✅ "resumes" bucket created successfully!');
    }
    
    // Set bucket public
    const { error: updateError } = await supabase.storage.updateBucket('resumes', {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['application/pdf']
    });
    
    if (updateError) {
      console.error('Error updating bucket settings:', updateError.message);
    } else {
      console.log('✅ "resumes" bucket settings updated to be public.');
    }
    
    console.log('\nStorage setup complete! You can now upload resumes to Supabase storage.');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
    process.exit(1);
  }
}

setupStorage(); 