import React, { useState } from 'react';

const EmailTable = ({ emails, type, onCancel, emptyMessage }) => {
  const [cancellingId, setCancellingId] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <span className="badge badge-scheduled">Scheduled</span>;
      case 'processing':
        return <span className="badge badge-processing">Processing</span>;
      case 'sent':
        return <span className="badge badge-sent">Sent</span>;
      case 'failed':
        return <span className="badge badge-failed">Failed</span>;
      case 'cancelled':
        return <span className="badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this scheduled email?')) {
      try {
        setCancellingId(id);
        await onCancel(id);
      } finally {
        setCancellingId(null);
      }
    }
  };

  if (!emails || emails.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">{type === 'scheduled' ? '⏳' : '📬'}</div>
        <div className="empty-text">{emptyMessage || 'No emails found'}</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Recipient</th>
            <th>Subject</th>
            <th>{type === 'scheduled' ? 'Scheduled At' : 'Sent / Processed At'}</th>
            <th>Status</th>
            {type === 'scheduled' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {emails.map((email) => (
            <tr key={email._id}>
              <td style={{ fontWeight: 500 }}>{email.to}</td>
              <td>
                <div style={{ fontWeight: 500 }}>{email.subject}</div>
                {email.error && (
                  <small style={{ color: '#dc2626', display: 'block', marginTop: '2px' }}>
                    Error: {email.error}
                  </small>
                )}
              </td>
              <td>{formatDate(type === 'scheduled' ? email.scheduledAt : (email.sentAt || email.updatedAt))}</td>
              <td>{getStatusBadge(email.status)}</td>
              {type === 'scheduled' && (
                <td>
                  <button
                    onClick={() => handleCancel(email._id)}
                    className="btn btn-danger-sm"
                    disabled={cancellingId === email._id}
                  >
                    {cancellingId === email._id ? 'Cancelling...' : 'Cancel'}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmailTable;
