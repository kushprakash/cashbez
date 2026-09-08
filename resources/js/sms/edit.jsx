import React, { useState, useEffect } from 'react';
import ApiService from '../core/services/ApiService';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Pageheader from '../layouts/Pageheader';
import MessageTypeModal from './MessageTypeModal';

const EditMessage = () => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [showTypeModal, setShowTypeModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchMessage = async () => {
      setLoading(true); setError(null);
      try {
        const apiService = ApiService();
        const res = await apiService.vGet(`/api/messages/${id}`);
        const { data } = res;
        if (data.status !== 1) throw new Error(data.message || 'Failed to fetch message');
        setName(data.message.name || '');
        // map stored template_id (likely an id) to template name if types available
        let templateName = data.message.template_id || '';
        let loadedTypes = types;
        if (!loadedTypes || loadedTypes.length === 0) {
          loadedTypes = await fetchTypes();
        }
        const matched = loadedTypes.find(t => String(t.id) === String(templateName));
        if (matched) templateName = matched.name;
        setTemplateId(templateName || '');
        setMessage(data.message.message || '');
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchMessage();
  }, [id]);

  useEffect(() => {
    fetchTypes();
  }, []);


  const fetchTypes = async () => {
    try {
      const apiService = ApiService();
      const res = await apiService.vGet('/api/message-types-data');
      const list = res.data?.data || [];
      setTypes(list);
      return list;
    } catch (err) {
      setError('Failed to fetch message-types');
      return [];
    }
  };

  const handleTypeCreated = (newType) => {
    setTypes(prev => [newType, ...prev]);
  };

  const handleTypeChange = (e) => {
    const selectedName = e.target.value;
    setTemplateId(selectedName);
    if (!selectedName) { setName(''); setMessage(''); return; }
    const selectedType = types.find(t => t.name === selectedName);
    if (selectedType) {
      setName(selectedType.name || '');
      setMessage(selectedType.message || '');
    } else {
      // fallback: clear fields
      setName(''); setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(false);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('template_id', templateId);
      form.append('message', message);
      const apiService = ApiService();
      const res = await apiService.vPut(`/api/messages/${id}`, form, true, true, 'put');
      const { data } = res;
      if (data.status !== 1) throw new Error(data.message || 'Failed to update message');
      setSuccess(true);
      navigate('/sms/list');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Pageheader mainheading="SMS Messages" parentfolder="SMS" activepage="Edit" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center rounded-top">
                <span className="d-flex align-items-center">
                  <i className="bi bi-chat-text me-2" style={{ fontSize: '1.3rem' }}></i>
                  <h5 className="mb-0 fw-semibold">Edit Message</h5>
                </span>
                <Link to="/sms/list" className="btn btn-primary text-white d-flex align-items-center"><i className="fa fa-list me-1"></i> Message List</Link>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Template Name</label>
                    <div className="d-flex">
                      <select className="form-select" value={name} onChange={handleTypeChange}>
                        <option value="">-- Select Template --</option>
                        {types.map(t => (
                          <option key={t.id} value={t.name} >{t.name}</option>
                        ))}
                      </select>
                   </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Selected Template Preview</label>
                    <div className="card p-3">
                      <div>{message || <em>No template selected</em>}</div>
                      {message && <button type="button" className="btn btn-sm btn-link mt-2" onClick={() => {/* use template */}}>Use this template</button>}
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
                  <button className="btn btn-primary w-100 text-white" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                  {success && <div className="alert alert-success mt-3">Message updated successfully!</div>}
                  {error && <div className="alert alert-danger mt-3">{error}</div>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      {showTypeModal && (
        <MessageTypeModal show={showTypeModal} onClose={() => setShowTypeModal(false)} onCreated={handleTypeCreated} />
      )}
    </>
  );
};

export default EditMessage;
