export enum Routes {
    AUTH = 'auth',
    USER = 'user',
    USER_PROFILE = 'user/profile',
    CONVERSATION = 'conversation',
    MESSAGE = 'conversation/:id/message',
    GROUP = 'groups',
    GROUP_MESSAGE = 'groups/:id/message',
    GROUP_RECIPIENTS = 'groups/:id/recipients',
    EXISTS = 'exists',
    FRIEND = 'friend',
    FRIEND_REQUEST = 'friend/request',
    USER_PRESENCE = 'user/presence',
}

export enum Services {
    AUTH = 'AUTH_SERVICE',
    USER = 'USER_SERVICE',
    CONVERSATION = 'CONVERSATION_SERVICE',
    THROTTLER_GUARD = 'THROTTLER_GUARD',
    FRIENDS_SERVICE = "FRIENDS_SERVICE",
    FRIEND_REQUEST_SERVICE = "FRIEND_REQUEST_SERVICE",
}

export enum Configs {
    JWTCONFIG = 'JWT_CONFIG'
}

export enum ApiTagConfigs {
    AUTH = 'Auth',
    USER = 'User',
    CONVERSATION = 'Conversation',
    FRIEND_REQUEST = 'Friend Request'
}

export enum ServerEvents {
    FRIEND_REQUEST_ACCEPTED = 'friendrequest.accepted',
    FRIEND_REQUEST_REJECTED = 'friendrequest.rejected',
    FRIEND_REQUEST_CANCELLED = 'friendrequest.cancelled',
    FRIEND_REMOVED = 'friend.removed',
}
