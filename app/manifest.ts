import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spike’s Closing Checklist",
    short_name: "Spike’s Close",
    description: "Complete tonight’s close and safely finish your Square timecard.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ed",
    theme_color: "#f7f4ed",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

