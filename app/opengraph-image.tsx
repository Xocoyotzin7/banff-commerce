import { ImageResponse } from "next/og"

import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@banff/agency-core/seo"
import BanffDark from "../BanffOscuro.jpeg"

export const runtime = "edge"

export default function OpenGraphImage() {
  const siteUrl = getSiteUrl()
  const logoImage = BanffDark.src

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#060b14",
          color: "white",
          padding: 56,
          fontFamily: "Inter, Arial, sans-serif",
          position: "relative",
        }}
      >
        <img
          src={logoImage}
          alt=""
          width="1200"
          height="630"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.18,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(6,11,20,0.12) 0%, rgba(6,11,20,0.55) 48%, rgba(6,11,20,0.9) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.74)",
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                borderRadius: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(233,171,123,0.2))",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 18px 70px rgba(0,0,0,0.35)",
            }}
          >
              <span style={{ fontSize: 34 }}>🌲</span>
            </div>
            {SITE_NAME}
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 74,
              lineHeight: 0.96,
              letterSpacing: -2,
              fontWeight: 800,
            }}
          >
            Banff Studio technology and professional development
          </h1>
          <p style={{ margin: 0, maxWidth: 680, fontSize: 28, lineHeight: 1.35, color: "rgba(255,255,255,0.8)" }}>
            {SITE_DESCRIPTION}
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
