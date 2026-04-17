import { getIcon } from "obsidian";
import type { MouseEvent } from "react";
import React from "react";

type IconProps = {
  name: string;
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void;
  className?: string;
};

export function Icon({ name, onClick, className }: IconProps) {
  const svg: SVGSVGElement | null = getIcon(name);


  if (!svg) return null;

  return (
    <span
      className={`obsidian-icon ${className ?? ""}`}
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: svg.outerHTML }}
    />
  );
}
