import Link from "next/link";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const footerLinks = {
  services: [
    { name: "LLC Formation", href: "/services/llc-formation" },
    { name: "EIN Application", href: "/services/ein-application" },
    { name: "Amazon Seller Account", href: "/services/amazon-seller" },
    { name: "Registered Agent", href: "/services/registered-agent" },
    { name: "Virtual Address", href: "/services/virtual-address" },
    { name: "Business Banking", href: "/services/business-banking" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "FAQs", href: "/faq" },
    { name: "Contact", href: "/contact" },
    { name: "Testimonials", href: "/testimonials" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "Disclaimer", href: "/disclaimer" },
  ],
  states: [
    { name: "Wyoming LLC", href: "/llc/wyoming" },
    { name: "Delaware LLC", href: "/llc/delaware" },
    { name: "New Mexico LLC", href: "/llc/new-mexico" },
    { name: "Texas LLC", href: "/llc/texas" },
    { name: "Florida LLC", href: "/llc/florida" },
  ],
};

const socialLinks = [
  { name: "Facebook", href: "#", icon: Facebook },
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "LinkedIn", href: "#", icon: Linkedin },
  { name: "Instagram", href: "#", icon: Instagram },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">
                  L
                </span>
              </div>
              <span className="text-xl font-bold">
                LLC<span className="text-primary">Pad</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Empowering global entrepreneurs to launch legitimate US businesses
              and Amazon stores with zero complexity.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a
                href="mailto:support@llcpad.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                support@llcpad.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
                +1 (234) 567-890
              </a>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                30 N Gould St, Sheridan, WY 82801, USA
              </p>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="rounded-lg bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Services</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular States */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Popular States
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.states.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LLCPad. All rights reserved.
            </p>
            <p className="max-w-xl text-center text-xs text-muted-foreground md:text-right">
              <strong>Disclaimer:</strong> LLCPad is not a law firm and does not
              provide legal advice. The information provided is for general
              informational purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
