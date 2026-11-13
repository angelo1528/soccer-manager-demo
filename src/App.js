import { useState, useEffect } from "react";
import RolePicker from "./RolePicker";
import Messages from "./Messages";
import Account from "./Account";
import { COACH, createDemoData, newId } from "./demoData";

const STORAGE_KEY = "soccerManagerDemo";

function loadDemoData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.teams && saved.messages) return saved;
  } catch {}
  return createDemoData();
}

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [demo, setDemo] = useState(loadDemoData);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [openGameMenuIndex, setOpenGameMenuIndex] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [opponent, setOpponent] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [gameTime, setGameTime] = useState("");
  const [gameLocation, setGameLocation] = useState("");
  const [homeOrAway, setHomeOrAway] = useState("Home");
  const [arrivalTime, setArrivalTime] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");
  const [playerEmailError, setPlayerEmailError] = useState("");
const [showNotifications, setShowNotifications] = useState(false);
const [editingName, setEditingName] = useState(false);
const [newName, setNewName] = useState("");

  const { teams, messages, archivedPlayers } = demo;
  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || null;
  const coach = { ...COACH, name: demo.coachName || COACH.name };

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(demo)); } catch {}
  }, [demo]);

  useEffect(() => {
    function handleClickOutside() {
      setOpenMenuIndex(null);
      setOpenGameMenuIndex(null);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function setTeams(nextTeams) {
    setDemo((d) => ({ ...d, teams: nextTeams }));
  }

  function setSelectedTeam(team) {
    setSelectedTeamId(team ? team.id : null);
  }

  // Player view: the team this player belongs to and their roster entry.
  const playerTeam = user && user.role === "player" ? teams.find((t) => t.players.some((p) => p.id === user.id)) : null;
  const playerProfile = playerTeam ? playerTeam.players.find((p) => p.id === user.id) : null;

  const lastReadAt = (user && demo.lastReadAt?.[user.id]) || new Date(0).toISOString();
  const unreadMessages = user
    ? messages.filter((m) => m.receiver_id === user.id && m.created_at > lastReadAt).sort((a, b) => b.created_at.localeCompare(a.created_at))
    : [];

  function markMessagesRead() {
    setDemo((d) => ({ ...d, lastReadAt: { ...d.lastReadAt, [user.id]: new Date().toISOString() } }));
    setShowNotifications(false);
  }

  function goToMessages() {
    setPage("messages");
    setSelectedPlayer(null);
    setSelectedGame(null);
    markMessagesRead();
  }

  function sendMessage(receiverId, content) {
    const msg = { id: newId("m"), sender_id: user.id, receiver_id: receiverId, content, created_at: new Date().toISOString() };
    setDemo((d) => ({ ...d, messages: [...d.messages, msg] }));
  }

  function sendToAll(receiverIds, content) {
    const now = new Date().toISOString();
    const newMsgs = receiverIds.map((id) => ({ id: newId("m"), sender_id: user.id, receiver_id: id, content, created_at: now }));
    setDemo((d) => ({ ...d, messages: [...d.messages, ...newMsgs] }));
  }

  function deleteConversation(otherId) {
    setDemo((d) => ({ ...d, messages: d.messages.filter((m) => !((m.sender_id === user.id && m.receiver_id === otherId) || (m.sender_id === otherId && m.receiver_id === user.id))) }));
  }

  function resetDemo() {
    try { localStorage.removeItem("lastReadTimes"); } catch {}
    setDemo(createDemoData());
    setSelectedTeamId(null);
    setSelectedPlayer(null);
    setSelectedGame(null);
    setUser(null);
    setPage("home");
  }

  function enterDemo(profile) {
    setUser(profile);
    setPage("home");
    setSelectedTeamId(null);
    setSelectedPlayer(null);
    setSelectedGame(null);
    setShowNotifications(false);
    setEditingName(false);
  }

  function exitDemo() {
    setUser(null);
    setSelectedTeamId(null);
    setSelectedPlayer(null);
    setSelectedGame(null);
  }

  function switchRole() {
    if (user.role === "coach") {
      const firstPlayer = teams.flatMap((t) => t.players)[0];
      if (!firstPlayer) { exitDemo(); return; }
      enterDemo({ id: firstPlayer.id, name: firstPlayer.name, email: firstPlayer.email, role: "player" });
    } else {
      enterDemo(coach);
    }
  }

  function updateCurrentUser(updated) {
    setUser(updated);
    if (updated.role === "coach") setDemo((d) => ({ ...d, coachName: updated.name }));
  }

function createTeam() {
    if (newTeamName === "") return;
    setTeams([...teams, { id: newId("team"), name: newTeamName, players: [], games: [] }]);
    setNewTeamName("");
  }
function deleteTeam(id) {
    const team = teams.find((t) => t.id === id);
    setDemo((d) => ({ ...d, teams: d.teams.filter((t) => t.id !== id), archivedPlayers: [...d.archivedPlayers, ...(team?.players || [])] }));
    if (selectedTeamId === id) setSelectedTeamId(null);
  }

  function updateTeam(updatedTeam) {
    setTeams(teams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
  }

function addPlayer() {
    if (playerName === "" || playerEmail === "") return;

    const email = playerEmail.toLowerCase();
    if (teams.some((t) => t.players.some((p) => p.email.toLowerCase() === email))) {
      setPlayerEmailError("A player with this email already exists.");
      return;
    }

    updateTeam({ ...selectedTeam, players: [...selectedTeam.players, { id: newId("p"), name: playerName, number: playerNumber, email, position: "", age: "", notes: "", image: null }] });
    setPlayerName(""); setPlayerNumber(""); setPlayerEmail("");
  }

function removePlayer(index) {
    const player = selectedTeam.players[index];
    setDemo((d) => ({
      ...d,
      teams: d.teams.map((t) => (t.id === selectedTeam.id ? { ...t, players: t.players.filter((p) => p.id !== player.id) } : t)),
      archivedPlayers: [...d.archivedPlayers, player],
    }));
    setOpenMenuIndex(null);
  }

  function openPlayer(player) {
    setSelectedPlayer(player);
    setPage("playerDetail");
  }

 function savePlayerEdit(updatedPlayer) {
    updateTeam({ ...selectedTeam, players: selectedTeam.players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)) });
    setSelectedPlayer(updatedPlayer);
  }

  // Used by the player's own profile page.
  function updateMyPlayer(changes) {
    setTeams(teams.map((t) => (t.id === playerTeam.id ? { ...t, players: t.players.map((p) => (p.id === user.id ? { ...p, ...changes } : p)) } : t)));
  }

function addGame() {
    if (opponent === "" || gameDate === "") return;
    updateTeam({ ...selectedTeam, games: [...selectedTeam.games, { id: newId("g"), opponent, date: gameDate, time: gameTime, arrivalTime, location: gameLocation, arrivalLocation, homeOrAway, notes: "" }] });
    setOpponent(""); setGameDate(""); setGameTime(""); setArrivalTime(""); setArrivalLocation(""); setGameLocation(""); setHomeOrAway("Home");
  }

function removeGame(id) {
    updateTeam({ ...selectedTeam, games: selectedTeam.games.filter((g) => g.id !== id) });
    setOpenGameMenuIndex(null);
  }

function saveGameEdit(updatedGame) {
    updateTeam({ ...selectedTeam, games: selectedTeam.games.map((g) => (g.id === updatedGame.id ? updatedGame : g)) });
    setSelectedGame(updatedGame);
  }

  const upcomingGames = selectedTeam?.games
    .filter(g => g.date >= new Date().toISOString().split("T")[0])
    .sort((a, b) => new Date(a.date) - new Date(b.date)) || [];

  const pastGames = selectedTeam?.games
    .filter(g => g.date < new Date().toISOString().split("T")[0])
    .sort((a, b) => new Date(b.date) - new Date(a.date)) || [];

  if (!user) return <RolePicker teams={teams} coach={coach} onPick={enterDemo} />;

  const isCoach = user?.role === "coach";
  const playerTeams = playerTeam ? [playerTeam] : [];
  const coachPlayers = teams.flatMap((t) => t.players);

return (
    <div style={{ minHeight: "100vh", backgroundColor: "#cbbce3", backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='70' height='70' viewBox='0 0 70 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 0h35v35H0V0zm5 5h25v25H5V5zm5 5h15v15H10V10zm5 5h5v5h-5v-5zM40 5h25v25H40V5zm5 5h15v15H45V10zm5 5h5v5h-5v-5zM70 35H35v35h35V35zm-5 5H40v25h25V40zm-5 5H45v15h15V45zm-5 5h-5v5h5v-5zM30 40H5v25h25V40zm-5 5H10v15h15V45zm-5 5h-5v5h5v-5z'/%3E%3C%2Fg%3E%3C%2Fsvg%3E\")", display: "flex", flexDirection: "column" }}>
      <nav style={{ background: "#4434d3ff", padding: "10px", display: "flex", alignItems: "center" }}>
        {isCoach && <>
          <button onClick={() => { setPage("home"); setSelectedPlayer(null); setSelectedGame(null); }}>Home</button>
          <button onClick={() => { setPage("roster"); setSelectedPlayer(null); setSelectedGame(null); }}>Roster</button>
          <button onClick={() => { setPage("schedule"); setSelectedPlayer(null); setSelectedGame(null); }}>Schedule</button>
          <button onClick={goToMessages} style={{ position: "relative" }}>
  Messages
  {unreadMessages.length > 0 && (
    <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "red", color: "white", borderRadius: "50%", fontSize: "11px", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
      {unreadMessages.length}
    </span>
  )}
</button>
        </>}
        {!isCoach && <>
          <button onClick={() => { setPage("home"); }}>Home</button>
          <button onClick={() => { setPage("schedule"); setSelectedGame(null); }}>Schedule</button>
          <button onClick={goToMessages} style={{ position: "relative" }}>
  Messages
  {unreadMessages.length > 0 && (
    <span style={{ position: "absolute", top: "-6px", right: "-6px", background: "red", color: "white", borderRadius: "50%", fontSize: "11px", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
      {unreadMessages.length}
    </span>
  )}
</button>
          <button onClick={() => { setPage("profile"); }}>My Profile</button>
        </>}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
  <div style={{ position: "relative" }}>
    <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "18px" }}>
      🔔
      {unreadMessages.length > 0 && (
        <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "red", color: "white", borderRadius: "50%", fontSize: "10px", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
          {unreadMessages.length}
        </span>
      )}
    </button>
    {showNotifications && (
      <div style={{ position: "absolute", right: 0, top: "110%", background: "white", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 100, minWidth: "260px", maxHeight: "300px", overflowY: "auto" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee", fontWeight: "600", fontSize: "14px", color: "#333" }}>Notifications</div>
        {unreadMessages.length === 0 && <p style={{ padding: "16px", color: "#999", fontSize: "14px" }}>No new messages.</p>}
        {unreadMessages.map((msg) => (
          <div key={msg.id} onClick={goToMessages} style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", cursor: "pointer", fontSize: "13px" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"}
            onMouseLeave={(e) => e.currentTarget.style.background = "white"}
          >
            <div style={{ fontWeight: "600", color: "#4434d3" }}>New message</div>
            <div style={{ color: "#555", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.content.startsWith("[TO ALL]") ? msg.content.replace("[TO ALL] ", "") : msg.content}</div>
          </div>
        ))}
      </div>
    )}
  </div>
  <button onClick={switchRole} title="Try the other side of the app" style={{ background: "#f0c040", border: "none", color: "#2c1f6b", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
    Switch to {isCoach ? "Player" : "Manager"} view
  </button>
  <button onClick={() => setPage("account")} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}>Account</button>
</div>
      </nav>

    {page === "home" && (
        <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 style={{ fontSize: "72px", fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px", margin: "0", color: "#2c1f6b" }}>Soccer Team Manager</h1>
            <p style={{ fontSize: "20px", color: "#5a4a8a", marginTop: "10px", fontWeight: "500" }}>Welcome back, {user.name}!</p>
          </div>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
            {isCoach && <>
              <div onClick={() => setPage("roster")} style={{ background: "white", borderRadius: "16px", padding: "30px", width: "160px", textAlign: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(68,52,211,0.15)", transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0px)"}
              >
                <div style={{ fontWeight: "700", color: "#2c1f6b", fontSize: "16px" }}>Roster</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>Manage players</div>
              </div>
              <div onClick={() => setPage("schedule")} style={{ background: "white", borderRadius: "16px", padding: "30px", width: "160px", textAlign: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(68,52,211,0.15)", transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0px)"}
              >
                <div style={{ fontWeight: "700", color: "#2c1f6b", fontSize: "16px" }}>Schedule</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>View games</div>
              </div>
              <div onClick={goToMessages} style={{ background: "white", borderRadius: "16px", padding: "30px", width: "160px", textAlign: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(68,52,211,0.15)", transition: "transform 0.2s", position: "relative" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0px)"}
              >
                <div style={{ fontWeight: "700", color: "#2c1f6b", fontSize: "16px" }}>Messages</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>Chat with players</div>
                {unreadMessages.length > 0 && <span style={{ position: "absolute", top: "10px", right: "10px", background: "red", color: "white", borderRadius: "50%", fontSize: "11px", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{unreadMessages.length}</span>}
              </div>
            </>}
            {!isCoach && <>
              <div onClick={() => setPage("schedule")} style={{ background: "white", borderRadius: "16px", padding: "30px", width: "160px", textAlign: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(68,52,211,0.15)", transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0px)"}
              >
                <div style={{ fontWeight: "700", color: "#2c1f6b", fontSize: "16px" }}>Schedule</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>View games</div>
              </div>
              <div onClick={goToMessages} style={{ background: "white", borderRadius: "16px", padding: "30px", width: "160px", textAlign: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(68,52,211,0.15)", transition: "transform 0.2s", position: "relative" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0px)"}
              >
                <div style={{ fontWeight: "700", color: "#2c1f6b", fontSize: "16px" }}>Messages</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>Chat with coach</div>
                {unreadMessages.length > 0 && <span style={{ position: "absolute", top: "10px", right: "10px", background: "red", color: "white", borderRadius: "50%", fontSize: "11px", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{unreadMessages.length}</span>}
              </div>
              <div onClick={() => setPage("profile")} style={{ background: "white", borderRadius: "16px", padding: "30px", width: "160px", textAlign: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(68,52,211,0.15)", transition: "transform 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0px)"}
              >
                <div style={{ fontWeight: "700", color: "#2c1f6b", fontSize: "16px" }}>My Profile</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>View your info</div>
              </div>
            </>}
          </div>
        </div>
      )}

      {page === "account" && <Account key={user.id} user={user} onLogout={exitDemo} onUpdateUser={updateCurrentUser} onResetDemo={resetDemo} />}
      {page === "messages" && (
        <Messages
          key={user.id}
          user={user}
          messages={messages}
          players={coachPlayers}
          archivedPlayers={archivedPlayers}
          coachId={COACH.id}
          onSend={sendMessage}
          onSendToAll={sendToAll}
          onDeleteConversation={deleteConversation}
        />
      )}

      {/* PLAYER PROFILE PAGE */}
{/* PLAYER PROFILE PAGE */}
      {page === "profile" && !isCoach && (
        <div style={{ padding: "20px", maxWidth: "500px" }}>
          <h1>My Profile</h1>

          {/* Photo */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            {playerProfile?.image ? (
              <img src={playerProfile.image} alt="profile" style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }} />
            ) : (
              <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "#4434d3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "40px" }}> </div>
            )}
            <div style={{ marginTop: "10px" }}>
              <label style={{ cursor: "pointer", color: "#4434d3", fontWeight: "600", fontSize: "14px" }}>
                📷 Upload Photo
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => updateMyPlayer({ image: reader.result });
                  reader.readAsDataURL(file);
                }} />
              </label>
            </div>
          </div>

          {/* Info card */}
          <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>

            {/* Name */}
            <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}>NAME</div>
                {editingName ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "15px" }} />
                    <button onClick={() => {
                      if (!newName.trim()) return;
                      updateMyPlayer({ name: newName });
                      setUser({ ...user, name: newName });
                      setEditingName(false);
                    }} style={{ padding: "6px 12px", background: "#4434d3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Save</button>
                    <button onClick={() => setEditingName(false)} style={{ padding: "6px 12px", background: "none", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ fontSize: "16px", fontWeight: "600" }}>{user.name}</div>
                )}
              </div>
              {!editingName && <button onClick={() => { setEditingName(true); setNewName(user.name); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>✏️</button>}
            </div>

            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}>EMAIL</div>
              <div style={{ fontSize: "16px", fontWeight: "600" }}>{user.email}</div>
            </div>

            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}>TEAM</div>
              <div style={{ fontSize: "16px", fontWeight: "600" }}>  {playerTeam?.name || "Not assigned"}</div>
            </div>

            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "14px", marginBottom: "14px", display: "flex", gap: "40px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}>JERSEY</div>
                <div style={{ fontSize: "16px", fontWeight: "600" }}>#{playerProfile?.number || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}>POSITION</div>
                <div style={{ fontSize: "16px", fontWeight: "600" }}>{playerProfile?.position || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}>AGE</div>
                <div style={{ fontSize: "16px", fontWeight: "600" }}>{playerProfile?.age || "—"}</div>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* COACH ONLY PAGES */}
      {isCoach && <>

        {/* TEAMS LIST */}
        {page === "roster" && !selectedTeam && (
          <div style={{ padding: "20px" }}>
            <h1>My Teams</h1>
            <div style={{ marginBottom: "20px" }}>
              <input placeholder="Team name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createTeam()} />
              <button onClick={createTeam} style={{ marginLeft: "8px" }}>Create Team</button>
            </div>
            {teams.length === 0 && <p style={{ color: "#ffffff" }}>No teams yet. Create one above!</p>}
            <ul style={{ listStyle: "none", padding: 0 }}>
              {teams.map((team) => (
                <li key={team.id} style={{ padding: "12px 16px", marginBottom: "8px", background: "#2f1f30", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span onClick={() => setSelectedTeam(team)} style={{ cursor: "pointer", fontWeight: "600", fontSize: "16px", display: "inline-block", transition: "transform 0.1s", color: "white" }} onMouseEnter={(e) => e.target.style.transform = "translateX(6px)"} onMouseLeave={(e) => e.target.style.transform = "translateX(0px)"}>
                      {team.name}
                  </span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", position: "relative"}}>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{team.players.length} players</span>
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === team.id ? null : team.id); }} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", padding: "4px 8px", color: "white" }}>☰</button>
                    {openMenuIndex === team.id && (
                      <div style={{ position: "absolute", right: 0, top: "100%", background: "white", border: "1px solid #ccc", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 10, minWidth: "120px" }}>
                        <div onClick={() => deleteTeam(team.id, team.name)} style={{ padding: "10px 16px", cursor: "pointer", color: "red" }} onMouseEnter={(e) => e.target.style.background = "#f0f0f0"} onMouseLeave={(e) => e.target.style.background = "white"}>🗑️ Delete</div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ROSTER */}
        {page === "roster" && selectedTeam && (
          <div style={{ padding: "20px" }}>
            <button onClick={() => { setSelectedTeam(null); setSelectedPlayer(null); }}>← Back to Teams</button>
            <h1>{selectedTeam.name}</h1>
            <input placeholder="Player name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPlayer()} />
            <input placeholder="Jersey number" value={playerNumber} onChange={(e) => setPlayerNumber(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPlayer()} />
            <input placeholder="Player email" value={playerEmail} onChange={(e) => { setPlayerEmail(e.target.value); setPlayerEmailError(""); }}/>
            <button onClick={addPlayer}>Add Player</button>
            {playerEmailError && <p style={{ color: "red", fontSize: "13px", marginTop: "6px" }}>{playerEmailError}</p>}
            <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
              {selectedTeam.players.map((player, index) => (
                <li key={index} style={{ padding: "10px 14px", marginBottom: "8px", background: "#2f1f30", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                  <span onClick={() => openPlayer(player)} style={{ cursor: "pointer", display: "inline-block", transition: "transform 0.1s", fontWeight: "500", color: "white"}} onMouseEnter={(e) => e.target.style.transform = "translateX(6px)"} onMouseLeave={(e) => e.target.style.transform = "translateX(0px)"}>
                    {player.number} | {player.name}
                  </span>
                  <div style={{ position: "relative" }}>
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === index ? null : index); }} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", padding: "4px 8px", borderRadius: "4px", color: "white" }}>☰</button>
                    {openMenuIndex === index && (
                      <div style={{ position: "absolute", right: 0, top: "100%", background: "white", border: "1px solid #ccc", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 10, minWidth: "120px" }}>
                        <div onClick={() => { setSelectedPlayer(player); setPage("editPlayer"); setOpenMenuIndex(null); }} style={{ padding: "10px 16px", cursor: "pointer" }} onMouseEnter={(e) => e.target.style.background = "#f0f0f0"} onMouseLeave={(e) => e.target.style.background = "white"}>✏️ Edit</div>
                        <div onClick={() => removePlayer(index)} style={{ padding: "10px 16px", cursor: "pointer", color: "red" }} onMouseEnter={(e) => e.target.style.background = "#f0f0f0"} onMouseLeave={(e) => e.target.style.background = "white"}>🗑️ Remove</div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* PLAYER DETAIL */}
        {page === "playerDetail" && selectedPlayer && (
          <div style={{ padding: "20px" }}>
            <button onClick={() => setPage("roster")}>← Back to Roster</button>
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              {selectedPlayer.image ? (
                <img src={selectedPlayer.image} alt="player" style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "150px", height: "150px", borderRadius: "50%", background: "#ccc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "14px", color: "#666" }}>No Photo</div>
              )}
            </div>
            <h1>{selectedPlayer.number} — {selectedPlayer.name}</h1>
            <p><strong>Position:</strong> {selectedPlayer.position || "Not set"}</p>
            <p><strong>Age:</strong> {selectedPlayer.age || "Not set"}</p>
            <p><strong>Notes:</strong> {selectedPlayer.notes || "Not set"}</p>
          </div>
        )}

        {/* EDIT PLAYER */}
        {page === "editPlayer" && selectedPlayer && (
          <div style={{ padding: "20px" }}>
            <button onClick={() => setPage("roster")}>← Back to Roster</button>
            <h1>Editing — {selectedPlayer.name}</h1>
            <div><label>Name: </label><input value={selectedPlayer.name} onChange={(e) => setSelectedPlayer({ ...selectedPlayer, name: e.target.value })} /></div>
            <div><label>Number: </label><input value={selectedPlayer.number} onChange={(e) => setSelectedPlayer({ ...selectedPlayer, number: e.target.value })} /></div>
            <div><label>Position: </label><input value={selectedPlayer.position} onChange={(e) => setSelectedPlayer({ ...selectedPlayer, position: e.target.value })} /></div>
            <div><label>Age: </label><input value={selectedPlayer.age} onChange={(e) => setSelectedPlayer({ ...selectedPlayer, age: e.target.value })} /></div>
            <div><label>Notes: </label><input value={selectedPlayer.notes} onChange={(e) => setSelectedPlayer({ ...selectedPlayer, notes: e.target.value })} /></div>
            <div>
              <label>Photo: </label>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => setSelectedPlayer({ ...selectedPlayer, image: reader.result });
                reader.readAsDataURL(file);
              }} />
            </div>
            <button onClick={() => { savePlayerEdit(selectedPlayer); setPage("roster"); }} style={{ marginTop: "10px" }}>Save</button>
          </div>
        )}

        {/* SCHEDULE — TEAM SELECTOR */}
        {page === "schedule" && !selectedTeam && (
          <div style={{ padding: "20px" }}>
            <h1>Schedule</h1>
            <p style={{ color: "#ffffff" }}>Select a team to view their schedule:</p>
            {teams.length === 0 && <p style={{ color: "#ffffff" }}>No teams yet. Create one in the Roster tab first!</p>}
            <ul style={{ listStyle: "none", padding: 0 }}>
              {teams.map((team) => (
                <li key={team.id} onClick={() => setSelectedTeam(team)} style={{ padding: "12px 16px", marginBottom: "8px", background: "#2f1f30", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "16px", width: "100%", boxSizing: "border-box", transition: "transform 0.1s", color: "white"}}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(6px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0px)"}
                >
                    {team.name} <span style={{ fontWeight: "normal", fontSize: "13px", color: "#ffffff", marginLeft: "8px"}}>{team.games?.length || 0} games</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SCHEDULE — TEAM VIEW */}
        {page === "schedule" && selectedTeam && (
          <div style={{ padding: "20px" }}>
            <button onClick={() => { setSelectedTeam(null); setSelectedGame(null); }}>← Back to Teams</button>
            <h1>{selectedTeam.name} — Schedule</h1>
            <div style={{ background: "#f9f9f9", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
              <h3 style={{ marginTop: 0 }}>Add Game</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <input placeholder="Opponent name" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
                <input type="date" value={gameDate} onChange={(e) => setGameDate(e.target.value)} />
                <label>Arrival Time: </label>
                <input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
                <label>Arrival Location: </label>
                <input placeholder="Arrival location" value={arrivalLocation} onChange={(e) => setArrivalLocation(e.target.value)} />
                <label>Game time: </label>
                <input type="time" value={gameTime} onChange={(e) => setGameTime(e.target.value)} />
                <input placeholder="Location" value={gameLocation} onChange={(e) => setGameLocation(e.target.value)} />
                <select value={homeOrAway} onChange={(e) => setHomeOrAway(e.target.value)}>
                  <option>Home</option>
                  <option>Away</option>
                </select>
                <button onClick={addGame}>Add Game</button>
              </div>
            </div>

            <h2>Upcoming Games</h2>
            {upcomingGames.length === 0 && <p style={{ color: "#ffffff" }}>No upcoming games.</p>}
            <ul style={{ listStyle: "none", padding: 0 }}>
              {upcomingGames.map((game) => (
                <li key={game.id} style={{ padding: "12px 14px", marginBottom: "8px", background: "#e8f5e9", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                  <span onClick={() => { setSelectedGame(game); setPage("gameDetail"); }} style={{ cursor: "pointer", transition: "transform 0.1s", display: "inline-block" }} onMouseEnter={(e) => e.target.style.transform = "translateX(6px)"} onMouseLeave={(e) => e.target.style.transform = "translateX(0px)"}>
                    <strong>vs {game.opponent}</strong>
                    <span style={{ marginLeft: "10px", color: "#1a5c2a", fontWeight: "bold", fontSize: "12px" }}>{game.homeOrAway}</span>
                    <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>{game.date} {game.time && `@ ${game.time}`} {game.location && `— ${game.location}`}</div>
                  </span>
                  <div style={{ position: "relative" }}>
                    <button onClick={(e) => { e.stopPropagation(); setOpenGameMenuIndex(openGameMenuIndex === game.id ? null : game.id); }} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>☰</button>
                    {openGameMenuIndex === game.id && (
                      <div style={{ position: "absolute", right: 0, top: "100%", background: "white", border: "1px solid #ccc", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 10, minWidth: "120px" }}>
                        <div onClick={() => { setSelectedGame(game); setPage("editGame"); setOpenGameMenuIndex(null); }} style={{ padding: "10px 16px", cursor: "pointer" }} onMouseEnter={(e) => e.target.style.background = "#f0f0f0"} onMouseLeave={(e) => e.target.style.background = "white"}>✏️ Edit</div>
                        <div onClick={() => removeGame(game.id)} style={{ padding: "10px 16px", cursor: "pointer", color: "red" }} onMouseEnter={(e) => e.target.style.background = "#f0f0f0"} onMouseLeave={(e) => e.target.style.background = "white"}>🗑️ Remove</div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <h2>Past Games</h2>
            {pastGames.length === 0 && <p style={{ color: "#ffffff" }}>No past games.</p>}
            <ul style={{ listStyle: "none", padding: 0 }}>
              {pastGames.map((game) => (
                <li key={game.id} style={{ padding: "12px 14px", marginBottom: "8px", background: "#f0f0f0", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                  <span onClick={() => { setSelectedGame(game); setPage("gameDetail"); }} style={{ cursor: "pointer", transition: "transform 0.1s", display: "inline-block" }} onMouseEnter={(e) => e.target.style.transform = "translateX(6px)"} onMouseLeave={(e) => e.target.style.transform = "translateX(0px)"}>
                    <strong>vs {game.opponent}</strong>
                    <span style={{ marginLeft: "10px", color: "#999", fontWeight: "bold", fontSize: "12px" }}>{game.homeOrAway}</span>
                    <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>{game.date} {game.time && `@ ${game.time}`} {game.location && `— ${game.location}`}</div>
                  </span>
                  <div style={{ position: "relative" }}>
                    <button onClick={(e) => { e.stopPropagation(); setOpenGameMenuIndex(openGameMenuIndex === game.id ? null : game.id); }} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>☰</button>
                    {openGameMenuIndex === game.id && (
                      <div style={{ position: "absolute", right: 0, top: "100%", background: "white", border: "1px solid #ccc", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 10, minWidth: "120px" }}>
                        <div onClick={() => { setSelectedGame(game); setPage("editGame"); setOpenGameMenuIndex(null); }} style={{ padding: "10px 16px", cursor: "pointer" }} onMouseEnter={(e) => e.target.style.background = "#f0f0f0"} onMouseLeave={(e) => e.target.style.background = "white"}>✏️ Edit</div>
                        <div onClick={() => removeGame(game.id)} style={{ padding: "10px 16px", cursor: "pointer", color: "red" }} onMouseEnter={(e) => e.target.style.background = "#f0f0f0"} onMouseLeave={(e) => e.target.style.background = "white"}>🗑️ Remove</div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* GAME DETAIL */}
        {page === "gameDetail" && selectedGame && (
          <div style={{ padding: "20px" }}>
            <button onClick={() => setPage("schedule")}>← Back to Schedule</button>
            <h1>vs {selectedGame.opponent}</h1>
            <p><strong>Date:</strong> {selectedGame.date}</p>
            <p><strong>Arrival Time:</strong> {selectedGame.arrivalTime || "Not set"}</p>
            <p><strong>Arrival Location:</strong> {selectedGame.arrivalLocation || "Not set"}</p>
            <p><strong>Game Time:</strong> {selectedGame.time || "Not set"}</p>
            <p><strong>Location:</strong> {selectedGame.location || "Not set"}</p>
            <p><strong>Home or Away:</strong> {selectedGame.homeOrAway}</p>
            {selectedGame.notes && (
              <div style={{ marginTop: "20px", background: "#fff8e1", padding: "14px", borderRadius: "8px", borderLeft: "4px solid #f0c040" }}>
                <strong>📋 Coach's Notes:</strong>
                <p style={{ marginTop: "8px" }}>{selectedGame.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* EDIT GAME */}
        {page === "editGame" && selectedGame && (
          <div style={{ padding: "20px" }}>
            <button onClick={() => setPage("schedule")}>← Back to Schedule</button>
            <h1>Editing — vs {selectedGame.opponent}</h1>
            <div><label>Opponent: </label><input value={selectedGame.opponent} onChange={(e) => setSelectedGame({ ...selectedGame, opponent: e.target.value })} /></div>
            <div><label>Date: </label><input type="date" value={selectedGame.date} onChange={(e) => setSelectedGame({ ...selectedGame, date: e.target.value })} /></div>
            <div><label>Arrival Time: </label><input type="time" value={selectedGame.arrivalTime || ""} onChange={(e) => setSelectedGame({ ...selectedGame, arrivalTime: e.target.value })} /></div>
            <div><label>Arrival Location: </label><input value={selectedGame.arrivalLocation || ""} onChange={(e) => setSelectedGame({ ...selectedGame, arrivalLocation: e.target.value })} /></div>
            <div><label>Game Time: </label><input type="time" value={selectedGame.time || ""} onChange={(e) => setSelectedGame({ ...selectedGame, time: e.target.value })} /></div>
            <div><label>Location: </label><input value={selectedGame.location} onChange={(e) => setSelectedGame({ ...selectedGame, location: e.target.value })} /></div>
            <div><label>Notes for Players: </label><textarea value={selectedGame.notes || ""} onChange={(e) => setSelectedGame({ ...selectedGame, notes: e.target.value })} rows={4} style={{ width: "300px", marginLeft: "8px" }} /></div>
            <div>
              <label>Home or Away: </label>
              <select value={selectedGame.homeOrAway} onChange={(e) => setSelectedGame({ ...selectedGame, homeOrAway: e.target.value })}>
                <option>Home</option>
                <option>Away</option>
              </select>
            </div>
            <button onClick={() => { saveGameEdit(selectedGame); setPage("schedule"); }} style={{ marginTop: "10px" }}>Save</button>
          </div>
        )}

      </>}

      {/* PLAYER SCHEDULE VIEW */}
      {!isCoach && page === "schedule" && (
        <div style={{ padding: "20px" }}>
          <h1>Schedule</h1>
          {playerTeams.length === 0 && <p style={{ color: "#999" }}>No schedules available yet.</p>}
          {playerTeams.map((team) => (
            <div key={team.id} style={{ marginBottom: "30px" }}>
              <h2>  {team.name}</h2>
              <h3>Upcoming Games</h3>
              {team.games.filter(g => g.date >= new Date().toISOString().split("T")[0]).length === 0 && <p style={{ color: "#ffffff" }}>No upcoming games.</p>}
              <ul style={{ listStyle: "none", padding: 0 }}>
                {team.games
                  .filter(g => g.date >= new Date().toISOString().split("T")[0])
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((game) => (
                    <li key={game.id} onClick={() => { setSelectedGame(game); setPage("gameDetail"); }} style={{ padding: "12px 14px", marginBottom: "8px", background: "#e8f5e9", borderRadius: "6px", cursor: "pointer" }}>
                      <strong>vs {game.opponent}</strong>
                      <span style={{ marginLeft: "10px", color: "#1a5c2a", fontWeight: "bold", fontSize: "12px" }}>{game.homeOrAway}</span>
                      <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>{game.date} {game.time && `@ ${game.time}`} {game.location && `— ${game.location}`}</div>
                    </li>
                  ))}
              </ul>
              <h3>Past Games</h3>
              {team.games.filter(g => g.date < new Date().toISOString().split("T")[0]).length === 0 && <p style={{ color: "#ffffff" }}>No past games.</p>}
              <ul style={{ listStyle: "none", padding: 0 }}>
                {team.games
                  .filter(g => g.date < new Date().toISOString().split("T")[0])
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((game) => (
                    <li key={game.id} onClick={() => { setSelectedGame(game); setPage("gameDetail"); }} style={{ padding: "12px 14px", marginBottom: "8px", background: "#f0f0f0", borderRadius: "6px", cursor: "pointer" }}>
                      <strong>vs {game.opponent}</strong>
                      <span style={{ marginLeft: "10px", color: "#999", fontWeight: "bold", fontSize: "12px" }}>{game.homeOrAway}</span>
                      <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>{game.date} {game.time && `@ ${game.time}`} {game.location && `— ${game.location}`}</div>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* PLAYER GAME DETAIL */}
      {!isCoach && page === "gameDetail" && selectedGame && (
        <div style={{ padding: "20px" }}>
          <button onClick={() => setPage("schedule")}>← Back to Schedule</button>
          <h1>vs {selectedGame.opponent}</h1>
          <p><strong>Date:</strong> {selectedGame.date}</p>
          <p><strong>Arrival Time:</strong> {selectedGame.arrivalTime || "Not set"}</p>
          <p><strong>Arrival Location:</strong> {selectedGame.arrivalLocation || "Not set"}</p>
          <p><strong>Game Time:</strong> {selectedGame.time || "Not set"}</p>
          <p><strong>Location:</strong> {selectedGame.location || "Not set"}</p>
          <p><strong>Home or Away:</strong> {selectedGame.homeOrAway}</p>
          {selectedGame.notes && (
            <div style={{ marginTop: "20px", background: "#fff8e1", padding: "14px", borderRadius: "8px", borderLeft: "4px solid #f0c040" }}>
              <strong>📋 Coach's Notes:</strong>
              <p style={{ marginTop: "8px" }}>{selectedGame.notes}</p>
            </div>
          )}
        </div>
      )}

<div style={{ background: "#4434d3", padding: "64px", textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: "13px", marginTop: "auto" }}>
        Soccer Manager © 2026
      </div>
    </div>
  );
}

export default App;