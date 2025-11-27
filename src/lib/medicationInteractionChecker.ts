import { loadMedications, type Medication } from './medicationStorage';

export interface DrugInteraction {
  severity: 'minor' | 'moderate' | 'severe';
  drug1: string;
  drug2: string;
  description: string;
  recommendation: string;
}

// Common medication interactions database
// Note: This is a simplified version. In production, use a comprehensive drug interaction API
const KNOWN_INTERACTIONS: { [key: string]: { [key: string]: DrugInteraction } } = {
  // Birth Control Pills
  'birth control': {
    'antibiotics': {
      severity: 'moderate',
      drug1: 'Birth Control Pills',
      drug2: 'Antibiotics',
      description: 'Some antibiotics (rifampin, rifabutin) may reduce the effectiveness of hormonal contraceptives.',
      recommendation: 'Use backup contraception method while taking antibiotics and for 7 days after completion.',
    },
    'st john\'s wort': {
      severity: 'moderate',
      drug1: 'Birth Control Pills',
      drug2: 'St. John\'s Wort',
      description: 'St. John\'s Wort can reduce the effectiveness of birth control pills.',
      recommendation: 'Avoid St. John\'s Wort while using hormonal contraceptives or use additional contraception.',
    },
  },
  
  // Iron Supplements
  'iron': {
    'calcium': {
      severity: 'minor',
      drug1: 'Iron Supplements',
      drug2: 'Calcium',
      description: 'Calcium can interfere with iron absorption when taken together.',
      recommendation: 'Take iron and calcium supplements at least 2 hours apart.',
    },
    'antacids': {
      severity: 'minor',
      drug1: 'Iron Supplements',
      drug2: 'Antacids',
      description: 'Antacids can reduce iron absorption.',
      recommendation: 'Take iron supplements 2 hours before or 4 hours after antacids.',
    },
  },
  
  // Folic Acid
  'folic acid': {
    'methotrexate': {
      severity: 'moderate',
      drug1: 'Folic Acid',
      drug2: 'Methotrexate',
      description: 'Folic acid may reduce the effectiveness of methotrexate.',
      recommendation: 'Consult your doctor about timing and dosage when taking both.',
    },
  },
  
  // Prenatal Vitamins
  'prenatal vitamins': {
    'calcium': {
      severity: 'minor',
      drug1: 'Prenatal Vitamins',
      drug2: 'Extra Calcium',
      description: 'Taking additional calcium with prenatal vitamins may cause excessive calcium intake.',
      recommendation: 'Check if your prenatal vitamin already contains adequate calcium before adding supplements.',
    },
  },
  
  // NSAIDs (Ibuprofen, Aspirin)
  'ibuprofen': {
    'aspirin': {
      severity: 'moderate',
      drug1: 'Ibuprofen',
      drug2: 'Aspirin',
      description: 'Taking ibuprofen and aspirin together can increase risk of stomach bleeding.',
      recommendation: 'Avoid taking both unless directed by your healthcare provider.',
    },
  },
  
  // Vitamin D
  'vitamin d': {
    'calcium': {
      severity: 'minor',
      drug1: 'Vitamin D',
      drug2: 'Calcium',
      description: 'While vitamin D helps calcium absorption, excessive amounts of both can cause hypercalcemia.',
      recommendation: 'Follow recommended daily allowances and do not exceed without medical supervision.',
    },
  },
};

const normalizeMedicationName = (name: string): string => {
  return name.toLowerCase().trim();
};

const findInteractionKey = (medName: string): string | null => {
  const normalized = normalizeMedicationName(medName);
  
  // Direct match
  if (KNOWN_INTERACTIONS[normalized]) {
    return normalized;
  }
  
  // Partial match (check if medication name contains interaction key)
  for (const key of Object.keys(KNOWN_INTERACTIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return key;
    }
  }
  
  return null;
};

export const checkMedicationInteractions = (medications: Medication[]): DrugInteraction[] => {
  const interactions: DrugInteraction[] = [];
  
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const med1 = medications[i];
      const med2 = medications[j];
      
      const key1 = findInteractionKey(med1.name);
      const key2 = findInteractionKey(med2.name);
      
      if (key1 && KNOWN_INTERACTIONS[key1]?.[key2!]) {
        interactions.push(KNOWN_INTERACTIONS[key1][key2!]);
      } else if (key2 && KNOWN_INTERACTIONS[key2]?.[key1!]) {
        interactions.push(KNOWN_INTERACTIONS[key2][key1!]);
      }
    }
  }
  
  return interactions;
};

export const checkNewMedicationInteractions = (
  newMedication: Medication,
  existingMedications: Medication[]
): DrugInteraction[] => {
  const allMedications = [...existingMedications, newMedication];
  return checkMedicationInteractions(allMedications);
};

export const getCurrentMedicationInteractions = (): DrugInteraction[] => {
  const medications = loadMedications();
  return checkMedicationInteractions(medications);
};

export const getSeverityColor = (severity: DrugInteraction['severity']): string => {
  switch (severity) {
    case 'severe':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'moderate':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'minor':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getSeverityLabel = (severity: DrugInteraction['severity']): string => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};
