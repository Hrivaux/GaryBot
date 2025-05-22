'use client';

import React from "react";

type Entretien = {
  id?: number;
  piece: string;
  description: string;
  frequence_km: number | null;
  frequence_annees: number | null;
};

interface Props {
  entretien: Entretien;
  position?: 0 | 1 | 2; // 0 = rouge, 1 = orange, 2 = vert
}

export default function EntretienIndicator({ entretien, position = 1 }: Props) {
  const colors = ["bg-red-500", "bg-orange-400", "bg-green-500"];

  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm text-gray-800 font-medium">{entretien.piece}</span>
      <div className="flex flex-col items-center ml-4">
        <div className="flex gap-[6px] h-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-center w-4">
              {position === i && (
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black mb-1" />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-[6px]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-4 h-2 rounded-sm ${
                position === i ? colors[i] : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
