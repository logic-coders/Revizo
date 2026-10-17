import { Category } from "@/types";

export const sqlTransactionsSchemaCategory: Category = {
  id: "sql-transactions-schema",
  title: "Transactions, Concurrency & Database Objects",
  icon: "📁",
  subTopics: [
    {
      id: "sql-concurrency-acid",
      title: "ACID Internals, Locking, MVCC & Database Objects",
      questions: [
        {
          id: "sql-acid-properties-wal",
          question: "What are ACID properties and how do Write-Ahead Logging (WAL) and Checkpointing guarantee Durability?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "ACID stands for Atomicity (all-or-nothing), Consistency (rules/constraints enforced), Isolation (concurrency control), and Durability (committed data survives crashes). Durability is guaranteed by appending changes sequentially to a Write-Ahead Log (WAL) on disk before modifying dirty pages in memory.",
            mentalModel: "Think of an accountant who writes every transaction in an ink-bound journal (WAL) before updating numbers on a chalkboard (RAM). If the building loses power, the chalkboard gets erased, but when power returns, the accountant simply reads the ink journal from the last checkpoint and repaints the chalkboard.",
            whatItIs: "The foundational guarantees of relational transaction processing. Write-Ahead Logging (WAL, or Redo Log in Oracle/MySQL) is the physical mechanism that enables high-throughput random I/O writes with crash recovery.",
            whyItExists: "Modifying random 8KB disk pages on every UPDATE or INSERT would saturate disk write heads and destroy database throughput. WAL allows modifications to be written as sequential, append-only disk writes (100x faster).",
            comparisonTable: {
              title: "Head-to-Head Comparison: ACID Properties & Engine Implementation",
              headers: ["ACID Property", "Guaranteed Behavior", "Primary Implementation Mechanism", "Failure Scenario Prevented"],
              rows: [
                ["Atomicity (A)", "All statements in txn succeed, or entire txn rolls back", "Undo Logs (MySQL) / Multi-Version tuples (Postgres)", "Partial money transfer (debited from account A, not credited to B)"],
                ["Consistency (C)", "Data transitions from one valid schema state to another", "Constraints (PK, FK, CHECK, UNIQUE, triggers)", "Corrupt data, negative bank balance, orphaned records"],
                ["Isolation (I)", "Concurrent transactions execute without interfering", "Locking (2PL), MVCC snapshots, Isolation Levels", "Dirty reads, lost updates, write skew, phantom reads"],
                ["Durability (D)", "Committed transactions will never be lost, even on crash", "Write-Ahead Log (WAL) / Redo Log + fsync() to disk", "Server crash / power loss wiping out in-memory buffer pool"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Classic Atomic Transaction Demonstration:\nBEGIN;\n\n-- Step 1: Debit Alice's account\nUPDATE accounts \nSET balance = balance - 100 \nWHERE account_id = 'ALICE' AND balance >= 100;\n\n-- Step 2: Credit Bob's account\nUPDATE accounts \nSET balance = balance + 100 \nWHERE account_id = 'BOB';\n\n-- Step 3: Atomic Commit (Flushes WAL entry synchronously to disk)\nCOMMIT;\n\n-- If a crash occurs between Step 1 and Step 2:\n-- On restart, Crash Recovery reads the WAL, finds no COMMIT record, and rolls back Step 1!"
            },
            tradeoffs: "Guaranteeing Durability requires calling `fsync()` to flush the WAL buffer to non-volatile disk on every COMMIT. If `fsync` is disabled (`synchronous_commit = off` in Postgres), transactions run 10x faster but risk losing the last few milliseconds of transactions upon a sudden power outage.",
            followUpQuestions: [
              {
                question: "What is a Checkpoint in relational databases?",
                answer: "A checkpoint flushes all dirty (modified) pages from in-memory buffer cache to physical table data files on disk and records a checkpoint LSN (Log Sequence Number) in the WAL, truncating older WAL files so crash recovery doesn't have to replay from the beginning of time."
              }
            ],
            usedInProduction: "Banking ledgers and Stripe core transaction engines operate with `fsync=on` on mirrored NVMe SSDs with battery-backed write caches to guarantee 100% Durability with microsecond latency.",
            relatedTopics: ["Transaction Isolation Levels", "MVCC Internals", "Optimistic vs Pessimistic Locking"]
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
        },
        {
          id: "sql-deadlocks-prevention",
          question: "What causes Database Deadlocks, how does the engine detect them, and what are the best prevention strategies?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "A deadlock occurs when two or more transactions hold locks the other needs in a circular dependency (T1 locks Row A and waits for Row B; T2 locks Row B and waits for Row A). The engine detects deadlocks by maintaining a Wait-For Graph and aborts (rolls back) the victim transaction with least work done.",
            mentalModel: "Think of two cars meeting head-to-head on a narrow one-lane bridge: neither car can move forward until the other moves backward, and neither driver is willing to reverse. A police officer (database deadlock detector) arrives and forces the smaller car (victim) to reverse off the bridge so traffic can flow.",
            whatItIs: "A fatal concurrency condition inherent to multi-transaction systems that use locks. Relational engines (Postgres, MySQL InnoDB, SQL Server) run a background deadlock detection daemon every N milliseconds.",
            whyItExists: "Exclusive row locks (`X-locks`) cannot be shared. Without deadlock detection, both transactions would sleep and hold connections forever, eventually exhausting database connection pools.",
            comparisonTable: {
              title: "Deadlock Resolution: Detection vs Prevention vs Application Handling",
              headers: ["Strategy", "Mechanism", "Pros", "Cons", "Implementation Pattern"],
              rows: [
                ["Strict Lock Ordering (Prevention)", "Enforce identical lock acquisition order in application (e.g. always sort IDs ascending)", "Completely prevents deadlocks mathematically", "Requires discipline across all microservices touching the table", "`SELECT * FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE`"],
                ["Deadlock Detection (Engine)", "Wait-For Graph cycle detection algorithm; kills victim with error `40P01: deadlock_detected`", "Automatic; handles unforeseen edge cases", "Rolls back transaction; incurs latency and log noise", "Built-in database engine daemon (e.g. `deadlock_timeout = 1s`)"],
                ["Application Retry Loop", "Catch deadlock error in code and retry transaction after jittered backoff", "Resilient; user never sees error", "Wastes CPU on repeated failed attempts", "Spring `@Retryable(DeadlockLoserDataAccessException.class)`"],
                ["Lock Timeouts / NOWAIT", "Query fails immediately if lock cannot be acquired within N ms", "Zero waiting; fails fast", "Aborts transaction even when deadlock wasn't guaranteed", "`SELECT ... FOR UPDATE NOWAIT`"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- ========================================================\n-- 1. HOW DEADLOCKS OCCUR (The Classic Anti-Pattern):\n-- Txn 1: Updates Alice then Bob\n-- Txn 2: Updates Bob then Alice (Concurrent!)\n-- Result: ERROR 40P01: deadlock detected\n-- ========================================================\n\n-- ========================================================\n-- 2. PRODUCTION FIX: Strict Lock Ordering Rule\n-- ALWAYS sort the target IDs in ascending order before locking!\n-- ========================================================\nBEGIN;\n-- Sort IDs: [10, 20] -> Txn 1 and Txn 2 lock in identical order!\nSELECT * FROM accounts \nWHERE id IN (10, 20) \nORDER BY id ASC \nFOR UPDATE;\n\nUPDATE accounts SET balance = balance - 50 WHERE id = 10;\nUPDATE accounts SET balance = balance + 50 WHERE id = 20;\nCOMMIT;"
            },
            tradeoffs: "Disabling deadlock detection (`innodb_deadlock_detect = OFF` in MySQL) can boost single-row throughput in hyper-high contention environments, but requires setting short `innodb_lock_wait_timeout` to kill blocked queries via timeout instead.",
            followUpQuestions: [
              {
                question: "How does the database choose which transaction to kill as the 'victim'?",
                answer: "Most engines pick the transaction with the least amount of modified undo log volume (least cost to roll back) to minimize recovery overhead."
              }
            ],
            usedInProduction: "Financial transfer microservices sort transfer accounts by UUID/ID before issuing SQL locks to mathematically eliminate deadlocks across billions of daily wire transactions.",
            relatedTopics: ["Pessimistic vs Optimistic Locking", "ACID Properties", "Transaction Isolation Levels"]
          }
        },
        {
          id: "sql-select-skip-locked-queues",
          question: "What is `SELECT ... FOR UPDATE SKIP LOCKED` and how does it compare to dedicated message brokers like RabbitMQ or Kafka?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "`SELECT ... FOR UPDATE SKIP LOCKED` allows worker threads to query and lock available job rows while automatically skipping rows locked by concurrent workers, creating a lock-free, zero-contention job queue directly inside PostgreSQL or MySQL 8+.",
            mentalModel: "Think of an airport baggage carousel. Instead of 10 passengers all wrestling over the exact same suitcase (lock contention), each passenger grabs the first unclaimed suitcase that nobody else's hands are currently touching (SKIP LOCKED) and immediately carries it away.",
            whatItIs: "A locking modifier added to SQL in PostgreSQL 9.5 and MySQL 8.0 designed specifically for job processing and queue semantics.",
            whyItExists: "Without `SKIP LOCKED`, concurrent worker threads executing `SELECT ... FOR UPDATE LIMIT 1` all try to lock the exact same top row. Worker 1 succeeds, and workers 2 through 10 block and wait in line, destroying multi-worker concurrency.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Database Queue (SKIP LOCKED) vs RabbitMQ vs Apache Kafka",
              headers: ["Feature / Dimension", "Database Queue (`SKIP LOCKED`)", "RabbitMQ (AMQP)", "Apache Kafka (Log Broker)"],
              rows: [
                ["Transactional Consistency", "PERFECT: Job enqueue/dequeue shares ACID transaction with business data", "Requires 2-Phase Commit (2PC) or Outbox Pattern to align with DB", "Requires Outbox Pattern (Debezium CDC)"],
                ["Operational Overhead", "ZERO extra infrastructure (runs in existing Postgres/MySQL)", "Moderate: dedicated cluster, Erlang runtime, clustering", "High: JVM, ZooKeeper/KRaft, partition management"],
                ["Throughput", "Moderate (1,000 to 10,000 jobs/sec)", "High (50,000 to 100,000 msgs/sec)", "Massive (1,000,000+ msgs/sec)"],
                ["Dead Letter & Retry", "Simple SQL update (`retry_count = retry_count + 1`)", "Native Dead Letter Exchanges (DLX)", "Requires separate dead-letter topic / consumer logic"],
                ["Message Retention", "Standard SQL table queries & indexing", "Messages deleted once acknowledged", "Persistent log retained by retention period (days/months)"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Production-Grade Background Job Processing Queue in SQL:\nBEGIN;\n\n-- Step 1: Claim and lock the next pending job without blocking other workers!\nWITH NextJob AS (\n    SELECT job_id \n    FROM task_queue \n    WHERE status = 'PENDING' \n    ORDER BY priority DESC, created_at ASC\n    LIMIT 1\n    FOR UPDATE SKIP LOCKED -- The magic modifier!\n)\nUPDATE task_queue \nSET status = 'PROCESSING',\n    locked_at = NOW(),\n    worker_id = 'WORKER_04'\nFROM NextJob\nWHERE task_queue.job_id = NextJob.job_id\nRETURNING task_queue.job_id, task_queue.payload;\n\n-- Worker processes payload, then commits txn:\nCOMMIT;"
            },
            tradeoffs: "High queue throughput causes table bloat in PostgreSQL due to constant MVCC tuple updates. You must configure aggressive autovacuum settings or use an UNLOGGED table if persistence through crash isn't critical.",
            followUpQuestions: [
              {
                question: "What is the Transactional Outbox Pattern?",
                answer: "A pattern where events are saved into an 'outbox' database table within the same local ACID transaction as the business entity, then read via SKIP LOCKED or Debezium CDC and published to Kafka/RabbitMQ, guaranteeing at-least-once delivery without dual-write bugs."
              }
            ],
            usedInProduction: "GitHub's background job runner and popular libraries like Graphile Worker (Postgres) and Celery use `FOR UPDATE SKIP LOCKED` to process millions of webhook tasks daily without external broker dependencies.",
            relatedTopics: ["Pessimistic vs Optimistic Locking", "ACID Transactions", "Deadlocks & MVCC"]
          }
        },
        {
          id: "sql-mvcc-internals",
          question: "How does MVCC (Multi-Version Concurrency Control) work in PostgreSQL vs MySQL InnoDB?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "MVCC allows 'readers to never block writers, and writers to never block readers'. PostgreSQL implements MVCC by creating a brand-new row tuple in the main table heap tagged with `xmin` (creation txn) and `xmax` (deletion txn), requiring VACUUM to reclaim space. MySQL InnoDB stores the latest row in the clustered index and writes older versions into Undo Log rollback segments.",
            mentalModel: "PostgreSQL is like printing a new updated version of a document every time an edit is made (leaving old versions in the drawer until a janitor/VACUUM shreds them). MySQL InnoDB writes the edit directly on the paper in pen, but writes instructions for how to erase and restore the previous version on a scratchpad (Undo Log).",
            whatItIs: "The core concurrency engine architecture in modern relational databases that allows transactions to read a consistent snapshot of data without holding shared read locks.",
            whyItExists: "In traditional 2-Phase Locking (2PL), reading a row placed a Shared Lock (`S-lock`) that blocked any concurrent UPDATE. Under high traffic, long-running SELECT reporting queries completely halted write transactions.",
            comparisonTable: {
              title: "Head-to-Head Comparison: PostgreSQL MVCC vs MySQL InnoDB MVCC",
              headers: ["Dimension", "PostgreSQL MVCC", "MySQL InnoDB MVCC"],
              rows: [
                ["Row Version Storage", "In the main table HEAP (new physical tuple per UPDATE)", "Clustered index holds latest; older versions stored in Undo Log"],
                ["Dead Row / Version Cleanup", "Requires `VACUUM` (autovacuum) to clean dead tuples", "Purge Threads automatically discard undo logs once no txn needs snapshot"],
                ["Table Bloat Vulnerability", "High: frequent updates bloat table and index pages", "Low: table pages stay compact; undo tablespace grows instead"],
                ["Secondary Index Pointers", "Secondary indexes point to physical heap tuple ID (`ctid`); HOT (Heap-Only Tuples) optimization helps", "Secondary indexes point to Primary Key; updates to non-PK columns never touch secondary indexes"],
                ["Transaction Metadata", "`xmin` (creating transaction ID), `xmax` (expiring transaction ID)", "`DB_TRX_ID` (transaction ID), `DB_ROLL_PTR` (rollback pointer to undo log)"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Inspecting PostgreSQL Internal MVCC Tuple Metadata:\nSELECT \n    ctid,          -- Physical page location (e.g., '(0, 1)')\n    xmin,          -- Transaction ID that inserted this row version\n    xmax,          -- Transaction ID that deleted/updated this row version (0 if active)\n    user_id, \n    email\nFROM users;\n\n-- In PostgreSQL, an UPDATE is physically an INSERT of a new tuple \n-- and an update of the old tuple's xmax!\nUPDATE users SET email = 'alice_new@example.com' WHERE user_id = 1;\n-- Check ctid again: tuple has physically moved to a new slot '(0, 2)'!"
            },
            tradeoffs: "In PostgreSQL, a long-running transaction prevents autovacuum from cleaning up any dead tuples created after that transaction started. This causes runaway table bloat across the entire database.",
            followUpQuestions: [
              {
                question: "What is HOT (Heap-Only Tuples) in PostgreSQL?",
                answer: "An optimization where an updated row version is placed on the exact same 8KB disk page as the old version, and no indexed column was changed. This allows secondary indexes to skip being updated, cutting index write I/O by 90%."
              }
            ],
            usedInProduction: "DBAs monitor PostgreSQL `n_dead_tup` metrics in `pg_stat_user_tables` to fine-tune `autovacuum_vacuum_scale_factor` so high-churn tables (like token sessions) don't inflate disk usage.",
            relatedTopics: ["Transaction Isolation Levels", "ACID Properties", "Clustered Indexes"]
          }
        },
        {
          id: "sql-view-vs-materialized-view",
          question: "What is the difference between a View and a Materialized View in relational databases?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "A standard View is a saved, virtual query that executes dynamically every time it is referenced (stores zero data on disk); a Materialized View physically caches and persists the query results on disk and can be indexed, but requires explicit refresh.",
            mentalModel: "A standard View is a web browser bookmark: clicking it loads the webpage fresh from the server every time. A Materialized View is taking a screenshot or downloading an offline PDF of that webpage: opening it is instantaneous, but it doesn't reflect new changes until you re-download it.",
            whatItIs: "Database abstractions used to simplify complex schemas, enforce security access boundaries, and accelerate expensive multi-table joins and aggregations.",
            whyItExists: "Aggregating 50 million sales rows across 5 tables takes 15 seconds. Running that live every time a user refreshes an executive dashboard crashes the database. A Materialized View computes the aggregate once and serves queries in 0.5 milliseconds.",
            comparisonTable: {
              title: "Head-to-Head Comparison: View vs Materialized View",
              headers: ["Feature / Dimension", "Standard Database View", "Materialized View"],
              rows: [
                ["Data Storage on Disk", "Zero disk space (stores ONLY the SQL query text in catalog)", "Physically stores full query result rows on disk pages"],
                ["Data Freshness", "100% Real-time (executes underlying query dynamically)", "Snapshot in time (stale until REFRESH is called)"],
                ["Performance", "Same speed as running the underlying query directly", "Blazing fast: reads pre-computed disk pages like a table"],
                ["Index Support", "Cannot be indexed directly (except Indexed Views in SQL Server)", "CAN create B-Tree, GIN, and Hash indexes directly on view columns"],
                ["Write Overhead", "Zero impact on base table INSERT/UPDATE", "Zero base table impact, but requires periodic refresh maintenance"],
                ["Primary Use Case", "Security access control, column hiding, simplifying joins", "Analytics dashboards, BI reports, heavy pre-aggregations"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. Standard Virtual View (Always real-time):\nCREATE VIEW active_customer_summary AS\nSELECT c.id, c.name, COUNT(o.order_id) AS total_orders\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nWHERE c.status = 'ACTIVE'\nGROUP BY c.id, c.name;\n\n-- 2. Materialized View (Pre-computed physical table):\nCREATE MATERIALIZED VIEW mv_daily_sales_rollup AS\nSELECT \n    DATE_TRUNC('day', order_date) AS sales_day,\n    product_category,\n    SUM(total_amount) AS revenue,\n    COUNT(*) AS order_count\nFROM orders\nGROUP BY DATE_TRUNC('day', order_date), product_category;\n\n-- Create Index directly on the Materialized View for instant seeks:\nCREATE UNIQUE INDEX idx_mv_sales ON mv_daily_sales_rollup(sales_day, product_category);\n\n-- Refresh Materialized View without blocking concurrent reads (Postgres):\nREFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales_rollup;"
            },
            tradeoffs: "In PostgreSQL, running `REFRESH MATERIALIZED VIEW` without `CONCURRENTLY` acquires an exclusive lock on the materialized view, blocking all reads. Using `CONCURRENTLY` requires a unique index on the view but allows reads during refresh.",
            followUpQuestions: [
              {
                question: "Can you update or insert rows directly into a Materialized View?",
                answer: "No. Materialized Views are read-only. Data originates solely from the underlying base tables and is updated only when the view is refreshed."
              }
            ],
            usedInProduction: "E-commerce search homepages serve category product counts from materialized views refreshed every hour via cron, reducing database load by 95%.",
            relatedTopics: ["CTEs vs Views", "Performance & Indexing", "Logical Query Processing"]
          }
        },
        {
          id: "sql-stored-proc-vs-func",
          question: "What is the difference between a Stored Procedure and a User-Defined Function (UDF)?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "A Function must return a value, cannot commit or roll back transactions, and can be called directly inside SELECT/WHERE clauses; a Stored Procedure does not require a return value, can control transactions (COMMIT/ROLLBACK), and is executed independently via CALL / EXEC.",
            mentalModel: "A Function is like a math formula on a calculator: you pass in 2 numbers and it outputs a result without changing anything in the room. A Stored Procedure is like an automated robot script: you tell it 'Execute Nightly Reconcile' and it opens cabinets, writes logs, commits changes, and sends out alerts.",
            whatItIs: "Compiled database server-side procedural programming constructs (PL/pgSQL, T-SQL, PL/SQL) used to encapsulate business logic directly on the database engine.",
            whyItExists: "Executing 50 sequential SQL statements from a remote application server incurs 50 network round-trips. Running a Stored Procedure executes all 50 operations locally in memory on the database engine in microsecond time.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Stored Procedure vs User-Defined Function (UDF)",
              headers: ["Feature / Dimension", "User-Defined Function (UDF)", "Stored Procedure"],
              rows: [
                ["Return Value", "MANDATORY: Must return a single value or table", "OPTIONAL: May return 0, 1, or multiple result sets / OUT params"],
                ["Transaction Control (COMMIT / ROLLBACK)", "STRICTLY FORBIDDEN: Cannot start or commit transactions", "ALLOWED: Can execute `COMMIT` and `ROLLBACK` internally"],
                ["Usage in Queries", "Can be called inline inside `SELECT`, `WHERE`, `JOIN`, `HAVING`", "CANNOT be used inside SELECT queries; invoked via `CALL` or `EXEC`"],
                ["Side Effects (Modifying DB state)", "Generally restricted (best practice: read-only deterministic)", "Designed for multi-step DML modifications (INSERT, UPDATE, DELETE)"],
                ["Pre-compilation & Plan Caching", "Execution plan cached", "Execution plan cached on first compilation"],
                ["Primary Use Case", "Data transformations, string formatting, mathematical formulas", "Batch ETL processing, end-of-day reconciliation, payroll execution"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. User-Defined Function (Used inside SELECT queries):\nCREATE OR REPLACE FUNCTION calculate_tax(subtotal NUMERIC, tax_rate NUMERIC)\nRETURNS NUMERIC AS $$\nBEGIN\n    RETURN ROUND(subtotal * tax_rate, 2);\nEND;\n$$ LANGUAGE plpgsql IMMUTABLE;\n\n-- Calling the function inline in SQL:\nSELECT order_id, subtotal, calculate_tax(subtotal, 0.0825) AS tax FROM orders;\n\n-- 2. Stored Procedure with Transaction Control (PostgreSQL 11+):\nCREATE OR REPLACE PROCEDURE transfer_funds(sender_id INT, receiver_id INT, amount NUMERIC)\nAS $$\nBEGIN\n    UPDATE accounts SET balance = balance - amount WHERE id = sender_id;\n    UPDATE accounts SET balance = balance + amount WHERE id = receiver_id;\n    \n    -- Stored Procedures can COMMIT transactions!\n    COMMIT;\nEND;\n$$ LANGUAGE plpgsql;\n\n-- Invoking stored procedure:\nCALL transfer_funds(101, 202, 500.00);"
            },
            tradeoffs: "Embedding core business logic in stored procedures makes version control, CI/CD automated unit testing, and horizontal scaling difficult. Modern architecture prefers keeping business logic in backend application code and using SQL for pure data retrieval.",
            followUpQuestions: [
              {
                question: "What does IMMUTABLE mean on a PostgreSQL function?",
                answer: "IMMUTABLE means the function cannot modify the database and always returns the exact same result given the same arguments. This allows the query optimizer to pre-evaluate the function into a constant."
              }
            ],
            usedInProduction: "Banking core systems run end-of-month interest calculation and account status rollover inside Stored Procedures during maintenance windows to eliminate network latency.",
            relatedTopics: ["ACID Properties", "Views vs Materialized Views", "Transactions"]
          }
        }
      ]
    }
  ]
};
