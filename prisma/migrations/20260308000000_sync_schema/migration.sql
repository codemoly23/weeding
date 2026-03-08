-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('STATE', 'PROVINCE', 'COUNTRY', 'TERRITORY');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('FILING', 'ANNUAL', 'EXPEDITED', 'FRANCHISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'UNQUALIFIED');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'REFERRAL', 'GOOGLE_ADS', 'FACEBOOK_ADS', 'SOCIAL_MEDIA', 'DIRECT', 'COLD_OUTREACH', 'NEWSLETTER', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "FooterLayout_new" AS ENUM ('MULTI_COLUMN', 'CENTERED', 'MINIMAL', 'MEGA', 'STACKED', 'ASYMMETRIC', 'MEGA_PLUS', 'APP_FOCUSED');
ALTER TABLE "public"."FooterConfig" ALTER COLUMN "layout" DROP DEFAULT;
ALTER TABLE "FooterConfig" ALTER COLUMN "layout" TYPE "FooterLayout_new" USING ("layout"::text::"FooterLayout_new");
ALTER TYPE "FooterLayout" RENAME TO "FooterLayout_old";
ALTER TYPE "FooterLayout_new" RENAME TO "FooterLayout";
DROP TYPE "public"."FooterLayout_old";
ALTER TABLE "FooterConfig" ALTER COLUMN "layout" SET DEFAULT 'MULTI_COLUMN';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PageTemplateType" ADD VALUE 'FAQ';
ALTER TYPE "PageTemplateType" ADD VALUE 'PRICING';

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_serviceId_fkey";

-- AlterTable
ALTER TABLE "FooterConfig" DROP COLUMN "newsletterEnabled",
DROP COLUMN "newsletterFormAction",
DROP COLUMN "newsletterProvider",
DROP COLUMN "newsletterSubtitle",
DROP COLUMN "newsletterTitle",
ADD COLUMN     "brandRevealColor" TEXT,
ADD COLUMN     "brandRevealEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "brandRevealOpacity" DOUBLE PRECISION DEFAULT 0.08,
ADD COLUMN     "brandRevealText" TEXT,
ADD COLUMN     "topBorderGradientFrom" TEXT,
ADD COLUMN     "topBorderGradientTo" TEXT,
ALTER COLUMN "sectionOrder" SET DEFAULT ARRAY['widgets', 'trust', 'bottom']::TEXT[];

-- AlterTable
ALTER TABLE "HeaderConfig" ALTER COLUMN "loginUrl" SET DEFAULT '/login';

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "tax",
ADD COLUMN     "customerCountry" TEXT,
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "items" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "serviceName" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "orderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LandingPage" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "locationCode" TEXT,
ADD COLUMN     "locationFeeLabel" TEXT,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "locationName" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "compareAtPriceUSD" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Plugin" ADD COLUMN     "licenseExpiresAt" TIMESTAMP(3),
ADD COLUMN     "licenseKey" TEXT,
ADD COLUMN     "licensePublicKey" TEXT,
ADD COLUMN     "licenseTier" TEXT,
ADD COLUMN     "licenseToken" TEXT,
ADD COLUMN     "licenseType" TEXT,
ADD COLUMN     "licenseVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "licensedDomain" TEXT,
ADD COLUMN     "pluginPath" TEXT,
ADD COLUMN     "requiresLicense" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "badgeColor" TEXT,
ADD COLUMN     "badgeText" TEXT,
ADD COLUMN     "displayOptions" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "hasLocationBasedPricing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locationFeeLabel" TEXT;

-- AlterTable
ALTER TABLE "ServiceCategory" ADD COLUMN     "color" TEXT;

-- DropTable
DROP TABLE "NewsletterSubscriber";

-- DropEnum
DROP TYPE "NewsletterSubscriberStatus";

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "type" "LocationType" NOT NULL DEFAULT 'STATE',
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationFee" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "feeType" "FeeType" NOT NULL DEFAULT 'FILING',
    "label" TEXT,
    "amountUSD" DECIMAL(10,2) NOT NULL,
    "amountBDT" DECIMAL(10,2),
    "processingTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "expeditedFee" DECIMAL(10,2),
    "expeditedTime" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "embedding" DOUBLE PRECISION[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIResponse" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sources" TEXT[],
    "wasUsed" BOOLEAN NOT NULL DEFAULT false,
    "wasEdited" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "country" TEXT,
    "city" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL DEFAULT 'WEBSITE',
    "sourceDetail" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "scoreHistory" JSONB,
    "scoreDecayDays" INTEGER NOT NULL DEFAULT 0,
    "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM',
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "lastPageViewed" TEXT,
    "visitCount" INTEGER NOT NULL DEFAULT 1,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedToId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "interestedIn" TEXT[],
    "budget" TEXT,
    "timeline" TEXT,
    "customFields" JSONB,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "convertedAt" TIMESTAMP(3),
    "convertedToId" TEXT,
    "notes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "formTemplateId" TEXT,
    "formTemplateName" TEXT,
    "newsletterSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "newsletterToken" TEXT,
    "newsletterUnsubAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "performedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadFormTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "defaultStyling" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "autoAssignToId" TEXT,
    "lastSubmission" TIMESTAMP(3),
    "submissionCount" INTEGER NOT NULL DEFAULT 0,
    "successMessage" TEXT,
    "successRedirect" TEXT,

    CONSTRAINT "LeadFormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingSettings" (
    "id" TEXT NOT NULL,
    "gtmEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gtmContainerId" TEXT,
    "gtmTrackForms" BOOLEAN NOT NULL DEFAULT true,
    "gtmTrackPages" BOOLEAN NOT NULL DEFAULT true,
    "fbPixelEnabled" BOOLEAN NOT NULL DEFAULT false,
    "fbPixelId" TEXT,
    "fbTrackLead" BOOLEAN NOT NULL DEFAULT true,
    "fbTrackPageView" BOOLEAN NOT NULL DEFAULT true,
    "fbTrackContent" BOOLEAN NOT NULL DEFAULT false,
    "gadsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gadsConversionId" TEXT,
    "gadsConversionLabel" TEXT,
    "gadsDefaultValue" DOUBLE PRECISION,
    "tiktokEnabled" BOOLEAN NOT NULL DEFAULT false,
    "tiktokPixelId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "items" JSONB NOT NULL,
    "speed" INTEGER NOT NULL DEFAULT 28,
    "separator" TEXT NOT NULL DEFAULT '·',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveTheme" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "themeName" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "colorPalette" JSONB,
    "fontConfig" JSONB,
    "originalColorPalette" JSONB,
    "widgetDefaults" JSONB,

    CONSTRAINT "ActiveTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailCampaign" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "previewText" TEXT,
    "body" TEXT NOT NULL,
    "templateId" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdById" TEXT,
    "audienceFilter" JSONB,
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "blogPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailCampaignRecipient" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "openedAt" TIMESTAMP(3),
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickedAt" TIMESTAMP(3),
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailCampaignRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_code_key" ON "Location"("code");

-- CreateIndex
CREATE INDEX "Location_country_idx" ON "Location"("country");

-- CreateIndex
CREATE INDEX "Location_type_idx" ON "Location"("type");

-- CreateIndex
CREATE INDEX "Location_isActive_isPopular_idx" ON "Location"("isActive", "isPopular");

-- CreateIndex
CREATE INDEX "Location_country_type_idx" ON "Location"("country", "type");

-- CreateIndex
CREATE INDEX "LocationFee_serviceId_idx" ON "LocationFee"("serviceId");

-- CreateIndex
CREATE INDEX "LocationFee_locationId_idx" ON "LocationFee"("locationId");

-- CreateIndex
CREATE INDEX "LocationFee_feeType_idx" ON "LocationFee"("feeType");

-- CreateIndex
CREATE INDEX "LocationFee_isActive_idx" ON "LocationFee"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LocationFee_serviceId_locationId_feeType_key" ON "LocationFee"("serviceId", "locationId", "feeType");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_category_idx" ON "KnowledgeDocument"("category");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_isActive_idx" ON "KnowledgeDocument"("isActive");

-- CreateIndex
CREATE INDEX "AIResponse_ticketId_idx" ON "AIResponse"("ticketId");

-- CreateIndex
CREATE INDEX "AIResponse_wasUsed_idx" ON "AIResponse"("wasUsed");

-- CreateIndex
CREATE INDEX "AIResponse_createdAt_idx" ON "AIResponse"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_newsletterToken_key" ON "Lead"("newsletterToken");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- CreateIndex
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");

-- CreateIndex
CREATE INDEX "Lead_score_idx" ON "Lead"("score");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_priority_idx" ON "Lead"("priority");

-- CreateIndex
CREATE INDEX "Lead_formTemplateId_idx" ON "Lead"("formTemplateId");

-- CreateIndex
CREATE INDEX "Lead_newsletterSubscribed_idx" ON "Lead"("newsletterSubscribed");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_idx" ON "LeadActivity"("leadId");

-- CreateIndex
CREATE INDEX "LeadActivity_type_idx" ON "LeadActivity"("type");

-- CreateIndex
CREATE INDEX "LeadActivity_createdAt_idx" ON "LeadActivity"("createdAt");

-- CreateIndex
CREATE INDEX "LeadNote_leadId_idx" ON "LeadNote"("leadId");

-- CreateIndex
CREATE INDEX "LeadNote_authorId_idx" ON "LeadNote"("authorId");

-- CreateIndex
CREATE INDEX "LeadFormTemplate_isActive_idx" ON "LeadFormTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Ticker_name_key" ON "Ticker"("name");

-- CreateIndex
CREATE INDEX "Ticker_name_idx" ON "Ticker"("name");

-- CreateIndex
CREATE INDEX "Ticker_isActive_idx" ON "Ticker"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveTheme_themeId_key" ON "ActiveTheme"("themeId");

-- CreateIndex
CREATE INDEX "ActiveTheme_themeId_idx" ON "ActiveTheme"("themeId");

-- CreateIndex
CREATE INDEX "EmailTemplate_isDefault_idx" ON "EmailTemplate"("isDefault");

-- CreateIndex
CREATE INDEX "EmailCampaign_status_idx" ON "EmailCampaign"("status");

-- CreateIndex
CREATE INDEX "EmailCampaign_scheduledAt_idx" ON "EmailCampaign"("scheduledAt");

-- CreateIndex
CREATE INDEX "EmailCampaign_blogPostId_idx" ON "EmailCampaign"("blogPostId");

-- CreateIndex
CREATE INDEX "EmailCampaign_createdAt_idx" ON "EmailCampaign"("createdAt");

-- CreateIndex
CREATE INDEX "EmailCampaignRecipient_campaignId_idx" ON "EmailCampaignRecipient"("campaignId");

-- CreateIndex
CREATE INDEX "EmailCampaignRecipient_leadId_idx" ON "EmailCampaignRecipient"("leadId");

-- CreateIndex
CREATE INDEX "EmailCampaignRecipient_status_idx" ON "EmailCampaignRecipient"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EmailCampaignRecipient_campaignId_leadId_key" ON "EmailCampaignRecipient"("campaignId", "leadId");

-- CreateIndex
CREATE INDEX "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateIndex
CREATE INDEX "Invoice_serviceName_idx" ON "Invoice"("serviceName");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationFee" ADD CONSTRAINT "LocationFee_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationFee" ADD CONSTRAINT "LocationFee_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIResponse" ADD CONSTRAINT "AIResponse_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "LeadFormTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailCampaignRecipient" ADD CONSTRAINT "EmailCampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailCampaignRecipient" ADD CONSTRAINT "EmailCampaignRecipient_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

