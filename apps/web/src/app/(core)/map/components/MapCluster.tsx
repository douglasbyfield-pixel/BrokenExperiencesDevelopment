interface MapClusterProps {
	cluster: {
		count: number;
		experiences: any[];
	};
	onClick: (experiences: any[]) => void;
}

export function MapCluster({ cluster, onClick }: MapClusterProps) {
	return (
		<div
			className="cluster-marker transform cursor-pointer transition-all duration-200 hover:scale-110"
			onClick={(e) => {
				e.stopPropagation();
				onClick(cluster.experiences);
			}}
		>
			<div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-gray-700 shadow-2xl drop-shadow-lg">
				<div className="font-bold text-sm text-white">{cluster.count}</div>
			</div>
		</div>
	);
}
