interface CoreLayoutProps {
	children: React.ReactNode;
}

export default function CoreLayout({ children }: CoreLayoutProps) {
	return (
		<main className="flex-1 min-h-0 w-full relative">
			{children}
		</main>
	);
}