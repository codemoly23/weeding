/**
 * Newsletter setting keys stored in the Setting model
 */
export const NEWSLETTER_SETTINGS = {
  AUTO_EMAIL_ENABLED: "newsletter.autoEmail.enabled",
  AUTO_EMAIL_TEMPLATE_ID: "newsletter.autoEmail.templateId",
  WELCOME_EMAIL_ENABLED: "newsletter.welcomeEmail.enabled",
  WELCOME_EMAIL_TEMPLATE_ID: "newsletter.welcomeEmail.templateId",
  BATCH_SIZE: "newsletter.batch.size",
  BATCH_DELAY_MS: "newsletter.batch.delayMs",
  CRON_SECRET: "newsletter.cron.secret",
} as const;

export const NEWSLETTER_DEFAULTS = {
  BATCH_SIZE: 50,
  BATCH_DELAY_MS: 2000,
};
