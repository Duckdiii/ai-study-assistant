import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProblemById } from "../api/problemsApi";

export default function ProblemDetailPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    getProblemById(id).then((res) => setProblem(res.data));
  }, [id]);

  if (!problem) return <div>Loading...</div>;

  return (
    <div>
      <h2>{problem.title}</h2>
      <p><b>Subject:</b> {problem.subject}</p>
      <p>{problem.content}</p>
    </div>
  );
}
