// Script to recalculate unit prices and total prices for all items
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recalculateItemPrices() {
  console.log('Starting price recalculation for all items...\n');

  try {
    // Get all groups with their items and tender info
    const groups = await prisma.group.findMany({
      include: {
        items: true,
        tender: true
      }
    });

    let totalItemsUpdated = 0;
    let totalGroupsUpdated = 0;

    for (const group of groups) {
      console.log(`\nProcessing Group: ${group.code} (${group.name})`);
      console.log(`Current Round: ${group.currentRound}`);
      console.log(`Items: ${group.items.length}`);

      let groupBasePrice = 0;
      const itemUpdates = [];

      for (const item of group.items) {
        const exchangeRate = item.exchangeRate;
        
        if (!exchangeRate || exchangeRate === 0) {
          console.log(`  ⚠️  Item "${item.name}" has no exchange rate - SKIPPING`);
          continue;
        }

        // Determine which price to use based on current round
        let selectedPrice;
        if (group.currentRound === 'HARAJ') {
          // For Haraj: use LOWEST of CIF, FOB, TAX
          selectedPrice = Math.min(item.cif || 0, item.fob || 0, item.tax || 0);
        } else {
          // For Auction: use the price for the current round
          const prices = {
            CIF: item.cif || 0,
            FOB: item.fob || 0,
            TAX: item.tax || 0
          };
          selectedPrice = prices[group.currentRound] || 0;
        }

        // Calculate correct prices
        const correctUnitPrice = selectedPrice * exchangeRate;
        const correctTotalPrice = correctUnitPrice * item.totalQuantity;

        // Check if prices need updating
        const needsUpdate = 
          Math.abs(item.unitPrice - correctUnitPrice) > 0.01 ||
          Math.abs(item.totalPrice - correctTotalPrice) > 0.01;

        if (needsUpdate) {
          console.log(`  ✓ Updating "${item.name}"`);
          console.log(`    Old: unitPrice=${item.unitPrice}, totalPrice=${item.totalPrice}`);
          console.log(`    New: unitPrice=${correctUnitPrice.toFixed(2)}, totalPrice=${correctTotalPrice.toFixed(2)}`);
          console.log(`    Calculation: ${selectedPrice} × ${exchangeRate} × ${item.totalQuantity}`);

          itemUpdates.push({
            id: item.id,
            unitPrice: correctUnitPrice,
            totalPrice: correctTotalPrice
          });

          totalItemsUpdated++;
        }

        groupBasePrice += correctTotalPrice;
      }

      // Update all items in this group
      for (const update of itemUpdates) {
        await prisma.item.update({
          where: { id: update.id },
          data: {
            unitPrice: update.unitPrice,
            totalPrice: update.totalPrice
          }
        });
      }

      // Update group base price
      const needsGroupUpdate = Math.abs(group.basePrice - groupBasePrice) > 0.01;
      if (needsGroupUpdate) {
        console.log(`  ✓ Updating group base price: ${group.basePrice} → ${groupBasePrice.toFixed(2)}`);
        await prisma.group.update({
          where: { id: group.id },
          data: { basePrice: groupBasePrice }
        });
        totalGroupsUpdated++;
      }
    }

    console.log(`\n✅ Recalculation complete!`);
    console.log(`   Items updated: ${totalItemsUpdated}`);
    console.log(`   Groups updated: ${totalGroupsUpdated}`);

  } catch (error) {
    console.error('Error during recalculation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
recalculateItemPrices()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
