export interface TemplateVariables {
  firstName?: string;
  email?: string;
  unsubscribeUrl?: string;
  siteUrl?: string;
  companyName?: string;
  blogTitle?: string;
  blogExcerpt?: string;
  blogUrl?: string;
  blogCoverImage?: string;
  [key: string]: string | undefined;
}

/**
 * Replace {{variable}} placeholders in template HTML
 */
export function renderTemplate(html: string, variables: TemplateVariables): string {
  return html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

/**
 * Extract variable names from a template
 */
export function extractVariables(html: string): string[] {
  const matches = html.matchAll(/\{\{(\w+)\}\}/g);
  const vars = new Set<string>();
  for (const match of matches) {
    vars.add(match[1]);
  }
  return Array.from(vars);
}
