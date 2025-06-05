import React from "react";

export default function FullScreenLoader({ text = "Sınav Yükleniyor..." }) {
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(255,255,255,0.95)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-8" />
      <h2 style={{ fontSize: 24, color: "#2563eb", fontWeight: 600 }}>{text}</h2>
      <p style={{ marginTop: 8, color: "#666" }}>Lütfen bekleyin, sınavınız hazırlanıyor.</p>
    </div>
  );
}
