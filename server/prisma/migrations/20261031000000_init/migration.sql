-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "crea" TEXT,
    "profile" TEXT NOT NULL DEFAULT 'common',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "client" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserWork" (
    "userId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "workId"),
    CONSTRAINT "UserWork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserWork_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RDO" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" TEXT,
    "workId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "submittedAt" DATETIME,
    "returnReason" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RDO_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RDO_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeatherEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rdoId" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "practical" BOOLEAN NOT NULL DEFAULT true,
    "stoppageHours" REAL,
    "impact" TEXT,
    CONSTRAINT "WeatherEntry_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LaborEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rdoId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "hours" REAL NOT NULL,
    "isContractor" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "LaborEntry_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EquipmentEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rdoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isRented" BOOLEAN NOT NULL DEFAULT false,
    "activeHours" REAL NOT NULL,
    "idleHours" REAL NOT NULL,
    "idleJustification" TEXT,
    CONSTRAINT "EquipmentEntry_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rdoId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "progress" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "ActivityEntry_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rdoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" REAL,
    "unit" TEXT,
    "supplier" TEXT NOT NULL,
    "invoice" TEXT NOT NULL,
    CONSTRAINT "MaterialEntry_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OccurrenceEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rdoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "OccurrenceEntry_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RDOPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rdoId" TEXT,
    "workId" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "takenAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "accuracy" REAL,
    "address" TEXT,
    "watermarkText" TEXT NOT NULL,
    "hash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RDOPhoto_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RDOPhoto_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RDOComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rdoId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RDOComment_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RDOComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rdoId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "justification" TEXT,
    "section" TEXT,
    "field" TEXT,
    "previousValue" TEXT,
    "newValue" TEXT,
    CONSTRAINT "AuditLog_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SignatureMeta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rdoId" TEXT NOT NULL,
    "signedById" TEXT NOT NULL,
    "signedByName" TEXT NOT NULL,
    "signedAt" DATETIME NOT NULL,
    "ip" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SignatureMeta_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "RDO" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserWork_workId_idx" ON "UserWork"("workId");

-- CreateIndex
CREATE INDEX "RDO_status_idx" ON "RDO"("status");

-- CreateIndex
CREATE INDEX "RDO_workId_idx" ON "RDO"("workId");

-- CreateIndex
CREATE INDEX "RDO_authorId_idx" ON "RDO"("authorId");

-- CreateIndex
CREATE INDEX "RDO_date_idx" ON "RDO"("date");

-- CreateIndex
CREATE UNIQUE INDEX "RDO_workId_number_version_key" ON "RDO"("workId", "number", "version");

-- CreateIndex
CREATE INDEX "WeatherEntry_rdoId_idx" ON "WeatherEntry"("rdoId");

-- CreateIndex
CREATE INDEX "LaborEntry_rdoId_idx" ON "LaborEntry"("rdoId");

-- CreateIndex
CREATE INDEX "EquipmentEntry_rdoId_idx" ON "EquipmentEntry"("rdoId");

-- CreateIndex
CREATE INDEX "ActivityEntry_rdoId_idx" ON "ActivityEntry"("rdoId");

-- CreateIndex
CREATE INDEX "MaterialEntry_rdoId_idx" ON "MaterialEntry"("rdoId");

-- CreateIndex
CREATE INDEX "OccurrenceEntry_rdoId_idx" ON "OccurrenceEntry"("rdoId");

-- CreateIndex
CREATE INDEX "RDOPhoto_rdoId_idx" ON "RDOPhoto"("rdoId");

-- CreateIndex
CREATE INDEX "RDOPhoto_workId_idx" ON "RDOPhoto"("workId");

-- CreateIndex
CREATE INDEX "RDOPhoto_authorId_idx" ON "RDOPhoto"("authorId");

-- CreateIndex
CREATE INDEX "RDOComment_rdoId_idx" ON "RDOComment"("rdoId");

-- CreateIndex
CREATE INDEX "RDOComment_authorId_idx" ON "RDOComment"("authorId");

-- CreateIndex
CREATE INDEX "AuditLog_rdoId_idx" ON "AuditLog"("rdoId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "SignatureMeta_rdoId_key" ON "SignatureMeta"("rdoId");

-- CreateIndex
CREATE INDEX "SignatureMeta_rdoId_idx" ON "SignatureMeta"("rdoId");
