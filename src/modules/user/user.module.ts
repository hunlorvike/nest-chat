import { UserController } from './controllers/user.controller';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Services } from 'src/common/utils/constrants';
import { UserService } from './services/impl/user.service';
import { Peer } from './entities/peer.entity';
import { Role } from './entities/role.entity';
import { AuthService } from '../auth/services/impl/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserPresenceController } from './controllers/user-presence.controller';
import { UserProfilesController } from './controllers/user-profile.controller';
import { UserPresenceService } from './services/impl/user-presence.service';
import { UserPresence } from './entities/user-presence.entity';
import { UserProfileService } from './services/impl/user-profile.service';
import { Profile } from './entities/user-profile.entity';
import { ImageStorageService } from '../image-storage/services/impl/image-storage.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Peer, Role, UserPresence, Profile]),
        JwtModule,
        UserModule

    ],
    controllers: [
        UserController,
        UserPresenceController,
        UserProfilesController
    ],
    providers: [
        Logger,
        {
            provide: Services.USER,
            useClass: UserService
        },
        {
            provide: Services.AUTH,
            useClass: AuthService,
        },
        {
            provide: Services.USER_PRESENCE,
            useClass: UserPresenceService
        },
        {
            provide: Services.USERS_PROFILE,
            useClass: UserProfileService
        },
        {
            provide: Services.IMAGE_UPLOAD_SERVICE,
            useClass: ImageStorageService
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
