#!/usr/bin/env node

/**
 * Migration Script: Add mainTopic field to existing learning targets
 * 
 * Bu script mevcut learning target kayıtlarına mainTopic alanı ekler.
 * Script'i çalıştırmadan önce veritabanının yedeğini alın!
 */

import * as admin from 'firebase-admin';
import { TopicClassificationUtil } from '../common/utils/topic-classification.util';

// Firebase Admin SDK'yı başlat
const serviceAccount = require('../../secrets/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

interface LearningTargetDoc {
  id: string;
  subTopicName: string;
  mainTopic?: string;
  [key: string]: any;
}

async function migrateLearningTargets() {
  console.log('🚀 Learning Targets MainTopic Migration başlatılıyor...\n');

  try {
    // Tüm learning targets'ları al
    const learningTargetsRef = db.collection('learning_targets');
    const snapshot = await learningTargetsRef.get();

    if (snapshot.empty) {
      console.log('❌ Hiçbir learning target bulunamadı.');
      return;
    }

    console.log(`📊 Toplam ${snapshot.size} learning target bulundu.`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Batch işlemlerini optimize etmek için grupla (max 500 operation per batch)
    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH_SIZE = 500;

    for (const doc of snapshot.docs) {
      try {
        const data = doc.data() as LearningTargetDoc;

        // Eğer mainTopic zaten varsa, atla
        if (data.mainTopic) {
          skippedCount++;
          console.log(`⏭️ Atlandı: ${doc.id} (zaten mainTopic var: ${data.mainTopic})`);
          continue;
        }

        // subTopicName yoksa, atla
        if (!data.subTopicName) {
          skippedCount++;
          console.log(`⏭️ Atlandı: ${doc.id} (subTopicName yok)`);
          continue;
        }

        // Ana konuyu sınıflandır
        const mainTopic = TopicClassificationUtil.classifyMainTopic(data.subTopicName);

        // Batch'e ekle
        batch.update(doc.ref, { mainTopic });
        batchCount++;
        updatedCount++;

        console.log(`✅ Güncelleniyor: ${doc.id}`);
        console.log(`   📝 subTopicName: "${data.subTopicName}"`);
        console.log(`   🏷️ mainTopic: "${mainTopic}"`);
        console.log('');

        // Batch limiti aşılırsa commit yap
        if (batchCount >= MAX_BATCH_SIZE) {
          console.log(`📦 Batch commit yapılıyor (${batchCount} işlem)...`);
          await batch.commit();
          batchCount = 0;
          
          // Yeni batch başlat
          const newBatch = db.batch();
          
          // Rate limiting için kısa bekleme
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        errorCount++;
        console.error(`❌ Hata ${doc.id}: ${error.message}`);
      }
    }

    // Son batch'i commit yap
    if (batchCount > 0) {
      console.log(`📦 Son batch commit yapılıyor (${batchCount} işlem)...`);
      await batch.commit();
    }

    console.log('\n🎉 Migration tamamlandı!');
    console.log(`📊 Sonuçlar:`);
    console.log(`   ✅ Güncellenen: ${updatedCount}`);
    console.log(`   ⏭️ Atlanan: ${skippedCount}`);
    console.log(`   ❌ Hatalı: ${errorCount}`);
    console.log(`   📁 Toplam: ${snapshot.size}`);

  } catch (error) {
    console.error('💥 Migration sırasında kritik hata:', error);
    throw error;
  }
}

// Migration'ı çalıştır
if (require.main === module) {
  migrateLearningTargets()
    .then(() => {
      console.log('\n✅ Migration başarıyla tamamlandı.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration başarısız:', error);
      process.exit(1);
    });
}

export { migrateLearningTargets };
