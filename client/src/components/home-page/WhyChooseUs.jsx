import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiDollarSign, FiBookOpen, FiShield } from 'react-icons/fi';

const features = [
  { icon: <FiMapPin size={24} />,     title: 'Rent Tools Locally',  desc: 'Access quality tools when you need them without the cost of ownership'          },
  { icon: <FiDollarSign size={24} />, title: 'Earn from Your Tools', desc: 'Make money from tools sitting idle in your garage'                               },
  { icon: <FiBookOpen size={24} />,   title: 'Learn New Skills',     desc: 'Get expert guidance with optional skill-sharing sessions'                         },
  { icon: <FiShield size={24} />,     title: 'Safe & Secure',        desc: 'OTP verification, digital contracts, and trust scores ensure safe rentals'        },
];

const asymmetricRadius = '120px 16px 120px 16px';

const anchorRest  = { x: 20, y: 20, transition: { type: 'spring', stiffness: 260, damping: 22 } };
const anchorHover = { x: 26, y: 26, transition: { type: 'spring', stiffness: 260, damping: 22 } };

export default function WhyChooseUs() {
  return (
    <section id="features" className="pt-8 md:pt-12 pb-8 md:pb-12 bg-[#ECEFF1] px-4 overflow-x-clip">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900">Why Choose SkillLabz?</h2>
          <div className="w-16 h-1 bg-[#191970] mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left: Feature list ── */}
          <div className="flex flex-col gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="flex items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
                initial={{ opacity: 0, y: 10, scale: 0.995 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -3, scale: 1.008 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.24, ease: 'easeOut', delay: i * 0.03 }}
              >
                <div className="shrink-0 w-16 h-16 flex items-center justify-center bg-[#191970] rounded-xl text-white mr-6 shadow-md">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Right: Asymmetric image frame ── */}
          <motion.div className="flex justify-center lg:justify-end" initial="rest" whileHover="hover">
            <div className="relative pb-8 pr-8">
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 bg-[#191970]"
                style={{ borderRadius: asymmetricRadius }}
                variants={{ rest: anchorRest, hover: anchorHover }}
              />
              <div
                className="relative z-10 p-1.5 bg-white shadow-[0_30px_90px_rgba(0,102,255,0.30)]"
                style={{ borderRadius: asymmetricRadius }}
              >
                <div
                  className="overflow-hidden"
                  style={{
                    borderRadius: `calc(${asymmetricRadius.split(' ')[0]} - 6px) calc(${asymmetricRadius.split(' ')[1]} - 6px) calc(${asymmetricRadius.split(' ')[2]} - 6px) calc(${asymmetricRadius.split(' ')[3]} - 6px)`,
                  }}
                >
                  <img
                    src="/home page/why choose us.png"
                    alt="Why Choose SkillLabz"
                    className="w-full h-auto object-cover block"
                    style={{ maxWidth: '480px' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}