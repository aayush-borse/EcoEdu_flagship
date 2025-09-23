from flask import Blueprint, request, jsonify
import random
import time

hunt_bp = Blueprint("hunt", __name__)

# Base items pool (spawned randomly on the map)
ITEM_POOL = [
    {
        "id": 1,
        "name": "Rare Oak Tree",
        "type": "tree",
        "rarity": "rare",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/3/32/Oak_tree_example.jpg",
    },
    {
        "id": 2,
        "name": "Colorful Parrot",
        "type": "bird",
        "rarity": "uncommon",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Macaw_example.jpg",
    },
    {
        "id": 3,
        "name": "Golden Deer",
        "type": "animal",
        "rarity": "legendary",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Golden_deer_example.jpg",
    },
]

# Active spawned items { instance_id: item_data }
ACTIVE_ITEMS = {}

# Track user inventories & Eco Cubes & Eco Points
USER_COLLECTED = {}  # { user_id: [items] }
USER_CUBES = {}      # { user_id: int }
USER_POINTS = {}     # { user_id: int }


def spawn_item_near(lat, lng):
    """Spawn a random item near given location."""
    base = random.choice(ITEM_POOL)
    offset_lat = lat + random.uniform(-0.002, 0.002)
    offset_lng = lng + random.uniform(-0.002, 0.002)

    item = {
        "instance_id": str(int(time.time() * 1000)) + str(random.randint(100, 999)),
        "name": base["name"],
        "type": base["type"],
        "rarity": base["rarity"],
        "latitude": offset_lat,
        "longitude": offset_lng,
        "image_url": base["image_url"],
    }
    ACTIVE_ITEMS[item["instance_id"]] = item
    return item


@hunt_bp.route("/items", methods=["GET"])
def get_items():
    """Fetch hunt items near user."""
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)

    if lat is None or lng is None:
        return jsonify({"success": False, "message": "lat/lng required"}), 400

    spawned = [spawn_item_near(lat, lng) for _ in range(3)]
    return jsonify({"success": True, "items": spawned})


@hunt_bp.route("/found", methods=["POST"])
def found_item():
    """Catch an item using an Eco Cube (if user is nearby)."""
    data = request.json
    user_id = str(data.get("user_id"))
    instance_id = str(data.get("item_id"))

    # Initialize user if new
    USER_CUBES[user_id] = USER_CUBES.get(user_id, 10)
    USER_POINTS[user_id] = USER_POINTS.get(user_id, 0)
    if user_id not in USER_COLLECTED:
        USER_COLLECTED[user_id] = []

    if USER_CUBES[user_id] <= 0:
        return jsonify({"success": False, "message": "No Eco Cubes left"}), 400

    if instance_id not in ACTIVE_ITEMS:
        return jsonify({"success": False, "message": "Item not found"}), 404

    # Deduct cube
    USER_CUBES[user_id] -= 1
    # Add to inventory
    USER_COLLECTED[user_id].append(ACTIVE_ITEMS[instance_id])
    del ACTIVE_ITEMS[instance_id]

    return jsonify({
        "success": True,
        "inventory": USER_COLLECTED[user_id],
        "remaining_cubes": USER_CUBES[user_id],
        "eco_points": USER_POINTS[user_id],
    })


@hunt_bp.route("/eco_cubes/buy", methods=["POST"])
def buy_cube():
    """Buy Eco Cubes."""
    data = request.json
    user_id = str(data.get("user_id"))
    amount = int(data.get("amount", 1))
    USER_CUBES[user_id] = USER_CUBES.get(user_id, 10) + amount
    return jsonify({"success": True, "total": USER_CUBES[user_id]})


@hunt_bp.route("/inventory", methods=["GET"])
def inventory():
    """Return user inventory and cubes."""
    user_id = request.args.get("user_id")
    USER_CUBES[user_id] = USER_CUBES.get(user_id, 10)
    USER_POINTS[user_id] = USER_POINTS.get(user_id, 0)
    return jsonify({
        "success": True,
        "items": USER_COLLECTED.get(user_id, []),
        "eco_cubes": USER_CUBES.get(user_id, 10),
        "eco_points": USER_POINTS[user_id],
    })


@hunt_bp.route("/trade", methods=["POST"])
def trade_items():
    """Trade selected items for Eco Points."""
    data = request.json
    user_id = str(data.get("user_id"))
    item_ids = data.get("item_ids", [])

    if user_id not in USER_COLLECTED:
        return jsonify({"success": False, "message": "No items to trade"}), 400

    traded = [i for i in USER_COLLECTED[user_id] if i["instance_id"] in item_ids]
    if not traded:
        return jsonify({"success": False, "message": "No valid items selected"}), 400

    points_earned = len(traded) * 5  # Example: 5 points per item
    USER_POINTS[user_id] += points_earned
    USER_COLLECTED[user_id] = [i for i in USER_COLLECTED[user_id] if i["instance_id"] not in item_ids]

    return jsonify({
        "success": True,
        "eco_points": USER_POINTS[user_id],
        "inventory": USER_COLLECTED[user_id],
        "points_earned": points_earned
    })
