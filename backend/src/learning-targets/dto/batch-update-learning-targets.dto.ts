import {
  IsArray,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BatchUpdateTargetDto {
  @ApiProperty({
    description: 'Ana konu adı',
    example: 'Matematik',
  })
  @IsString()
  topic: string;

  @ApiProperty({
    description: 'Alt konu adı',
    example: 'Türev',
  })
  @IsString()
  subTopic: string;

  @ApiProperty({
    description: 'Öğrenme hedefinin durumu',
    enum: ['PENDING', 'FAILED', 'MEDIUM', 'MASTERED'],
    example: 'MEDIUM',
  })
  @IsString()
  status: 'PENDING' | 'FAILED' | 'MEDIUM' | 'MASTERED';

  @ApiProperty({
    description: 'Son deneme puan yüzdesi (0-100 arası)',
    example: 75.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;
}

export class BatchUpdateLearningTargetsDto {
  @ApiProperty({
    description: 'Güncellenecek öğrenme hedefleri listesi',
    type: [BatchUpdateTargetDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchUpdateTargetDto)
  targets: BatchUpdateTargetDto[];
}
