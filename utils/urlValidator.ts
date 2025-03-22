interface ValidationResult {
  isValid: boolean;
  url: string;
  message?: string;
}

/**
 * Validates and normalizes URL input
 * Ensures URL has proper format and protocol
 */


/**
 * التحقق من صحة وجود الرابط بشكل فعلي
 * باستخدام عدة تقنيات للتأكد من وجود الموقع
 */
export async function isUrlReachable(url: string): Promise<{isReachable: boolean; message?: string}> {
  try {
    // 1. نحاول الاتصال بالموقع مباشرة باستخدام طلب HEAD
    // ملاحظة: هذا سيعمل فقط إذا كان الخادم يدعم CORS
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 ثوان timeout
    
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors', // لتجنب أخطاء CORS
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      // إذا وصلنا إلى هنا، فالموقع موجود ويستجيب
      return { isReachable: true };
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return { 
          isReachable: false,
          message: 'انتهت مهلة الاتصال بالموقع. تأكد من أن الرابط صحيح.' 
        };
      }
      // لا نتوقف عند فشل هذه الطريقة، ننتقل إلى الطريقة التالية
    }

    // 2. استخدام خدمة خارجية للتحقق من وجود الدومين
    const domain = extractDomain(url);
    
    // استخدام DNS lookup API
    const dnsApiUrl = `https://dns.google/resolve?name=${domain}&type=A`;
    const dnsResponse = await fetch(dnsApiUrl);
    const dnsData = await dnsResponse.json();
    
    // تحقق إذا كان الدومين لديه سجلات DNS تشير إلى وجوده
    if (dnsData.Answer && dnsData.Answer.length > 0) {
      return { isReachable: true };
    }
    
    // 3. التحقق من وجود معلومات WHOIS للدومين
    // تحقق أن النطاق مسجل وفعّال
    try {
      const whoisCheckUrl = `https://api.domainsdb.info/v1/domains/search?domain=${domain}&zone=com`;
      const whoisResponse = await fetch(whoisCheckUrl);
      const whoisData = await whoisResponse.json();

      if (whoisData.domains && whoisData.domains.length > 0) {
        const domainInfo = whoisData.domains[0];
        // التحقق من تاريخ انتهاء الصلاحية
        if (new Date(domainInfo.expiration_date) > new Date()) {
          return { isReachable: true };
        }
      }
    } catch (whoisError) {
      // استمر في التنفيذ حتى لو فشل WHOIS
    }

    // إذا وصلنا إلى هنا، فالموقع غير موجود أو غير متاح بالطرق المعتادة
    return { 
      isReachable: false,
      message: 'لم نتمكن من التأكد من وجود هذا الموقع. هل أنت متأكد من صحة الرابط؟'
    };
    
  } catch (error) {
    return { 
      isReachable: false,
      message: 'حدث خطأ أثناء التحقق من الرابط. يرجى التأكد من كتابة الرابط بشكل صحيح.'
    };
  }
}

/**
 * استخراج اسم الدومين من الرابط
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    // إذا كان الرابط غير صالح، نحاول معالجته
    if (!url.startsWith('http')) {
      return extractDomain('https://' + url);
    }
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

/**
 * تحقق محسّن من تنسيق الرابط
 */
export function validateUrlFormat(url: string): { isValid: boolean; url: string; message?: string } {
  // تنظيف الرابط من المسافات الزائدة
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return {
      isValid: false,
      url: '',
      message: 'الرابط فارغ. يرجى إدخال رابط صالح'
    };
  }

  // إضافة البروتوكول إذا لم يكن موجودًا
  let processedUrl = trimmedUrl;
  if (!trimmedUrl.match(/^(http|https):\/\//i)) {
    processedUrl = 'https://' + trimmedUrl;
  }

  try {
    // محاولة إنشاء كائن URL للتحقق من صحة الرابط
    const urlObj = new URL(processedUrl);
    
    // التحقق من أن الرابط يحتوي على دومين صحيح
    const hostname = urlObj.hostname;
    if (!hostname || hostname.length < 3 || !hostname.includes('.')) {
      return {
        isValid: false,
        url: processedUrl,
        message: 'اسم الدومين غير صالح. يجب أن يكون بصيغة example.com'
      };
    }
    
    // تحقق إضافي من خلال تعبير منتظم للتأكد من صحة الدومين
    const domainRegex = /^(http|https):\/\/([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,})(:[0-9]{1,5})?(\/.*)?$/i;
    if (!processedUrl.match(domainRegex)) {
      return {
        isValid: false,
        url: processedUrl,
        message: 'يرجى إدخال رابط صالح بتنسيق صحيح مثل example.com'
      };
    }
    
    return { isValid: true, url: processedUrl };
  } catch (e) {
    return {
      isValid: false,
      url: processedUrl,
      message: 'الرابط غير صالح. يرجى إدخال عنوان صحيح'
    };
  }
}

/**
 * التحقق الشامل من الرابط - تنسيقه ووجوده
 */
export async function validateUrl(url: string): Promise<{ 
  isValid: boolean; 
  url: string; 
  message?: string;
}> {
  // أولاً: تحقق من التنسيق
  const formatResult = validateUrlFormat(url);
  if (!formatResult.isValid) {
    return formatResult;
  }
  
  // ثانيًا: تحقق من وجود الموقع فعليًا
  const reachabilityResult = await isUrlReachable(formatResult.url);
  
  if (!reachabilityResult.isReachable) {
    return {
      isValid: false,
      url: formatResult.url,
      message: reachabilityResult.message || 'لا يمكن الوصول إلى هذا الموقع. تأكد من صحة الرابط.'
    };
  }
  
  // كل التحققات نجحت
  return {
    isValid: true,
    url: formatResult.url
  };
}

/**
 * طريقة للتحقق من الرابط مع خيار تجاوز فحص الوجود الفعلي (للاختبار فقط)
 */
export function bypassUrlValidation(url: string): { 
  isValid: boolean; 
  url: string; 
  message?: string;
} {
  const formatResult = validateUrlFormat(url);
  if (formatResult.isValid) {
    return {
      isValid: true,
      url: formatResult.url,
      message: 'تم تجاوز التحقق من وجود الموقع'
    };
  }
  return formatResult;
}
