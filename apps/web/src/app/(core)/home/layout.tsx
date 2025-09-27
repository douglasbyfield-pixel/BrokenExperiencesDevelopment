import LeftSidebar from "./features/left-sidebar";
import RightSidebar from "./features/right-sidebar";

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-dvh bg-black">
            <div className="container mx-auto flex text-white">
                <LeftSidebar />
                {children}
                <RightSidebar className="hidden lg:block" />
            </div>
        </div>
    );
}   