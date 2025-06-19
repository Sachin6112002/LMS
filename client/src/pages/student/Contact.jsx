import React from 'react';

const Contact = () => (
  <div className="max-w-2xl mx-auto py-16 px-4 bg-green-50">
    <h1 className="text-4xl font-bold mb-4 text-green-900">Contact Us</h1>
    <p className="mb-4 text-lg text-green-700">Have questions or need support? Reach out to us!</p>
    <form className="flex flex-col gap-4 bg-white p-6 rounded shadow border border-green-200">
      <input type="text" placeholder="Your Name" className="border border-green-200 px-3 py-2 rounded text-green-900 placeholder-green-600" required />
      <input type="email" placeholder="Your Email" className="border border-green-200 px-3 py-2 rounded text-green-900 placeholder-green-600" required />
      <textarea placeholder="Your Message" className="border border-green-200 px-3 py-2 rounded text-green-900 placeholder-green-600" rows={5} required />
      <button type="submit" className="bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600 transition">Send Message</button>
    </form>
    <div className="mt-8 text-green-700">
      <p>Email: <a href="mailto:support@lms.com" className="text-green-700 underline">support@lms.com</a></p>
      <p>Phone: <a href="tel:+1234567890" className="text-green-700 underline">+1 234 567 890</a></p>
    </div>
  </div>
);

export default Contact;
