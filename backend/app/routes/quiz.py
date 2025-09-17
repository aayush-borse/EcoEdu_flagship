from flask import Blueprint, jsonify

quiz_bp = Blueprint("quiz", __name__)

@quiz_bp.route("/", methods=["GET"])
def get_quizzes():
    return jsonify([
        {"id": 1, "question": "What is the most recycled material?", "options": ["Paper", "Plastic", "Glass"], "answer": "Paper"},
        {"id": 2, "question": "Which gas causes global warming?", "options": ["Oxygen", "CO2", "Nitrogen"], "answer": "CO2"}
    ])
