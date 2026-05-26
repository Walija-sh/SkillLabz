import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { id: 1, title: 'Browse Tools',     desc: 'Find the perfect tool for your project',     image: '/home page/browse-product.png'   },
  { id: 2, title: 'Request Rental',   desc: 'Send a rental request to the owner',         image: '/home page/request-rentals.png'  },
  { id: 3, title: 'Get Approved',     desc: 'Owner reviews and approves your request',    image: '/home page/get-approved.png'     },
  { id: 4, title: 'Pick Up & Return', desc: 'Use OTP for secure pickup and return',       image: '/home page/Pick Up-Return.png'   },
];

const sectionInView = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.72, ease: 'easeOut' } },
};

export default function HowItWorks() {
  return (
    <motion.section
      id="how-it-works"
      className="pt-8 md:pt-12 pb-8 md:pb-12 bg-[#ECEFF1]"
      variants={sectionInView}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900">How It Works</h2>
          <div className="w-16 h-1 bg-[#191970] mt-4 rounded-full" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {steps.map((step) => (
            <motion.div
              key={step.id}
              className="flex flex-col items-center text-center bg-white rounded-3xl border border-gray-100 border-b-4 border-b-transparent shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-b-[#191970] relative"
              initial="rest"
              animate="rest"
              whileHover="hover"
              variants={{ rest: { y: 0 }, hover: { y: -12 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="w-full pt-6 px-6 bg-white">
                <img src={step.image} alt={step.title} className="w-full aspect-video object-contain rounded-t-xl" loading="lazy" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#191970] text-white flex items-center justify-center text-sm font-bold -mt-5 mb-3 shadow-md relative z-10 border-4 border-white">
                {step.id}
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed pb-8 px-5">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}