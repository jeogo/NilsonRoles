import React from 'react';

const NielsenHeuristics = () => {
  const heuristics = [
    {
      id: 1,
      title: "وضوح حالة النظام",
      description: "يجب أن يبقى النظام المستخدمين على علم بما يحدث من خلال تقديم تغذية راجعة مناسبة في وقت معقول",
      icon: "🔍"
    },
    {
      id: 2,
      title: "التوافق مع العالم الواقعي",
      description: "يجب أن يتحدث النظام بلغة المستخدم، بكلمات وعبارات مألوفة له بدلاً من المصطلحات التقنية",
      icon: "🌍"
    },
    {
      id: 3,
      title: "التحكم والحرية للمستخدم",
      description: "المستخدمون غالباً ما يختارون وظائف النظام عن طريق الخطأ ويحتاجون إلى 'مخرج طوارئ' واضح",
      icon: "🚪"
    },
    {
      id: 4,
      title: "الثبات والمعايير",
      description: "يجب أن تتبع الواجهة المعايير والأعراف السائدة حتى لا يتساءل المستخدمون عن معاني الكلمات والإجراءات",
      icon: "📏"
    },
    {
      id: 5,
      title: "الوقاية من الأخطاء",
      description: "تصميم يمنع حدوث المشكلة في المقام الأول، أفضل من رسائل الخطأ الجيدة",
      icon: "🛡️"
    },
    {
      id: 6,
      title: "التعرف بدلاً من التذكر",
      description: "تقليل عبء الذاكرة للمستخدم بجعل الأشياء والإجراءات والخيارات مرئية",
      icon: "🧠"
    },
    {
      id: 7,
      title: "المرونة وكفاءة الاستخدام",
      description: "توفير اختصارات للمستخدمين ذوي الخبرة مع مراعاة المستخدمين المبتدئين",
      icon: "⚡"
    },
    {
      id: 8,
      title: "التصميم الجمالي البسيط",
      description: "يجب أن لا تحتوي الواجهات على معلومات غير ذات صلة أو نادراً ما تكون مطلوبة",
      icon: "✨"
    },
    {
      id: 9,
      title: "مساعدة المستخدمين على التعرف على الأخطاء",
      description: "رسائل الخطأ يجب أن تكون بلغة واضحة وتقترح حلولاً بناءة",
      icon: "🔧"
    },
    {
      id: 10,
      title: "المساعدة والتوثيق",
      description: "رغم أن الأفضل أن يكون النظام قابل للاستخدام بدون وثائق، قد تكون هناك حاجة لتقديم مساعدة وتوثيق",
      icon: "📚"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-right mb-6">
        مبادئ نيلسون العشرة للتصميم
      </h2>
      <div className="space-y-4">
        {heuristics.map((heuristic) => (
          <div key={heuristic.id} className="flex items-start space-x-4 space-x-reverse rtl:space-x-reverse">
            <div className="text-2xl">{heuristic.icon}</div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white text-right">
                {heuristic.id}. {heuristic.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right">
                {heuristic.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NielsenHeuristics;
