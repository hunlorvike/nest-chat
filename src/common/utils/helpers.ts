import * as bcrypt from 'bcrypt';

export async function hashPassword(rawPassword: string): Promise<string> {
    const saltRounds = 10; 
    return bcrypt.hash(rawPassword, saltRounds);
}

export async function compareHash(rawPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashedPassword);
}

