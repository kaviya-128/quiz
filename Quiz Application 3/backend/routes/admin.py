from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from functools import wraps
from datetime import datetime, timezone, timedelta
from sqlalchemy import func
from models import db, User, Question, Answer

admin_bp = Blueprint('admin', __name__)


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') not in ['admin', 'staff']:
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    users = User.query.filter_by(role='user').order_by(User.created_at.desc()).all()
    return jsonify({
        'users': [u.to_dict() for u in users],
        'total': len(users)
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.role == 'admin':
        return jsonify({'error': 'Cannot delete admin user'}), 403

    # Delete user's answers first
    Answer.query.filter_by(user_id=user.id).delete()
    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': f'User {user.username} deleted successfully'}), 200


@admin_bp.route('/questions', methods=['POST'])
@admin_required
def create_question():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    correct_answer = data['correct_answer'].lower().strip()
    if correct_answer not in ['a', 'b', 'c', 'd']:
        return jsonify({'error': 'correct_answer must be a, b, c, or d'}), 400

    admin_id = int(get_jwt_identity())

    question = Question(
        question_text=data['question_text'].strip(),
        option_a=data['option_a'].strip(),
        option_b=data['option_b'].strip(),
        option_c=data['option_c'].strip(),
        option_d=data['option_d'].strip(),
        correct_answer=correct_answer,
        category=data.get('category', 'General').strip() or 'General',
        admin_id=admin_id
    )

    db.session.add(question)
    db.session.commit()

    return jsonify({'message': 'Question created', 'question': question.to_dict()}), 201


@admin_bp.route('/questions', methods=['GET'])
@admin_required
def get_questions():
    questions = Question.query.order_by(Question.created_at.desc()).all()
    return jsonify({
        'questions': [q.to_dict(include_answer=True) for q in questions],
        'total': len(questions)
    }), 200


@admin_bp.route('/questions/<int:question_id>', methods=['PUT'])
@admin_required
def update_question(question_id):
    question = Question.query.get(question_id)

    if not question:
        return jsonify({'error': 'Question not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if 'question_text' in data:
        question.question_text = data['question_text'].strip()
    if 'option_a' in data:
        question.option_a = data['option_a'].strip()
    if 'option_b' in data:
        question.option_b = data['option_b'].strip()
    if 'option_c' in data:
        question.option_c = data['option_c'].strip()
    if 'option_d' in data:
        question.option_d = data['option_d'].strip()
    if 'correct_answer' in data:
        ca = data['correct_answer'].lower().strip()
        if ca not in ['a', 'b', 'c', 'd']:
            return jsonify({'error': 'correct_answer must be a, b, c, or d'}), 400
        question.correct_answer = ca
    if 'category' in data:
        question.category = data['category'].strip() or 'General'

    db.session.commit()

    return jsonify({'message': 'Question updated', 'question': question.to_dict()}), 200


@admin_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@admin_required
def delete_question(question_id):
    question = Question.query.get(question_id)

    if not question:
        return jsonify({'error': 'Question not found'}), 404

    # Delete related answers first
    Answer.query.filter_by(question_id=question.id).delete()
    db.session.delete(question)
    db.session.commit()

    return jsonify({'message': 'Question deleted successfully'}), 200


@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def get_analytics():
    total_users = User.query.filter_by(role='user').count()
    total_questions = Question.query.count()
    total_answers = Answer.query.count()
    correct_answers = Answer.query.filter_by(is_correct=True).count()
    accuracy = round((correct_answers / total_answers * 100), 1) if total_answers > 0 else 0

    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_users = User.query.filter(
        User.role == 'user',
        User.created_at >= seven_days_ago
    ).count()

    # Categories with question counts
    categories = db.session.query(
        Question.category, func.count(Question.id)
    ).group_by(Question.category).all()
    categories_list = [{'category': c[0] or 'General', 'count': c[1]} for c in categories]

    # Top performers
    top_performers_query = db.session.query(
        User.username,
        func.count(Answer.id).label('total_answers'),
        func.sum(db.case((Answer.is_correct == True, 1), else_=0)).label('correct_answers')
    ).join(Answer, Answer.user_id == User.id).filter(
        User.role == 'user'
    ).group_by(User.username).order_by(
        func.sum(db.case((Answer.is_correct == True, 1), else_=0)).desc()
    ).limit(5).all()

    top_performers = []
    for tp in top_performers_query:
        total = tp.total_answers
        correct = int(tp.correct_answers) if tp.correct_answers else 0
        top_performers.append({
            'username': tp.username,
            'total_answers': total,
            'correct_answers': correct,
            'accuracy': round((correct / total * 100), 1) if total > 0 else 0
        })

    return jsonify({
        'total_users': total_users,
        'total_questions': total_questions,
        'total_answers': total_answers,
        'correct_answers': correct_answers,
        'accuracy': accuracy,
        'recent_users': recent_users,
        'categories': categories_list,
        'top_performers': top_performers
    }), 200
