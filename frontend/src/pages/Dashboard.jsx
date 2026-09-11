import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../services/api';
import EmailTable from '../components/EmailTable';
import Loading from '../components/Loading';

const Dashboard = () => {
  const location = useLocation();
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const fetchEmails = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);

      const [scheduledRes, sentRes] = await Promise.all([
        API.get('/emails/scheduled'),
        API.get('/emails/sent'),
      ]);

      setScheduledEmails(scheduledRes.data || []);
      setSentEmails(sentRes.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching emails:', err);
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Failed to load email data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
    // Poll every 5 seconds to automatically update email delivery statuses
    const interval = setInterval(() => {
      fetchEmails();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchEmails]);

  const handleCancelEmail = async (emailId) => {
    try {
      await API.delete(`/emails/${emailId}`);
      await fetchEmails();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel email';
      alert(`Error: ${msg}`);
      throw err;
    }
  };

  const scheduledCount = scheduledEmails.length;
  const sentCount = sentEmails.filter((e) => e.status === 'sent').length;
  const failedCount = sentEmails.filter((e) => e.status === 'failed').length;

  if (loading) {
    return <Loading message="Loading dashboard & email metrics..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Email Dashboard</h1>
          <p className="page-subtitle">Monitor and manage your scheduled automated emails</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => fetchEmails(true)}
            className="btn btn-secondary"
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <Link to="/compose" className="btn btn-primary">
            ✏️ Compose Email
          </Link>
        </div>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Scheduled</div>
            <div className="stat-value">{scheduledCount}</div>
          </div>
          <div className="stat-icon scheduled">⏳</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Successfully Sent</div>
            <div className="stat-value">{sentCount}</div>
          </div>
          <div className="stat-icon sent">✅</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Failed</div>
            <div className="stat-value">{failedCount}</div>
          </div>
          <div className="stat-icon failed">⚠️</div>
        </div>
      </div>

      {/* Scheduled Emails Table */}
      <div className="card">
        <div className="table-title-bar">
          <h2 className="table-title">Scheduled Emails ({scheduledCount})</h2>
        </div>
        <EmailTable
          emails={scheduledEmails}
          type="scheduled"
          onCancel={handleCancelEmail}
          emptyMessage="No scheduled emails"
        />
      </div>

      {/* Sent & Delivered Emails Table */}
      <div className="card">
        <div className="table-title-bar">
          <h2 className="table-title">Sent & Processed Emails ({sentEmails.length})</h2>
        </div>
        <EmailTable
          emails={sentEmails}
          type="sent"
          emptyMessage="No sent emails"
        />
      </div>
    </div>
  );
};

export default Dashboard;
