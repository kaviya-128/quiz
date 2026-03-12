import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a',
    category: 'General'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await API.get('/admin/questions');
      setQuestions(res.data.questions);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'a',
      category: 'General'
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      category: q.category || 'General'
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingQuestion) {
        await API.put(`/admin/questions/${editingQuestion.id}`, formData);
      } else {
        await API.post('/admin/questions', formData);
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save question');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question? This will also delete all related answers.')) return;

    try {
      await API.delete(`/admin/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    <div className="manage-container">
      <div className="manage-header">
        <h2>❓ Manage Questions <span className="count-badge">{questions.length}</span></h2>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Question</button>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <h2>No Questions Yet</h2>
          <p>Create your first quiz question!</p>
        </div>
      ) : (
        <div className="questions-list">
          {questions.map((q) => (
            <div key={q.id} className="question-card admin-question-card">
              <div className="question-header">
                <span className="category-tag">{q.category}</span>
                <div className="question-actions">
                  <button className="btn btn-sm btn-edit" onClick={() => openEditModal(q)}>✏️ Edit</button>
                  <button className="btn btn-sm btn-delete" onClick={() => handleDelete(q.id)}>🗑️ Delete</button>
                </div>
              </div>
              <h3 className="question-text">{q.question_text}</h3>
              <div className="options-grid admin-options">
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div
                    key={opt}
                    className={`option-display ${opt === q.correct_answer ? 'correct-option' : ''}`}
                  >
                    <span className="option-label">{opt.toUpperCase()}</span>
                    <span className="option-text">{q[`option_${opt}`]}</span>
                    {opt === q.correct_answer && <span className="check-mark">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Question Text</label>
                <textarea
                  name="question_text"
                  value={formData.question_text}
                  onChange={handleChange}
                  placeholder="Enter question text..."
                  required
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Option A</label>
                  <input
                    type="text"
                    name="option_a"
                    value={formData.option_a}
                    onChange={handleChange}
                    placeholder="Option A"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Option B</label>
                  <input
                    type="text"
                    name="option_b"
                    value={formData.option_b}
                    onChange={handleChange}
                    placeholder="Option B"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Option C</label>
                  <input
                    type="text"
                    name="option_c"
                    value={formData.option_c}
                    onChange={handleChange}
                    placeholder="Option C"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Option D</label>
                  <input
                    type="text"
                    name="option_d"
                    value={formData.option_d}
                    onChange={handleChange}
                    placeholder="Option D"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Correct Answer</label>
                  <select
                    name="correct_answer"
                    value={formData.correct_answer}
                    onChange={handleChange}
                    required
                  >
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Science, History"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
