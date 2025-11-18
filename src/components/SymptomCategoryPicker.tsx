import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage";

interface SymptomCategory {
  name: string;
  symptoms: string[];
}

interface SymptomCategoryPickerProps {
  selectedSymptoms: string[];
  onSymptomToggle: (symptom: string) => void;
}

const symptomCategories: SymptomCategory[] = [
  {
    name: "Ovulation Test Symptoms",
    symptoms: [
      "Positive OPK",
      "High LH Surge",
      "Fertile CM",
      "Cervix Position High",
      "BBT Rise",
    ],
  },
  {
    name: "Sex Symptoms",
    symptoms: [
      "Protected Sex",
      "Unprotected Sex",
      "Withdrawal Method",
      "High Libido",
      "Low Libido",
    ],
  },
  {
    name: "Mood",
    symptoms: [
      "Happy",
      "Anxious",
      "Irritable",
      "Sad",
      "Energetic",
      "Calm",
      "Stressed",
    ],
  },
  {
    name: "Vaginal Discharge",
    symptoms: [
      "Creamy",
      "Watery",
      "Egg White",
      "Sticky",
      "Dry",
      "Spotting",
    ],
  },
  {
    name: "Digestion and Stool",
    symptoms: [
      "Normal",
      "Constipation",
      "Diarrhea",
      "Bloating",
      "Nausea",
      "Stomach Cramps",
    ],
  },
];

export const SymptomCategoryPicker = ({
  selectedSymptoms,
  onSymptomToggle,
}: SymptomCategoryPickerProps) => {
  const [categories, setCategories] = useState<SymptomCategory[]>(symptomCategories);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    symptomCategories.map((cat) => cat.name)
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSymptomName, setNewSymptomName] = useState("");
  const [addingSymptomToCategory, setAddingSymptomToCategory] = useState<string | null>(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  useEffect(() => {
    const customCategories = loadFromLocalStorage<SymptomCategory[]>("custom-symptom-categories");
    if (customCategories && customCategories.length > 0) {
      setCategories([...symptomCategories, ...customCategories]);
    }
  }, []);

  const saveCustomCategories = (updatedCategories: SymptomCategory[]) => {
    const customOnly = updatedCategories.filter(
      cat => !symptomCategories.find(sc => sc.name === cat.name)
    );
    saveToLocalStorage("custom-symptom-categories", customOnly);
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((name) => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const addNewCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory: SymptomCategory = {
      name: newCategoryName.trim(),
      symptoms: [],
    };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    saveCustomCategories(updatedCategories);
    setExpandedCategories([...expandedCategories, newCategory.name]);
    setNewCategoryName("");
    setShowNewCategoryInput(false);
  };

  const addSymptomToCategory = (categoryName: string) => {
    if (!newSymptomName.trim()) return;
    const updatedCategories = categories.map(cat => {
      if (cat.name === categoryName) {
        return { ...cat, symptoms: [...cat.symptoms, newSymptomName.trim()] };
      }
      return cat;
    });
    setCategories(updatedCategories);
    saveCustomCategories(updatedCategories);
    setNewSymptomName("");
    setAddingSymptomToCategory(null);
  };

  const deleteCustomCategory = (categoryName: string) => {
    const updatedCategories = categories.filter(cat => cat.name !== categoryName);
    setCategories(updatedCategories);
    saveCustomCategories(updatedCategories);
  };

  const isCustomCategory = (categoryName: string) => {
    return !symptomCategories.find(sc => sc.name === categoryName);
  };

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const isExpanded = expandedCategories.includes(category.name);
        const categorySymptomCount = category.symptoms.filter((s) =>
          selectedSymptoms.includes(s)
        ).length;

        return (
          <div key={category.name} className="bg-white rounded-xl shadow-sm">
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {category.name}
                </h3>
                {categorySymptomCount > 0 && (
                  <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {categorySymptomCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isCustomCategory(category.name) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCustomCategory(category.name);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-3 space-y-2">
                {category.symptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      checked={selectedSymptoms.includes(symptom)}
                      onCheckedChange={() => onSymptomToggle(symptom)}
                    />
                    <Label
                      htmlFor={symptom}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {symptom}
                    </Label>
                  </div>
                ))}
                
                {/* Add custom symptom to category */}
                {addingSymptomToCategory === category.name ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newSymptomName}
                      onChange={(e) => setNewSymptomName(e.target.value)}
                      placeholder="New symptom name"
                      className="text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") addSymptomToCategory(category.name);
                      }}
                    />
                    <Button
                      onClick={() => addSymptomToCategory(category.name)}
                      size="sm"
                      className="bg-pink-500 hover:bg-pink-600"
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => {
                        setAddingSymptomToCategory(null);
                        setNewSymptomName("");
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingSymptomToCategory(category.name)}
                    className="flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 mt-2"
                  >
                    <Plus className="w-3 h-3" />
                    Add custom symptom
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add new category */}
      {showNewCategoryInput ? (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="text-sm"
              onKeyPress={(e) => {
                if (e.key === "Enter") addNewCategory();
              }}
            />
            <Button
              onClick={addNewCategory}
              size="sm"
              className="bg-pink-500 hover:bg-pink-600"
            >
              Add
            </Button>
            <Button
              onClick={() => {
                setShowNewCategoryInput(false);
                setNewCategoryName("");
              }}
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNewCategoryInput(true)}
          className="w-full bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 flex items-center justify-center gap-2 text-pink-700 hover:from-pink-200 hover:to-purple-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="font-semibold">Create New Category</span>
        </button>
      )}
    </div>
  );
};
