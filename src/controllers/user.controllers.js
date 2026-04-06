import prisma from '../prisma.js'
import bcrypt from 'bcrypt'


export async function getAllUsers(req, res) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true
            }
        })
        return res.status(200).json(users)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export async function getUserById(req, res) {
    const { id } = req.params

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true
            }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json(user)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export async function createUser(req, res) {
    const { name, email, password, role } = req.body

    try {
        // Check if user already exists
        const existing = await prisma.user.findUnique({
            where: { email }
        })

        if (existing) {
            return res.status(400).json({ message: "User with this email already exists" })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'VIEWER'
            }
        })

        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export async function updateUser(req, res) {
    const { id } = req.params
    const { role, status } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                ...(role && { role }),
                ...(status && { status })
            }
        })

        return res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export async function deleteUser(req, res) {
    const { id } = req.params

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        await prisma.user.delete({
            where: { id: parseInt(id) }
        })

        return res.status(200).json({ message: "User deleted successfully" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}