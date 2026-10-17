import { Category } from "@/types";

export const sqlJoinsAggregationsCategory: Category = {
  id: "sql-joins-aggregations",
  title: "Joins, Aggregations & Grouping",
  icon: "🔗",
  subTopics: [
    {
      id: "sql-joins",
      title: "Advanced Joins, Physical Algorithms & Grouping",
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
            usedInProduction: "E-commerce order fulfillment pipelines use LEFT JOIN to calculate customers who haven't placed an order in the last 6 months (WHERE o.id IS NULL) for re-engagement campaigns.",
            relatedTopics: ["Hash Join vs Merge Join", "WHERE vs HAVING", "Subqueries vs Joins"]
          }
        },
        {
          id: "sql-self-joins-hierarchy",
          question: "What is a Self-Join and how do you query hierarchical data like Employee-Manager reporting trees?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "A Self-Join joins a table to itself using distinct aliases (e.g., FROM employees emp LEFT JOIN employees mgr ON emp.manager_id = mgr.id) to resolve recursive parent-child relationships within a single table.",
            mentalModel: "Imagine a room full of employees. A self-join is asking each employee to stand next to their own boss who is standing in the exact same room, requiring two name tags (emp and mgr) for the same group of people.",
            whatItIs: "A self-join is not a distinct SQL keyword; it is an INNER, LEFT, or RIGHT join where both operands refer to the same physical base table, using table aliases to differentiate between roles.",
            whyItExists: "Entities often model natural self-referential hierarchies: employees and their managers, product categories and parent categories, bill-of-materials components and sub-assemblies.",
            comparisonTable: {
              title: "Hierarchical Query Techniques: Self-Join vs Recursive CTE vs Nested Sets",
              headers: ["Technique", "Max Depth Supported", "Query Complexity", "Performance on Write / Update", "Best Use Case"],
              rows: [
                ["Single Self-Join", "Fixed depth (1 level: Direct Manager)", "Very simple (standard SQL join)", "Optimal (zero write overhead)", "Direct manager lookups, parent category names"],
                ["Multi-Level Self-Join", "Fixed depth (e.g., 3 levels: Manager → Director → VP)", "Moderate (requires N joins with N aliases)", "Fast reads, zero write overhead", "Fixed corporate hierarchies of known depth"],
                ["Recursive CTE (WITH RECURSIVE)", "Arbitrary / Infinite depth", "Moderate (standard SQL:1999 syntax)", "Optimal on writes; handles dynamic trees", "Full organizational charts, graph traversal, BOM"],
                ["Nested Sets / Closure Table", "Arbitrary depth in single SELECT", "High (complex inserts/deletes)", "Slow on writes; blazing fast reads", "Read-heavy e-commerce product category trees"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. Basic Self-Join: Employee and Direct Manager Name\nSELECT \n    emp.name AS employee_name,\n    emp.title AS role,\n    COALESCE(mgr.name, 'TOP EXECUTIVE') AS manager_name\nFROM employees emp\nLEFT JOIN employees mgr ON emp.manager_id = mgr.id;\n\n-- 2. Interview Classic: Employees who earn MORE than their Manager\nSELECT \n    emp.name AS employee_name,\n    emp.salary AS employee_salary,\n    mgr.name AS manager_name,\n    mgr.salary AS manager_salary\nFROM employees emp\nINNER JOIN employees mgr ON emp.manager_id = mgr.id\nWHERE emp.salary > mgr.salary;"
            },
            tradeoffs: "Self-joins on large unindexed tables perform quadratic scans. Always place a B-Tree index on the parent foreign key column (`manager_id`).",
            followUpQuestions: [
              {
                question: "Why must you use a LEFT JOIN instead of an INNER JOIN for Employee-Manager hierarchies?",
                answer: "Because the CEO or top executive has manager_id = NULL. An INNER JOIN would filter out the CEO completely from the result set."
              }
            ],
            usedInProduction: "E-commerce platforms use self-joins on `categories` tables to display breadcrumb navigation paths (e.g., Electronics > Computers > Laptops) on product pages.",
            relatedTopics: ["Recursive CTEs", "SQL Joins", "Tree Structures in SQL"]
          }
        },
        {
          id: "sql-physical-join-algorithms",
          question: "What is the difference between Nested Loop Join, Hash Join, and Merge Join in database query engines?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "Nested Loop Join iterates over the outer table and probes the inner table via index (best for small inputs); Hash Join builds an in-memory hash table of the smaller input and streams the larger input (best for large unsorted sets); Merge Join scans both pre-sorted inputs simultaneously like a zipper (best for sorted streams).",
            mentalModel: "Nested Loop is looking up each name on an indexed phonebook. Hash Join is putting all ingredients into a labeled spice rack first, then grabbing matching spices as recipes arrive. Merge Join is zipping two jackets together where both sets of teeth are already lined up in order.",
            whatItIs: "These are the three fundamental physical algorithms cost-based query optimizers (CBO) choose among to physically execute logical JOIN operations.",
            whyItExists: "No single join algorithm is fastest in all circumstances. Query planners estimate cardinality and cost to pick the algorithm that minimizes memory, CPU, and disk I/O.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Physical Join Algorithms",
              headers: ["Algorithm", "Time Complexity", "Memory Required", "Requires Sorted Input?", "Requires Index on Inner Table?", "Optimal Use Case"],
              rows: [
                ["Nested Loop Join", "O(N × log M) with index; O(N × M) without", "Minimal (O(1) memory)", "No", "YES (index seek on inner table is mandatory for scale)", "One small table joined to a large indexed table"],
                ["Hash Join", "O(N + M) linear", "High (O(M) memory in work_mem for build table)", "No", "No (indexes not required)", "Large unsorted datasets with equality joins (=)"],
                ["Merge Join (Sort-Merge)", "O(N + M) (or O(N log N + M log M) if sorting required)", "Minimal (streaming, constant memory)", "YES (both inputs must be pre-sorted on join key)", "Beneficial if index provides natural sort order", "Very large datasets already sorted on join keys"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. Forcing/Observing Hash Join in PostgreSQL:\nEXPLAIN ANALYZE\nSELECT u.name, o.total_amount\nFROM users u\nJOIN orders o ON u.id = o.user_id;\n-- Plan Output snippet:\n-- -> Hash Join (cost=210.00..540.00 rows=5000 width=45)\n--      Hash Cond: (o.user_id = u.id)\n--      -> Seq Scan on orders o\n--      -> Hash (cost=120.00..120.00 rows=1000 width=32)\n--           -> Seq Scan on users u\n\n-- 2. What happens when Hash Join exceeds work_mem:\n-- Database spills hash partitions to temporary disk files (Batch Hash Join), degrading throughput 10x!"
            },
            tradeoffs: "Hash Join only supports equality conditions (`ON a.id = b.id`). Non-equality joins (`ON a.val > b.val`) cannot use Hash Join and must fall back to Nested Loop or Merge Join.",
            followUpQuestions: [
              {
                question: "What is a Grace Hash Join?",
                answer: "When the build table is too large to fit in RAM (work_mem), the engine partitions both tables into hashed buckets written to temp disk, joining each bucket in memory sequentially."
              }
            ],
            usedInProduction: "DBAs tune PostgreSQL's `work_mem` parameter specifically to ensure high-volume analytical Hash Joins fit entirely in RAM, preventing temp disk spills.",
            relatedTopics: ["EXPLAIN ANALYZE", "SQL Indexing", "Performance Tuning"]
          }
        },
        {
          id: "sql-semi-anti-joins",
          question: "What is the difference between Semi-Joins and Anti-Joins in SQL and how do query planners optimize them?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "A Semi-Join returns rows from the first table that have at least one match in the second table without duplicating rows; an Anti-Join returns rows from the first table that have zero matches in the second table.",
            mentalModel: "Semi-Join is a security guard checking if your name appears on a VIP guest list: as soon as they find your name once, they let you in (they don't care if your name is written 5 times). Anti-Join is checking if your name is on a ban list: they let you in only if your name appears zero times.",
            whatItIs: "Relational operators that filter records from the left relation based on presence (semi) or absence (anti) in the right relation, preserving exactly the left table's original cardinality without multiplication.",
            whyItExists: "A standard INNER JOIN duplicates rows from the left table if multiple matching rows exist in the right table (requiring an expensive DISTINCT). A Semi-Join terminates search on the first match, preventing row multiplication.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Semi-Join vs Anti-Join vs Standard Joins",
              headers: ["Join Primitive", "Core Logic", "Row Duplication Risk?", "Standard SQL Syntax", "Underlying Execution Plan"],
              rows: [
                ["Semi-Join", "Returns left rows with >= 1 match in right table", "Zero duplication (never duplicates left rows)", "WHERE EXISTS (subquery) or WHERE id IN (subquery)", "Hash Semi-Join / Nested Loop Semi-Join"],
                ["Anti-Join", "Returns left rows with 0 matches in right table", "Zero duplication", "WHERE NOT EXISTS (subquery) or LEFT JOIN ... WHERE right.id IS NULL", "Hash Anti-Join / Merge Anti-Join"],
                ["Inner Join", "Returns matching pairs from both sides", "YES (multiplies left rows by right match count)", "FROM a INNER JOIN b ON a.id = b.a_id", "Inner Hash Join / Nested Loop Join"],
                ["Left Outer Join", "Preserves all left rows, NULL on right if unmatched", "YES (multiplies left rows if right has duplicates)", "FROM a LEFT JOIN b ON a.id = b.a_id", "Left Hash Join"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. Semi-Join (Find customers who have placed at least 1 order):\n-- Won't duplicate customer rows even if they placed 500 orders!\nSELECT c.id, c.name\nFROM customers c\nWHERE EXISTS (\n    SELECT 1 \n    FROM orders o \n    WHERE o.customer_id = c.id\n);\n\n-- 2. Anti-Join (Find customers who have NEVER placed an order):\nSELECT c.id, c.name\nFROM customers c\nWHERE NOT EXISTS (\n    SELECT 1 \n    FROM orders o \n    WHERE o.customer_id = c.id\n);"
            },
            tradeoffs: "Do NOT write `SELECT DISTINCT c.id, c.name FROM customers c JOIN orders o ...` to find customers with orders. That forces the engine to build a massive joined table and then sort/hash millions of rows to deduplicate. Semi-Join is 10x-50x faster.",
            followUpQuestions: [
              {
                question: "Can query planners convert an IN subquery into a Semi-Join?",
                answer: "Yes. Modern PostgreSQL and MySQL 8.0+ optimizers automatically unnest subqueries like WHERE id IN (SELECT user_id FROM orders) into a physical Semi-Join."
              }
            ],
            usedInProduction: "Access control systems evaluate permissions using Semi-Joins: checking if a user has at least one role granting admin privileges across multiple permission assignment tables.",
            relatedTopics: ["NOT IN vs NOT EXISTS", "SQL Joins Matrix", "Query Optimization"]
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
        },
        {
          id: "sql-cross-apply-lateral",
          question: "What is the difference between CROSS JOIN, CROSS APPLY (SQL Server), and LATERAL JOIN (PostgreSQL)?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "A standard CROSS JOIN cannot reference columns from preceding tables; CROSS APPLY (SQL Server) and LATERAL JOIN (Postgres) act like a for-each loop, allowing the right-side subquery or table-valued function to reference left-table columns.",
            mentalModel: "Standard JOIN is two people reading their own separate books. LATERAL / CROSS APPLY is the second person reading a book that was chosen specifically based on what the first person just whispered to them.",
            whatItIs: "LATERAL joins (SQL:1999 standard) evaluate the right-hand subquery once for every single row emitted by the left-hand table, passing values from the left row into the subquery like function arguments.",
            whyItExists: "Before LATERAL / CROSS APPLY, querying 'Top 3 orders for every single customer' in a single query required complex window functions over the entire order table. LATERAL executes a parameterized top-N query directly per customer.",
            comparisonTable: {
              title: "Head-to-Head Comparison: CROSS JOIN vs LATERAL / CROSS APPLY",
              headers: ["Feature / Dimension", "CROSS JOIN", "LATERAL JOIN (PostgreSQL) / CROSS APPLY (SQL Server)", "Subquery in SELECT"],
              rows: [
                ["Left Column Correlation", "NO: Right side cannot reference columns from left side", "YES: Right side can reference any column from preceding tables", "YES: Correlated subquery in SELECT"],
                ["Multiple Columns Emitted", "Yes", "Yes (can emit entire tuples and rows)", "NO: Must be scalar (single value only)"],
                ["Multiple Rows Emitted", "Yes", "Yes (can emit 0, 1, or N rows per left row)", "NO: Error if > 1 row returned"],
                ["Table-Valued Functions", "Cannot pass left column as function parameter", "Can pass left columns as arguments (e.g., string_split, jsonb_to_recordset)", "Cannot return multiple columns/rows"],
                ["Outer / Optional Variant", "None", "LEFT JOIN LATERAL (Postgres) / OUTER APPLY (SQL Server)", "N/A"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Find Top 2 Most Recent Orders for EVERY Customer using LATERAL (PostgreSQL):\nSELECT \n    c.id AS customer_id,\n    c.name,\n    recent_orders.order_id,\n    recent_orders.total_amount,\n    recent_orders.created_at\nFROM customers c\nCROSS JOIN LATERAL (\n    -- Right subquery references 'c.id' from the left table!\n    SELECT o.order_id, o.total_amount, o.created_at\n    FROM orders o\n    WHERE o.customer_id = c.id\n    ORDER BY o.created_at DESC\n    LIMIT 2\n) AS recent_orders;\n\n-- In SQL Server, the identical logic uses 'CROSS APPLY':\n-- FROM customers c CROSS APPLY (SELECT TOP 2 ... WHERE o.customer_id = c.id ORDER BY created_at DESC) recent_orders;"
            },
            tradeoffs: "If the inner subquery lacks an efficient index on the correlated key, LATERAL behaves as an unindexed Nested Loop, causing catastrophic O(N × M) execution times.",
            followUpQuestions: [
              {
                question: "What is the difference between CROSS APPLY and OUTER APPLY in SQL Server?",
                answer: "CROSS APPLY behaves like an INNER JOIN (if the subquery returns 0 rows, the outer row is discarded). OUTER APPLY behaves like a LEFT JOIN (if the subquery returns 0 rows, the outer row is preserved with NULLs)."
              }
            ],
            usedInProduction: "Unpacking JSON arrays or CSV string columns in PostgreSQL using `jsonb_array_elements()` or `unnest()` relies on LATERAL joins to flatten nested payloads into relational rows.",
            relatedTopics: ["Window Functions", "Physical Join Algorithms", "Subqueries vs Joins"]
          }
        },
        {
          id: "sql-conditional-aggregation",
          question: "How does Conditional Aggregation with CASE WHEN work, and how does it compare to PIVOT?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "Conditional Aggregation combines aggregate functions (SUM, COUNT, AVG) with CASE WHEN expressions to transpose (pivot) rows into columns in a single, portable SQL query.",
            mentalModel: "Imagine sorting mail into three buckets (Letters, Bills, Ads). Instead of running through the mail 3 separate times, you hold all 3 buckets open simultaneously and drop each item into the appropriate bucket based on its label.",
            whatItIs: "A set-based query pattern that filters individual rows inside an aggregate calculation without excluding those rows from other simultaneous aggregations.",
            whyItExists: "Native PIVOT operators vary widely by vendor (SQL Server/Oracle support PIVOT, PostgreSQL uses tablefunc/crosstab, MySQL has no native PIVOT). Conditional Aggregation with CASE is 100% portable across every SQL database in existence.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Conditional Aggregation vs Native PIVOT vs FILTER clause",
              headers: ["Technique", "SQL Standard / Portability", "Dynamic Columns Support", "Ease of Reading", "Performance"],
              rows: [
                ["SUM(CASE WHEN ...)", "100% Universal (Postgres, MySQL, Oracle, SQLite, BigQuery)", "Requires explicit columns (or dynamic SQL)", "High, transparent logic", "Fast: single sequential table scan"],
                ["PostgreSQL FILTER clause", "SQL:2003 standard (`SUM(val) FILTER (WHERE ...)`), Postgres/SQLite", "Requires explicit columns", "Highest readability", "Optimal (evaluated directly in C engine)"],
                ["Native PIVOT operator", "Vendor-specific (SQL Server, Oracle, Snowflake)", "Requires explicit list of values in IN clause", "Can be verbose and rigid", "Fast; internally rewritten to conditional aggregation"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Transposing Monthly Sales from Rows into Columns:\nSELECT \n    sales_rep,\n    -- Conditional aggregation for each month:\n    SUM(CASE WHEN EXTRACT(MONTH FROM sale_date) = 1 THEN amount ELSE 0 END) AS jan_sales,\n    SUM(CASE WHEN EXTRACT(MONTH FROM sale_date) = 2 THEN amount ELSE 0 END) AS feb_sales,\n    SUM(CASE WHEN EXTRACT(MONTH FROM sale_date) = 3 THEN amount ELSE 0 END) AS mar_sales,\n    SUM(amount) AS q1_total_sales\nFROM sales\nWHERE sale_date >= '2024-01-01' AND sale_date < '2024-04-01'\nGROUP BY sales_rep;\n\n-- In PostgreSQL 9.4+, using the modern FILTER clause:\nSELECT \n    department,\n    COUNT(*) AS total_staff,\n    COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active_staff,\n    COUNT(*) FILTER (WHERE remote = TRUE) AS remote_staff\nFROM employees\nGROUP BY department;"
            },
            tradeoffs: "Both Conditional Aggregation and PIVOT require knowing the output column names at query authoring time. SQL requires fixed schema columns; generating dynamic columns based on table values requires dynamic SQL in application code.",
            followUpQuestions: [
              {
                question: "Why should you use ELSE 0 in SUM(CASE...) but omit ELSE in COUNT(CASE...)?",
                answer: "SUM needs 0 so it doesn't add NULL. But COUNT counts non-null values! If you write COUNT(CASE WHEN cond THEN 1 ELSE 0 END), it will count the 0 and return total rows. Omit ELSE so unmatched rows evaluate to NULL and are ignored by COUNT."
              }
            ],
            usedInProduction: "SaaS KPI executive summaries run nightly conditional aggregation queries to compute churn rate, active accounts, and MRR breakdowns by subscription tier in a single database pass.",
            relatedTopics: ["GROUP BY & ROLLUP", "Window Functions", "Query Optimization"]
          }
        }
      ]
    }
  ]
};
