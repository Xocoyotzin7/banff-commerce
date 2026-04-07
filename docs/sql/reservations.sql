/*
 * --------------------------------------------------------------------
 *  Xoco Café — Software Property
 *  Copyright (c) 2025 Xoco Café
 *  Principal Developer: Donovan Riaño
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at:
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  --------------------------------------------------------------------
 *  PROPIEDAD DEL SOFTWARE — XOCO CAFÉ.
 *  Copyright (c) 2025 Xoco Café.
 *  Desarrollador Principal: Donovan Riaño.
 *
 *  Este archivo está licenciado bajo la Apache License 2.0.
 *  Consulta el archivo LICENSE en la raíz del proyecto para más detalles.
 * --------------------------------------------------------------------
 */

-- reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "reservationCode" CHAR(3) NOT NULL UNIQUE,
  "reservationDate" DATE NOT NULL,
  "reservationTime" VARCHAR(5) NOT NULL,
  "branchId" VARCHAR(100) NOT NULL,
  "branchNumber" VARCHAR(8),
  "peopleCount" INT NOT NULL CHECK ("peopleCount" BETWEEN 1 AND 15),
  message TEXT,
  "preOrderItems" TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','cancelled','completed')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservation_slot
  ON reservations ("branchId", "reservationDate", "reservationTime")
  WHERE status NOT IN ('cancelled');

-- reservation_failures table
CREATE TABLE IF NOT EXISTS reservation_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "originalReservationId" UUID,
  "userId" UUID REFERENCES users(id),
  "reservationCode" CHAR(3),
  "reservationDate" DATE,
  "reservationTime" VARCHAR(5),
  "branchId" VARCHAR(100),
  "branchNumber" VARCHAR(8),
  "peopleCount" INT,
  message TEXT,
  "preOrderItems" TEXT,
  status VARCHAR(20),
  "archivedAt" TIMESTAMPTZ DEFAULT NOW(),
  "cleanupAt" TIMESTAMPTZ
);

