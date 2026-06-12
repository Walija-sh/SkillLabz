import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toolService from '../../services/tool.service';
import Button from '../../components/common/Button';

// ── animation variants ──────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};

function Badge({ children, variant = 'blue' }) {
  const cls = variant === 'blue'
    ? 'bg-blue-50 text-blue-700 border border-blue-100'
    : 'bg-gray-100 text-gray-600 border border-gray-200';
  return (
    <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-[0.12em] px-3 py-1 rounded-full ${cls}`}>
      {children}
    </span>
  );
}

function Divider() {
  return <div className="h-px w-full bg-gray-200/60 my-6" />;
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-bold text-gray-900">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Thumbnails({ images, active, onSelect }) {
  if (!images || images.length <= 1) return null;
  return (
    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
      {images.map((img, i) => (
        <motion.button
          key={img.public_id || i}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(i)}
          className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200
            ${active === i ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent opacity-55 hover:opacity-90'}`}
        >
          <img src={img.url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
        </motion.button>
      ))}
    </div>
  );
}

function OwnerCard({ item }) {
  return (
    <div className="py-2">
      <h3 className="text-base font-black uppercase tracking-widest text-gray-900 mb-5">About the Owner</h3>

      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0">
          <img
            src={item.owner?.profileImage?.url || 'https://via.placeholder.com/150'}
            alt={item.owner?.username}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <Link
            to={`/users/${item.owner?._id}`}
            className="text-xl font-black text-blue-600 hover:text-blue-700 transition-colors leading-tight"
          >
            {item.owner?.username}
          </Link>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tool Owner</span>
          <div className="flex items-center gap-1 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-blue-500 flex-shrink-0">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.02.01.006.004zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-500">{item.location?.city || 'Location not specified'}</span>
          </div>
        </div>
      </div>

      {item.offerSkillSession && (
        <div className="flex items-center gap-2 mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-sm font-semibold text-gray-600">Offers skill sessions</span>
        </div>
      )}

      <Divider />

      <Link
        to={`/users/${item.owner?._id}`}
        className="inline-flex items-center justify-center px-5 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-black text-sm tracking-tight transition-all"
      >
        View Owner Profile
      </Link>
    </div>
  );
}

export default function SingleTool() {
  const { id }      = useParams();
  const navigate    = useNavigate();

  const [item,        setItem]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await toolService.getToolById(id);
        setItem(res.item);
      } catch (err) {
        setError(err.message || 'Failed to load item details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#ECEFF1]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 bg-[#ECEFF1]">
        <h2 className="text-2xl font-black text-gray-900">Oops!</h2>
        <p className="text-gray-500">{error || 'Item not found.'}</p>
        <Button onClick={() => navigate('/browse-tools')}>Back to Browse</Button>
      </div>
    );
  }

  const mainImageUrl = item.images?.[activeImage]?.url
    || 'https://via.placeholder.com/800x600?text=No+Image';

  return (
    <motion.div
      className="w-full min-h-screen bg-[#ECEFF1]"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 pb-24 lg:pb-10">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-8 lg:gap-12 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────── */}
          <motion.div variants={stagger} className="flex flex-col gap-6">

            {/* Image gallery — no card, blends into page bg */}
            <motion.div variants={fadeUp}>
              {/* REMOVED: rounded-3xl, overflow-hidden, shadow-sm — no card effect */}
              <div className="relative w-full bg-[#ECEFF1]" style={{ aspectRatio: '4/3' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={mainImageUrl}
                    alt={item.title}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full object-contain p-4"
                  />
                </AnimatePresence>
              </div>
              <Thumbnails images={item.images} active={activeImage} onSelect={setActiveImage} />
            </motion.div>

            {/* Owner card — desktop only */}
            <motion.div variants={fadeUp} className="hidden lg:block">
              <OwnerCard item={item} />
            </motion.div>

          </motion.div>

          {/* ── RIGHT COLUMN ────────────────────────────────────── */}
          <motion.div variants={stagger} className="flex flex-col gap-0">

            {/* title + location + category */}
            <motion.div variants={fadeUp} className="mb-4">
              <h1 className="text-5xl sm:text-4xl font-black text-gray-950 leading-tight tracking-tight">
                {item.title}
              </h1>

              <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                  className="w-4 h-4 text-blue-500 flex-shrink-0">
                  <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.02.01.006.004zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                </svg>
                <span>
                  {item.location?.city || 'Location not specified'}
                  {item.location?.addressText && ` · ${item.location.addressText}`}
                </span>
              </div>

              {item.category && (
                <p className="mt-1.5 text-sm font-semibold text-blue-600 tracking-wide">
                  Category: {String(item.category).toUpperCase()}
                </p>
              )}
              {item.condition && (
                <p className="mt-1 text-sm font-semibold text-blue-600 tracking-wide">
                  Condition: {String(item.condition).toUpperCase()}
                </p>
              )}
            </motion.div>

            <Divider />

            {/* pricing */}
            <motion.div variants={fadeUp} className="mb-5">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-gray-950">Rs {item.pricePerDay?.toLocaleString()}</span>
                <span className="text-gray-400 font-semibold mb-1.5 text-base">/ day</span>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-gray-500 font-medium">Security Deposit: </span>
                {item.depositAmount > 0 ? (
                  <span className="font-bold text-gray-900">Rs {item.depositAmount?.toLocaleString()}</span>
                ) : (
                  <span className="font-bold text-green-600">None required</span>
                )}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="mb-5">
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/items/${item._id}/rent`)}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg tracking-tight shadow-lg shadow-blue-200 transition-colors"
              >
                Request to Rent
              </motion.button>
            </motion.div>

            {/* Accordions */}
            <motion.div variants={fadeUp} className="flex flex-col gap-3">
              <Accordion title="Description" defaultOpen={true}>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </Accordion>

              {item.offerSkillSession && (
                <Accordion title="Skill Session Details">
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-3">{item.skillSessionDescription || 'No additional description provided.'}</p>
                    <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                      <span className="font-bold text-blue-900 text-xs uppercase tracking-wide">Session Fee</span>
                      <span className="font-black text-blue-600">Rs {item.skillSessionPrice}</span>
                    </div>
                  </div>
                </Accordion>
              )}

              <Accordion title="Rental Policy">
                <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                  <p>• Inspect the item before accepting the rental.</p>
                  <p>• Return it in the same condition it was received.</p>
                  <p>• Late returns may incur additional charges.</p>
                  <p>• The security deposit is refunded after safe return.</p>
                  <p>• Contact the owner for custom rental durations.</p>
                </div>
              </Accordion>
            </motion.div>

          </motion.div>
        </div>

        {/* Owner card — mobile only */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="lg:hidden mt-8"
        >
          <OwnerCard item={item} />
        </motion.div>

      </div>

    </motion.div>
  );
}