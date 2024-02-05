import { Injectable } from "@nestjs/common";
import { IImageStorageService } from "../interface-image-storage.service";
import { UploadImageParams, UploadMessageAttachmentParams, UploadGroupMessageAttachmentParams } from "src/common/utils/types";
import { GroupMessageAttachment } from "src/modules/message-attachment/entities/group-message-attachment.entity";
import { MessageAttachment } from "src/modules/message/entities/message-attachment.entity";
import path from "path";
import * as mkdirp from 'mkdirp';
import * as sharp from 'sharp';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageStorageService implements IImageStorageService {
    private readonly UPLOAD_FOLDER = path.join(__dirname, '..', '..', 'static');

    private generateUniqueFileName(originalFileName: string): string {
        const fileExtension = path.extname(originalFileName).slice(1);
        const uniqueId = uuidv4();
        return `${uniqueId}.${fileExtension}`;
    }

    async upload(params: UploadImageParams): Promise<string> {
        const subFolder = this.determineSubFolder(params.file.originalname);
        const uniqueFileName = this.generateUniqueFileName(params.file.originalname);

        const relativeFilePath = path.join(subFolder, uniqueFileName);
        const fullFilePath = path.join(this.UPLOAD_FOLDER, relativeFilePath);

        try {
            mkdirp.sync(path.dirname(fullFilePath));

            await sharp(params.file.buffer)
                .webp({ quality: 80 })
                .toFile(fullFilePath);

            return relativeFilePath;
        } catch (error) {
            console.error(error);
            throw new Error('Error uploading file');
        }
    }

    async uploadMessageAttachment(params: UploadMessageAttachmentParams): Promise<MessageAttachment> {
        throw new Error("Method not implemented.");
    }

    async uploadGroupMessageAttachment(params: UploadGroupMessageAttachmentParams): Promise<GroupMessageAttachment> {
        throw new Error("Method not implemented.");
    }

    checkFileType(file: Express.Multer.File): string {
        const fileExtension = path.extname(file.originalname).slice(1);
        return this.isImageFile(fileExtension) ? 'images' :
            this.isVideoFile(fileExtension) ? 'videos' :
                'other';
    }

    determineSubFolderForFile(file: Express.Multer.File): string {
        const fileExtension = path.extname(file.originalname).slice(1);
        return this.determineSubFolder(fileExtension);
    }

    async deleteFile(filePath: string): Promise<boolean> {
        const fullFilePath = path.join(this.UPLOAD_FOLDER, filePath);

        try {
            if (fs.existsSync(fullFilePath)) {
                await fs.promises.unlink(fullFilePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw new Error('Error deleting file');
        }
    }

    isImageFile(fileExtension: string): boolean {
        const allowedImageExtensions = ['jpg', 'png', 'gif'];
        return allowedImageExtensions.includes(fileExtension.toLowerCase());
    }

    isVideoFile(fileExtension: string): boolean {
        const allowedVideoExtensions = ['mp4', 'avi', 'mkv'];
        return allowedVideoExtensions.includes(fileExtension.toLowerCase());
    }

    determineSubFolder(fileExtension: string): string {
        return this.isImageFile(fileExtension) ? 'images' :
            this.isVideoFile(fileExtension) ? 'videos' :
                'other';
    }
}
