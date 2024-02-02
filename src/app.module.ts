import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { dataSourceOptions } from './database/data-source';
import { SeederService } from './seeder-role.service';
import { Role } from './modules/user/entities/role.entity';

dotenv.config();

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({ envFilePath: '.env' }),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([Role])
  ],
  providers: [
    SeederService
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
