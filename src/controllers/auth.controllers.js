import prisma from '../prisma.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export async function loginUser(req, res) {
    const {email, password} = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email: email } })
         if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )
        return res.status(200).json({ token });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
    
}

export async function changePassword(req, res) {
    const { oldPassword, newPassword } = req.body
    const userId = req.user.userId  

    try {
       
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

      
        const isMatch = await bcrypt.compare(oldPassword, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: "Old password is incorrect" })
        }

       
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        return res.status(200).json({ message: "Password changed successfully" })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}