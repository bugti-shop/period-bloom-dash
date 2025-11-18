import { Calendar, TrendingUp } from "lucide-react";

interface CycleTypeSelectorProps {
  onSelect: (type: 'regular' | 'irregular') => void;
}

export const CycleTypeSelector = ({ onSelect }: CycleTypeSelectorProps) => {
  return (
    <div className="glass-card p-8 rounded-3xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Cycle Type</h2>
        <p className="text-muted-foreground">How would you describe your menstrual cycle?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('regular')}
          className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-transparent hover:border-primary transition-all group"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-white rounded-full group-hover:scale-110 transition-transform">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Regular Cycle</h3>
              <p className="text-sm text-muted-foreground">
                Your periods come at consistent intervals (usually 21-35 days apart)
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect('irregular')}
          className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-transparent hover:border-primary transition-all group"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-white rounded-full group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Irregular Cycle</h3>
              <p className="text-sm text-muted-foreground">
                Your periods vary significantly in timing (more than 7-9 days difference)
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> If you're not sure, choose Regular. You can always switch to Irregular tracking later in settings.
        </p>
      </div>
    </div>
  );
};
