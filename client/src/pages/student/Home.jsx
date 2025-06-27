import React from 'react';
import Footer from '../../components/student/Footer';
import Hero from '../../components/student/Hero';
import Companies from '../../components/student/Companies';
import CoursesSection from '../../components/student/CoursesSection';
import CallToAction from '../../components/student/CallToAction';
import TestimonialsSection from '../../components/student/TestimonialSection';
import PendingPurchases from '../../components/student/PendingPurchases';

const Home = () => {

  return (
    <div className="min-h-screen flex flex-col items-center space-y-7 text-center bg-green-50">
      <Hero />
      <div className="w-full max-w-6xl px-4">
        <PendingPurchases />
      </div>
      <Companies />
      <CoursesSection />
      <TestimonialsSection />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Home;
