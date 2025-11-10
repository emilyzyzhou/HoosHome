"use client"; 

import { useState } from 'react';
import './join.css';

export default function JoinPage() {
  const [joinCode, setJoinCode] = useState("");
  const [homeName, setHomeName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsLoading(true);
    setMessage(""); 
    setMessageType("");

    try {
      const response = await fetch('/api/join', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode }), 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage("Successfully found home! (ID: " + data.homeId + ")");
      } else {
        setMessageType("error");
        setMessage(data.message || "Invalid join code. Please try again.");
      }
    } catch (error) {
      console.error("Join Home failed:", error);
      setMessageType("error");
      setMessage("Could not connect to the server. Please try again later.");
    } finally {
      setIsLoading(false); 
    }
  };

  const handleCreateHome = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsLoading(true);
    setMessage("");
    setMessageType("");

    try {
      // Call our new API endpoint
      const response = await fetch('/api/create-home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          homeName: homeName, 
          homeAddress: homeAddress 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage(`Success! Your new join code is: ${data.newHome.joinCode}`);
        setHomeName("");
        setHomeAddress("");
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to create home. Please try again.");
      }
    } catch (error) {
      console.error("Create Home failed:", error);
      setMessageType("error");
      setMessage("Could not connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="joinContainer">
      <div className="joinCard">
        <div className="title">
          Welcome to HoosHome!
        </div>
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="content">
          <form onSubmit={handleJoinSubmit} className="joinForm">
            <p>Join an Existing Home</p>
            <input
              type="text"
              placeholder="Enter 6-Digit Join Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              disabled={isLoading}
              maxLength={6}
              className="joinCodeInput"
            />
            <button 
              type="submit" 
              className="btn" 
              disabled={isLoading || joinCode.length < 6}
            >
              {isLoading ? "..." : "Join Home"}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <form onSubmit={handleCreateHome} className="createForm">
            <p>Create a New Home</p>
            <input
              type="text"
              placeholder="Home Name (e.g., 'The Wahoo Den')"
              value={homeName}
              onChange={(e) => setHomeName(e.target.value)}
              disabled={isLoading}
              required
            />
            <input
              type="text"
              placeholder="Home Address"
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              disabled={isLoading}
              required
            />
            <button 
              type="submit" 
              className="btn" 
              disabled={isLoading || !homeName || !homeAddress}
            >
              {isLoading ? "..." : "Create Home"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}