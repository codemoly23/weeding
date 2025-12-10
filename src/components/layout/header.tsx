"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  {
    name: "Services",
    href: "/services",
    children: [
      { name: "LLC Formation", href: "/services/llc-formation" },
      { name: "EIN Application", href: "/services/ein-application" },
      { name: "Amazon Seller Account", href: "/services/amazon-seller" },
      { name: "Registered Agent", href: "/services/registered-agent" },
      { name: "Virtual Address", href: "/services/virtual-address" },
    ],
  },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">L</span>
          </div>
          <span className="text-xl font-bold">
            LLC<span className="text-primary">Pad</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-8">
          {navigation.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  hoveredItem === item.name && "text-foreground"
                )}
              >
                {item.name}
                {item.children && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      hoveredItem === item.name && "rotate-180"
                    )}
                  />
                )}
              </Link>

              {/* Dropdown Menu */}
              {item.children && hoveredItem === item.name && (
                <div className="absolute left-0 top-full pt-2">
                  <div className="w-56 rounded-lg border bg-background p-2 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/services/llc-formation">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <span className="font-bold text-primary-foreground">L</span>
                  </div>
                  <span className="text-lg font-bold">
                    LLC<span className="text-primary">Pad</span>
                  </span>
                </Link>
              </div>

              <div className="mt-6 flex flex-col gap-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                    {item.children && (
                      <div className="ml-4 mt-1 flex flex-col gap-1">
                        {item.children.map((child) => (
                          <SheetClose asChild key={child.name}>
                            <Link
                              href={child.href}
                              className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              {child.name}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <SheetClose asChild>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="w-full">
                    <Link href="/services/llc-formation">Get Started</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
