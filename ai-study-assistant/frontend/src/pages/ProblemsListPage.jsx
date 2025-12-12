import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProblems, createProblem } from "../api/problemsApi";

export default function ProblemsListPage() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");

  const load = async () => {
    const res = await getProblems(); // backend mock trả {items,...} hoặc array
    setItems(res.data.items ?? res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createProblem({ title, subject: "General", content: "" });
    setTitle("");
    load();
  };

  return (
    <div>
      <h2>Problems</h2>

      <form onSubmit={onCreate} style={{ marginBottom: 12 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New problem title..."
        />
        <button type="submit">Create</button>
      </form>

      <ul>
        {items.map((p) => (
          <li key={p.id}>
            <Link to={`/problems/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
