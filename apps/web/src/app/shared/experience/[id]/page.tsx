import { notFound } from "next/navigation";
import { eden } from "@web/lib/eden";
import SharedExperienceClient from "./shared-experience-client";

interface SharedExperiencePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SharedExperiencePage({ params }: SharedExperiencePageProps) {
  const { id } = await params;
  try {
    // Fetch the experience data from the main experience API
    const response = await eden.experience.get({ $query: { limit: 100 } });
    
    if (!response.data || !Array.isArray(response.data)) {
      notFound();
    }

    // Find the specific experience by ID
    const experience = response.data.find(exp => exp.id === id);
    
    if (!experience) {
      notFound();
    }

    const formatRelativeTime = (date: string) => {
      const now = new Date();
      const experienceDate = new Date(date);
      const diffInSeconds = Math.floor((now.getTime() - experienceDate.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return experienceDate.toLocaleDateString();
    };

    const displayName = experience.reportedBy?.name || experience.reportedBy?.email?.split('@')[0] || "Anonymous";

    return (
      <SharedExperienceClient 
        experience={experience}
        displayName={displayName}
        formatRelativeTime={formatRelativeTime}
      />
    );
  } catch (error) {
    console.error("Error fetching shared experience:", error);
    notFound();
  }
}
