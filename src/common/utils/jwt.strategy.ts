import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from "src/modules/auth/services/impl/auth.service";
import { PassportStrategy } from '@nestjs/passport';
import { Configs } from "./constrants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>(Configs.JWTCONFIG) || 'aLongSecretStringWhoseBitnessIsEqualToOrGreaterThanTheBitnessOfTheTokenEncryptionAlgorithm',
        });
    }

    async validate(payload: any) {
        const user = await this.authService.validateToken(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        user.roles = await this.authService.getUserRoles(payload.sub);
        return user;
    }
}