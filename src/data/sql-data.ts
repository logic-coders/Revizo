import { Subject } from "@/types";
import { sqlFundamentalsCategory } from "./sql/fundamentals";
import { sqlJoinsAggregationsCategory } from "./sql/joins-aggregations";
import { sqlWindowFunctionsCategory } from "./sql/window-functions";
import { sqlPerformanceIndexingCategory } from "./sql/performance-indexing";
import { sqlTransactionsSchemaCategory } from "./sql/transactions-schema";

export const sqlSubject: Subject = {
  id: "sql",
  slug: "sql",
  title: "SQL",
  tagline: "Relational database querying, indexing, query optimization, and complex analytical window functions",
  description: "Master the most asked SQL interview questions ever — from finding the Nth highest salary and complex multi-table joins to window functions (RANK, DENSE_RANK), CTEs, indexing strategies, query execution plans, and ACID transactions.",
  icon: "🐬",
  difficulty: "Beginner to Advanced",
  totalQuestions: 18,
  color: "#336791",
  gradient: "linear-gradient(135deg, #336791 0%, #205081 50%, #00758f 100%)",
  categories: [
    sqlFundamentalsCategory,
    sqlJoinsAggregationsCategory,
    sqlWindowFunctionsCategory,
    sqlPerformanceIndexingCategory,
    sqlTransactionsSchemaCategory,
  ],
};
