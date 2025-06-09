import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuizSubmissionDto {
  @ApiProperty({
    description: 'User answers for the quiz questions',
    example: { 'question1': 'A', 'question2': 'B', 'question3': 'C' },
    type: 'object',
    additionalProperties: { type: 'string' }
  })
  @IsNotEmpty()
  @IsObject()
  answers: Record<string, string>;

  @ApiProperty({
    description: 'Optional timestamp when the quiz was submitted',
    example: '2025-06-10T10:30:00.000Z',
    required: false
  })
  @IsOptional()
  @IsString()
  submittedAt?: string;

  @ApiProperty({
    description: 'Optional time taken to complete the quiz in seconds',
    example: 1800,
    required: false
  })
  @IsOptional()
  timeTaken?: number;
}
