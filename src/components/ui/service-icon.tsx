"use client";

import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface ServiceIconProps extends LucideProps {
  name: string;
}

export function ServiceIcon({ name, ...props }: ServiceIconProps) {
  const IconComponent =
    (LucideIcons as Record<string, React.ComponentType<LucideProps>>)[name] ||
    LucideIcons.Package;

  return <IconComponent {...props} />;
}
