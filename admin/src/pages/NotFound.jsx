import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const NotFound = () => (
  <div
    className="h-screen flex flex-col items-center justify-center gap-5"
    style={{ backgroundColor: '#ECEFF1', fontFamily: 'DM Sans, sans-serif' }}
  >
    {/* Icon box */}
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-24 h-24 rounded-3xl flex items-center justify-center mb-2"
      style={{ backgroundColor: 'rgba(25,25,112,0.07)' }}
    >
      <span
        className="font-black leading-none select-none"
        style={{ fontSize: '2.6rem', color: '#191970', letterSpacing: '-0.04em' }}
      >
        404
      </span>
    </motion.div>

    {/* Label */}
    <motion.p
      variants={fadeUp} custom={1} initial="hidden" animate="visible"
      className="text-[10px] font-black uppercase tracking-widest"
      style={{ color: '#191970' }}
    >
      Page Not Found
    </motion.p>

    {/* Heading */}
    <motion.h1
      variants={fadeUp} custom={2} initial="hidden" animate="visible"
      className="text-3xl font-black text-slate-800 text-center"
      style={{ letterSpacing: '-0.02em' }}
    >
      Oops! Wrong turn.
    </motion.h1>

    {/* Subtext */}
    <motion.p
      variants={fadeUp} custom={3} initial="hidden" animate="visible"
      className="text-sm font-medium text-slate-400 text-center max-w-xs leading-relaxed"
    >
      The page you're looking for doesn't exist or has been moved.
    </motion.p>

    {/* CTA */}
    <motion.div
      variants={fadeUp} custom={4} initial="hidden" animate="visible"
    >
      <motion.div whileTap={{ scale: 0.97 }}>
        <Link
          to="/dashboard"
          className="inline-flex items-center text-[10px] font-black uppercase tracking-widest px-7 py-3.5 rounded-2xl transition-colors duration-200"
          style={{ backgroundColor: '#191970', color: '#fff' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f0f4d')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#191970')}
        >
          Back to Dashboard
        </Link>
      </motion.div>
    </motion.div>
  </div>
);

export default NotFound;