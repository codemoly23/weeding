import Link from "next/link";
import Image from "next/image";
import { getBusinessConfig } from "@/lib/business-settings";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getBusinessConfig();
  const firstLetter = (config.logo.text || config.name.charAt(0)).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center space-x-2">
          {config.display.showLogo && config.logo.url ? (
            <Image
              src={config.logo.url}
              alt={config.name}
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">{firstLetter}</span>
              </div>
              {config.display.showName && (
                <span className="text-2xl font-bold">{config.name}</span>
              )}
            </>
          )}
        </Link>

        {children}
      </div>
    </div>
  );
}
