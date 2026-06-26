export interface PortfolioProject {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  projectUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioProjectInput {
  title: string;
  subtitle: string;
  category: string;
  imageUrl: string;
  projectUrl?: string;
  sortOrder: number;
  isActive: boolean;
}
