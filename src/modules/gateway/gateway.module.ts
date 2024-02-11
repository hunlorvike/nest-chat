import { Module } from "@nestjs/common";
import { ConversationModule } from "../conversations/conversation.module";
import { GroupModule } from "../group/group.module";
import { FriendModule } from "../friend/friend.module";

@Module({
    imports: [
        ConversationModule,
        GroupModule,
        FriendModule
    ],
    providers: [

    ],
    exports: [

    ]
})
export class GatewayModule { }