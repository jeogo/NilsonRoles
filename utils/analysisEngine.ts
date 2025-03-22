import { AnalysisData, NelsonPrinciple } from '../types/analysis';
import { validateHTML, getPageSpeedData, getSecurityAnalysis } from './api';

// الفئات والمعايير المستخدمة في التحليل
export enum AnalysisCategory {
  PERFORMANCE = 'performance',
  ACCESSIBILITY = 'accessibility',
  USABILITY = 'usability',
  SECURITY = 'security',
  STANDARDS = 'standards'
}

// معايير التقييم
interface EvaluationCriteria {
  name: string;
  category: AnalysisCategory;
  weight: number; // وزن هذا المعيار في التقييم النهائي (من 0 إلى 1)
  evaluator: (data: AnalysisData, url: string) => number; // دالة لتقييم المعيار (من 0 إلى 100)
  feedbackGenerator: (score: number) => string; // دالة لإنشاء تعليقات بناءً على النتيجة
}

/**
 * تحسين تقييم سرعة التحميل مع معايير أكثر صرامة
 */
const evaluateFirstContentfulPaint = (data: AnalysisData): number => {
  if (!data.pageSpeedData?.lighthouseResult?.audits?.['first-contentful-paint']) {
    return 0; // صفر في حالة عدم توفر البيانات
  }

  const fcp = data.pageSpeedData.lighthouseResult.audits['first-contentful-paint'];
  const fcpValue = fcp.numericValue;
  
  // تقييم أكثر صرامة لـ FCP
  if (fcpValue <= 1000) return 100; // ممتاز - أقل من ثانية
  if (fcpValue <= 2000) return 80; // جيد - أقل من ثانيتين
  if (fcpValue <= 3000) return 60; // مقبول
  if (fcpValue <= 4000) return 40; // ضعيف
  return 20; // سيء جداً
};

/**
 * تقييم ثبات التخطيط (CLS)
 */
const evaluateCLS = (data: AnalysisData): number => {
  if (!data.pageSpeedData?.lighthouseResult?.audits?.['cumulative-layout-shift']) {
    return 75; // قيمة افتراضية
  }

  const clsScore = data.pageSpeedData.lighthouseResult.audits['cumulative-layout-shift'].score || 0;
  return clsScore * 100;
};

/**
 * تحسين تقييم الأداء العام مع معايير محددة
 */
const evaluateOverallPerformance = (data: AnalysisData): number => {
  if (!data.pageSpeedData?.lighthouseResult?.categories?.performance) {
    return 0;
  }

  const metrics = data.pageSpeedData.lighthouseResult.audits;
  const weights = {
    'first-contentful-paint': 0.25,
    'largest-contentful-paint': 0.25,
    'cumulative-layout-shift': 0.25,
    'speed-index': 0.15,
    'total-blocking-time': 0.1
  };

  let weightedScore = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([metric, weight]) => {
    if (metrics[metric]?.score) {
      weightedScore += metrics[metric].score * weight * 100;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
};

/**
 * تحسين تقييم الأداء العام للموقع
 */
const evaluateOverallPerformanceOld = (data: AnalysisData): number => {
  if (!data.pageSpeedData?.lighthouseResult?.categories?.performance) {
    return 65; // قيمة افتراضية
  }

  const performanceScore = data.pageSpeedData.lighthouseResult.categories.performance.score || 0;
  return performanceScore * 100;
};

/**
 * تقييم أكثر دقة لإمكانية الوصول
 */
const evaluateAccessibility = (data: AnalysisData): number => {
  if (!data.pageSpeedData?.lighthouseResult?.categories?.accessibility) {
    return 0;
  }

  const accessibilityAudits = data.pageSpeedData.lighthouseResult.audits;
  const criticalIssues = ['aria-required-attr', 'aria-roles', 'color-contrast'];
  
  let score = data.pageSpeedData.lighthouseResult.categories.accessibility.score * 100;
  
  // خصم نقاط إضافية للمشاكل الحرجة
  criticalIssues.forEach(issue => {
    if (accessibilityAudits[issue]?.score === 0) {
      score -= 15; // خصم 15 نقطة لكل مشكلة حرجة
    }
  });

  return Math.max(0, score);
};

/**
 * تقييم أفضل الممارسات
 */
const evaluateBestPractices = (data: AnalysisData): number => {
  if (!data.pageSpeedData?.lighthouseResult?.categories?.['best-practices']) {
    return 70; // قيمة افتراضية
  }

  const bestPracticesScore = data.pageSpeedData.lighthouseResult.categories['best-practices'].score || 0;
  return bestPracticesScore * 100;
};

/**
 * تقييم معايير SEO
 */
const evaluateSEO = (data: AnalysisData): number => {
  if (!data.pageSpeedData?.lighthouseResult?.categories?.seo) {
    return 65; // قيمة افتراضية
  }

  const seoScore = data.pageSpeedData.lighthouseResult.categories.seo.score || 0;
  return seoScore * 100;
};

/**
 * تقييم جودة الكود HTML
 */
const evaluateHTMLQuality = (data: AnalysisData): number => {
  if (!data.htmlValidationData?.messages) {
    return 75; // قيمة افتراضية
  }

  const messages = data.htmlValidationData.messages;
  const errorCount = messages.filter((m: { type: string; }) => m.type === 'error').length;
  const warningCount = messages.filter((m: { type: string; }) => m.type === 'warning').length;

  // حساب الدرجة: 100 - (5 * عدد الأخطاء + 2 * عدد التحذيرات)
  const htmlScore = Math.max(0, 100 - (5 * errorCount + 2 * warningCount));
  return Math.min(100, htmlScore);
};

/**
 * تقييم الأمان على الموقع
 */
const evaluateSecurity = (data: AnalysisData, url: string): number => {
  // التحقق من HTTPS
  const isHttps = url.startsWith('https://');
  
  // فحص بيانات الأمان إذا كانت متوفرة
  if (data.securityData?.results && data.securityData.results.length > 0) {
    const securityScore = data.securityData.results[0].stats?.securityScore || 0;
    const tlsValid = data.securityData.results[0].page?.tlsValid || false;

    if (!isHttps) {
      return 50; // خصم كبير إذا لم يكن HTTPS
    }

    if (!tlsValid) {
      return 60; // خصم إذا كانت شهادة SSL غير صالحة
    }

    return securityScore;
  }

  // نتيجة افتراضية بناءً على HTTPS فقط
  return isHttps ? 85 : 50;
};

/**
 * تقييم وضوح واجهة المستخدم وتوزيع العناصر
 */
const evaluateIntuitiveUI = (data: AnalysisData): number => {
  // نستخدم أداء FCP و CLS و FID كمؤشرات على وضوح واجهة المستخدم
  const fcpScore = evaluateFirstContentfulPaint(data);
  const clsScore = evaluateCLS(data);
  
  // استخلاص درجة تجربة المستخدم من Lighthouse إذا وجدت
  const fid = (data.pageSpeedData?.lighthouseResult?.audits?.['max-potential-fid']?.score || 0.75) * 100;
  
  // توزيع الأوزان على المعايير
  return (fcpScore * 0.3 + clsScore * 0.4 + fid * 0.3);
};

// قائمة معايير التقييم الشاملة
const evaluationCriteria: { [key: string]: EvaluationCriteria } = {
  systemStatus: {
    name: 'وضوح حالة النظام',
    category: AnalysisCategory.USABILITY,
    weight: 1,
    evaluator: (data, url) => {
      const performance = evaluateOverallPerformance(data);
      const fcp = evaluateFirstContentfulPaint(data);
      return performance * 0.6 + fcp * 0.4;
    },
    feedbackGenerator: (score) => {
      if (score < 50) {
        return 'الموقع يعاني من بطء في الاستجابة وضعف في وضوح حالة النظام. يجب تحسين سرعة التحميل وإضافة مؤشرات توضح ما يحدث للمستخدم.';
      } else if (score < 80) {
        return 'وضوح حالة النظام مقبول، لكن يمكن تحسينه من خلال إضافة مؤشرات تقدم وتنبيهات أكثر وضوحًا أثناء العمليات.';
      }
      return 'الموقع يتميز بسرعة استجابة جيدة ووضوح في حالة النظام، مما يساعد المستخدم على فهم ما يحدث في كل وقت.';
    }
  },
  
  realWorldMatch: {
    name: 'الملاءمة مع العالم الواقعي',
    category: AnalysisCategory.USABILITY,
    weight: 1,
    evaluator: (data, url) => {
      // هذا المعيار صعب قياسه تلقائيًا، نستخدم معايير أخرى كمؤشرات غير مباشرة
      const accessibilityScore = evaluateAccessibility(data);
      const bestPracticesScore = evaluateBestPractices(data);
      return accessibilityScore * 0.5 + bestPracticesScore * 0.5;
    },
    feedbackGenerator: (score) => {
      if (score < 60) {
        return 'الموقع يحتاج إلى تحسين استخدام لغة ومفاهيم مألوفة للمستخدم. يُنصح بمراجعة المصطلحات والرموز المستخدمة لتكون أقرب للمستخدم.';
      } else if (score < 80) {
        return 'الموقع يستخدم مصطلحات مفهومة للمستخدم العادي، مع وجود بعض النقاط التي يمكن تحسينها في واجهة الاستخدام.';
      }
      return 'الموقع يمتاز بتصميم مألوف للمستخدم، يستخدم لغة واضحة ومفاهيم مرتبطة بالعالم الواقعي.';
    }
  },
  
  userControl: {
    name: 'حرية التحكم للمستخدم',
    category: AnalysisCategory.USABILITY,
    weight: 1,
    evaluator: (data, url) => {
      const accessibilityScore = evaluateAccessibility(data);
      const bestPracticesScore = evaluateBestPractices(data);
      return accessibilityScore * 0.7 + bestPracticesScore * 0.3;
    },
    feedbackGenerator: (score) => {
      if (score < 60) {
        return 'الموقع يحتاج إلى تحسينات كبيرة في مجال حرية تحكم المستخدم، خاصة في توفير خيارات للتراجع وإلغاء الإجراءات.';
      } else if (score < 80) {
        return 'يُوفر الموقع تحكمًا مقبولًا للمستخدم، لكن يمكن تحسين خيارات التراجع عن الإجراءات وتوفير مخارج واضحة.';
      }
      return 'الموقع يمنح المستخدم حرية جيدة في التحكم والتنقل، مع توفير خيارات للتراجع والإلغاء بشكل واضح.';
    }
  },
  
  consistency: {
    name: 'الاتساق والمعايير',
    category: AnalysisCategory.STANDARDS,
    weight: 1,
    evaluator: (data, url) => {
      const bestPracticesScore = evaluateBestPractices(data);
      const htmlQualityScore = evaluateHTMLQuality(data);
      return bestPracticesScore * 0.6 + htmlQualityScore * 0.4;
    },
    feedbackGenerator: (score) => {
      if (score < 60) {
        return 'الموقع لا يتبع العديد من معايير الويب الحديثة. يجب تحسين الاتساق في التصميم والوظائف عبر الموقع.';
      } else if (score < 80) {
        return 'الموقع متسق في معظم صفحاته مع بعض التباينات البسيطة في التنسيق. يُنصح بمراجعة أفضل الممارسات المتبعة.';
      }
      return 'الموقع يتبع معايير الويب الحديثة بشكل جيد ويحافظ على اتساق التصميم والوظائف.';
    }
  },
  
  errorPrevention: {
    name: 'منع الأخطاء',
    category: AnalysisCategory.USABILITY,
    weight: 1,
    evaluator: (data, url) => {
      const htmlQualityScore = evaluateHTMLQuality(data);
      const securityScore = evaluateSecurity(data, url);
      const clsScore = evaluateCLS(data);
      return htmlQualityScore * 0.4 + securityScore * 0.3 + clsScore * 0.3;
    },
    feedbackGenerator: (score) => {
      if (score < 60) {
        return 'هناك العديد من النقاط التي يمكن تحسينها في منع الأخطاء. يُنصح بتحسين آليات التحقق من المدخلات وتوفير تأكيدات للإجراءات المهمة.';
      } else if (score < 80) {
        return 'الموقع يوفر حماية مقبولة ضد الأخطاء، لكن يمكن تحسين التحقق من صحة المدخلات وتوفير إرشادات أوضح.';
      }
      return 'الموقع يمتاز بتصميم جيد يمنع الأخطاء قبل حدوثها، مع توفير آليات مناسبة للتحقق والتأكيد.';
    }
  },
  
  recognitionOverRecall: {
    name: 'التعرف بدلاً من التذكر',
    category: AnalysisCategory.USABILITY,
    weight: 1,
    evaluator: (data, url) => {
      const intuitiveUIScore = evaluateIntuitiveUI(data);
      const accessibilityScore = evaluateAccessibility(data);
      return intuitiveUIScore * 0.6 + accessibilityScore * 0.4;
    },
    feedbackGenerator: (score) => {
      if (score < 60) {
        return 'الموقع يحتاج إلى تحسين وضوح العناصر وتقليل الحمل المعرفي على المستخدم، حيث يعتمد كثيرًا على تذكر المستخدم.';
      } else if (score < 80) {
        return 'الموقع يقدم واجهة استخدام مقبولة، ويمكن تحسينها من خلال جعل العناصر المهمة أكثر وضوحًا ومعرّفة ذاتيًا.';
      }
      return 'الموقع يمتاز بواجهة سهلة التعرف عليها، مع عناصر واضحة ومرئية تقلل الحاجة لتذكر الخطوات والإجراءات.';
    }
  },
  
  flexibilityEfficiency: {
    name: 'المرونة وكفاءة الاستخدام',
    category: AnalysisCategory.PERFORMANCE,
    weight: 1,
    evaluator: (data, url) => {
      const performanceScore = evaluateOverallPerformance(data);
      const lcpScore = (data.pageSpeedData?.lighthouseResult?.audits?.['largest-contentful-paint']?.score || 0.7) * 100;
      return performanceScore * 0.5 + lcpScore * 0.5;
    },
    feedbackGenerator: (score) => {
      if (score < 60) {
        return 'الموقع يعاني من ضعف في الأداء وكفاءة الاستخدام. يُنصح بتحسين سرعة التحميل وإضافة اختصارات ووسائل راحة للمستخدمين المتكررين.';
      } else if (score < 80) {
        return 'كفاءة الموقع مقبولة، ويمكن تحسينها من خلال إضافة المزيد من الاختصارات وتخصيص الواجهة للمستخدمين المتكررين.';
      }
      return 'الموقع يمتاز بمرونة عالية وكفاءة في الاستخدام، مع توفير وسائل متعددة لإنجاز المهام المتكررة بسرعة وسهولة.';
    }
  },
  
  aestheticDesign: {
    name: 'التصميم الجمالي والبسيط',
    category: AnalysisCategory.USABILITY,
    weight: 1,
    evaluator: (data, url) => {
      const clsScore = evaluateCLS(data);
      const performanceScore = evaluateOverallPerformance(data);
      const htmlQualityScore = evaluateHTMLQuality(data);
      return clsScore * 0.4 + performanceScore * 0.3 + htmlQualityScore * 0.3;
    },
    feedbackGenerator: (score) => {
      if (score < 60) {
        return 'التصميم يحتاج إلى تحسينات كبيرة من ناحية البساطة والجمالية، مع التركيز على تقليل التشويش والعناصر غير الضرورية.';
      } else if (score < 80) {
        return 'التصميم جذاب بشكل عام، مع وجود مجال لتبسيط بعض الصفحات وتحسين المظهر العام.';
      }
      return 'الموقع يمتاز بتصميم جمالي وبسيط، يركز على المحتوى المهم ويتجنب الإفراط في العناصر المرئية غير الضرورية.';
    }
  },
  
  errorDiagnosis: {
    name: 'مساعدة المستخدم على تشخيص الأخطاء',
    category: AnalysisCategory.USABILITY,
    weight: 1,
    evaluator: (data, url) => {
      const htmlQualityScore = evaluateHTMLQuality(data);
      const accessibilityScore = evaluateAccessibility(data);
      const bestPracticesScore = evaluateBestPractices(data);
      return htmlQualityScore * 0.3 + accessibilityScore * 0.3 + bestPracticesScore * 0.4;
    },
    feedbackGenerator: (score) => {
      if (score < 60) {
        return 'الموقع يحتاج إلى تحسين كبير في طريقة عرض رسائل الأخطاء، بحيث تكون أكثر وضوحًا وتقدم حلولًا عملية.';
      } else if (score < 80) {
        return 'رسائل الخطأ مقبولة، لكن يمكن تحسينها لتكون أكثر تحديدًا وتوفير حلول مباشرة للمشكلات.';
      }
      return 'الموقع يمتاز برسائل خطأ واضحة ومفيدة، تساعد المستخدم على فهم المشكلة وكيفية حلها بشكل سريع.';
    }
  },
  
  helpDocumentation: {
    name: 'المساعدة والتوثيق',
    category: AnalysisCategory.USABILITY,
    weight: 1,
    evaluator: (data, url) => {
      const seoScore = evaluateSEO(data);
      const securityScore = evaluateSecurity(data, url);
      const accessibilityScore = evaluateAccessibility(data);
      return seoScore * 0.4 + securityScore * 0.2 + accessibilityScore * 0.4;
    },
    feedbackGenerator: (score) => {
      if (score < 60) {
        return 'الموقع يفتقر إلى وثائق مساعدة كافية. يُنصح بإضافة أدلة استخدام واضحة وسهلة الوصول.';
      } else if (score < 80) {
        return 'المساعدة والتوثيق متوفران بشكل مقبول، ويمكن تحسينهما من خلال إضافة المزيد من الأمثلة والتفاصيل.';
      }
      return 'الموقع يوفر مستندات مساعدة شاملة وسهلة الوصول، مع تعليمات واضحة للاستخدام وحل المشكلات.';
    }
  }
};

/**
 * إنشاء مجموعة من مبادئ نيلسون بناءً على تحليل البيانات
 */
export function calculateNelsonPrinciples(data: AnalysisData, url: string): NelsonPrinciple[] {
  const principles: NelsonPrinciple[] = [];
  
  // تطبيق كل معيار تقييم لإنشاء المبادئ
  Object.entries(evaluationCriteria).forEach(([key, criteria]) => {
    const score = Math.round(criteria.evaluator(data, url));
    const feedback = criteria.feedbackGenerator(score);
    
    principles.push({
      name: criteria.name,
      score,
      description: getDescriptionByPrinciple(key),
      feedback
    });
  });
  
  return principles;
}

/**
 * تحسين التحليل مع تفاصيل إضافية
 */
interface EnhancedNelsonAnalysis {
  maxScore: number;
  minScore: number;
  medianScore: number;
  standardDeviation: number;
  highlighted: NelsonPrinciple[];
  criticalIssues: NelsonPrinciple[];
  allPrinciples: NelsonPrinciple[];
}

export function enhanceNelsonAnalysis(data: AnalysisData, url: string): EnhancedNelsonAnalysis {
  const principles = calculateNelsonPrinciples(data, url);
  const scores = principles.map(p => p.score);
  
  const stats = {
    maxScore: Math.max(...scores),
    minScore: Math.min(...scores),
    medianScore: calculateMedian(scores),
    standardDeviation: calculateStandardDeviation(scores)
  };

  // تحديد المشاكل الحرجة التي تحتاج اهتمام فوري
  const criticalIssues = principles.filter(p => p.score < 40);
  
  return {
    ...stats,
    highlighted: principles.filter(p => p.score >= stats.medianScore + stats.standardDeviation),
    criticalIssues,
    allPrinciples: principles.sort((a, b) => b.score - a.score)
  };
}

function calculateMedian(scores: number[]): number {
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function calculateStandardDeviation(scores: number[]): number {
  const mean = scores.reduce((a, b) => a + b) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  return Math.sqrt(variance);
}

/**
 * Provide design improvement suggestions for the 'التصميم الجمالي البسيط' principle based on its score.
 */
export function recommendDesignImprovements(score: number): string[] {
  if (score < 60) {
    return [
      'تقليل العناصر الزائدة وترتيب المحتوى بشكل أبسط',
      'ضبط نظام الألوان والخطوط لتحسين القراءة',
      'تحسين سرعة التحميل وتقليل حجم الصور'
    ];
  } else if (score < 80) {
    return [
      'تحسين التفاصيل البصرية مثل الأيقونات والتنسيق',
      'تقوية التباين بين العناصر النصية والخلفية',
      'تحسين عرض العناصر بالشاشات الصغيرة'
    ];
  }
  return [
    'حافظ على التصميم النظيف والبسيط',
    'تأكد من تناسق الهوية البصرية في جميع الصفحات'
  ];
}

/**
 * الحصول على وصف لكل مبدأ من مبادئ نيلسون
 */
function getDescriptionByPrinciple(key: string): string {
  const descriptions: Record<string, string> = {
    systemStatus: 'مدى وضوح حالة النظام ومعرفة المستخدم بما يحدث',
    realWorldMatch: 'استخدام لغة ومفاهيم مألوفة للمستخدم',
    userControl: 'القدرة على التراجع عن الأخطاء وحرية التنقل',
    consistency: 'اتباع معايير ثابتة عبر الموقع',
    errorPrevention: 'تصميم يمنع حدوث الأخطاء قبل وقوعها',
    recognitionOverRecall: 'تقليل الحمل المعرفي عبر واجهة سهلة التعرف',
    flexibilityEfficiency: 'توفير اختصارات للمستخدمين المتقدمين',
    aestheticDesign: 'واجهة بسيطة وخالية من العناصر غير الضرورية',
    errorDiagnosis: 'رسائل خطأ واضحة ومفيدة',
    helpDocumentation: 'توفير مساعدة وتوثيق سهل الوصول'
  };
  
  return descriptions[key] || '';
}

export async function performFullAnalysis(url: string): Promise<AnalysisData> {
  const [htmlData, performanceData, securityData] = await Promise.allSettled([
    validateHTML(url).catch(error => {
      console.error('HTML validation failed:', error);
      return null;
    }),
    getPageSpeedData(url).catch(error => {
      console.error('PageSpeed analysis failed:', error);
      return null;
    }),
    getSecurityAnalysis(url).catch(error => {
      console.error('Security analysis failed:', error);
      return null;
    })
  ]);

  const analysisData: AnalysisData = {
    websiteUrl: url,
    analysisDate: new Date().toISOString(),
    htmlValidationData: htmlData.status === 'fulfilled' ? htmlData.value : null,
    pageSpeedData: performanceData.status === 'fulfilled' ? performanceData.value : null,
    securityData: securityData.status === 'fulfilled' ? securityData.value : null,
    nelsonPrinciples: [],
    seoData: undefined,
    accessibilityData: undefined,
    cssValidationData: undefined,
    screenshotUrl: ''
  };

  // Calculate principles with the available data
  analysisData.nelsonPrinciples = calculateNelsonPrinciples(analysisData, url);
  
  return analysisData;
}


