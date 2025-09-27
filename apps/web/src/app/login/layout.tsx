export default function LoginLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col bg-white lg:flex-row">
			{/* Left side - Branding (hidden on mobile, visible on desktop) */}
			<div className="hidden flex-col items-center justify-center bg-black p-12 text-white lg:flex lg:w-1/2">
				<div className="max-w-md text-center">
					<div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white p-4">
						<img
							src="/favicon/be-logoimage.png"
							alt="Broken Experiences"
							className="h-full w-full object-contain"
						/>
					</div>
					<h1 className="mb-4 font-bold text-4xl">
						Welcome to Broken Experiences
					</h1>
					<p className="text-gray-300 text-xl leading-relaxed">
						Share your stories, discover new perspectives, and connect with
						others through authentic experiences.
					</p>
					<div className="mt-12 space-y-4 text-left">
						<div className="flex items-center space-x-3">
							<div className="h-2 w-2 rounded-full bg-white" />
							<span className="text-gray-300">Share authentic experiences</span>
						</div>
						<div className="flex items-center space-x-3">
							<div className="h-2 w-2 rounded-full bg-white" />
							<span className="text-gray-300">Connect with community</span>
						</div>
						<div className="flex items-center space-x-3">
							<div className="h-2 w-2 rounded-full bg-white" />
							<span className="text-gray-300">Discover new perspectives</span>
						</div>
					</div>
				</div>
			</div>
			{children}
		</div>
	);
}
