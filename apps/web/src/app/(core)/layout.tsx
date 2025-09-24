import Header from "@/components/header";

export default function CoreLayout(props: LayoutProps<'/'>) {
	return <div>
        <Header />
        {props.children}
    </div>;
}