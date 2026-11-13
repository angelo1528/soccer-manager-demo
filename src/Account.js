import { useState } from "react";

function Account({ user, onLogout, onUpdateUser, onResetDemo }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [message, setMessage] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  function saveName() {
    if (!name.trim()) return;
    onUpdateUser({ ...user, name });
    setMessage("Name updated!");
    setEditing(false);
  }

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
      <h1>Account</h1>

      <div style={{ background: "#f9f9f9", padding: "16px", borderRadius: "8px", marginBottom: "12px" }}>
        <div style={{ marginBottom: "10px" }}>
          <strong>Name:</strong>{" "}
          {editing ? (
            <span style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <button onClick={saveName} style={{ padding: "4px 10px", background: "#4434d3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Save</button>
              <button onClick={() => { setEditing(false); setName(user.name); }} style={{ padding: "4px 10px", background: "#ccc", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
            </span>
          ) : (
            <span>
              {user.name}{" "}
              {user.role === "coach" && <span onClick={() => setEditing(true)} style={{ fontSize: "13px", color: "#4434d3", cursor: "pointer", marginLeft: "6px" }}>✏️ Edit</span>}
            </span>
          )}
        </div>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role === "coach" ? "🏆 Manager" : "🏃 Player"}</p>
        {message && <p style={{ color: "green", fontSize: "13px" }}>{message}</p>}
      </div>

      <div style={{ background: "#fff8e1", padding: "16px", borderRadius: "8px", marginBottom: "12px", fontSize: "14px", color: "#555" }}>
        🧪 This is a demo. Your changes are saved in this browser only.
        {!confirmReset ? (
          <div onClick={() => setConfirmReset(true)} style={{ marginTop: "10px", color: "#4434d3", fontWeight: "600", cursor: "pointer" }}>↺ Reset demo data</div>
        ) : (
          <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <span>Restore the original sample data?</span>
            <button onClick={() => { onResetDemo(); setConfirmReset(false); }} style={{ padding: "4px 10px", background: "#4434d3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Reset</button>
            <button onClick={() => setConfirmReset(false)} style={{ padding: "4px 10px", background: "#ccc", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
          </div>
        )}
      </div>

      <button
        onClick={onLogout}
        style={{ width: "100%", padding: "12px", background: "red", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "16px" }}
      >
        Switch Role
      </button>
    </div>
  );
}

export default Account;
