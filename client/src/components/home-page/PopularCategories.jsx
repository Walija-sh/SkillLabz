import React from 'react';
import { motion } from 'framer-motion';
import CoverflowCarousel from './CoverflowCarousel';

const categories = [
  { image: '/home page/power-tools.jpg', name: 'Power Tools' },
  { image: '/home page/garden-tool.jpg', name: 'Garden Tools' },
  { image: '/home page/photography.jpg', name: 'Photography'  },
  { image: '/home page/music.jpg',       name: 'Music'        },
  { image: '/home page/sports.jpg',      name: 'Sports'       },
  { image: '/home page/camping.jpg',     name: 'Camping'      },
];

const sectionInView = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.72, ease: 'easeOut' } },
};

export default function PopularCategories() {
  return (
    <motion.section
      id="categories"
      className="pt-8 md:pt-12 pb-8 md:pb-12 bg-[#ECEFF1] px-4"
      variants={sectionInView}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900">Popular Categories</h2>
          <div className="w-16 h-1 bg-[#191970] mt-4 rounded-full" />
        </div>
        <CoverflowCarousel categories={categories} />
      </div>
    </motion.section>
  );
}