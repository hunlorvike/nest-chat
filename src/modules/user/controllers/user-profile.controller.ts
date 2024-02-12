import { Controller, Inject, Patch, UseInterceptors, UploadedFiles, Body, HttpException, HttpStatus, Logger, UseGuards } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { Roles } from "src/common/decorators/role.decorator";
import { Services, Routes, ApiTagConfigs, UserProfileFileFields } from "src/common/utils/constrants";
import { UserProfileFiles, UpdateUserProfileParams } from "src/common/utils/types";
import { UpdateUserProfileDto } from "../dtos/update-user-profile.dto";
import { User } from "../entities/user.entity";
import { IUserProfile } from "../services/interface-user-profile.service";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { JwtGuard } from "src/common/guards/jwt.guard";

@ApiTags(ApiTagConfigs.USER_PROFILE)
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Roles()
@Controller(Routes.USER_PROFILE)
export class UserProfilesController {

    constructor(
        @Inject(Services.USERS_PROFILE)
        private readonly userProfileService: IUserProfile,
        private logger: Logger
    ) { }

    @Patch()
    @ApiOperation({ summary: 'Update user profile', description: 'Endpoint to update user profile' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 200, description: 'Successfully updated user profile' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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
