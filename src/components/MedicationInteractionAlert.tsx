import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getCurrentMedicationInteractions,
  getSeverityColor,
  getSeverityLabel,
  type DrugInteraction,
} from "@/lib/medicationInteractionChecker";

export const MedicationInteractionAlert = () => {
  const interactions = getCurrentMedicationInteractions();

  if (interactions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {interactions.map((interaction, index) => (
        <Alert
          key={index}
          variant={interaction.severity === 'severe' ? 'destructive' : 'default'}
          className={getSeverityColor(interaction.severity)}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-semibold">
            {getSeverityLabel(interaction.severity)} Interaction Detected
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p className="font-medium">
              {interaction.drug1} + {interaction.drug2}
            </p>
            <p className="text-sm">{interaction.description}</p>
            <div className="flex items-start gap-2 mt-2 p-2 bg-white/50 rounded">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{interaction.recommendation}</p>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
