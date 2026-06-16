import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "./modal.module.css";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Modal = ({ isOpen, title, children, onClose }:IModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        // lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        // firstElement?.focus();
      }
    };

    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleFocusTrap);
      document.body.style.overflow = "hidden";
      // modalRef.current?.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleFocusTrap);
      document.body.style.overflow = "unset";
      // previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal2-title"
      >
        <div className={styles.modalHeader}>
          <h3 id="modal2-title" className={styles.modalTitle}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <span style={{ fontSize: 12 }}>×</span>
          </button>
        </div>

        <div className={styles.modalContent}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

