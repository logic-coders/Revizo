import { Category } from "@/types";

export const sqlJoinsAggregationsCategory: Category = {
  id: "sql-joins-aggregations",
  title: "Joins, Aggregations & Grouping",
  icon: "🔗",
  subTopics: [
    {
      id: "sql-joins",
      title: "SQL Joins & NULL Semantics",
      questions: [
        {
          id: "sql-joins-matrix",
          question: "What are the differences between INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, and CROSS JOIN?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "INNER JOIN returns matching rows from both tables; LEFT JOIN returns all left rows plus matching right rows; RIGHT JOIN returns all right rows plus matching left rows; FULL OUTER JOIN returns all rows from both tables (filling unmatched sides with NULL); CROSS JOIN returns the Cartesian product (N × M rows).",
            mentalModel: "Think of two contact lists (Students and Registered Courses). INNER JOIN lists students enrolled in courses. LEFT JOIN lists all students (even if enrolled in 0 courses). RIGHT JOIN lists all courses (even if 0 students enrolled). FULL OUTER JOIN lists all students and all courses. CROSS JOIN pairs every single student with every single course offered.",
            whatItIs: "SQL joins combine records from two or more tables based on a related column between them, implementing relational algebra operations like theta-join, natural join, outer join, and Cartesian product.",
            whyItExists: "Relational database normalization breaks data into separate tables to eliminate redundancy (3NF). Joins exist to reconstruct holistic business views at query time without data duplication.",
            comparisonTable: {
              title: "Comprehensive SQL Joins Comparison Matrix",
              headers: ["Join Type", "Matched Rows", "Unmatched Left Rows", "Unmatched Right Rows", "Output Cardinality (Worst Case)"],
              rows: [
                ["INNER JOIN", "Included", "Excluded", "Excluded", "Up to N × M (if all keys match duplicate values)"],
                ["LEFT JOIN (LEFT OUTER)", "Included", "Included (right columns set to NULL)", "Excluded", "At least N (all left rows preserved)"],
                ["RIGHT JOIN (RIGHT OUTER)", "Included", "Excluded", "Included (left columns set to NULL)", "At least M (all right rows preserved)"],
                ["FULL OUTER JOIN", "Included", "Included (right columns = NULL)", "Included (left columns = NULL)", "Between MAX(N, M) and N + M"],
                ["CROSS JOIN", "All paired unconditionally", "Included", "Included", "Exactly N × M (pure Cartesian product)"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. INNER JOIN: Only employees assigned to existing departments\nSELECT e.name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.id;\n\n-- 2. LEFT JOIN: All employees, even unassigned ones\nSELECT e.name, COALESCE(d.department_name, 'Unassigned') AS dept\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.id;\n\n-- 3. Anti-Join (Find employees with NO department):\nSELECT e.name\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.id\nWHERE d.id IS NULL; -- Filters out matches, keeping only unmatched left rows\n\n-- 4. CROSS JOIN: Generate every combination of sizing and colors\nSELECT s.size, c.color_name\nFROM sizes s\nCROSS JOIN colors c;"
            },
            tradeoffs: "A missing or faulty join condition on a LEFT or INNER JOIN transforms the operation into an inadvertent Cartesian Product (CROSS JOIN), blowing up output cardinality and potentially locking or crashing the database server.",
            followUpQuestions: [
              {
                question: "What is an Anti-Join and how is it written?",
                answer: "An Anti-Join returns rows from the first table that have NO matching rows in the second table. The most efficient standard syntax is: SELECT a.* FROM a LEFT JOIN b ON a.id = b.a_id WHERE b.a_id IS NULL; (or using NOT EXISTS)."
              },
              {
                question: "What are the 3 physical join algorithms used by database query engines?",
                answer: "Nested Loop Join (best for small datasets or indexed inner tables), Hash Join (best for large unsorted datasets via in-memory hash table), and Merge Join (best when both inputs are already sorted on join keys)."
              }
            ],
            usedInProduction: "E-commerce order fulfillment pipelines use LEFT JOIN to calculate customers who haven't placed an order in the last 6 months (`WHERE o.id IS NULL`) for re-engagement campaigns.",
            relatedTopics: ["Hash Join vs Merge Join", "WHERE vs HAVING", "Subqueries vs Joins"]
          }
        },
        {
          id: "sql-null-count",
          question: "What is the difference between COUNT(*), COUNT(1), and COUNT(column_name) and how does NULL behave in SQL?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "COUNT(*) and COUNT(1) count all rows regardless of NULLs; COUNT(column_name) counts only rows where the specified column is NOT NULL. In SQL, NULL represents unknown data and requires IS NULL rather than = NULL.",
            mentalModel: "COUNT(*) counts the number of chairs in a room (empty or occupied). COUNT(person_name) counts only the chairs that currently have an actual person sitting in them.",
            whatItIs: "COUNT is an aggregate function. When passed an asterisk (*) or literal constant (1), it counts the total cardinality of rows. When passed a column identifier, it inspects each row's column value and ignores any row where the value is NULL.",
            whyItExists: "SQL implements E.F. Codd's Three-Valued Logic (3VL: TRUE, FALSE, UNKNOWN). NULL is not equal to 0, not equal to empty string, and not even equal to another NULL. Aggregate functions must distinguish between row counts and populated value counts.",
            comparisonTable: {
              title: "Head-to-Head Comparison: COUNT Variants & NULL Behavior",
              headers: ["Expression", "Includes NULL Rows?", "Includes All Rows?", "Performance (Postgres/MySQL/Oracle)", "Common Use Case"],
              rows: [
                ["COUNT(*)", "Yes", "Yes", "Optimized by query planner; standard idiomatic row count", "Total record count of a table or group"],
                ["COUNT(1)", "Yes", "Yes", "Identical speed to COUNT(*) in modern query optimizers", "Older legacy idiom; compiled identically to COUNT(*)"],
                ["COUNT(column)", "NO (ignores rows where column IS NULL)", "No", "Must check column nullability; slower if column not indexed", "Counting completed actions (e.g., delivered_date)"],
                ["COUNT(DISTINCT col)", "NO (ignores NULLs, deduplicates values)", "No", "Requires in-memory hash/sort; high CPU cost", "Counting unique paying users"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Table: users (id, name, referral_code)\n-- Data: \n-- (1, 'Alice', 'REF100')\n-- (2, 'Bob',   NULL)\n-- (3, 'Carol', NULL)\n\nSELECT \n    COUNT(*) AS count_star,          -- Returns 3 (all rows)\n    COUNT(1) AS count_one,           -- Returns 3 (all rows)\n    COUNT(referral_code) AS count_col -- Returns 1 (only Alice has non-null referral)\nFROM users;\n\n-- 3-Valued Logic Demonstration:\nSELECT \n    CASE \n        WHEN NULL = NULL THEN 'Equal'   -- Will NEVER evaluate to TRUE\n        ELSE 'Unknown / False'          -- Evaluates to this!\n    END AS null_comparison,\n    COALESCE(NULL, NULL, 'Default') AS coalesce_result; -- Safe fallback"
            },
            tradeoffs: "Writing `WHERE column <> 'INACTIVE'` silently eliminates all rows where `column IS NULL` because `NULL <> 'INACTIVE'` evaluates to UNKNOWN (which WHERE treats as FALSE). Use `WHERE column <> 'INACTIVE' OR column IS NULL` or `COALESCE`.",
            followUpQuestions: [
              {
                question: "Is COUNT(1) faster than COUNT(*) in modern databases?",
                answer: "No. In modern PostgreSQL, MySQL (InnoDB), and SQL Server, COUNT(1) and COUNT(*) are parsed into the exact same internal AST representation. COUNT(*) is the SQL standard recommendation."
              },
              {
                question: "What does SUM(val) return if all values in the column are NULL?",
                answer: "It returns NULL (not 0). To guarantee 0, wrap it with COALESCE: COALESCE(SUM(val), 0)."
              }
            ],
            usedInProduction: "Analytics dashboards compute conversion rates by comparing `COUNT(purchase_id) * 100.0 / COUNT(*)` to find the percentage of active sessions that resulted in non-null purchases.",
            relatedTopics: ["WHERE vs HAVING", "COALESCE vs NULLIF", "SQL Joins"]
          }
        },
        {
          id: "sql-group-by-rollup",
          question: "What is the difference between GROUP BY, ROLLUP, and CUBE in SQL?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "GROUP BY computes aggregates for specific column combinations; ROLLUP creates hierarchical subtotals and a grand total; CUBE generates all 2^N possible multidimensional combinations.",
            mentalModel: "GROUP BY is seeing sales by Year and Region. ROLLUP gives you (Year + Region) + (Year Subtotal) + (Grand Total). CUBE gives you (Year + Region) + (Year Subtotal) + (Region Subtotal) + (Grand Total) — every possible cross-tabulation.",
            whatItIs: "ROLLUP and CUBE are extensions of the GROUP BY clause that allow a single query to compute multiple levels of aggregation without needing multiple UNION ALL statements.",
            whyItExists: "Financial and business intelligence reports require hierarchical rollups (e.g., Country → State → City) and grand totals. Computing this with separate queries and UNION ALL causes multiple table scans and excessive I/O.",
            comparisonTable: {
              title: "Head-to-Head Comparison: GROUP BY vs ROLLUP vs CUBE",
              headers: ["Feature / Clause", "GROUP BY (a, b)", "GROUP BY ROLLUP (a, b)", "GROUP BY CUBE (a, b)"],
              rows: [
                ["Grouping Levels Generated", "1 level: (a, b)", "3 levels: (a, b), (a), ()", "4 levels: (a, b), (a), (b), ()"],
                ["Hierarchy Type", "No hierarchy (flat groupings)", "Hierarchical / Directional (left-to-right)", "Multidimensional / All cross-combinations"],
                ["Grand Total Included?", "No", "Yes (represented by NULL in both columns)", "Yes (represented by NULL in all columns)"],
                ["Complexity / Row Count", "N distinct pairs", "N + distinct(a) + 1", "2^N combinations"],
                ["Typical Use Case", "Standard operational reporting", "Time-series (Year → Quarter → Month)", "OLAP cubes & multifaceted analytics dashboards"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- ROLLUP example for sales reporting:\nSELECT \n    COALESCE(department, 'ALL DEPARTMENTS') AS department,\n    COALESCE(job_title, 'ALL ROLES') AS job_title,\n    SUM(salary) AS total_payroll\nFROM employees\nGROUP BY ROLLUP(department, job_title);\n\n-- Produces:\n-- 1. Detailed: (Engineering, Senior Dev, $240k)\n-- 2. Subtotal: (Engineering, ALL ROLES,  $500k)\n-- 3. Grand Total: (ALL DEPARTMENTS, ALL ROLES, $1.2M)"
            },
            tradeoffs: "CUBE with 6 columns creates 2^6 = 64 grouping sets in a single query, causing exponential CPU and memory usage. Restrict CUBE to 2-3 dimensions or use explicit GROUPING SETS for targeted combinations.",
            followUpQuestions: [
              {
                question: "How do you distinguish between a real NULL in the database and a NULL generated by ROLLUP for a subtotal?",
                answer: "Use the GROUPING() function. GROUPING(col) returns 1 if the NULL represents a super-aggregate subtotal row, and 0 if it represents a regular row."
              }
            ],
            usedInProduction: "ERP systems run nightly financial reconciliations using ROLLUP to produce corporate balance sheets with regional and global accounting totals in a single high-efficiency pass.",
            relatedTopics: ["Window Functions", "GROUP BY & HAVING", "Performance & Indexing"]
          }
        }
      ]
    }
  ]
};
