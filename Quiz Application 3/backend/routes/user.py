from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Question, Answer

user_bp = Blueprint('user', __name__)


@user_bp.route('/questions', methods=['GET'])
@jwt_required()
def get_questions():
    questions = Question.query.order_by(Question.created_at.desc()).all()
    # Return questions WITHOUT correct_answer
    return jsonify({
        'questions': [q.to_dict(include_answer=False) for q in questions]
    }), 200


@user_bp.route('/submit-answer', methods=['POST'])
@jwt_required()
def submit_answer():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    question_id = data.get('question_id')
    selected_answer = data.get('selected_answer', '').lower().strip()

    if not question_id or not selected_answer:
        return jsonify({'error': 'question_id and selected_answer are required'}), 400

    if selected_answer not in ['a', 'b', 'c', 'd']:
        return jsonify({'error': 'selected_answer must be a, b, c, or d'}), 400

    # Check if already answered
    existing = Answer.query.filter_by(user_id=user_id, question_id=question_id).first()
    if existing:
        return jsonify({'error': 'You have already answered this question'}), 409

    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404

    is_correct = selected_answer == question.correct_answer

    answer = Answer(
        user_id=user_id,
        question_id=question_id,
        selected_answer=selected_answer,
        is_correct=is_correct
    )

    db.session.add(answer)
    db.session.commit()

    return jsonify({
        'is_correct': is_correct,
        'correct_answer': question.correct_answer,
        'message': 'Correct!' if is_correct else 'Wrong answer'
    }), 200


@user_bp.route('/my-results', methods=['GET'])
@jwt_required()
def my_results():
    user_id = int(get_jwt_identity())

    answers = Answer.query.filter_by(user_id=user_id).order_by(Answer.submitted_at.desc()).all()

    total_answered = len(answers)
    correct_answers = sum(1 for a in answers if a.is_correct)
    accuracy = round((correct_answers / total_answered * 100), 1) if total_answered > 0 else 0

    results = []
    for ans in answers:
        question = Question.query.get(ans.question_id)
        results.append({
            'question_text': question.question_text if question else 'Deleted question',
            'your_answer': ans.selected_answer,
            'correct_answer': question.correct_answer if question else '-',
            'is_correct': ans.is_correct,
            'submitted_at': ans.submitted_at.isoformat() if ans.submitted_at else None
        })

    return jsonify({
        'total_answered': total_answered,
        'correct_answers': correct_answers,
        'accuracy': accuracy,
        'results': results
    }), 200
