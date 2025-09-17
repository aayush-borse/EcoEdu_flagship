from flask import Blueprint, jsonify

posts_bp = Blueprint("posts", __name__)

@posts_bp.route("/", methods=["GET"])
def get_posts():
    return jsonify([
        {"id": 1, "caption": "Cleaned up the local park", "likes": 12},
        {"id": 2, "caption": "Started composting at home", "likes": 8}
    ])

@posts_bp.route("/<int:id>/like", methods=["POST"])
def like_post(id):
    return jsonify({"message": f"Post {id} liked!"})
