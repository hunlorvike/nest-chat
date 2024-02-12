import { Socket } from 'socket.io';
import { User } from 'src/modules/user/entities/user.entity';

export interface AuthenticatedSocket extends Socket {
    user?: User;
}