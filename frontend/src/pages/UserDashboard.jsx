import { useState, useEffect } from 'react';
import API from '../api/axios';

const UserDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await API.get('/user/questions');
      setQuestions(res.data.questions);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    if (submittedAnswers[questionId]) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitAnswer = async (questionId) => {
    const selected = selectedAnswers[questionId];
    if (!selected) return;

    try {
      const res = await API.post('/user/submit-answer', {
        question_id: questionId,
        selected_answer: selected
      });

      setSubmittedAnswers(prev => ({
        ...prev,
        [questionId]: {
          is_correct: res.data.is_correct,
          correct_answer: res.data.correct_answer
        }
      }));

      setMessages(prev => ({
        ...prev,
        [questionId]: {
          type: res.data.is_correct ? 'success' : 'error',
          text: res.data.is_correct ? '🎉 Correct!' : `❌ Wrong! The correct answer is ${res.data.correct_answer.toUpperCase()}`
        }
      }));
    } catch (err) {
      setMessages(prev => ({
        ...prev,
        [questionId]: {
          type: 'error',
          text: err.response?.data?.error || 'Failed to submit answer'
        }
      }));
    }
  };

  const getOptionClass = (questionId, option) => {
    const submitted = submittedAnswers[questionId];
    const selected = selectedAnswers[questionId];

    let className = 'option-btn';

    if (submitted) {
      if (option === submitted.correct_answer) {
        className += ' correct';
      } else if (option === selected && !submitted.is_correct) {
        className += ' wrong';
      }
      className += ' disabled';
    } else if (option === selected) {
      className += ' selected';
    }

    return className;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📝 Take the Quiz</h1>
        <p>Select your answer and submit to check if you're correct</p>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h2>No Questions Available</h2>
          <p>Check back later for new questions!</p>
        </div>
      ) : (
        <div className="questions-list">
          {questions.map((q, index) => (
            <div key={q.id} className="question-card">
              <div className="question-header">
                <span className="question-number">Q{index + 1}</span>
                <span className="category-tag">{q.category}</span>
              </div>
              <h3 className="question-text">{q.question_text}</h3>

              <div className="options-grid">
                {['a', 'b', 'c', 'd'].map(opt => (
                  <button
                    key={opt}
                    className={getOptionClass(q.id, opt)}
                    onClick={() => handleSelectOption(q.id, opt)}
                    disabled={!!submittedAnswers[q.id]}
                  >
                    <span className="option-label">{opt.toUpperCase()}</span>
                    <span className="option-text">{q[`option_${opt}`]}</span>
                  </button>
                ))}
              </div>

              {!submittedAnswers[q.id] && (
                <button
                  className="btn btn-primary btn-submit"
                  onClick={() => handleSubmitAnswer(q.id)}
                  disabled={!selectedAnswers[q.id]}
                >
                  Submit Answer
                </button>
              )}

              {messages[q.id] && (
                <div className={`alert alert-${messages[q.id].type}`}>
                  {messages[q.id].text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
