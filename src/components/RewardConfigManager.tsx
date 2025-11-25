import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface RewardConfig {
  id: string;
  name: string;
  reward_type: string;
  reward_value: number;
  reward_unit: string;
  description: string;
  is_active: boolean;
  requires_referral_action: boolean;
  required_action?: string;
}

export const RewardConfigManager = () => {
  const [configs, setConfigs] = useState<RewardConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RewardConfig | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    reward_type: 'credit' | 'discount' | 'trial_extension' | 'premium_access';
    reward_value: number;
    reward_unit: string;
    description: string;
    is_active: boolean;
    requires_referral_action: boolean;
    required_action: string;
  }>({
    name: '',
    reward_type: 'credit',
    reward_value: 10,
    reward_unit: 'dollars',
    description: '',
    is_active: true,
    requires_referral_action: false,
    required_action: ''
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      // Use service role to view all configs (admin access)
      const { data, error } = await supabase
        .from('reward_config')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingConfig) {
        // Update existing config
        const { error } = await supabase
          .from('reward_config')
          .update(formData)
          .eq('id', editingConfig.id);

        if (error) throw error;
        toast.success('Reward configuration updated');
      } else {
        // Create new config
        const { error } = await supabase
          .from('reward_config')
          .insert([formData]);

        if (error) throw error;
        toast.success('Reward configuration created');
      }

      setShowDialog(false);
      setEditingConfig(null);
      resetForm();
      loadConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    }
  };

  const handleEdit = (config: RewardConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      reward_type: config.reward_type as 'credit' | 'discount' | 'trial_extension' | 'premium_access',
      reward_value: config.reward_value,
      reward_unit: config.reward_unit || '',
      description: config.description || '',
      is_active: config.is_active,
      requires_referral_action: config.requires_referral_action,
      required_action: config.required_action || ''
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reward configuration?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reward_config')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Reward configuration deleted');
      loadConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      toast.error('Failed to delete configuration');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      reward_type: 'credit',
      reward_value: 10,
      reward_unit: 'dollars',
      description: '',
      is_active: true,
      requires_referral_action: false,
      required_action: ''
    });
  };

  const handleNewConfig = () => {
    setEditingConfig(null);
    resetForm();
    setShowDialog(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reward Configurations</h2>
          <p className="text-muted-foreground">Manage reward types and values</p>
        </div>
        <Button onClick={handleNewConfig}>
          <Plus className="h-4 w-4 mr-2" />
          New Configuration
        </Button>
      </div>

      <div className="grid gap-4">
        {configs.map((config) => (
          <Card key={config.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {config.name}
                    {!config.is_active && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(config)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(config.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Type</div>
                  <div className="font-medium capitalize">
                    {config.reward_type.replace(/_/g, ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Value</div>
                  <div className="font-medium">
                    {config.reward_value} {config.reward_unit}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Auto-distribute</div>
                  <div className="font-medium">
                    {config.requires_referral_action ? 'No' : 'Yes'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-medium">
                    {config.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Edit' : 'Create'} Reward Configuration
            </DialogTitle>
            <DialogDescription>
              Configure how rewards are distributed to partners and users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Default Credit Reward"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reward_type">Reward Type</Label>
                <Select
                  value={formData.reward_type}
                  onValueChange={(value: 'credit' | 'discount' | 'trial_extension' | 'premium_access') => 
                    setFormData({ ...formData, reward_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="trial_extension">Trial Extension</SelectItem>
                    <SelectItem value="premium_access">Premium Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward_value">Value</Label>
                <Input
                  id="reward_value"
                  type="number"
                  value={formData.reward_value}
                  onChange={(e) =>
                    setFormData({ ...formData, reward_value: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward_unit">Unit</Label>
              <Input
                id="reward_unit"
                value={formData.reward_unit}
                onChange={(e) => setFormData({ ...formData, reward_unit: e.target.value })}
                placeholder="e.g., dollars, percent, days"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this reward"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requires_action"
                checked={formData.requires_referral_action}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requires_referral_action: checked })
                }
              />
              <Label htmlFor="requires_action">Requires User Action</Label>
            </div>

            {formData.requires_referral_action && (
              <div className="space-y-2">
                <Label htmlFor="required_action">Required Action</Label>
                <Input
                  id="required_action"
                  value={formData.required_action}
                  onChange={(e) =>
                    setFormData({ ...formData, required_action: e.target.value })
                  }
                  placeholder="e.g., first_period_log, complete_profile"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingConfig ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
