import { Subject } from "@/types";
import { sqlTop10Category } from "./sql/top-10-questions";

export const sqlSubject: Subject = {
  id: "sql",
  slug: "sql",
  title: "SQL",
  tagline: "Top 10 Most Asked SQL Interview Questions Ever",
  description: "Master the top 10 most asked SQL interview questions ever — from finding the Nth highest salary and complex multi-table joins to window functions (RANK, DENSE_RANK), CTEs, indexing strategies, and ACID transactions.",
  icon: "📁",
  difficulty: "Beginner to Advanced",
  totalQuestions: 10,
  color: "#336791",
  gradient: "linear-gradient(135deg, #336791 0%, #205081 50%, #00758f 100%)",
  categories: [
    sqlTop10Category,
  ],
};
