import React, { useEffect, useState } from 'react';
import { dummyTestimonial } from '../../assets/assets';

const getUserDetails = (testimonial) => {
  return {
    name: testimonial.name,
    role: testimonial.role,
    image: testimonial.image,
  };
};

const Testimonials = () => {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, []);

  if (!dummyTestimonial || dummyTestimonial.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center bg-green-50">
        <h1 className="text-4xl font-bold mb-4 text-green-900">Testimonials</h1>
        <p className="mb-8 text-lg text-green-700">No testimonials available at this time.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 bg-green-50">
      <h1 className="text-4xl font-bold mb-4 text-green-900">Testimonials</h1>
      <p className="mb-8 text-lg text-green-700">See what our learners have to say about their experience with our platform.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {dummyTestimonial.map((testimonial, idx) => {
          const userDetails = getUserDetails(testimonial);
          return (
            <div key={idx} id={`testimonial-${idx}`} className="border border-green-200 rounded-lg p-6 bg-white shadow relative">
              <div className="flex items-center gap-4 mb-4">
                <img src={testimonial.image || require('../../assets/user_icon.svg')} alt={testimonial.name} className="w-14 h-14 rounded-full" />
                <div>
                  <h2 className="text-xl font-semibold text-green-900">{testimonial.name}</h2>
                  <p className="text-green-700">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(testimonial.rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                ))}
              </div>
              <p className="text-green-700 line-clamp-3">{testimonial.feedback}</p>
              <button
                className="text-green-700 underline mt-2 text-sm"
                onClick={() => setSelected(idx)}
              >
                Read more
              </button>
              {selected === idx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg p-8 max-w-md w-full relative shadow-lg">
                    <button className="absolute top-2 right-3 text-gray-500 text-xl" onClick={() => setSelected(null)}>&times;</button>
                    <div className="flex items-center gap-4 mb-4">
                      <img src={testimonial.image || require('../../assets/user_icon.svg')} alt={testimonial.name} className="w-16 h-16 rounded-full" />
                      <div>
                        <h2 className="text-2xl font-bold text-green-900">{testimonial.name}</h2>
                        <p className="text-green-700">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(testimonial.rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                    <p className="text-green-700 mb-4">{testimonial.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Testimonials;
