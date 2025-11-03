
import React, { useState } from "react";

interface SettingItemProps {
  name: string;
  desc?: string;
  active?: boolean;
  onClick?: (active: boolean) => void;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  name,
  desc = "",
  active = false,
  onClick,
}) => {
  const [isActive, setIsActive] = useState(active);
  const handleToggle = () => {
    const newValue = !isActive;
    setIsActive(newValue);
    onClick?.(newValue);
  };

  return (
    <div className="setting-item mod-toggle">
      <div className="setting-item-info">
        <div className="setting-item-name">{name}</div>
        <div className="setting-item-description">{desc}</div>
      </div>
      <div className="setting-item-control">
        <div
          className={`checkbox-container mod-small ${isActive ? "is-enabled" : ""}`}
          onClick={handleToggle}>
          <input type="checkbox" tabIndex={0} />
        </div>
      </div>
    </div>
  );
};
