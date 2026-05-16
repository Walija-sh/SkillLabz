import React from 'react';
import { useSelector } from 'react-redux';
import {
  HeroSection,
  HowItWorks,
  WhyChooseUs,
  PopularCategories,
  TrustAndSafety,
  FinalCTA,
} from '../components/home-page';

export default function Home() {
  const isLoggedIn = useSelector((state) => state.auth.status);

  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <HowItWorks />
      <WhyChooseUs />
      <PopularCategories />
      <TrustAndSafety />
      {!isLoggedIn && <FinalCTA />}
    </div>
  );
}