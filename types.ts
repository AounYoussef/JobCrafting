
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  targetJob?: string;
  skills?: string[];
  hasOnboarded: boolean;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Contract' | 'Freelance' | 'Internship';
  description: string;
  requirements: string[];
  tags: string[];
  postedDate: string;
  companyRating?: number;
  companyReviewsCount?: number;
  isRemote?: boolean;
}
