"use client";

import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

// Get icon component from string name
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // Default to Package icon if name is empty or not found
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<LucideProps>>)[name] || LucideIcons.Package;

  return <IconComponent {...props} />;
}

// For server components - returns the icon component itself
export function getIconComponent(name: string): React.ComponentType<LucideProps> {
  return (LucideIcons as Record<string, React.ComponentType<LucideProps>>)[name] || LucideIcons.Package;
}
