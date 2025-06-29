import React from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-green-900 md:px-36 text-left w-full mt-10">
      <div className="flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-green-200">

        <div className="flex flex-col md:items-start items-center w-full">
          <img src={assets.logo} alt="logo" />
          <p className="mt-6 text-center md:text-left text-sm text-green-200">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.
          </p>
        </div>

        <div className="flex flex-col md:items-start items-center w-full">
          <h2 className="font-semibold text-green-100 mb-5">Company</h2>
          <ul className="flex md:flex-col w-full justify-between text-sm text-green-200 md:space-y-2">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/contact">Contact us</Link></li>
            <li><Link to="/privacy">Privacy policy</Link></li>
          </ul>
        </div>

        <div className="hidden md:flex flex-col items-start w-full">
          <h2 className="font-semibold text-green-100 mb-5">Subscribe to our newsletter</h2>
          <p className="text-sm text-green-200">
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <div className="flex items-center gap-2 pt-4">
            <input className="border border-green-200 bg-green-50 text-green-900 placeholder-green-700 outline-none w-64 h-9 rounded px-2 text-sm" type="email" placeholder="Enter your email" />
            <button className="bg-green-500 hover:bg-green-600 w-24 h-9 text-white rounded" onClick={() => alert('Subscribed!')}>Subscribe</button>
          </div>
        </div>

      </div>
      <p className="py-4 text-center text-xs md:text-sm text-green-200">
        Copyright {new Date().getFullYear()} © eSiksha LMS. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
