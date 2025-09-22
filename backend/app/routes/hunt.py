from flask import Blueprint, request, jsonify
import random
import time

hunt_bp = Blueprint("hunt", __name__)

# Base items (they’ll be spawned randomly on the map)
ITEM_POOL = [
    {
        "id": 1,
        "name": "Rare Oak Tree",
        "type": "tree",
        "rarity": "rare",
        "image_url": "/hunt_items/oak.png",
    },
    {
        "id": 2,
        "name": "Colorful Parrot",
        "type": "bird",
        "rarity": "uncommon",
        "image_url": "/hunt_items/parrot.png",
    },
    {
        "id": 3,
        "name": "Golden Deer",
        "type": "animal",
        "rarity": "legendary",
        "image_url": "/hunt_items/deer.png",
    },
]

# Active spawned items { item_id: {...data...} }
ACTIVE_ITEMS = {}

# Track inventories & Eco Cubes
USER_COLLECTED = {}
USER_CUBES = {}


def spawn_item_near(lat, lng):
    """Spawn a random item near given location"""
    base = random.choice(ITEM_POOL)
    # Add random offset to spawn nearby
    offset_lat = lat + random.uniform(-0.002, 0.002)
    offset_lng = lng + random.uniform(-0.002, 0.002)

    item = {
        "instance_id": str(int(time.time() * 1000)) + str(random.randint(100, 999)),  # unique id
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
    """Fetch hunt items near user"""
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)

    if not lat or not lng:
        return jsonify({"success": False, "message": "lat/lng required"}), 400

    # For MVP: spawn 3 new items near the user
    spawned = [spawn_item_near(lat, lng) for _ in range(3)]
    return jsonify({"success": True, "items": spawned})


@hunt_bp.route("/found", methods=["POST"])
def found_item():
    """Catch an item using an Eco Cube"""
    data = request.json
    user_id = str(data.get("user_id"))
    instance_id = str(data.get("item_id"))

    if USER_CUBES.get(user_id, 0) <= 0:
        return jsonify({"success": False, "message": "No Eco Cubes left"}), 400

    # Deduct a cube
    USER_CUBES[user_id] -= 1

    if user_id not in USER_COLLECTED:
        USER_COLLECTED[user_id] = []

    if instance_id in ACTIVE_ITEMS:
        USER_COLLECTED[user_id].append(ACTIVE_ITEMS[instance_id])
        del ACTIVE_ITEMS[instance_id]

    return jsonify({
        "success": True,
        "inventory": USER_COLLECTED[user_id],
        "remaining_cubes": USER_CUBES[user_id],
    })


@hunt_bp.route("/eco_cubes/buy", methods=["POST"])
def buy_cube():
    """Buy Eco Cubes"""
    data = request.json
    user_id = str(data.get("user_id"))
    amount = int(data.get("amount", 1))
    USER_CUBES[user_id] = USER_CUBES.get(user_id, 0) + amount
    return jsonify({"success": True, "total": USER_CUBES[user_id]})


@hunt_bp.route("/inventory", methods=["GET"])
def inventory():
    """Return user inventory"""
    user_id = request.args.get("user_id")
    return jsonify({
        "success": True,
        "items": USER_COLLECTED.get(user_id, []),
        "eco_cubes": USER_CUBES.get(user_id, 0),
    })
