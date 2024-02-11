import { GroupRecipientService } from './modules/group/services/impl/group-recipient.service';
import { GroupMessageService } from './modules/group/services/impl/group-message.service';
import { GroupModule } from './modules/group/group.module';
import { ExistsModule } from './modules/exists/exists.module';
import { ImageStoreModule } from './modules/image-storage/image-storage.module';
import { MessageAttachmentModule } from './modules/message-attachment/message-attachment.module';
import { MessageModule } from './modules/message/message.module';
import { FriendModule } from './modules/friend/friend.module';
import { ConversationModule } from './modules/conversations/conversation.module';
import { Logger, Module } from '@nestjs/common';
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
import { FriendRequestModule } from './modules/friend-request/friend-request.module';
import { AuthService } from './modules/auth/services/impl/auth.service';
import { ThrottlerBehindProxyGuard } from './common/utils/throttler';

dotenv.config();


@Module({
	imports: [
		GroupModule,
		ExistsModule,
		ImageStoreModule,
		MessageAttachmentModule,
		MessageModule,
		FriendRequestModule,
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
		Logger,
		SeederService,
		{
			provide: Services.THROTTLER_GUARD,
			useClass: ThrottlerBehindProxyGuard
		},
		{
			provide: Services.AUTH,
			useClass: AuthService,
		},
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
