import { AnalysisData, NelsonPrinciple } from '../types/analysis';

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
 * تقييم سرعة التحميل (FCP)
 */
const evaluateFirstContentfulPaint = (data: AnalysisData): number => {
  if (!data.pageSpeedData?.lighthouseResult?.audits?.['first-contentful-paint']) {
    return 70; // قيمة افتراضية إذا لم تتوفر بيانات
  }

  const fcpScore = data.pageSpeedData.lighthouseResult.audits['first-contentful-paint'].score || 0;
  return fcpScore * 100;
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
 * تقييم الأداء العام للموقع
 */
const evaluateOverallPerformance = (data: AnalysisData): number => {
  if (!data.pageSpeedData?.lighthouseResult?.categories?.performance) {
    return 65; // قيمة افتراضية
  }

  const performanceScore = data.pageSpeedData.lighthouseResult.categories.performance.score || 0;
  return performanceScore * 100;
};

/**
 * تقييم إمكانية الوصول
 */
const evaluateAccessibility = (data: AnalysisData): number => {
  if (!data.pageSpeedData?.lighthouseResult?.categories?.accessibility) {
    return 70; // قيمة افتراضية
  }

  const accessibilityScore = data.pageSpeedData.lighthouseResult.categories.accessibility.score || 0;
  return accessibilityScore * 100;
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
  const errorCount = messages.filter(m => m.type === 'error').length;
  const warningCount = messages.filter(m => m.type === 'warning').length;

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
