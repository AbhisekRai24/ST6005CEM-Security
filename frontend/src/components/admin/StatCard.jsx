// components/StatCard.jsx
import React from "react";

export default function StatCard({ title, value, bgImage }) {
  return (
    <div
      className="relative p-4 rounded shadow text-white h-40 flex flex-col justify-end"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black bg-opacity-40 rounded"></div>

      {/* Content */}
      <h3 className="relative text-sm font-semibold">{title}</h3>
      <p className="relative text-2xl font-bold">{value}</p>
    </div>
  );
}
