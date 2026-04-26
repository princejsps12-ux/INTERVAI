import { PrismaClient, Plan, InterviewType, Difficulty, QuestionType, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const user = await prisma.user.upsert({
    where: { email: 'demo@intervai.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@intervai.com',
      plan: Plan.PRO,
      streak: 7,
    },
  });

  console.log('✅ Created demo user:', user.email);

  const session = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      company: 'Google',
      role: 'Senior Software Engineer',
      type: InterviewType.TECHNICAL,
      difficulty: Difficulty.HARD,
      duration: 3600,
      questions: {
        create: [
          {
            text: 'Tell me about yourself and your engineering background.',
            type: QuestionType.BEHAVIORAL,
            difficulty: Difficulty.EASY,
            orderIndex: 0,
          },
          {
            text: 'Design a URL shortening service like bit.ly.',
            type: QuestionType.SYSTEM_DESIGN,
            difficulty: Difficulty.HARD,
            orderIndex: 1,
          },
        ],
      },
    },
  });

  console.log('✅ Created demo session:', session.id);
  console.log('🎉 Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
