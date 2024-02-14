import { Module } from "@nestjs/common";
import { ConversationModule } from "../conversations/conversation.module";
import { GroupModule } from "../group/group.module";
import { FriendModule } from "../friend/friend.module";
import { MessagingGateway } from "./gateway";
import { Services } from "src/common/utils/constrants";
import { GatewayJWTManager } from "./gateway.jwt";

@Module({
    imports: [
        ConversationModule,
        GroupModule,
        FriendModule
    ],
    providers: [
        MessagingGateway,
        {
            provide: Services.GATEWAY_JWT_MANAGER,
            useClass: GatewayJWTManager
        }
    ],
    exports: [
        MessagingGateway,
        {
            provide: Services.GATEWAY_JWT_MANAGER,
            useClass: GatewayJWTManager
        }
    ]
})
export class GatewayModule { }