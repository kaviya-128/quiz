import { useState } from 'react';
import Analytics from './Analytics';
import ManageQuestions from './ManageQuestions';
import ManageUsers from './ManageUsers';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', label: '📊 Analytics', icon: '📊' },
    { id: 'questions', label: '❓ Questions', icon: '❓' },
    { id: 'users', label: '👥 Users', icon: '👥' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Manage your quiz platform</p>
      </div>

      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'questions' && <ManageQuestions />}
        {activeTab === 'users' && <ManageUsers />}
      </div>
    </div>
  );
};

export default AdminDashboard;
