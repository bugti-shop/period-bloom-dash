import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getPeriodHistory } from './periodHistory';
import { getSymptomLogs } from './symptomLog';
import { getWeightEntries } from './weightStorage';
import { getBloodPressureReadings } from './bloodPressureStorage';
import { getGlucoseReadings } from './glucoseStorage';
import { loadMedications } from './medicationStorage';
import { format, differenceInDays } from 'date-fns';

interface ChartData {
  cycleLengths: { month: string; length: number }[];
  symptoms: { symptom: string; count: number }[];
  weight: { date: string; value: number }[];
  bloodPressure: { date: string; systolic: number; diastolic: number }[];
  glucose: { date: string; value: number }[];
}

export const generateChartData = (): ChartData => {
  const history = getPeriodHistory();
  const symptoms = getSymptomLogs();
  const weight = getWeightEntries();
  const bp = getBloodPressureReadings();
  const glucose = getGlucoseReadings();

  // Cycle lengths over time
  const cycleLengths = history.slice(0, 6).reverse().map((entry, idx) => ({
    month: format(new Date(entry.lastPeriodDate), 'MMM yyyy'),
    length: entry.cycleLength,
  }));

  // Symptom frequency
  const symptomCounts: { [key: string]: number } = {};
  symptoms.forEach((log) => {
    log.symptoms.forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symptom, count]) => ({ symptom, count }));

  // Weight trend (last 30 entries)
  const weightData = weight.slice(0, 30).reverse().map((entry) => ({
    date: format(new Date(entry.date), 'MMM dd'),
    value: entry.weight,
  }));

  // Blood pressure trend (last 30 entries)
  const bpData = bp.slice(0, 30).reverse().map((entry) => ({
    date: format(new Date(entry.date), 'MMM dd'),
    systolic: entry.systolic,
    diastolic: entry.diastolic,
  }));

  // Glucose trend (last 30 entries)
  const glucoseData = glucose.slice(0, 30).reverse().map((entry) => ({
    date: format(new Date(entry.date), 'MMM dd'),
    value: entry.glucose,
  }));

  return {
    cycleLengths,
    symptoms: topSymptoms,
    weight: weightData,
    bloodPressure: bpData,
    glucose: glucoseData,
  };
};

export const generatePDFMedicalReport = async (): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Medical Cycle Report', margin, yPos);
  yPos += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, margin, yPos);
  yPos += 15;

  // Patient Information Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Patient Information', margin, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const history = getPeriodHistory();
  if (history.length > 0) {
    const lastPeriod = history[0];
    pdf.text(`Last Period Date: ${format(new Date(lastPeriod.lastPeriodDate), 'MMMM dd, yyyy')}`, margin, yPos);
    yPos += 6;
    pdf.text(`Average Cycle Length: ${lastPeriod.cycleLength} days`, margin, yPos);
    yPos += 6;
    pdf.text(`Period Duration: ${lastPeriod.periodDuration} days`, margin, yPos);
    yPos += 10;
  }

  // Cycle History Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Menstrual Cycle History', margin, yPos);
  yPos += 8;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  
  // Table headers
  const colWidths = [50, 40, 40];
  const headers = ['Last Period Date', 'Cycle Length', 'Duration'];
  headers.forEach((header, i) => {
    const xPos = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text(header, xPos, yPos);
  });
  yPos += 6;

  // Table rows
  pdf.setFont('helvetica', 'normal');
  history.slice(0, 10).forEach((entry) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = margin;
    }
    
    const row = [
      format(new Date(entry.lastPeriodDate), 'MM/dd/yyyy'),
      `${entry.cycleLength} days`,
      `${entry.periodDuration} days`,
    ];
    
    row.forEach((cell, i) => {
      const xPos = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      pdf.text(cell, xPos, yPos);
    });
    yPos += 6;
  });
  yPos += 10;

  // Symptoms Section
  if (yPos > pageHeight - 50) {
    pdf.addPage();
    yPos = margin;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Most Common Symptoms', margin, yPos);
  yPos += 8;

  const chartData = generateChartData();
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  chartData.symptoms.forEach((symptom) => {
    pdf.text(`• ${symptom.symptom}: ${symptom.count} occurrences`, margin + 5, yPos);
    yPos += 6;
  });
  yPos += 10;

  // Medications Section
  if (yPos > pageHeight - 50) {
    pdf.addPage();
    yPos = margin;
  }

  const medications = loadMedications();
  if (medications.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Current Medications', margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    medications.forEach((med) => {
      if (yPos > pageHeight - 20) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.text(`• ${med.name} - ${med.dosage} (${med.frequency})`, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 10;
  }

  // Health Metrics Summary
  if (yPos > pageHeight - 50) {
    pdf.addPage();
    yPos = margin;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Health Metrics Summary', margin, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  // Weight summary
  const weightEntries = getWeightEntries();
  if (weightEntries.length > 0) {
    const avgWeight = weightEntries.reduce((sum, e) => sum + e.weight, 0) / weightEntries.length;
    pdf.text(`Average Weight: ${avgWeight.toFixed(1)} kg`, margin + 5, yPos);
    yPos += 6;
  }

  // Blood Pressure summary
  const bpReadings = getBloodPressureReadings();
  if (bpReadings.length > 0) {
    const avgSystolic = bpReadings.reduce((sum, e) => sum + e.systolic, 0) / bpReadings.length;
    const avgDiastolic = bpReadings.reduce((sum, e) => sum + e.diastolic, 0) / bpReadings.length;
    pdf.text(`Average BP: ${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg`, margin + 5, yPos);
    yPos += 6;
  }

  // Glucose summary
  const glucoseReadings = getGlucoseReadings();
  if (glucoseReadings.length > 0) {
    const avgGlucose = glucoseReadings.reduce((sum, e) => sum + e.glucose, 0) / glucoseReadings.length;
    pdf.text(`Average Glucose: ${avgGlucose.toFixed(0)} mg/dL`, margin + 5, yPos);
    yPos += 6;
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(100);
  const footerY = pageHeight - 10;
  pdf.text('This report is generated for medical consultation purposes only.', margin, footerY);
  pdf.text('Period & Pregnancy Tracker App', margin, footerY + 4);

  // Save PDF
  pdf.save(`medical-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const generatePDFWithCharts = async (chartElements: HTMLElement[]): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Medical Cycle Report with Visualizations', margin, yPos);
  yPos += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, margin, yPos);
  yPos += 20;

  // Add charts as images
  for (let i = 0; i < chartElements.length; i++) {
    const element = chartElements[i];
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (yPos + imgHeight > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
    }

    pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
    yPos += imgHeight + 10;
  }

  // Save PDF
  pdf.save(`medical-report-with-charts-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
