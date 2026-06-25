import { motion } from 'framer-motion';

// ── Page wrapper — fades + slides up on route change ─────────────────────────
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export default PageTransition;

// ── Stagger container — wraps a list, children animate one by one ─────────────
export const StaggerContainer = ({ children, className = '' }) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="show"
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: 0.07 } },
    }}
  >
    {children}
  </motion.div>
);

// ── Stagger child — use inside StaggerContainer ───────────────────────────────
export const StaggerItem = ({ children, className = '' }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 18 },
      show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    }}
  >
    {children}
  </motion.div>
);

// ── Fade in — simple single element fade ─────────────────────────────────────
export const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: 'easeOut', delay }}
  >
    {children}
  </motion.div>
);

// ── Scale in — for cards / stat boxes ────────────────────────────────────────
export const ScaleIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, ease: 'easeOut', delay }}
  >
    {children}
  </motion.div>
);

// ── Slide in from left — for sidebar / drawers ────────────────────────────────
export const SlideInLeft = ({ children, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, x: -24 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

// ── Hover lift — wrap a card to get lift on hover ────────────────────────────
export const HoverLift = ({ children, className = '' }) => (
  <motion.div
    className={className}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
  </motion.div>
);
