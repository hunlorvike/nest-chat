import { Injectable, Inject, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Services } from "src/common/utils/constrants";
import { UpdateStatusMessageParams } from "src/common/utils/types";
import { Repository } from "typeorm";
import { UserPresence } from "../../entities/user-presence.entity";
import { User } from "../../entities/user.entity";
import { IUserPresenceService } from "../interface-user-presence.service";
import { IUserService } from "../interface-user.service";

@Injectable()
export class UserPresenceService implements IUserPresenceService {

  constructor(
    @InjectRepository(UserPresence)
    private readonly userPresenceRepository: Repository<UserPresence>,
    @Inject(Services.USER)
    private readonly userService: IUserService,
    private readonly logger: Logger, 
  ) {}

  async createPresence(): Promise<UserPresence> {
    try {
      return this.userPresenceRepository.save(
        this.userPresenceRepository.create(),
      );
    } catch (error) {
      this.logger.error(`Error creating user presence: ${error.message}`, error.stack);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateStatus({
    user,
    statusMessage,
  }: UpdateStatusMessageParams): Promise<User> {
    try {
      this.logger.log(user);
      if (!user.presence) {
        this.logger.log('userDB.presence does not exist. creating');
        user.presence = await this.createPresence();
      }
      this.logger.log('updating status...');
      user.presence.statusMessage = statusMessage;
      return this.userService.saveUser(user);
    } catch (error) {
      this.logger.error(`Error updating user status: ${error.message}`, error.stack);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
