interface LoginLayoutProps {
	children: React.ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
	return <div className="h-dvh w-full">{children}</div>;
}
