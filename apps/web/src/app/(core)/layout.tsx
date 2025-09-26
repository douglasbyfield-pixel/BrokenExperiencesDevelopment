interface CoreLayoutProps {
	children: React.ReactNode;
}

export default function CoreLayout({ children }: CoreLayoutProps) {
	return <main className="relative min-h-0 w-full flex-1">{children}</main>;
}
