import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // カテゴリマスターデータの作成
  const categories = [
    // 支出カテゴリ
    { name: '食費', type: 'expense' },
    { name: '光熱費', type: 'expense' },
    { name: '交通費', type: 'expense' },
    { name: '娯楽費', type: 'expense' },
    { name: '日用品', type: 'expense' },
    { name: '衣類', type: 'expense' },
    { name: '医療費', type: 'expense' },
    { name: 'その他', type: 'expense' },
    
    // 収入カテゴリ
    { name: '給与', type: 'income' },
    { name: 'ボーナス', type: 'income' },
    { name: '副業', type: 'income' },
    { name: 'その他', type: 'income' },
  ];

  console.log('📝 Creating categories...');
  
  for (const category of categories) {
    await prisma.category.upsert({
      where: { 
        name_type: {
          name: category.name,
          type: category.type
        }
      },
      update: {},
      create: category,
    });
  }

  console.log('✅ Database seeding completed!');
  console.log(`📊 Created ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    // process.exit(1); // Remove process.exit to avoid Node type issues
  })
  .finally(async () => {
    await prisma.$disconnect();
  });