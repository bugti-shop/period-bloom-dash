import { Button } from "@/components/ui/button";

interface OvulationInfoProps {
  onEditClick: () => void;
  currentDate: Date;
}

export const OvulationInfo = ({ onEditClick }: OvulationInfoProps) => {
  return (
    <div className="flex justify-center">
      <Button
        onClick={onEditClick}
        variant="outline"
        className="w-full max-w-md bg-background hover:bg-accent"
      >
        Update Periods
      </Button>
    </div>
  );
};
