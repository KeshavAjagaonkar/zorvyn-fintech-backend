import prisma from '../prisma.js'

// GET /dashboard/summary
export async function getSummary(req, res) {
    try {
        // Sum all income records
        const incomeResult = await prisma.record.aggregate({
            where: { type: 'income' },
            _sum: { amount: true },
            _count: true
        })

        // Sum all expense records
        const expenseResult = await prisma.record.aggregate({
            where: { type: 'expense' },
            _sum: { amount: true },
            _count: true
        })

        const totalIncome = incomeResult._sum.amount || 0
        const totalExpenses = expenseResult._sum.amount || 0

        return res.status(200).json({
            totalIncome,
            totalExpenses,
            netBalance: totalIncome - totalExpenses,
            totalRecords: incomeResult._count + expenseResult._count
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

// GET /dashboard/category-totals
export async function getCategoryTotals(req, res) {
    try {
        const result = await prisma.record.groupBy({
            by: ['category', 'type'],
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } }
        })

        const formatted = result.map(item => ({
            category: item.category,
            type: item.type,
            total: item._sum.amount || 0
        }))

        return res.status(200).json(formatted)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

// GET /dashboard/trends
export async function getTrends(req, res) {
    try {
        const records = await prisma.record.findMany({
            select: {
                amount: true,
                type: true,
                date: true
            },
            orderBy: { date: 'asc' }
        })

        // Group by month
        const trendsMap = {}

        records.forEach(record => {
            const month = record.date.toISOString().slice(0, 7) // "2026-03"

            if (!trendsMap[month]) {
                trendsMap[month] = { month, income: 0, expenses: 0 }
            }

            if (record.type === 'income') {
                trendsMap[month].income += record.amount
            } else {
                trendsMap[month].expenses += record.amount
            }
        })

        const trends = Object.values(trendsMap)

        return res.status(200).json(trends)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}