import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { formatDuration } from '../../utils/formatDuration';

const CourseCard = ({ course }) => {
  const { currency } = useContext(AppContext);
  // Defensive: ensure course is valid
  if (!course || typeof course !== 'object' || !course._id) {
    return null;
  }
  
  // Safe calculation of chapters and lectures
  const chaptersCount = Array.isArray(course.chapters) ? course.chapters.length : 0;
  const lecturesCount = Array.isArray(course.chapters) 
    ? course.chapters.reduce((acc, ch) => acc + (Array.isArray(ch?.lectures) ? ch.lectures.length : 0), 0)
    : 0;
  // Price logic
  const price = course.price || course.coursePrice || 0;
  const discount = course.discount || 0;
  const discountedPrice = price - (price * discount / 100);
  // Calculate total duration in seconds
  let totalSeconds = 0;
  if (Array.isArray(course.chapters)) {
    course.chapters.forEach(ch => {
      if (Array.isArray(ch.lectures)) {
        ch.lectures.forEach(lec => {
          if (lec && typeof lec.duration === 'number') totalSeconds += lec.duration;
        });
      }
    });
  }
  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      to={'/course/' + course._id}
      className="border border-green-200 pb-6 overflow-hidden rounded-lg bg-white shadow-sm transition-transform duration-200 hover:scale-[1.02] flex flex-col h-full"
    >
      <img
        className="w-full h-40 object-cover md:h-48 lg:h-56 xl:h-64 object-top rounded-t-lg"
        src={course.thumbnail || course.courseThumbnail}
        alt={course.title || course.courseTitle || 'Course Thumbnail'}
      />
      <div className="p-3 text-left flex flex-col flex-1">
        <h3 className="text-base font-semibold text-green-900 line-clamp-2">{course.title || course.courseTitle}</h3>
        <p className="text-green-700 text-sm truncate">Educator: {typeof course.createdBy === 'object' && course.createdBy?.name
          ? course.createdBy.name
          : (typeof course.createdBy === 'string' && course.createdBy.length > 0
              ? course.createdBy
              : 'Unknown Educator')}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
          <span className="text-green-600">Chapters: {chaptersCount}</span>
          <span className="text-green-600">Lectures: {lecturesCount}</span>
          <span className="text-green-600">Duration: {formatDuration(totalSeconds)}</span>
        </div>
        <p className="text-green-800 text-xs mt-2 line-clamp-3">
          {course.description
            ? (course.description.replace(/<[^>]+>/g, '').length > 80
                ? course.description.replace(/<[^>]+>/g, '').slice(0, 80) + '...'
                : course.description.replace(/<[^>]+>/g, ''))
            : 'No description available'}
        </p>
        <div className="mt-2 flex items-end flex-1">
          {discount > 0 && discountedPrice < price ? (
            <>
              <span className="text-lg font-bold text-green-700">{currency} {discountedPrice}</span>
              <span className="text-sm text-gray-500 line-through ml-2">{currency} {price}</span>
              <span className="ml-2 text-xs text-red-600 font-semibold">{discount}% OFF</span>
            </>
          ) : (
            <span className="text-lg font-bold text-green-700">{currency} {price}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;