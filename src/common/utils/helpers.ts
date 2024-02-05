import * as bcrypt from 'bcrypt';
import sharp from 'sharp';
import { Attachment } from './types';
import { v4 as uuidv4 } from 'uuid';

export async function hashPassword(rawPassword: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(rawPassword, saltRounds);
}

export async function compareHash(rawPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashedPassword);
}

export const generateUUIDV4 = () => uuidv4();

export const compressImage = (attachment: Attachment) =>
    sharp(attachment.buffer).resize(300).jpeg().toBuffer();