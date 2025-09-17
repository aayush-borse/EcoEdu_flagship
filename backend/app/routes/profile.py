from flask import Blueprint, jsonify

profile_bp = Blueprint("profile", __name__)

@profile_bp.route("/", methods=["GET"])
def get_profile():
    return jsonify({
        "username": "EcoStudent",
        "points": 120,
        "posts": [
            {"id": 1, "caption": "Planted 5 trees today!"},
            {"id": 2, "caption": "Recycled plastic bottles."}
        ],
        "quizzes_taken": 5
    })
