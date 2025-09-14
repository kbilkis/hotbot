import React, { useState } from "react";

import QuestionSvg from "../../icons/question-mark-circle.svg?react";

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

export default function Tooltip({
  text,
  children,
}: TooltipProps): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      style={{
        display: "inline-block",
        position: "relative",
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (
        <QuestionSvg
          width="14"
          height="14"
          style={{ verticalAlign: "middle" }}
        />
      )}

      {isVisible && (
        <div
          style={{
            position: "fixed",
            bottom: "auto",
            top: "auto",
            left: "auto",
            right: "auto",
            transform: "translate(-50%, -100%)",
            marginBottom: "8px",
            padding: "8px 12px",
            backgroundColor: "#333",
            color: "white",
            borderRadius: "4px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            zIndex: 10000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            pointerEvents: "none",
          }}
          ref={(el) => {
            if (el && isVisible) {
              // Position the tooltip relative to the trigger element
              const trigger = el.parentElement;
              if (trigger) {
                const rect = trigger.getBoundingClientRect();

                // Position above the trigger, centered horizontally
                el.style.left = `${rect.left + rect.width / 2}px`;
                el.style.top = `${rect.top - 8}px`;
                el.style.transform = "translate(-50%, -100%)";
              }
            }
          }}
        >
          {text}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid #333",
            }}
          />
        </div>
      )}
    </div>
  );
}
