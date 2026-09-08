import React, { useState, useEffect } from 'react';
import ApiService from '../core/services/ApiService';
import { Link, useNavigate } from 'react-router-dom';
import Pageheader from '../layouts/Pageheader';
import MessageTypeModal from './MessageTypeModal';

const AddMessage = () => {
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [types, setTypes] = useState([]);
  const [showTypeModal, setShowTypeModal] = useState(false);

  useEffect(() => {
    fetchTypes();
  }, []);

    const fetchTypes = async () => {
        try {
            const apiService = ApiService();
            const res = await apiService.vGet('/api/message-types-data');
            if (res.data) setTypes(res.data.data || []);
        } catch (err) {
            setError('Failed to fetch message-types');
        }
    };

  const handleTypeCreated = (newType) => {
    setTypes(prev => [newType, ...prev]);
  };

  const handleTypeChange = async (e) => {
    const selectedId = e.target.value;
   
    if (!selectedId) { setName(''); setMessage(''); return; }
    const api = ApiService();
    try {
      const res = await api.vGet(`/api/message-types/${selectedId}`);
      if (res.data.status === 1 && res.data.data) {
        setName(res.data.data.name || '');
        setMessage(res.data.data.message || '');
      }
    } catch (err) { /* ignore */ }
  };
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('template_id', templateId);
      form.append('message', message);
      const apiService = ApiService();
      const res = await apiService.vPost('/api/messages', form, true, true);
      const { data } = res;
      if (data.status !== 1) throw new Error(data.message || 'Failed to create message');
      setSuccess(true);
      setName(''); setTemplateId(''); setMessage('');
      navigate('/sms/list');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <>
      <Pageheader mainheading="SMS Messages" parentfolder="SMS" activepage="Create" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                <span className="d-flex align-items-center">
                  <i className="bi bi-chat-text me-2" style={{ fontSize: '1.3rem' }}></i>
                  <h5 className="mb-0 fw-semibold">Create Message</h5>
                </span>
                <Link to="/sms/list" className="btn btn-primary text-white d-flex align-items-center"><i className="fa fa-list me-1"></i> Message List</Link>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Message Type</label>
                    <div className="d-flex ">
                      <select className="form-select" value={templateId} onChange={handleTypeChange}>
                        <option value="">-- Select Message Type --</option>
                        {types.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                   </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Template Example</label>
                    <div className="card p-3">
                      <div>{message || <em>No template selected</em>}</div>
                      {message && <button type="button" className="btn btn-sm btn-link mt-2" onClick={() => {/* insert example in textarea (already set) */}}>Use this template</button>}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Template ID</label>
                    <input className="form-control" value={templateId} onChange={e => setTemplateId(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea className="form-control" rows={6} value={message} onChange={e => setMessage(e.target.value)} required />
                  </div>
                  <button className="btn btn-primary w-100 text-white" disabled={loading}>{loading ? 'Saving...' : 'Create Message'}</button>
                  {success && <div className="alert alert-success mt-3">Message created successfully!</div>}
                  {error && <div className="alert alert-danger mt-3">{error}</div>}
                </form>
                {showTypeModal && (
                  <MessageTypeModal show={showTypeModal} onClose={() => setShowTypeModal(false)} onCreated={handleTypeCreated} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default AddMessage;
