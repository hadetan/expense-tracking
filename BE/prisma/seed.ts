import prisma from '../src/utils/lib/prisma.ts';
import { ExpenseStatus } from '../src/constants/index.ts';

async function main() {
    console.info('Starting seed...');

    const user1 = await prisma.user.upsert({
        where: { email: 'john.doe@company.com' },
        update: {},
        create: {
            email: 'john.doe@company.com',
            name: 'John Doe',
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'jane.smith@company.com' },
        update: {},
        create: {
            email: 'jane.smith@company.com',
            name: 'Jane Smith',
        },
    });

    const user3 = await prisma.user.upsert({
        where: { email: 'bob.johnson@company.com' },
        update: {},
        create: {
            email: 'bob.johnson@company.com',
            name: 'Bob Johnson',
        },
    });

    console.info('Users created');

    const travelCategory = await prisma.category.create({
        data: {
            name: 'Business Travel',
            createdBy: user1.id,
        },
    });

    const mealsCategory = await prisma.category.create({
        data: {
            name: 'Team Meals',
            createdBy: user1.id,
        },
    });

    const officeSuppliesCategory = await prisma.category.create({
        data: {
            name: 'Office Supplies',
            createdBy: user1.id,
        },
    });

    const softwareCategory = await prisma.category.create({
        data: {
            name: 'Software Subscriptions',
            createdBy: user2.id,
        },
    });

    const conferenceCategory = await prisma.category.create({
        data: {
            name: 'Conferences & Events',
            createdBy: user2.id,
        },
    });

    const transportCategory = await prisma.category.create({
        data: {
            name: 'Local Transport',
            createdBy: user3.id,
        },
    });

    console.info('Categories created');

    const expenses = [
        {
            userId: user1.id,
            amount: 450.00,
            categoryId: travelCategory.id,
            description: 'Flight tickets to client meeting in New York',
            date: new Date('2025-10-15'),
            status: ExpenseStatus.APPROVED,
        },
        {
            userId: user1.id,
            amount: 180.50,
            categoryId: mealsCategory.id,
            description: 'Team lunch at project kickoff',
            date: new Date('2025-10-18'),
            status: ExpenseStatus.APPROVED,
        },
        {
            userId: user1.id,
            amount: 89.99,
            categoryId: officeSuppliesCategory.id,
            description: 'Whiteboard markers and sticky notes for brainstorming sessions',
            date: new Date('2025-10-20'),
            status: ExpenseStatus.PENDING,
        },
        {
            userId: user1.id,
            amount: 320.00,
            categoryId: travelCategory.id,
            description: 'Hotel accommodation for 2 nights during client visit',
            date: new Date('2025-10-16'),
            status: ExpenseStatus.APPROVED,
        },

        {
            userId: user2.id,
            amount: 29.99,
            categoryId: softwareCategory.id,
            description: 'Figma Pro subscription for design team',
            date: new Date('2025-10-01'),
            status: ExpenseStatus.APPROVED,
        },
        {
            userId: user2.id,
            amount: 599.00,
            categoryId: conferenceCategory.id,
            description: 'React Conference 2025 ticket',
            date: new Date('2025-10-10'),
            status: ExpenseStatus.APPROVED,
        },
        {
            userId: user2.id,
            amount: 45.00,
            categoryId: mealsCategory.id,
            description: 'Coffee and snacks for team standup meeting',
            date: new Date('2025-10-21'),
            status: ExpenseStatus.PENDING,
        },
        {
            userId: user2.id,
            amount: 150.00,
            categoryId: officeSuppliesCategory.id,
            description: 'External monitor and keyboard for new hire',
            date: new Date('2025-09-28'),
            status: ExpenseStatus.REJECTED,
            rejectionReason: 'This should be purchased through IT procurement, not expensed',
        },
        {
            userId: user2.id,
            amount: 79.99,
            categoryId: softwareCategory.id,
            description: 'Notion team workspace upgrade',
            date: new Date('2025-10-12'),
            status: ExpenseStatus.APPROVED,
        },

        {
            userId: user3.id,
            amount: 35.50,
            categoryId: transportCategory.id,
            description: 'Uber rides to client meetings downtown',
            date: new Date('2025-10-19'),
            status: ExpenseStatus.APPROVED,
        },
        {
            userId: user3.id,
            amount: 125.00,
            categoryId: mealsCategory.id,
            description: 'Dinner with potential client at steakhouse',
            date: new Date('2025-10-17'),
            status: ExpenseStatus.PENDING,
        },
        {
            userId: user3.id,
            amount: 42.00,
            categoryId: officeSuppliesCategory.id,
            description: 'Printer ink cartridges for office printer',
            date: new Date('2025-10-14'),
            status: ExpenseStatus.APPROVED,
        },
        {
            userId: user3.id,
            amount: 250.00,
            categoryId: travelCategory.id,
            description: 'Train tickets for team offsite in Boston',
            date: new Date('2025-10-08'),
            status: ExpenseStatus.APPROVED,
        },
        {
            userId: user3.id,
            amount: 89.00,
            categoryId: transportCategory.id,
            description: 'Monthly parking pass for office garage',
            date: new Date('2025-10-01'),
            status: ExpenseStatus.APPROVED,
        },

        {
            userId: user1.id,
            amount: 15.99,
            categoryId: softwareCategory.id,
            description: 'ChatGPT Plus subscription for productivity',
            date: new Date('2025-10-05'),
            status: ExpenseStatus.APPROVED,
        },
        {
            userId: user2.id,
            amount: 220.00,
            categoryId: conferenceCategory.id,
            description: 'TypeScript meetup sponsorship',
            date: new Date('2025-09-30'),
            status: ExpenseStatus.APPROVED,
        },
        {
            userId: user3.id,
            amount: 95.00,
            categoryId: mealsCategory.id,
            description: 'Team breakfast at quarterly planning meeting',
            date: new Date('2025-10-22'),
            status: ExpenseStatus.PENDING,
        },
        {
            userId: user1.id,
            amount: 380.00,
            categoryId: travelCategory.id,
            description: 'Airbnb for 3-day workshop in San Francisco',
            date: new Date('2025-09-25'),
            status: ExpenseStatus.APPROVED,
        },
        {
            userId: user2.id,
            amount: 55.00,
            categoryId: officeSuppliesCategory.id,
            description: 'Desk organizers and cable management accessories',
            date: new Date('2025-10-13'),
            status: ExpenseStatus.APPROVED,
        },
        {
            userId: user3.id,
            amount: 28.50,
            categoryId: transportCategory.id,
            description: 'Taxi to airport for business trip',
            date: new Date('2025-10-09'),
            status: ExpenseStatus.APPROVED,
        },
    ];

    for (const expense of expenses) {
        await prisma.expense.create({ data: expense });
    }

    console.info('Expenses created');
    console.info('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seed:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
