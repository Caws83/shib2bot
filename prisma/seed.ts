/**
 * Database seed script
 * Creates an admin user for initial setup
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user (replace with your Telegram ID)
  const adminTelegramId = process.env.ADMIN_TELEGRAM_ID || '123456789'; // Replace with your Telegram ID

  const admin = await prisma.user.upsert({
    where: { telegramId: adminTelegramId },
    update: {
      role: 'ADMIN',
    },
    create: {
      telegramId: adminTelegramId,
      telegramUsername: 'admin',
      role: 'ADMIN',
      creditBalance: 1000, // Give admin some starting credits
    },
  });

  console.log('✅ Admin user created/updated:', {
    id: admin.id,
    telegramId: admin.telegramId,
    role: admin.role,
    credits: admin.creditBalance,
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

