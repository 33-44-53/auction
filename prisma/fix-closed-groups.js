const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all groups that have another group pointing to them via originalGroupId
  // These are the "original" groups that moved to next round — they should be CLOSED
  const nextRoundGroups = await prisma.group.findMany({
    where: { originalGroupId: { not: null } },
    select: { originalGroupId: true }
  });

  const originalGroupIds = [...new Set(nextRoundGroups.map(g => g.originalGroupId))];

  if (originalGroupIds.length === 0) {
    console.log('No groups to fix.');
    return;
  }

  // Close all original groups that are still OPEN
  const result = await prisma.group.updateMany({
    where: {
      id: { in: originalGroupIds },
      status: 'OPEN'
    },
    data: { status: 'CLOSED' }
  });

  console.log(`Fixed ${result.count} group(s) — set to CLOSED.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
