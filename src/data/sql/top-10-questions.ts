import { Category } from "@/types";

export const sqlTop10Category: Category = {
  id: "sql-top-10",
  title: "Top 10 Most Asked SQL Questions",
  icon: "📁",
  subTopics: [
    {
      id: "sql-q1-nth-highest-salary",
      title: "#1 Nth Highest Salary",
      questions: [
        {
          id: "sql-nth-highest-salary",
          question: "1. How do you find the Nth Highest Salary in SQL? (The #1 Most Asked Interview Question)",
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
        }
      ]
    },
    {
      id: "sql-q2-where-vs-having",
      title: "#2 WHERE vs HAVING",
      questions: [
        {
          id: "sql-where-vs-having",
          question: "2. What is the difference between WHERE and HAVING clauses in SQL?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "WHERE filters individual rows before grouping or aggregation; HAVING filters aggregated groups after the GROUP BY phase.",
            mentalModel: "WHERE is a bouncer at the club door checking IDs of individual people before they enter. HAVING is an inspector who looks at tables inside the club and removes any table that has fewer than 4 people sitting at it.",
            whatItIs: "WHERE operates on raw table rows and evaluates boolean predicates individually before groups are formed. HAVING operates on grouped summary rows and evaluates predicates against aggregate calculations like COUNT(), SUM(), AVG(), MIN(), or MAX().",
            whyItExists: "Relational algebra separates row-level filtering (selection σ) from group-level filtering. Without HAVING, you could never filter datasets based on summary metrics like 'departments spending more than $1,000,000 in total payroll'.",
            comparisonTable: {
              title: "Head-to-Head Comparison: WHERE vs HAVING",
              headers: ["Feature / Dimension", "WHERE Clause", "HAVING Clause"],
              rows: [
                ["Execution Timing", "Executes before GROUP BY and aggregations occur", "Executes after GROUP BY collapses rows into summary buckets"],
                ["Operating Level", "Filters individual rows / records", "Filters aggregated summary groups"],
                ["Aggregate Functions", "Cannot use aggregates (e.g., WHERE SUM(sales) > 100 throws syntax error)", "Can use aggregates directly (e.g., HAVING SUM(sales) > 100)"],
                ["Index Utilization", "Can leverage B-Tree indexes for fast seeks and range scans", "Cannot use indexes directly; filters in-memory grouped results"],
                ["Target Columns", "Can filter on any column present in the source tables", "Can only filter on GROUP BY columns or aggregate expressions"],
                ["Performance Impact", "High efficiency: reduces rows early, reducing memory & group overhead", "Costlier: all matching rows must be grouped before filtering"],
                ["Optionality", "Can be used with or without GROUP BY", "Almost exclusively used with GROUP BY (or on entire table aggregate)"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Combining WHERE and HAVING in the same query:\nSELECT \n    department_id,\n    job_title,\n    COUNT(*) AS total_hires,\n    AVG(salary) AS avg_dept_salary\nFROM employees\nWHERE hire_date >= '2023-01-01'        -- WHERE: Filters individual rows (hired in 2023+)\nGROUP BY department_id, job_title     -- Groups remaining rows\nHAVING AVG(salary) > 85000            -- HAVING: Filters groups where average salary > 85k\n   AND COUNT(*) >= 2;                 -- and at least 2 people were hired in that role"
            },
            tradeoffs: "Never put a non-aggregate filter into HAVING. If you write 'HAVING department_id = 10', the database groups all departments first and then discards all except 10. Writing 'WHERE department_id = 10' filters first via index seek, resulting in 100x faster execution.",
            followUpQuestions: [
              {
                question: "Can HAVING be used without a GROUP BY clause?",
                answer: "Yes. When used without GROUP BY, the entire table is treated as a single group. For example: SELECT AVG(salary) FROM employees HAVING AVG(salary) > 50000; returns one row if true, or zero rows if false."
              },
              {
                question: "If a condition can be written in either WHERE or HAVING, which one should you choose?",
                answer: "Always WHERE. WHERE filters rows before they enter memory for grouping, saving CPU, RAM, and temp disk space."
              }
            ],
            usedInProduction: "Fintech fraud detection engines use WHERE to filter transactions from the last 24 hours via index seeks, and HAVING COUNT(*) > 5 to flag accounts with suspicious frequency bursts.",
            relatedTopics: ["GROUP BY & Aggregations", "Logical Query Processing", "SQL Indexing"]
          }
        }
      ]
    },
    {
      id: "sql-q3-joins-matrix",
      title: "#3 SQL Joins Matrix",
      questions: [
        {
          id: "sql-joins-matrix",
          question: "3. What are the differences between INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, and CROSS JOIN?",
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
        }
      ]
    },
    {
      id: "sql-q4-delete-truncate-drop",
      title: "#4 DELETE vs TRUNCATE vs DROP",
      questions: [
        {
          id: "sql-delete-truncate-drop",
          question: "4. What is the difference between DELETE, TRUNCATE, and DROP?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "DELETE is a DML statement that removes rows one-by-one with full logging and rollback; TRUNCATE is a DDL statement that deallocates entire data pages instantly; DROP removes the entire table data and schema definition permanently.",
            mentalModel: "DELETE is like erasing pencil marks with an eraser word by word (slow, generates dust/logs, undoable). TRUNCATE is like ripping all written pages out of a notebook while keeping the empty binder. DROP is throwing the entire notebook into a paper shredder.",
            whatItIs: "DELETE, TRUNCATE, and DROP are data removal operations differing in command category (DML vs DDL), transactional logging granularity, locking mechanisms, trigger firing, and schema persistence.",
            whyItExists: "Large-scale systems need different primitives for row-level modifications versus high-speed mass purges. Deleting 50 million records with DELETE generates gigabytes of undo/redo transaction logs, exhausting disk space, whereas TRUNCATE deallocates extents in milliseconds.",
            comparisonTable: {
              title: "Head-to-Head Comparison: DELETE vs TRUNCATE vs DROP",
              headers: ["Feature / Dimension", "DELETE", "TRUNCATE", "DROP"],
              rows: [
                ["Command Type", "DML (Data Manipulation Language)", "DDL (Data Definition Language)", "DDL (Data Definition Language)"],
                ["WHERE Clause Support", "Yes (can delete selective rows)", "No (removes ALL rows from table)", "No (drops entire table object)"],
                ["Transaction Logging", "Row-by-row logging in WAL / Redo log", "Page/extent deallocation logged minimally", "Catalog and page deletion logged minimally"],
                ["Rollback Support", "Fully rollable back inside explicit transaction", "Rollable back in modern RDBMS (Postgres/SQL Server), DDL autocommits in MySQL", "Rollable back in Postgres, autocommits in MySQL"],
                ["Execution Speed", "Slow for large tables (locks & logs per row)", "Extremely fast (deallocates storage pages)", "Instantaneous (removes metadata & storage)"],
                ["Triggers Fired", "Fires row-level BEFORE/AFTER DELETE triggers", "Does NOT fire row delete triggers", "Does NOT fire row delete triggers (may fire DDL triggers)"],
                ["Identity / AUTO_INCREMENT", "Retains current auto-increment counter", "Resets identity / auto-increment counter to seed", "Entire table destroyed"],
                ["Table Structure & Indexes", "Preserved intact", "Preserved intact (ready for fresh data)", "Removed completely from database catalog"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. DELETE: Selective, logged, triggers fired\nDELETE FROM audit_logs \nWHERE created_at < NOW() - INTERVAL '90 days';\n\n-- 2. TRUNCATE: Instant wipe of all rows, resets auto-increment\nTRUNCATE TABLE staging_import_buffer;\n\n-- 3. DROP: Removes table schema and data completely\nDROP TABLE IF EXISTS legacy_v1_customers CASCADE;"
            },
            tradeoffs: "TRUNCATE cannot be executed on a table referenced by an active FOREIGN KEY constraint in another table, even if the parent table is empty. You must either drop the constraint, truncate both tables, or use DELETE.",
            followUpQuestions: [
              {
                question: "Can TRUNCATE be rolled back?",
                answer: "In PostgreSQL and Microsoft SQL Server, YES — if TRUNCATE is executed within an explicit BEGIN TRANSACTION block, it can be rolled back. In MySQL, DDL statements trigger an implicit commit, so it cannot be rolled back."
              },
              {
                question: "Why does TRUNCATE reset AUTO_INCREMENT but DELETE does not?",
                answer: "DELETE maintains the high-water mark of the sequence so existing foreign key references or historical IDs are never re-assigned. TRUNCATE deallocates the table's data pages entirely and reinitializes the identity counter to its initial seed (typically 1)."
              }
            ],
            usedInProduction: "ETL pipelines use TRUNCATE on temporary staging tables before running nightly bulk load jobs to guarantee high-throughput zero-fragmentation ingestion.",
            relatedTopics: ["ACID Transactions", "Logical Query Processing", "Database Storage & Indexing"]
          }
        }
      ]
    },
    {
      id: "sql-q5-rank-functions",
      title: "#5 ROW_NUMBER vs RANK vs DENSE_RANK",
      questions: [
        {
          id: "sql-rank-dense-rank-row-number",
          question: "5. What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK()?",
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
        }
      ]
    },
    {
      id: "sql-q6-find-delete-duplicates",
      title: "#6 Find & Delete Duplicates",
      questions: [
        {
          id: "sql-find-delete-duplicates",
          question: "6. How do you find and delete duplicate records from a table while keeping only one copy?",
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
        }
      ]
    },
    {
      id: "sql-q7-clustered-vs-nonclustered",
      title: "#7 Clustered vs Non-Clustered Index",
      questions: [
        {
          id: "sql-clustered-vs-nonclustered",
          question: "7. What is the difference between a Clustered Index and a Non-Clustered (Secondary) Index?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "A Clustered Index dictates the actual physical sorting order of table data on disk (leaf nodes ARE the data pages; limit 1 per table); a Non-Clustered Index is a separate B-Tree structure whose leaf nodes contain index keys and row pointers (RID/PK) back to the base table (multiple allowed).",
            mentalModel: "A Clustered Index is like an actual telephone directory: people are physically arranged alphabetically by Last Name; the book IS the data. A Non-Clustered Index is the index at the back of a cookbook: it lists recipe names alphabetically with a page number pointing to where the actual recipe lives in the book.",
            whatItIs: "Indexes in relational databases (PostgreSQL, MySQL InnoDB, SQL Server) are predominantly balanced search trees (B+ Trees) created to avoid full sequential table scans and accelerate search queries from O(N) to O(log N).",
            whyItExists: "Without indexes, finding a single row among 100 million records requires reading every single 8KB disk page into buffer pool memory. Clustered and non-clustered indexes provide logarithmic lookups and range scans.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Clustered vs Non-Clustered Index",
              headers: ["Feature / Dimension", "Clustered Index", "Non-Clustered (Secondary) Index"],
              rows: [
                ["Physical Data Order", "Alters the physical storage order of data rows on disk", "Does not alter physical storage order; independent B-Tree"],
                ["Leaf Node Contents", "Leaf nodes contain the ACTUAL table data rows (all columns)", "Leaf nodes contain index key values + row pointers (PK or RID)"],
                ["Quantity Per Table", "Strictly 1 per table (data can only be sorted one physical way)", "Multiple per table (up to 999 in SQL Server, 64 in MySQL)"],
                ["Lookup Performance", "Fastest possible lookups: single B-Tree traverse directly to data", "Requires B-Tree traverse + secondary lookup (Bookmark Lookup / Key Lookup)"],
                ["Covering Index Capability", "Inherently covering (contains all table columns)", "Can cover queries if all requested columns are included in index key or INCLUDE clause"],
                ["Disk Space Overhead", "No additional table space (the index IS the table data structure)", "Requires additional disk space to store the secondary B-Tree"],
                ["DML (Write) Impact", "Heavy: updates to clustered key can cause page splits and row moves", "Moderate: must update secondary index tree on INSERT/UPDATE/DELETE"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. Creating a Table with Clustered Primary Key:\nCREATE TABLE orders (\n    order_id BIGINT PRIMARY KEY, -- Clustered Index in InnoDB / SQL Server\n    customer_id BIGINT NOT NULL,\n    order_date DATE NOT NULL,\n    status VARCHAR(30) NOT NULL,\n    total_amount NUMERIC(12, 2) NOT NULL\n);\n\n-- 2. Creating a Non-Clustered Index for fast customer lookups:\nCREATE INDEX idx_orders_customer_id ON orders(customer_id);\n\n-- 3. Creating a Composite Covering Index (Eliminates Key Lookup completely!):\n-- In SQL Server / PostgreSQL:\nCREATE INDEX idx_orders_covering \nON orders(customer_id, order_date) \nINCLUDE (status, total_amount);\n\n-- This query is satisfied 100% from index leaf pages (Index-Only Scan):\nSELECT status, total_amount \nFROM orders \nWHERE customer_id = 42 AND order_date >= '2024-01-01';"
            },
            tradeoffs: "Every secondary index added speeds up SELECT reads but penalizes every INSERT, UPDATE, and DELETE because all secondary B-Trees must be updated synchronously in write-ahead logs and disk pages. Over-indexing is a primary cause of database write stalls.",
            followUpQuestions: [
              {
                question: "What is an Index-Only Scan (Covering Index)?",
                answer: "An Index-Only Scan occurs when all columns requested in SELECT, WHERE, and ORDER BY are present in the index itself. The database never visits the table data pages, cutting I/O by 80-90%."
              },
              {
                question: "Why does PostgreSQL treat clustered indexes differently from MySQL InnoDB?",
                answer: "In PostgreSQL, all tables are heap tables, and secondary indexes point to tuple IDs (ctid). The CLUSTER command sorts the table once, but subsequent INSERTs do not preserve physical clustering automatically."
              }
            ],
            usedInProduction: "Uber and Stripe design primary keys using sequential time-prefixed IDs (like UUID v7 or Snowflake) so clustered index insertions append to the right edge of B-Tree pages, eliminating expensive random page splits.",
            relatedTopics: ["Index Seek vs Index Scan", "SARGable Queries", "Database Internals"]
          }
        }
      ]
    },
    {
      id: "sql-q8-union-vs-union-all",
      title: "#8 UNION vs UNION ALL",
      questions: [
        {
          id: "sql-union-vs-union-all",
          question: "8. What is the difference between UNION and UNION ALL?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "UNION combines result sets and removes duplicate rows by sorting; UNION ALL combines result sets directly without deduplication, making it significantly faster.",
            mentalModel: "UNION ALL is like dumping two buckets of tennis balls into one large box (fast, duplicates remain). UNION is dumping the balls and then meticulously picking up every ball to inspect and discard any identical duplicates (slow, requires sorting).",
            whatItIs: "UNION and UNION ALL are set operators used to concatenate the rows from two or more SELECT queries into a single unified result set. Both require matching column counts and compatible data types.",
            whyItExists: "Deduplication is a CPU- and memory-intensive operation requiring either an in-memory hash set or an external disk sort. UNION ALL exists to provide raw concatenation speed whenever duplicates are impossible or acceptable.",
            comparisonTable: {
              title: "Head-to-Head Comparison: UNION vs UNION ALL",
              headers: ["Feature / Dimension", "UNION", "UNION ALL"],
              rows: [
                ["Deduplication", "Eliminates duplicate rows automatically", "Preserves all rows, including exact duplicates"],
                ["Performance", "Slower: requires sort or hash table to identify duplicates", "Faster: streams rows straight to output buffer without sorting"],
                ["Memory & Disk Overhead", "High (spills to disk temp space if result set is large)", "Minimal (streaming, constant memory footprint)"],
                ["Underlying Operator", "Distinct Sort or Hash Aggregate in EXPLAIN plan", "Append operator (direct pointer chaining)"],
                ["Default Best Practice", "Use only when duplicates are expected and must be removed", "Always prefer UNION ALL unless deduplication is explicitly required"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- UNION ALL: High performance, keeps duplicates\nSELECT customer_id, 'RETAIL' AS account_type FROM retail_customers\nUNION ALL\nSELECT customer_id, 'WHOLESALE' AS account_type FROM wholesale_customers;\n\n-- UNION: Distinct union (expensive sort)\nSELECT city FROM suppliers\nUNION\nSELECT city FROM customers\nORDER BY city;"
            },
            tradeoffs: "Using UNION instead of UNION ALL on million-row tables can exhaust database tempdb / work_mem and trigger temp disk writes, degrading throughput by an order of magnitude.",
            followUpQuestions: [
              {
                question: "What are the prerequisite rules for using UNION and UNION ALL?",
                answer: "All SELECT statements must have the exact same number of projected columns, and corresponding columns must have compatible data types in positional order. Column names in the final result set are determined by the first SELECT query."
              }
            ],
            usedInProduction: "E-commerce order history queries combine active orders from hot transactional tables with archived orders from historical tables using UNION ALL because order IDs are mutually exclusive GUIDs.",
            relatedTopics: ["Joins & Aggregations", "Performance & Indexing"]
          }
        }
      ]
    },
    {
      id: "sql-q9-lag-lead-mom",
      title: "#9 LAG vs LEAD (MoM Growth)",
      questions: [
        {
          id: "sql-lag-lead-mom",
          question: "9. What is the difference between LAG() and LEAD() and how do you calculate Month-over-Month (MoM) growth?",
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
    },
    {
      id: "sql-q10-acid-isolation-levels",
      title: "#10 ACID Isolation Levels & Anomalies",
      questions: [
        {
          id: "sql-acid-isolation-levels",
          question: "10. What are the 4 SQL Transaction Isolation Levels and which concurrency anomalies do they prevent?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "The ANSI SQL standard defines 4 isolation levels: Read Uncommitted (allows dirty reads), Read Committed (prevents dirty reads), Repeatable Read (prevents non-repeatable reads), and Serializable (prevents phantom reads and all concurrency anomalies).",
            mentalModel: "Think of working on a shared Google Doc: Read Uncommitted is seeing what someone is typing while they're still in the middle of typing a word. Read Committed is seeing text only after they press 'Enter' and save. Repeatable Read locks the paragraph you're reading so no one can edit it. Serializable locks the entire document so only one person can touch it at a time.",
            whatItIs: "Transaction isolation levels govern the degree to which modifications made by one transaction are visible to concurrent transactions, trading off strict data consistency against database throughput and parallelism.",
            whyItExists: "In multi-user concurrent systems, allowing transactions to execute without isolation causes data corruption, inventory overselling, and lost financial updates. Higher isolation levels prevent anomalies at the cost of lock contention or serialization aborts.",
            comparisonTable: {
              title: "The Classic ANSI SQL Isolation Level vs Concurrency Anomaly Matrix",
              headers: ["Isolation Level", "Dirty Read", "Non-Repeatable Read", "Phantom Read", "Write Skew / Anomaly", "Default In"],
              rows: [
                ["Read Uncommitted", "Possible (can read uncommitted dirty data)", "Possible", "Possible", "Possible", "Rarely used; dirty logging only"],
                ["Read Committed", "PREVENTED", "Possible (re-reading row sees committed changes)", "Possible", "Possible", "PostgreSQL, Oracle, SQL Server"],
                ["Repeatable Read", "PREVENTED", "PREVENTED (row values frozen for txn duration)", "Possible (in ANSI; prevented via MVCC in Postgres/InnoDB)", "Possible (Snapshot Isolation Write Skew)", "MySQL InnoDB default"],
                ["Serializable", "PREVENTED", "PREVENTED", "PREVENTED", "PREVENTED (true serial execution guarantee)", "SQLite default, highest financial grade"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Setting Isolation Level in a Transaction:\nBEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;\n\nSELECT balance FROM accounts WHERE user_id = 101; -- $500\n\n-- Concurrent transaction updates account 101 balance to $300 and commits.\n\n-- Re-reading inside same transaction:\nSELECT balance FROM accounts WHERE user_id = 101; -- Still returns $500! (Repeatable Read snapshot)\n\nCOMMIT;\n\n-- In PostgreSQL: Serializable uses SSI (Serializable Snapshot Isolation)\nBEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;\n-- If conflicting concurrent write occurs, Postgres aborts with:\n-- ERROR: could not serialize access due to read/write dependencies among transactions\nCOMMIT;"
            },
            tradeoffs: "SERIALIZABLE introduces substantial performance overhead and serialization failures (`40001: serialization_failure`). Applications running on SERIALIZABLE must implement client-side retry loops to re-execute aborted transactions.",
            followUpQuestions: [
              {
                question: "What is the difference between a Non-Repeatable Read and a Phantom Read?",
                answer: "A Non-Repeatable Read occurs when transaction T1 reads a specific row, T2 MODIFIES/UPDATES that existing row and commits, and T1 re-reads the row finding changed values. A Phantom Read occurs when T2 INSERTS new rows matching T1's WHERE range query, so T1 re-reads and discovers 'ghost' rows that didn't exist before."
              },
              {
                question: "How does MVCC (Multi-Version Concurrency Control) implement non-blocking reads?",
                answer: "Instead of locking rows during reads, MVCC keeps multiple historical versions of tuples tagged with transaction IDs (xmin/xmax in Postgres). Readers view a consistent snapshot of the database at their transaction start timestamp without blocking writers."
              }
            ],
            usedInProduction: "Banking ledgers and Stripe ledger systems run money movement transactions under SERIALIZABLE isolation to mathematically eliminate race conditions like double-spending.",
            relatedTopics: ["Pessimistic vs Optimistic Locking", "ACID Properties", "Deadlocks & MVCC"]
          }
        }
      ]
    }
  ]
};
