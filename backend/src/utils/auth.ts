import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

if (JWT_SECRET === 'secret') {
    console.warn('⚠️  SECURITY WARNING: Using default "secret" for JWT. Set JWT_SECRET in .env for production security.');
}

export const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
};

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};
