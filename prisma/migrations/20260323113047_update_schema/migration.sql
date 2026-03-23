/*
  Warnings:

  - You are about to drop the column `quantity` on the `Item` table. All the data in the column will be lost.
  - Added the required column `totalQuantity` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tender" ADD COLUMN "responsibleBody" TEXT;
ALTER TABLE "Tender" ADD COLUMN "vehiclePlate" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" INTEGER NOT NULL,
    "bidderId" INTEGER NOT NULL,
    "bidPrice" REAL NOT NULL,
    "round" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL DEFAULT 1,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bid_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "Bidder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bid" ("bidPrice", "bidderId", "createdAt", "groupId", "id", "isWinner", "round") SELECT "bidPrice", "bidderId", "createdAt", "groupId", "id", "isWinner", "round" FROM "Bid";
DROP TABLE "Bid";
ALTER TABLE "new_Bid" RENAME TO "Bid";
CREATE UNIQUE INDEX "Bid_groupId_bidderId_round_key" ON "Bid"("groupId", "bidderId", "round");
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenderId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "parentGroupId" INTEGER,
    "basePrice" REAL,
    "currentRound" TEXT NOT NULL DEFAULT 'CIF',
    "roundNumber" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "winnerBidderId" INTEGER,
    "winnerPrice" REAL,
    "soldPrice" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Group_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Group_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Group" ("basePrice", "code", "createdAt", "currentRound", "id", "name", "parentGroupId", "status", "tenderId", "updatedAt") SELECT "basePrice", "code", "createdAt", "currentRound", "id", "name", "parentGroupId", "status", "tenderId", "updatedAt" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" INTEGER NOT NULL,
    "itemCode" TEXT NOT NULL,
    "serialNumber" TEXT,
    "name" TEXT NOT NULL,
    "itemType" TEXT,
    "brand" TEXT,
    "country" TEXT,
    "unit" TEXT NOT NULL,
    "warehouse1" INTEGER NOT NULL DEFAULT 0,
    "warehouse2" INTEGER NOT NULL DEFAULT 0,
    "warehouse3" INTEGER NOT NULL DEFAULT 0,
    "totalQuantity" INTEGER NOT NULL,
    "fob" REAL NOT NULL,
    "cif" REAL NOT NULL,
    "tax" REAL NOT NULL,
    "unitPrice" REAL,
    "totalPrice" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Item_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("brand", "cif", "country", "createdAt", "fob", "groupId", "id", "itemCode", "name", "tax", "totalPrice", "unit", "unitPrice", "updatedAt") SELECT "brand", "cif", "country", "createdAt", "fob", "groupId", "id", "itemCode", "name", "tax", "totalPrice", "unit", "unitPrice", "updatedAt" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
