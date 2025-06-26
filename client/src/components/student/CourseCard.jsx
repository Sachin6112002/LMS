import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      to={'/course/' + course._id}
      className="border border-green-200 pb-6 overflow-hidden rounded-lg bg-white"
    >
      <img className="w-full" src={course.thumbnail} alt={course.title || 'Course Thumbnail'} />
      <div className="p-3 text-left">
        <h3 className="text-base font-semibold text-green-900">{course.title}</h3>
        <p className="text-green-700">
          {typeof course.createdBy === 'object' && course.createdBy?.name
            ? course.createdBy.name
            : (typeof course.createdBy === 'string' && course.createdBy.length > 0
                ? 'Educator'
                : 'Unknown Educator')}
        </p>
        <div className="flex items-center space-x-2">
          <p className="text-green-600">Chapters: {(course.chapters?.length || 0)}</p>
          <p className="text-green-600">Lectures: {(course.lectures?.length || 0)}</p>
        </div>
        <p className="text-green-800 text-sm mt-2">{course.description}</p>
      </div>
    </Link>
  );
};

export default CourseCard;