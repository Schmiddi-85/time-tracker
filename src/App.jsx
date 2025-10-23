import { useEffect, useState } from "react";

const N8N_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}

export default function App() {
  const [level1, setLevel1] = useState(localStorage.getItem("level1") || "");
  const [level2, setLevel2] = useState(localStorage.getItem("level2") || "");
  const [level3, setLevel3] = useState("");
  const [recentProjects, setRecentProjects] = useState(
    JSON.parse(localStorage.getItem("recentProjects") || "[]")
  );

  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState("");
  const [theme, setTheme] = useState("light");
  const [recordId, setRecordId] = useState(localStorage.getItem("recordId") || "");

  // Timer-Anzeige
  useEffect(() => {
    let id;
    if (startTime) {
      id = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(id);
  }, [startTime]);

  // Lokale Speicherung
  useEffect(() => {
    localStorage.setItem("level1", level1);
  }, [level1]);
  useEffect(() => {
    localStorage.setItem("level2", level2);
  }, [level2]);

  const format = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  // ▶️ Start
  const handleStart = async () => {
    if (startTime) return;
    const start = new Date();
    setStartTime(start);
    setStatus("Sende Startdaten …");

    // Letzte Projekte speichern
    if (level3 && level3.trim().length > 0) {
      setRecentProjects((prev) => {
        const cleaned = level3.trim();
        const updated = [cleaned, ...prev.filter((p) => p !== cleaned)].slice(0, 10);
        localStorage.setItem("recentProjects", JSON.stringify(updated));
        return updated;
      });
    }

    const payload = {
      level1,
      level2,
      level3,
      start: start.toISOString(),
      end: null,
      duration_sec: 0,
      deviceId: "macbook",
      userAgent: navigator.userAgent,
    };

    try {
      if (!N8N_URL) throw new Error("Keine Webhook-URL gesetzt");
      const res = await fetch(N8N_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      console.log("Roh-Antwort:", rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        console.error("Antwort ist kein gültiges JSON:", err);
        setStatus("❌ Ungültige Antwort vom Server");
        return;
      }

      console.log("Antwort vom n8n:", data);
      if (data.recordId) {
     console.log("Antwort vom n8n:", data);

let recordIdFromN8n = null;

// Prüfe, ob n8n ein Array zurückgibt
if (Array.isArray(data) && data.length > 0 && data[0].id) {
  recordIdFromN8n = data[0].id;
} else if (data.recordId) {
  recordIdFromN8n = data.recordId;
} else if (data.id) {
  recordIdFromN8n = data.id;
}

if (recordIdFromN8n) {
  setRecordId(recordIdFromN8n);
  localStorage.setItem('recordId', recordIdFromN8n);
  setStatus(`✅ Neue Zeiterfassung gestartet (ID: ${recordIdFromN8n})`);
  console.log("Record-ID gespeichert:", recordIdFromN8n);
} else {
  setStatus("⚠️ Keine Record-ID empfangen");
  console.warn("n8n hat keine ID geliefert, data=", data);
}

    } catch (e) {
      console.error("Fehler beim Start:", e);
      setStatus("Fehler beim Start senden ❌");
    }
  };

  // ⏹ Stop
  const handleStop = async () => {
    if (!startTime) return;
    if (!N8N_URL) {
      setStatus("Kein Webhook konfiguriert. Bitte .env.local prüfen.");
      setStartTime(null);
      return;
    }

    const end = new Date();
    const recordIdStored = localStorage.getItem("recordId");

    const payload = {
      level1,
      level2,
      level3,
      start: new Date(startTime).toISOString(),
      end: end.toISOString(),
      duration_sec: Math.floor((end - startTime) / 1000),
      recordId: recordIdStored,
      userAgent: navigator.userAgent,
    };

    try {
      setStatus("Sende Stoppdaten …");
      const res = await fetch(N8N_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("Roh-Antwort (Stop):", text);
      const data = JSON.parse(text);
      console.log("Antwort vom n8n (Stop):", data);

      setStatus("✅ Zeiterfassung gestoppt und gespeichert");
      localStorage.removeItem("recordId");
      setRecordId("");
      setLevel3("");
    } catch (e) {
      console.error(e);
      setStatus("Fehler beim Stop senden ❌");
    } finally {
      setStartTime(null);
    }
  };

  // 🔄 Reset
  const reset = () => {
    setLevel1("");
    setLevel2("");
    setLevel3("");
    setStartTime(null);
    setElapsed(0);
    setStatus("");
    setRecordId("");
    localStorage.removeItem("level1");
    localStorage.removeItem("level2");
    localStorage.removeItem("recordId");
  };

  return (
    <div
      className={classNames(
        "min-h-screen p-6 transition-colors",
        theme === "light" ? "bg-gray-100" : "bg-zinc-900"
      )}
    >
      <div
        className={classNames(
          "w-full max-w-md mx-auto rounded-2xl shadow-2xl p-6 border",
          theme === "light"
            ? "bg-white border-gray-100"
            : "bg-zinc-800 border-zinc-700 text-zinc-100"
        )}
      >
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">⏱ Time-Tracker</h1>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={classNames(
              "px-3 py-1 rounded-lg text-sm border",
              theme === "light"
                ? "bg-gray-50 hover:bg-gray-100"
                : "bg-zinc-700 hover:bg-zinc-600 border-zinc-600"
            )}
          >
            {theme === "light" ? "Dunkel" : "Hell"}
          </button>
        </header>

        <section className="space-y-3">
          <label className="block text-sm">
            <span className="block mb-1">Ebene 1</span>
            <select
              className="w-full p-2 rounded-lg border"
              value={level1}
              onChange={(e) => setLevel1(e.target.value)}
            >
              <option value="">Bitte wählen …</option>
              <option>Homeoffice</option>
              <option>OnSite</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="block mb-1">Ebene 2</span>
            <select
              className="w-full p-2 rounded-lg border"
              value={level2}
              onChange={(e) => setLevel2(e.target.value)}
            >
              <option value="">Bitte wählen …</option>
              <option>Vertrieb</option>
              <option>Projekt-Extern</option>
              <option>Projekt-Intern</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="block mb-1">Ebene 3 (Projekte / Freitext)</span>
            <input
              list="recentProjects"
              type="text"
              placeholder="z. B. Kunde X – App-Feature"
              className="w-full p-2 rounded-lg border"
              value={level3}
              onChange={(e) => setLevel3(e.target.value)}
            />
            <datalist id="recentProjects">
              {recentProjects.map((proj) => (
                <option key={proj} value={proj} />
              ))}
            </datalist>
          </label>
        </section>

        <section className="text-center my-6">
          <p className="text-gray-500 text-sm">Aktive Zeit</p>
          <p className="text-4xl font-mono">{format(elapsed)}</p>
        </section>

        <section className="flex justify-center gap-3">
          {!startTime ? (
            <button
              onClick={handleStart}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 active:scale-95 transition"
            >
              ▶️ Start
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 active:scale-95 transition"
            >
              ⏹ Stop
            </button>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Zurücksetzen
          </button>
        </section>

        {status && (
          <p className="text-center mt-4 text-sm opacity-90">{status}</p>
        )}

        {recordId && (
          <p className="text-center text-xs text-gray-500 mt-1">
            Aktive Record-ID: <code>{recordId}</code>
          </p>
        )}

        <footer className="mt-6 text-xs text-center opacity-70">
          <p>
            Gesendet an: <code>VITE_N8N_WEBHOOK_URL</code> (per 
            <code>.env.local</code>)
          </p>
        </footer>
      </div>
    </div>
  );
}
