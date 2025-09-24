'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';

interface CoreLayoutProps {
	children: React.ReactNode;
}

export default function CoreLayout({ children }: CoreLayoutProps) {
	const pathname = usePathname();
	const isMapPage = pathname === '/map';

	if (isMapPage) {
		// Map page gets full screen without header
		return (
			<div className="h-dvh w-full">
				{children}
			</div>
		);
	}

	// Other pages get the header
	return (
		<div className="flex flex-col h-dvh w-full">
			<Header />
			<main className="flex-1 min-h-0 w-full relative">
				{children}
			</main>
		</div>
	);
}