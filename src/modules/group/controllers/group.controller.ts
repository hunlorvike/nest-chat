
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTagConfigs, Routes, Services } from 'src/common/utils/constrants';
import { Attachment } from 'src/common/utils/types';
import { User } from 'src/modules/user/entities/user.entity';
import { IGroupService } from '../services/interface-group.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { TransferOwnerDto } from '../dtos/transfer-owner.dto';
import { UpdateGroupDetailsDto } from '../dtos/update-group-detail';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@ApiTags(ApiTagConfigs.GROUP)
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Roles()
@Controller(Routes.GROUP)
export class GroupController {
  constructor(
    @Inject(Services.GROUP) private readonly groupService: IGroupService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createGroup(@GetUser() user: User, @Body() payload: CreateGroupDto) {
    const group = await this.groupService.createGroup({
      ...payload,
      creator: user,
    });
    this.eventEmitter.emit('group.create', group);
    return group;
  }

  @Get()
  getGroups(@GetUser() user: User) {
    return this.groupService.getGroups({ userId: user.id });
  }

  @Get(':id')
  getGroup(@GetUser() user: User, @Param('id') id: number) {
    return this.groupService.findGroupById(id);
  }

  @Patch(':id/owner')
  async updateGroupOwner(
    @GetUser() { id: userId }: User,
    @Param('id') groupId: number,
    @Body() { newOwnerId }: TransferOwnerDto,
  ) {
    const params = { userId, groupId, newOwnerId };
    const group = await this.groupService.transferGroupOwner(params);
    this.eventEmitter.emit('group.owner.update', group);
    return group;
  }

  @Patch(':id/details')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateGroupDetails(
    @Body() { title }: UpdateGroupDetailsDto,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() avatar: Attachment,
  ) {
    console.log(avatar);
    console.log(title);
    return this.groupService.updateDetails({ id, avatar, title });
  }
}