import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const blogs = await prisma.blog.findMany();
  console.log('Blogs connected:', blogs);
  
  const recentPosts = await prisma.aiContent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Recent AI Contents:', recentPosts);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
