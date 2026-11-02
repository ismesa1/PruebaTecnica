-- CreateTable
CREATE TABLE "municipios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estaciones" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "municipio_id" INTEGER NOT NULL,

    CONSTRAINT "estaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mediciones" (
    "id" SERIAL NOT NULL,
    "estacion_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "temperatura" DOUBLE PRECISION NOT NULL,
    "humedad" DOUBLE PRECISION NOT NULL,
    "pm25" DOUBLE PRECISION NOT NULL,
    "precipitacion" DOUBLE PRECISION NOT NULL,
    "ph" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "mediciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "municipios_nombre_key" ON "municipios"("nombre");

-- CreateIndex
CREATE INDEX "mediciones_estacion_id_fecha_idx" ON "mediciones"("estacion_id", "fecha");

-- AddForeignKey
ALTER TABLE "estaciones" ADD CONSTRAINT "estaciones_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediciones" ADD CONSTRAINT "mediciones_estacion_id_fkey" FOREIGN KEY ("estacion_id") REFERENCES "estaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
