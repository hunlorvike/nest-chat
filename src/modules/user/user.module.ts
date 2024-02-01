import { UserController } from './controllers/user.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Services } from 'src/common/utils/constrants';
import { UserService } from './services/user.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User])
    ],
    controllers: [
        UserController,
    ],
    providers: [
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
