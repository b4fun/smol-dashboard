"use client";

import * as React from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";

export const ModalContext = React.createContext(true);

// Keep inert ownership independent of the primitive's aria-hidden bookkeeping.
const backgroundLocks = new WeakMap<HTMLElement, { count: number; wasInert: boolean }>();

function makeBackgroundInert(content: HTMLElement) {
  const locked: HTMLElement[] = [];
  let branch: HTMLElement = content;
  while (branch.parentElement) {
    const parent = branch.parentElement;
    for (const sibling of parent.children) {
      if (sibling === branch || !(sibling instanceof HTMLElement)) continue;
      const lock = backgroundLocks.get(sibling);
      if (lock) lock.count++;
      else {
        backgroundLocks.set(sibling, { count: 1, wasInert: sibling.inert });
        sibling.inert = true;
      }
      locked.push(sibling);
    }
    if (parent === content.ownerDocument.body) break;
    branch = parent;
  }
  return () => {
    for (const element of locked) {
      const lock = backgroundLocks.get(element)!;
      if (--lock.count === 0) {
        element.inert = lock.wasInert;
        backgroundLocks.delete(element);
      }
    }
  };
}

export function useModalContentRef(forwardedRef: React.ForwardedRef<HTMLDivElement>): React.RefCallback<HTMLDivElement> {
  const modal = React.useContext(ModalContext);
  const [content, setContent] = React.useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!modal || !content) return;
    let release: (() => void) | undefined;
    // Keep background controls unfocusable while nested overlays pause the parent's focus scope.
    const update = () => {
      release?.();
      release = content.dataset.state === "open" ? makeBackgroundInert(content) : undefined;
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(content, { attributes: true, attributeFilter: ["data-state"] });
    return () => { observer.disconnect(); release?.(); };
  }, [content, modal]);

  return useComposedRefs(forwardedRef, setContent);
}
