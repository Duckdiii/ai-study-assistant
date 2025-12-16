const KEY = "asa_db_v1";

const seed = {
  user: null,
  problems: [
    {
      id: "p1",
      title: "Giải phương trình bậc 2",
      subject: "Math",
      difficulty: "medium",
      status: "todo",
      content: "Giải x^2 - 5x + 6 = 0",
      tags: ["quadratic"],
      createdAt: Date.now() - 86400000,
      notes: [{ id: "n1", content: "Dùng delta", createdAt: Date.now() - 80000000 }],
      chat: [{ id: "c1", sender: "assistant", content: "Bạn có thể tính Δ = b² - 4ac.", createdAt: Date.now() - 70000000 }],
    },
  ],
};

export function loadDB() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return structuredClone(seed);
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return structuredClone(seed);
  }
}

export function saveDB(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}
