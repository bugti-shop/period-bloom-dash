import { useState } from "react";
import { useMobileBackButton } from "@/hooks/useMobileBackButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, DollarSign, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveProductLog, getProductLogs, deleteProductLog, getProductUsageStats } from "@/lib/periodProductStorage";
import { format } from "date-fns";

export default function PeriodProductPage() {
  const navigate = useNavigate();
  useMobileBackButton();
  const { toast } = useToast();
  const [productType, setProductType] = useState<"pad" | "tampon" | "cup" | "liner">("pad");
  const [brand, setBrand] = useState("");
  const [cost, setCost] = useState("");
  const [logs, setLogs] = useState(getProductLogs());
  const stats = getProductUsageStats();

  const handleAddLog = () => {
    if (!cost || isNaN(Number(cost))) {
      toast({
        title: "Invalid cost",
        description: "Please enter a valid cost",
        variant: "destructive",
      });
      return;
    }

    saveProductLog({
      date: new Date(),
      productType,
      brand: brand || undefined,
      cost: Number(cost),
    });

    setLogs(getProductLogs());
    setBrand("");
    setCost("");

    toast({
      title: "Product logged",
      description: "Product usage has been recorded",
    });
  };

  const handleDelete = (id: string) => {
    deleteProductLog(id);
    setLogs(getProductLogs());
    toast({
      title: "Entry deleted",
      description: "Product log has been removed",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Period Product Tracker</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Usage Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Cost</p>
              <p className="text-2xl font-bold text-primary">${stats.monthlyCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Used (30 days)</p>
              <p className="text-2xl font-bold">{stats.totalUsed}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Usage Breakdown</p>
            <div className="space-y-2">
              {Object.entries(stats.usageByType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="capitalize">{type}s</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Log Product Usage</h2>
          
          <div className="space-y-4">
            <div>
              <Label>Product Type</Label>
              <Select value={productType} onValueChange={(value: any) => setProductType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pad">Pad</SelectItem>
                  <SelectItem value="tampon">Tampon</SelectItem>
                  <SelectItem value="cup">Menstrual Cup</SelectItem>
                  <SelectItem value="liner">Liner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Brand (Optional)</Label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Always, Tampax"
              />
            </div>

            <div>
              <Label>Cost ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <Button onClick={handleAddLog} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Log Product
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Logs</h2>
          
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No product logs yet</p>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 20).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium capitalize">{log.productType}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(log.date, "MMM dd, yyyy")}
                        {log.brand && ` • ${log.brand}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">${log.cost?.toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(log.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
