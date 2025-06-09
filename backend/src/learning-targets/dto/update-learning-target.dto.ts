import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLearningTargetDto {
  @ApiProperty({
    description: 'Öğrenme hedefinin durumu',
    enum: ['pending', 'failed', 'medium', 'mastered'],
    required: false,
  })
  @IsIn(['pending', 'failed', 'medium', 'mastered'], {
    message:
      'Geçersiz durum değeri. Kabul edilen değerler: pending, failed, medium, mastered',
  })
  @IsOptional()
  status?: 'pending' | 'failed' | 'medium' | 'mastered';

  @ApiProperty({
    description: 'Öğrenme hedefi konusu',
    required: false,
  })
  @IsString()
  @IsOptional()
  topicName?: string;

  @ApiProperty({
    description: 'Kullanıcının ekleyebileceği notlar',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
