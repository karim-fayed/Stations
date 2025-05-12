import React, { useState } from 'react';
import { Button, Spinner, useToast } from '@chakra-ui/react';
import { supabase } from '@/integrations/supabase/client';

interface StationSyncButtonProps {
  stationId: string;
  onSyncComplete?: () => void;
}

export const StationSyncButton: React.FC<StationSyncButtonProps> = ({
  stationId,
  onSyncComplete
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const toast = useToast();

  const handleSync = async () => {
    try {
      setIsSyncing(true);

      // Get local station data
      const { data: stationData, error: fetchError } = await supabase
        .from('stations')
        .select('*')
        .eq('id', stationId)
        .single();

      if (fetchError) throw fetchError;

      // Call sync function
      const { data: syncResult, error: syncError } = await supabase
        .rpc('sync_station_data', {
          p_station_id: stationId,
          p_sync_data: stationData
        });

      if (syncError) throw syncError;

      toast({
        title: 'تم التزامن بنجاح',
        description: 'تم تحديث البيانات المحلية بنجاح',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSyncComplete?.();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'خطأ في التزامن',
        description: 'حدث خطأ أثناء محاولة تزامن البيانات',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      isLoading={isSyncing}
      loadingText="جاري التزامن..."
      colorScheme="blue"
      size="sm"
      leftIcon={isSyncing ? <Spinner size="sm" /> : undefined}
    >
      {isSyncing ? 'جاري التزامن...' : 'تزامن البيانات'}
    </Button>
  );
}; 