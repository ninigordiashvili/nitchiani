"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

export function CalEmbed({ calLink }: { calLink: string }) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "nitchiani" });
      cal("ui", {
        theme: "light",
        cssVarsPerTheme: {
          light: { "cal-brand": "#A14040" },
          dark: { "cal-brand": "#A14040" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <Cal
      namespace="nitchiani"
      calLink={calLink}
      style={{ width: "100%", height: "640px", overflow: "scroll" }}
      config={{ layout: "month_view" }}
    />
  );
}
