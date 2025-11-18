import firstTrimester from "@/assets/fetus-first-trimester.jpg";
import thirdTrimester from "@/assets/fetus-third-trimester.jpg";

export const getFetalImageForWeek = (week: number): string => {
  // Use first trimester image for weeks 1-13, third trimester for weeks 27-40
  if (week <= 13) return firstTrimester;
  return thirdTrimester;
};

// Calculate size scale based on week (incremental growth)
export const getFetalImageScale = (week: number): number => {
  // Week 4-8: very small (40-60px)
  if (week <= 8) return 0.3 + (week - 4) * 0.05;
  // Week 9-13: small (60-90px)
  if (week <= 13) return 0.5 + (week - 8) * 0.08;
  // Week 14-20: medium-small (90-130px)
  if (week <= 20) return 0.7 + (week - 13) * 0.05;
  // Week 21-26: medium (130-160px)
  if (week <= 26) return 1.0 + (week - 20) * 0.05;
  // Week 27-40: larger (160-220px)
  return 1.3 + (week - 26) * 0.04;
};
