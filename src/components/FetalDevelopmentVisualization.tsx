import { getFetalImageForWeek } from "@/lib/fetalImageMapping";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface FetalDevelopmentVisualizationProps {
  week: number;
  onWeekChange?: (week: number) => void;
}

export const FetalDevelopmentVisualization = ({ week, onWeekChange }: FetalDevelopmentVisualizationProps) => {
  const [currentWeek, setCurrentWeek] = useState(week);
  const [isAnimating, setIsAnimating] = useState(false);
  const fetalImage = getFetalImageForWeek(currentWeek);

  useEffect(() => {
    setCurrentWeek(week);
  }, [week]);

  const handleWeekChange = (newWeek: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentWeek(newWeek);
      onWeekChange?.(newWeek);
      setIsAnimating(false);
    }, 150);
  };

  const handlePrevious = () => {
    if (currentWeek > 1) {
      handleWeekChange(currentWeek - 1);
    }
  };

  const handleNext = () => {
    if (currentWeek < 40) {
      handleWeekChange(currentWeek + 1);
    }
  };

  const handleSliderChange = (value: number[]) => {
    handleWeekChange(value[0]);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-2xl font-bold text-gray-900">Week {currentWeek}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentWeek === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentWeek === 40}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      <div className={`flex items-center justify-center py-4 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <img 
          src={fetalImage} 
          alt={`Fetal development at week ${currentWeek}`}
          className="w-full max-w-sm h-auto rounded-xl object-cover"
        />
      </div>

      <div className="mt-6 px-2">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Week 1</span>
          <span className="font-semibold text-primary">Week {currentWeek}</span>
          <span>Week 40</span>
        </div>
        <Slider
          value={[currentWeek]}
          onValueChange={handleSliderChange}
          min={1}
          max={40}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>First Trimester</span>
          <span>Second Trimester</span>
          <span>Third Trimester</span>
        </div>
      </div>

      <p className="text-xs text-center text-gray-500 mt-4">
        Medically accurate visualization of fetal development
      </p>
    </div>
  );
};
