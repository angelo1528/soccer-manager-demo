// Seed data for the demo. Everything lives in the browser — no backend.

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function minutesAgo(n) {
  return new Date(Date.now() - n * 60 * 1000).toISOString();
}

export function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const COACH = {
  id: "coach-1",
  name: "Coach Alex Morgan",
  email: "coach@demo.app",
  role: "coach",
};

export function createDemoData() {
  const teams = [
    {
      id: "team-1",
      name: "Thunder FC",
      players: [
        { id: "p-1", name: "Marcus Reed", number: "10", email: "marcus@demo.app", position: "Forward", age: "17", notes: "Team captain. Great finisher.", image: null },
        { id: "p-2", name: "Jordan Lee", number: "1", email: "jordan@demo.app", position: "Goalkeeper", age: "16", notes: "Strong shot-stopper.", image: null },
        { id: "p-3", name: "Sam Okafor", number: "4", email: "sam@demo.app", position: "Defender", age: "17", notes: "", image: null },
        { id: "p-4", name: "Riley Chen", number: "8", email: "riley@demo.app", position: "Midfielder", age: "16", notes: "Excellent vision and passing.", image: null },
        { id: "p-5", name: "Diego Santos", number: "7", email: "diego@demo.app", position: "Winger", age: "15", notes: "", image: null },
      ],
      games: [
        { id: "g-1", opponent: "Riverside United", date: daysFromNow(3), time: "15:00", arrivalTime: "14:15", arrivalLocation: "Main parking lot", location: "Thunder Park", homeOrAway: "Home", notes: "Wear the home kit. Warm-up starts at 14:30 sharp." },
        { id: "g-2", opponent: "Northside Rovers", date: daysFromNow(10), time: "11:00", arrivalTime: "10:00", arrivalLocation: "School gate (bus leaves 9:30)", location: "Northside Arena", homeOrAway: "Away", notes: "" },
        { id: "g-3", opponent: "Eastwood Eagles", date: daysFromNow(17), time: "18:30", arrivalTime: "17:45", arrivalLocation: "Locker room B", location: "Thunder Park", homeOrAway: "Home", notes: "" },
        { id: "g-4", opponent: "Lakeside City", date: daysFromNow(-7), time: "14:00", arrivalTime: "13:15", arrivalLocation: "Main parking lot", location: "Lakeside Stadium", homeOrAway: "Away", notes: "Won 2–1. Great effort everyone!" },
      ],
    },
    {
      id: "team-2",
      name: "Thunder FC U14",
      players: [
        { id: "p-6", name: "Ava Patel", number: "9", email: "ava@demo.app", position: "Forward", age: "13", notes: "", image: null },
        { id: "p-7", name: "Noah Kim", number: "5", email: "noah@demo.app", position: "Defender", age: "13", notes: "", image: null },
      ],
      games: [
        { id: "g-5", opponent: "Hillcrest Juniors", date: daysFromNow(5), time: "10:00", arrivalTime: "09:30", arrivalLocation: "Field 2", location: "Thunder Park", homeOrAway: "Home", notes: "" },
      ],
    },
  ];

  const messages = [
    { id: "m-1", sender_id: COACH.id, receiver_id: "p-1", content: "Hey Marcus, great job last weekend!", created_at: minutesAgo(60 * 26) },
    { id: "m-2", sender_id: "p-1", receiver_id: COACH.id, content: "Thanks coach! Ready for Riverside.", created_at: minutesAgo(60 * 25) },
    { id: "m-3", sender_id: COACH.id, receiver_id: "p-1", content: "[TO ALL] Training moved to 5pm on Thursday.", created_at: minutesAgo(30) },
    { id: "m-4", sender_id: COACH.id, receiver_id: "p-2", content: "[TO ALL] Training moved to 5pm on Thursday.", created_at: minutesAgo(30) },
    { id: "m-5", sender_id: "p-4", receiver_id: COACH.id, content: "Coach, I might be 10 minutes late to training Thursday.", created_at: minutesAgo(12) },
  ];

  return {
    teams,
    messages,
    archivedPlayers: [],
    // Per-user "last opened messages" time, so the demo starts with a few unread.
    lastReadAt: { [COACH.id]: minutesAgo(20), "p-1": minutesAgo(60) },
  };
}
