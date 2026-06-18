export interface AiFindingReview {
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  fixExample: string | null;
  remediationSteps: string[];
  risk: string;
  verificationSteps: string[];
}

export interface AiSourceFile {
  branch: string;
  content: string;
  filePath: string;
  sourceSha: string;
}

export interface AiFixProposal {
  approvalToken: string;
  commitMessage: string;
  originalContent: string;
  proposedContent: string;
  sourceSha: string;
  summary: string;
  title: string;
}

export interface AiFixPullRequest {
  branch: string;
  pullRequestNumber: number;
  pullRequestUrl: string;
}
