import { Injectable, Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { IAuthService } from "src/modules/auth/services/interface-auth.service";
import { Services } from "./constrants";
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(Services.AUTH) private readonly authService: IAuthService,
  ) {
    super();
  }

  async validate(username: string, password: string) {
    return this.authService.validateUser({ username, password });
  }
}