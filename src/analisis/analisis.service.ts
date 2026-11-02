import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrosDto } from './dto/filtros.dto';
import { UMBRALES, VARIABLES, Variable } from './umbrales';

const TODAS = { temperatura: true, humedad: true, pm25: true, precipitacion: true, ph: true } as const;

@Injectable()
export class AnalisisService {
  constructor(private readonly prisma: PrismaService) {}

  async promedios(f: FiltrosDto) {
    const r = await this.prisma.medicion.aggregate({
      where: this.construirWhere(f),
      _count: true,
      _avg: TODAS,
    });

    const promedios = Object.fromEntries(
      this.variables(f).map((v) => [v, { valor: this.redondear(r._avg[v]), unidad: UMBRALES[v].unidad }]),
    );
    return { totalMediciones: r._count, promedios };
  }

  async extremos(f: FiltrosDto) {
    const r = await this.prisma.medicion.aggregate({
      where: this.construirWhere(f),
      _count: true,
      _min: TODAS,
      _max: TODAS,
    });

    const extremos = Object.fromEntries(
      this.variables(f).map((v) => [v, { minimo: r._min[v], maximo: r._max[v], unidad: UMBRALES[v].unidad }]),
    );
    return { totalMediciones: r._count, extremos };
  }

  async alertas(f: FiltrosDto) {
    const vars = this.variables(f);

    // Una condición por cada umbral: "temperatura > 35", "ph < 6", "ph > 9"...
    const condiciones: Prisma.MedicionWhereInput[] = [];
    for (const v of vars) {
      const u = UMBRALES[v];
      if (u.max !== undefined) condiciones.push({ [v]: { gt: u.max } } as Prisma.MedicionWhereInput);
      if (u.min !== undefined) condiciones.push({ [v]: { lt: u.min } } as Prisma.MedicionWhereInput);
    }

    const mediciones = await this.prisma.medicion.findMany({
      where: { AND: [this.construirWhere(f), { OR: condiciones }] },
      include: { estacion: { include: { municipio: true } } },
      orderBy: { fecha: 'asc' },
    });

    // Una medición puede romper varios umbrales: se genera una alerta por cada uno
    const alertas = mediciones.flatMap((m) =>
      vars
        .filter((v) => this.superaUmbral(v, m[v]))
        .map((v) => ({
          medicionId: m.id,
          fecha: m.fecha,
          estacion: m.estacion.nombre,
          municipio: m.estacion.municipio.nombre,
          variable: v,
          valor: m[v],
          unidad: UMBRALES[v].unidad,
          condicion: this.describirUmbral(v),
        })),
    );

    return { totalAlertas: alertas.length, alertas };
  }

  // ---------- auxiliares ----------

    estaciones() {
    return this.prisma.estacion.findMany({
      include: { municipio: true },
      orderBy: { id: 'asc' },
    });
  }

  private construirWhere(f: FiltrosDto): Prisma.MedicionWhereInput {
    const where: Prisma.MedicionWhereInput = {};
    if (f.estacionId) where.estacionId = f.estacionId;

    const fecha: { gte?: Date; lt?: Date } = {};
    if (f.fechaInicio) fecha.gte = new Date(f.fechaInicio);
    if (f.fechaFin) {
      const fin = new Date(f.fechaFin);
      // Si solo viene la fecha (sin hora), se incluye el día completo
      if (f.fechaFin.length === 10) fin.setUTCDate(fin.getUTCDate() + 1);
      fecha.lt = fin;
    }
    if (fecha.gte && fecha.lt && fecha.gte >= fecha.lt) {
      throw new BadRequestException('fechaInicio debe ser anterior o igual a fechaFin');
    }
    if (fecha.gte || fecha.lt) where.fecha = fecha;

    return where;
  }

  private variables(f: FiltrosDto): Variable[] {
    return f.variable ? [f.variable] : [...VARIABLES];
  }

  private superaUmbral(v: Variable, valor: number): boolean {
    const u = UMBRALES[v];
    return (u.max !== undefined && valor > u.max) || (u.min !== undefined && valor < u.min);
  }

  private describirUmbral(v: Variable): string {
    const u = UMBRALES[v];
    if (u.min !== undefined && u.max !== undefined) return `< ${u.min} o > ${u.max}`;
    return u.max !== undefined ? `> ${u.max} ${u.unidad}` : `< ${u.min} ${u.unidad}`;
  }

  private redondear(n: number | null): number | null {
    return n === null ? null : Math.round(n * 100) / 100;
  }
}