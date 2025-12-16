import { loadDB, saveDB } from "./db";

const wait = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export async function mockLogin(email) {
  await wait();
  const db = loadDB();
  db.user = { id: "u1", name: "Demo User", email };
  saveDB(db);
  return db.user;
}

export async function mockLogout() {
  await wait();
  const db = loadDB();
  db.user = null;
  saveDB(db);
  return true;
}

export async function mockGetMe() {
  await wait();
  return loadDB().user;
}

export async function mockListProblems({ search = "", subject = "all", status = "all", page = 1, limit = 8 }) {
  await wait();
  const db = loadDB();
  let items = db.problems;

  if (search.trim()) {
    const s = search.toLowerCase();
    items = items.filter((p) => p.title.toLowerCase().includes(s));
  }
  if (subject !== "all") items = items.filter((p) => p.subject === subject);
  if (status !== "all") items = items.filter((p) => p.status === status);

  items = [...items].sort((a, b) => b.createdAt - a.createdAt);

  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return { items: paged, total, page, limit };
}

export async function mockCreateProblem(data) {
  await wait();
  const db = loadDB();
  const p = {
    id: `p_${Date.now()}`,
    title: data.title,
    subject: data.subject || "General",
    difficulty: data.difficulty || "easy",
    status: "todo",
    content: data.content || "",
    tags: data.tags || [],
    createdAt: Date.now(),
    notes: [],
    chat: [],
  };
  db.problems.unshift(p);
  saveDB(db);
  return p;
}

export async function mockGetProblem(id) {
  await wait();
  const db = loadDB();
  const p = db.problems.find((x) => x.id === id);
  if (!p) throw new Error("Problem not found");
  return p;
}

export async function mockAddNote(problemId, content) {
  await wait();
  const db = loadDB();
  const p = db.problems.find((x) => x.id === problemId);
  if (!p) throw new Error("Problem not found");
  const note = { id: `n_${Date.now()}`, content, createdAt: Date.now() };
  p.notes.unshift(note);
  saveDB(db);
  return note;
}

export async function mockSendChat(problemId, message) {
  await wait();
  const db = loadDB();
  const p = db.problems.find((x) => x.id === problemId);
  if (!p) throw new Error("Problem not found");

  const userMsg = { id: `c_${Date.now()}_u`, sender: "user", content: message, createdAt: Date.now() };
  const aiMsg = { id: `c_${Date.now()}_a`, sender: "assistant", content: "Mock AI: Mình đã nhận câu hỏi. (backend AI sẽ làm sau)", createdAt: Date.now() + 1 };

  p.chat.push(userMsg, aiMsg);
  saveDB(db);
  return [userMsg, aiMsg];
}
export async function mockUpdateProblem(problemId, data) {
  await wait();
  const db = loadDB();
  const p = db.problems.find((x) => x.id === problemId);
  if (!p) throw new Error("Problem not found");

  Object.assign(p, {
    title: data.title ?? p.title,
    subject: data.subject ?? p.subject,
    difficulty: data.difficulty ?? p.difficulty,
    status: data.status ?? p.status,
    content: data.content ?? p.content,
  });

  saveDB(db);
  return p;
}
