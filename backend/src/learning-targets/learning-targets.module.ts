import { Module, forwardRef } from '@nestjs/common';
import { LearningTargetsController } from './learning-targets.controller';
import { LearningTargetsService } from './learning-targets.service';
import { AiModule } from '../ai/ai.module';
import { SharedModule } from '../shared/shared.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { DocumentsModule } from '../documents/documents.module';
import { CoursesModule } from '../courses/courses.module';
@Module({
  imports: [
    AiModule,
    SharedModule,
    FirebaseModule,
    forwardRef(() => DocumentsModule),
    forwardRef(() => CoursesModule),
  ],
  controllers: [LearningTargetsController],
  providers: [LearningTargetsService],
  exports: [LearningTargetsService],
})
export class LearningTargetsModule {}
