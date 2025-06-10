import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { FirebaseService } from './firebase.service';
import { PerformanceController } from './performance.controller';


@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      ttl: 300,
      max: 1000, 
      isGlobal: true, 
    }),
  ],
  controllers: [PerformanceController],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
