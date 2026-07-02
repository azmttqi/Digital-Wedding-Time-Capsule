"use client";

import { useEffect } from "react";
import axios from "axios";

const THEME_MAP: Record<string, string> = {
  rose: "244 63 94",      // bg-rose-500
  sage: "126 154 130",    // custom #7E9A82
  ocean: "14 165 233",    // bg-sky-500
  lavender: "168 85 247", // bg-purple-500
  gold: "234 179 8",      // bg-yellow-500
  monochrome: "31 41 55", // bg-gray-800
};

export default function ThemeInjector({ slug, themeOverride }: { slug: string, themeOverride?: string }) {
  useEffect(() => {
    if (themeOverride && THEME_MAP[themeOverride]) {
      document.documentElement.style.setProperty("--theme-color-rgb", THEME_MAP[themeOverride]);
      return;
    }

    if (!slug) return;
    
    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/events/${slug}`)
      .then(res => {
        const themeName = res.data.theme || "rose";
        if (THEME_MAP[themeName]) {
          document.documentElement.style.setProperty("--theme-color-rgb", THEME_MAP[themeName]);
        }
      })
      .catch(err => console.error("Gagal memuat tema:", err));
  }, [slug, themeOverride]);

  return null;
}
