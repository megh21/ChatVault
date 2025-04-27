import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = [
  { name: "accent", displayName: "Coral", value: "#D98B79" },
  { name: "secondary", displayName: "Teal", value: "#66999B" },
  { name: "highlight", displayName: "Lavender", value: "#DBDCFC" },
  { name: "neutralLight", displayName: "Peach", value: "#FFD4B7" },
  { name: "neutralDark", displayName: "Brown", value: "#A47160" },
  { name: "primary", displayName: "Forest", value: "#3E4C40" },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {COLORS.map((color) => (
        <ColorButton
          key={color.name}
          color={color}
          selected={value === color.name}
          onClick={() => onChange(color.name)}
        />
      ))}
    </div>
  );
}

interface ColorButtonProps {
  color: { name: string; displayName: string; value: string };
  selected: boolean;
  onClick: () => void;
}

function ColorButton({ color, selected, onClick }: ColorButtonProps) {
  return (
    <motion.button
      type="button"
      className={cn(
        "w-8 h-8 rounded-full relative",
        selected ? "ring-2 ring-offset-2" : "hover:ring-2 hover:ring-offset-1"
      )}
      style={{ backgroundColor: color.value }}
      onClick={onClick}
      title={color.displayName}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {selected && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Check 
            className={cn(
              "h-4 w-4", 
              ["highlight", "neutralLight"].includes(color.name) 
                ? "text-gray-800" 
                : "text-white"
            )} 
          />
        </span>
      )}
    </motion.button>
  );
}

export default ColorPicker;
