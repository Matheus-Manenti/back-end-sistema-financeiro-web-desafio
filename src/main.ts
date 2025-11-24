import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Sistema Financeiro API')
    .setDescription('Documentação da API do Sistema Financeiro')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors();

  app.setGlobalPrefix('api');

  try {
    if (process.env.SEED_ON_STARTUP === 'true') {
      console.log('SEED_ON_STARTUP=true — executando seed...');
      const { runSeed } = require('../prisma/Seed');
      await runSeed();
    }
  } catch (e) {
    console.error('Erro ao executar seed durante inicialização:', e);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
