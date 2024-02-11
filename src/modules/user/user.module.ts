import { UserController } from './controllers/user.controller';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Services } from 'src/common/utils/constrants';
import { UserService } from './services/impl/user.service';
import { Peer } from './entities/peer.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Peer])
    ],
    controllers: [
        UserController,
    ],
    providers: [
        Logger,
        {
            provide: Services.USER,
            useClass: UserService
        }
    ],
    exports: [
        {
            provide: Services.USER,
            useClass: UserService
        }
    ]
})
export class UserModule { }
