import { ApiModule } from './api/api.module';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { LoggerService } from './modules/logger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableCors({ origin: true, methods: ['GET', 'POST', 'DELETE', 'PUT'] });

    const logger = new LoggerService('SYSTEM');
    app.useLogger(logger);
    app.useStaticAssets(join(__dirname, '..', 'documentation'));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            exceptionFactory: error => {
                return new BadRequestException(error);
            },
        }),
    );

    setupSwaggerUI(app);
    await app.listen(3001);

    logger.log(`http://127.0.0.1:3001/docs/api`);
}

function setupSwaggerUI(app: NestExpressApplication) {
    const adminOptions = new DocumentBuilder()
        .setTitle('Admin API')
        .setDescription('Admin API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const adminDocument = SwaggerModule.createDocument(app, adminOptions, {
        include: [ApiModule],
    });
    SwaggerModule.setup('docs/api', app, adminDocument);
}
(async () => {
    await bootstrap();
})();
