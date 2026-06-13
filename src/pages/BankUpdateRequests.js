import React, { useState, useEffect } from 'react';
import { Landmark, Check, X } from 'lucide-react';
import Swal from 'sweetalert2';
import Loader from '../components/Loader';
import { bankUpdateApi } from '../api/services';
import '../styles/Customers.css';

const STATUS_BADGE = {
  Pending: { bg: '#fef3c7', color: '#92400e' },
  Approved: { bg: '#dcfce7', color: '#166534' },
  Rejected: { bg: '#fee2e2', color: '#991b1b' },
};

const BankUpdateRequests = () => {
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await bankUpdateApi.list({ status: statusFilter || undefined });
      setData(res.data?.recordList || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [statusFilter]);

  const review = async (row, action) => {
    const isApprove = action === 'approve';
    const { value, isConfirmed } = await Swal.fire({
      icon: isApprove ? 'question' : 'warning',
      title: isApprove ? 'Approve bank details?' : 'Reject request?',
      text: isApprove
        ? `The new bank details will be saved to ${row.astrologerName}'s profile.`
        : `Reject ${row.astrologerName}'s bank update request?`,
      input: 'text',
      inputplaceholder: 'Optional note',
      showCancelButton: true,
      confirmButtonColor: isApprove ? '#16a34a' : '#dc2626',
      confirmButtonText: isApprove ? 'Approve' : 'Reject',
    });
    if (!isConfirmed) return;
    try {
      const res = await bankUpdateApi.review({ id: row.id, action, adminNote: value || '' });
      Swal.fire({ icon: 'success', title: 'Done', text: res.data?.message || 'Updated', confirmButtonColor: '#7c3aed' });
      fetchData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message || 'Action failed', confirmButtonColor: '#7c3aed' });
    }
  };

  const badge = (status) => {
    const s = STATUS_BADGE[status] || { bg: '#e5e7eb', color: '#374151' };
    return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>{status}</span>;
  };

  return (
    <div className="cust-page">
      <div className="cust-header">
        <div className="cust-title">
          <Landmark size={22} /> <h2>Bank Update Requests</h2>
        </div>
        <div className="cust-filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="cust-select">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="cust-card">
        {loading ? <Loader text="Loading requests..." /> : (
          <div className="cust-table-wrap">
            <table className="cust-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Astrologer</th>
                  <th>Account Holder</th>
                  <th>Account No.</th>
                  <th>IFSC</th>
                  <th>Bank</th>
                  <th>UPI</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={10} className="cust-no-data">No requests found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={row.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="cust-name-cell">{row.astrologerName}</div>
                      <div className="cust-date-cell">{row.contactNo}</div>
                    </td>
                    <td>{row.accountHolderName || '-'}</td>
                    <td>{row.accountNumber || '-'}</td>
                    <td>{row.ifscCode || '-'}</td>
                    <td>{row.bankName || '-'}{row.bankBranch ? ` (${row.bankBranch})` : ''}</td>
                    <td>{row.upi || '-'}</td>
                    <td>{badge(row.status)}</td>
                    <td className="cust-date-cell">{row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : '-'}</td>
                    <td>
                      {row.status === 'Pending' ? (
                        <div className="cust-actions">
                          <button onClick={() => review(row, 'approve')} className="cust-action-btn" title="Approve" style={{ color: '#16a34a' }}>
                            <Check size={16} />
                          </button>
                          <button onClick={() => review(row, 'reject')} className="cust-action-btn" title="Reject" style={{ color: '#dc2626' }}>
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{row.adminNote || '—'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankUpdateRequests;
