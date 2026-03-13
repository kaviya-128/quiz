import { useState, useEffect } from 'react';
import API from '../../api/axios';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/admin/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!data) return <div className="alert alert-error">Failed to load analytics</div>;

  const wrongAnswers = data.total_answers - data.correct_answers;
  const rankEmojis = ['🥇', '🥈', '🥉'];

  return (
    <div className="analytics-container">
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-number">{data.total_users}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{data.total_questions}</span>
          <span className="stat-label">Total Questions</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{data.total_answers}</span>
          <span className="stat-label">Total Answers</span>
        </div>
        <div className="stat-card stat-info">
          <span className="stat-number">{data.accuracy}%</span>
          <span className="stat-label">Overall Accuracy</span>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-success">
          <span className="stat-number">{data.correct_answers}</span>
          <span className="stat-label">Correct Answers</span>
        </div>
        <div className="stat-card stat-danger">
          <span className="stat-number">{wrongAnswers}</span>
          <span className="stat-label">Wrong Answers</span>
        </div>
        <div className="stat-card stat-warning">
          <span className="stat-number">{data.recent_users}</span>
          <span className="stat-label">New Users (7 Days)</span>
        </div>
      </div>

      {data.categories.length > 0 && (
        <div className="section-card">
          <h2>📂 Questions by Category</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Questions</th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((cat, i) => (
                  <tr key={i}>
                    <td><span className="category-tag">{cat.category}</span></td>
                    <td>{cat.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.top_performers.length > 0 && (
        <div className="section-card">
          <h2>🏆 Top Performers</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Username</th>
                  <th>Total Answers</th>
                  <th>Correct</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {data.top_performers.map((tp, i) => (
                  <tr key={i}>
                    <td>{rankEmojis[i] || `#${i + 1}`}</td>
                    <td className="username-cell">{tp.username}</td>
                    <td>{tp.total_answers}</td>
                    <td>{tp.correct_answers}</td>
                    <td>
                      <span className="accuracy-badge">{tp.accuracy}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
