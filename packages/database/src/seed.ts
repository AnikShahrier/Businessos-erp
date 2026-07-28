import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ==========================================
  // CONFIG: Put your registered email here
  // ==========================================
  const YOUR_EMAIL = 'anik@gmail.com'; // <-- CHANGE THIS to your actual registered email

  const user = await prisma.user.findUnique({
    where: { email: YOUR_EMAIL },
    include: { organization: true },
  });

  if (!user) {
    console.error(`❌ User with email "${YOUR_EMAIL}" not found. Register first!`);
    process.exit(1);
  }

  const orgId = user.organizationId;
  console.log('Seeding for org:', user.organization.name, `(${orgId})`);

await prisma.saleItem.deleteMany({ where: { sale: { organizationId: orgId } } });
await prisma.sale.deleteMany({ where: { organizationId: orgId } });
await prisma.inventoryItem.deleteMany({ where: { organizationId: orgId } });
await prisma.customer.deleteMany({ where: { organizationId: orgId } });

  // 1. Seed Customers
  const customers = [
    { name: 'Acme Industries', email: 'contact@acme.com', phone: '+1-555-0101', address: '123 Industrial Ave, New York, NY' },
    { name: 'Globex Corp', email: 'orders@globex.com', phone: '+1-555-0102', address: '456 Commerce St, Chicago, IL' },
    { name: 'Soylent Green', email: 'sales@soylent.com', phone: '+1-555-0103', address: '789 Nutrition Blvd, Los Angeles, CA' },
    { name: 'Initech LLC', email: 'support@initech.com', phone: '+1-555-0104', address: '321 Software Ln, Austin, TX' },
    { name: 'Umbrella Corp', email: 'bio@umbrella.com', phone: '+1-555-0105', address: '654 Science Park, Raccoon City' },
  ];

  for (const c of customers) {
    await prisma.customer.create({
      data: { ...c, organizationId: orgId },
    }).catch(() => null); // skip duplicates
  }

  const createdCustomers = await prisma.customer.findMany({ where: { organizationId: orgId } });
  console.log(`✅ Seeded ${createdCustomers.length} customers`);

  // 2. Seed Inventory
  const products = [
    { name: 'Wireless Mouse', sku: 'PER-MOU-001', description: 'Ergonomic wireless mouse', category: 'Electronics', quantity: 150, unitPrice: '25.99', reorderLevel: 20, location: 'Warehouse A' },
    { name: 'Mechanical Keyboard', sku: 'PER-KEY-002', description: 'RGB mechanical keyboard', category: 'Electronics', quantity: 80, unitPrice: '89.99', reorderLevel: 15, location: 'Warehouse A' },
    { name: 'USB-C Cable', sku: 'ACC-CBL-001', description: 'Fast charging USB-C cable', category: 'Accessories', quantity: 500, unitPrice: '12.50', reorderLevel: 100, location: 'Warehouse B' },
    { name: 'Webcam 1080p', sku: 'ELC-WEB-001', description: 'Full HD webcam with mic', category: 'Electronics', quantity: 45, unitPrice: '49.99', reorderLevel: 10, location: 'Warehouse A' },
    { name: 'Laptop Stand', sku: 'ACC-STD-002', description: 'Aluminum laptop stand', category: 'Accessories', quantity: 120, unitPrice: '35.00', reorderLevel: 25, location: 'Warehouse B' },
    { name: 'Noise Cancelling Headphones', sku: 'AUD-HDP-001', description: 'Over-ear ANC headphones', category: 'Audio', quantity: 30, unitPrice: '199.99', reorderLevel: 8, location: 'Warehouse A' },
    { name: 'Monitor 27" 4K', sku: 'DSP-MON-001', description: '27 inch 4K IPS monitor', category: 'Display', quantity: 25, unitPrice: '349.99', reorderLevel: 5, location: 'Warehouse A' },
    { name: 'Office Chair', sku: 'FUR-CHR-001', description: 'Ergonomic mesh office chair', category: 'Furniture', quantity: 15, unitPrice: '249.99', reorderLevel: 5, location: 'Warehouse C' },
    { name: 'Desk Lamp LED', sku: 'LGT-LMP-001', description: 'Adjustable LED desk lamp', category: 'Lighting', quantity: 200, unitPrice: '29.99', reorderLevel: 40, location: 'Warehouse B' },
    { name: 'Notebook A5', sku: 'STN-NOT-001', description: 'Premium A5 notebook', category: 'Stationery', quantity: 1000, unitPrice: '8.99', reorderLevel: 200, location: 'Warehouse B' },
  ];

  for (const p of products) {
    await prisma.inventoryItem.create({
      data: { ...p, organizationId: orgId },
    }).catch(() => null);
  }

  const createdProducts = await prisma.inventoryItem.findMany({ where: { organizationId: orgId } });
  console.log(`✅ Seeded ${createdProducts.length} inventory items`);

  // 3. Optional: Create a sample sale
  if (createdCustomers.length > 0 && createdProducts.length > 1) {
    await prisma.sale.create({
      data: {
        invoiceNumber: `INV-202607-${Date.now().toString(36).toUpperCase()}`,
        customerId: createdCustomers[0].id,
        status: 'PAID',
        subtotal: '141.97',
        tax: '7.10',
        total: '149.07',
        notes: 'Sample invoice',
        organizationId: orgId,
        items: {
          create: [
            {
              inventoryItemId: createdProducts[0].id,
              productName: createdProducts[0].name,
              quantity: 2,
              unitPrice: '25.99',
              total: '51.98',
            },
            {
              inventoryItemId: createdProducts[1].id,
              productName: createdProducts[1].name,
              quantity: 1,
              unitPrice: '89.99',
              total: '89.99',
            },
          ],
        },
      },
    });
    console.log('✅ Created sample sale: INV-202607-0001');
  }

  console.log('\n🎉 Done! Login with your registered account and check the app.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });