import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5454,
    username: process.env.DB_USERNAME || "user_chatapp",
    password: process.env.DB_PASSWORD || "pass_chatapp",
    database: process.env.DB_NAME || "nestjs_chatapp",
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    extra: {
        charset: 'utf8mb4_unicode_ci',
    },
    synchronize: false,
    logging: false
}

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
