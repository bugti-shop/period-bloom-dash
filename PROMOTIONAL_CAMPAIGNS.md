# Promotional Campaigns System

A comprehensive system for creating and managing time-limited bonus reward campaigns for your partner referral program.

## Features

### 1. **Campaign Types**
- **Multiplier Campaigns**: Multiply base rewards (e.g., 2x, 3x rewards)
- **Fixed Bonus**: Add a fixed amount to each reward (e.g., +$10, +$20)
- **Percentage Increase**: Increase rewards by a percentage (e.g., +50%, +100%)

### 2. **Automatic Management**
- **Scheduled Activation**: Campaigns automatically activate at their start date
- **Auto-Expiration**: Campaigns automatically expire at their end date or when max uses is reached
- **Cron Integration**: Hourly automated status updates via Supabase cron jobs

### 3. **Campaign Features**
- Custom campaign codes for easy sharing
- Usage limits (max number of times campaign can be used)
- Target specific reward types (credits, discounts, etc.)
- Custom banner text and colors for user-facing displays
- Public/private campaign visibility

### 4. **Analytics & Tracking**
- Real-time campaign participation tracking
- Individual user bonus earnings
- Campaign usage statistics
- Detailed audit trail of all campaign rewards

## How to Use

### Creating a Campaign

1. Navigate to Partner Dashboard → Campaigns tab
2. Click "New Campaign"
3. Fill in the campaign details:
   - **Name**: Descriptive name (e.g., "Holiday Double Rewards")
   - **Campaign Code**: Unique code for sharing (e.g., "HOLIDAY2X")
   - **Bonus Type**: Choose multiplier, fixed bonus, or percentage increase
   - **Bonus Value**: The value of the bonus
   - **Start/End Dates**: Campaign duration
   - **Max Uses**: Optional limit on total uses
   - **Banner Text**: Message shown to users
   - **Banner Color**: Hex color for the banner

4. Set status:
   - **Draft**: Not yet ready to launch
   - **Scheduled**: Will automatically activate at start date
   - **Active**: Manually activate immediately

### Campaign Examples

#### Holiday 2x Rewards
```
Name: Holiday Double Rewards
Code: HOLIDAY2X
Type: Multiplier
Value: 2
Dates: Dec 20 - Dec 31
Banner: 🎄 Holiday Special: 2x Rewards on All Referrals!
```

#### New User Welcome Bonus
```
Name: New Year Bonus
Code: NEWYEAR20
Type: Fixed Bonus
Value: 20
Dates: Jan 1 - Jan 15
Banner: 🎉 New Year Bonus: Extra $20 per referral!
```

#### Valentine's Promotion
```
Name: Valentine Week Special
Code: VDAY50
Type: Percentage Increase
Value: 50
Dates: Feb 10 - Feb 17
Banner: 💝 Valentine Special: +50% Rewards!
```

## How It Works

### For Partners

1. **Active Campaign Display**: Partners see campaign banners on their dashboard
2. **Automatic Bonus Application**: When a referral is confirmed during an active campaign, the bonus is automatically calculated and added
3. **Campaign Stats**: View total bonus earnings and campaign participation
4. **Reward Breakdown**: See base reward + campaign bonus in reward details

### For Users

1. **Campaign Banner**: Users see active campaign banners when using the app
2. **Bonus Notifications**: Real-time notifications when earning bonus rewards
3. **Transparent Rewards**: Clear breakdown showing base reward and campaign bonus

### Automatic Reward Distribution

When a referral is confirmed during an active campaign:

1. System checks for active campaigns
2. Finds the best matching campaign (highest bonus value)
3. Calculates bonus based on campaign type:
   - Multiplier: `base_value × (multiplier - 1)` → bonus
   - Fixed Bonus: `+bonus_value` → bonus
   - Percentage: `base_value × (percentage / 100)` → bonus
4. Creates reward record with total value (base + bonus)
5. Logs campaign participation
6. Updates campaign usage count

### Status Management

Campaigns transition through states automatically:

```
Draft → Scheduled → Active → Expired
         (at start)   (at end)
                      
Draft/Scheduled → Cancelled (manual)
Active → Cancelled (manual)
```

The cron job runs hourly to:
- Activate scheduled campaigns that reached their start date
- Expire active campaigns that passed their end date
- Expire campaigns that reached max uses

## Database Schema

### promotional_campaigns
- Campaign configuration and settings
- Status tracking and scheduling
- Usage limits and targeting

### campaign_rewards
- Individual reward instances from campaigns
- Tracks base value, bonus value, and total
- Links to referrals and users

### campaign_participants
- User participation in campaigns
- Aggregated stats per user per campaign
- Total rewards earned and bonuses

## API Integration

### Edge Functions

**update-campaign-statuses**
- Automatically called by cron every hour
- Updates campaign statuses based on dates and usage
- Returns summary of status changes

**distribute_referral_reward**
- Enhanced to check for active campaigns
- Automatically applies campaign bonuses
- Records campaign rewards

### Database Functions

**get_active_campaigns()**
- Returns all currently active public campaigns

**calculate_campaign_bonus()**
- Calculates bonus amount based on type and value

**apply_campaign_bonus_to_reward()**
- Applies best matching campaign to a reward
- Records campaign participation
- Updates usage counts

## Best Practices

1. **Plan Ahead**: Schedule campaigns in advance
2. **Clear Messaging**: Use descriptive banners that explain the bonus
3. **Monitor Usage**: Set max_uses to prevent budget overruns
4. **Test First**: Use draft status to validate settings
5. **Timely Updates**: Let cron handle status changes, or manually activate when needed
6. **Track Performance**: Review campaign_rewards table for insights

## Security

- RLS policies ensure users only see public active campaigns
- Admin access required for campaign management
- Automatic bonus calculation prevents manipulation
- Audit trail of all campaign-related rewards

## Troubleshooting

**Campaign not activating:**
- Check start_date is in the past
- Verify status is 'scheduled' or 'active'
- Ensure is_public is true
- Wait for next cron run (hourly)

**Bonus not applied:**
- Confirm campaign is active during referral confirmation
- Check applies_to_reward_types matches the reward type
- Verify max_uses not reached
- Review edge function logs

**Banner not showing:**
- Clear localStorage to reset dismissed banners
- Verify campaign status is 'active'
- Check campaign end_date hasn't passed
