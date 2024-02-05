import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GroupMessageAttachment } from 'src/modules/message-attachment/entities/group-message-attachment.entity';
import { compressImage } from 'src/common/utils/helpers';
import { UploadImageParams, UploadMessageAttachmentParams, UploadGroupMessageAttachmentParams } from 'src/common/utils/types';
import { IImageStorageService } from '../interface-image-storage.service';

@Injectable()
export class ImageStorageService implements IImageStorageService {
	upload(params: UploadImageParams) {
		const filePath = path.join(__dirname, 'static', params.key);
		fs.writeFileSync(filePath, params.file.buffer);

		return { success: true, message: 'File uploaded locally' };
	}

	async uploadMessageAttachment(params: UploadMessageAttachmentParams) {
		const originalPath = path.join(__dirname, 'static', 'original', params.messageAttachment.key);
		const previewPath = path.join(__dirname, 'static', 'preview', params.messageAttachment.key);

		fs.writeFileSync(originalPath, params.file.buffer);

		const compressedImage = await compressImage(params.file);
		fs.writeFileSync(previewPath, compressedImage);

		return params.messageAttachment;
	}

	async uploadGroupMessageAttachment(params: UploadGroupMessageAttachmentParams): Promise<GroupMessageAttachment> {
		const originalPath = path.join(__dirname, 'static', 'original', params.messageAttachment.key);
		const previewPath = path.join(__dirname, 'static', 'preview', params.messageAttachment.key);

		fs.writeFileSync(originalPath, params.file.buffer);

		const compressedImage = await compressImage(params.file);
		fs.writeFileSync(previewPath, compressedImage);

		return params.messageAttachment;
	}

	getFile(key: string): Buffer {
		const filePath = path.join(__dirname, 'static', key);

		if (!fs.existsSync(filePath)) {
			throw new NotFoundException('File not found');
		}

		return fs.readFileSync(filePath);
	}

	deleteFile(key: string): void {
		const filePath = path.join(__dirname, 'static', key);

		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	}

	async deleteGroupMessageAttachment(params: { key: string, previewKey: string }): Promise<void> {
		const originalPath = path.join(__dirname, 'static', 'original', params.key);
		const previewPath = path.join(__dirname, 'static', 'preview', params.previewKey);

		if (fs.existsSync(originalPath)) {
			fs.unlinkSync(originalPath);
		}

		if (fs.existsSync(previewPath)) {
			fs.unlinkSync(previewPath);
		}
	}
}
