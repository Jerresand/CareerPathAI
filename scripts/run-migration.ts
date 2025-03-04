import { migrate } from '../lib/db/migrations/add-talent-profile-fields';

async function main() {
  console.log('Running talent profile migration...');
  
  try {
    await migrate();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 