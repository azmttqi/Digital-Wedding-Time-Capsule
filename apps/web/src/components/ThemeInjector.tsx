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

export default function ThemeInjector({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;
    
    axios.get(`http://localhost:3001/events/${slug}`)
      .then(res => {
        const themeName = res.data.theme || "rose";
        if (THEME_MAP[themeName]) {
          document.documentElement.style.setProperty("--theme-color-rgb", THEME_MAP[themeName]);
        }
      })
      .catch(err => console.error("Gagal memuat tema:", err));
  }, [slug]);

  return null;
}
