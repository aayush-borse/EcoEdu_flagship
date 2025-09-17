from flask import Blueprint, jsonify

leaderboard_bp = Blueprint("leaderboard", __name__)

@leaderboard_bp.route("/", methods=["GET"])
def get_leaderboard():
    return jsonify([
        {"username": "EcoStudent", "points": 120},
        {"username": "GreenWarrior", "points": 100},
        {"username": "TreePlanter", "points": 90}
    ])
