import React from 'react';

interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ label, value, min, max, onChange, icon }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
          {icon} {label}
        </label>
        <span className="text-xs text-slate-400 font-mono">{value > 0 ? `+${value}` : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
      />
    </div>
  );
};

export default RangeSlider;