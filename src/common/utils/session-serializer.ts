import { Injectable, Inject } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { User } from "src/modules/user/entities/user.entity";
import { IUserService } from "src/modules/user/services/impl/interface-user.service";
import { Services } from "./constrants";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(
        @Inject(Services.USER)
        private readonly userService: IUserService,
    ) {
        super();
    }
    serializeUser(user: User, done: Function) {
        done(null, user);
    }
    async deserializeUser(user: User, done: Function) {
        const userDb = await this.userService.findUser({ id: user.id });
        return userDb ? done(null, userDb) : done(null, null);
    }
}