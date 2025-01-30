import { useEffect, useRef } from "react";
import { FocusTrap } from "focus-trap-react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useIsMobile } from "../../hooks/useIsMobile";
import { desktopVariants, mobileVariants } from "./SidePanelVariants";
import { Typography } from "./Typography";
import { useUIStore } from "../../stores/useUIStore";

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
  const isMobile = useIsMobile();

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Count active panels
      const activePanelCount = Object.values(
        useUIStore.getState().activePanels
      ).filter(Boolean).length;
      if (activePanelCount === 1) {
        document.body.style.overflow = "hidden"; // only lock if this is the first/only panel
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Only remove overflow: hidden if this is the last panel
      const remainingPanels = Object.values(
        useUIStore.getState().activePanels
      ).filter(Boolean).length;
      if (remainingPanels === 0) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, onClose]);

  return (
    // AnimatePresence will mount/unmount the motion.div
    <AnimatePresence>
      {isOpen && (
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            allowOutsideClick: true,
            escapeDeactivates: true,
            fallbackFocus: () => panelRef.current as HTMLElement,
          }}
        >
          <motion.div
            className="fixed inset-0 z-50 !m-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.175 }}
            aria-labelledby="panel-title"
            aria-modal="true"
            role="dialog"
          >
            {/* Base Overlay */}
            <div
              className="absolute inset-0 bg-dark-800/70 !m-0"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Separate Blur Overlay */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25 }}
              style={{ backdropFilter: "blur(4px)" }}
              onClick={onClose}
              aria-hidden="true"
            />

            <motion.div
              ref={panelRef}
              className="
                absolute
                max-h-svh 
                bg-white
                shadow-lg
                md:top-0 md:bottom-0 md:right-0 md:w-96
                max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:h-auto max-md:rounded-t-3xl
                overflow-hidden
                flex flex-col
              "
              variants={isMobile ? mobileVariants : desktopVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              <div className="flex items-center justify-between py-3 px-6 lg:py-6 px-10 border-b border-dark-200 flex-shrink-0">
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
                className="p-6 overflow-y-auto flex-grow"
                role="region"
                aria-labelledby="panel-title"
              >
                {children}
              </div>
            </motion.div>
          </motion.div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
};

export default SidePanel;
