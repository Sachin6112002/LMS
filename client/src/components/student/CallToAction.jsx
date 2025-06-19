import React from 'react'
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets'

const CallToAction = () => {
  const navigate = useNavigate();
  return (
    <div className='flex flex-col items-center gap-4 pt-10 pb-24 px-8 md:px-0'>
      <h1 className='md:text-4xl text-xl text-green-900 font-semibold'>Learn anything, anytime, anywhere</h1>
      <p className='text-green-700 sm:text-sm'>Incididunt sint fugiat pariatur cupidatat consectetur sit cillum anim id veniam aliqua proident excepteur commodo do ea.</p>
      <div className='flex items-center font-medium gap-6 mt-4'>
        <button className='px-10 py-3 rounded-md text-white bg-green-500 hover:bg-green-600' onClick={() => navigate('/course-list')}>Get started</button>
        <button className='flex items-center gap-2 text-green-600' onClick={() => navigate('/about')}>
          Learn more
          <img src={assets.arrow_icon} alt="arrow_icon" />
        </button>
      </div>
    </div>
  )
}

export default CallToAction