import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as sharp from 'sharp';

export class FileUtils {
    public static readonly UPLOADS_FOLDER = path.join(__dirname, '..', '..', 'public');

    static generateUniqueFileName(originalFileName: string): string {
        const fileExtension = path.extname(originalFileName).slice(1);
        const uniqueId = uuidv4();
        return `${uniqueId}.${fileExtension}`;
    }

    static async uploadFile(file: Express.Multer.File): Promise<{ success: boolean, message: string, filePath?: string }> {
        const fileType = FileUtils.checkFileType(file);

        if (fileType === 'other') {
            return { success: false, message: 'Invalid file type' };
        }

        const subFolder = FileUtils.determineSubFolderForFile(file);
        const uniqueFileName = FileUtils.generateUniqueFileName(file.originalname);

        const relativeFilePath = path.join(subFolder, uniqueFileName);
        const fullFilePath = path.join(FileUtils.UPLOADS_FOLDER, relativeFilePath);

        try {
            mkdirp.sync(path.dirname(fullFilePath));

            await sharp(file.buffer)
                .webp({ quality: 80 })
                .toFile(fullFilePath);

            return { success: true, message: 'File uploaded successfully', filePath: relativeFilePath };
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Error uploading file' };
        }
    }

    static checkFileType(file: Express.Multer.File): string {
        const fileExtension = path.extname(file.originalname).slice(1);
        return FileUtils.isImageFile(fileExtension) ? 'images' :
            FileUtils.isVideoFile(fileExtension) ? 'videos' :
                'other';
    }

    static determineSubFolderForFile(file: Express.Multer.File): string {
        const fileExtension = path.extname(file.originalname).slice(1);
        return FileUtils.determineSubFolder(fileExtension);
    }

    static async deleteFile(filePath: string): Promise<void> {
        const fullFilePath = path.join(FileUtils.UPLOADS_FOLDER, filePath);

        try {
            if (fs.existsSync(fullFilePath)) {
                await fs.promises.unlink(fullFilePath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            throw new Error('Error deleting file');
        }
    }

    private static isImageFile(fileExtension: string): boolean {
        const allowedImageExtensions = ['jpg', 'png', 'gif'];
        return allowedImageExtensions.includes(fileExtension.toLowerCase());
    }

    private static isVideoFile(fileExtension: string): boolean {
        const allowedVideoExtensions = ['mp4', 'avi', 'mkv'];
        return allowedVideoExtensions.includes(fileExtension.toLowerCase());
    }

    private static determineSubFolder(fileExtension: string): string {
        return FileUtils.isImageFile(fileExtension) ? 'images' :
            FileUtils.isVideoFile(fileExtension) ? 'videos' :
                'other';
    }
}