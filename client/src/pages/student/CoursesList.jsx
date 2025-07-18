import React, { useContext, useEffect, useState } from 'react'
import Footer from '../../components/student/Footer'
import { assets } from '../../assets/assets'
import CourseCard from '../../components/student/CourseCard';
import { AppContext } from '../../context/AppContext';
import { useParams } from 'react-router-dom';
import SearchBar from '../../components/student/SearchBar';

const CoursesList = () => {

    const { input } = useParams()

    const { courses, navigate } = useContext(AppContext)

    const [filteredCourse, setFilteredCourse] = useState([])

    useEffect(() => {
        if (Array.isArray(courses) && courses.length > 0) {
            const tempCourses = courses.slice()
            input
                ? setFilteredCourse(
                    tempCourses.filter(
                        item => (item.title || '').toLowerCase().includes((input || '').toLowerCase())
                    )
                )
                : setFilteredCourse(tempCourses)
        } else {
            setFilteredCourse([])
        }
    }, [courses, input])

    return (
        <>
            <div className="relative md:px-36 px-8 pt-20 text-left bg-green-50 min-h-screen">
                <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full'>
                    <div>
                        <h1 className='text-4xl font-semibold text-green-900'>Course List</h1>
                        <p className='text-green-700'><span onClick={() => navigate('/')} className='text-green-600 hover:underline cursor-pointer'>Home</span> / <span>Course List</span></p>
                    </div>
                    <SearchBar data={input} />
                </div>
                {input && <div className='inline-flex items-center gap-4 px-4 py-2 border border-green-200 mt-8 -mb-8 text-green-700 bg-white rounded'>
                    <p>{input}</p>
                    <img onClick={() => navigate('/course-list')} className='cursor-pointer' src={assets.cross_icon} alt="" />
                </div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0">
                    {(filteredCourse || []).map((course, index) => <CourseCard key={index} course={course} />)}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CoursesList