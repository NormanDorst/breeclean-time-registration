import React, { useEffect, useState } from 'react';

const WORK_LAT = 51.7876584;
const WORK_LNG = 4.6560781;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Goedemorgen!";
  if (hour < 18) return "Goedemiddag!";
  return "Goedenavond!";
}

export default function App() {
  const [status, setStatus] = useState("Bezig met locatie controleren...");
  const [isOnLocation, setIsOnLocation] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [message, setMessage] = useState("");
  const [action, setAction] = useState("");
  const [now, setNow] = useState({ date: "", time: "" });
  const [result, setResult] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const distance = getDistance(lat, lng, WORK_LAT, WORK_LNG);
        if (distance < 1500) {
          const now = new Date();
          const date = now.toLocaleDateString("nl-NL");
          const time = now.toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit",
          });
          setGreeting(getGreeting());
          setNow({ date, time });
          setMessage(
            `Wil je op <strong>${date}</strong> om <strong>${time}</strong> je tijd registreren? Geef dan hieronder aan of je wilt inklokken of uitklokken.`
          );
          setFormVisible(true);
        } else {
          setStatus(`Niet op locatie. Jouw coördinaten: ${lat}, ${lng}. Afstand: ${distance.toFixed(2)} meter.`);
        }
      },
      () => {
        setStatus("Locatie kon niet bepaald worden. Sta locatietoegang toe.");
      }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!action) {
      alert("Selecteer een actie.");
      return;
    }
    const formData = new URLSearchParams();
    formData.append("datum", now.date);
    formData.append("tijd", now.time);
    formData.append("actie", action);
    formData.append("locatie", "Jupiterlaan 103");

    fetch(
      "https://script.google.com/macros/s/AKfycbzoNBrQrfxweD7Yb8UlV1j1yo_wogLDPUTyzUkIFrFs0vXeebas2XtvsWBUZsxmwCF2/exec",
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => response.text())
      .then((data) => setResult(`✔️ ${data}`));
  };

  if (!formVisible) {
    return (
      <main>
        <img src="/breeclean-logo.webp" alt="Logo" className="logo" />
        <h2>{status}</h2>
      </main>
    );
  }

  return (
    <main>
      <img src="/breeclean-logo.webp" alt="Logo" className="logo" />
      <form onSubmit={handleSubmit}>
        <p>{greeting}</p>
        <p dangerouslySetInnerHTML={{ __html: message }}></p>
        <div className="button-grid">
          {["Inklokken", "Uitklokken"].map((label) => (
            <button
              type="button"
              className={`action-button ${action === label ? "selected" : ""}`}
              key={label}
              onClick={() => setAction(label)}
            >
              <img
                src={`https://raw.githubusercontent.com/NormanDorst/tijdregistratie/main/${label === "Inklokken" ? "checkin" : "checkout"}.png`}
                alt={label}
              />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <button type="submit">Verzenden</button>
      </form>
      {result && <p>{result}</p>}
    </main>
  );
}
