import type { ComponentChildren } from "preact";
import { useEffect } from "preact/hooks";

import * as modalStyles from "@/styles/providers/modal.css";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ComponentChildren;
  error?: string | null;
  footerActions?: ComponentChildren;
}

export default function Modal({
  title,
  onClose,
  children,
  error,
  footerActions,
}: Readonly<ModalProps>) {
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose} aria-hidden>
      <div
        className={modalStyles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.modalTitle}>{title}</h2>
          <button
            className={modalStyles.modalClose}
            onClick={onClose}
            aria-label="Close modal"
            type="button"
            tabIndex={0}
          >
            ×
          </button>
        </div>

        <div className={modalStyles.modalBody}>{children}</div>

        <div className={modalStyles.modalFooter}>
          {error && (
            <div className={modalStyles.modalFooterError}>
              <div className={modalStyles.errorMessage}>{error}</div>
            </div>
          )}
          {footerActions && (
            <div className={modalStyles.modalFooterButtons}>
              {footerActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
