import { motion } from 'framer-motion';

interface HeaderProps {
  nodeCount: number;
  matchCount: number;
}

export function Header({ nodeCount, matchCount }: HeaderProps) {
  return (
    <motion.header
      className="brand"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="brand__title-row">
        <span className="brand__dot" aria-hidden="true" />
        <h1 className="brand__title">Global&nbsp;Pulse</h1>
      </div>
      <p className="brand__subtitle">Geography Encyclopedia · 249 countries · 54 fields</p>
      <p className="brand__count" aria-live="polite">
        <span className="brand__count-value">{matchCount}</span>
        <span className="brand__count-label">
          {matchCount === nodeCount ? 'countries' : `of ${nodeCount} countries`}
        </span>
      </p>
    </motion.header>
  );
}
