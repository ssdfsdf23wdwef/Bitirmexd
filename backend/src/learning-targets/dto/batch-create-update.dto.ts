import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BatchCreateUpdateTargetDto {
  @ApiProperty({
    description: 'Alt konu adı',
    example: 'JavaScript Closures',
  })
  @IsString()
  subTopicName: string;

  @ApiProperty({
    description: 'Öğrenme hedefinin durumu',
    enum: ['pending', 'failed', 'medium', 'mastered'],
    example: 'medium',
  })
  @IsString()
  status: 'pending' | 'failed' | 'medium' | 'mastered';

  @ApiProperty({
    description: 'Son deneme puan yüzdesi (0-100 arası) - isteğe bağlı',
    example: 75.5,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lastScore?: number;
}

export class BatchCreateUpdateLearningTargetsDto {
  @ApiProperty({
    description: 'Oluşturulacak/güncellenecek öğrenme hedefleri listesi',
    type: [BatchCreateUpdateTargetDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchCreateUpdateTargetDto)
  targets: BatchCreateUpdateTargetDto[];
}
