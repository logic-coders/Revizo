import { Subject } from "@/types";
import { sqlTop10Category } from "./sql/top-10-questions";
import { sqlFundamentalsCategory } from "./sql/fundamentals";
import { sqlJoinsAggregationsCategory } from "./sql/joins-aggregations";
import { sqlWindowFunctionsCategory } from "./sql/window-functions";
import { sqlPerformanceIndexingCategory } from "./sql/performance-indexing";
import { sqlTransactionsSchemaCategory } from "./sql/transactions-schema";

export const sqlSubject: Subject = {
  id: "sql",
  slug: "sql",
  title: "SQL",
  tagline: "Top 10 Most Asked SQL Questions & Comprehensive Interview Guide",
  description: "Master the all-time most asked SQL interview questions — from finding the Nth highest salary, complex multi-table joins, and advanced window functions (RANK, DENSE_RANK, LEAD/LAG) to composite indexing, execution plans, MVCC, and ACID transaction isolation.",
  icon: "📁",
  difficulty: "Beginner to Advanced",
  totalQuestions: 46,
  color: "#336791",
  gradient: "linear-gradient(135deg, #336791 0%, #205081 50%, #00758f 100%)",
  categories: [
    sqlTop10Category,
    sqlFundamentalsCategory,
    sqlJoinsAggregationsCategory,
    sqlWindowFunctionsCategory,
    sqlPerformanceIndexingCategory,
    sqlTransactionsSchemaCategory,
  ],
};
