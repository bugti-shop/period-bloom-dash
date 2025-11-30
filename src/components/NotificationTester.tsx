import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, AlertCircle } from "lucide-react";
import { LocalNotifications } from '@capacitor/local-notifications';
import { requestNotificationPermission } from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

export const NotificationTester = () => {
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const testNotification = async () => {
    setTesting(true);
    try {
      const hasPermission = await requestNotificationPermission();
      
      if (!hasPermission) {
        toast({
          title: "Permission Required",
          description: "Please enable notifications in your device settings.",
          variant: "destructive",
        });
        setTesting(false);
        return;
      }

      // Schedule a test notification in 5 seconds
      const testDate = new Date();
      testDate.setSeconds(testDate.getSeconds() + 5);

      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Test Notification 🎉",
            body: "Your notifications are working perfectly! You'll receive reminders at your scheduled times.",
            id: 999,
            schedule: { at: testDate },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
          },
        ],
      });

      toast({
        title: "Test Scheduled",
        description: "You'll receive a test notification in 5 seconds.",
      });

      // Show success message after 6 seconds
      setTimeout(() => {
        setTesting(false);
        toast({
          title: "Test Complete",
          description: "If you received the notification, everything is working correctly!",
        });
      }, 6000);
    } catch (error) {
      console.error('Error testing notification:', error);
      toast({
        title: "Test Failed",
        description: "There was an error testing notifications. Please try again.",
        variant: "destructive",
      });
      setTesting(false);
    }
  };

  const viewScheduledNotifications = async () => {
    try {
      const pending = await LocalNotifications.getPending();
      
      if (pending.notifications.length === 0) {
        toast({
          title: "No Scheduled Notifications",
          description: "You don't have any notifications scheduled. Enable reminders in settings.",
        });
      } else {
        toast({
          title: "Scheduled Notifications",
          description: `You have ${pending.notifications.length} notification(s) scheduled.`,
        });
      }
    } catch (error) {
      console.error('Error viewing notifications:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Bell className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Test Notifications</h3>
          <p className="text-sm text-muted-foreground">Verify your reminders work correctly</p>
        </div>
      </div>

      <div className="grid gap-3">
        <Button
          onClick={testNotification}
          disabled={testing}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {testing ? (
            <>
              <AlertCircle className="w-4 h-4 mr-2 animate-pulse" />
              Sending Test...
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Send Test Notification
            </>
          )}
        </Button>

        <Button
          onClick={viewScheduledNotifications}
          variant="outline"
          className="w-full"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          View Scheduled Reminders
        </Button>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-xs text-blue-900">
          <strong>Note:</strong> All notifications are completely offline and work without internet. 
          They will be delivered at the exact time you set, even if the app is closed.
        </p>
      </div>
    </div>
  );
};
