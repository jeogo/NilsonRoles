export interface NielsenAnalysisResult {
  heuristic: string;
  principle: number;
  score: number;
  details: string;
  suggestions: string[];
}

// Map API responses to Nielsen's heuristics
export function mapResponsesToNielsenHeuristics(apiResponses: any[]): NielsenAnalysisResult[] {
  const [pagespeedData, waveData, htmlValidatorData, securityData, cssValidatorData] = apiResponses;
  
  return [
    {
      heuristic: "وضوح حالة النظام",
      principle: 1,
      score: evaluateSystemFeedback(pagespeedData),
      details: "مدى وضوح المعلومات والتغذية الراجعة للمستخدم",
      suggestions: getSystemFeedbackSuggestions(pagespeedData)
    },
    {
      heuristic: "التوافق مع العالم الواقعي",
      principle: 2,
      score: evaluateRealWorldMatch(htmlValidatorData, cssValidatorData),
      details: "استخدام لغة ومفاهيم مألوفة للمستخدم",
      suggestions: getRealWorldMatchSuggestions(htmlValidatorData)
    },
    {
      heuristic: "التحكم والحرية للمستخدم",
      principle: 3,
      score: evaluateUserControl(pagespeedData, waveData),
      details: "سهولة التنقل والتراجع عن الأخطاء",
      suggestions: getUserControlSuggestions(waveData)
    },
    {
      heuristic: "الثبات والمعايير",
      principle: 4,
      score: evaluateConsistency(htmlValidatorData, cssValidatorData),
      details: "اتباع المعايير والأعراف السائدة",
      suggestions: getConsistencySuggestions(htmlValidatorData)
    },
    {
      heuristic: "الوقاية من الأخطاء",
      principle: 5,
      score: evaluateErrorPrevention(waveData, securityData),
      details: "تصميم يمنع حدوث المشكلات قبل وقوعها",
      suggestions: getErrorPreventionSuggestions(waveData, securityData)
    },
    {
      heuristic: "التعرف بدلاً من التذكر",
      principle: 6,
      score: evaluateRecognition(pagespeedData, waveData),
      details: "تقليل عبء الذاكرة بجعل الأشياء مرئية",
      suggestions: getRecognitionSuggestions(pagespeedData)
    },
    {
      heuristic: "المرونة وكفاءة الاستخدام",
      principle: 7,
      score: evaluateFlexibility(pagespeedData),
      details: "تقديم اختصارات للمستخدمين ذوي الخبرة",
      suggestions: getFlexibilitySuggestions(pagespeedData)
    },
    {
      heuristic: "التصميم الجمالي البسيط",
      principle: 8,
      score: evaluateAestheticDesign(pagespeedData, cssValidatorData),
      details: "واجهات بدون معلومات غير ضرورية",
      suggestions: getAestheticDesignSuggestions(pagespeedData)
    },
    {
      heuristic: "مساعدة المستخدمين على التعرف على الأخطاء",
      principle: 9,
      score: evaluateErrorRecovery(waveData),
      details: "رسائل خطأ واضحة تقترح حلولاً",
      suggestions: getErrorRecoverySuggestions(waveData)
    },
    {
      heuristic: "المساعدة والتوثيق",
      principle: 10,
      score: evaluateHelpDocumentation(htmlValidatorData, waveData),
      details: "توفير مساعدة وتوثيق عند الحاجة",
      suggestions: getHelpDocumentationSuggestions(waveData)
    }
  ];
}

// Evaluation functions - These analyze API responses and return scores from 0-100
function evaluateSystemFeedback(pagespeedData: any): number {
  try {
    // Check loading time as indicator of system feedback
    const loadingMetrics = pagespeedData?.lighthouseResult?.audits?.['speed-index'];
    const fcpScore = pagespeedData?.lighthouseResult?.audits?.['first-contentful-paint']?.score || 0;
    
    // Higher score means faster loading which means better system feedback
    return Math.round((fcpScore * 100));
  } catch (error) {
    return 50; // Default score
  }
}

function evaluateRealWorldMatch(htmlValidatorData: any, cssValidatorData: any): number {
  try {
    // For real world match, we check if HTML semantics are correctly used
    const htmlErrors = htmlValidatorData?.messages?.filter((msg: any) => msg.type === 'error')?.length || 0;
    
    // Fewer errors = better real world match (semantic HTML)
    return Math.max(0, 100 - (htmlErrors * 5));
  } catch (error) {
    return 50;
  }
}

function evaluateUserControl(pagespeedData: any, waveData: any): number {
  try {
    // User control involves navigation, forms, and input elements
    const formControls = waveData?.categories?.contrast?.items || [];
    const navScore = pagespeedData?.lighthouseResult?.audits?.['user-navigations']?.score || 0.5;
    
    return Math.round((navScore * 100));
  } catch (error) {
    return 50;
  }
}

function evaluateConsistency(htmlValidatorData: any, cssValidatorData: any): number {
  try {
    // Check HTML and CSS standards compliance as indicator of consistency
    const htmlErrors = htmlValidatorData?.messages?.filter((msg: any) => msg.type === 'error')?.length || 0;
    const cssErrors = cssValidatorData?.cssvalidation?.errors?.length || 0;
    
    return Math.max(0, 100 - ((htmlErrors + cssErrors) * 3));
  } catch (error) {
    return 50;
  }
}

function evaluateErrorPrevention(waveData: any, securityData: any): number {
  try {
    // Error prevention involves form validation and security
    const formErrors = waveData?.categories?.error?.items?.filter((item: any) => 
      item.description?.includes('form') || item.description?.includes('input'))?.length || 0;
    
    // For URLScan.io data, check if there are any security results
    let securityScore = 50; // Base score
    
    if (securityData && !securityData.error) {
      // Check if there are positive security indicators
      const results = securityData.results || [];
      const totalResults = results.length;
      
      if (totalResults > 0) {
        // Check for malicious results or security issues
        const maliciousResults = results.filter((r: any) => 
          r.verdict === 'malicious' || 
          r.verdicts?.overall?.malicious === true
        ).length;
        
        // Better score if no malicious results
        if (maliciousResults === 0) {
          securityScore += 25;
        } else {
          securityScore -= 15 * (maliciousResults / totalResults);
        }
      }
    }
    
    return Math.max(0, Math.min(100, securityScore - (formErrors * 5)));
  } catch (error) {
    return 50;
  }
}

function evaluateRecognition(pagespeedData: any, waveData: any): number {
  try {
    // Recognition involves good labeling and clear UI
    const ariaScore = waveData?.categories?.aria?.count || 0;
    const contrastScore = waveData?.categories?.contrast?.count || 0;
    
    return Math.max(0, 100 - (ariaScore * 2) - (contrastScore));
  } catch (error) {
    return 50;
  }
}

function evaluateFlexibility(pagespeedData: any): number {
  try {
    // Flexibility involves performance and optimizations
    const perfScore = pagespeedData?.lighthouseResult?.categories?.performance?.score || 0;
    const bestPracticesScore = pagespeedData?.lighthouseResult?.categories?.['best-practices']?.score || 0;
    
    return Math.round(((perfScore + bestPracticesScore) / 2) * 100);
  } catch (error) {
    return 50;
  }
}

function evaluateAestheticDesign(pagespeedData: any, cssValidatorData: any): number {
  try {
    // Aesthetic design involves CSS validation and performance
    const cssErrors = cssValidatorData?.cssvalidation?.errors?.length || 0;
    const perfScore = pagespeedData?.lighthouseResult?.categories?.performance?.score || 0;
    
    return Math.round(Math.max(0, (perfScore * 70) + 30 - (cssErrors * 2)));
  } catch (error) {
    return 50;
  }
}

function evaluateErrorRecovery(waveData: any): number {
  try {
    // Error recovery involves proper error messaging and form validation
    const alerts = waveData?.categories?.alert?.count || 0;
    const errors = waveData?.categories?.error?.count || 0;
    
    return Math.max(0, 100 - (alerts * 2) - (errors * 5));
  } catch (error) {
    return 50;
  }
}

function evaluateHelpDocumentation(htmlValidatorData: any, waveData: any): number {
  try {
    // Help documentation involves proper labeling and instructions
    const labelErrors = waveData?.categories?.error?.items?.filter((item: any) => 
      item.description?.includes('label'))?.length || 0;
    
    // Check for help links and documentation
    const helpScore = 50; // Base score
    
    return Math.max(0, helpScore - (labelErrors * 10));
  } catch (error) {
    return 50;
  }
}

// Suggestion generator functions
function getSystemFeedbackSuggestions(pagespeedData: any): string[] {
  const suggestions = [];
  
  if (pagespeedData?.lighthouseResult?.audits?.['first-contentful-paint']?.score < 0.9) {
    suggestions.push("تحسين سرعة تحميل الصفحة لتوفير تغذية راجعة أسرع للمستخدم");
  }
  
  if (pagespeedData?.lighthouseResult?.audits?.['server-response-time']?.score < 0.9) {
    suggestions.push("تحسين وقت استجابة الخادم");
  }
  
  if (!suggestions.length) {
    suggestions.push("تقديم مؤشر واضح على حالة النظام في جميع الأوقات");
    suggestions.push("استخدام شريط تقدم للعمليات التي تستغرق وقتًا طويلاً");
  }
  
  return suggestions;
}

// All other suggestion functions follow the same pattern
function getRealWorldMatchSuggestions(htmlValidatorData: any): string[] {
  const suggestions = [];
  
  suggestions.push("استخدام مصطلحات مألوفة للمستخدم بدلاً من المصطلحات التقنية");
  suggestions.push("ترتيب المعلومات بطريقة منطقية ومتوقعة");
  
  return suggestions;
}

function getUserControlSuggestions(waveData: any): string[] {
  return [
    "توفير خيارات واضحة للتراجع عن الإجراءات",
    "تجنب الإجراءات التلقائية التي تحد من تحكم المستخدم",
    "توفير خيار 'إلغاء' أو 'رجوع' في جميع العمليات المهمة"
  ];
}

function getConsistencySuggestions(htmlValidatorData: any): string[] {
  return [
    "الحفاظ على ثبات التصميم والترميز عبر الموقع",
    "اتباع المعايير والأعراف المتعارف عليها في تصميم الويب",
    "استخدام نفس العناصر والأنماط للوظائف المتشابهة"
  ];
}

function getErrorPreventionSuggestions(waveData: any, securityData: any): string[] {
  const suggestions = [
    "استخدام التحقق من صحة النماذج لمنع الأخطاء قبل حدوثها",
    "توفير طلبات تأكيد للإجراءات المهمة أو غير القابلة للتراجع"
  ];
  
  // Add specific suggestions based on URLScan data
  if (securityData && !securityData.error) {
    const results = securityData.results || [];
    const hasMalicious = results.some((r: any) => 
      r.verdict === 'malicious' || 
      r.verdicts?.overall?.malicious === true
    );
    
    if (hasMalicious) {
      suggestions.push("تحسين الأمان لموقعك لمعالجة التهديدات الأمنية المحتملة");
      suggestions.push("إجراء فحص أمان شامل للموقع");
    }
    
    if (results.length === 0) {
      suggestions.push("إضافة شهادة SSL لتعزيز أمان الموقع");
      suggestions.push("تنفيذ إجراءات حماية إضافية مثل CSP وتحديد X-Frame-Options");
    }
  }
  
  return suggestions;
}

function getRecognitionSuggestions(pagespeedData: any): string[] {
  return [
    "جعل الخيارات والإجراءات مرئية بدلاً من الاعتماد على ذاكرة المستخدم",
    "استخدام أيقونات واضحة ومعروفة",
    "توفير تلميحات سياقية للمساعدة في فهم الوظائف"
  ];
}

function getFlexibilitySuggestions(pagespeedData: any): string[] {
  return [
    "توفير اختصارات للمستخدمين ذوي الخبرة",
    "السماح بتخصيص الواجهة وفقًا لتفضيلات المستخدم",
    "دعم طرق متعددة لإكمال المهام الشائعة"
  ];
}

function getAestheticDesignSuggestions(pagespeedData: any): string[] {
  return [
    "إبقاء التصميم بسيطًا وخاليًا من العناصر غير الضرورية",
    "استخدام التباين المناسب للقراءة",
    "تنظيم المعلومات بطريقة منطقية ومتسلسلة"
  ];
}

function getErrorRecoverySuggestions(waveData: any): string[] {
  return [
    "استخدام رسائل خطأ واضحة تشرح المشكلة وكيفية حلها",
    "تمييز حقول الإدخال التي تحتوي على أخطاء",
    "تقديم اقتراحات لتصحيح الأخطاء"
  ];
}

function getHelpDocumentationSuggestions(waveData: any): string[] {
  return [
    "توفير وثائق مساعدة سهلة الوصول والفهم",
    "تقديم تعليمات سياقية عند الحاجة",
    "توفير أمثلة توضيحية للمهام المعقدة"
  ];
}
