"use client";

import { useRef, useState } from "react";

type Placement = "right" | "top-left";

export function Tooltip({
  text,
  placement = "right",
}: {
  text: string;
  placement?: Placement;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);

  const show = () => {
    const rect = iconRef.current?.getBoundingClientRect();
    if (rect) {
      if (placement === "top-left") {
        setPos({ top: rect.top - 8, left: rect.right });
      } else {
        setPos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
      }
    }
    setOpen(true);
  };
  const hide = () => setOpen(false);

  return (
    <>
      <span
        ref={iconRef}
        tabIndex={0}
        role="button"
        aria-label={text}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={() => (open ? hide() : show())}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "1px solid var(--color-divider)",
          fontSize: 11,
          color: "var(--color-text)",
          cursor: "help",
          marginLeft: 6,
          verticalAlign: "middle",
        }}
      >
        ?
      </span>
      {open && (
        <span
          role="tooltip"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            transform:
              placement === "top-left" ? "translate(-100%, -100%)" : "translateY(-50%)",
            width: "max-content",
            maxWidth: 220,
            background: "var(--color-neutral-900)",
            color: "var(--color-bg)",
            fontSize: 12,
            lineHeight: 1.4,
            padding: "var(--space-2) var(--space-3)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-md)",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          {text}
        </span>
      )}
    </>
  );
}
