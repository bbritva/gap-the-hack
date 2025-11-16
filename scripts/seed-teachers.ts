import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeDatabase } from '../lib/db';
import { seedTeachers } from '../lib/db/mock-db';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully!');

    console.log('\nSeeding teachers...');
    await seedTeachers();
    console.log('Teachers seeded successfully!');

    console.log('\n✅ Database setup complete!');
    console.log('\nYou can now login with:');
    console.log('  Username: teacher1, teacher2, teacher3, teacher4, or teacher5');
    console.log('  Password: 123');

    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

main();
