import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket } from 'src/common/utils/interfaces';

export interface IGatewayJWTManager {
    getUserSocket(id: number): AuthenticatedSocket;
    setUserSocket(id: number, socket: AuthenticatedSocket): void;
    removeUserSocket(id: number): void;
    getSockets(): Map<number, AuthenticatedSocket>;
}

@Injectable()
export class GatewayJWTManager implements IGatewayJWTManager {
    private readonly jwts: Map<number, AuthenticatedSocket> = new Map();

    getUserSocket(id: number) {
        return this.jwts.get(id);
    }

    setUserSocket(userId: number, socket: AuthenticatedSocket) {
        this.jwts.set(userId, socket);
    }

    removeUserSocket(userId: number) {
        this.jwts.delete(userId);
    }

    getSockets(): Map<number, AuthenticatedSocket> {
        return this.jwts;
    }

    setUserSocketFromToken(decodedToken: any, socket: AuthenticatedSocket): void {
        const userId = decodedToken.sub;
        this.setUserSocket(userId, socket);
    }

    removeUserSocketFromToken(decodedToken: any): void {
        const userId = decodedToken.sub;
        this.removeUserSocket(userId);
    }
}
