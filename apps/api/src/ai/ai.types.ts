export interface AiFindingReview {
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  fixExample: string | null;
  remediationSteps: string[];
  risk: string;
  verificationSteps: string[];
}

export interface AiFixProposal {
  approvalToken: string;
  commitMessage: string;
  explanation: string;
  originalContent: string;
  patch: string;
  proposedContent: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  rootCause: string;
  sideEffects: string[];
  sourceSha: string;
  summary: string;
  tests: string[];
  title: string;
}
