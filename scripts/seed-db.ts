import { seedDefaultData } from '../src/lib/seed';

async function main() {
  console.log('Running database seed script...');
  await seedDefaultData();
  console.log('Database seeding complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Database seeding failed:', err);
  process.exit(1);
});
