import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { assets } from '../../assets/assets';

// Use Vite backend URL for production, fallback to localhost for development
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const TestimonialsSection = () => {
	const [selected, setSelected] = useState(null);
	const [testimonials, setTestimonials] = useState([]);

	useEffect(() => {
		const fetchTestimonials = async () => {
			try {
				const res = await axios.get(`${backendUrl}/api/testimonials`);
				setTestimonials(res.data.testimonials || []);
			} catch (err) {
				setTestimonials([]);
			}
		};
		fetchTestimonials();
	}, []);

	if (!testimonials || testimonials.length === 0) {
		return (
			<section className="bg-green-50 py-16 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl font-bold text-green-900 mb-8">
						What our learners say
					</h2>
					<p className="text-gray-500">No testimonials available at this time.</p>
				</div>
			</section>
		);
	}

	if (selected !== null) {
		const t = testimonials[selected];
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<div className="bg-white rounded-lg p-8 max-w-md w-full relative shadow-lg border">
					<button
						className="absolute top-2 right-3 text-gray-500 text-xl"
						onClick={() => setSelected(null)}
					>
						&times;
					</button>
					<div className="flex items-center gap-4 mb-4">
						<img
							src={typeof t.profilePhoto === 'string' ? t.profilePhoto : assets.user_icon}
							alt={t.name}
							className="w-16 h-16 rounded-full border-2 border-green-400"
						/>
						<div>
							<h2 className="text-2xl font-bold flex items-center gap-2">
								{t.name}
								{t.badge && <span className="ml-2 bg-green-200 text-green-800 px-2 py-1 rounded text-xs">{t.badge}</span>}
							</h2>
							<p className="text-gray-500">{t.course}</p>
							{t.institution && <p className="text-gray-500">Institution: {t.institution}</p>}
						</div>
					</div>
					<div className="flex flex-wrap gap-2 mb-2">
						<span className="text-green-800 text-sm">Overall: {t.rating?.overall}</span>
						<span className="text-green-800 text-sm">Content: {t.rating?.content}</span>
						<span className="text-green-800 text-sm">Instructor: {t.rating?.instructor}</span>
						<span className="text-green-800 text-sm">UI/UX: {t.rating?.ux}</span>
					</div>
					<div className="mb-2">
						<span className="font-semibold">Experience:</span> {t.feedback?.experience}<br />
						<span className="font-semibold">Teaching:</span> {t.feedback?.teaching}<br />
						<span className="font-semibold">Outcome:</span> {t.feedback?.outcome}<br />
						<span className="font-semibold">Goal:</span> {t.feedback?.goal}
					</div>
					{t.date && <div className="text-green-700 text-xs mb-2">Date: {t.date}</div>}
					
				</div>
			</div>
		);
	}

	return (
		<section className="bg-green-50 py-16 px-4">
			<div className="max-w-4xl mx-auto">
				<h2 className="text-3xl font-bold text-green-900 mb-8">
					What our learners say
				</h2>
				<div className="pb-14 px-8 md:px-0">
					<p className="md:text-base text-gray-500 mt-3">
						Hear from our learners as they share their journeys of
						transformation, success, and how our <br /> platform has made a
						difference in their lives.
					</p>
					<div className="grid grid-cols-auto gap-8 mt-14">
						{testimonials.map((t, index) => (
							<div
								key={t._id || index}
								className="text-sm text-left border border-gray-500/30 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden"
								id={`testimonial-${index}`}
							>
								<div className="flex items-center gap-4 px-5 py-4 bg-gray-500/10">
									<img
										className="h-12 w-12 rounded-full"
										src={typeof t.profilePhoto === 'string' ? t.profilePhoto : assets.user_icon}
										alt={t.name}
									/>
									<div>
										<h1 className="text-lg font-medium text-gray-800 flex items-center gap-2">
											{t.name}
										</h1>
										<p className="text-gray-800/80">{t.course}</p>
									</div>
								</div>
								<div className="p-5 pb-7">
									<div className="flex gap-0.5 mb-2">
										{[...Array(5)].map((_, i) => (
											<span
												key={i}
												className={
													i < Math.floor(t.rating?.overall || 0)
														? 'text-yellow-400'
														: 'text-gray-300'
												}
											>
												★
											</span>
										))}
										<span className="ml-2 text-gray-500 text-xs">
											({t.rating?.overall || 0}/5)
										</span>
									</div>
									<div className="mb-2">
										<span className="font-semibold">Experience:</span> {t.feedback?.experience}<br />
										<span className="font-semibold">Teaching:</span> {t.feedback?.teaching}<br />
										<span className="font-semibold">Outcome:</span> {t.feedback?.outcome}<br />
										<span className="font-semibold">Goal:</span> {t.feedback?.goal}
									</div>
								</div>
								<button
									className="text-green-700 underline px-5"
									onClick={() => setSelected(index)}
								>
									Read more
								</button>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default TestimonialsSection;
