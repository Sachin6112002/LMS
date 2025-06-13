import React, { useEffect, useState } from 'react';
import { dummyTestimonial, dummyDashboardData } from '../../assets/assets';

const getCourseInfo = (testimonial) => {
  // Try to find a matching course for the testimonial's user
  const enrolled = dummyDashboardData.enrolledStudentsData.find(
    (item) => item.student.name === testimonial.name
  );
  return enrolled || null;
};

const getUserDetails = (testimonial) => {
  // Example: You could extend this to fetch more user details if available
  // For now, just return the testimonial fields
  return {
    name: testimonial.name,
    role: testimonial.role,
    image: testimonial.image,
    // Add more fields if available
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

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-4">Testimonials</h1>
      <p className="mb-8 text-lg text-gray-700">See what our learners have to say about their experience with our platform.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {dummyTestimonial.map((testimonial, idx) => {
          const courseInfo = getCourseInfo(testimonial);
          const userDetails = getUserDetails(testimonial);
          return (
            <div key={idx} id={`testimonial-${idx}`} className="border rounded-lg p-6 bg-white shadow relative">
              <div className="flex items-center gap-4 mb-4">
                <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full" />
                <div>
                  <h2 className="text-xl font-semibold">{testimonial.name}</h2>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(testimonial.rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                ))}
              </div>
              <p className="text-gray-700 line-clamp-3">{testimonial.feedback}</p>
              <button
                className="text-blue-600 underline mt-2 text-sm"
                onClick={() => setSelected(idx)}
              >
                Read more
              </button>
              {selected === idx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg p-8 max-w-md w-full relative shadow-lg">
                    <button className="absolute top-2 right-3 text-gray-500 text-xl" onClick={() => setSelected(null)}>&times;</button>
                    <div className="flex items-center gap-4 mb-4">
                      <img src={userDetails.image} alt={userDetails.name} className="w-16 h-16 rounded-full" />
                      <div>
                        <h2 className="text-2xl font-bold">{userDetails.name}</h2>
                        <p className="text-gray-500">{userDetails.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(testimonial.rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4">{testimonial.feedback}</p>
                    {courseInfo && (
                      <div className="bg-gray-50 rounded p-3 mb-2">
                        <div className="font-semibold text-gray-800">Course: {courseInfo.courseTitle}</div>
                        <div className="text-gray-600 text-sm">Student: {courseInfo.student.name}</div>
                        {/* You can add more course/user details here if available */}
                      </div>
                    )}
                    {/* Example extra user details */}
                    <div className="mt-4 text-gray-600 text-sm">
                      <div><span className="font-semibold">Email:</span> user@example.com</div>
                      <div><span className="font-semibold">Joined:</span> Jan 2024</div>
                      {/* Add more fields if you have them in your data */}
                    </div>
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
