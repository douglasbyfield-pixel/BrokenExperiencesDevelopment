export default function LoginLayout(props: LayoutProps<'/login'>) {
	return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row">
        {/* Left side - Branding (hidden on mobile, visible on desktop) */}
        <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-center items-center p-12 text-white">
            <div className="max-w-md text-center">
                <div className="w-24 h-24 mx-auto mb-8 bg-white rounded-3xl flex items-center justify-center p-4">
                    <img src="/favicon/be-logoimage.png" alt="Broken Experiences" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Welcome to Broken Experiences</h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                    Share your stories, discover new perspectives, and connect with others through authentic experiences.
                </p>
                <div className="mt-12 space-y-4 text-left">
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <span className="text-gray-300">Share authentic experiences</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <span className="text-gray-300">Connect with community</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <span className="text-gray-300">Discover new perspectives</span>
                    </div>
                </div>
            </div>
        </div>
        {props.children}
        </div>
    );
}