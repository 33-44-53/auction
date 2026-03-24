-- AlterTable: Add vehiclePlate to Group
ALTER TABLE "Group" ADD COLUMN "vehiclePlate" TEXT;

-- AlterTable: Remove vehiclePlate from Tender
CREATE TABLE "new_Tender" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "tenderNumber" TEXT NOT NULL,
    "date" DATETIME,
    "location" TEXT,
    "responsibleBody" TEXT,
    "exchangeRate" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Tender" ("id", "title", "tenderNumber", "date", "location", "responsibleBody", "exchangeRate", "status", "createdAt", "updatedAt")
SELECT "id", "title", "tenderNumber", "date", "location", "responsibleBody", "exchangeRate", "status", "createdAt", "updatedAt" FROM "Tender";

DROP TABLE "Tender";
ALTER TABLE "new_Tender" RENAME TO "Tender";
