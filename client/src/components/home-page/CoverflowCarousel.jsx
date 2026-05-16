import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CoverflowCarousel({ categories }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % categories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [categories.length]);

  const getConfig = (distance) => {
    const abs = Math.abs(distance);
    const sign = distance >= 0 ? 1 : -1;
    if (abs === 0) return { x: 0,          scale: 1.08, opacity: 1,    zIndex: 10 };
    if (abs === 1) return { x: sign * 230,  scale: 0.82, opacity: 0.65, zIndex: 5  };
    if (abs === 2) return { x: sign * 400,  scale: 0.62, opacity: 0.28, zIndex: 2  };
                   return { x: sign * 520,  scale: 0,    opacity: 0,    zIndex: 0  };
  };

  return (
    <div className="overflow-hidden w-full">
      <div className="relative flex items-center justify-center w-full" style={{ height: '420px' }}>
        {categories.map((cat, index) => {
          let distance = index - activeIndex;
          if (distance >  categories.length / 2) distance -= categories.length;
          if (distance < -categories.length / 2) distance += categories.length;
          const { x, scale, opacity, zIndex } = getConfig(distance);
          return (
            <motion.div
              key={cat.name}
              className="absolute flex flex-col items-center"
              animate={{ x, scale, opacity, zIndex }}
              transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ width: '300px' }}
            >
              <div className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100 w-full">
                <img src={cat.image} alt={cat.name} className="w-full aspect-square object-cover block" loading="lazy" />
              </div>
              <p className="text-center mt-3 font-semibold text-gray-900 text-lg">{cat.name}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}