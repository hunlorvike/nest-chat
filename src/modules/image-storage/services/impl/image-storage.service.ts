import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { UploadImageParams, UploadMessageAttachmentParams, UploadGroupMessageAttachmentParams } from 'src/common/utils/types';
import { GroupMessageAttachment } from 'src/modules/message-attachment/entities/group-message-attachment.entity';
import { MessageAttachment } from 'src/modules/message/entities/message-attachment.entity';

@Injectable()
export class ImageStorageService {
    public static readonly UPLOADS_FOLDER = path.join(__dirname, '..', '..', 'static');

    generateUniqueFileName(originalFileName: string): string {
        const fileExtension = path.extname(originalFileName).slice(1);
        const uniqueId = uuidv4();
        return `${uniqueId}.${fileExtension}`;
    }

    async upload(params: UploadImageParams): Promise<{ success: boolean, message: string, filePath?: string }> {
        const { key, file } = params;
        const subFolder = 'images';
        const uniqueFileName = this.generateUniqueFileName(file.originalname);

        const fullFilePath = path.resolve(ImageStorageService.UPLOADS_FOLDER, subFolder, uniqueFileName);

        try {
            mkdirp.sync(path.dirname(fullFilePath));

            await sharp(file.buffer)
                .webp({ quality: 80 })
                .toFile(fullFilePath);

            return { success: true, message: 'File uploaded successfully', filePath: fullFilePath };
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Error uploading file' };
        }
    }

    async uploadMessageAttachment(params: UploadMessageAttachmentParams): Promise<MessageAttachment> {
        const { file, messageAttachment } = params;
        const subFolder = 'message_attachments';
        const uniqueFileName = this.generateUniqueFileName(file.originalname);

        const fullFilePath = path.resolve(ImageStorageService.UPLOADS_FOLDER, subFolder, uniqueFileName);

        try {
            mkdirp.sync(path.dirname(fullFilePath));

            await fs.promises.writeFile(fullFilePath, file.buffer);

            return messageAttachment;
        } catch (error) {
            console.error(error);
            throw new Error('Error uploading message attachment');
        }
    }

    async uploadGroupMessageAttachment(params: UploadGroupMessageAttachmentParams): Promise<GroupMessageAttachment> {
        const { file, messageAttachment } = params;
        const subFolder = 'group_message_attachments';
        const uniqueFileName = this.generateUniqueFileName(file.originalname);

        const fullFilePath = path.resolve(ImageStorageService.UPLOADS_FOLDER, subFolder, uniqueFileName);

        try {
            mkdirp.sync(path.dirname(fullFilePath));

            await fs.promises.writeFile(fullFilePath, file.buffer);

            return messageAttachment;
        } catch (error) {
            console.error(error);
            throw new Error('Error uploading group message attachment');
        }
    }

    async getFile(key: string): Promise<Buffer> {
        const filePath = path.resolve(ImageStorageService.UPLOADS_FOLDER, key);

        try {
            await fs.promises.access(filePath, fs.constants.R_OK);
            return fs.promises.readFile(filePath);
        } catch (error) {
            throw new NotFoundException('File not found');
        }
    }

    async deleteFile(key: string): Promise<void> {
        const filePath = path.resolve(ImageStorageService.UPLOADS_FOLDER, key);

        try {
            await fs.promises.access(filePath, fs.constants.W_OK);
            await fs.promises.unlink(filePath);
        } catch (error) {
            console.error(`Error deleting file: ${error.message}`);
        }
    }

    async deleteGroupMessageAttachment(params: { key: string, previewKey: string }): Promise<void> {
        const { key, previewKey } = params;

        const originalPath = path.resolve(ImageStorageService.UPLOADS_FOLDER, 'images', key);
        const previewPath = path.resolve(ImageStorageService.UPLOADS_FOLDER, 'images', previewKey);

        try {
            await Promise.all([
                fs.promises.unlink(originalPath).catch(error => console.error(`Error deleting original file: ${error.message}`)),
                fs.promises.unlink(previewPath).catch(error => console.error(`Error deleting preview file: ${error.message}`)),
            ]);
        } catch (error) {
            console.error('Error deleting group message attachment:', error);
            throw new Error(`Error deleting group message attachment: ${error.message}`);
        }
    }
}
