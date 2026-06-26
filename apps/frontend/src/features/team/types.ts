export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  photoUrl: string;
  linkedinUrl: string | null;
  githubUrl: string | null;
  instagramUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMemberInput {
  name: string;
  role: string;
  description: string;
  photoUrl: string;
  linkedinUrl?: string;
  githubUrl?: string;
  instagramUrl?: string;
  sortOrder: number;
  isActive: boolean;
}
