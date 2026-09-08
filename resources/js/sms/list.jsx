import React, { useEffect, useState } from 'react';
import ApiService from '../core/services/ApiService';
import { Link } from 'react-router-dom';
import DataTable from '../pages/components/DataTable';
import TableShimmerLoader from '../pages/components/TableShimmerLoader';
import Pageheader from '../layouts/Pageheader';

const ListMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiService = ApiService();
        const res = await apiService.vGet('/api/messages');
        const { data } = res;
        if (data.status !== 1) throw new Error(data.message || 'Failed to fetch messages');
        setMessages(data.messages || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <>
      <Pageheader mainheading="SMS Messages" parentfolder="SMS" activepage="List" />
      <div className="page-content-box">
      <div className="page-content-box-inner">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className='card-header d-flex justify-content-between align-items-center rounded-top'>
                <h3 className="mb-0 fw-bold">Messages</h3>
                <Link to="/sms/create" className="btn btn-primary text-white d-flex align-items-center"><i className="fa fa-plus me-1"></i> Create Message</Link>
              </div>
              {loading && <TableShimmerLoader />}
              {error && <div className="alert alert-danger">{error}</div>}
              {!loading && !error && (
                <div className="card border-0">
                  <div className="card-body p-0">
                    <DataTable
                      columns={[
                        { Header: 'SN', accessor: 'sn', Cell: ({ row }) => row.index + 1 },
                        { Header: 'Name', accessor: 'name' },
                        { Header: 'Template ID', accessor: 'template_id' },
                        { Header: 'Message', accessor: 'message' },
                        {
                          Header: 'Action', accessor: 'action', disableSortBy: true,
                          Cell: ({ row }) => (
                            <Link to={`/sms/edit/${row.original.id}`} className="btn btn-primary btn-sm">Edit</Link>
                          )
                        }
                      ]}
                      data={messages}
                      title="Messages"
                      noDataText="No messages found."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default ListMessages;
