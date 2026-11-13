import { useState, useEffect, useRef } from "react";

function loadLastReadTimes() {
  try {
    return JSON.parse(localStorage.getItem("lastReadTimes") || "{}");
  } catch {
    return {};
  }
}

function Messages({ user, messages, players, archivedPlayers, coachId, onSend, onSendToAll, onDeleteConversation }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showArchives, setShowArchives] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [lastReadTimes, setLastReadTimes] = useState(loadLastReadTimes);
  const coachChatRef = useRef(null);
  const playerChatRef = useRef(null);

  const isCoach = user?.role === "coach";

  const conversation = isCoach
    ? (selectedPlayer ? messages.filter(m =>
        (m.sender_id === user.id && m.receiver_id === selectedPlayer.id) ||
        (m.sender_id === selectedPlayer.id && m.receiver_id === user.id)) : [])
    : messages.filter(m => m.sender_id === user.id || m.receiver_id === user.id);

  const unreadCounts = {};
  if (isCoach) {
    messages.forEach(msg => {
      if (msg.receiver_id !== user.id || msg.sender_id === selectedPlayer?.id) return;
      const lastRead = lastReadTimes[msg.sender_id] || 0;
      if (new Date(msg.created_at) > new Date(lastRead)) {
        unreadCounts[msg.sender_id] = (unreadCounts[msg.sender_id] || 0) + 1;
      }
    });
  }

  useEffect(() => {
    if (!isCoach || !selectedPlayer) return;
    setLastReadTimes(prev => {
      const next = { ...prev, [selectedPlayer.id]: new Date().toISOString() };
      try { localStorage.setItem("lastReadTimes", JSON.stringify(next)); } catch {}
      return next;
    });
  }, [isCoach, selectedPlayer, messages]);

  useEffect(() => {
    if (coachChatRef.current) {
      coachChatRef.current.scrollTop = coachChatRef.current.scrollHeight;
    }
    if (playerChatRef.current) {
      playerChatRef.current.scrollTop = playerChatRef.current.scrollHeight;
    }
  }, [conversation.length, selectedPlayer]);

  function sendMessage() {
    if (newMessage === "") return;
    const receiverId = isCoach ? selectedPlayer?.id : coachId;
    if (!receiverId) return;
    onSend(receiverId, newMessage);
    setNewMessage("");
  }

  function sendToAll() {
    if (newMessage === "") return;
    onSendToAll(players.map(p => p.id), `[TO ALL] ${newMessage}`);
    setNewMessage("");
  }

  function deleteConversation(player) {
    onDeleteConversation(player.id);
    setConfirmDelete(null);
  }

  if (!isCoach) {
    return (
      <div style={{ padding: "20px", maxWidth: "700px" }}>
        <h1>Messages</h1>
        <div ref={playerChatRef} style={{ height: "400px", overflowY: "auto", background: "#f9f9f9", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
          {conversation.length === 0 && <p style={{ color: "#999" }}>No messages yet. Your coach will message you here.</p>}
          {conversation.map((msg) => (
            <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender_id === user.id ? "flex-end" : "flex-start", marginBottom: "10px", width: "100%", boxSizing: "border-box" }}>
              <div style={{ background: msg.sender_id === user.id ? "#4434d3" : "white", color: msg.sender_id === user.id ? "white" : "black", padding: "10px 14px", borderRadius: "12px", maxWidth: "85%", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", wordBreak: "break-word", overflowWrap: "break-word" }}>
                <div style={{ fontSize: "11px", color: msg.sender_id === user.id ? "rgba(255,255,255,0.7)" : "#999", marginBottom: "4px" }}>
                  {msg.sender_id === user.id ? "You" : msg.content.startsWith("[TO ALL]") ? "Coach · 📢 Team" : "Coach"}
                </div>
                {msg.content.startsWith("[TO ALL]") ? msg.content.replace("[TO ALL] ", "") : msg.content}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            placeholder="Reply to coach..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" , minWidth: 0 }}
          />
          <button onClick={sendMessage} style={{ padding: "10px 20px", background: "#4434d3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Send</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Messages</h1>
<div style={{ display: "flex", gap: "20px", flexDirection: window.innerWidth < 600 ? "column" : "row" }}>
        <div style={{ width: window.innerWidth < 600 ? "100%" : "200px" }}>
          <h3>Players</h3>
          {players.length === 0 && <p style={{ color: "#999", fontSize: "13px" }}>No players yet. Add some in the Roster tab.</p>}
          {players.map((player) => (
            <div key={player.id} style={{ display: "flex", alignItems: "center", marginBottom: "6px", gap: "6px" }}>
              <div onClick={() => setSelectedPlayer(player)} style={{ flex: 1, padding: "10px", background: selectedPlayer?.id === player.id ? "#4434d3" : "#f0f0f0", color: selectedPlayer?.id === player.id ? "white" : "black", borderRadius: "6px", cursor: "pointer", fontWeight: "500", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {player.name}
                {unreadCounts[player.id] > 0 && (
                  <span style={{ background: "red", color: "white", borderRadius: "50%", fontSize: "11px", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>
                    {unreadCounts[player.id]}
                  </span>
                )}
              </div>
              <button onClick={() => setConfirmDelete(player)} style={{ padding: "6px 8px", background: "none", border: "1px solid white", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>🗑️</button>
            </div>
          ))}
          <div style={{ marginTop: "20px", borderTop: "1px solid #ddd", paddingTop: "12px" }}>
            <div onClick={() => setShowArchives(!showArchives)} style={{ cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#888", display: "flex", justifyContent: "space-between" }}>
              <span>📁 Archives</span>
              <span>{showArchives ? "▲" : "▼"}</span>
            </div>
            {showArchives && (
              <div style={{ marginTop: "8px" }}>
                {archivedPlayers.length === 0 && <p style={{ color: "#999", fontSize: "13px" }}>No archived players.</p>}
                {archivedPlayers.map((player) => (
                  <div key={player.id} onClick={() => setSelectedPlayer({ ...player, archived: true })} style={{ padding: "10px", marginBottom: "6px", background: selectedPlayer?.id === player.id ? "#888" : "#e8e8e8", color: selectedPlayer?.id === player.id ? "white" : "#555", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "14px", fontStyle: "italic" }}>
                    {player.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {!selectedPlayer && <p style={{ color: "#999" }}>Select a player to start messaging.</p>}
          {selectedPlayer && (
            <>
              <h3>Conversation with {selectedPlayer.name}</h3>
              <div ref={coachChatRef} style={{ height: "400px", overflowY: "auto", background: "#f9f9f9", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
                {conversation.length === 0 && <p style={{ color: "#999" }}>No messages yet.</p>}
                {conversation.map((msg) => (
                  <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender_id === user.id ? "flex-end" : "flex-start", marginBottom: "10px", width: "100%", boxSizing: "border-box" }}>
                    <div style={{ background: msg.sender_id === user.id ? "#4434d3" : "white", color: msg.sender_id === user.id ? "white" : "black", padding: "10px 14px", borderRadius: "12px", maxWidth: "85%", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                      <div style={{ fontSize: "11px", color: msg.sender_id === user.id ? "rgba(255,255,255,0.7)" : "#999", marginBottom: "4px" }}>
                        {msg.sender_id === user.id ? "You" : selectedPlayer.name}
                      </div>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              {selectedPlayer.archived ? (
                <p style={{ color: "#999", fontSize: "13px" }}>This player was removed from the roster. Conversation is read-only.</p>
              ) : (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "140px" }}
                  />
                  <button onClick={sendMessage} style={{ padding: "10px 20px", background: "#4434d3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Send</button>
                  <button onClick={sendToAll} title="Send to every player" style={{ padding: "10px 20px", background: "#e67e22", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>📢 All</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {confirmDelete && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", padding: "28px", borderRadius: "12px", maxWidth: "320px", width: "100%", textAlign: "center" }}>
            <p style={{ fontWeight: "600", fontSize: "16px", marginBottom: "8px" }}>Delete Conversation</p>
            <p style={{ color: "#666", marginBottom: "20px" }}>Are you sure you want to delete all messages with <strong>{confirmDelete.name}</strong>?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: "10px 20px", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer", background: "white" }}>Cancel</button>
              <button onClick={() => deleteConversation(confirmDelete)} style={{ padding: "10px 20px", borderRadius: "6px", border: "none", cursor: "pointer", background: "red", color: "white", fontWeight: "600" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;
