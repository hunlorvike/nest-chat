import { HttpException, HttpStatus, Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { Services } from "src/common/utils/constrants";
import { IConversationService } from "../services/interface-conversation.service";
import { NextFunction } from "express";
import { AuthenticatedRequest } from "src/common/utils/types";

@Injectable()
export class ConversationMiddleware implements NestMiddleware {
    constructor(
        @Inject(Services.CONVERSATION) private readonly conversationService: IConversationService,
    ) { }

    async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { id: userId } = req.user;
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            throw new HttpException('Invalid conversation ID', HttpStatus.BAD_REQUEST);
        }

        const isReadable = await this.conversationService.hasAccess({ id, userId });
        console.log(isReadable);

        if (isReadable) {
            next();
        } else {
            throw new HttpException('Conversation not found or access denied', HttpStatus.NOT_FOUND);
        }
    }
}
