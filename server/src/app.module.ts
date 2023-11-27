import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './module/auth.module';
import { MoviesModule } from './module/movies.module';
import * as redisStore from 'cache-manager-redis-store';
import { UsersEntity } from './core/entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'cache',
      password: 'password',
      username: 'redis',
      port: 6379,
      no_ready_check: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.TYPEORM_CONNECTION,
      host: process.env.TYPEORM_HOST,
      port: process.env.TYPEORM_PORT,
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      synchronize: true,
    } as unknown as TypeOrmModuleOptions),
    TypeOrmModule.forFeature([UsersEntity]),
    AuthModule,
    MoviesModule,
  ],
})
export class AppModule {}
