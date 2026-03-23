const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating mock tender...');

  // Create tender with mock data
  const tender = await prisma.tender.create({
    data: {
      tenderNumber: '034/2018',
      title: 'የተለያዩ ጫማዎች',
      date: new Date('2018-05-18'),
      location: 'ባቡር ጣቢያ',
      responsibleBody: 'ደ/ቁ የእ/እ/ቡ/እስ/294/2018',
      vehiclePlate: 'Aw 034 B/2018',
      exchangeRate: 157.6304,
      status: 'OPEN'
    }
  });

  console.log('Created tender:', tender.tenderNumber);

  // Create groups based on the data
  const group1 = await prisma.group.create({
    data: {
      tenderId: tender.id,
      code: 'ኮድ-10-ገፅ-1',
      name: 'Nike & Adidas Shoes',
      currentRound: 'CIF',
      roundNumber: 1,
      status: 'OPEN'
    }
  });

  const group2 = await prisma.group.create({
    data: {
      tenderId: tender.id,
      code: 'ኮድ-10-ገፅ-2',
      name: 'Additional Shoes',
      currentRound: 'CIF',
      roundNumber: 1,
      status: 'OPEN'
    }
  });

  // Mock items data - Group 1
  const itemsData = [
    { itemCode: '52155', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike SB', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 48, warehouse2: 0, warehouse3: 0, totalQuantity: 48, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52155', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Air Jordan', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 125, warehouse2: 0, warehouse3: 0, totalQuantity: 125, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52155', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Skate', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 57, warehouse2: 0, warehouse3: 0, totalQuantity: 57, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52155', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Adidas Samba', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 24, warehouse2: 0, warehouse3: 0, totalQuantity: 24, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52155', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike AirForce', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 133, warehouse2: 0, warehouse3: 0, totalQuantity: 133, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Bike Air', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 18, warehouse2: 0, warehouse3: 0, totalQuantity: 18, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Tn Air', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 13, warehouse2: 0, warehouse3: 0, totalQuantity: 13, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Jordan 75', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 9, warehouse2: 0, warehouse3: 0, totalQuantity: 9, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'NB Freshfom', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 6, warehouse2: 0, warehouse3: 0, totalQuantity: 6, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: '45', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 3, warehouse2: 0, warehouse3: 0, totalQuantity: 3, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'All Star', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 8, warehouse2: 0, warehouse3: 0, totalQuantity: 8, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Camfiride', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 5, warehouse2: 0, warehouse3: 0, totalQuantity: 5, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Sketchers Aircool', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 2, warehouse2: 0, warehouse3: 0, totalQuantity: 2, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Sketchers Max', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 8, warehouse2: 0, warehouse3: 0, totalQuantity: 8, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Sketchers Molstar', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 5, warehouse2: 0, warehouse3: 0, totalQuantity: 5, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Sketchers Sport', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 2, warehouse2: 0, warehouse3: 0, totalQuantity: 2, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Colombia', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 2, warehouse2: 0, warehouse3: 0, totalQuantity: 2, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52156', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Reebok', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 4, warehouse2: 0, warehouse3: 0, totalQuantity: 4, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Adidas Campus', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 56, warehouse2: 0, warehouse3: 0, totalQuantity: 56, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'NB', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 27, warehouse2: 0, warehouse3: 0, totalQuantity: 27, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Air Gucci', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 21, warehouse2: 0, warehouse3: 0, totalQuantity: 21, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Air Dior', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 35, warehouse2: 0, warehouse3: 0, totalQuantity: 35, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Zoom', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 9, warehouse2: 0, warehouse3: 0, totalQuantity: 9, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Shok', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 7, warehouse2: 0, warehouse3: 0, totalQuantity: 7, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Air Jordan', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 35, warehouse2: 0, warehouse3: 0, totalQuantity: 35, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Air venom', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 2, warehouse2: 0, warehouse3: 0, totalQuantity: 2, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Air AF1', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 4, warehouse2: 0, warehouse3: 0, totalQuantity: 4, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 1, warehouse2: 0, warehouse3: 0, totalQuantity: 1, fob: 24.2, cif: 27.1, tax: 20 },
  ];

  // Create items for group 1
  let group1BasePrice = 0;
  for (const itemData of itemsData) {
    // 3 Prices Logic: MAX(CIF, FOB, TAX)
    const selectedPrice = Math.max(itemData.cif, itemData.fob, itemData.tax);
    const unitPrice = selectedPrice * tender.exchangeRate;
    const totalPrice = unitPrice * itemData.totalQuantity;
    group1BasePrice += totalPrice;

    await prisma.item.create({
      data: {
        groupId: group1.id,
        itemCode: itemData.itemCode,
        name: itemData.name,
        brand: itemData.brand,
        country: itemData.country,
        unit: itemData.unit,
        warehouse1: itemData.warehouse1,
        warehouse2: itemData.warehouse2,
        warehouse3: itemData.warehouse3,
        totalQuantity: itemData.totalQuantity,
        fob: itemData.fob,
        cif: itemData.cif,
        tax: itemData.tax,
        unitPrice,
        totalPrice
      }
    });
  }

  // Update group 1 base price
  await prisma.group.update({
    where: { id: group1.id },
    data: { basePrice: group1BasePrice }
  });

  // Mock items data - Group 2
  const itemsData2 = [
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike Pegasus', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 1, warehouse2: 0, warehouse3: 0, totalQuantity: 1, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Delta', country: 'England', unit: 'በጥንድ', warehouse1: 1, warehouse2: 0, warehouse3: 0, totalQuantity: 1, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52157', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Nike', country: 'የለውም', unit: 'በጥንድ', warehouse1: 1, warehouse2: 0, warehouse3: 0, totalQuantity: 1, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52158', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Vans', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 1, warehouse2: 0, warehouse3: 0, totalQuantity: 1, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52158', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Goupu', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 1, warehouse2: 0, warehouse3: 0, totalQuantity: 1, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52158', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Balenciaga', country: 'Italy', unit: 'በጥንድ', warehouse1: 1, warehouse2: 0, warehouse3: 0, totalQuantity: 1, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52158', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Adidas', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 1, warehouse2: 0, warehouse3: 0, totalQuantity: 1, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52158', name: 'የአዋቂ ወንድ ሽፍን ጫማ', brand: 'Sketchers', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 2, warehouse2: 0, warehouse3: 0, totalQuantity: 2, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52158', name: 'የአዋቂ ወንድ ታኬታ ጫማ', brand: 'Phanton', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 2, warehouse2: 0, warehouse3: 0, totalQuantity: 2, fob: 24.2, cif: 27.1, tax: 20 },
    { itemCode: '52158', name: 'የአዋቂ ወንድ ታኬታ ጫማ', brand: 'Nike', country: 'Vitenam', unit: 'በጥንድ', warehouse1: 2, warehouse2: 0, warehouse3: 0, totalQuantity: 2, fob: 24.2, cif: 27.1, tax: 20 },
  ];

  // Create items for group 2
  let group2BasePrice = 0;
  for (const itemData of itemsData2) {
    const selectedPrice = Math.max(itemData.cif, itemData.fob, itemData.tax);
    const unitPrice = selectedPrice * tender.exchangeRate;
    const totalPrice = unitPrice * itemData.totalQuantity;
    group2BasePrice += totalPrice;

    await prisma.item.create({
      data: {
        groupId: group2.id,
        itemCode: itemData.itemCode,
        name: itemData.name,
        brand: itemData.brand,
        country: itemData.country,
        unit: itemData.unit,
        warehouse1: itemData.warehouse1,
        warehouse2: itemData.warehouse2,
        warehouse3: itemData.warehouse3,
        totalQuantity: itemData.totalQuantity,
        fob: itemData.fob,
        cif: itemData.cif,
        tax: itemData.tax,
        unitPrice,
        totalPrice
      }
    });
  }

  // Update group 2 base price
  await prisma.group.update({
    where: { id: group2.id },
    data: { basePrice: group2BasePrice }
  });

  console.log('Created groups with items');
  console.log('Group 1 base price:', group1BasePrice.toFixed(2));
  console.log('Group 2 base price:', group2BasePrice.toFixed(2));
  console.log('Total base price:', (group1BasePrice + group2BasePrice).toFixed(2));

  console.log('\nMock tender created successfully!');
  console.log('Tender ID:', tender.id);
  console.log('Groups:', group1.code, group2.code);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
