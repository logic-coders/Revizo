import { Category } from "@/types";

export const sqlWindowFunctionsCategory: Category = {
  id: "sql-window-functions",
  title: "Window Functions & Most Asked Patterns",
  icon: "🪟",
  subTopics: [
    {
      id: "sql-classic-problems",
      title: "All-Time Most Asked Interview Problems",
      questions: [
        {
          id: "sql-nth-highest-salary",
          question: "How do you find the Nth Highest Salary in SQL? (The #1 Most Asked Interview Question Ever)",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "The gold-standard modern approach is using a CTE with DENSE_RANK() OVER (ORDER BY salary DESC) because it correctly handles duplicate salaries without skipping ranks and works seamlessly per-department using PARTITION BY.",
            mentalModel: "Think of an Olympic podium where two athletes tie for 1st place. DENSE_RANK puts both athletes at Rank 1, and the next athlete gets Rank 2 (so the 2nd highest salary exists). Standard RANK would skip to Rank 3, causing you to miss the 2nd highest salary entirely!",
            whatItIs: "Finding the Nth highest salary tests candidate mastery over duplicate handling, NULL return values when fewer than N records exist, window functions, and correlated subquery execution cost.",
            whyItExists: "In real-world databases, multiple employees frequently earn identical salaries. Naive approaches like 'ORDER BY salary DESC LIMIT 1 OFFSET 1' fail immediately if two people tie for the highest salary, returning the identical highest salary instead of the true second-highest.",
            comparisonTable: {
              title: "5 Approaches to Find Nth Highest Salary Compared",
              headers: ["Approach / Method", "Handles Duplicate Salaries?", "RDBMS Portability", "Partition By Dept?", "Performance (Big Data)"],
              rows: [
                ["Method 1: DENSE_RANK() with CTE (Recommended)", "Yes (ties share same rank; next salary gets N)", "Universal (Postgres, MySQL 8+, Oracle, SQL Server)", "Yes (add PARTITION BY department_id)", "Excellent: Single sorted scan O(N log N)"],
                ["Method 2: DISTINCT + LIMIT 1 OFFSET N-1", "Yes (if DISTINCT is explicitly used)", "MySQL & Postgres only (Oracle/SQL Server use FETCH)", "No (cannot partition per department in one query)", "Good for single global query; scans top N rows"],
                ["Method 3: Correlated Subquery (WHERE N-1 = COUNT...)", "Yes (with COUNT(DISTINCT))", "Universal (works on all SQL engines since 1980s)", "Difficult / clumsy to partition", "Terrible: O(N^2) quadratic nested loop scan"],
                ["Method 4: Nested MAX() (Specific to 2nd Highest)", "Yes", "Universal across all engines", "Requires correlated subquery", "Fast for N=2 with index, but cannot generalize to N=5 or N=10"],
                ["Method 5: ROW_NUMBER() on DISTINCT Salaries CTE", "Yes", "Universal (SQL:2003 standard)", "Yes (via intermediate group CTE)", "Very good; explicit deduplication pipeline"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- ========================================================\n-- 1. RECOMMENDED INTERVIEW SOLUTION: DENSE_RANK() with CTE\n-- Works for any N (here N = 2 for Second Highest Salary)\n-- ========================================================\nWITH RankedSalaries AS (\n    SELECT \n        employee_id,\n        name,\n        department_id,\n        salary,\n        DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank\n    FROM employees\n)\nSELECT DISTINCT salary \nFROM RankedSalaries\nWHERE salary_rank = 2; -- Change '2' to any N!\n\n-- ========================================================\n-- 2. BONUS: Nth Highest Salary PER DEPARTMENT (Senior Follow-up)\n-- ========================================================\nWITH DeptRanked AS (\n    SELECT \n        employee_id,\n        name,\n        department_id,\n        salary,\n        DENSE_RANK() OVER (\n            PARTITION BY department_id \n            ORDER BY salary DESC\n        ) AS dept_rank\n    FROM employees\n)\nSELECT department_id, name, salary\nFROM DeptRanked\nWHERE dept_rank = 2;\n\n-- ========================================================\n-- 3. CLASSIC PORTABLE SUBQUERY (If interviewer bans Window Functions):\n-- ========================================================\nSELECT MAX(salary) AS second_highest_salary\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);"
            },
            tradeoffs: "If the table has fewer than N distinct salaries, business rules usually require returning NULL instead of empty set. In PostgreSQL and LeetCode, wrapping the query inside `SELECT (SELECT DISTINCT salary ... ) AS SecondHighestSalary` guarantees NULL is returned when no row matches.",
            followUpQuestions: [
              {
                question: "Why does RANK() fail for the Nth highest salary problem?",
                answer: "If two employees tie for #1 with $150,000, RANK() assigns 1, 1 to both, and the next employee receives Rank 3. If you query WHERE rank = 2, you get 0 rows even though a distinct second-highest salary exists! DENSE_RANK() assigns 1, 1, 2, avoiding this bug."
              },
              {
                question: "How do you guarantee returning NULL if there is no 2nd highest salary?",
                answer: "Use scalar subquery projection: SELECT (SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1) AS SecondHighestSalary; In SQL, a scalar subquery returning no rows automatically evaluates to NULL."
              }
            ],
            usedInProduction: "Compensation bands and HR analytics calculate median, 90th percentile, and top-3 earners across departments using DENSE_RANK() to prevent duplicate pay grades from skewing salary bracket metrics.",
            relatedTopics: ["ROW_NUMBER vs RANK vs DENSE_RANK", "Window Functions", "Common Table Expressions (CTEs)"]
          }
        },
        {
          id: "sql-rank-dense-rank-row-number",
          question: "What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK()?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "ROW_NUMBER() assigns consecutive unique integers with no ties; RANK() assigns the same rank to ties and leaves gaps in subsequent ranks; DENSE_RANK() assigns the same rank to ties with NO gaps.",
            mentalModel: "Imagine a race with runners: 1st place (10s), two runners tied at 12s, and 4th runner at 15s. ROW_NUMBER gives [1, 2, 3, 4] arbitrarily breaking the tie. RANK gives [1, 2, 2, 4] leaving a gap for #3. DENSE_RANK gives [1, 2, 2, 3] keeping ranks contiguous.",
            whatItIs: "All three are SQL window ranking functions that operate over a defined window frame specified by `OVER (PARTITION BY ... ORDER BY ...)`. They differ strictly in how they evaluate equal / tie values in the ORDER BY expression.",
            whyItExists: "Different analytical use cases demand different tie-breaker semantics: pagination requires strictly unique numbers (ROW_NUMBER), competitive sports require standard competition ranking (RANK), and salary/tier brackets require contiguous groups (DENSE_RANK).",
            comparisonTable: {
              title: "Visual Tie-Breaker Comparison: ROW_NUMBER vs RANK vs DENSE_RANK",
              headers: ["Salary Value", "ROW_NUMBER()", "RANK()", "DENSE_RANK()", "Behavior Explanation"],
              rows: [
                ["$100,000", "1", "1", "1", "All three functions agree on distinct highest value"],
                ["$85,000 (Tie)", "2", "2", "2", "Tie starts: ROW_NUMBER picks arbitrary order; RANK and DENSE_RANK assign 2"],
                ["$85,000 (Tie)", "3", "2", "2", "Tie continues: ROW_NUMBER assigns 3; RANK and DENSE_RANK stay at 2"],
                ["$70,000", "4", "4 (skips 3)", "3 (no gap!)", "CRITICAL DIFFERENCE: RANK skips to 4; DENSE_RANK increments contiguously to 3"],
                ["$60,000", "5", "5", "4", "ROW_NUMBER = 5; RANK = 5; DENSE_RANK = 4"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "SELECT \n    employee_id,\n    name,\n    department,\n    salary,\n    ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num,\n    RANK()       OVER (ORDER BY salary DESC) AS rnk,\n    DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rnk\nFROM employees;\n\n-- Typical pagination with ROW_NUMBER:\nWITH Paginated AS (\n    SELECT \n        item_id, item_name,\n        ROW_NUMBER() OVER (ORDER BY created_at DESC) AS row_idx\n    FROM products\n)\nSELECT * FROM Paginated \nWHERE row_idx BETWEEN 21 AND 40; -- Page 2 (20 items per page)"
            },
            tradeoffs: "ROW_NUMBER() is non-deterministic when ties exist unless you provide a tie-breaker column in ORDER BY (e.g., `ORDER BY salary DESC, employee_id ASC`). Without a unique tie-breaker, two consecutive executions could assign row numbers 2 and 3 to different rows.",
            followUpQuestions: [
              {
                question: "Which ranking function should you use to deduplicate data?",
                answer: "ROW_NUMBER(). By partitioning by the duplicate columns and ordering by an update timestamp or ID (ROW_NUMBER() OVER (PARTITION BY email ORDER BY updated_at DESC)), you can safely delete all rows where row_num > 1."
              },
              {
                question: "What happens if you omit the ORDER BY clause in a window ranking function?",
                answer: "It causes a syntax error in most SQL engines. Ranking functions strictly require an ORDER BY clause inside the OVER() specification because rank has no logical meaning without an ordering criteria."
              }
            ],
            usedInProduction: "E-commerce leaderboards use DENSE_RANK to award Gold, Silver, and Bronze badges to sellers based on monthly revenue, guaranteeing badges exist even if multiple sellers tie for top revenue.",
            relatedTopics: ["Nth Highest Salary", "Window Functions (LAG/LEAD)", "Deduplication via CTE"]
          }
        },
        {
          id: "sql-find-delete-duplicates",
          question: "How do you find and delete duplicate records from a table while keeping only one copy?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "The most robust, production-standard technique uses a CTE with ROW_NUMBER() OVER (PARTITION BY duplicate_columns ORDER BY id) and deletes where row_num > 1. In PostgreSQL, you can also use self-join with the internal tuple ID (ctid).",
            mentalModel: "Imagine you have a stack of business cards with several exact duplicates. You sort them into piles by email address (PARTITION BY). In each pile, you write 1, 2, 3... on the cards (ROW_NUMBER). Then you throw away every card with a number greater than 1, keeping only card #1 from every pile.",
            whatItIs: "A classic database hygiene problem where records contain identical business keys (e.g., duplicate email registrations) due to a lack of unique constraints, requiring precision deletion without dropping all occurrences.",
            whyItExists: "Real-world data ingestion pipelines, bugged API webhooks, and legacy table migrations often inject duplicate rows. Deleting duplicates while preserving exactly one record is an essential DBA and backend task.",
            comparisonTable: {
              title: "3 Duplicate Deletion Techniques Compared",
              headers: ["Technique", "RDBMS Support", "Performance on Large Tables", "Safety / Determinism"],
              rows: [
                ["Method 1: CTE with ROW_NUMBER() (Standard)", "Postgres, SQL Server, MySQL 8+, Oracle", "Fast: partition & row numbering in single scan", "100% deterministic (ORDER BY controls which record survives)"],
                ["Method 2: Self-Join (DELETE a FROM t a JOIN t b)", "MySQL, Postgres (via USING / ctid)", "Can be slow O(N^2) on large tables without index", "Requires unique ID or physical ctid / rowid"],
                ["Method 3: GROUP BY + Intermediate Table", "Universal across all engines", "Fastest for massive bulk cleanup (rebuilds clean table)", "Requires schema alter / drop / rename table lock"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- ========================================================\n-- 1. FINDING DUPLICATES (Verification Query):\n-- ========================================================\nSELECT email, COUNT(*)\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1;\n\n-- ========================================================\n-- 2. DELETING DUPLICATES via CTE + ROW_NUMBER (PostgreSQL / SQL Server):\n-- ========================================================\nWITH DuplicateCTE AS (\n    SELECT \n        id,\n        email,\n        ROW_NUMBER() OVER (\n            PARTITION BY email \n            ORDER BY created_at ASC, id ASC -- Oldest record receives 1\n        ) AS row_num\n    FROM users\n)\nDELETE FROM users\nWHERE id IN (\n    SELECT id FROM DuplicateCTE WHERE row_num > 1\n);\n\n-- ========================================================\n-- 3. POSTGRESQL SPECIFIC TRICK using internal 'ctid':\n-- ========================================================\nDELETE FROM users a \nUSING users b\nWHERE a.email = b.email \n  AND a.ctid < b.ctid; -- Keeps only the latest physical tuple"
            },
            tradeoffs: "Executing a mass DELETE on a table with millions of duplicates locks rows, fills the transaction undo log, and triggers table locks. For millions of rows, create a clean new table (`CREATE TABLE clean AS SELECT DISTINCT ON (email) ...`), index it, and swap table names.",
            followUpQuestions: [
              {
                question: "How do you prevent duplicate records from ever being inserted again?",
                answer: "Add a UNIQUE constraint or unique index on the column(s): ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email); Unique indexes prevent race conditions during concurrent INSERTs."
              }
            ],
            usedInProduction: "CRM data cleaning jobs run nightly deduplication scripts using ROW_NUMBER() over customer email and phone before syncing leads into marketing automation platforms.",
            relatedTopics: ["ROW_NUMBER vs RANK vs DENSE_RANK", "CTEs vs Subqueries", "Database Constraints"]
          }
        },
        {
          id: "sql-lag-lead-mom",
          question: "What is the difference between LAG() and LEAD() and how do you calculate Month-over-Month (MoM) growth?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "LAG() accesses data from a previous row in the partition at a specified offset without a self-join; LEAD() accesses data from a subsequent (following) row. MoM growth is calculated using: (revenue - LAG(revenue)) / LAG(revenue) * 100.",
            mentalModel: "LAG() is looking in your car's rearview mirror at the car behind you (past). LEAD() is looking through your windshield at the car in front of you (future).",
            whatItIs: "LAG and LEAD are window value functions introduced in SQL:2011 that allow reading adjacent rows without performing costly O(N^2) Cartesian self-joins.",
            whyItExists: "Time-series analytics, financial trend forecasting, and session streak tracking require comparing current metric values against past or future events (e.g., yesterday's stock closing price vs today's price).",
            comparisonTable: {
              title: "Head-to-Head Comparison: LAG() vs LEAD()",
              headers: ["Feature / Dimension", "LAG(col, offset, default)", "LEAD(col, offset, default)"],
              rows: [
                ["Direction of Access", "Previous / Preceding row(s) in sorted partition", "Next / Following row(s) in sorted partition"],
                ["First Row in Window", "Returns default value (NULL if omitted)", "Returns the second row's value"],
                ["Last Row in Window", "Returns the second-to-last row's value", "Returns default value (NULL if omitted)"],
                ["Primary Use Cases", "MoM / YoY growth, consecutive login streaks, price change delta", "Next order date, churn prediction, churn interval analysis"],
                ["Default Offset", "1 (immediately preceding row)", "1 (immediately following row)"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Month-over-Month (MoM) Revenue Growth Calculation:\nWITH MonthlyRevenue AS (\n    SELECT \n        DATE_TRUNC('month', order_date) AS sales_month,\n        SUM(amount) AS current_revenue\n    FROM orders\n    GROUP BY DATE_TRUNC('month', order_date)\n)\nSELECT \n    sales_month,\n    current_revenue,\n    LAG(current_revenue, 1) OVER (ORDER BY sales_month) AS previous_month_revenue,\n    ROUND(\n        (current_revenue - LAG(current_revenue, 1) OVER (ORDER BY sales_month)) * 100.0 / \n        NULLIF(LAG(current_revenue, 1) OVER (ORDER BY sales_month), 0),\n        2\n    ) AS mom_growth_percentage\nFROM MonthlyRevenue\nORDER BY sales_month;"
            },
            tradeoffs: "Always wrap the denominator in `NULLIF(val, 0)` when computing growth percentages. For the very first row, LAG returns NULL; without NULLIF or safe division, encountering a zero-revenue month triggers a fatal 'Division by zero' error.",
            followUpQuestions: [
              {
                question: "Can LAG() and LEAD() accept dynamic offsets?",
                answer: "In most SQL engines, the offset must be a non-negative integer literal or an expression that evaluates to an integer constant per row."
              },
              {
                question: "How do you solve the 'Active Consecutive Login Streak' problem?",
                answer: "Subtract a ROW_NUMBER() from the login date: (login_date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) * INTERVAL '1 day'). Consecutive days produce an identical date difference anchor, allowing simple GROUP BY user_id, anchor."
              }
            ],
            usedInProduction: "SaaS revenue dashboards compute Annual Recurring Revenue (ARR) and churn metrics using LAG(arr) over monthly account subscription snapshots.",
            relatedTopics: ["Nth Highest Salary", "Window Functions Overview", "SQL Execution Order"]
          }
        }
      ]
    }
  ]
};
