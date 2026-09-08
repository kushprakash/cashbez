import React, { useState } from 'react';
import ApiService from '../core/services/ApiService';

const MessageTypeModal = ({ show, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const api = ApiService();
      const form = new FormData();
      form.append('name', name);
      form.append('message', message);
      form.append('status', status);
      const res = await api.vPost('/api/message-types', form, true, true);
      if (res.data.status !== 1) throw new Error(res.data.message || 'Failed');
      onCreated && onCreated(res.data.data);
      setName(''); setMessage(''); setStatus('1');
      onClose && onClose();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Message Type</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea className="form-control" rows={5} value={message} onChange={e => setMessage(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="1">Active</option>
                  <option value="0">Not Active</option>
                </select>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Close</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageTypeModal;
