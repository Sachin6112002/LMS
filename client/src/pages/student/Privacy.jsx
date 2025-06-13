import React from 'react';

const Privacy = () => (
  <div className="max-w-3xl mx-auto py-16 px-4">
    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
    <p className="mb-4 text-lg text-gray-700">Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use our platform.</p>
    <h2 className="text-2xl font-semibold mt-8 mb-2">Information We Collect</h2>
    <ul className="list-disc ml-6 text-gray-600">
      <li>Personal details (name, email, etc.)</li>
      <li>Course progress and activity</li>
      <li>Payment and transaction data</li>
    </ul>
    <h2 className="text-2xl font-semibold mt-8 mb-2">How We Use Your Information</h2>
    <ul className="list-disc ml-6 text-gray-600">
      <li>To provide and improve our services</li>
      <li>To communicate with you</li>
      <li>To ensure platform security</li>
    </ul>
    <p className="mt-8">For more details, please contact us at <a href="mailto:support@lms.com" className="text-blue-600 underline">support@lms.com</a>.</p>
  </div>
);

export default Privacy;
