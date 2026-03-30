-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tender" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "tenderNumber" TEXT NOT NULL,
    "tenderType" TEXT NOT NULL DEFAULT 'AUCTION',
    "originalTenderId" INTEGER,
    "harajRound" INTEGER NOT NULL DEFAULT 1,
    "date" TIMESTAMP(3),
    "location" TEXT,
    "responsibleBody" TEXT,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "tenderId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "vehiclePlate" TEXT,
    "parentGroupId" INTEGER,
    "originalGroupId" INTEGER,
    "basePrice" DOUBLE PRECISION,
    "harajPrice" DOUBLE PRECISION,
    "currentRound" TEXT NOT NULL DEFAULT 'TAX',
    "previousRound" TEXT,
    "roundNumber" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "winnerBidderId" INTEGER,
    "winnerPrice" DOUBLE PRECISION,
    "soldPrice" DOUBLE PRECISION,
    "yasbelaPenalty" DOUBLE PRECISION,
    "yasbelaReason" TEXT,
    "yasbelaDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
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
    "fob" DOUBLE PRECISION NOT NULL,
    "cif" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bidder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "tin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bidder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidderGroup" (
    "id" SERIAL NOT NULL,
    "bidderId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "BidderGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "bidderId" INTEGER NOT NULL,
    "bidPrice" DOUBLE PRECISION NOT NULL,
    "round" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL DEFAULT 1,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "tenderId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "details" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BidderGroup_bidderId_groupId_key" ON "BidderGroup"("bidderId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Bid_groupId_bidderId_round_key" ON "Bid"("groupId", "bidderId", "round");

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_originalTenderId_fkey" FOREIGN KEY ("originalTenderId") REFERENCES "Tender"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidderGroup" ADD CONSTRAINT "BidderGroup_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "Bidder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidderGroup" ADD CONSTRAINT "BidderGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "Bidder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
