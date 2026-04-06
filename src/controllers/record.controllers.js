import prisma from '../prisma.js'

// GET /records: with optional filters
export async function getRecords(req, res) {
    const { type, category, from, to } = req.query

    try {
        const filters = {}

        if (type) filters.type = type
        if (category) filters.category = category
        if (from || to) {
            filters.date = {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) })
            }
        }

        const records = await prisma.record.findMany({
            where: filters,
            orderBy: { date: 'desc' }
        })

        return res.status(200).json(records)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

// GET /records/:id 
export async function getRecordById(req, res) {
    const { id } = req.params

    try {
        const record = await prisma.record.findUnique({
            where: { id: parseInt(id) }
        })

        if (!record) {
            return res.status(404).json({ message: "Record not found" })
        }

        return res.status(200).json(record)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

// POST /records — only admin can create record
export async function createRecord(req, res) {
    const { amount, type, category, date, note } = req.body
    const adminId = req.user.userId

    try {
        // Basic validation
        if (!amount || !type || !category || !date) {
            return res.status(400).json({ message: "amount, type, category and date are required" })
        }

        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ message: "type must be income or expense" })
        }

        const record = await prisma.record.create({
            data: {
                amount: parseFloat(amount),
                type,
                category,
                date: new Date(date),
                note: note || null,
                createdById: adminId
            }
        })

        return res.status(201).json({
            message: "Record created successfully",
            record
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

// PATCH /records/:id — admin only can update
export async function updateRecord(req, res) {
    const { id } = req.params
    const { amount, type, category, date, note } = req.body
    const adminId = req.user.userId

    try {
        const record = await prisma.record.findUnique({
            where: { id: parseInt(id) }
        })

        if (!record) {
            return res.status(404).json({ message: "Record not found" })
        }

        const updatedRecord = await prisma.record.update({
            where: { id: parseInt(id) },
            data: {
                ...(amount && { amount: parseFloat(amount) }),
                ...(type && { type }),
                ...(category && { category }),
                ...(date && { date: new Date(date) }),
                ...(note && { note }),
                updatedById: adminId
            }
        })

        return res.status(200).json({
            message: "Record updated successfully",
            record: updatedRecord
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

// DELETE /records/:id — delete record (admin only)
export async function deleteRecord(req, res) {
    const { id } = req.params

    try {
        const record = await prisma.record.findUnique({
            where: { id: parseInt(id) }
        })

        if (!record) {
            return res.status(404).json({ message: "Record not found" })
        }

        await prisma.record.delete({
            where: { id: parseInt(id) }
        })

        return res.status(200).json({ message: "Record deleted successfully" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}