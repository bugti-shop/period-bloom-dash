import todoImg from "@/assets/checklist-todo.png";
import shoppingImg from "@/assets/checklist-shopping.png";
import hospitalBagImg from "@/assets/checklist-hospital-bag.png";
import birthPlanImg from "@/assets/checklist-birth-plan.png";
import notesImg from "@/assets/checklist-notes.png";
import namesImg from "@/assets/checklist-names.png";

const checklists = [
  {
    id: "todo",
    title: "To Do",
    image: todoImg,
    bgColor: "bg-[#f5e6d3]",
  },
  {
    id: "shopping",
    title: "Shopping list",
    image: shoppingImg,
    bgColor: "bg-[#fdd5d5]",
  },
  {
    id: "hospital-bag",
    title: "Hospital Bag",
    image: hospitalBagImg,
    bgColor: "bg-[#d4e8f7]",
  },
  {
    id: "birth-plan",
    title: "Birth plan",
    image: birthPlanImg,
    bgColor: "bg-[#e8d5f0]",
  },
  {
    id: "notes",
    title: "Notes",
    image: notesImg,
    bgColor: "bg-[#d5f0e3]",
  },
  {
    id: "names",
    title: "Names",
    image: namesImg,
    bgColor: "bg-[#d4e8f7]",
  },
];

export const ChecklistsPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Lists</h2>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {checklists.map((checklist) => (
            <div
              key={checklist.id}
              className={`${checklist.bgColor} rounded-3xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg ${
                checklist.id === "hospital-bag" || checklist.id === "names"
                  ? "col-span-2"
                  : ""
              }`}
            >
              <div className="p-6 flex flex-col min-h-[220px]">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {checklist.title}
                </h3>
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={checklist.image}
                    alt={checklist.title}
                    className="w-full h-auto max-h-[200px] object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
