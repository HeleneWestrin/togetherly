import { useEffect, useRef } from "react";
import { FocusTrap } from "focus-trap-react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useIsMobile } from "../../hooks/useIsMobile";
import { desktopVariants, mobileVariants } from "./SidePanelVariants";
import { Typography } from "./Typography";

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
      document.body.style.overflow = "hidden"; // lock scroll
    } else {
      document.body.style.overflow = ""; // unlock scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
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
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-dark-800/70 backdrop-blur-sm !m-0"
              onClick={onClose}
              aria-hidden="true"
            />

            <motion.div
              ref={panelRef}
              className="
                absolute 
                bg-white
                shadow-lg
                md:top-0 md:bottom-0 md:right-0 md:w-96
                max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:h-auto max-md:rounded-t-3xl
                overflow-hidden
              "
              variants={isMobile ? mobileVariants : desktopVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
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
                className="p-6 overflow-y-auto"
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
