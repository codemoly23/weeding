// ============================================
// THEME SYSTEM - RESET TO FACTORY DEFAULTS
// ============================================
// Resets all content data to empty state while
// preserving user/order/lead/system data.
// ============================================

import prisma from "@/lib/db";
import type { ResetResult } from "./theme-types";
import { revalidatePath } from "next/cache";

/**
 * Resets all content data to factory defaults (empty state).
 * Preserves user accounts, orders, leads, and system data.
 * Recreates essential system pages after deletion.
 *
 * @param confirmation - Must be "RESET" to confirm the operation
 * @returns ResetResult with counts of deleted and recreated records
 */
export async function resetAllData(
  confirmation: string
): Promise<ResetResult> {
  if (confirmation !== "RESET") {
    throw new Error("Invalid confirmation. Type RESET to confirm.");
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const deleted = {
        services: 0,
        pages: 0,
        blogs: 0,
        faqs: 0,
        testimonials: 0,
        legalPages: 0,
        settings: 0,
      };

      // DELETE PHASE (same order as importer to respect FK constraints)

      // Footer
      await tx.menuItem.deleteMany({
        where: { footerWidgetId: { not: null } },
      });
      await tx.footerWidget.deleteMany({});
      await tx.footerConfig.deleteMany({});

      // Header
      await tx.menuItem.deleteMany({
        where: { headerId: { not: null } },
      });
      await tx.headerConfig.deleteMany({});

      // Forms
      await tx.formField.deleteMany({});
      await tx.formTab.deleteMany({});
      await tx.serviceFormTemplate.deleteMany({});

      // Nullify OrderItem FK references (orders are preserved, but services/packages are deleted)
      await tx.$executeRawUnsafe(`UPDATE "OrderItem" SET "packageId" = NULL`);
      await tx.$executeRawUnsafe(`UPDATE "OrderItem" SET "serviceId" = NULL`);

      // Package/Service data
      await tx.packageFeatureMap.deleteMany({});
      await tx.packageFeature.deleteMany({});
      await tx.packageNotIncluded.deleteMany({});
      await tx.package.deleteMany({});
      await tx.serviceFeature.deleteMany({});
      await tx.serviceFAQ.deleteMany({});
      await tx.locationFee.deleteMany({});

      const deletedServices = await tx.service.deleteMany({});
      deleted.services = deletedServices.count;

      await tx.serviceCategory.deleteMany({});

      // Pages
      await tx.landingPageBlock.deleteMany({});
      const deletedPages = await tx.landingPage.deleteMany({});
      deleted.pages = deletedPages.count;

      // Blog
      const deletedBlogs = await tx.blogPost.deleteMany({});
      deleted.blogs = deletedBlogs.count;
      await tx.blogCategory.deleteMany({});

      // FAQs
      const deletedFaqs = await tx.fAQ.deleteMany({});
      deleted.faqs = deletedFaqs.count;

      // Testimonials
      const deletedTestimonials = await tx.testimonial.deleteMany({});
      deleted.testimonials = deletedTestimonials.count;

      // Legal
      const deletedLegal = await tx.legalPage.deleteMany({});
      deleted.legalPages = deletedLegal.count;

      // Settings
      const deletedSettings = await tx.setting.deleteMany({});
      deleted.settings = deletedSettings.count;

      // Active theme
      await tx.activeTheme.deleteMany({});

      // RECREATE SYSTEM PAGES
      const systemPages = [
        { slug: "home", name: "Home", templateType: "HOME" as const },
        {
          slug: "service",
          name: "Service Details",
          templateType: "SERVICE_DETAILS" as const,
        },
        {
          slug: "services",
          name: "Services List",
          templateType: "SERVICES_LIST" as const,
        },
        {
          slug: "blog-list",
          name: "Blog List",
          templateType: "BLOG_LIST" as const,
        },
        { slug: "about", name: "About", templateType: "ABOUT" as const },
        {
          slug: "contact",
          name: "Contact",
          templateType: "CONTACT" as const,
        },
        { slug: "faq", name: "FAQ", templateType: "FAQ" as const },
        {
          slug: "pricing",
          name: "Pricing",
          templateType: "PRICING" as const,
        },
      ];

      let systemPageCount = 0;
      for (const page of systemPages) {
        await tx.landingPage.create({
          data: {
            slug: page.slug,
            name: page.name,
            templateType: page.templateType,
            isSystem: true,
            isActive: true,
            isTemplateActive: true,
          },
        });
        systemPageCount++;
      }

      return { deleted, systemPageCount };
    },
    { timeout: 30000 }
  );

  // Revalidate everything
  revalidatePath("/", "layout");

  return {
    success: true,
    deleted: result.deleted,
    recreated: {
      systemPages: result.systemPageCount,
    },
  };
}
