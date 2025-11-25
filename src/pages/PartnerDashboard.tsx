import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, Clock, TrendingUp, Copy, Share2, ChevronLeft, Gift } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { RewardsPanel } from "@/components/RewardsPanel";
import { RewardConfigManager } from "@/components/RewardConfigManager";
import { CampaignManager } from "@/components/CampaignManager";
import { CampaignStats } from "@/components/CampaignStats";
import { AuthProvider } from "@/components/AuthProvider";

interface DashboardStats {
  totalReferrals: number;
  pendingReferrals: number;
  confirmedReferrals: number;
  rewardedReferrals: number;
}

interface DashboardData {
  code: string;
  stats: DashboardStats;
  totalEarnings: number;
  recentActivity: Array<{
    id: string;
    event_type: string;
    created_at: string;
    event_data: any;
  }>;
  shareLink: string;
}

interface Referral {
  id: string;
  referred_user_id: string;
  code_used: string;
  created_at: string;
  status: string;
  confirmed_at?: string;
}

export const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadDashboardData();
    loadReferrals();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('partner-dashboard');
      
      if (error) throw error;
      
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadReferrals = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('partner-referrals', {
        body: { page }
      });
      
      if (error) throw error;
      
      setReferrals(data.referrals);
    } catch (error) {
      console.error('Error loading referrals:', error);
    }
  };

  const copyCode = () => {
    if (dashboardData?.code) {
      navigator.clipboard.writeText(dashboardData.code);
      toast.success('Partner code copied!');
    }
  };

  const shareLink = async () => {
    if (dashboardData?.shareLink) {
      try {
        await navigator.share({
          title: 'Join Lufi',
          text: `Join Lufi using my partner code: ${dashboardData.code}`,
          url: dashboardData.shareLink
        });
      } catch (error) {
        navigator.clipboard.writeText(dashboardData.shareLink);
        toast.success('Share link copied!');
      }
    }
  };

  if (loading) {
    return (
      <AuthProvider requireAuth>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </AuthProvider>
    );
  }

  if (!dashboardData) {
    return (
      <AuthProvider requireAuth>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>No Partner Code</CardTitle>
                <CardDescription>
                  Generate a partner code in Settings to start earning rewards from referrals.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider requireAuth>
      <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Partner Dashboard</h1>
          <p className="text-muted-foreground">Track your referrals and earnings</p>
        </div>

        {/* Partner Code Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Partner Code</CardTitle>
            <CardDescription>Share this code to earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-muted p-4 rounded-lg">
                <div className="text-3xl font-bold text-center">{dashboardData.code}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyCode} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button onClick={shareLink} size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{dashboardData.stats.totalReferrals}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{dashboardData.stats.pendingReferrals}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{dashboardData.stats.confirmedReferrals}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">${dashboardData.totalEarnings.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="referrals" className="w-full">
          <TabsList>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
                <CardDescription>People who joined using your code</CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No referrals yet. Share your code to start earning!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">User {referral.referred_user_id.slice(0, 8)}...</div>
                          <div className="text-sm text-muted-foreground">
                            Joined {new Date(referral.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {referral.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  const { error } = await supabase.functions.invoke(
                                    'partner-confirm-referral',
                                    { body: { referralId: referral.id } }
                                  );
                                  if (error) throw error;
                                  toast.success('Referral confirmed and reward distributed!');
                                  loadReferrals();
                                } catch (error) {
                                  console.error('Error confirming referral:', error);
                                  toast.error('Failed to confirm referral');
                                }
                              }}
                            >
                              Confirm & Reward
                            </Button>
                          )}
                          <div className={`px-3 py-1 rounded-full text-sm ${
                            referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            referral.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {referral.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="mt-6">
            <div className="space-y-6">
              <CampaignStats />
              <RewardsPanel />
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <CampaignManager />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your partner program activity history</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData.recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.recentActivity.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border-b">
                        <div>
                          <div className="font-medium capitalize">
                            {event.event_type.replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <RewardConfigManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AuthProvider>
  );
};
