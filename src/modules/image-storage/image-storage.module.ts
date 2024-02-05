import { Module } from '@nestjs/common';
import { Services } from 'src/common/utils/constrants';
import { ImageStorageService } from './services/impl/image-storage.service';

@Module({
  providers: [
    {
      provide: Services.IMAGE_UPLOAD_SERVICE,
      useClass: ImageStorageService,
    },
  ],
  exports: [
    {
      provide: Services.IMAGE_UPLOAD_SERVICE,
      useClass: ImageStorageService,
    },
  ],
})
export class ImageStoreModule {}
