import { setIcon } from "obsidian";
import React, { useEffect, useRef, useState } from "react";

interface IconButtonProps {
  icon: string;
  active?: boolean;
  onClick?: (active: boolean) => void;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, active = false, onClick }) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(active);

  useEffect(() => {
    if (iconRef.current) {
      setIcon(iconRef.current, icon);
    }
  }, [icon]);

  return (
    <div
      ref={iconRef}
      className={`lucide-icon-button clickable-icon ${isActive ? "is-active" : ""}`}
      onClick={() => {
        const newValue = !isActive;
        setIsActive(newValue);
        onClick?.(newValue);
      }}
    />
  );
};
