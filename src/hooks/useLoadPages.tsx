import { useEffect, useRef, useState } from 'react';
import { IdPagination } from '../component/Pagination';

const hasPages = (pagination: any) => {
  return pagination && (pagination.prev.length > 0 || pagination.next.length > 0);
};

const useLoadPages = (request: (id: number) => Promise<Response>, autoload = true) => {
  const loadRequested = useRef(autoload);
  const [id, setId] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    if (loading || !loadRequested.current) return;
    setLoading(true);
    request(id)
      .then((response) => {
        if (!response.ok) throw new Error('Invalid response');
        return response.json();
      })
      .then((body) => {
        setError(null);
        setData(body.response);
      })
      .catch((e) => {
        setError(e);
        setData(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  return {
    id,
    setId,
    loading,
    error,
    load: () => {
      loadRequested.current = true;
      load();
    },
    isLoadRequested: loadRequested.current,

    items: data?.items,
    hasPages: hasPages(data?.pagination),
    Pagination: <IdPagination pagination={data?.pagination} onChange={setId} loading={loading} />
  };
};

export default useLoadPages;
