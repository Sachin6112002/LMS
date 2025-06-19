import React from 'react'
import { assets } from '../../assets/assets'
import SearchBar from './SearchBar'



const Hero = () => {
  return (
   <div className='flex lg:flex-row flex-col items-center p-8 bg-green-50'>
     <div className='flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center pb-2 '>
      <h1 className='md:text-home-heading-large text-home-heading-small relative font-bold text-green-900 max-w-3xl mx-auto'>Your learning journey starts here. Explore courses designed to <span className =' bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent'>  inspire and empower.
        </span><img src={assets.sketch} alt="sketch" className='md:block hidden absolute -bottom-7 right-0'/> </h1>
 <p className='md:block hidden text-green-800 max-w-2xl mx-auto text-lg'>We bring together world-class instructors, interactive content, and a supprotive community to help you achieve your personal and professional goals. </p>
 <p className='md:hidden text-green-700 max-w-sm mx-auto'>We bring together world-class instructor to help you achieve your personal and professional goals.</p>
 <SearchBar/>
    </div>
    <div className= 'flex flex-col justify-center items-center'>
      <img src={assets.hero} alt="" className=' w-65 lg:w-88 bg-transparent pt-10' /><label htmlFor=""></label>
    </div>
   </div>
  )
}

export default Hero