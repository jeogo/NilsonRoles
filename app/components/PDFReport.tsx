import { forwardRef } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

interface PDFReportProps {
  domain: string;
  date: Date;
  overallScore: number;
  results: any[];
  chartData: {
    doughnut: any;
    bar: any;
  };
}

const PDFReport = forwardRef<HTMLDivElement, PDFReportProps>(({
  domain,
  date,
  overallScore,
  results,
  chartData
}, ref) => {
  // Simple color function that uses basic RGB values
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#3B82F6';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white p-[10mm] print:p-0" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            تقرير تحليل موقع {domain}
          </h1>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {date.toLocaleDateString('ar-SA')}
          </p>
        </div>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: getScoreColor(overallScore),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          {overallScore}%
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>توزيع النتائج</h3>
          <div style={{ height: '200px' }}>
            <Doughnut data={chartData.doughnut} options={{ animation: false, responsive: true }} />
          </div>
        </div>
        <div>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>تقييم المبادئ</h3>
          <div style={{ height: '200px' }}>
            <Bar data={chartData.bar} options={{ animation: false, responsive: true }} />
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {results.map((result, index) => (
          <div key={index} style={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1rem',
            pageBreakInside: 'avoid'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: getScoreColor(result.score),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {result.score}%
              </div>
              <h4 style={{ margin: 0, fontSize: '16px' }}>
                {result.principle}. {result.heuristic}
              </h4>
            </div>
            {result.suggestions?.slice(0, 2).map((suggestion: string, idx: number) => (
              <p key={idx} style={{ 
                margin: '0.25rem 0',
                fontSize: '14px',
                color: '#666',
                paddingRight: '1rem'
              }}>
                • {suggestion}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '10mm',
        left: '10mm',
        right: '10mm',
        textAlign: 'center',
        fontSize: '12px',
        color: '#666'
      }}>
        تم إنشاء هذا التقرير بواسطة محلل نيلسون للمواقع - {date.toLocaleDateString('ar-SA')}
      </div>
    </div>
  );
});

PDFReport.displayName = 'PDFReport';

export default PDFReport;
