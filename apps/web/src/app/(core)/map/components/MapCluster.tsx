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
      className="cluster-marker cursor-pointer transform hover:scale-110 transition-all duration-200"
      onClick={(e) => {
        e.stopPropagation();
        onClick(cluster.experiences);
      }}
    >
      <div className="relative drop-shadow-lg w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-2xl bg-gray-700">
        <div className="text-white font-bold text-sm">{cluster.count}</div>
      </div>
    </div>
  );
}
