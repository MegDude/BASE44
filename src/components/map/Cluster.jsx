import React from "react";
import "@/styles/pin.css";

export default function Cluster({ count }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "999px",
        background: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontWeight: 600,
        boxShadow: "0 0 14px rgba(59,130,246,0.7)",
        transform: "translate(-50%, -50%)",
      }}
    >
      {count}
    </div>
  );
}
