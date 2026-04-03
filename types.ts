
export type ToolType = 
  | 'comparison' 
  | 'auditor' 
  | 'compliance' 
  | 'roadmap' 
  | 'discovery' 
  | 'troubleshooter' 
  | 'designer' 
  | 'privacy' 
  | 'lab'
  | 'code-refactor'
  | 'weekly-intel'
  | 'api-scanner'
  | 'node-roadmap'
  | 'credential-assistant';

export interface UsageEntry {
  timestamp: number;
  toolId: string;
}

export interface UserSession {
  isAuthenticated: boolean;
  username: string | null;
  usageCount: number;
  isPremium: boolean;
  emailNotifications?: boolean;
  auditScores: number[];
  efficiencyGains: number[];
  featureUsage: Record<string, number>;
  usageHistory: UsageEntry[];
}

export interface AuditResult {
  score: number;
  findings: string[];
  recommendations: string[];
  correctedTopology: string;
  codeSnippet?: string;
}

export interface CodeRefactorResult {
  analysis: string[];
  refactoredCode: string;
  explanation: string;
  complexityScore: string;
}

export interface ProtocolBlueprint {
  title: string;
  objective: string;
  logic: string;
}

export interface WeeklyDiscovery {
  toolName: string;
  category: string;
  description: string;
  whyItMatters: string;
  largelyUsedFor: string;
  protocolBlueprints: ProtocolBlueprint[];
  releaseDate: string;
  url: string;
}
