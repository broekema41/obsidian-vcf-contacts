import {Menu} from "obsidian";
import * as React from "react";

import {Contact, getSubkeyNameFallback, parseKey} from "../../../contacts";

type LinkType =
  | { type: "url"; icon: string }
  | { type: "social"; icon: string }
  | undefined

function getLinkType(key: string, value: string): LinkType {
  if (!value || value.trim().length === 0) return undefined;

  if (key.startsWith("URL")) {
    return { type: "url", icon: "link" };
  }

  if (key.startsWith("SOCIALPROFILE")) {
    return { type: "social", icon: "waypoints" };
  }

  return undefined;
}


export const handleContextMenu = (
  event: React.MouseEvent<HTMLDivElement>,
  contact: Contact
) => {
  event.preventDefault();
  event.stopPropagation();
  const menu = new Menu();
  for (const [key, value] of Object.entries(contact.data)) {
    const link = getLinkType(key, value);

    if (link) {
      menu.addItem((item) => {
        const keyParsed = parseKey(key);
        const keyName = getSubkeyNameFallback(keyParsed);
        const formattedName = keyName.charAt(0).toUpperCase() + keyName.slice(1).toLowerCase();
        item.setIcon(link.icon).setTitle(`${formattedName}`).onClick(() => window.open(value, "_blank"))
      });
    }
  }
  menu.showAtPosition({ x: event.pageX, y: event.pageY });
}
