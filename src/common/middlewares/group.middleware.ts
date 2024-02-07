import { Inject, Injectable, NestMiddleware, HttpException, HttpStatus } from "@nestjs/common";
import { Response, Request, NextFunction } from "express"; 

import { Services } from "../utils/constrants";
import { AuthenticatedRequest } from "../utils/types";
import { GroupService } from "src/modules/group/services/impl/group.service";

@Injectable()
export class GroupMiddleware implements NestMiddleware {
    constructor(
        @Inject(Services.GROUP) private readonly groupService : GroupService,
    ) { }

    async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { id: userId } = req.user;
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            throw new HttpException('Invalid id', HttpStatus.BAD_REQUEST);
        }

        const params = { id, userId };
        const user = await this.groupService.hasAccess(params);

        if (user) {
            next();
        } else {
            throw new HttpException('User does not have access to the group', HttpStatus.FORBIDDEN);
        }
    }
}
