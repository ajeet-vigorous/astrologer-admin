import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import { pujaApi } from '../api/services';

const PujaRecommends = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      const res = await pujaApi.getRecommends({ page });
      setData(res.data.pujarecommend || []);
      setPagination({ totalPages: res.data.totalPages, totalRecords: res.data.totalRecords, start: res.data.start, end: res.data.end, page: res.data.page });
    } catch (err) { console.error(err); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getImgSrc = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) return '/build/assets/images/default.jpg';
    const img = images[0];
    if (img.startsWith('http')) return img;
    return '/' + img;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '--';

  const columns = [
    { header: '#', render: (_, i) => (pagination?.start || 0) + i },
    {
      header: 'Puja', render: (row) => (
        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden' }}>
          <img src={getImgSrc(row.puja_images)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/build/assets/images/default.jpg'; }} />
        </div>
      )
    },
    { header: 'User', render: (row) => row.userName || '--' },
    { header: 'Astrologer', render: (row) => row.astrologerName || '--' },
    { header: 'Purchased By User', render: (row) => row.isPurchased ? 'Purchased' : 'Not Purchased' },
    { header: 'Recommend Date', render: (row) => formatDate(row.recommDateTime) }
  ];

  return <DataTable title="Puja Recommends" columns={columns} data={data} pagination={pagination} onPageChange={setPage} />;
};

export default PujaRecommends;
