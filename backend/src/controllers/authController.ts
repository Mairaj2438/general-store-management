import { Request, Response } from 'express';
import { prisma } from '../app';
import { generateToken, hashPassword, comparePassword } from '../utils/auth';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'STAFF']).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: { name, email, passwordHash, role: role || 'STAFF' },
        });

        const token = generateToken(user.id, user.role);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid data' });
    }
};

// Update login to return image
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await comparePassword(password, user.passwordHash))) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = generateToken(user.id, user.role);
        // Include image in response
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image } });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
            return;
        }
        res.status(400).json({ error: 'Invalid request' });
    }
};

// Update getMe to return image
export const getMe = async (req: Request, res: Response) => {
    // @ts-ignore - user is attached by middleware
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return; // Return void/undefined explicitly
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image } });
};

const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore - user is attached by middleware
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify current password
        const isValid = await comparePassword(currentPassword, user.passwordHash);
        if (!isValid) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
            return;
        }
        res.status(400).json({ error: 'Failed to change password' });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        // @ts-ignore
        const userId = req.user?.userId;
        const { image } = req.body;

        await prisma.user.update({
            where: { id: userId },
            data: { image }
        });

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
