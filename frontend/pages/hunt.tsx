import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import axios from "axios";

// Dynamically import Leaflet components (SSR safe)
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

// Cool icons for Eco Hunt items
const ITEM_ICONS: { [key: string]: string } = {
  tree: "/hunt-icons/tree.png",
  bird: "/hunt-icons/bird.png",
  flower: "/hunt-icons/flower.png",
  animal: "/hunt-icons/animal.png",
};

interface HuntItem {
  id: number;
  name: string;
  type: string;
  rarity: string;
  latitude: number;
  longitude: number;
  image_url?: string;
}

export default function HuntPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [items, setItems] = useState<HuntItem[]>([]);
  const [collected, setCollected] = useState<number[]>([]);
  const [capturing, setCapturing] = useState<number | null>(null);

  const userId = "user123"; // Replace with real user ID

  // Get geolocation
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        err => console.error(err)
      );
    }
  }, []);

  // Load items around user
  useEffect(() => {
    if (!userLocation) return;
    axios
      .get("http://localhost:5000/hunt/items", { params: { lat: userLocation[0], lng: userLocation[1] } })
      .then(res => setItems(res.data))
      .catch(console.error);
  }, [userLocation]);

  // Catch item
  const catchItem = (itemId: number) => {
    setCapturing(itemId);
    setTimeout(() => {
      setCollected([...collected, itemId]);
      setCapturing(null);
      alert("🌱 You caught the Eco Entity!");
    }, 1200); // simulate capture animation
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <section className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-700">🌿 Eco Hunt</h2>

        {userLocation ? (
          <MapContainer center={userLocation} zoom={16} style={{ height: "70vh", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {items.map(item => (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={L.icon({
                  iconUrl: ITEM_ICONS[item.type] || "/hunt-icons/default.png",
                  iconSize: [48, 48],
                  iconAnchor: [24, 48],
                  popupAnchor: [0, -40],
                  shadowUrl: "/hunt-icons/marker-shadow.png",
                  shadowSize: [48, 48],
                  shadowAnchor: [24, 48],
                })}
              >
                <Popup className="!max-w-xs !p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p>Type: {item.type}</p>
                    <p>Rarity: {item.rarity}</p>
                    <img
                      src={item.image_url || ITEM_ICONS[item.type]}
                      className="w-20 h-20 mx-auto my-2 rounded-full border-2 border-green-500"
                    />
                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        onClick={() => catchItem(item.id)}
                        disabled={collected.includes(item.id) || capturing === item.id}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                      >
                        {capturing === item.id
                          ? "Catching..."
                          : collected.includes(item.id)
                          ? "Collected"
                          : "Catch with Eco Cube 🌱"}
                      </button>
                      <button
                        onClick={() => alert("🚶 Go to the location to explore!")}
                        className="bg-yellow-400 text-gray-900 px-4 py-2 rounded hover:bg-yellow-500"
                      >
                        Go There
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <p className="text-center text-gray-600">📍 Getting your location...</p>
        )}

        {/* Inventory */}
        <h3 className="mt-6 text-xl font-bold text-center text-green-700">Inventory</h3>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {items
            .filter(i => collected.includes(i.id))
            .map(i => (
              <div key={i.id} className="bg-white dark:bg-gray-800 p-2 rounded shadow text-center">
                <img src={i.image_url || ITEM_ICONS[i.type]} className="w-16 h-16 mx-auto" />
                <p className="text-sm font-semibold">{i.name}</p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
