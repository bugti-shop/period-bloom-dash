// Import all fetal development images
import week4 from "@/assets/fetus-week-4.jpg";
import week5 from "@/assets/fetus-week-5.jpg";
import week6 from "@/assets/fetus-week-6.jpg";
import week7 from "@/assets/fetus-week-7.jpg";
import week8 from "@/assets/fetus-week-8.jpg";
import week9 from "@/assets/fetus-week-9.jpg";
import week10 from "@/assets/fetus-week-10.jpg";
import week11 from "@/assets/fetus-week-11.jpg";
import week12 from "@/assets/fetus-week-12.jpg";
import week13 from "@/assets/fetus-week-13.jpg";
import week14 from "@/assets/fetus-week-14.jpg";
import week15 from "@/assets/fetus-week-15.jpg";
import week16 from "@/assets/fetus-week-16.jpg";
import week17 from "@/assets/fetus-week-17.jpg";
import week18 from "@/assets/fetus-week-18.jpg";
import week19 from "@/assets/fetus-week-19.jpg";
import week20 from "@/assets/fetus-week-20.jpg";
import week21 from "@/assets/fetus-week-21.jpg";
import week22 from "@/assets/fetus-week-22.jpg";
import week23 from "@/assets/fetus-week-23.jpg";
import week24 from "@/assets/fetus-week-24.jpg";
import week25 from "@/assets/fetus-week-25.jpg";
import week26 from "@/assets/fetus-week-26.jpg";
import week27 from "@/assets/fetus-week-27.jpg";
import week28 from "@/assets/fetus-week-28.jpg";
import week29 from "@/assets/fetus-week-29.jpg";
import week30 from "@/assets/fetus-week-30.jpg";
import week31 from "@/assets/fetus-week-31.jpg";
import week32 from "@/assets/fetus-week-32.jpg";
import week33 from "@/assets/fetus-week-33.jpg";
import week34 from "@/assets/fetus-week-34.jpg";
import week35 from "@/assets/fetus-week-35.jpg";
import week36 from "@/assets/fetus-week-36.jpg";
import week37 from "@/assets/fetus-week-37.jpg";
import week38 from "@/assets/fetus-week-38.jpg";
import week39 from "@/assets/fetus-week-39.jpg";
import week40 from "@/assets/fetus-week-40.jpg";

// Map each week to its corresponding image
const fetalImageMap: Record<number, string> = {
  1: week4,  // Early weeks use week 4 image
  2: week4,
  3: week4,
  4: week4,
  5: week5,
  6: week6,
  7: week7,
  8: week8,
  9: week9,
  10: week10,
  11: week11,
  12: week12,
  13: week13,
  14: week14,
  15: week15,
  16: week16,
  17: week17,
  18: week18,
  19: week19,
  20: week20,
  21: week21,
  22: week22,
  23: week23,
  24: week24,
  25: week25,
  26: week26,
  27: week27,
  28: week28,
  29: week29,
  30: week30,
  31: week31,
  32: week32,
  33: week33,
  34: week34,
  35: week35,
  36: week36,
  37: week37,
  38: week38,
  39: week39,
  40: week40,
};

export const getFetalImageForWeek = (week: number): string => {
  // Clamp week between 1 and 40
  const clampedWeek = Math.max(1, Math.min(40, week));
  return fetalImageMap[clampedWeek] || week4;
};
