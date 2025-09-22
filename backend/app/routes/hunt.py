from flask import Blueprint, request, jsonify

hunt_bp = Blueprint("hunt", __name__)

# Minimal in-memory data for MVP
HUNT_ITEMS = [
    {
        "id": 1,
        "name": "Rare Oak Tree",
        "type": "tree",
        "rarity": "rare",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "image_url": "/hunt_items/oak.png",
    },
    {
        "id": 2,
        "name": "Colorful Parrot",
        "type": "bird",
        "rarity": "uncommon",
        "latitude": 28.6145,
        "longitude": 77.2100,
        "image_url": "/hunt_items/parrot.png",
    },
]

# Track which items each user collected
USER_COLLECTED = {}

# Track Eco Cubes per user
USER_CUBES = {}

@hunt_bp.route("/items", methods=["GET"])
def get_items():
    """Fetch hunt items, optionally filtered by location"""
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    # For MVP, just return all items
    return jsonify(HUNT_ITEMS)

@hunt_bp.route("/found", methods=["POST"])
def found_item():
    """User catches an item"""
    data = request.json
    user_id = data.get("user_id")
    item_id = data.get("item_id")

    if USER_CUBES.get(user_id, 0) <= 0:
        return jsonify({"success": False, "message": "No Eco Cubes left"}), 400

    # Deduct 1 Eco Cube
    USER_CUBES[user_id] -= 1

    if user_id not in USER_COLLECTED:
        USER_COLLECTED[user_id] = []

    if item_id not in USER_COLLECTED[user_id]:
        USER_COLLECTED[user_id].append(item_id)

    return jsonify({"success": True, "found_items": USER_COLLECTED[user_id], "remaining_cubes": USER_CUBES[user_id]})

@hunt_bp.route("/eco_cubes/use", methods=["POST"])
def use_cube():
    """Use one Eco Cube"""
    data = request.json
    user_id = data.get("user_id")
    if USER_CUBES.get(user_id, 0) > 0:
        USER_CUBES[user_id] -= 1
        return jsonify({"success": True, "remaining": USER_CUBES[user_id]})
    return jsonify({"success": False, "message": "No Eco Cubes left"}), 400

@hunt_bp.route("/eco_cubes/buy", methods=["POST"])
def buy_cube():
    """Buy Eco Cubes (simple MVP, no payment)"""
    data = request.json
    user_id = data.get("user_id")
    amount = int(data.get("amount", 1))
    USER_CUBES[user_id] = USER_CUBES.get(user_id, 0) + amount
    return jsonify({"success": True, "total": USER_CUBES[user_id]})
