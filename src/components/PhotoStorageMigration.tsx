import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, HardDrive, Smartphone } from 'lucide-react';
import { migratePhotosToFilesystem, getStorageInfo } from '@/lib/photoStorage';
import { Capacitor } from '@capacitor/core';

export const PhotoStorageMigration = () => {
  const [storageInfo, setStorageInfo] = useState<{
    totalPhotos: number;
    isNativePlatform: boolean;
  } | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<{
    migrated: number;
    failed: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    const info = await getStorageInfo();
    setStorageInfo(info);
  };

  const handleMigration = async () => {
    setIsLoading(true);
    try {
      const result = await migratePhotosToFilesystem();
      setMigrationStatus(result);
      await loadStorageInfo();
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!storageInfo) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {storageInfo.isNativePlatform ? (
            <Smartphone className="w-6 h-6 text-blue-600" />
          ) : (
            <HardDrive className="w-6 h-6 text-gray-600" />
          )}
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              Photo Storage System
            </h3>
            <p className="text-sm text-muted-foreground">
              {storageInfo.isNativePlatform 
                ? 'Native device storage (unlimited photos)' 
                : 'Web storage (limited size)'}
            </p>
          </div>
        </div>

        <div className="bg-white/60 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Photos</span>
            <span className="text-lg font-semibold text-foreground">
              {storageInfo.totalPhotos}
            </span>
          </div>
        </div>

        {storageInfo.isNativePlatform && !migrationStatus && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Migration Available</p>
                <p>
                  Click below to migrate existing photos from browser storage to device storage for unlimited capacity.
                </p>
              </div>
            </div>

            <Button
              onClick={handleMigration}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Migrating...' : 'Migrate Photos to Device Storage'}
            </Button>
          </div>
        )}

        {migrationStatus && (
          <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Migration Complete</p>
              <p>
                {migrationStatus.migrated} photos migrated successfully.
                {migrationStatus.failed > 0 && ` ${migrationStatus.failed} failed.`}
              </p>
            </div>
          </div>
        )}

        {!storageInfo.isNativePlatform && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Web Preview Mode</p>
              <p>
                Running in web browser. For unlimited photo storage, install the app on your phone.
              </p>
            </div>
          </div>
        )}

        <div className="pt-3 border-t text-xs text-muted-foreground space-y-1">
          <p>✓ Photos save instantly when added</p>
          <p>✓ All albums support unlimited photos</p>
          <p>✓ Photos stored securely on your device</p>
        </div>
      </div>
    </Card>
  );
};
