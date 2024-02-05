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
    USERS_PROFILE = 'USER_PROFILE_SERVICE',
    USER_PRESENCE = 'USER_PRESENCE_SERVICE',
    CONVERSATION = 'CONVERSATION_SERVICE',
    MESSAGE = 'MESSAGE_SERVICE',
    MESSAGE_ATTACHMENT = 'MESSAGE_ATTACHMENT_SERVICE',
    GATEWAY_SESSION_MANAGER = 'GATEWAY_SESSION_MANAGER',
    GROUP = 'GROUP_SERVICE',
    GROUP_MESSAGE = 'GROUP_MESSAGE_SERVICE',
    GROUP_RECIPIENT = 'GROUP_RECIPIENT_SERVICE',
    FRIEND_SERVICE = 'FRIEND_SERVICE',
    FRIEND_REQUEST_SERVICE = 'FRIEND_REQUEST_SERVICE',
    SPACE_CLIENT = 'SPACE_CLIENT',
    IMAGE_UPLOAD_SERVICE = 'IMAGE_UPLOAD_SERVICE',
    THROTTLER_GUARD = 'THROTTLER_GUARD'
}

export enum Configs {
    JWTCONFIG = 'JWT_CONFIG',
}

export enum ApiTagConfigs {
    AUTH = 'Auth',
    USER = 'User',
    CONVERSATION = 'Conversation',
    FRIEND = 'Friend',
    FRIEND_REQUEST = 'Friend Request',
}

export enum ServerEvents {
    FRIEND_REQUEST_ACCEPTED = 'friendrequest.accepted',
    FRIEND_REQUEST_REJECTED = 'friendrequest.rejected',
    FRIEND_REQUEST_CANCELLED = 'friendrequest.cancelled',
    FRIEND_REMOVED = 'friend.removed',
}
