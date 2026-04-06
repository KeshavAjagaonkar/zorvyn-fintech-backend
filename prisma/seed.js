import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('admin1234', 10)

    const admin = await prisma.user.create({
        data: {
            name: 'Super Admin',
            email: 'admin@finance.com',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'active'
        }
    })

    console.log('Admin created:', admin)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })