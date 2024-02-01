import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
dotenv.config()

async function bootstrap() {
	// Declare variable
	const { PORT } = process.env

	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// Use a global interceptor for handling responses
	app.useGlobalInterceptors(new ResponseInterceptor());

	// Serve static assets from the 'public' directory
	app.useStaticAssets(join(__dirname, '..', 'public'), {
		prefix: '/',
		setHeaders: (res) => {
			res.set('Cache-Control', 'max-age=2592000');
		},
	});

	// Prefix
	app.setGlobalPrefix('api')

	// Config CORS
	const corsOptions: CorsOptions = {
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	};

	app.enableCors(corsOptions);

	// Using global pipe validate
	app.useGlobalPipes(new ValidationPipe());

	// Start the application on port 4000
	try {
		await app.listen(PORT, () => console.log(`Running on port ${PORT}`));
	} catch (err) {
		console.log(err);
	}
}
bootstrap();
