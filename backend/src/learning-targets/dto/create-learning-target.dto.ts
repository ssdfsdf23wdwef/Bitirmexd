import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLearningTargetDto {
  @ApiProperty({ description: 'Konu adı' })
  @IsString()
  topicName: string;

  @ApiProperty({ description: 'Kurs ID (opsiyonel)', required: false })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiProperty({
    description: 'Öğrenme hedefi durumu',
    enum: ['pending', 'failed', 'medium', 'mastered'],
    default: 'pending',
    required: false,
  })
  @IsIn(['pending', 'failed', 'medium', 'mastered'])
  @IsOptional()
  status?: 'pending' | 'failed' | 'medium' | 'mastered';

  @ApiProperty({
    description: 'Kullanıcının ekleyebileceği notlar',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  // Not: isNewTopic burada false, source 'manual' olacak - servis tarafında ayarlanacak
}
