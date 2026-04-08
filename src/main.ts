import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://hayfin-front.vercel.app',
      process.env.FRONTEND_URL || '',
    ].filter(Boolean),
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  console.log(`Backend running on port ${port}`);
}
bootstrap();