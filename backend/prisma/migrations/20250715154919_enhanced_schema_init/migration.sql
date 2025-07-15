-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tornId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "discordId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "companyId" TEXT,
    "companyRole" TEXT,
    CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tornId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "companyType" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "hasTCP" BOOLEAN NOT NULL DEFAULT false,
    "hasTGP" BOOLEAN NOT NULL DEFAULT false,
    "advertising" TEXT,
    "trainsAvailable" INTEGER,
    "companyBank" TEXT,
    "companyFunds" TEXT,
    "popularity" INTEGER,
    "efficiency" INTEGER,
    "environment" INTEGER,
    "value" TEXT,
    "dailyIncome" INTEGER,
    "dailyCustomers" INTEGER,
    "weeklyIncome" INTEGER,
    "weeklyCustomers" INTEGER,
    "employeesHired" INTEGER,
    "employeesCapacity" INTEGER,
    "daysOld" INTEGER,
    "rating" INTEGER,
    "companySize" INTEGER,
    "staffroomSize" TEXT,
    "storageSize" TEXT,
    "storageSpace" INTEGER,
    "advertisingBudget" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSynced" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "companies_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "employee_details" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "daysInCompany" INTEGER NOT NULL,
    "wage" INTEGER NOT NULL DEFAULT 0,
    "manualLabor" INTEGER NOT NULL DEFAULT 0,
    "intelligence" INTEGER NOT NULL DEFAULT 0,
    "endurance" INTEGER NOT NULL DEFAULT 0,
    "workingStats" INTEGER NOT NULL DEFAULT 0,
    "settledIn" INTEGER NOT NULL DEFAULT 0,
    "directorEducation" INTEGER NOT NULL DEFAULT 0,
    "merits" INTEGER NOT NULL DEFAULT 0,
    "addiction" INTEGER NOT NULL DEFAULT 0,
    "totalEffectiveness" INTEGER NOT NULL DEFAULT 0,
    "lastActionStatus" TEXT,
    "lastActionTimestamp" INTEGER,
    "lastActionRelative" TEXT,
    "statusDescription" TEXT,
    "statusDetails" TEXT,
    "statusState" TEXT,
    "statusColor" TEXT,
    "statusUntil" INTEGER,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "employee_details_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "training_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "trainedById" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "manualLaborGained" INTEGER NOT NULL DEFAULT 0,
    "intelligenceGained" INTEGER NOT NULL DEFAULT 0,
    "enduranceGained" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "training_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "training_logs_trainedById_fkey" FOREIGN KEY ("trainedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "company_news" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "newsText" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "newsType" TEXT NOT NULL,
    "employeeId" INTEGER,
    "employeeName" TEXT,
    "position" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "company_news_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "trainsPurchased" INTEGER NOT NULL,
    "purchaseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "purchasedBy" TEXT NOT NULL,
    CONSTRAINT "purchases_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "training_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "stat" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "targetLevel" INTEGER,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "paymentReceived" BOOLEAN NOT NULL DEFAULT false,
    "paymentAmount" REAL,
    "paymentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "training_requests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "training_requests_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "training" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentStat" TEXT NOT NULL,
    "trainsRemaining" INTEGER NOT NULL DEFAULT 0,
    "targetLevel" INTEGER,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "training_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trainingId" TEXT,
    "type" TEXT NOT NULL,
    "details" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "training_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "training_sessions_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "training" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "discordId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "source" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_tornId_key" ON "users"("tornId");

-- CreateIndex
CREATE UNIQUE INDEX "users_discordId_key" ON "users"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tornId_key" ON "companies"("tornId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_ownerId_key" ON "companies"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_details_userId_key" ON "employee_details"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "training_logs_eventId_key" ON "training_logs"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "company_news_newsId_key" ON "company_news"("newsId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_discordId_key" ON "admin_users"("discordId");
