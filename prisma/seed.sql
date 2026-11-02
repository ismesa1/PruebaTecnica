-- Datos sintéticos para la prueba técnica SAT
-- 3 municipios, 5 estaciones, 100 mediciones por estación en 30 días.

-- Limpia todo para poder ejecutarlo varias veces sin duplicar
TRUNCATE mediciones, estaciones, municipios RESTART IDENTITY CASCADE;

-- Semilla fija: los valores aleatorios salen iguales en cada ejecución
SELECT setseed(0.42);

INSERT INTO municipios (nombre) VALUES
  ('Manizales'),
  ('Villamaría'),
  ('La Dorada');

INSERT INTO estaciones (nombre, latitud, longitud, municipio_id) VALUES
  ('Chipre',            5.0738, -75.5287, 1),
  ('Palogrande',        5.0563, -75.4917, 1),
  ('Villamaría Centro', 5.0447, -75.5148, 2),
  ('La Dorada Centro',  5.4536, -74.6631, 3),
  ('Buenavista',        5.4420, -74.6700, 3);

INSERT INTO mediciones (estacion_id, fecha, temperatura, humedad, pm25, precipitacion, ph)
SELECT
  b.estacion_id,
  b.fecha,

  -- Temperatura: base del municipio + ciclo día/noche (pico a las 3 p. m.) + ruido
  ROUND((b.temp_base
         + 6 * SIN(2 * PI() * (EXTRACT(HOUR FROM b.fecha) - 9) / 24)
         + (RANDOM() * 4 - 2))::numeric, 1),

  -- Humedad entre 62 % y 98 % (algunas superan 95 %)
  ROUND((62 + RANDOM() * 36)::numeric, 1),

  -- PM2.5 normal entre 8 y 22, con picos ocasionales de contaminación
  ROUND((8 + RANDOM() * 14
         + CASE WHEN RANDOM() < 0.06 THEN 10 + RANDOM() * 20 ELSE 0 END)::numeric, 1),

  -- Precipitación: muchas veces 0; a veces lluvia y ocasionalmente tormenta fuerte
  ROUND((CASE WHEN RANDOM() < 0.55 THEN 0 ELSE RANDOM() * 30 END
         + CASE WHEN RANDOM() < 0.04 THEN 30 + RANDOM() * 40 ELSE 0 END)::numeric, 1),

  -- pH normal entre 6.4 y 8.4, con algunos valores ácidos o alcalinos
  ROUND((CASE
           WHEN RANDOM() < 0.03 THEN 5.2 + RANDOM() * 0.7
           WHEN RANDOM() < 0.03 THEN 9.1 + RANDOM() * 0.6
           ELSE 6.4 + RANDOM() * 2.0
         END)::numeric, 2)

FROM (
  SELECT
    e.id AS estacion_id,
    -- 100 mediciones cada 7 h 12 min = 30 días
    TIMESTAMP '2026-10-01 00:00' + n * INTERVAL '432 minutes' AS fecha,
    CASE WHEN m.nombre = 'La Dorada' THEN 29 ELSE 17 END AS temp_base
  FROM estaciones e
  JOIN municipios m ON m.id = e.municipio_id
  CROSS JOIN generate_series(0, 99) AS n
) b;