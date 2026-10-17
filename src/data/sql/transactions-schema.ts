import { Category } from "@/types";

export const sqlTransactionsSchemaCategory: Category = {
  id: "sql-transactions-schema",
  title: "Transactions, Concurrency & Schema",
  icon: "🛡️",
  subTopics: [
    {
      id: "sql-concurrency-acid",
      title: "ACID Isolation Levels & Locking",
      questions: [
        {
          id: "sql-acid-isolation-levels",
          question: "What are the 4 SQL Transaction Isolation Levels and which concurrency anomalies do they prevent?",
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
        },
        {
          id: "sql-cte-vs-subquery-vs-temp-table",
          question: "What is the difference between a CTE (Common Table Expression), a Subquery, a Temporary Table, and a View?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "A CTE (`WITH`) provides clean, readable, single-query scoping with recursive capabilities; a Subquery is an inline expression; a Temporary Table stores materialized physical pages on disk/tempdb for the session; a View is a saved, reusable query definition in the catalog.",
            mentalModel: "A Subquery is an inline calculation in parentheses. A CTE is creating a named local variable for a formula so you can read it easily. A Temporary Table is writing intermediate numbers on a scratchpad that you erase when you leave the desk. A View is saving the formula as a shortcut on your calculator.",
            whatItIs: "Relational engines offer several mechanisms to structure, modularize, and materialize intermediate query logic across different lifecycles and scopes.",
            whyItExists: "Complex analytical queries with multiple joins, aggregations, and window rankings become unmaintainable spaghetti code if forced into nested subqueries. CTEs and temporary tables provide clean modularization and performance tuning levers.",
            comparisonTable: {
              title: "Head-to-Head Comparison: CTE vs Subquery vs Temporary Table vs View",
              headers: ["Feature / Dimension", "CTE (WITH clause)", "Subquery (Inline)", "Temporary Table (#temp)", "Database View"],
              rows: [
                ["Lifecycle / Scope", "Single statement only", "Single statement only", "Database session / connection lifetime", "Permanent catalog object until DROPPED"],
                ["Storage / Materialization", "Inline / virtual (materialized in Postgres 12+ if multiple refs)", "Inline / virtual (optimized as part of parent AST)", "Physically materialized into disk/tempdb pages", "Virtual (materialized only if materialized view)"],
                ["Indexing Support", "Cannot create indexes on a CTE", "Cannot create indexes on subquery", "CAN create clustered and non-clustered indexes and statistics", "Standard views cannot; Materialized views CAN"],
                ["Recursive Support", "YES (`WITH RECURSIVE` for tree/graph traversal)", "No", "No (requires loop procedural script)", "No"],
                ["Readability & Maintenance", "High (clean top-to-bottom pipeline)", "Low (deep nesting, hard to read)", "Moderate (requires explicit DDL & cleanup)", "High (reusable enterprise abstraction)"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. CTE (Common Table Expression) with Recursive Tree Traversal:\nWITH RECURSIVE OrgHierarchy AS (\n    -- Anchor member: CEO (reports_to IS NULL)\n    SELECT employee_id, name, manager_id, 1 AS depth\n    FROM employees\n    WHERE manager_id IS NULL\n    \n    UNION ALL\n    \n    -- Recursive member: Subordinates\n    SELECT e.employee_id, e.name, e.manager_id, o.depth + 1\n    FROM employees e\n    INNER JOIN OrgHierarchy o ON e.manager_id = o.employee_id\n)\nSELECT * FROM OrgHierarchy ORDER BY depth, employee_id;\n\n-- 2. Temporary Table for multi-step data processing:\nCREATE TEMPORARY TABLE temp_active_users AS\nSELECT user_id, email, signup_date \nFROM users \nWHERE status = 'ACTIVE';\n\nCREATE INDEX idx_temp_active ON temp_active_users(signup_date);\n-- Query multiple times with full index seek speed!"
            },
            tradeoffs: "In older database versions (PostgreSQL < 12), CTEs acted as optimization barriers, forcing materialization and preventing predicate pushdown. In modern versions, CTEs are inlined by default unless explicitly specified with `WITH ... AS MATERIALIZED`.",
            followUpQuestions: [
              {
                question: "When should you prefer a Temporary Table over a CTE?",
                answer: "When intermediate query results are referenced multiple times across multiple queries in a complex stored procedure, or when the intermediate dataset is large (> 100k rows) and requires dedicated secondary indexes to join efficiently."
              }
            ],
            usedInProduction: "Organizational charts, category taxonomies, and bill-of-materials systems in production ERPs use `WITH RECURSIVE` CTEs to query parent-child hierarchies of arbitrary depth in a single round-trip.",
            relatedTopics: ["Logical Query Processing", "Window Functions", "Views & Materialized Views"]
          }
        },
        {
          id: "sql-optimistic-vs-pessimistic-db",
          question: "What is the difference between Pessimistic Locking (SELECT FOR UPDATE) and Optimistic Locking in databases?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "Pessimistic Locking uses database row-level exclusive locks (e.g., SELECT ... FOR UPDATE) to block concurrent access upfront; Optimistic Locking allows concurrent reads and writes without locks, detecting conflicts at commit time via a version/timestamp column.",
            mentalModel: "Pessimistic locking is checking out a library book: you physically take the book off the shelf, so no one else can read or borrow it until you return it. Optimistic locking is downloading a PDF of the book to read at home: anyone can read it simultaneously, but when submitting an edit, you must check if someone else submitted a newer version while you were editing.",
            whatItIs: "Two foundational concurrency control patterns used to maintain data integrity and prevent the 'Lost Update' problem when multiple concurrent users attempt to update the same database record.",
            whyItExists: "High-contention systems (e.g., concert ticket booking where 10,000 users attempt to reserve the last seat) risk severe double-booking bugs if updates are not serialized.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Pessimistic vs Optimistic Locking",
              headers: ["Feature / Dimension", "Pessimistic Locking (SELECT FOR UPDATE)", "Optimistic Locking (@Version column)", "Ideal Scenario"],
              rows: [
                ["Locking Mechanism", "Database-level exclusive row lock (`FOR UPDATE`)", "No database locks; application-level version checking", "Pessimistic for high contention; Optimistic for low contention"],
                ["Deadlock Risk", "High (requires strict lock ordering or NOWAIT / SKIP LOCKED)", "Zero database deadlock risk (no exclusive locks held)", "Optimistic avoids distributed deadlock complexity"],
                ["Concurrency & Throughput", "Lower (concurrent readers/writers block and queue up)", "High (readers and writers execute concurrently without blocking)", "Optimistic delivers 10x higher scale when collisions are rare"],
                ["Failure Handling", "Queries wait on locks until lock_timeout", "Fails fast at UPDATE with zero rows affected; requires retry", "Optimistic requires application retry loop"],
                ["Long-Running Interactions", "Terrible (never hold DB locks across user think-time / HTTP)", "Excellent (version checked across disconnected HTTP requests)", "Optimistic is mandatory for web forms & REST APIs"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- ========================================================\n-- 1. PESSIMISTIC LOCKING: SELECT FOR UPDATE (Ticket Booking)\n-- ========================================================\nBEGIN;\n-- Locks the seat row immediately. Other txns wait until COMMIT.\nSELECT seat_id, status \nFROM seats \nWHERE seat_id = 101 AND status = 'AVAILABLE'\nFOR UPDATE;\n\nUPDATE seats \nSET status = 'BOOKED', booked_by = 'USER_42'\nWHERE seat_id = 101;\n\nCOMMIT; -- Releases the lock!\n\n-- ========================================================\n-- 2. OPTIMISTIC LOCKING: Version Checking (E-Commerce Stock)\n-- ========================================================\n-- Step A: Read product (No lock held!)\n-- SELECT stock, version FROM products WHERE product_id = 500; -- stock: 10, version: 1\n\n-- Step B: Update only if version hasn't changed concurrently\nUPDATE products\nSET stock = stock - 1,\n    version = version + 1\nWHERE product_id = 500 \n  AND version = 1; -- Crucial check!\n\n-- If rows_affected == 0, a concurrent transaction modified the row first!\n-- Application rolls back or retries."
            },
            tradeoffs: "Never hold a Pessimistic Lock across an external network call, third-party payment gateway HTTP request, or user interaction. Doing so exhausts database connection pools and causes cascade connection starvation.",
            followUpQuestions: [
              {
                question: "What is `SELECT ... FOR UPDATE SKIP LOCKED`?",
                answer: "It allows a transaction to lock available rows while skipping any rows currently locked by other transactions. It is the gold standard for building high-throughput, conflict-free database message queues in PostgreSQL and MySQL 8+."
              }
            ],
            usedInProduction: "Ticketmaster and airline reservation systems use Pessimistic Locking with short `NOWAIT` timeouts for seat selection, while GitHub and Jira use Optimistic Locking with version numbers for pull request and issue edits.",
            relatedTopics: ["Transaction Isolation Levels", "ACID Properties", "Deadlock Prevention"]
          }
        }
      ]
    }
  ]
};
