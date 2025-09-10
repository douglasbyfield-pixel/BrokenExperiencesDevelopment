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
    title: 'Major Pothole on Spanish Town Road',
    description: 'Huge pothole near Half Way Tree causing vehicle damage. Water pools during heavy rain making it extremely dangerous.',
    status: 'pending',
    priority: 'critical',
    location: {
      latitude: 18.0179,
      longitude: -76.8099,
      address: 'Spanish Town Road, Half Way Tree, Kingston, Jamaica'
    },
    reportedBy: 'Marcia Campbell',
    reportedAt: '2025-01-20T14:30:00Z',
    category: 'infrastructure',
    upvotes: 47,
    comments: [
      {
        id: 'c1',
        text: 'Mi car tire buss yah so yesterday! This need fix asap.',
        author: 'Devon Blake',
        createdAt: '2025-01-21T09:15:00Z'
      },
      {
        id: 'c2',
        text: 'KMC need to address this urgently before someone get hurt.',
        author: 'Keisha Morgan',
        createdAt: '2025-01-21T11:22:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Street Light Out on Hope Road',
    description: 'Street light near Devon House been out for over a month. Very dark and unsafe at night, especially for women walking alone.',
    status: 'in_progress',
    priority: 'high',
    location: {
      latitude: 18.0134,
      longitude: -76.7906,
      address: 'Hope Road, near Devon House, Kingston, Jamaica'
    },
    reportedBy: 'Shanique Wright',
    reportedAt: '2025-01-18T20:45:00Z',
    category: 'safety',
    upvotes: 31,
    comments: [
      {
        id: 'c3',
        text: 'JPS acknowledge the issue and working on it.',
        author: 'JPS Customer Service',
        createdAt: '2025-01-22T13:00:00Z'
      }
    ]
  },
  {
    id: '3',
    title: 'Garbage Piling Up on Orange Street',
    description: 'Skip bins overflowing for weeks on Orange Street downtown. Creating smell and attracting stray animals.',
    status: 'resolved',
    priority: 'medium',
    location: {
      latitude: 17.9673,
      longitude: -76.7936,
      address: 'Orange Street, Downtown Kingston, Jamaica'
    },
    reportedBy: 'Junior Thompson',
    reportedAt: '2025-01-15T16:20:00Z',
    category: 'environment',
    upvotes: 23,
    comments: [
      {
        id: 'c4',
        text: 'NSWMA clear it up this morning. Big up!',
        author: 'Community Member',
        createdAt: '2025-01-23T08:30:00Z'
      }
    ]
  },
  {
    id: '4',
    title: 'Broken Sidewalk on Knutsford Boulevard',
    description: 'Concrete sidewalk completely broken up near New Kingston. Very dangerous for pedestrians, especially elderly people.',
    status: 'pending',
    priority: 'medium',
    location: {
      latitude: 18.0080,
      longitude: -76.7837,
      address: 'Knutsford Boulevard, New Kingston, Jamaica'
    },
    reportedBy: 'Patricia Green',
    reportedAt: '2025-01-19T12:15:00Z',
    category: 'accessibility',
    upvotes: 19,
    comments: []
  },
  {
    id: '5',
    title: 'Vandalism at Emancipation Park',
    description: 'Graffiti sprayed on the monument and benches damaged. Need community cleanup and better security.',
    status: 'in_progress',
    priority: 'low',
    location: {
      latitude: 18.0099,
      longitude: -76.7845,
      address: 'Emancipation Park, New Kingston, Jamaica'
    },
    reportedBy: 'Michael Brown',
    reportedAt: '2025-01-17T10:00:00Z',
    category: 'maintenance',
    upvotes: 15,
    comments: [
      {
        id: 'c5',
        text: 'Community group organizing cleanup this Saturday.',
        author: 'Kingston Community',
        createdAt: '2025-01-21T16:45:00Z'
      }
    ]
  },
  {
    id: '6',
    title: 'Water Main Break on Constant Spring Road',
    description: 'Major water leak flooding the road near Tropical Plaza. Traffic backing up and water going to waste.',
    status: 'in_progress',
    priority: 'critical',
    location: {
      latitude: 18.0244,
      longitude: -76.7972,
      address: 'Constant Spring Road, near Tropical Plaza, Jamaica'
    },
    reportedBy: 'Andre Campbell',
    reportedAt: '2025-01-22T07:30:00Z',
    category: 'infrastructure',
    upvotes: 38,
    comments: [
      {
        id: 'c6',
        text: 'NWC crew on site working on the leak.',
        author: 'NWC Representative',
        createdAt: '2025-01-22T14:20:00Z'
      }
    ]
  }
];

export const mockUserProfile: UserProfile = {
  id: 'user123',
  email: 'marcus.johnson@gmail.com',
  name: 'Marcus Johnson',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  issuesReported: 12,
  issuesResolved: 5,
  reputation: 245,
  joinedAt: '2024-08-15T12:00:00Z',
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