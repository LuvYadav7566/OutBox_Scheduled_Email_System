import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Compose = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Default date to today and time to 5 minutes in the future for convenience
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    setDate(`${year}-${month}-${day}`);
    setTime(`${hours}:${minutes}`);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!to || !subject || !body || !date || !time) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      setError('Please provide a valid recipient email address');
      return;
    }

    const scheduledDateObj = new Date(`${date}T${time}`);
    if (isNaN(scheduledDateObj.getTime())) {
      setError('Invalid date or time selected');
      return;
    }

    if (scheduledDateObj.getTime() <= Date.now()) {
      setError('Scheduled time must be in the future. Please select a future time.');
      return;
    }

    try {
      setLoading(true);
      await API.post('/emails/schedule', {
        to,
        subject,
        body,
        scheduledAt: scheduledDateObj.toISOString(),
      });

      setSuccess('Email scheduled successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { state: { message: 'Email scheduled successfully!' } });
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule email. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Schedule Email</h1>
          <p className="page-subtitle">Compose a new message to send at a specified date & time</p>
        </div>
        <Link to="/dashboard" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="card">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="compose-to">Recipient Email</label>
            <input
              id="compose-to"
              type="email"
              className="form-control"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="compose-subject">Subject</label>
            <input
              id="compose-subject"
              type="text"
              className="form-control"
              placeholder="e.g. Project Update & Meeting Reminder"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="compose-body">Message Body</label>
            <textarea
              id="compose-body"
              className="form-control"
              placeholder="Write your email content here..."
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="compose-date">Schedule Date</label>
              <input
                id="compose-date"
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="compose-time">Schedule Time</label>
              <input
                id="compose-time"
                type="time"
                className="form-control"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Scheduling Email...' : '📅 Schedule Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Compose;
