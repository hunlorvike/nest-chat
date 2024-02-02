import { HttpException, HttpStatus, Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { Services } from "src/common/utils/constrants";
import { IConversationService } from "../services/interface-conversation.service";
import { Messages } from "src/common/utils/response-message";

@Injectable()
export class ConversationMiddleware implements NestMiddleware {
    constructor(
        @Inject(Services.CONVERSATION) private readonly conversationService: IConversationService,
    ) { }
    async use(req: any, res: any, next: (error?: any) => void) {
        const user = req.headers.user;
        const id = user.id;
        if (isNaN(id)) {
            throw new HttpException(Messages.USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
        }
        const isReadable = await this.conversationService
    }

}