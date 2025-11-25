import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Users, Loader2, Image as ImageIcon } from "lucide-react";
import { PhotoWithFaces, groupFacesBySimilarity } from "@/lib/faceDetection";
import { toast } from "sonner";

interface FaceGroupsViewProps {
  photos: PhotoWithFaces[];
  onClose: () => void;
  onPhotoClick: (photoId: string) => void;
  albumType: "bump" | "baby";
}

export const FaceGroupsView = ({
  photos,
  onClose,
  onPhotoClick,
  albumType,
}: FaceGroupsViewProps) => {
  const [groups, setGroups] = useState<Map<string, PhotoWithFaces[]>>(new Map());
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    processGroups();
  }, [photos]);

  const processGroups = () => {
    try {
      const groupedFaces = groupFacesBySimilarity(photos, 0.85);
      setGroups(groupedFaces);
      toast.success(`Found ${groupedFaces.size} unique face groups`);
    } catch (error) {
      console.error("Error grouping faces:", error);
      toast.error("Failed to group faces");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Analyzing Faces...</h3>
          <p className="text-muted-foreground">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border z-10 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Face Groups
                </h2>
                <p className="text-sm text-muted-foreground">
                  Photos organized by detected faces
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {groups.size === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Faces Detected</h3>
              <p className="text-muted-foreground">
                No recognizable faces were found in your photos
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Array.from(groups.entries()).map(([groupKey, groupPhotos], index) => (
                <Card key={groupKey} className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Person {index + 1}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {groupPhotos.length} photo{groupPhotos.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {groupPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => onPhotoClick(photo.id)}
                      >
                        <img
                          src={photo.imageData}
                          alt="Grouped photo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded">
                          {photo.faces.length} face{photo.faces.length > 1 ? "s" : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
