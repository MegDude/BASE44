import { useEffect, useState } from "react";
import { fetchPartnerInsights } from "@/lib/api/partnerApi";

export function usePartnerInsights(payload = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const next = await fetchPartnerInsights(payload);
        if (mounted) setData(next);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const intervalId = window.setInterval(load, 30000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [payload.partnerId, payload.partnerType]);

  return { data, loading };
}
