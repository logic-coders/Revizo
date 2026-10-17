import { Category } from "@/types";

export const sqlFundamentalsCategory: Category = {
  id: "sql-fundamentals",
  title: "SQL Fundamentals & Core Execution",
  icon: "⚡",
  subTopics: [
    {
      id: "sql-execution-order",
      title: "Logical Query Processing Order",
      questions: [
        {
          id: "sql-exec-order",
          question: "What is the logical order of execution of a SQL query?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "SQL is processed declaratively from data source to output: FROM & JOINs → WHERE → GROUP BY → HAVING → SELECT & Expressions → DISTINCT → ORDER BY → LIMIT/OFFSET.",
            mentalModel: "Think of an SQL query like an assembly line: you first fetch materials from warehouse shelves (FROM/JOIN), toss out defective raw parts (WHERE), pack items into boxes (GROUP BY), discard underfilled boxes (HAVING), print invoices (SELECT), remove duplicate invoices (DISTINCT), sort them alphabetically (ORDER BY), and hand over only the top 10 (LIMIT).",
            whatItIs: "Unlike imperative code where lines execute top-to-bottom, SQL is a declarative set-based language. Even though the developer writes 'SELECT ... FROM ... WHERE ... GROUP BY ...', the relational query engine parses, plans, and optimizes execution according to logical relational algebra stages.",
            whyItExists: "Understanding the logical execution order prevents common interview traps — such as attempting to filter on a SELECT alias inside the WHERE clause (which fails because WHERE executes before SELECT evaluates aliases) or putting aggregate filters in WHERE instead of HAVING.",
            comparisonTable: {
              title: "SQL Written Syntax Order vs Logical Execution Pipeline",
              headers: ["Phase #", "Clause", "Purpose in Pipeline", "Why Aliases Are / Aren't Accessible"],
              rows: [
                ["1", "FROM & JOIN", "Identifies source tables, performs cross/outer/inner joins, and applies ON conditions", "Base tables and table aliases are established here."],
                ["2", "WHERE", "Filters individual rows based on boolean predicates before any grouping occurs", "Cannot use SELECT column aliases; aggregate functions (SUM, COUNT) are invalid here."],
                ["3", "GROUP BY", "Collapses rows sharing identical group keys into single aggregate buckets", "Column aliases from SELECT still not available; groups base or derived columns."],
                ["4", "HAVING", "Filters aggregate buckets produced by GROUP BY based on group conditions", "Can evaluate aggregate functions (e.g., HAVING COUNT(*) > 5); cannot reference SELECT aliases."],
                ["5", "SELECT", "Computes expressions, projects columns, evaluates window functions and scalar subqueries", "Column aliases are declared and evaluated at this stage."],
                ["6", "DISTINCT", "Eliminates duplicate rows from the projected result set", "Operates on the computed tuple produced by the SELECT phase."],
                ["7", "ORDER BY", "Sorts the output rows in ascending (ASC) or descending (DESC) sequence", "Can use SELECT column aliases, position numbers, or unprojected columns."],
                ["8", "LIMIT / OFFSET", "Discards preceding OFFSET rows and returns at most LIMIT rows to caller", "Final result cursor slice; evaluated last after complete sort order."]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Why this FAILS:\n-- SELECT department_id, AVG(salary) AS avg_sal\n-- FROM employees\n-- WHERE avg_sal > 50000        -- ERROR: column \"avg_sal\" does not exist (WHERE runs before SELECT!)\n-- GROUP BY department_id;\n\n-- Correct Logical Pipeline Implementation:\nSELECT \n    department_id,\n    COUNT(employee_id) AS total_employees,\n    ROUND(AVG(salary), 2) AS avg_salary\nFROM employees\nWHERE status = 'ACTIVE'                -- 1 & 2: Filter active rows first\nGROUP BY department_id                 -- 3: Group by department\nHAVING COUNT(employee_id) >= 5         -- 4: Filter departments with >= 5 active staff\nORDER BY avg_salary DESC               -- 5 & 7: Aliases ARE allowed in ORDER BY!\nLIMIT 3;                               -- 8: Return only top 3 highest paying depts"
            },
            tradeoffs: "Writing correlated subqueries inside the SELECT clause forces the engine to evaluate the subquery once per output row, creating an O(N) nested loop unless rewritten as a JOIN or CTE. Similarly, applying functions to indexed columns in WHERE prevents index seek (non-SARGable).",
            followUpQuestions: [
              {
                question: "Can you use a column alias defined in SELECT inside the WHERE clause?",
                answer: "No. The WHERE clause is evaluated in phase 2, long before the SELECT clause calculates projections and column aliases in phase 5. To filter on an alias, wrap the query in a CTE or subquery, or repeat the expression."
              },
              {
                question: "Why can the ORDER BY clause use SELECT column aliases?",
                answer: "Because ORDER BY executes in phase 7, which is after phase 5 (SELECT) has already computed and named all projected columns."
              }
            ],
            usedInProduction: "Query planners in PostgreSQL and MySQL optimize logical order into an execution tree using cost-based metrics (CBO), pushing predicates down into indexes (Predicate Pushdown) to minimize intermediate row sets before JOINs.",
            relatedTopics: ["WHERE vs HAVING", "Query Optimization", "Window Functions"]
          }
        },
        {
          id: "sql-where-vs-having",
          question: "What is the difference between WHERE and HAVING clauses in SQL?",
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
        },
        {
          id: "sql-delete-truncate-drop",
          question: "What is the difference between DELETE, TRUNCATE, and DROP?",
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
        },
        {
          id: "sql-union-vs-union-all",
          question: "What is the difference between UNION and UNION ALL?",
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
        },
        {
          id: "sql-primary-vs-unique",
          question: "What is the difference between Primary Key and Unique Key?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "A Primary Key uniquely identifies each row and strictly disallows NULLs (only 1 per table); a Unique Key enforces uniqueness but permits NULL values (multiple allowed per table).",
            mentalModel: "A Primary Key is like a Government Citizen ID / SSN — every citizen must have exactly one, and it can never be blank. A Unique Key is like a Driver's License or Passport number — you can have both, neither, or one, but if you do have one, no two citizens can share the same number.",
            whatItIs: "Primary Key (PK) and Unique Key (UK) are relational constraints that enforce entity and domain integrity by disallowing duplicate values in designated columns.",
            whyItExists: "Relational models require a singular canonical identifier for each tuple to establish foreign key relationships and index clustering, while also needing to prevent duplicate attributes like emails or phone numbers.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Primary Key vs Unique Key",
              headers: ["Feature / Dimension", "Primary Key (PK)", "Unique Key (UK)"],
              rows: [
                ["Nullability", "Strictly NOT NULL (never allows null values)", "Allows NULL values (Postgres/MySQL allow multiple NULLs; SQL Server allows one NULL)"],
                ["Count Per Table", "Exactly 1 primary key per table", "Multiple unique keys allowed per table (e.g., email, phone, SSN)"],
                ["Default Index Type", "Clustered index by default in SQL Server / MySQL InnoDB", "Non-clustered (secondary) B-Tree index by default"],
                ["Foreign Key Reference", "Standard target for foreign keys from child tables", "Can also be targeted by foreign keys if properly indexed"],
                ["Auto-Increment Support", "Commonly coupled with AUTO_INCREMENT / IDENTITY / SERIAL", "Rarely auto-incremented; usually business-domain unique attributes"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "CREATE TABLE users (\n    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Exactly 1 PK, never null\n    email VARCHAR(255) NOT NULL UNIQUE,                      -- Unique Key 1\n    phone_number VARCHAR(20) UNIQUE,                         -- Unique Key 2 (allows NULL for users without phone)\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);"
            },
            tradeoffs: "Using a UUID v4 as a clustered Primary Key causes severe index fragmentation and page splits in B-Trees due to random insertion order. Prefer sequential keys (UUID v7 or BIGINT IDENTITY) for PKs, placing Unique Keys on business identifiers.",
            followUpQuestions: [
              {
                question: "Can a table exist without a Primary Key in MySQL InnoDB?",
                answer: "Yes, but InnoDB will automatically choose the first NOT NULL UNIQUE key as the clustered index. If none exists, it generates a hidden 6-byte row ID (DB_ROW_ID) as the clustered index."
              }
            ],
            usedInProduction: "SaaS multi-tenant architectures use compound primary keys `(tenant_id, id)` for partition isolation while placing unique constraints on `(tenant_id, email)`.",
            relatedTopics: ["Clustered vs Non-Clustered Indexes", "Database Normalization"]
          }
        }
      ]
    }
  ]
};
