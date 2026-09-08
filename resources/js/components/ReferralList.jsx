import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Tabs, Statistic, Tag, Spin, message } from 'antd';
import { 
  UserOutlined, 
  DollarOutlined, 
  TransactionOutlined, 
  CreditCardOutlined,
  PhoneOutlined,
  BankOutlined,
  CalculatorOutlined,
  WalletOutlined
} from '@ant-design/icons';
import ApiService from '../core/services/ApiService';

const { TabPane } = Tabs;

const ReferralList = () => {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('all');
  const [referralData, setReferralData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDashboardData, setUserDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const apiService = ApiService();

  useEffect(() => {
    fetchReferralData();
  }, [period]);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const response = await apiService.vGet('/api/referrals', {
        params: {
          period: period,
          business_data: true
        }
      });

      if (response.data.status === 1) {
        setReferralData(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to fetch referral data');
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      message.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDashboard = async (userMid) => {
    setDashboardLoading(true);
    try {
      const response = await apiService.vGet('/api/referral-user-dashboard', {
        params: {
          user_mid: userMid,
          period: period
        }
      });

      if (response.data.status === 1) {
        setUserDashboardData(response.data.data);
        setSelectedUser(userMid);
      } else {
        message.error(response.data.message || 'Failed to fetch user dashboard');
      }
    } catch (error) {
      console.error('Error fetching user dashboard:', error);
      message.error('Failed to load user dashboard');
    } finally {
      setDashboardLoading(false);
    }
  };

  const periodButtons = [
    { key: 'day', label: 'Today' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
    { key: 'all', label: 'All Time' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusColor = (successCount, totalCount) => {
    if (totalCount === 0) return 'default';
    const successRate = (successCount / totalCount) * 100;
    if (successRate >= 95) return 'green';
    if (successRate >= 80) return 'blue';
    if (successRate >= 60) return 'orange';
    return 'red';
  };

  const renderBusinessMetrics = (businessData) => {
    if (!businessData || businessData.error) {
      return <div>Business data not available</div>;
    }

    return (
      <Row gutter={[16, 16]}>
        {/* AEPS Services */}
        <Col xs={24} lg={12}>
          <Card title="AEPS Services" size="small">
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Statistic
                  title="Cash Withdrawal"
                  value={businessData.aeps?.cash_withdrawal?.success_count || 0}
                  suffix={`/ ${businessData.aeps?.cash_withdrawal?.count || 0}`}
                  prefix={<BankOutlined />}
                />
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatCurrency(businessData.aeps?.cash_withdrawal?.success_amount)}
                </div>
              </Col>
              <Col span={12}>
                <Statistic
                  title="Aadhaar Pay"
                  value={businessData.aeps?.aadhaar_pay?.success_count || 0}
                  suffix={`/ ${businessData.aeps?.aadhaar_pay?.count || 0}`}
                  prefix={<CreditCardOutlined />}
                />
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatCurrency(businessData.aeps?.aadhaar_pay?.success_amount)}
                </div>
              </Col>
              <Col span={12}>
                <Statistic
                  title="Balance Enquiry"
                  value={businessData.aeps?.balance_enquiry?.success_count || 0}
                  suffix={`/ ${businessData.aeps?.balance_enquiry?.count || 0}`}
                  prefix={<CalculatorOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Mini Statement"
                  value={businessData.aeps?.mini_statement?.success_count || 0}
                  suffix={`/ ${businessData.aeps?.mini_statement?.count || 0}`}
                  prefix={<TransactionOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Utility Services */}
        <Col xs={24} lg={12}>
          <Card title="Utility Services" size="small">
            <Row gutter={[8, 8]}>
              <Col span={8}>
                <Statistic
                  title="Mobile"
                  value={businessData.utility_services?.mobile_recharge?.success_count || 0}
                  suffix={`/ ${businessData.utility_services?.mobile_recharge?.count || 0}`}
                  prefix={<PhoneOutlined />}
                />
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {formatCurrency(businessData.utility_services?.mobile_recharge?.success_amount)}
                </div>
              </Col>
              <Col span={8}>
                <Statistic
                  title="DTH"
                  value={businessData.utility_services?.dth_recharge?.success_count || 0}
                  suffix={`/ ${businessData.utility_services?.dth_recharge?.count || 0}`}
                />
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {formatCurrency(businessData.utility_services?.dth_recharge?.success_amount)}
                </div>
              </Col>
              <Col span={8}>
                <Statistic
                  title="Bills"
                  value={businessData.utility_services?.bill_payment?.success_count || 0}
                  suffix={`/ ${businessData.utility_services?.bill_payment?.count || 0}`}
                />
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {formatCurrency(businessData.utility_services?.bill_payment?.success_amount)}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Financial Services */}
        <Col xs={24}>
          <Card title="Financial Services" size="small">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="Payouts"
                  value={businessData.payouts?.success_count || 0}
                  suffix={`/ ${businessData.payouts?.count || 0}`}
                  prefix={<DollarOutlined />}
                />
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatCurrency(businessData.payouts?.success_amount)}
                </div>
              </Col>
              <Col span={6}>
                <Statistic
                  title="Add Fund"
                  value={businessData.add_fund?.success_count || 0}
                  suffix={`/ ${businessData.add_fund?.count || 0}`}
                  prefix={<WalletOutlined />}
                />
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatCurrency(businessData.add_fund?.success_amount)}
                </div>
              </Col>
              <Col span={6}>
                <Statistic
                  title="Cash Deposit"
                  value={businessData.cash_deposit?.success_count || 0}
                  suffix={`/ ${businessData.cash_deposit?.count || 0}`}
                  prefix={<BankOutlined />}
                />
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatCurrency(businessData.cash_deposit?.success_amount)}
                </div>
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Volume"
                  value={formatCurrency(businessData.summary?.total_success_volume)}
                  prefix={<DollarOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Account Balance */}
        <Col xs={24}>
          <Card title="Account Balance" size="small">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Total Balance"
                  value={formatCurrency(businessData.account_balance?.total_balance)}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Hold Balance"
                  value={formatCurrency(businessData.account_balance?.hold_balance)}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Available Balance"
                  value={formatCurrency(businessData.account_balance?.available_balance)}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderReferralLevel = (users, level) => {
    if (!users || users.length === 0) {
      return <div>No referrals at Level {level}</div>;
    }

    const columns = [
      {
        title: 'User Info',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.mobile}</div>
            <div style={{ fontSize: '10px', color: '#999' }}>{record.mid}</div>
          </div>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Tag color={status === 1 ? 'green' : 'red'}>
            {status === 1 ? 'Active' : 'Inactive'}
          </Tag>
        ),
      },
      {
        title: 'Total Volume',
        dataIndex: 'business_data',
        key: 'volume',
        render: (businessData) => (
          <div>
            {businessData && businessData.summary ? 
              formatCurrency(businessData.summary.total_success_volume) : 
              'N/A'
            }
          </div>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Button 
            type="primary" 
            size="small"
            onClick={() => fetchUserDashboard(record.mid)}
            loading={dashboardLoading && selectedUser === record.mid}
          >
            View Dashboard
          </Button>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={users}
        rowKey="mid"
        size="small"
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => renderBusinessMetrics(record.business_data),
          rowExpandable: (record) => record.business_data && !record.business_data.error,
        }}
      />
    );
  };

  return (
    <div className="referral-list-container">
      <Card title="Referral Network Analytics">
        {/* Period Filter */}
        <div style={{ marginBottom: 16 }}>
          <Button.Group>
            {periodButtons.map(btn => (
              <Button
                key={btn.key}
                type={period === btn.key ? 'primary' : 'default'}
                onClick={() => setPeriod(btn.key)}
              >
                {btn.label}
              </Button>
            ))}
          </Button.Group>
        </div>

        <Spin spinning={loading}>
          {referralData && (
            <Tabs defaultActiveKey="1">
              <TabPane tab={`Level 1 (${referralData.levels[1]?.length || 0})`} key="1">
                {renderReferralLevel(referralData.levels[1], 1)}
              </TabPane>
              <TabPane tab={`Level 2 (${referralData.levels[2]?.length || 0})`} key="2">
                {renderReferralLevel(referralData.levels[2], 2)}
              </TabPane>
              <TabPane tab={`Level 3 (${referralData.levels[3]?.length || 0})`} key="3">
                {renderReferralLevel(referralData.levels[3], 3)}
              </TabPane>
            </Tabs>
          )}
        </Spin>
      </Card>

      {/* Individual User Dashboard Modal/Card */}
      {userDashboardData && (
        <Card 
          title={`Dashboard - ${userDashboardData.user_info.name}`}
          style={{ marginTop: 16 }}
          extra={
            <Button 
              onClick={() => setUserDashboardData(null)}
              type="text"
            >
              Close
            </Button>
          }
        >
          <Spin spinning={dashboardLoading}>
            {renderBusinessMetrics(userDashboardData.business_data)}
          </Spin>
        </Card>
      )}
    </div>
  );
};

export default ReferralList;