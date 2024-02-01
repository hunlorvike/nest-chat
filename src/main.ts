import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { join } from 'path';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';

dotenv.config()

async function bootstrap() {
	const { PORT } = process.env

	const app = await NestFactory.create<NestApplication>(AppModule);

	app.useGlobalInterceptors(new ResponseInterceptor());

	app.useStaticAssets(join(__dirname, '..', 'public'), {
		prefix: '/',
		setHeaders: (res) => {
			res.set('Cache-Control', 'max-age=2592000');
		},
	});

	app.setGlobalPrefix('api')

	const corsOptions: CorsOptions = {
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	};

	app.enableCors(corsOptions);

	app.useGlobalPipes(new ValidationPipe());

	try {
		await app.listen(PORT);
	} catch (err) {
		console.log(err);
	}
}
bootstrap();
