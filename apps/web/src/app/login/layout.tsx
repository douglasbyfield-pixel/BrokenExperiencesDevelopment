import Header from '@/components/header';

interface LoginLayoutProps {
	children: React.ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
	return (
		<div className="flex flex-col h-dvh w-full">
			<Header />
			<main className="flex-1 min-h-0 w-full relative">
				{children}
			</main>
		</div>
	);
}