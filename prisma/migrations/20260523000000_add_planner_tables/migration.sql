-- ─── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "EventType" AS ENUM ('WEDDING', 'BAPTISM', 'PARTY', 'CORPORATE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'BRIDE', 'GROOM', 'PLANNER', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "GuestSide" AS ENUM ('BRIDE', 'GROOM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "GuestRelation" AS ENUM ('BRIDE', 'GROOM', 'MAID_OF_HONOR', 'MATRON_OF_HONOR', 'BRIDESMAID', 'BEST_MAN', 'GROOMSMAN', 'PARENT', 'CLOSE_RELATIVE', 'RELATIVE', 'CLOSE_FRIEND', 'FRIEND', 'PARTNER', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "RsvpStatus" AS ENUM ('PENDING', 'ATTENDING', 'NOT_ATTENDING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "BudgetPaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "VenueType" AS ENUM ('CEREMONY', 'RECEPTION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "VendorCategory" AS ENUM ('VENUE', 'PHOTOGRAPHY', 'VIDEOGRAPHY', 'CATERING', 'MUSIC_DJ', 'FLOWERS', 'DRESS_ATTIRE', 'RINGS', 'DECORATIONS', 'TRANSPORTATION', 'HAIR_MAKEUP', 'WEDDING_PLANNER', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "RsvpQuestionType" AS ENUM ('SHORT_TEXT', 'LONG_TEXT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "VendorPlanTier" AS ENUM ('TRIAL', 'BUSINESS', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'TENTATIVE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'VIEWED', 'RESPONDED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "VendorConvStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'SPAM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "MessageSenderRole" AS ENUM ('VENDOR', 'GUEST');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SearchOptionType" AS ENUM ('PLACE', 'SERVICE', 'LOCATION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── WeddingProject ───────────────────────────────────────────────────────────
-- Table may already exist with fewer columns — create base then add missing cols

CREATE TABLE IF NOT EXISTS "WeddingProject" (
    "id"        TEXT            NOT NULL,
    "title"     TEXT            NOT NULL DEFAULT 'Untitled',
    "eventType" "EventType"     NOT NULL DEFAULT 'WEDDING',
    "eventDate" TIMESTAMP(3),
    "status"    "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId"    TEXT            NOT NULL,
    "createdAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingProject_pkey" PRIMARY KEY ("id")
);

-- Add columns that may be missing from older table version
ALTER TABLE "WeddingProject" ADD COLUMN IF NOT EXISTS "coverImage"    TEXT;
ALTER TABLE "WeddingProject" ADD COLUMN IF NOT EXISTS "settings"      JSONB;
ALTER TABLE "WeddingProject" ADD COLUMN IF NOT EXISTS "brideName"     TEXT;
ALTER TABLE "WeddingProject" ADD COLUMN IF NOT EXISTS "groomName"     TEXT;
ALTER TABLE "WeddingProject" ADD COLUMN IF NOT EXISTS "budgetGoal"    DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "WeddingProject" ADD COLUMN IF NOT EXISTS "sourceLocalId" TEXT;
ALTER TABLE "WeddingProject" ADD COLUMN IF NOT EXISTS "shareToken"    TEXT;
ALTER TABLE "WeddingProject" ADD COLUMN IF NOT EXISTS "shareEnabled"  BOOLEAN NOT NULL DEFAULT false;

-- Indexes (IF NOT EXISTS — safe to re-run)
CREATE UNIQUE INDEX IF NOT EXISTS "WeddingProject_shareToken_key"           ON "WeddingProject"("shareToken");
CREATE UNIQUE INDEX IF NOT EXISTS "WeddingProject_userId_sourceLocalId_key" ON "WeddingProject"("userId", "sourceLocalId");
CREATE INDEX        IF NOT EXISTS "WeddingProject_userId_idx"               ON "WeddingProject"("userId");
CREATE INDEX        IF NOT EXISTS "WeddingProject_status_idx"               ON "WeddingProject"("status");

ALTER TABLE "WeddingProject"
    DROP CONSTRAINT IF EXISTS "WeddingProject_userId_fkey";
ALTER TABLE "WeddingProject"
    ADD CONSTRAINT "WeddingProject_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── ProjectMember ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "ProjectMember" (
    "id"          TEXT         NOT NULL,
    "projectId"   TEXT         NOT NULL,
    "userId"      TEXT         NOT NULL,
    "role"        "MemberRole" NOT NULL,
    "displayName" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");
CREATE INDEX        IF NOT EXISTS "ProjectMember_projectId_idx"        ON "ProjectMember"("projectId");
CREATE INDEX        IF NOT EXISTS "ProjectMember_userId_idx"           ON "ProjectMember"("userId");

ALTER TABLE "ProjectMember"
    DROP CONSTRAINT IF EXISTS "ProjectMember_projectId_fkey";
ALTER TABLE "ProjectMember"
    ADD CONSTRAINT "ProjectMember_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectMember"
    DROP CONSTRAINT IF EXISTS "ProjectMember_userId_fkey";
ALTER TABLE "ProjectMember"
    ADD CONSTRAINT "ProjectMember_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── GuestFamily ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "GuestFamily" (
    "id"        TEXT         NOT NULL,
    "projectId" TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestFamily_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GuestFamily_projectId_idx" ON "GuestFamily"("projectId");

ALTER TABLE "GuestFamily"
    DROP CONSTRAINT IF EXISTS "GuestFamily_projectId_fkey";
ALTER TABLE "GuestFamily"
    ADD CONSTRAINT "GuestFamily_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── RsvpQuestion ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "RsvpQuestion" (
    "id"        TEXT               NOT NULL,
    "projectId" TEXT               NOT NULL,
    "text"      TEXT               NOT NULL,
    "type"      "RsvpQuestionType" NOT NULL DEFAULT 'SHORT_TEXT',
    "options"   JSONB,
    "required"  BOOLEAN            NOT NULL DEFAULT false,
    "order"     INTEGER            NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RsvpQuestion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RsvpQuestion_projectId_idx" ON "RsvpQuestion"("projectId");

ALTER TABLE "RsvpQuestion"
    DROP CONSTRAINT IF EXISTS "RsvpQuestion_projectId_fkey";
ALTER TABLE "RsvpQuestion"
    ADD CONSTRAINT "RsvpQuestion_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── WeddingGuest ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "WeddingGuest" (
    "id"               TEXT            NOT NULL,
    "projectId"        TEXT            NOT NULL,
    "firstName"        TEXT            NOT NULL,
    "lastName"         TEXT,
    "title"            TEXT,
    "side"             "GuestSide"     NOT NULL DEFAULT 'BRIDE',
    "relation"         "GuestRelation" NOT NULL DEFAULT 'OTHER',
    "email"            TEXT,
    "phone"            TEXT,
    "dietary"          TEXT,
    "rsvpStatus"       "RsvpStatus"    NOT NULL DEFAULT 'PENDING',
    "tableNumber"      INTEGER,
    "notes"            TEXT,
    "rsvpToken"        TEXT,
    "rsvpMessage"      TEXT,
    "rsvpSubmittedAt"  TIMESTAMP(3),
    "hasPlusOne"       BOOLEAN         NOT NULL DEFAULT false,
    "plusOneName"      TEXT,
    "plusOneMeal"      TEXT,
    "isChiefGuest"     BOOLEAN         NOT NULL DEFAULT false,
    "familyId"         TEXT,
    "invitationCode"   TEXT,
    "invitationSent"   BOOLEAN         NOT NULL DEFAULT false,
    "invitationSentAt" TIMESTAMP(3),
    "gdprConsentAt"    TIMESTAMP(3),
    "selfRegistered"   BOOLEAN         NOT NULL DEFAULT false,
    "createdAt"        TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingGuest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WeddingGuest_rsvpToken_key"          ON "WeddingGuest"("rsvpToken");
CREATE UNIQUE INDEX IF NOT EXISTS "WeddingGuest_invitationCode_key"     ON "WeddingGuest"("invitationCode");
CREATE UNIQUE INDEX IF NOT EXISTS "WeddingGuest_projectId_email_key"    ON "WeddingGuest"("projectId", "email");
CREATE INDEX        IF NOT EXISTS "WeddingGuest_projectId_side_idx"     ON "WeddingGuest"("projectId", "side");
CREATE INDEX        IF NOT EXISTS "WeddingGuest_projectId_rsvpStatus_idx" ON "WeddingGuest"("projectId", "rsvpStatus");
CREATE INDEX        IF NOT EXISTS "WeddingGuest_projectId_familyId_idx" ON "WeddingGuest"("projectId", "familyId");
CREATE INDEX        IF NOT EXISTS "WeddingGuest_projectId_isChiefGuest_idx" ON "WeddingGuest"("projectId", "isChiefGuest");

ALTER TABLE "WeddingGuest"
    DROP CONSTRAINT IF EXISTS "WeddingGuest_projectId_fkey";
ALTER TABLE "WeddingGuest"
    ADD CONSTRAINT "WeddingGuest_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WeddingGuest"
    DROP CONSTRAINT IF EXISTS "WeddingGuest_familyId_fkey";
ALTER TABLE "WeddingGuest"
    ADD CONSTRAINT "WeddingGuest_familyId_fkey"
    FOREIGN KEY ("familyId") REFERENCES "GuestFamily"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── RsvpAnswer ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "RsvpAnswer" (
    "id"         TEXT         NOT NULL,
    "guestId"    TEXT         NOT NULL,
    "questionId" TEXT         NOT NULL,
    "answer"     TEXT         NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RsvpAnswer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RsvpAnswer_guestId_questionId_key" ON "RsvpAnswer"("guestId", "questionId");
CREATE INDEX        IF NOT EXISTS "RsvpAnswer_questionId_idx"         ON "RsvpAnswer"("questionId");

ALTER TABLE "RsvpAnswer"
    DROP CONSTRAINT IF EXISTS "RsvpAnswer_guestId_fkey";
ALTER TABLE "RsvpAnswer"
    ADD CONSTRAINT "RsvpAnswer_guestId_fkey"
    FOREIGN KEY ("guestId") REFERENCES "WeddingGuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RsvpAnswer"
    DROP CONSTRAINT IF EXISTS "RsvpAnswer_questionId_fkey";
ALTER TABLE "RsvpAnswer"
    ADD CONSTRAINT "RsvpAnswer_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "RsvpQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── BudgetCategory ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "BudgetCategory" (
    "id"        TEXT             NOT NULL,
    "projectId" TEXT             NOT NULL,
    "name"      TEXT             NOT NULL,
    "planned"   DOUBLE PRECISION NOT NULL DEFAULT 0,
    "color"     TEXT             NOT NULL DEFAULT '#6366f1',
    "order"     INTEGER          NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BudgetCategory_projectId_idx" ON "BudgetCategory"("projectId");

ALTER TABLE "BudgetCategory"
    DROP CONSTRAINT IF EXISTS "BudgetCategory_projectId_fkey";
ALTER TABLE "BudgetCategory"
    ADD CONSTRAINT "BudgetCategory_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── BudgetItem ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "BudgetItem" (
    "id"          TEXT                  NOT NULL,
    "categoryId"  TEXT                  NOT NULL,
    "projectId"   TEXT                  NOT NULL,
    "description" TEXT                  NOT NULL,
    "planned"     DOUBLE PRECISION      NOT NULL DEFAULT 0,
    "actual"      DOUBLE PRECISION      NOT NULL DEFAULT 0,
    "paid"        DOUBLE PRECISION      NOT NULL DEFAULT 0,
    "status"      "BudgetPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "notes"       TEXT,
    "order"       INTEGER               NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BudgetItem_categoryId_idx" ON "BudgetItem"("categoryId");
CREATE INDEX IF NOT EXISTS "BudgetItem_projectId_idx"  ON "BudgetItem"("projectId");

ALTER TABLE "BudgetItem"
    DROP CONSTRAINT IF EXISTS "BudgetItem_categoryId_fkey";
ALTER TABLE "BudgetItem"
    ADD CONSTRAINT "BudgetItem_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "BudgetCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BudgetItem"
    DROP CONSTRAINT IF EXISTS "BudgetItem_projectId_fkey";
ALTER TABLE "BudgetItem"
    ADD CONSTRAINT "BudgetItem_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── ChecklistTask ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "ChecklistTask" (
    "id"          TEXT         NOT NULL,
    "projectId"   TEXT         NOT NULL,
    "title"       TEXT         NOT NULL,
    "description" TEXT,
    "subtasks"    JSONB        NOT NULL DEFAULT '[]',
    "dueMonths"   INTEGER,
    "category"    TEXT,
    "completed"   BOOLEAN      NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "isDefault"   BOOLEAN      NOT NULL DEFAULT false,
    "order"       INTEGER      NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChecklistTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ChecklistTask_projectId_completed_idx" ON "ChecklistTask"("projectId", "completed");

ALTER TABLE "ChecklistTask"
    DROP CONSTRAINT IF EXISTS "ChecklistTask_projectId_fkey";
ALTER TABLE "ChecklistTask"
    ADD CONSTRAINT "ChecklistTask_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── ItineraryEvent ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "ItineraryEvent" (
    "id"          TEXT         NOT NULL,
    "projectId"   TEXT         NOT NULL,
    "title"       TEXT         NOT NULL,
    "description" TEXT,
    "startTime"   TEXT         NOT NULL,
    "endTime"     TEXT,
    "location"    TEXT,
    "category"    TEXT,
    "order"       INTEGER      NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItineraryEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ItineraryEvent_projectId_idx" ON "ItineraryEvent"("projectId");

ALTER TABLE "ItineraryEvent"
    DROP CONSTRAINT IF EXISTS "ItineraryEvent_projectId_fkey";
ALTER TABLE "ItineraryEvent"
    ADD CONSTRAINT "ItineraryEvent_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── ProjectNote ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "ProjectNote" (
    "id"        TEXT         NOT NULL,
    "projectId" TEXT         NOT NULL,
    "title"     TEXT         NOT NULL DEFAULT 'Untitled',
    "content"   TEXT         NOT NULL DEFAULT '',
    "order"     INTEGER      NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProjectNote_projectId_idx" ON "ProjectNote"("projectId");

ALTER TABLE "ProjectNote"
    DROP CONSTRAINT IF EXISTS "ProjectNote_projectId_fkey";
ALTER TABLE "ProjectNote"
    ADD CONSTRAINT "ProjectNote_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── EventVenue ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "EventVenue" (
    "id"          TEXT         NOT NULL,
    "projectId"   TEXT         NOT NULL,
    "type"        "VenueType"  NOT NULL,
    "venueName"   TEXT,
    "address"     TEXT,
    "city"        TEXT,
    "country"     TEXT,
    "date"        TIMESTAMP(3),
    "time"        TEXT,
    "capacity"    INTEGER,
    "description" TEXT,
    "notes"       TEXT,
    "layoutNotes" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventVenue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EventVenue_projectId_type_key" ON "EventVenue"("projectId", "type");
CREATE INDEX        IF NOT EXISTS "EventVenue_projectId_idx"      ON "EventVenue"("projectId");

ALTER TABLE "EventVenue"
    DROP CONSTRAINT IF EXISTS "EventVenue_projectId_fkey";
ALTER TABLE "EventVenue"
    ADD CONSTRAINT "EventVenue_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── WeddingVendor ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "WeddingVendor" (
    "id"        TEXT             NOT NULL,
    "projectId" TEXT             NOT NULL,
    "name"      TEXT             NOT NULL,
    "category"  "VendorCategory" NOT NULL,
    "email"     TEXT,
    "phone"     TEXT,
    "website"   TEXT,
    "notes"     TEXT,
    "createdAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingVendor_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WeddingVendor_projectId_idx"          ON "WeddingVendor"("projectId");
CREATE INDEX IF NOT EXISTS "WeddingVendor_projectId_category_idx" ON "WeddingVendor"("projectId", "category");

ALTER TABLE "WeddingVendor"
    DROP CONSTRAINT IF EXISTS "WeddingVendor_projectId_fkey";
ALTER TABLE "WeddingVendor"
    ADD CONSTRAINT "WeddingVendor_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── SeatingLayout ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "SeatingLayout" (
    "id"        TEXT         NOT NULL,
    "projectId" TEXT         NOT NULL,
    "name"      TEXT         NOT NULL DEFAULT 'Layout',
    "type"      TEXT         NOT NULL DEFAULT 'RECEPTION',
    "width"     INTEGER      NOT NULL DEFAULT 1200,
    "height"    INTEGER      NOT NULL DEFAULT 800,
    "bgColor"   TEXT         NOT NULL DEFAULT '#f5f5f0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeatingLayout_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SeatingLayout_projectId_idx" ON "SeatingLayout"("projectId");

ALTER TABLE "SeatingLayout"
    DROP CONSTRAINT IF EXISTS "SeatingLayout_projectId_fkey";
ALTER TABLE "SeatingLayout"
    ADD CONSTRAINT "SeatingLayout_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── SeatingTable ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "SeatingTable" (
    "id"        TEXT             NOT NULL,
    "layoutId"  TEXT             NOT NULL,
    "projectId" TEXT             NOT NULL,
    "name"      TEXT             NOT NULL DEFAULT 'Table',
    "type"      TEXT             NOT NULL DEFAULT 'ROUND',
    "x"         DOUBLE PRECISION NOT NULL DEFAULT 100,
    "y"         DOUBLE PRECISION NOT NULL DEFAULT 100,
    "seats"     INTEGER          NOT NULL DEFAULT 8,
    "rotation"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "color"     TEXT             NOT NULL DEFAULT '#ffffff',
    "guestIds"  JSONB            NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeatingTable_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SeatingTable_layoutId_idx"  ON "SeatingTable"("layoutId");
CREATE INDEX IF NOT EXISTS "SeatingTable_projectId_idx" ON "SeatingTable"("projectId");

ALTER TABLE "SeatingTable"
    DROP CONSTRAINT IF EXISTS "SeatingTable_layoutId_fkey";
ALTER TABLE "SeatingTable"
    ADD CONSTRAINT "SeatingTable_layoutId_fkey"
    FOREIGN KEY ("layoutId") REFERENCES "SeatingLayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SeatingTable"
    DROP CONSTRAINT IF EXISTS "SeatingTable_projectId_fkey";
ALTER TABLE "SeatingTable"
    ADD CONSTRAINT "SeatingTable_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── WeddingWebsite ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "WeddingWebsite" (
    "id"           TEXT         NOT NULL,
    "projectId"    TEXT         NOT NULL,
    "slug"         TEXT         NOT NULL,
    "published"    BOOLEAN      NOT NULL DEFAULT false,
    "theme"        TEXT         NOT NULL DEFAULT 'modern',
    "primaryColor" TEXT         NOT NULL DEFAULT '#be185d',
    "accentColor"  TEXT         NOT NULL DEFAULT '#f9a8d4',
    "fontFamily"   TEXT         NOT NULL DEFAULT 'Inter',
    "blocks"       JSONB        NOT NULL DEFAULT '[]',
    "customDomain" TEXT,
    "password"     TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeddingWebsite_pkey" PRIMARY KEY ("id")
);

-- Add columns that may be missing from the earlier WeddingWebsite migration
ALTER TABLE "WeddingWebsite" ADD COLUMN IF NOT EXISTS "accentColor"  TEXT NOT NULL DEFAULT '#f9a8d4';
ALTER TABLE "WeddingWebsite" ADD COLUMN IF NOT EXISTS "fontFamily"   TEXT NOT NULL DEFAULT 'Inter';
ALTER TABLE "WeddingWebsite" ADD COLUMN IF NOT EXISTS "customDomain" TEXT;
ALTER TABLE "WeddingWebsite" ADD COLUMN IF NOT EXISTS "password"     TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "WeddingWebsite_projectId_key" ON "WeddingWebsite"("projectId");
CREATE UNIQUE INDEX IF NOT EXISTS "WeddingWebsite_slug_key"       ON "WeddingWebsite"("slug");
CREATE INDEX        IF NOT EXISTS "WeddingWebsite_projectId_idx"  ON "WeddingWebsite"("projectId");
CREATE INDEX        IF NOT EXISTS "WeddingWebsite_slug_idx"       ON "WeddingWebsite"("slug");

ALTER TABLE "WeddingWebsite"
    DROP CONSTRAINT IF EXISTS "WeddingWebsite_projectId_fkey";
ALTER TABLE "WeddingWebsite"
    ADD CONSTRAINT "WeddingWebsite_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── GuestbookEntry ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "GuestbookEntry" (
    "id"         TEXT         NOT NULL,
    "websiteId"  TEXT         NOT NULL,
    "authorName" TEXT         NOT NULL,
    "message"    TEXT         NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestbookEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GuestbookEntry_websiteId_idx"           ON "GuestbookEntry"("websiteId");
CREATE INDEX IF NOT EXISTS "GuestbookEntry_websiteId_createdAt_idx" ON "GuestbookEntry"("websiteId", "createdAt" DESC);

ALTER TABLE "GuestbookEntry"
    DROP CONSTRAINT IF EXISTS "GuestbookEntry_websiteId_fkey";
ALTER TABLE "GuestbookEntry"
    ADD CONSTRAINT "GuestbookEntry_websiteId_fkey"
    FOREIGN KEY ("websiteId") REFERENCES "WeddingWebsite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── GuestPhoto ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "GuestPhoto" (
    "id"           TEXT         NOT NULL,
    "websiteId"    TEXT         NOT NULL,
    "uploaderName" TEXT,
    "caption"      TEXT,
    "photoData"    TEXT         NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestPhoto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GuestPhoto_websiteId_idx"           ON "GuestPhoto"("websiteId");
CREATE INDEX IF NOT EXISTS "GuestPhoto_websiteId_createdAt_idx" ON "GuestPhoto"("websiteId", "createdAt" DESC);

ALTER TABLE "GuestPhoto"
    DROP CONSTRAINT IF EXISTS "GuestPhoto_websiteId_fkey";
ALTER TABLE "GuestPhoto"
    ADD CONSTRAINT "GuestPhoto_websiteId_fkey"
    FOREIGN KEY ("websiteId") REFERENCES "WeddingWebsite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── EventBriefToken ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "EventBriefToken" (
    "id"        TEXT         NOT NULL,
    "projectId" TEXT         NOT NULL,
    "token"     TEXT         NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventBriefToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EventBriefToken_token_key"      ON "EventBriefToken"("token");
CREATE INDEX        IF NOT EXISTS "EventBriefToken_projectId_idx"  ON "EventBriefToken"("projectId");

ALTER TABLE "EventBriefToken"
    DROP CONSTRAINT IF EXISTS "EventBriefToken_projectId_fkey";
ALTER TABLE "EventBriefToken"
    ADD CONSTRAINT "EventBriefToken_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── VendorProfile ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "VendorProfile" (
    "id"                   TEXT             NOT NULL,
    "slug"                 TEXT             NOT NULL,
    "userId"               TEXT,
    "status"               "VendorStatus"   NOT NULL DEFAULT 'PENDING',
    "businessName"         TEXT             NOT NULL,
    "category"             "VendorCategory" NOT NULL,
    "description"          TEXT,
    "tagline"              TEXT,
    "email"                TEXT,
    "phone"                TEXT,
    "website"              TEXT,
    "city"                 TEXT,
    "country"              TEXT             NOT NULL DEFAULT 'SE',
    "lat"                  DOUBLE PRECISION,
    "lng"                  DOUBLE PRECISION,
    "serviceRadiusKm"      INTEGER,
    "photos"               TEXT[]           NOT NULL DEFAULT ARRAY[]::TEXT[],
    "videoUrls"            TEXT[]           NOT NULL DEFAULT ARRAY[]::TEXT[],
    "startingPrice"        INTEGER,
    "maxPrice"             INTEGER,
    "currency"             TEXT             NOT NULL DEFAULT 'SEK',
    "yearsInBusiness"      INTEGER,
    "languages"            TEXT[]           NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isApproved"           BOOLEAN          NOT NULL DEFAULT false,
    "isActive"             BOOLEAN          NOT NULL DEFAULT true,
    "isFeatured"           BOOLEAN          NOT NULL DEFAULT false,
    "isVerified"           BOOLEAN          NOT NULL DEFAULT false,
    "trialEndsAt"          TIMESTAMP(3),
    "planTier"             "VendorPlanTier" NOT NULL DEFAULT 'TRIAL',
    "stripeCustomerId"     TEXT,
    "stripeSubscriptionId" TEXT,
    "instagram"            TEXT,
    "facebook"             TEXT,
    "pinterest"            TEXT,
    "slaHours"             INTEGER,
    "faqItems"             JSONB            DEFAULT '[]',
    "createdAt"            TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"            TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VendorProfile_slug_key"               ON "VendorProfile"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "VendorProfile_userId_key"             ON "VendorProfile"("userId");
CREATE INDEX        IF NOT EXISTS "VendorProfile_category_idx"           ON "VendorProfile"("category");
CREATE INDEX        IF NOT EXISTS "VendorProfile_isApproved_isActive_idx" ON "VendorProfile"("isApproved", "isActive");
CREATE INDEX        IF NOT EXISTS "VendorProfile_city_idx"               ON "VendorProfile"("city");
CREATE INDEX        IF NOT EXISTS "VendorProfile_isFeatured_idx"         ON "VendorProfile"("isFeatured");
CREATE INDEX        IF NOT EXISTS "VendorProfile_isVerified_idx"         ON "VendorProfile"("isVerified");
CREATE INDEX        IF NOT EXISTS "VendorProfile_userId_idx"             ON "VendorProfile"("userId");
CREATE INDEX        IF NOT EXISTS "VendorProfile_status_idx"             ON "VendorProfile"("status");

ALTER TABLE "VendorProfile"
    DROP CONSTRAINT IF EXISTS "VendorProfile_userId_fkey";
ALTER TABLE "VendorProfile"
    ADD CONSTRAINT "VendorProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── SavedVendor ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "SavedVendor" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "vendorId"  TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedVendor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SavedVendor_userId_vendorId_key" ON "SavedVendor"("userId", "vendorId");
CREATE INDEX        IF NOT EXISTS "SavedVendor_userId_idx"          ON "SavedVendor"("userId");
CREATE INDEX        IF NOT EXISTS "SavedVendor_vendorId_idx"        ON "SavedVendor"("vendorId");

ALTER TABLE "SavedVendor"
    DROP CONSTRAINT IF EXISTS "SavedVendor_userId_fkey";
ALTER TABLE "SavedVendor"
    ADD CONSTRAINT "SavedVendor_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SavedVendor"
    DROP CONSTRAINT IF EXISTS "SavedVendor_vendorId_fkey";
ALTER TABLE "SavedVendor"
    ADD CONSTRAINT "SavedVendor_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── VendorAvailability ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "VendorAvailability" (
    "id"        TEXT                 NOT NULL,
    "vendorId"  TEXT                 NOT NULL,
    "date"      DATE                 NOT NULL,
    "status"    "AvailabilityStatus" NOT NULL DEFAULT 'BOOKED',
    "note"      TEXT,
    "createdAt" TIMESTAMP(3)         NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorAvailability_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VendorAvailability_vendorId_date_key" ON "VendorAvailability"("vendorId", "date");
CREATE INDEX        IF NOT EXISTS "VendorAvailability_vendorId_idx"      ON "VendorAvailability"("vendorId");

ALTER TABLE "VendorAvailability"
    DROP CONSTRAINT IF EXISTS "VendorAvailability_vendorId_fkey";
ALTER TABLE "VendorAvailability"
    ADD CONSTRAINT "VendorAvailability_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── VendorInquiry ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "VendorInquiry" (
    "id"        TEXT            NOT NULL,
    "vendorId"  TEXT            NOT NULL,
    "name"      TEXT            NOT NULL,
    "email"     TEXT            NOT NULL,
    "phone"     TEXT,
    "eventType" TEXT            NOT NULL,
    "eventDate" TIMESTAMP(3),
    "message"   TEXT            NOT NULL,
    "budget"    TEXT,
    "status"    "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorInquiry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VendorInquiry_vendorId_idx"        ON "VendorInquiry"("vendorId");
CREATE INDEX IF NOT EXISTS "VendorInquiry_vendorId_status_idx" ON "VendorInquiry"("vendorId", "status");

ALTER TABLE "VendorInquiry"
    DROP CONSTRAINT IF EXISTS "VendorInquiry_vendorId_fkey";
ALTER TABLE "VendorInquiry"
    ADD CONSTRAINT "VendorInquiry_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── VendorReview ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "VendorReview" (
    "id"         TEXT         NOT NULL,
    "vendorId"   TEXT         NOT NULL,
    "authorName" TEXT         NOT NULL,
    "rating"     INTEGER      NOT NULL,
    "comment"    TEXT,
    "reply"      TEXT,
    "isApproved" BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VendorReview_vendorId_idx"            ON "VendorReview"("vendorId");
CREATE INDEX IF NOT EXISTS "VendorReview_vendorId_isApproved_idx" ON "VendorReview"("vendorId", "isApproved");

ALTER TABLE "VendorReview"
    DROP CONSTRAINT IF EXISTS "VendorReview_vendorId_fkey";
ALTER TABLE "VendorReview"
    ADD CONSTRAINT "VendorReview_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── VendorConversation ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "VendorConversation" (
    "id"            TEXT               NOT NULL,
    "vendorId"      TEXT               NOT NULL,
    "inquiryId"     TEXT,
    "guestName"     TEXT               NOT NULL,
    "guestEmail"    TEXT               NOT NULL,
    "projectId"     TEXT,
    "coupleUserId"  TEXT,
    "status"        "VendorConvStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastMessageAt" TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"     TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorConversation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VendorConversation_inquiryId_key"               ON "VendorConversation"("inquiryId");
CREATE INDEX        IF NOT EXISTS "VendorConversation_vendorId_lastMessageAt_idx"  ON "VendorConversation"("vendorId", "lastMessageAt" DESC);
CREATE INDEX        IF NOT EXISTS "VendorConversation_vendorId_status_idx"         ON "VendorConversation"("vendorId", "status");
CREATE INDEX        IF NOT EXISTS "VendorConversation_projectId_idx"               ON "VendorConversation"("projectId");
CREATE INDEX        IF NOT EXISTS "VendorConversation_coupleUserId_idx"            ON "VendorConversation"("coupleUserId");

ALTER TABLE "VendorConversation"
    DROP CONSTRAINT IF EXISTS "VendorConversation_vendorId_fkey";
ALTER TABLE "VendorConversation"
    ADD CONSTRAINT "VendorConversation_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VendorConversation"
    DROP CONSTRAINT IF EXISTS "VendorConversation_inquiryId_fkey";
ALTER TABLE "VendorConversation"
    ADD CONSTRAINT "VendorConversation_inquiryId_fkey"
    FOREIGN KEY ("inquiryId") REFERENCES "VendorInquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VendorConversation"
    DROP CONSTRAINT IF EXISTS "VendorConversation_projectId_fkey";
ALTER TABLE "VendorConversation"
    ADD CONSTRAINT "VendorConversation_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VendorConversation"
    DROP CONSTRAINT IF EXISTS "VendorConversation_coupleUserId_fkey";
ALTER TABLE "VendorConversation"
    ADD CONSTRAINT "VendorConversation_coupleUserId_fkey"
    FOREIGN KEY ("coupleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── VendorMessage ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "VendorMessage" (
    "id"             TEXT                NOT NULL,
    "conversationId" TEXT                NOT NULL,
    "senderRole"     "MessageSenderRole" NOT NULL,
    "content"        TEXT                NOT NULL,
    "isRead"         BOOLEAN             NOT NULL DEFAULT false,
    "createdAt"      TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VendorMessage_conversationId_createdAt_idx" ON "VendorMessage"("conversationId", "createdAt" DESC);

ALTER TABLE "VendorMessage"
    DROP CONSTRAINT IF EXISTS "VendorMessage_conversationId_fkey";
ALTER TABLE "VendorMessage"
    ADD CONSTRAINT "VendorMessage_conversationId_fkey"
    FOREIGN KEY ("conversationId") REFERENCES "VendorConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── VendorQuickReply ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "VendorQuickReply" (
    "id"        TEXT         NOT NULL,
    "vendorId"  TEXT         NOT NULL,
    "title"     TEXT         NOT NULL,
    "content"   TEXT         NOT NULL,
    "sortOrder" INTEGER      NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorQuickReply_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VendorQuickReply_vendorId_idx" ON "VendorQuickReply"("vendorId");

ALTER TABLE "VendorQuickReply"
    DROP CONSTRAINT IF EXISTS "VendorQuickReply_vendorId_fkey";
ALTER TABLE "VendorQuickReply"
    ADD CONSTRAINT "VendorQuickReply_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── VendorCity ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "VendorCity" (
    "id"        TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "country"   TEXT         NOT NULL DEFAULT 'SE',
    "sortOrder" INTEGER      NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorCity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VendorCity_name_key"    ON "VendorCity"("name");
CREATE INDEX        IF NOT EXISTS "VendorCity_country_idx" ON "VendorCity"("country");

-- ─── SearchOption ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "SearchOption" (
    "id"        TEXT               NOT NULL,
    "name"      TEXT               NOT NULL,
    "type"      "SearchOptionType" NOT NULL DEFAULT 'PLACE',
    "icon"      TEXT,
    "group"     TEXT,
    "isActive"  BOOLEAN            NOT NULL DEFAULT true,
    "sortOrder" INTEGER            NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchOption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SearchOption_name_type_key"      ON "SearchOption"("name", "type");
CREATE INDEX        IF NOT EXISTS "SearchOption_type_isActive_idx"  ON "SearchOption"("type", "isActive");
