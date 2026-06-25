"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  ExternalLink,
  Loader2,
  Building2,
  CreditCard,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/lib/i18n/language-context";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

export default function HelpCenterPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);

  const helpCategories = [
    {
      titleKey: "dashboard.help.catEventPlanning",
      descKey: "dashboard.help.catEventPlanningDesc",
      icon: Building2,
      color: "bg-[var(--color-info-bg)] text-[var(--color-info-text)]",
    },
    {
      titleKey: "dashboard.help.catBilling",
      descKey: "dashboard.help.catBillingDesc",
      icon: CreditCard,
      color: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
    },
    {
      titleKey: "dashboard.help.catDocuments",
      descKey: "dashboard.help.catDocumentsDesc",
      icon: FileCheck,
      color: "bg-primary/10 text-primary",
    },
    {
      titleKey: "dashboard.help.catSecurity",
      descKey: "dashboard.help.catSecurityDesc",
      icon: ShieldCheck,
      color: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
    },
  ];

  const quickLinks = [
    { titleKey: "dashboard.help.linkPlanEvent", href: "/blog/how-to-plan-your-event" },
    { titleKey: "dashboard.help.linkFindVendors", href: "/blog/finding-vendors" },
    { titleKey: "dashboard.help.linkPackages", href: "/services" },
    { titleKey: "dashboard.help.linkFaqs", href: "/faq" },
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredFaqs(
        faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredFaqs(faqs);
    }
  }, [searchQuery, faqs]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/faqs?limit=20");
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
        setFilteredFaqs(data.faqs || []);
      }
    } catch {
      // FAQs are optional
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{t("dashboard.help.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("dashboard.help.subtitle")}</p>
      </div>

      {/* Search */}
      <div className="relative mx-auto max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("dashboard.help.searchPlaceholder")}
          className="pl-9 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Help Categories */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {helpCategories.map((category) => (
          <Card key={category.titleKey} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${category.color}`}>
                <category.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{t(category.titleKey)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(category.descKey)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Options */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t("dashboard.help.liveChat")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.help.liveChatDesc")}</p>
              <Button variant="link" className="mt-2 h-auto p-0" asChild>
                <Link href="/dashboard/support">
                  {t("dashboard.help.startChat")} <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t("dashboard.help.emailSupport")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.help.emailSupportDesc")}</p>
              <Button variant="link" className="mt-2 h-auto p-0" asChild>
                <a href="mailto:support@ceremoney.com">
                  support@ceremoney.com <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t("dashboard.help.phoneSupport")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.help.phoneHours")}</p>
              <Button variant="link" className="mt-2 h-auto p-0" asChild>
                <a href="tel:+1-800-123-4567">
                  +1 (800) 123-4567 <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {t("dashboard.help.faqTitle")}
          </CardTitle>
          <CardDescription>{t("dashboard.help.faqDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="py-8 text-center">
              <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("dashboard.help.noFaqs")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? t("dashboard.help.tryDifferentSearch")
                  : t("dashboard.help.checkBackLater")}
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("dashboard.help.quickLinks")}
          </CardTitle>
          <CardDescription>{t("dashboard.help.quickLinksDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.titleKey}
                href={link.href}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium">{t(link.titleKey)}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Still Need Help */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{t("dashboard.help.stillNeedHelp")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.help.stillNeedHelpDesc")}</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/support">{t("dashboard.help.contactSupport")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
