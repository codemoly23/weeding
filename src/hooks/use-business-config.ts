"use client";

import { useState, useEffect } from "react";

// Client-side business config interface (duplicated to avoid server imports)
interface BusinessConfig {
  name: string;
  tagline: string;
  description: string;
  display?: {
    showLogo: boolean;
    showName: boolean;
  };
  logo: {
    url: string;
    darkUrl?: string;
    text: string;
  };
  favicon: string;
  contact: {
    email: string;
    phone: string;
    supportEmail: string;
  };
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    full: string;
  };
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
}

// Default config for client-side (no server imports)
const defaultConfig: BusinessConfig = {
  name: "Ceremoney",
  tagline: "Your Wedding Planning Platform",
  description: "Plan your perfect wedding, baptism, or event with Ceremoney. Guest management, seating charts, vendor directory, and beautiful event websites.",
  display: {
    showLogo: true,
    showName: true,
  },
  logo: {
    url: "",
    darkUrl: "",
    text: "C",
  },
  favicon: "",
  contact: {
    email: "contact@ceremoney.com",
    phone: "",
    supportEmail: "support@ceremoney.com",
  },
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "Sweden",
    full: "",
  },
  social: {
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    tiktok: "",
  },
};

export function useBusinessConfig() {
  const [config, setConfig] = useState<BusinessConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/business-config");
        if (!res.ok) throw new Error("Failed to fetch config");
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error("Error fetching business config:", err);
        setError(err instanceof Error ? err.message : "Failed to load config");
        // Keep default config on error
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return { config, loading, error };
}
