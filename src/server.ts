import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

// 1. Создать обращение
app.post('/tickets', async (req, res) => {
    const { topic, message } = req.body;
    const ticket = await prisma.ticket.create({
        data: { topic, message, status: 'NEW' },
    });
    res.json(ticket);
});

// 2. Взять обращение в работу
app.patch('/tickets/:id/start', async (req, res) => {
    const { id } = req.params;
    const ticket = await prisma.ticket.update({
        where: { id: Number(id) },
        data: { status: 'IN_PROGRESS' },
    });
    res.json(ticket);
});

// 3. Завершить обработку обращения
app.patch('/tickets/:id/complete', async (req, res) => {
    const { id } = req.params;
    const { resolution } = req.body;
    const ticket = await prisma.ticket.update({
        where: { id: Number(id) },
        data: { status: 'COMPLETED', resolution },
    });
    res.json(ticket);
});

// 4. Отмена обращения
app.patch('/tickets/:id/cancel', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const ticket = await prisma.ticket.update({
        where: { id: Number(id) },
        data: { status: 'CANCELLED', cancellationReason: reason },
    });
    res.json(ticket);
});

// 5. Получить список обращений с фильтрацией по дате
app.get('/tickets', async (req, res) => {
    const { date, startDate, endDate } = req.query;
    const where: any = {};
    if (date) where.createdAt = new Date(date as string);
    if (startDate && endDate) {
        where.createdAt = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }
    const tickets = await prisma.ticket.findMany({ where });
    res.json(tickets);
});

// 6. Отмена всех обращений в работе
app.patch('/tickets/cancel-in-progress', async (_, res) => {
    const tickets = await prisma.ticket.updateMany({
        where: { status: 'IN_PROGRESS' },
        data: { status: 'CANCELLED' },
    });
    res.json({ message: 'Обращения отменены', count: tickets.count });
});

app.listen(3000, () => console.log('Server running on port 3000'));
