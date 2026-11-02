import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { VARIABLES, type Variable } from '../umbrales';

export class FiltrosDto {
  @ApiPropertyOptional({ example: '2026-10-01', description: 'Fecha inicial (incluida)' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ example: '2026-10-15', description: 'Fecha final (incluida)' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estacionId?: number;

  @ApiPropertyOptional({ enum: VARIABLES })
  @IsOptional()
  @IsIn(VARIABLES)
  variable?: Variable;
}