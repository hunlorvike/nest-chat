import { Controller, Inject, Patch, UseInterceptors, UploadedFiles, Body, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Routes, Services, UserProfileFileFields } from "src/common/utils/constrants";
import { UserProfileFiles, UpdateUserProfileParams } from "src/common/utils/types";
import { UpdateUserProfileDto } from "../dtos/update-user-profile.dto";
import { User } from "../entities/user.entity";
import { IUserProfile } from "../services/interface-user-profile.service";
import { GetUser } from "src/common/decorators/get-user.decorator";

@Controller(Routes.USER_PROFILE)
export class UserProfilesController {
    private readonly logger = new Logger(UserProfilesController.name);

    constructor(
        @Inject(Services.USERS_PROFILE)
        private readonly userProfileService: IUserProfile,
    ) { }

    @Patch()
    @UseInterceptors(FileFieldsInterceptor(UserProfileFileFields))
    async updateUserProfile(
        @GetUser() user: User,
        @UploadedFiles()
        files: UserProfileFiles,
        @Body() updateUserProfileDto: UpdateUserProfileDto,
    ) {
        try {
            this.logger.log('Inside Users/Profiles Controller');
            const params: UpdateUserProfileParams = {};
            updateUserProfileDto.about && (params.about = updateUserProfileDto.about);
            files.banner && (params.banner = files.banner[0]);
            files.avatar && (params.avatar = files.avatar[0]);
            return this.userProfileService.createProfileOrUpdate(user, params);
        } catch (error) {
            this.logger.error(`Error updating user profile: ${error.message}`, error.stack);
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
