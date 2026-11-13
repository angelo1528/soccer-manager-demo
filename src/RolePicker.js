import { useState } from "react";

function RolePicker({ teams, coach, onPick }) {
  const allPlayers = teams.flatMap((t) => t.players.map((p) => ({ ...p, teamName: t.name })));
  const [playerId, setPlayerId] = useState(allPlayers[0]?.id || "");

  function enterAsPlayer() {
    const player = allPlayers.find((p) => p.id === playerId);
    if (!player) return;
    onPick({ id: player.id, name: player.name, email: player.email, role: "player" });
  }

  const cardStyle = { background: "white", borderRadius: "16px", padding: "30px", width: "240px", textAlign: "center", boxShadow: "0 4px 16px rgba(68,52,211,0.15)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" };
  const buttonStyle = { width: "100%", padding: "12px", background: "#4434d3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "16px", marginTop: "auto" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#cbbce3", padding: "40px 16px", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: "56px", fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px", margin: 0, color: "#2c1f6b", textAlign: "center" }}>Soccer Team Manager</h1>
      <p style={{ fontSize: "18px", color: "#5a4a8a", marginTop: "10px", marginBottom: "32px", fontWeight: "500", textAlign: "center" }}>
        Interactive demo — no sign-up needed. Choose how you'd like to explore the app.
      </p>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center", alignItems: "stretch" }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: "700", color: "#2c1f6b", fontSize: "20px" }}>Manager</div>
          <div style={{ fontSize: "14px", color: "#777" }}>Create teams, manage the roster, schedule games and message players.</div>
          <div style={{ fontSize: "13px", color: "#4434d3", fontWeight: "600" }}>{coach.name}</div>
          <button onClick={() => onPick(coach)} style={buttonStyle}>Enter as Manager</button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: "700", color: "#2c1f6b", fontSize: "20px" }}>Player</div>
          <div style={{ fontSize: "14px", color: "#777" }}>See your schedule, read coach's notes, chat with your coach and edit your profile.</div>
          {allPlayers.length > 0 ? (
            <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
              {allPlayers.map((p) => (
                <option key={p.id} value={p.id}>#{p.number} {p.name} — {p.teamName}</option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: "13px", color: "red" }}>No players yet — add some as the manager first.</div>
          )}
          <button onClick={enterAsPlayer} disabled={allPlayers.length === 0} style={{ ...buttonStyle, opacity: allPlayers.length === 0 ? 0.5 : 1 }}>Enter as Player</button>
        </div>
      </div>
    </div>
  );
}

export default RolePicker;
