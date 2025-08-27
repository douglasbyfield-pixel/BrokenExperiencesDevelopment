export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  reportedBy: string;
  reportedAt: string;
  category: 'infrastructure' | 'safety' | 'environment' | 'maintenance' | 'accessibility';
  imageUrl?: string;
  upvotes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  issuesReported: number;
  issuesResolved: number;
  reputation: number;
  joinedAt: string;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Massive Pothole on Oak Street',
    description: 'Large pothole near intersection causing damage to vehicles. Water collects here during rain making it even more dangerous.',
    status: 'pending',
    priority: 'critical',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Oak Street, Downtown'
    },
    reportedBy: 'Sarah M.',
    reportedAt: '2025-01-20T14:30:00Z',
    category: 'infrastructure',
    upvotes: 23,
    comments: [
      {
        id: 'c1',
        text: 'I hit this yesterday! Damaged my tire.',
        author: 'Mike R.',
        createdAt: '2025-01-21T09:15:00Z'
      },
      {
        id: 'c2',
        text: 'City should prioritize this immediately.',
        author: 'Jennifer L.',
        createdAt: '2025-01-21T11:22:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Broken Streetlight - Safety Concern',
    description: 'Street light has been out for 3 weeks. Area is very dark at night making it unsafe for pedestrians.',
    status: 'in_progress',
    priority: 'high',
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: '456 Pine Avenue, Midtown'
    },
    reportedBy: 'Robert K.',
    reportedAt: '2025-01-18T20:45:00Z',
    category: 'safety',
    upvotes: 15,
    comments: [
      {
        id: 'c3',
        text: 'City maintenance team is aware and working on it.',
        author: 'City Rep',
        createdAt: '2025-01-22T13:00:00Z'
      }
    ]
  },
  {
    id: '3',
    title: 'Overflowing Trash Bins',
    description: 'Multiple garbage bins overflowing for days. Attracting rats and creating unsanitary conditions.',
    status: 'resolved',
    priority: 'medium',
    location: {
      latitude: 40.7505,
      longitude: -73.9934,
      address: '789 Elm Street, West Side'
    },
    reportedBy: 'Lisa P.',
    reportedAt: '2025-01-15T16:20:00Z',
    category: 'environment',
    upvotes: 8,
    comments: [
      {
        id: 'c4',
        text: 'Thank you for reporting! Cleaned up today.',
        author: 'Sanitation Dept',
        createdAt: '2025-01-23T08:30:00Z'
      }
    ]
  },
  {
    id: '4',
    title: 'Damaged Sidewalk - Trip Hazard',
    description: 'Large crack in sidewalk creating a dangerous trip hazard. Several people have stumbled here.',
    status: 'pending',
    priority: 'medium',
    location: {
      latitude: 40.7282,
      longitude: -74.0776,
      address: '321 Maple Drive, South District'
    },
    reportedBy: 'David C.',
    reportedAt: '2025-01-19T12:15:00Z',
    category: 'accessibility',
    upvotes: 12,
    comments: []
  },
  {
    id: '5',
    title: 'Graffiti on Community Center',
    description: 'Offensive graffiti spray painted on the side of the community center building.',
    status: 'in_progress',
    priority: 'low',
    location: {
      latitude: 40.7614,
      longitude: -73.9776,
      address: '555 Community Way, North End'
    },
    reportedBy: 'Maria G.',
    reportedAt: '2025-01-17T10:00:00Z',
    category: 'maintenance',
    upvotes: 6,
    comments: [
      {
        id: 'c5',
        text: 'Volunteer cleanup scheduled for this weekend.',
        author: 'Community Volunteer',
        createdAt: '2025-01-21T16:45:00Z'
      }
    ]
  }
];

export const mockUserProfile: UserProfile = {
  id: 'user123',
  email: 'john.doe@example.com',
  name: 'John Doe',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  issuesReported: 7,
  issuesResolved: 3,
  reputation: 145,
  joinedAt: '2024-09-15T12:00:00Z',
  badges: [
    {
      id: 'b1',
      name: 'Community Helper',
      description: 'Reported 5+ issues',
      icon: 'medal-outline',
      earnedAt: '2024-12-01T10:00:00Z'
    },
    {
      id: 'b2',
      name: 'Early Adopter',
      description: 'One of the first 100 users',
      icon: 'star-outline',
      earnedAt: '2024-09-15T12:00:00Z'
    },
    {
      id: 'b3',
      name: 'Problem Solver',
      description: 'Had 3+ reports resolved',
      icon: 'checkmark-circle-outline',
      earnedAt: '2025-01-10T15:30:00Z'
    }
  ]
};

export const getCategoryIcon = (category: Issue['category']): string => {
  switch (category) {
    case 'infrastructure':
      return 'construct-outline';
    case 'safety':
      return 'shield-checkmark-outline';
    case 'environment':
      return 'leaf-outline';
    case 'maintenance':
      return 'build-outline';
    case 'accessibility':
      return 'accessibility-outline';
    default:
      return 'alert-circle-outline';
  }
};

export const getPriorityColor = (priority: Issue['priority']): string => {
  switch (priority) {
    case 'critical':
      return '#dc2626';
    case 'high':
      return '#ea580c';
    case 'medium':
      return '#ca8a04';
    case 'low':
      return '#16a34a';
    default:
      return '#6b7280';
  }
};

export const getStatusColor = (status: Issue['status']): string => {
  switch (status) {
    case 'pending':
      return '#dc2626';
    case 'in_progress':
      return '#ca8a04';
    case 'resolved':
      return '#16a34a';
    default:
      return '#6b7280';
  }
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    }
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};