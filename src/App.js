import React, { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:8000";

export default function MaimaiQueueApp() {
  const [queue, setQueue] = useState([]);
  const [username, setUsername] = useState("");
  const eventSourceRef = useRef(null);

  const fetchQueue = async () => {
    const res = await fetch(`${API_BASE}/queue`);
    const data = await res.json();
    setQueue(data.queue);
  };

  const handleAdd = async () => {
    const trimmed = username.trim();
    if (!trimmed || queue.includes(trimmed)) return;
    if (trimmed.length > 8) {
      alert("Username must be at most 8 characters");
      return;
    }

    setUsername("");

    const res = await fetch(`${API_BASE}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: trimmed })
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    }
  };

  const handleFinish = async () => {
    setQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;
      return [...prevQueue.slice(1), prevQueue[0]];
    });

    await fetch(`${API_BASE}/finish`, { method: "POST" });
  };

  useEffect(() => {
    fetchQueue();

    const evt = new EventSource(`${API_BASE}/events`);
    evt.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        setQueue(parsed.queue);
      } catch (err) {
        console.error("Failed to parse SSE data:", e.data);
      }
    };
    evt.onerror = (err) => {
      console.error("SSE error:", err);
    };

    eventSourceRef.current = evt;

    return () => {
      evt.close();
    };
  }, []);

  const handleLeave = async () => {
    const trimmed = username.trim();
    if (!trimmed || !queue.includes(trimmed)) return;

    setUsername("");

    await fetch(`${API_BASE}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: trimmed })
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6" id="outerWrap">
        <div id="title-section">
          <img src={require("./mai.png")} alt="logo"></img>
          <h1 className="text-3xl font-bold">
            MMCB Queue
          </h1>
        </div>

        <div id="innerWrap">
          <div className="container-normal">
            <h2 className="text-xl font-semibold">
              Welcome! Please type your name below:
            </h2>
            <br></br>
            <div className="flex gap-2">
              <input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="border border-gray-300 px-4 py-2 rounded-md w-full"
              />
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Join Queue
              </button>
            </div>
          </div>

          <div className="container-normal">
            <h2 className="text-xl font-semibold">Current Player:</h2>
            <div className="text-2xl font-mono mt-2">{queue[0] || "No one yet"}</div>
            <div>
              <button
                onClick={handleFinish}
                disabled={queue.length === 0}
                className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Finish Game (Next Player)
              </button>
            </div>
          </div>

          <div className="container-normal">
            <h2 className="text-xl font-semibold">Queue List:</h2>
            <ul className="mt-2 list-decimal list-inside">
              {queue.slice(1).map((name, index) => (
                <li key={index} className="text-lg font-mono">
                  {name}
                </li>
              ))}
            </ul>
          </div>
      
          <a href="https://discord.gg/s35uXgZn89" className="logo-social"><img src={require("./discord.png")} alt="discord server" title="MMCB Discord Server"></img></a>
        </div>
      </div>
  );
}
