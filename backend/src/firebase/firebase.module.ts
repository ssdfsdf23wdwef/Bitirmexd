import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { FirebaseService } from './firebase.service';

/**
 * Firebase modülü
 * Global olarak işaretlenmiştir, bir kez import edildiğinde
 * tüm modüller için kullanılabilir hale gelir
 * Cache desteği ile performans optimizasyonu sağlar
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      ttl: 300, // 5 dakika default TTL
      max: 1000, // maksimum 1000 öğe
      isGlobal: true, // Global olarak kullanılabilir
    }),
  ],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
