import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ServerEvents } from "src/common/utils/constrants";
import { RemoveFriendEventPayload } from "src/common/utils/types";
import { MessagingGateway } from "../gateway/gateway";

@Injectable()
export class FriendEvent {
    constructor(private readonly gateway: MessagingGateway) { }

    @OnEvent(ServerEvents.FRIEND_REMOVED)
    handleFriendRemoved({ userId, friend }: RemoveFriendEventPayload) {
        const { sender, receiver } = friend;
        console.log(ServerEvents.FRIEND_REMOVED);
        const socket = this.gateway.jwtManager.getUserSocket(
            receiver.id === userId ? sender.id : receiver.id,
        );
        console.log(`Emitting Event for ${socket?.user?.username}`);
        socket?.emit('onFriendRemoved', friend);
    }

}