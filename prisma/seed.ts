import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create the Gonad collection
  const gonadCollection = await prisma.collection.upsert({
    where: { name: 'gonad' },
    update: {},
    create: {
      name: 'gonad',
      displayName: 'Gonad on Monad',
      description: 'A dumb, beautiful parody collection launching on Monad.',
      maxSupply: 10000,
      mintPrice: '0.1',
      whitelistOnly: true,
      isActive: true,
    },
  });

  console.log('✅ Created collection:', gonadCollection.displayName);

  // Create some test users (optional)
  const testUsers = [
    {
      address: '0x1234567890123456789012345678901234567890',
      ens: 'testuser1.eth',
    },
    {
      address: '0x0987654321098765432109876543210987654321',
      ens: 'testuser2.eth',
    },
  ];

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { address: userData.address },
      update: {},
      create: userData,
    });

    // Add to whitelist
    await prisma.whitelistEntry.upsert({
      where: {
        userId_collectionId: {
          userId: user.id,
          collectionId: gonadCollection.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        collectionId: gonadCollection.id,
        tier: 'og',
        source: 'manual',
      },
    });

    console.log(`✅ Added test user to whitelist: ${userData.ens || userData.address}`);
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
