import { RefObject, useEffect } from "react";

export function useOutsideClickHook<T extends HTMLElement = HTMLElement>(ref: RefObject<T>, callback:() => void) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent | PointerEvent) {
      const el = ref.current;
      if (!el) return;
      const target = event.target as Node | null;
      if (target && !el.contains(target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

