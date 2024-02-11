import { HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { IUserProfile } from "../interface-user-profile.service";
import { User } from "../../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Services } from "src/common/utils/constrants";
import { IImageStorageService } from "src/modules/image-storage/services/interface-image-storage.service";
import { Repository } from "typeorm";
import { Profile } from "../../entities/user-profile.entity";
import { generateUUIDV4 } from "src/common/utils/helpers";
import { UpdateUserProfileParams } from "src/common/utils/types";

@Injectable()
export class UserProfileService implements IUserProfile {
    private readonly logger = new Logger(UserProfileService.name);

    constructor(
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject(Services.IMAGE_UPLOAD_SERVICE)
        private readonly imageStorageService: IImageStorageService,
    ) { }

    createProfile() {
        try {
            const newProfile = this.profileRepository.create();
            return this.profileRepository.save(newProfile);
        } catch (error) {
            this.logger.error(`Error creating profile: ${error.message}`, error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createProfileOrUpdate(user: User, params: UpdateUserProfileParams) {
        try {
            this.logger.log('CreateProfileOrUpdate');
            if (!user.profile) {
                this.logger.log('User has no profile. Creating...');
                user.profile = await this.createProfile();
                return this.updateProfile(user, params);
            }
            this.logger.log('User has profile');
            return this.updateProfile(user, params);
        } catch (error) {
            this.logger.error(`Error creating or updating profile: ${error.message}`, error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateProfile(user: User, params: UpdateUserProfileParams) {
        try {
            this.logger.log(params);
            if (params.avatar)
                user.profile.avatar = await this.updateAvatar(params.avatar);
            if (params.banner)
                user.profile.banner = await this.updateBanner(params.banner);
            if (params.about) user.profile.about = params.about;
            return this.userRepository.save(user);
        } catch (error) {
            this.logger.error(`Error updating profile: ${error.message}`, error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateBanner(file: Express.Multer.File) {
        try {
            this.logger.log('Updating Banner');
            const key = generateUUIDV4();
            await this.imageStorageService.upload({ key, file });
            return key;
        } catch (error) {
            this.logger.error(`Error updating banner: ${error.message}`, error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateAvatar(file: Express.Multer.File) {
        try {
            this.logger.log('Updating Avatar');
            const key = generateUUIDV4();
            await this.imageStorageService.upload({ key, file });
            return key;
        } catch (error) {
            this.logger.error(`Error updating avatar: ${error.message}`, error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
