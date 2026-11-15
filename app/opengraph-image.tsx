import { ImageResponse } from "next/og";
import { getAllCities, CITY_COUNT, COUNTRY_COUNT } from "@/lib/data";
import { DEFAULT_PREFS } from "@/lib/prefs";
import { rankCities } from "@/lib/scoring";

export const alt = "CityMatcher — find a city that fits the life you want.";
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
          background: "#EDEFE9",
          color: "#151B19",
          padding: "56px 64px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              border: "2px solid #7E2A2A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div style={{ width: "14px", height: "14px", background: "#7E2A2A" }} />
          </div>
          <div style={{ display: "flex", fontSize: "24px", fontWeight: 700 }}>CityMatcher</div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: "14px",
              letterSpacing: "0.02em",
              color: "#5E665E",
            }}
          >
            Relocation decision engine
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: "52px" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "720px" }}>
            <div style={{ display: "flex", fontSize: "68px", lineHeight: 1.02, fontWeight: 700 }}>
              A city that fits
            </div>
            <div style={{ display: "flex", fontSize: "68px", lineHeight: 1.02, fontWeight: 700, color: "#7E2A2A" }}>
              the life you want.
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "24px",
                fontSize: "21px",
                lineHeight: 1.45,
                color: "#5E665E",
                maxWidth: "650px",
              }}
            >
              {`Rank real European cities by budget, climate, safety, healthcare and work — with sourced data and honest trade-offs.`}
            </div>
          </div>

          <div
            style={{
              width: "330px",
              border: "1px solid #C8CEC3",
              background: "#F4F5F0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #C8CEC3",
                padding: "16px 18px",
              }}
            >
              <div style={{ display: "flex", fontSize: "15px", fontWeight: 700 }}>Match ledger</div>
              <div style={{ display: "flex", fontSize: "11px", color: "#5E665E" }}>€2,500/mo</div>
            </div>
            {preview.map((result, index) => (
              <div
                key={result.city.slug}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  borderBottom: index === preview.length - 1 ? "0" : "1px solid #C8CEC3",
                  padding: "14px 18px",
                }}
              >
                <div style={{ display: "flex", width: "18px", fontSize: "11px", color: "#5E665E" }}>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: "16px", fontWeight: 700 }}>{result.city.name}</div>
                  <div style={{ display: "flex", fontSize: "11px", color: "#5E665E" }}>{result.city.country}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    borderLeft: "2px solid #7E2A2A",
                    paddingLeft: "8px",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  {Math.round(result.score)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "18px",
            borderTop: "1px solid #C8CEC3",
            paddingTop: "16px",
            fontSize: "13px",
            color: "#5E665E",
          }}
        >
          <span>{`${CITY_COUNT} cities`}</span>
          <span>/</span>
          <span>{`${COUNTRY_COUNT} countries`}</span>
          <span>/</span>
          <span>11 criteria</span>
          <span>/</span>
          <span>Open-Meteo + World Bank + transparent cost model</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
