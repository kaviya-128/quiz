import { useState, useEffect } from 'react';
import API from '../api/axios';

const MyResults = () => {
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await API.get('/user/my-results');
      setStats({
        total_answered: res.data.total_answered,
        correct_answers: res.data.correct_answers,
        accuracy: res.data.accuracy
      });
      setResults(res.data.results);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 My Results</h1>
        <p>Track your quiz performance</p>
      </div>

      {!stats || stats.total_answered === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🎯</span>
          <h2>No Results Yet</h2>
          <p>Take some quizzes to see your performance here!</p>
        </div>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-number">{stats.total_answered}</span>
              <span className="stat-label">Total Answered</span>
            </div>
            <div className="stat-card stat-success">
              <span className="stat-number">{stats.correct_answers}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div className="stat-card stat-danger">
              <span className="stat-number">{stats.total_answered - stats.correct_answers}</span>
              <span className="stat-label">Wrong</span>
            </div>
            <div className="stat-card stat-info">
              <span className="stat-number">{stats.accuracy}%</span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>

          <div className="results-section">
            <h2>Detailed Results</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Question</th>
                    <th>Your Answer</th>
                    <th>Correct Answer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="question-cell">{r.question_text}</td>
                      <td><span className="answer-badge">{r.your_answer.toUpperCase()}</span></td>
                      <td><span className="answer-badge">{r.correct_answer.toUpperCase()}</span></td>
                      <td>
                        <span className={`status-badge ${r.is_correct ? 'correct' : 'wrong'}`}>
                          {r.is_correct ? '✓ Correct' : '✗ Wrong'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyResults;
