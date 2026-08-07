import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

// Page entrance container wrapper
export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Staggered grid container for cards/tables
export const StaggerGrid: React.FC<{ children: React.ReactNode; className?: string; staggerDelay?: number }> = ({
  children,
  className = '',
  staggerDelay = 0.05
}) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Staggered item inside grid/list
export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 16 },
      show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Hover-animated enterprise card
export const MotionCard: React.FC<HTMLMotionProps<'div'>> = ({
  children,
  className = '',
  ...props
}) => (
  <motion.div
    whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
    whileTap={{ scale: 0.99 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Tactile interactive button wrapper
export const MotionButton: React.FC<HTMLMotionProps<'button'>> = ({
  children,
  className = '',
  ...props
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.15 }}
    className={className}
    {...props}
  >
    {children}
  </motion.button>
);

// Animated Modal Overlay & Content
export interface MotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const MotionModal: React.FC<MotionModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl'
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Modal content dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`relative z-10 w-full ${maxWidth} bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden`}
        >
          {title && (
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-black font-heading text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default {
  PageContainer,
  StaggerGrid,
  StaggerItem,
  MotionCard,
  MotionButton,
  MotionModal
};
