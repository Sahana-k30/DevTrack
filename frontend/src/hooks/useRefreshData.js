// hooks/useRefreshData.js

import { useState } from 'react';
import { refreshAllData } from '../utils/refreshAll';

export function useRefreshData(onSuccess) {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [error, setError] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token'); // adjust if you store token elsewhere
      await refreshAllData(token);
      setLastRefreshed(new Date());

      // Re-fetch your page data after refresh
      if (onSuccess) await onSuccess();
    } catch (err) {
      setError('Refresh failed. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  return { handleRefresh, refreshing, lastRefreshed, error };
}