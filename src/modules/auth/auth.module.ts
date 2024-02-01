/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { Services } from 'src/common/utils/constrants';
import { AuthService } from './services/impl/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from 'src/common/utils/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';

@Module({
    imports: [
        UserModule,
        JwtModule,
        TypeOrmModule.forFeature([User, Role])
    ],
    controllers: [AuthController],
    providers: [
        LocalStrategy,
        JwtService,
        {
            provide: Services.AUTH,
            useClass: AuthService,
        },
    ],
})
export class AuthModule { }
