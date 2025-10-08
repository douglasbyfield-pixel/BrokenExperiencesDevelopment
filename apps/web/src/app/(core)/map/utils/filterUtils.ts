// Filter utilities for map experiences
export const applyFilters = (
  experiences: any[], 
  activeFilters: {
    status: string[];
    priority: string[];
    category: string[];
  }, 
  searchQuery: string
) => {
  let filtered = [...experiences];
  
  // Apply status filters
  if (activeFilters.status.length > 0) {
    filtered = filtered.filter((experience) =>
      activeFilters.status.includes(experience.status),
    );
  }
  
  // Apply priority filters
  if (activeFilters.priority.length > 0) {
    filtered = filtered.filter((experience) =>
      activeFilters.priority.includes(experience.priority),
    );
  }
  
  // Apply category filters
  if (activeFilters.category.length > 0) {
    filtered = filtered.filter(
      (experience) =>
        experience.categoryId && activeFilters.category.includes(experience.categoryId),
    );
  }
  
  // Apply search query
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (experience) =>
        experience.title?.toLowerCase().includes(searchLower) ||
        experience.description?.toLowerCase().includes(searchLower) ||
        (experience.address && experience.address.toLowerCase().includes(searchLower)),
    );
  }
  
  return filtered;
};
