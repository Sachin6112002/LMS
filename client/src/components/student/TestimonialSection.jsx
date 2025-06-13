import React, { useState } from 'react';
import { assets, dummyTestimonial } from '../../assets/assets';

// Example extended testimonial data (replace with real data structure if available)
const extendedTestimonialData = [
  {
    name: 'Donald Jackman',
    course: 'React.js for Beginners',
    institution: 'ABC University, Batch 2025',
    profilePhoto: assets.profile_img_1,
    badge: 'Top Learner',
    feedback: {
      experience: 'The course was well-structured and easy to follow.',
      teaching: 'The instructor explained every concept clearly with examples.',
      outcome: 'I built a real project and gained confidence in coding.',
      goal: 'I cracked my internship interview using what I learned here.'
    },
    rating: {
      overall: 5,
      content: 5,
      instructor: 5,
      ux: 4
    },
    date: '2025-06-01',
    permission: true
  },
  {
    name: 'Richard Nelson',
    course: 'Advanced Python Programming',
    institution: 'XYZ College, Batch 2024',
    profilePhoto: assets.profile_img_2,
    badge: 'Verified Graduate',
    feedback: {
      experience: 'Challenging but rewarding course.',
      teaching: 'Supportive instructor and great resources.',
      outcome: 'Now I can automate tasks at work.',
      goal: 'Helped me get a promotion.'
    },
    rating: {
      overall: 4,
      content: 4,
      instructor: 5,
      ux: 4
    },
    date: '2025-05-15',
    permission: true
  },
  {
    name: 'James Washington',
    course: 'Web Development Bootcamp',
    institution: 'LMN Institute, Batch 2023',
    profilePhoto: assets.profile_img_3,
    badge: '',
    feedback: {
      experience: 'Perfect for beginners.',
      teaching: 'Step-by-step guidance throughout.',
      outcome: 'Built my first website!',
      goal: 'Started freelancing after this course.'
    },
    rating: {
      overall: 4.5,
      content: 5,
      instructor: 4,
      ux: 4
    },
    date: '2025-04-20',
    permission: true
  }
];

const TestimonialsSection = () => {
  const [selected, setSelected] = useState(null);

  if (selected !== null) {
    const t = extendedTestimonialData[selected];
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-white rounded-lg p-8 max-w-md w-full relative shadow-lg border">
          <button className="absolute top-2 right-3 text-gray-500 text-xl" onClick={() => setSelected(null)}>&times;</button>
          <div className="flex items-center gap-4 mb-4">
            <img src={t.profilePhoto} alt={t.name} className="w-16 h-16 rounded-full border-2 border-blue-400" />
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">{t.name} {t.badge && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full ml-2">{t.badge}</span>}</h2>
              <p className="text-gray-500">{t.institution}</p>
              <p className="text-blue-700 font-medium">{t.course}</p>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex gap-1 items-center mb-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(t.rating.overall) ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}>★</span>
              ))}
              <span className="ml-2 text-gray-500 text-sm">({t.rating.overall}/5)</span>
            </div>
            <div className="flex gap-2 text-xs text-gray-600 mb-2">
              <span>Content: {t.rating.content}/5</span>
              <span>Instructor: {t.rating.instructor}/5</span>
              <span>UX: {t.rating.ux}/5</span>
            </div>
            <div className="text-gray-700 text-sm mb-2"><b>Experience:</b> {t.feedback.experience}</div>
            <div className="text-gray-700 text-sm mb-2"><b>Teaching:</b> {t.feedback.teaching}</div>
            <div className="text-gray-700 text-sm mb-2"><b>Learning Outcome:</b> {t.feedback.outcome}</div>
            <div className="text-gray-700 text-sm mb-2"><b>Achieved Goal:</b> {t.feedback.goal}</div>
            <div className="text-gray-400 text-xs mt-4">Testimonial Date: {t.date}</div>
            {t.permission && <div className="text-green-600 text-xs mt-1">Permission to publish: Yes</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-14 px-8 md:px-0">
      <h2 className="text-3xl font-medium text-gray-800">Testimonials</h2>
      <p className="md:text-base text-gray-500 mt-3">
        Hear from our learners as they share their journeys of transformation, success, and how our <br /> platform has made a difference in their lives.
      </p>
      <div className="grid grid-cols-auto gap-8 mt-14">
        {extendedTestimonialData.map((t, index) => (
          <div
            key={index}
            className="text-sm text-left border border-gray-500/30 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden"
            id={`testimonial-${index}`}
          >
            <div className="flex items-center gap-4 px-5 py-4 bg-gray-500/10">
              <img className="h-12 w-12 rounded-full" src={t.profilePhoto} alt={t.name} />
              <div>
                <h1 className="text-lg font-medium text-gray-800 flex items-center gap-2">{t.name} {t.badge && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full ml-2">{t.badge}</span>}</h1>
                <p className="text-gray-800/80">{t.institution}</p>
                <p className="text-blue-700 font-medium">{t.course}</p>
              </div>
            </div>
            <div className="p-5 pb-7">
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(t.rating.overall) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                ))}
                <span className="ml-2 text-gray-500 text-xs">({t.rating.overall}/5)</span>
              </div>
              <p className="text-gray-500 mt-2 line-clamp-3">{t.feedback.experience}</p>
            </div>
            <button
              className="text-blue-500 underline px-5"
              onClick={() => setSelected(index)}
            >
              Read more
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
