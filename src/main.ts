import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { join } from 'path';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

dotenv.config()

async function bootstrap() {
	const { PORT, APP_PREFIX, APP_NAME, VERSION } = process.env

	const app = await NestFactory.create<NestApplication>(AppModule);

	app.useGlobalInterceptors(new ResponseInterceptor());

	app.useStaticAssets(join(__dirname, '..', 'public'), {
		prefix: '/',
		setHeaders: (res) => {
			res.set('Cache-Control', 'max-age=2592000');
		},
	});

	app.setGlobalPrefix(APP_PREFIX)

	const corsOptions: CorsOptions = {
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	};

	app.enableCors(corsOptions);

	app.useGlobalPipes(new ValidationPipe());

	const config = new DocumentBuilder()
		.addBearerAuth()
		.setTitle(APP_NAME)
		.setDescription('Ứng dụng chat là một nền tảng giao tiếp đa phương tiện mạnh mẽ, được xây dựng trên cơ sở của NestJS, một framework Node.js hiệu suất cao và linh hoạt. Với giao diện người dùng thân thiện và tính năng đa dạng, ứng dụng này cung cấp trải nghiệm giao tiếp trực tuyến đồng thời và hiệu quả.')
		.setVersion(VERSION)
		.addTag('Version 1.0')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup(`${APP_PREFIX}/swagger`, app, document);

	try {
		await app.listen(PORT);
		console.log(`Application running on port: ${PORT}`)
	} catch (err) {
		console.log(err);
	}
}
bootstrap();
