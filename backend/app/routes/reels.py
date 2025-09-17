from flask import Blueprint, jsonify

reels_bp = Blueprint("reels", __name__)

@reels_bp.route("/", methods=["GET"])
def get_reels():
    return jsonify([
        {"id": 1, "video_url": "https://www.w3schools.com/html/mov_bbb.mp4", "likes": 20},
        {"id": 2, "video_url": "https://www.w3schools.com/html/movie.mp4", "likes": 15}
    ])
