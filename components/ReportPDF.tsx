import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { AnalysisData } from '../types/analysis';
Font.register({
  family: 'Tajawal',
  src: "fonts/Tajawal-Regular.ttf",
});
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20, // changed padding from 30 to 20
    fontFamily: 'Tajawal',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 20, // reduced from 24
    textAlign: 'right',
    marginBottom: 15, // reduced from 20
    color: '#2c6faa',
  },
  subtitle: {
    fontSize: 16, // reduced from 18
    textAlign: 'right',
    marginBottom: 8, // reduced from 10
  },
  text: {
    fontSize: 10, // reduced from 12
    textAlign: 'right',
    marginBottom: 4, // reduced from 5
  },
  score: {
    fontSize: 14, // reduced from 16
    textAlign: 'right',
    marginBottom: 4, // reduced from 5
    color: '#2c6faa',
  },
  principle: {
    marginBottom: 10, // reduced from 15
    padding: 8, // reduced from 10
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  header: {
    borderBottom: 1,
    borderBottomColor: '#eee',
    marginBottom: 20,
    paddingBottom: 10,
  },
  scoreBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
  },
  chartsContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f3f9',
  },
  chartImage: {
    marginVertical: 10,
    width: 300, // reduced from 400
    height: 200 // reduced from 250
  },
  secondPageContainer: {
    padding: 30,
    fontFamily: 'Tajawal',
  },
});

export const ReportPDF = ({
  data,
  radarChart,
  pieChart,
}: {
  data: AnalysisData;
  radarChart: string;
  pieChart: string;
  lineChart: string;
  barChart: string;
}) => {
  const averageScore = Math.round(
    data.nelsonPrinciples.reduce((sum, p) => sum + p.score, 0) / data.nelsonPrinciples.length
  );

  return (
    <Document>
      {/* Page 1: Summary & Charts */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>تقرير تحليل الموقع</Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.subtitle}>معلومات الموقع</Text>
          <Text style={styles.text}>الرابط: {data.websiteUrl}</Text>
          <Text style={styles.text}>
            تاريخ التحليل: {new Date(data.analysisDate).toLocaleDateString('ar-SA')}
          </Text>
          <Text style={styles.score}>النتيجة الإجمالية: {averageScore}%</Text>
        </View>

        <View style={styles.chartsContainer}>
          <Text style={styles.subtitle}>الرسوم البيانية</Text>
          {radarChart && <Image src={radarChart} style={styles.chartImage} />}
          {pieChart && <Image src={pieChart} style={styles.chartImage} />}
        </View>
      </Page>

      {/* Page 2: Principles Details */}
      <Page size="A4" style={styles.secondPageContainer}>
        <Text style={styles.subtitle}>تفاصيل المعايير</Text>
        {data.nelsonPrinciples.map((principle, index) => (
          <View key={index} style={styles.principle}>
            <Text style={styles.text}>{principle.name}</Text>
            <Text style={styles.score}>{principle.score}%</Text>
            <Text style={styles.text}>{principle.feedback}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};
