import { FriendModule } from './modules/friend/friend.module';
import { ConversationModule } from './modules/conversations/conversation.module';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { dataSourceOptions } from './database/data-source';
import { SeederService } from './seeder-role.service';
import { Role } from './modules/user/entities/role.entity';
import { Services } from './common/utils/constrants';
import { JwtModule } from '@nestjs/jwt';
import { User } from './modules/user/entities/user.entity';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

dotenv.config();


@Module({
	imports: [
        FriendModule, 
		ConversationModule,
		UserModule,
		AuthModule,
		ConfigModule.forRoot({ envFilePath: '.env' }),
		TypeOrmModule.forRoot(dataSourceOptions),
		TypeOrmModule.forFeature([User, Role]),
		JwtModule,
		ThrottlerModule.forRoot({
			throttlers: [
				{
					name: 'global',
					limit: 10,
					ttl: 60,
				},
			]
		}),
		EventEmitterModule.forRoot(),
	],
	providers: [
		SeederService,
		{
			provide: Services.THROTTLER_GUARD,
			useClass: ThrottlerGuard
		}
	]
})
export class AppModule {
	constructor(private readonly seederService: SeederService) {
		this.seedDatabase();
	}

	async seedDatabase() {
		await this.seederService.seed();
	}

}
