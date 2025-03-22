export interface NelsonPrinciple {
  name: string;
  description: string;
  score: number;
  feedback: string;
  improvementSuggestions?: string[];
}

interface PageSpeedData {
  lighthouseResult?: {
    audits?: {
      'first-contentful-paint'?: {
        numericValue: any; score: number 
};
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
  htmlValidationData: any;
  pageSpeedData: any;
  securityData: any;
  nelsonPrinciples: NelsonPrinciple[];
  seoData?: any;
  accessibilityData?: any;
  cssValidationData?: any;
  screenshotUrl?: string;
}