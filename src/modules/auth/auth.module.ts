/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { Services } from 'src/common/utils/constrants';
import { AuthService } from './services/impl/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserModule } from '../user/user.module';
import { SessionSerializer } from 'src/common/utils/session-serializer';
import { LocalStrategy } from 'src/common/utils/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { User_Role } from '../user/entities/users-roles.entity';

@Module({
    imports: [
        UserModule,
        JwtModule,
        TypeOrmModule.forFeature([User, User_Role])
    ],
    controllers: [AuthController],
    providers: [
        LocalStrategy,
        SessionSerializer,
        JwtService,

        {
            provide: Services.AUTH,
            useClass: AuthService,
        },
    ],
})
export class AuthModule { }
