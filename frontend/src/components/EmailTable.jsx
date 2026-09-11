import React, { useState } from 'react';

const EmailTable = ({ emails, type = 'scheduled', onCancel, emptyMessage = 'No emails found' }) => {
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancelClick = async (emailId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this scheduled email?');
    if (!confirmCancel) return;

    try {
      setCancellingId(emailId);
      await onCancel(emailId);
    } catch (err) {
      console.error('Cancel failed:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (!emails || emails.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">{type === 'scheduled' ? '📅' : '📫'}</div>
        <p className="empty-text">{emptyMessage}</p>
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
              <td>
                <span style={{ fontWeight: 500 }}>{email.to}</span>
              </td>
              <td>
                <div style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.subject}
                </div>
                {email.error && (
                  <div style={{ fontSize: '0.78rem', color: '#fca5a5', marginTop: '0.2rem' }}>
                    Error: {email.error}
                  </div>
                )}
              </td>
              <td>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {formatDate(type === 'scheduled' ? email.scheduledAt : (email.sentAt || email.updatedAt))}
                </span>
              </td>
              <td>
                <span className={`badge badge-${email.status}`}>
                  {email.status}
                </span>
              </td>
              {type === 'scheduled' && (
                <td>
                  {email.status === 'scheduled' && (
                    <button
                      onClick={() => handleCancelClick(email._id)}
                      disabled={cancellingId === email._id}
                      className="btn btn-danger-sm"
                    >
                      {cancellingId === email._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
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
