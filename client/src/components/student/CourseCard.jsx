import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext);

  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      to={'/course/' + course._id}
      className="border border-green-200 pb-6 overflow-hidden rounded-lg bg-white"
    >
      <img className="w-full" src={course.courseThumbnail} alt="" />
      <div className="p-3 text-left">
        <h3 className="text-base font-semibold text-green-900">{course.courseTitle}</h3>
        <p className="text-green-700">{course.educator?.name || 'Unknown Educator'}</p>
        <div className="flex items-center space-x-2">
          <p className="text-green-600">{calculateRating(course)}</p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                className="w-3.5 h-3.5"
                src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank}
                alt=""
              />
            ))}
          </div>
          <p className="text-green-700">({course.courseRatings.length})</p>
        </div>
        <p className="text-base font-semibold text-green-800">
          {currency}
          {(course.coursePrice - (course.discount * course.coursePrice) / 100).toFixed(2)}
        </p>
      </div>
    </Link>
  );
};

export default CourseCard;