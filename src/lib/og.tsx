import { ImageResponse } from "next/og";
import { site } from "@/content/site";

type Input = { eyebrow: string; title: string; subtitle: string };

export function renderOg({ eyebrow, title, subtitle }: Input) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#eaf0fb",
          background: "linear-gradient(135deg, #0a1020 0%, #111a2e 58%, #16305e 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#4c9aff",
              color: "#06101f",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            AK
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>{site.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#4c9aff" }}>{eyebrow}</div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 68, fontWeight: 700, lineHeight: 1.06 }}>{title}</div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 28, lineHeight: 1.35, color: "#9fb0cb" }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#9fb0cb" }}>
          <div style={{ display: "flex" }}>
            {site.location.locality}, {site.location.country}
          </div>
          <div style={{ display: "flex" }}>Web scraping · OCR extraction · ETL pipelines</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
