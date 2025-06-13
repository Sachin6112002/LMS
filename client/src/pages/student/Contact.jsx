import React from 'react';

const Contact = () => (
  <div className="max-w-2xl mx-auto py-16 px-4">
    <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
    <p className="mb-4 text-lg text-gray-700">Have questions or need support? Reach out to us!</p>
    <form className="flex flex-col gap-4 bg-white p-6 rounded shadow">
      <input type="text" placeholder="Your Name" className="border px-3 py-2 rounded" required />
      <input type="email" placeholder="Your Email" className="border px-3 py-2 rounded" required />
      <textarea placeholder="Your Message" className="border px-3 py-2 rounded" rows={5} required />
      <button type="submit" className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Send Message</button>
    </form>
    <div className="mt-8 text-gray-600">
      <p>Email: <a href="mailto:support@lms.com" className="text-blue-600 underline">support@lms.com</a></p>
      <p>Phone: <a href="tel:+1234567890" className="text-blue-600 underline">+1 234 567 890</a></p>
    </div>
  </div>
);

export default Contact;
