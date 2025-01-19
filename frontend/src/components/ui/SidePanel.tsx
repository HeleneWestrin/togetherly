import { Typography } from "./Typography";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Add event listener
      document.addEventListener("keydown", handleEscape);

      // Focus the first focusable element in the panel
      const focusableElements = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.length) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      // Restore focus when panel closes
      previousFocusRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-dark-800/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-200">
          <Typography
            id="panel-title"
            element="h2"
            className="!leading-none"
          >
            {title}
          </Typography>
          <button
            onClick={onClose}
            className="text-dark-600 hover:text-dark-800 transition-colors p-2 rounded-full"
            aria-label="Close panel"
          >
            <X
              size={24}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto h-[calc(100vh-5rem)]"
          role="region"
          aria-labelledby="panel-title"
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default SidePanel;
