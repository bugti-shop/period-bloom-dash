import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  initializeRevenueCat,
  getCustomerInfo,
  hasProAccess,
  getOfferings,
  purchasePackage,
  restorePurchases,
  SubscriptionInfo,
  OfferingInfo,
  PRODUCT_IDS,
  BASE_PLANS,
  OFFER_IDS,
} from '@/lib/revenueCat';

interface UseRevenueCatReturn {
  isInitialized: boolean;
  isLoading: boolean;
  isPro: boolean;
  subscriptionInfo: SubscriptionInfo | null;
  offerings: OfferingInfo | null;
  error: string | null;
  purchaseMonthly: () => Promise<{ success: boolean; error?: string }>;
  purchaseYearly: () => Promise<{ success: boolean; error?: string }>;
  restore: () => Promise<{ success: boolean; error?: string }>;
  refreshStatus: () => Promise<void>;
}

export const useRevenueCat = (): UseRevenueCatReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [offerings, setOfferings] = useState<OfferingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize RevenueCat
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);

        if (!Capacitor.isNativePlatform()) {
          console.log('RevenueCat: Web mode - limited functionality');
          setIsLoading(false);
          return;
        }

        if (!Capacitor.isNativePlatform()) {
          console.log('RevenueCat: Web mode - limited functionality');
          setIsLoading(false);
          return;
        }

        const initialized = await initializeRevenueCat();
        setIsInitialized(initialized);

        if (initialized) {
          // Get customer info and offerings in parallel
          const [customerInfo, availableOfferings, hasPro] = await Promise.all([
            getCustomerInfo(),
            getOfferings(),
            hasProAccess(),
          ]);

          setSubscriptionInfo(customerInfo);
          setOfferings(availableOfferings);
          setIsPro(hasPro);
        }
      } catch (err: any) {
        console.error('RevenueCat hook: Initialization error', err);
        setError(err.message || 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Refresh subscription status
  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!Capacitor.isNativePlatform()) {
        setIsLoading(false);
        return;
      }

      if (!Capacitor.isNativePlatform()) {
        setIsLoading(false);
        return;
      }

      const [customerInfo, hasPro] = await Promise.all([
        getCustomerInfo(),
        hasProAccess(),
      ]);

      setSubscriptionInfo(customerInfo);
      setIsPro(hasPro);
    } catch (err: any) {
      console.error('RevenueCat hook: Refresh error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Purchase monthly subscription
  const purchaseMonthly = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to find monthly package in offerings
      if (offerings?.packages) {
        const monthlyPackage = offerings.packages.find(
          pkg => pkg.identifier === '$rc_monthly' || 
                 pkg.product.identifier === PRODUCT_IDS.MONTHLY
        );

        if (monthlyPackage) {
          const result = await purchasePackage(monthlyPackage.identifier);
          
          if (result.success && result.customerInfo) {
            setSubscriptionInfo(result.customerInfo);
            setIsPro(result.customerInfo.isPro);
            return { success: true };
          }
          
          if (result.userCancelled) {
            return { success: false, error: 'Purchase cancelled' };
          }
          
          return { success: false, error: result.error };
        }
      }

      return { success: false, error: 'Monthly package not found' };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [offerings]);

  // Purchase yearly subscription
  const purchaseYearly = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to find yearly package in offerings
      if (offerings?.packages) {
        const yearlyPackage = offerings.packages.find(
          pkg => pkg.identifier === '$rc_annual' || 
                 pkg.product.identifier === PRODUCT_IDS.YEARLY
        );

        if (yearlyPackage) {
          const result = await purchasePackage(yearlyPackage.identifier);
          
          if (result.success && result.customerInfo) {
            setSubscriptionInfo(result.customerInfo);
            setIsPro(result.customerInfo.isPro);
            return { success: true };
          }
          
          if (result.userCancelled) {
            return { success: false, error: 'Purchase cancelled' };
          }
          
          return { success: false, error: result.error };
        }
      }

      return { success: false, error: 'Yearly package not found' };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [offerings]);

  // Restore purchases
  const restore = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await restorePurchases();
      
      if (result.success && result.customerInfo) {
        setSubscriptionInfo(result.customerInfo);
        setIsPro(result.customerInfo.isPro);
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isInitialized,
    isLoading,
    isPro,
    subscriptionInfo,
    offerings,
    error,
    purchaseMonthly,
    purchaseYearly,
    restore,
    refreshStatus,
  };
};
