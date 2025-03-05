/**
 * Utility functions for analyzing websites according to Nielsen's heuristics
 */

// Map API responses to Nielsen's heuristics
export const mapResponsesToNielsenHeuristics = (apiResponses: any[]) => {
  const heuristics = [
    {
      id: 1,
      heuristic: "وضوح حالة النظام",
      score: calculateScoreForHeuristic(apiResponses, 1),
      details: "تقييم سرعة الاستجابة ووضوح التفاعل مع المستخدم",
      suggestion: "تحسين سرعة الموقع وتقديم مؤشرات واضحة لحالة النظام"
    },
    {
      id: 2,
      heuristic: "التوافق مع العالم الواقعي",
      score: calculateScoreForHeuristic(apiResponses, 2),
      details: "تقييم استخدام لغة مفهومة وواضحة للمستخدم",
      suggestion: "استخدام لغة ومصطلحات مألوفة للمستخدم، وتجنب المصطلحات التقنية"
    },
    {
      id: 3,
      heuristic: "التحكم والحرية للمستخدم",
      score: calculateScoreForHeuristic(apiResponses, 3),
      details: "تقييم سهولة التنقل والتراجع عن الأخطاء",
      suggestion: "توفير خيارات واضحة للتراجع والعودة والخروج من العمليات"
    },
    {
      id: 4,
      heuristic: "الثبات والمعايير",
      score: calculateScoreForHeuristic(apiResponses, 4),
      details: "تقييم اتساق التصميم واستخدام المعايير القياسية",
      suggestion: "استخدام عناصر تصميم متسقة والالتزام بمعايير الويب"
    },
    {
      id: 5,
      heuristic: "الوقاية من الأخطاء",
      score: calculateScoreForHeuristic(apiResponses, 5),
      details: "تقييم وجود آليات لمنع حدوث أخطاء المستخدم",
      suggestion: "تصميم واجهة تمنع الأخطاء قبل وقوعها وتوفر تأكيدات للإجراءات الهامة"
    },
    {
      id: 6,
      heuristic: "التعرف بدلاً من التذكر",
      score: calculateScoreForHeuristic(apiResponses, 6),
      details: "تقييم وضوح الخيارات والإجراءات دون الحاجة للتذكر",
      suggestion: "جعل الأشياء والإجراءات والخيارات مرئية ووضع تعليمات واضحة"
    },
    {
      id: 7,
      heuristic: "المرونة وكفاءة الاستخدام",
      score: calculateScoreForHeuristic(apiResponses, 7),
      details: "تقييم توفر اختصارات وطرق لتسريع التفاعل",
      suggestion: "توفير اختصارات للمستخدمين المتمرسين مع الحفاظ على البساطة للمبتدئين"
    },
    {
      id: 8,
      heuristic: "التصميم الجمالي البسيط",
      score: calculateScoreForHeuristic(apiResponses, 8),
      details: "تقييم بساطة التصميم وخلوه من المعلومات غير الضرورية",
      suggestion: "تبسيط الواجهة وإزالة العناصر غير الضرورية والمعلومات الزائدة"
    },
    {
      id: 9,
      heuristic: "مساعدة المستخدمين على التعرف على الأخطاء",
      score: calculateScoreForHeuristic(apiResponses, 9),
      details: "تقييم وضوح رسائل الخطأ ومدى مساعدتها",
      suggestion: "تصميم رسائل خطأ واضحة بلغة بسيطة وتوفير حلول مقترحة"
    },
    {
      id: 10,
      heuristic: "المساعدة والتوثيق",
      score: calculateScoreForHeuristic(apiResponses, 10),
      details: "تقييم توفر المساعدة والتوثيق وسهولة الوصول إليهما",
      suggestion: "توفير وثائق مساعدة سهلة الوصول والبحث تركز على مهام المستخدم"
    },
  ];

  return heuristics;
};

// Calculate a score for each heuristic based on API responses
const calculateScoreForHeuristic = (apiResponses: any[], heuristicNumber: number) => {
  // Default score if we can't calculate
  if (!apiResponses || apiResponses.length === 0) return 0;

  try {
    switch (heuristicNumber) {
      case 1: // Visibility of system status - based on PageSpeed response time
        const performance = apiResponses[0]?.lighthouseResult?.categories?.performance?.score;
        return performance ? Math.round(performance * 100) : 50;
        
      case 2: // Match between system and real world - based on HTML validation
        const errors = countValidationErrors(apiResponses[1]);
        return Math.max(0, 100 - (errors * 5)); // Deduct 5 points per error
        
      case 3: // User control and freedom - based on navigation structure
        // Check if there's a detectable navigation menu and breadcrumbs
        const hasNavigation = apiResponses[2]?.body?.includes('nav') || 
                             apiResponses[2]?.body?.includes('menu');
        return hasNavigation ? 75 : 30;
        
      case 4: // Consistency and standards - based on CSS validation
        const cssErrors = countValidationErrors(apiResponses[2]);
        return Math.max(0, 100 - (cssErrors * 5)); // Deduct 5 points per error
        
      case 5: // Error prevention - based on form validation and security
        // Check if SSL is enabled and forms have validation
        const hasSSL = apiResponses[3]?.grade && apiResponses[3]?.grade !== 'F';
        const hasFormValidation = apiResponses[1]?.body?.includes('required') || 
                                 apiResponses[1]?.body?.includes('pattern');
        return (hasSSL ? 50 : 0) + (hasFormValidation ? 50 : 0);
        
      // ... continue for other heuristics
        
      case 8: // Aesthetic and minimalist design - based on page size and element count
        // Approximate the "cleanness" of design by page size
        const pageSize = apiResponses[0]?.lighthouseResult?.audits?.['total-byte-weight']?.numericValue;
        if (!pageSize) return 50;
        return pageSize < 1000000 ? 85 : pageSize < 3000000 ? 65 : 40;
        
      default:
        return 50; // Default score of 50% if we can't calculate
    }
  } catch (error) {
    console.error(`Error calculating score for heuristic ${heuristicNumber}:`, error);
    return 50; // Default to 50% on error
  }
};

// Helper function to count validation errors from W3C validator response
const countValidationErrors = (validatorResponse: any) => {
  if (!validatorResponse) return 0;
  try {
    const messages = validatorResponse.messages || [];
    return messages.filter((msg: any) => msg.type === 'error').length;
  } catch (error) {
    return 0;
  }
};
