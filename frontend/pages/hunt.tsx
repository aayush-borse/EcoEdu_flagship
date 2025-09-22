// pages/hunt.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

// ✅ Dynamically import React-Leaflet components (never run on server)
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

type HuntItem = {
  instance_id: string;
  name: string;
  type: string;
  rarity: string;
  latitude: number;
  longitude: number;
  image_url: string;
};

export default function HuntPage() {
  const [L, setL] = useState<any>(null); // ✅ Lazy-load Leaflet client-side
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [items, setItems] = useState<HuntItem[]>([]);
  const [ecoCubes, setEcoCubes] = useState<number>(0);
  const [inventory, setInventory] = useState<HuntItem[]>([]);
  const userId = "demo_user";

  useEffect(() => {
    // ✅ Import Leaflet only on client
    (async () => {
      const leaflet = await import("leaflet");
      setL(leaflet);
    })();
  }, []);

  // ✅ Fetch items from backend
  const fetchItems = async (lat: number, lng: number) => {
    const res = await fetch(
      `http://localhost:5000/hunt/items?lat=${lat}&lng=${lng}`
    );
    const data = await res.json();
    if (data.success) setItems(data.items);
  };

  const fetchInventory = async () => {
    const res = await fetch(
      `http://localhost:5000/hunt/inventory?user_id=${userId}`
    );
    const data = await res.json();
    if (data.success) {
      setInventory(data.items);
      setEcoCubes(data.eco_cubes);
    }
  };

  const catchItem = async (itemId: string) => {
    const res = await fetch("http://localhost:5000/hunt/found", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, item_id: itemId }),
    });
    const data = await res.json();
    if (data.success) {
      alert(`You caught a ${data.inventory[data.inventory.length - 1].name}!`);
      setInventory(data.inventory);
      setEcoCubes(data.remaining_cubes);
      setItems((prev) => prev.filter((i) => i.instance_id !== itemId));
    } else {
      alert(data.message);
    }
  };

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          setPosition(coords);
          fetchItems(coords[0], coords[1]);
          fetchInventory();
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  if (!L) return <p className="p-6">Loading game engine...</p>;

  const userIcon = new L.Icon({
    iconUrl: "/icons/user.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const itemIcon = new L.Icon({
    iconUrl: "/icons/creature.png",
    iconSize: [50, 50],
    iconAnchor: [25, 50],
  });

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Navbar */}
      <div className="bg-green-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🌍 Eco Hunt</h1>
        <div className="flex gap-6">
          <span>Eco Cubes: {ecoCubes}</span>
          <span>Inventory: {inventory.length}</span>
        </div>
      </div>

      {/* Map */}
      {position ? (
        <MapContainer
          center={position}
          zoom={16}
          className="flex-1"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* User marker */}
          <Marker position={position} icon={userIcon}>
            <Popup>You are here!</Popup>
          </Marker>

          {/* Hunt items */}
          {items.map((item) => (
            <Marker
              key={item.instance_id}
              position={[item.latitude, item.longitude]}
              icon={itemIcon}
            >
              <Popup>
                <div className="text-center">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-32 h-32 object-contain mx-auto"
                  />
                  <h2 className="text-lg font-bold">{item.name}</h2>
                  <p className="text-sm italic">Rarity: {item.rarity}</p>
                  <button
                    onClick={() => catchItem(item.instance_id)}
                    className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-800"
                  >
                    🎯 Catch
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
}
