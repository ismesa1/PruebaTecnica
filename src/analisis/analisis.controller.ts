import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalisisService } from './analisis.service';
import { FiltrosDto } from './dto/filtros.dto';

@ApiTags('Análisis')
@Controller('analisis')
export class AnalisisController {
  constructor(private readonly analisis: AnalisisService) {}

  @Get('estaciones')
  @ApiOperation({ summary: 'Listado de estaciones con su municipio' })
  estaciones() {
    return this.analisis.estaciones();
  }

  @Get('promedios')
  @ApiOperation({ summary: 'Promedio de las variables ambientales' })
  promedios(@Query() filtros: FiltrosDto) {
    return this.analisis.promedios(filtros);
  }

  @Get('extremos')
  @ApiOperation({ summary: 'Valores mínimos y máximos registrados' })
  extremos(@Query() filtros: FiltrosDto) {
    return this.analisis.extremos(filtros);
  }

  @Get('alertas')
  @ApiOperation({ summary: 'Mediciones que superan los umbrales definidos' })
  alertas(@Query() filtros: FiltrosDto) {
    return this.analisis.alertas(filtros);
  }
}