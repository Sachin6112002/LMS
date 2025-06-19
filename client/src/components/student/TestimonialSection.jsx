import React, { useState } from 'react';
import { assets, dummyTestimonial } from '../../assets/assets';

const TestimonialsSection = () => {
	const [selected, setSelected] = useState(null);

	if (!dummyTestimonial || dummyTestimonial.length === 0) {
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
		const t = dummyTestimonial[selected];
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
							src={t.image || assets.user_icon}
							alt={t.name}
							className="w-16 h-16 rounded-full border-2 border-green-400"
						/>
						<div>
							<h2 className="text-2xl font-bold flex items-center gap-2">
								{t.name}
							</h2>
							<p className="text-gray-500">{t.role}</p>
						</div>
					</div>
					<div className="flex gap-1 items-center mb-1">
						{[...Array(5)].map((_, i) => (
							<span
								key={i}
								className={
									i < Math.floor(t.rating)
										? 'text-yellow-400 text-lg'
										: 'text-gray-300 text-lg'
								}
							>
								★
							</span>
						))}
						<span className="ml-2 text-gray-500 text-sm">
							({t.rating}/5)
						</span>
					</div>
					<p className="text-gray-700 mb-2">{t.feedback}</p>
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
						{dummyTestimonial.map((t, index) => (
							<div
								key={index}
								className="text-sm text-left border border-gray-500/30 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden"
								id={`testimonial-${index}`}
							>
								<div className="flex items-center gap-4 px-5 py-4 bg-gray-500/10">
									<img
										className="h-12 w-12 rounded-full"
										src={t.image || assets.user_icon}
										alt={t.name}
									/>
									<div>
										<h1 className="text-lg font-medium text-gray-800 flex items-center gap-2">
											{t.name}
										</h1>
										<p className="text-gray-800/80">{t.role}</p>
									</div>
								</div>
								<div className="p-5 pb-7">
									<div className="flex gap-0.5 mb-2">
										{[...Array(5)].map((_, i) => (
											<span
												key={i}
												className={
													i < Math.floor(t.rating)
														? 'text-yellow-400'
														: 'text-gray-300'
												}
											>
												★
											</span>
										))}
										<span className="ml-2 text-gray-500 text-xs">
											({t.rating}/5)
										</span>
									</div>
									<p className="text-gray-500 mt-2 line-clamp-3">
										{t.feedback}
									</p>
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
