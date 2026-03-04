import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get("/auth/me"), api.get("/notes")])
      .then(([userRes, notesRes]) => {
        setUser(userRes.data);
        setNotes(notesRes.data);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const { data } = await api.post("/notes", { content: newNote });
    setNotes([data, ...notes]);
    setNewNote("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <header>
        <div>
          <h1>Welcome, {user.name}</h1>
          <p className="login-count">Successful logins: {user.login_count}</p>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <form className="note-form" onSubmit={handleAddNote}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
          rows={3}
        />
        <button type="submit">Add Note</button>
      </form>

      <ul className="notes-list">
        {notes.map((note) => (
          <li key={note.id}>
            <small>{new Date(note.created_at).toLocaleString()}</small>
            <p>{note.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
