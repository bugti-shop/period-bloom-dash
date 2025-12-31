import { Purchases, LOG_LEVEL, PURCHASES_ERROR_CODE } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// RevenueCat Configuration
const REVENUECAT_API_KEY = 'goog_KCSWYZrkdjueFirVEVSVmyaMhtc';

// Entitlement IDs
export const ENTITLEMENTS = {
  PRO: 'Lufi Pro',
} as const;

// Product IDs
export const PRODUCT_IDS = {
  MONTHLY: 'lufi_mo',
  YEARLY: 'lufi_yr',
} as const;

// Base Plan IDs
export const BASE_PLANS = {
  MONTHLY: 'lufi-mo',
  YEARLY: 'lufi-yearly-plan',
} as const;

// Offer IDs (Free Trials)
export const OFFER_IDS = {
  MONTHLY_TRIAL: 'lufi-monthly-offer',
  YEARLY_TRIAL: 'lufi-yearly-trial',
} as const;

// Types
export interface SubscriptionInfo {
  isActive: boolean;
  isPro: boolean;
  expirationDate: string | null;
  productIdentifier: string | null;
  willRenew: boolean;
}

export interface ProductInfo {
  identifier: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

export interface OfferingInfo {
  identifier: string;
  packages: PackageInfo[];
}

export interface PackageInfo {
  identifier: string;
  product: ProductInfo;
  packageType: string;
}

// Initialize RevenueCat
export const initializeRevenueCat = async (userId?: string): Promise<boolean> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      console.log('RevenueCat: Running in web mode - skipping initialization');
      return false;
    }

    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId || null,
    });

    console.log('RevenueCat: Initialized successfully');
    return true;
  } catch (error) {
    console.error('RevenueCat: Initialization failed', error);
    return false;
  }
};

// Get current customer info
export const getCustomerInfo = async (): Promise<SubscriptionInfo> => {
  const defaultInfo: SubscriptionInfo = {
    isActive: false,
    isPro: false,
    expirationDate: null,
    productIdentifier: null,
    willRenew: false,
  };

  try {
    if (!Capacitor.isNativePlatform()) {
      return defaultInfo;
    }

    const { customerInfo } = await Purchases.getCustomerInfo();
    
    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];
    
    if (proEntitlement) {
      return {
        isActive: true,
        isPro: true,
        expirationDate: proEntitlement.expirationDate || null,
        productIdentifier: proEntitlement.productIdentifier,
        willRenew: proEntitlement.willRenew,
      };
    }

    return defaultInfo;
  } catch (error) {
    console.error('RevenueCat: Failed to get customer info', error);
    return defaultInfo;
  }
};

// Check if user has Pro access
export const hasProAccess = async (): Promise<boolean> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    const { customerInfo } = await Purchases.getCustomerInfo();
    return ENTITLEMENTS.PRO in customerInfo.entitlements.active;
  } catch (error) {
    console.error('RevenueCat: Failed to check pro access', error);
    return false;
  }
};

// Get available offerings
export const getOfferings = async (): Promise<OfferingInfo | null> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      console.log('RevenueCat: Web mode - returning mock offerings');
      return null;
    }

    const offeringsResult = await Purchases.getOfferings();
    
    if (!offeringsResult.current) {
      console.log('RevenueCat: No current offering available');
      return null;
    }

    const currentOffering = offeringsResult.current;
    
    return {
      identifier: currentOffering.identifier,
      packages: currentOffering.availablePackages.map(pkg => ({
        identifier: pkg.identifier,
        product: {
          identifier: pkg.product.identifier,
          title: pkg.product.title,
          description: pkg.product.description,
          price: pkg.product.price,
          priceString: pkg.product.priceString,
          currencyCode: pkg.product.currencyCode,
        },
        packageType: pkg.packageType,
      })),
    };
  } catch (error) {
    console.error('RevenueCat: Failed to get offerings', error);
    return null;
  }
};

// Purchase a package
export const purchasePackage = async (packageIdentifier: string): Promise<{
  success: boolean;
  customerInfo?: SubscriptionInfo;
  error?: string;
  userCancelled?: boolean;
}> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, error: 'Purchases not available in web mode' };
    }

    const offeringsResult = await Purchases.getOfferings();
    
    if (!offeringsResult.current) {
      return { success: false, error: 'No offerings available' };
    }

    const packageToPurchase = offeringsResult.current.availablePackages.find(
      pkg => pkg.identifier === packageIdentifier
    );

    if (!packageToPurchase) {
      return { success: false, error: 'Package not found' };
    }

    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: packageToPurchase,
    });

    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];
    
    return {
      success: true,
      customerInfo: {
        isActive: !!proEntitlement,
        isPro: !!proEntitlement,
        expirationDate: proEntitlement?.expirationDate || null,
        productIdentifier: proEntitlement?.productIdentifier || null,
        willRenew: proEntitlement?.willRenew || false,
      },
    };
  } catch (error: any) {
    console.error('RevenueCat: Purchase failed', error);
    
    // Check if user cancelled
    if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, userCancelled: true };
    }

    return { 
      success: false, 
      error: error.message || 'Purchase failed' 
    };
  }
};

// Purchase a product directly (for specific product/base plan/offer)
export const purchaseProduct = async (
  productId: string,
  basePlanId?: string,
  offerId?: string
): Promise<{
  success: boolean;
  customerInfo?: SubscriptionInfo;
  error?: string;
  userCancelled?: boolean;
}> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, error: 'Purchases not available in web mode' };
    }

    const purchaseOptions: any = {
      productIdentifier: productId,
    };

    // Add Google Play specific options
    if (basePlanId) {
      purchaseOptions.googleBasePlanId = basePlanId;
    }
    if (offerId) {
      purchaseOptions.googleOfferId = offerId;
    }

    const { customerInfo } = await Purchases.purchaseStoreProduct({
      product: {
        identifier: productId,
        ...purchaseOptions,
      },
    });

    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];
    
    return {
      success: true,
      customerInfo: {
        isActive: !!proEntitlement,
        isPro: !!proEntitlement,
        expirationDate: proEntitlement?.expirationDate || null,
        productIdentifier: proEntitlement?.productIdentifier || null,
        willRenew: proEntitlement?.willRenew || false,
      },
    };
  } catch (error: any) {
    console.error('RevenueCat: Purchase failed', error);
    
    if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, userCancelled: true };
    }

    return { 
      success: false, 
      error: error.message || 'Purchase failed' 
    };
  }
};

// Restore purchases
export const restorePurchases = async (): Promise<{
  success: boolean;
  customerInfo?: SubscriptionInfo;
  error?: string;
}> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, error: 'Restore not available in web mode' };
    }

    const { customerInfo } = await Purchases.restorePurchases();
    
    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];
    
    return {
      success: true,
      customerInfo: {
        isActive: !!proEntitlement,
        isPro: !!proEntitlement,
        expirationDate: proEntitlement?.expirationDate || null,
        productIdentifier: proEntitlement?.productIdentifier || null,
        willRenew: proEntitlement?.willRenew || false,
      },
    };
  } catch (error: any) {
    console.error('RevenueCat: Restore failed', error);
    return { 
      success: false, 
      error: error.message || 'Restore failed' 
    };
  }
};

// Set user attributes
export const setUserAttributes = async (attributes: {
  email?: string;
  displayName?: string;
  phoneNumber?: string;
}): Promise<void> => {
  try {
    if (!Capacitor.isNativePlatform()) return;

    if (attributes.email) {
      await Purchases.setEmail({ email: attributes.email });
    }
    if (attributes.displayName) {
      await Purchases.setDisplayName({ displayName: attributes.displayName });
    }
    if (attributes.phoneNumber) {
      await Purchases.setPhoneNumber({ phoneNumber: attributes.phoneNumber });
    }
  } catch (error) {
    console.error('RevenueCat: Failed to set user attributes', error);
  }
};

// Login user (for when you have your own user system)
export const loginUser = async (appUserId: string): Promise<boolean> => {
  try {
    if (!Capacitor.isNativePlatform()) return false;

    await Purchases.logIn({ appUserID: appUserId });
    console.log('RevenueCat: User logged in', appUserId);
    return true;
  } catch (error) {
    console.error('RevenueCat: Login failed', error);
    return false;
  }
};

// Logout user
export const logoutUser = async (): Promise<boolean> => {
  try {
    if (!Capacitor.isNativePlatform()) return false;

    await Purchases.logOut();
    console.log('RevenueCat: User logged out');
    return true;
  } catch (error) {
    console.error('RevenueCat: Logout failed', error);
    return false;
  }
};

// Sync purchases (useful after app updates)
export const syncPurchases = async (): Promise<void> => {
  try {
    if (!Capacitor.isNativePlatform()) return;

    await Purchases.syncPurchases();
    console.log('RevenueCat: Purchases synced');
  } catch (error) {
    console.error('RevenueCat: Sync failed', error);
  }
};
