export enum Routes {
    AUTH = 'auth',
    USER = 'user',
    CONVERSATION = 'conversation',
    FRIEND = 'friend',
}


export enum Services {
    AUTH = 'AUTH_SERVICE',
    USER = 'USER_SERVICE',
    CONVERSATION = 'CONVERSATION_SERVICE',
    THROTTLER_GUARD = 'THROTTLER_GUARD',
    FRIENDS_SERVICE = "FRIENDS_SERVICE"
}

export enum Configs {
    JWTCONFIG = 'JWT_CONFIG'
}

export enum ApiTagConfigs {
    AUTH = 'Auth',
    USER = 'User',
    CONVERSATION = 'Conversation'
}

export enum ServerEvents {
    FRIEND_REQUEST_ACCEPTED = 'friendrequest.accepted',
    FRIEND_REQUEST_REJECTED = 'friendrequest.rejected',
    FRIEND_REQUEST_CANCELLED = 'friendrequest.cancelled',
    FRIEND_REMOVED = 'friend.removed',
}
