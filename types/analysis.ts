export interface NelsonPrinciple {
  name: string;
  score: number;
  description: string;
  feedback: string;
}

interface PageSpeedData {
  lighthouseResult?: {
    audits?: {
      'first-contentful-paint'?: { score: number };
      'cumulative-layout-shift'?: { score: number };
      'max-potential-fid'?: { score: number };
      'largest-contentful-paint'?: { score: number };
    };
    categories?: {
      performance: { score: number };
      accessibility?: { score: number };
      'best-practices'?: { score: number };
      seo?: { score: number };
    };
  };
}

export interface SecurityData {
  results: {
    task: { domain: string; };
    page: { url: string; tlsValid: boolean; statusCode: number; };
    stats: { securityScore: number; };
    lists: { urls: never[]; };
  }[];
  total: number;
}

export interface AnalysisData {
  websiteUrl: string;
  analysisDate: string;
  pageSpeedData: PageSpeedData | null;
  accessibilityData: any | null;
  htmlValidationData: { messages: { type: string; message: string; }[] } | null;
  securityData: SecurityData | null;
  cssValidationData: any | null;
  nelsonPrinciples: NelsonPrinciple[];
}
