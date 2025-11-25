import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Play, Pause, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";

interface Campaign {
  id: string;
  name: string;
  description: string;
  campaign_code: string;
  status: 'draft' | 'scheduled' | 'active' | 'expired' | 'cancelled';
  bonus_type: 'multiplier' | 'fixed_bonus' | 'percentage_increase';
  bonus_value: number;
  start_date: string;
  end_date: string;
  max_uses: number | null;
  current_uses: number;
  applies_to_reward_types: string[] | null;
  banner_text: string;
  banner_color: string;
  is_public: boolean;
}

export const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_code: '',
    bonus_type: 'multiplier' as 'multiplier' | 'fixed_bonus' | 'percentage_increase',
    bonus_value: 2,
    start_date: '',
    end_date: '',
    max_uses: '',
    applies_to_reward_types: [] as string[],
    banner_text: '',
    banner_color: '#10b981',
    is_public: true,
    status: 'scheduled' as 'draft' | 'scheduled' | 'active'
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const campaignData = {
        ...formData,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        applies_to_reward_types: formData.applies_to_reward_types.length > 0 
          ? formData.applies_to_reward_types 
          : null
      };

      if (editingCampaign) {
        const { error } = await supabase
          .from('promotional_campaigns')
          .update(campaignData)
          .eq('id', editingCampaign.id);

        if (error) throw error;
        toast.success('Campaign updated');
      } else {
        const { error } = await supabase
          .from('promotional_campaigns')
          .insert([campaignData]);

        if (error) throw error;
        toast.success('Campaign created');
      }

      setShowDialog(false);
      setEditingCampaign(null);
      resetForm();
      loadCampaigns();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      campaign_code: campaign.campaign_code || '',
      bonus_type: campaign.bonus_type,
      bonus_value: campaign.bonus_value,
      start_date: campaign.start_date ? format(new Date(campaign.start_date), "yyyy-MM-dd'T'HH:mm") : '',
      end_date: campaign.end_date ? format(new Date(campaign.end_date), "yyyy-MM-dd'T'HH:mm") : '',
      max_uses: campaign.max_uses?.toString() || '',
      applies_to_reward_types: campaign.applies_to_reward_types || [],
      banner_text: campaign.banner_text || '',
      banner_color: campaign.banner_color || '#10b981',
      is_public: campaign.is_public,
      status: (campaign.status === 'expired' || campaign.status === 'cancelled' ? 'draft' : campaign.status) as 'draft' | 'scheduled' | 'active'
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('promotional_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Campaign deleted');
      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'draft' | 'scheduled' | 'active' | 'expired' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('promotional_campaigns')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Campaign ${newStatus}`);
      loadCampaigns();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      campaign_code: '',
      bonus_type: 'multiplier',
      bonus_value: 2,
      start_date: '',
      end_date: '',
      max_uses: '',
      applies_to_reward_types: [],
      banner_text: '',
      banner_color: '#10b981',
      is_public: true,
      status: 'scheduled'
    });
  };

  const getBonusDisplay = (campaign: Campaign) => {
    switch (campaign.bonus_type) {
      case 'multiplier':
        return `${campaign.bonus_value}x rewards`;
      case 'fixed_bonus':
        return `+$${campaign.bonus_value}`;
      case 'percentage_increase':
        return `+${campaign.bonus_value}%`;
      default:
        return campaign.bonus_value.toString();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: "Draft" },
      scheduled: { variant: "outline", label: "Scheduled" },
      active: { variant: "default", label: "Active" },
      expired: { variant: "destructive", label: "Expired" },
      cancelled: { variant: "destructive", label: "Cancelled" }
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Promotional Campaigns</h2>
          <p className="text-muted-foreground">Create time-limited bonus reward campaigns</p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle>{campaign.name}</CardTitle>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                  {campaign.campaign_code && (
                    <div className="mt-2">
                      <Badge variant="outline">Code: {campaign.campaign_code}</Badge>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {campaign.status === 'scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(campaign.id, 'active')}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {campaign.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(campaign.id, 'cancelled')}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleEdit(campaign)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(campaign.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Bonus</div>
                  <div className="font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    {getBonusDisplay(campaign)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Start Date</div>
                  <div className="font-medium">
                    {format(new Date(campaign.start_date), 'MMM d, yyyy')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">End Date</div>
                  <div className="font-medium">
                    {format(new Date(campaign.end_date), 'MMM d, yyyy')}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Usage</div>
                  <div className="font-medium">
                    {campaign.current_uses}
                    {campaign.max_uses && ` / ${campaign.max_uses}`}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Visibility</div>
                  <div className="font-medium">
                    {campaign.is_public ? 'Public' : 'Private'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Edit' : 'Create'} Campaign
            </DialogTitle>
            <DialogDescription>
              Configure a promotional campaign with time-limited bonus rewards
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name*</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Holiday 2x Rewards"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign_code">Campaign Code</Label>
                <Input
                  id="campaign_code"
                  value={formData.campaign_code}
                  onChange={(e) => setFormData({ ...formData, campaign_code: e.target.value })}
                  placeholder="e.g., HOLIDAY2024"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the campaign"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bonus_type">Bonus Type*</Label>
                <Select
                  value={formData.bonus_type}
                  onValueChange={(value: 'multiplier' | 'fixed_bonus' | 'percentage_increase') =>
                    setFormData({ ...formData, bonus_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiplier">Multiplier (e.g., 2x)</SelectItem>
                    <SelectItem value="fixed_bonus">Fixed Bonus (e.g., +$10)</SelectItem>
                    <SelectItem value="percentage_increase">Percentage (e.g., +50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonus_value">Bonus Value*</Label>
                <Input
                  id="bonus_value"
                  type="number"
                  step="0.1"
                  value={formData.bonus_value}
                  onChange={(e) =>
                    setFormData({ ...formData, bonus_value: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date*</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date*</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_uses">Max Uses (optional)</Label>
              <Input
                id="max_uses"
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner_text">Banner Text</Label>
              <Input
                id="banner_text"
                value={formData.banner_text}
                onChange={(e) => setFormData({ ...formData, banner_text: e.target.value })}
                placeholder="e.g., 🎉 Double rewards this week!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner_color">Banner Color</Label>
              <Input
                id="banner_color"
                type="color"
                value={formData.banner_color}
                onChange={(e) => setFormData({ ...formData, banner_color: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_public: checked })
                }
              />
              <Label htmlFor="is_public">Public Campaign</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCampaign ? 'Update' : 'Create'} Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
