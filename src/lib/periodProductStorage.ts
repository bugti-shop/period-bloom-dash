import { saveToLocalStorage, loadFromLocalStorage } from "./storage";

export interface ProductLog {
  id: string;
  date: Date;
  productType: "pad" | "tampon" | "cup" | "liner";
  brand?: string;
  cost?: number;
}

export interface ProductSettings {
  restockThreshold: number;
  notificationsEnabled: boolean;
  averageCost: Record<string, number>;
}

const PRODUCT_LOG_KEY = "period-product-log";
const PRODUCT_SETTINGS_KEY = "period-product-settings";

export const saveProductLog = (log: Omit<ProductLog, "id">): void => {
  const logs = getProductLogs();
  const newLog: ProductLog = {
    ...log,
    id: Date.now().toString(),
  };
  logs.unshift(newLog);
  saveToLocalStorage(PRODUCT_LOG_KEY, logs);
};

export const getProductLogs = (): ProductLog[] => {
  const logs = loadFromLocalStorage<ProductLog[]>(PRODUCT_LOG_KEY) || [];
  return logs.map(log => ({ ...log, date: new Date(log.date) }));
};

export const deleteProductLog = (id: string): void => {
  const logs = getProductLogs();
  saveToLocalStorage(PRODUCT_LOG_KEY, logs.filter(log => log.id !== id));
};

export const getProductSettings = (): ProductSettings => {
  return loadFromLocalStorage<ProductSettings>(PRODUCT_SETTINGS_KEY) || {
    restockThreshold: 10,
    notificationsEnabled: true,
    averageCost: {
      pad: 0.25,
      tampon: 0.30,
      cup: 30.00,
      liner: 0.15,
    },
  };
};

export const saveProductSettings = (settings: ProductSettings): void => {
  saveToLocalStorage(PRODUCT_SETTINGS_KEY, settings);
};

export const calculateMonthlyCost = (): number => {
  const logs = getProductLogs();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentLogs = logs.filter(log => log.date >= thirtyDaysAgo);
  return recentLogs.reduce((total, log) => total + (log.cost || 0), 0);
};

export const getProductUsageStats = () => {
  const logs = getProductLogs();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentLogs = logs.filter(log => log.date >= thirtyDaysAgo);
  
  const usageByType: Record<string, number> = {
    pad: 0,
    tampon: 0,
    cup: 0,
    liner: 0,
  };
  
  recentLogs.forEach(log => {
    usageByType[log.productType]++;
  });
  
  return {
    totalUsed: recentLogs.length,
    usageByType,
    monthlyCost: calculateMonthlyCost(),
  };
};
