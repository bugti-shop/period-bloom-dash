import { getSymptomLogs } from "./symptomLog";
import { getAllMoodLogs } from "./moodLog";
import { format, parseISO } from "date-fns";

export const generateSymptomPDF = () => {
  const symptomLogs = getSymptomLogs();
  const moodLogs = getAllMoodLogs();

  // Create HTML for PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Symptom Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #EC4899;
          padding-bottom: 20px;
        }
        h1 {
          color: #EC4899;
          margin: 0;
        }
        .date {
          color: #666;
          font-size: 14px;
        }
        .summary {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .summary-item {
          margin: 10px 0;
          font-size: 16px;
        }
        .entry {
          margin: 20px 0;
          padding: 15px;
          border-left: 4px solid #EC4899;
          background: #fafafa;
        }
        .entry-date {
          font-weight: bold;
          color: #EC4899;
          margin-bottom: 10px;
        }
        .symptoms {
          margin: 10px 0;
        }
        .symptom-tag {
          display: inline-block;
          background: #EC4899;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          margin: 4px;
          font-size: 14px;
        }
        .mood {
          color: #666;
          font-style: italic;
        }
        .chart-container {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        .chart-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #333;
        }
        .bar-chart {
          margin: 20px 0;
        }
        .bar-item {
          margin: 10px 0;
        }
        .bar-label {
          display: inline-block;
          width: 150px;
          font-size: 14px;
        }
        .bar {
          display: inline-block;
          background: #EC4899;
          height: 25px;
          border-radius: 4px;
          vertical-align: middle;
        }
        .bar-value {
          margin-left: 10px;
          font-weight: bold;
        }
        @media print {
          body { padding: 20px; }
          .entry { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Symptom & Mood Report</h1>
        <p class="date">Generated on ${format(new Date(), "MMMM dd, yyyy")}</p>
      </div>

      ${generateSummarySection(symptomLogs, moodLogs)}
      ${generateChartSection(symptomLogs)}
      ${generateEntriesSection(symptomLogs, moodLogs)}

      <script>
        window.onload = function() {
          setTimeout(() => {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
};

const generateSummarySection = (symptomLogs: any[], moodLogs: any[]) => {
  const symptomCounts: { [key: string]: number } = {};
  const moodCounts: { [key: string]: number } = {};

  symptomLogs.forEach(log => {
    log.symptoms.forEach((symptom: string) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  moodLogs.forEach(log => {
    moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
  });

  const topSymptoms = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([symptom]) => formatSymptomName(symptom));

  const topMood = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

  return `
    <div class="summary">
      <h2>Summary</h2>
      <div class="summary-item"><strong>Total Entries:</strong> ${symptomLogs.length}</div>
      <div class="summary-item"><strong>Most Common Symptoms:</strong> ${topSymptoms.join(", ") || "None"}</div>
      <div class="summary-item"><strong>Most Frequent Mood:</strong> ${topMood}</div>
      <div class="summary-item"><strong>Date Range:</strong> ${symptomLogs.length > 0 ? 
        `${format(parseISO(symptomLogs[symptomLogs.length - 1].date), "MMM dd, yyyy")} - ${format(parseISO(symptomLogs[0].date), "MMM dd, yyyy")}` 
        : "N/A"}</div>
    </div>
  `;
};

const generateChartSection = (symptomLogs: any[]) => {
  const symptomCounts: { [key: string]: number } = {};

  symptomLogs.forEach(log => {
    log.symptoms.forEach((symptom: string) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  const sortedSymptoms = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const maxCount = Math.max(...sortedSymptoms.map(([, count]) => count));

  return `
    <div class="chart-container">
      <div class="chart-title">Symptom Frequency</div>
      <div class="bar-chart">
        ${sortedSymptoms.map(([symptom, count]) => `
          <div class="bar-item">
            <span class="bar-label">${formatSymptomName(symptom)}</span>
            <span class="bar" style="width: ${(count / maxCount) * 400}px;"></span>
            <span class="bar-value">${count}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
};

const generateEntriesSection = (symptomLogs: any[], moodLogs: any[]) => {
  return `
    <h2>Detailed Entries</h2>
    ${symptomLogs.slice(0, 30).map(log => {
      const moodLog = moodLogs.find(m => m.date === log.date);
      return `
        <div class="entry">
          <div class="entry-date">${format(parseISO(log.date), "EEEE, MMMM dd, yyyy")}</div>
          ${log.symptoms.length > 0 ? `
            <div class="symptoms">
              <strong>Symptoms:</strong><br>
              ${log.symptoms.map((symptom: string) => 
                `<span class="symptom-tag">${formatSymptomName(symptom)}</span>`
              ).join("")}
            </div>
          ` : ""}
          ${moodLog ? `
            <div class="mood">
              <strong>Mood:</strong> ${moodLog.mood}${moodLog.notes ? ` - ${moodLog.notes}` : ""}
            </div>
          ` : ""}
        </div>
      `;
    }).join("")}
  `;
};

const formatSymptomName = (symptom: string) => {
  return symptom
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
