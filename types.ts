
export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LIVE = 'live',
  LIBRARY = 'library'
}

export enum AppMode {
  STUDIO = 'studio',
  COMMUNITY = 'community',
  LEARN = 'learn'
}

export enum CommunityTab {
  FEED = 'feed',
  PODS = 'pods',
  MENTORS = 'mentors',
  ANGST = 'angst'
}

export interface GeneratedAsset {
  id: string;
  type: ContentType;
  content: string; // Text content or URL
  createdAt: number;
  prompt?: string;
  meta?: any;
}

export interface VeoState {
  isGenerating: boolean;
  progress: string;
  error: string | null;
}

// Inferred from 'users' and 'user_credits' tables
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isAnonymous: boolean; // From 'personas' table logic
}

export interface CreditBalance {
  generation: number; // 'user_credits' (cents)
  community: number;  // 'ask_credits'
}
