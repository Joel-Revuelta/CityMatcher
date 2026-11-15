import { ImageResponse } from "next/og";
import { getAllCities, CITY_COUNT, COUNTRY_COUNT } from "@/lib/data";
import { DEFAULT_PREFS } from "@/lib/prefs";
import { rankCities } from "@/lib/scoring";

export const alt = "CityMatcher — Find where you'd actually thrive.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const preview = rankCities(getAllCities(), DEFAULT_PREFS).results.slice(0, 3);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f4ec",
          color: "#1f2d2b",
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: "#0d5c54",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f7f4ec",
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            C
          </div>
          <div style={{ display: "flex", fontSize: "28px", fontWeight: 600 }}>CityMatcher</div>
          <div
            style={{
              marginLeft: "auto",
              fontFamily: "Arial, sans-serif",
              fontSize: "16px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#0d5c54",
            }}
          >
            The relocation decision engine
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: "56px" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "760px" }}>
            <div style={{ display: "flex", fontSize: "76px", lineHeight: 1.02, letterSpacing: "-0.03em" }}>
              Find where you&apos;d
            </div>
            <div style={{ display: "flex", fontSize: "76px", lineHeight: 1.02, letterSpacing: "-0.03em", color: "#0d5c54" }}>
              actually thrive.
            </div>
            <div
              style={{
                marginTop: "28px",
                fontFamily: "Arial, sans-serif",
                fontSize: "23px",
                lineHeight: 1.45,
                color: "#5b6a66",
                maxWidth: "700px",
              }}
            >
              {`Rank real European cities by budget, climate, safety, healthcare and work — with sourced data and honest trade-offs.`}
            </div>
          </div>

          <div
            style={{
              width: "300px",
              borderRadius: "24px",
              border: "1px solid #ded8ca",
              background: "#ffffff",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", fontSize: "12px", letterSpacing: "0.14em", color: "#0d5c54", fontWeight: 700 }}>
                LIVE PREVIEW
              </div>
            </div>
            {preview.map((result) => (
              <div key={result.city.slug} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", flex: 1, fontSize: "20px", fontWeight: 600 }}>{result.city.name}</div>
                <div
                  style={{
                    borderRadius: "999px",
                    background: "#e6f0ec",
                    color: "#0d5c54",
                    padding: "6px 12px",
                    fontSize: "15px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {Math.round(result.score)}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", height: "1px", background: "#ded8ca", marginTop: "4px" }} />
            <div style={{ display: "flex", fontSize: "13px", color: "#5b6a66" }}>
              {`${CITY_COUNT} cities · ${COUNTRY_COUNT} countries · 11 criteria`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", fontFamily: "Arial, sans-serif", fontSize: "15px", color: "#5b6a66" }}>
          <span>Open-Meteo climate</span>
          <span>·</span>
          <span>World Bank context</span>
          <span>·</span>
          <span>Transparent cost model</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
