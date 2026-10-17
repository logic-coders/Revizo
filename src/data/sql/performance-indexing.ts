import { Category } from "@/types";

export const sqlPerformanceIndexingCategory: Category = {
  id: "sql-performance-indexing",
  title: "Performance, Indexing & Optimization",
  icon: "📁",
  subTopics: [
    {
      id: "sql-indexing",
      title: "B-Tree Internals, Execution Plans & Query Tuning",
      questions: [
        {
          id: "sql-composite-index-leftmost-prefix",
          question: "What is a Composite (Multi-Column) Index and how does the Leftmost Prefix Rule work?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "A Composite Index indexes multiple columns together in a single B-Tree sorted hierarchically. The Leftmost Prefix Rule states that the query optimizer can only use the index if the query filters on the leftmost (leading) column(s) in exact sequential order.",
            mentalModel: "Think of an old telephone book sorted by (LastName, FirstName, MiddleName). You can easily find 'Smith, John' (uses both) or everyone with last name 'Smith' (uses leading column). But if someone asks for everyone whose first name is 'John' without providing a last name, the phonebook is useless — you have to scan all 500 pages from front to back!",
            whatItIs: "An index created on two or more columns of a table: `CREATE INDEX idx ON table(col1, col2, col3)`. Internally, the B-Tree keys are composite tuples sorted primarily by col1, secondarily by col2, and tertiarily by col3.",
            whyItExists: "Queries frequently filter on multiple dimensions simultaneously (e.g., `WHERE tenant_id = 5 AND status = 'ACTIVE'`). A single composite index satisfies both filters in one B-Tree traversal, avoiding bitmap index merges.",
            comparisonTable: {
              title: "The Leftmost Prefix Rule: Index (A, B, C) Usability Matrix",
              headers: ["Query Filter Condition", "Index Usable?", "Access Method Used", "Explanation"],
              rows: [
                ["WHERE A = 1", "YES", "Index Seek", "Leading column A is matched directly."],
                ["WHERE A = 1 AND B = 2", "YES", "Index Seek", "Both leading columns A and B matched; highly selective."],
                ["WHERE A = 1 AND B = 2 AND C = 3", "YES", "Index Seek (Full)", "All columns matched; narrowest possible point seek."],
                ["WHERE A = 1 AND C = 3", "PARTIAL", "Index Seek on A, Filter on C", "Seeks on A; once inside range, scans and checks C (skips B)."],
                ["WHERE B = 2 AND C = 3", "NO (or Skip Scan)", "Full Index Scan or Table Scan", "Violates Leftmost Prefix: Leading column A is missing!"],
                ["WHERE C = 3", "NO", "Full Table Scan", "Leading column A is missing; cannot navigate B-Tree."],
                ["WHERE A > 10 AND B = 2", "PARTIAL", "Index Range Seek on A only", "Range operator on A stops B-Tree navigation; B cannot be used for seek!"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. Creating Composite Index:\nCREATE INDEX idx_orders_user_status_date \nON orders (user_id, status, created_at);\n\n-- ========================================================\n-- FULL INDEX SEEK: Matches A, B, and C in order\n-- ========================================================\nEXPLAIN ANALYZE\nSELECT order_id, total_amount \nFROM orders \nWHERE user_id = 42 \n  AND status = 'COMPLETED' \n  AND created_at >= '2024-01-01';\n\n-- ========================================================\n-- ANTI-PATTERN: Range operator halts index seek for subsequent columns\n-- ========================================================\n-- Here, user_id > 100 uses index seek, but 'status' CANNOT use seek!\nSELECT * FROM orders WHERE user_id > 100 AND status = 'PENDING';"
            },
            tradeoffs: "Column ordering in composite indexes is critical: place Equality columns FIRST (highest selectivity), and Range / Inequality columns (`>`, `<`, `BETWEEN`) LAST. Once a range operator is encountered, no subsequent columns in the index can be used for B-Tree seeks.",
            followUpQuestions: [
              {
                question: "What is an Index Skip Scan?",
                answer: "In MySQL 8.0+ and Oracle, if the leading column has very low cardinality (e.g., gender with 2 values), the optimizer can skip through the leading column and still use subsequent indexed columns without a full table scan."
              }
            ],
            usedInProduction: "Multi-tenant SaaS architectures index `(tenant_id, created_at DESC)` on every transactional table to isolate customer queries to a single B-Tree branch.",
            relatedTopics: ["Index Seek vs Index Scan", "Covering Indexes", "SARGable Queries"]
          }
        },
        {
          id: "sql-index-scan-vs-seek",
          question: "What is the difference between an Index Seek and an Index Scan in query execution plans?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "An Index Seek traverses the B-Tree from root to leaf to locate specific rows directly in O(log N) time; an Index Scan reads all or a wide range of pages in the index from start to finish in O(N) time.",
            mentalModel: "An Index Seek is using the index in a book to find the exact page number 42 and turning straight to it. An Index Scan is reading every single page in the index section from A to Z looking for something.",
            whatItIs: "When inspecting database execution plans (EXPLAIN or EXPLAIN ANALYZE), the access method reveals how the engine retrieves data: Seek (direct point or bounded range lookup) vs Scan (full traversal).",
            whyItExists: "Query optimizers choose between seeks and scans based on selectivity estimates. If a query matches 0.01% of rows, an Index Seek is fastest; if a query matches 80% of rows, an Index Scan or Table Scan is faster to avoid random I/O.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Index Seek vs Index Scan vs Table Scan",
              headers: ["Metric / Operation", "Index Seek", "Index Scan", "Table Scan (Seq Scan)"],
              rows: [
                ["Algorithmic Complexity", "O(log N) — highly efficient", "O(N) — traverses entire index structure", "O(N) — traverses all base data pages"],
                ["I/O Pattern", "Point lookup / narrow range; minimal page reads", "Sequential page reads through index leaf chain", "Sequential disk I/O through raw table extents"],
                ["Selectivity Threshold", "Best when selecting < 2-5% of total table rows", "Used when selecting large ranges or non-leading key columns", "Best when selecting > 20-30% of total table rows"],
                ["Common Root Causes", "Equality / bounded range on leading index column (`WHERE id = 5`)", "Unbounded query, leading wildcard (`LIKE '%abc'`), non-SARGable predicate", "Missing index entirely or small table (< 100 rows)"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Analyzing Query Execution Plans in PostgreSQL:\nEXPLAIN ANALYZE \nSELECT * FROM orders WHERE order_id = 984521;\n-- Plan Output: \"Index Scan using orders_pkey on orders (cost=0.43..8.45 rows=1 width=72) (actual time=0.042..0.044 rows=1 loops=1)\"\n-- (Note: In Postgres terminology, a bounded Index Scan on PK is an Index Seek)\n\n-- Example of Non-SARGable query causing an Index Scan:\nEXPLAIN ANALYZE \nSELECT * FROM orders WHERE EXTRACT(YEAR FROM order_date) = 2024;\n-- Forces Scan: Function on order_date prevents B-Tree navigation!\n\n-- Optimized SARGable query restoring Index Seek:\nEXPLAIN ANALYZE \nSELECT * FROM orders \nWHERE order_date >= '2024-01-01' AND order_date < '2025-01-01';\n-- Plan Output: Uses Index Range Seek!"
            },
            tradeoffs: "An Index Seek is not always faster than a Table Scan! When selecting 40% of rows from a table, following secondary index pointers causes random single-page disk seeks (Bookmark Lookups). A Sequential Table Scan with read-ahead caching is much faster.",
            followUpQuestions: [
              {
                question: "What is the 'Tipping Point' in query optimization?",
                answer: "The tipping point is the selectivity threshold (typically 2% to 20%) where the query optimizer decides that performing index seeks + bookmark lookups is more expensive than simply performing a sequential table scan."
              }
            ],
            usedInProduction: "DBAs monitor slow query logs (`pg_stat_statements` or MySQL slow query log) searching for queries with high buffer reads caused by Index Scans on multi-million row tables.",
            relatedTopics: ["Clustered vs Non-Clustered Indexes", "SARGable Queries", "EXPLAIN ANALYZE"]
          }
        },
        {
          id: "sql-sargable-queries",
          question: "What makes a SQL query SARGable vs Non-SARGable, and how do you optimize slow queries?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "A SARGable (Search Argument Able) query enables the database engine to use a B-Tree index seek to locate matching rows; a Non-SARGable query wraps indexed columns in functions, leading wildcards, or type conversions, blinding the optimizer and forcing a full table scan.",
            mentalModel: "Think of an alphabetical phone directory. If someone says 'Find everyone whose last name starts with Sm' (SARGable), you flip directly to the 'Sm' section. If they say 'Find everyone whose last name ends in son' or 'whose name length is 5' (Non-SARGable), you have to read every single name in the entire phonebook from start to finish.",
            whatItIs: "SARGability describes whether a predicate in the WHERE or ON clause can leverage B-Tree range seek operations. Predicates formatted as `column OPERATOR constant` are SARGable.",
            whyItExists: "B-Tree indexes are sorted by raw column values. Applying a function like `LOWER(email)` or `YEAR(created_at)` transforms the values; because the index does not contain pre-transformed values, the database cannot navigate the tree.",
            comparisonTable: {
              title: "Classic SARGable vs Non-SARGable Rewrite Matrix",
              headers: ["Pattern", "Non-SARGable (Slow Full Table Scan)", "SARGable Rewrite (Fast Index Seek)", "Performance Gain"],
              rows: [
                ["Date Function", "WHERE YEAR(created_at) = 2024", "WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'", "100x – 1000x faster"],
                ["Case Insensitivity", "WHERE LOWER(email) = 'alice@example.com'", "Create functional index: `CREATE INDEX ON users(LOWER(email))` or use CITEXT", "50x – 500x faster"],
                ["Wildcard LIKE", "WHERE name LIKE '%smith'", "WHERE name LIKE 'smith%' (trailing wildcard is SARGable!)", "Eliminates full scan"],
                ["Math on Column", "WHERE salary * 1.10 > 100000", "WHERE salary > (100000 / 1.10) (isolate column on left side)", "Converts to constant seek"],
                ["Implicit Type Cast", "WHERE phone_number = 1234567890 (column is VARCHAR)", "WHERE phone_number = '1234567890' (pass matching string literal)", "Prevents per-row CAST function"],
                ["IS NULL vs Default", "WHERE COALESCE(status, 'PENDING') = 'PENDING'", "WHERE status = 'PENDING' OR status IS NULL", "Enables index seek"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- ========================================================\n-- BEFORE: Non-SARGable Anti-Pattern (3.2 seconds on 5M rows)\n-- ========================================================\nSELECT id, amount, created_at\nFROM transactions\nWHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day';\n\n-- ========================================================\n-- AFTER: SARGable Optimization (0.8 milliseconds on 5M rows)\n-- ========================================================\nSELECT id, amount, created_at\nFROM transactions\nWHERE created_at >= CURRENT_DATE - INTERVAL '1 day'\n  AND created_at <  CURRENT_DATE;"
            },
            tradeoffs: "If a business requirement genuinely requires searching arbitrary substrings (`LIKE '%term%'`), standard B-Tree indexes cannot help. You must create full-text search indexes (GIN / GiST with pg_trgm in Postgres, or Elasticsearch).",
            followUpQuestions: [
              {
                question: "What is a Functional / Expression Index?",
                answer: "A functional index stores the result of an expression inside the B-Tree. For example: CREATE INDEX idx_lower_email ON users (LOWER(email)); allows WHERE LOWER(email) = 'test@example.com' to execute an Index Seek."
              }
            ],
            usedInProduction: "GitHub and Shopify maintain strict CI linters on SQL migrations that reject any query applying functions to indexed date columns, preventing accidental production table locks.",
            relatedTopics: ["Index Seek vs Index Scan", "Clustered vs Non-Clustered Indexes", "EXPLAIN ANALYZE"]
          }
        },
        {
          id: "sql-covering-index-include",
          question: "What is the difference between a Composite Index and an Index with an INCLUDE clause (Covering Index)?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "A Composite Index stores columns in both the intermediate B-Tree branch nodes (affecting sort order and size) and leaf nodes; an index with `INCLUDE` stores payload columns ONLY at the leaf level, keeping the B-Tree narrow and fast while still enabling Index-Only Scans.",
            mentalModel: "A Composite Index `(LastName, FirstName)` is alphabetizing books by both last name and first name (more work to alphabetize). An INCLUDE index `(LastName) INCLUDE (Bio, PhotoUrl)` sorts books solely by last name, but puts a copy of the author's photo right on the spine so you don't have to open the book to see it.",
            whatItIs: "An optimization technique supported in PostgreSQL (`CREATE INDEX ... INCLUDE`) and Microsoft SQL Server to create Covering Indexes without bloating intermediate B-Tree navigation nodes.",
            whyItExists: "If an index contains all columns requested by a SELECT query, the query engine performs an **Index-Only Scan**, avoiding expensive random I/O table lookups (Bookmark/Key Lookups). Storing non-filter columns in INCLUDE avoids inflating index tree depth.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Composite Index vs Index with INCLUDE",
              headers: ["Feature / Dimension", "Composite Index `(A, B)`", "Index on `(A) INCLUDE (B)`"],
              rows: [
                ["Column B in Intermediate B-Tree Nodes?", "YES: B is stored at every tree level for branching", "NO: Stored ONLY in leaf pages as unindexed payload"],
                ["Can Column B be used in WHERE / JOIN / ORDER BY seeks?", "YES: Can be used in filter predicates and sort operations", "NO: Cannot be used to seek or sort (it is pure payload)"],
                ["Data Type Constraints", "Subject to B-Tree index key size limits (e.g., 2704 bytes in Postgres)", "Can include large data types (VARCHAR(MAX), JSONB, TEXT)"],
                ["Index Size & Tree Depth", "Larger tree footprint; fewer keys per 8KB page; taller tree", "Smaller navigation nodes; higher fan-out; shallower tree"],
                ["Write (DML) Overhead", "Must re-balance B-Tree if B changes", "Lighter: only leaf page updated if B changes"],
                ["Primary Purpose", "Multi-column search filtering and sorting", "Achieving Index-Only Scans for read-heavy projection queries"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. Creating a Covering Index with INCLUDE in PostgreSQL:\nCREATE INDEX idx_orders_customer_covering \nON orders (customer_id) \nINCLUDE (order_date, total_amount, status);\n\n-- ========================================================\n-- 2. Achieving an Index-Only Scan:\n-- All columns (customer_id, order_date, total_amount, status)\n-- are present in the index leaf pages. Table heap pages are NEVER read!\n-- ========================================================\nEXPLAIN ANALYZE\nSELECT order_date, total_amount, status\nFROM orders\nWHERE customer_id = 94812;\n-- Output: \"Index Only Scan using idx_orders_customer_covering on orders\""
            },
            tradeoffs: "In PostgreSQL, Index-Only Scans require checking the visibility map to ensure rows are visible to all MVCC transactions without reading heap pages. If a table has frequent updates and `VACUUM` has not run, Index-Only Scans fall back to reading heap pages.",
            followUpQuestions: [
              {
                question: "What is a Bookmark Lookup (or Key Lookup)?",
                answer: "When a secondary index satisfies the WHERE condition but the SELECT clause asks for columns not present in the index, the engine must make a random I/O jump to the base table to fetch the remaining columns. This is a Key Lookup."
              }
            ],
            usedInProduction: "High-volume user profile APIs (`/api/v1/user/summary`) use covering indexes on `(user_id) INCLUDE (display_name, avatar_url, tier)` to serve 50,000 requests/sec with zero base table I/O.",
            relatedTopics: ["Index Seek vs Index Scan", "Leftmost Prefix Rule", "MVCC Internals"]
          }
        },
        {
          id: "sql-btree-hash-gin-gist",
          question: "What is the difference between B-Tree, Hash, GIN, and GiST indexes in PostgreSQL?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "B-Tree is the universal default for equality and range queries (`=, <, >`); Hash is specialized for O(1) equality only; GIN (Generalized Inverted Index) is optimized for composite/multi-element types like JSONB, full-text search, and arrays; GiST (Generalized Search Tree) handles spatial (PostGIS), geometric, and range-overlap queries.",
            mentalModel: "B-Tree is an alphabetical phonebook. Hash is a locker room where each locker number is computed from a key. GIN is the back-of-the-book index that lists every page number where a specific keyword appears. GiST is a tree of bounding boxes on a geographic map.",
            whatItIs: "Specialized index access methods available in advanced relational engines like PostgreSQL designed to accelerate diverse data types beyond scalar numbers and strings.",
            whyItExists: "Modern databases store rich data types: geospatial coordinates (lat/long), full-text articles, JSON documents, and IP network ranges. Standard B-Trees cannot efficiently query 'Does this polygon intersect with that polygon?' or 'Does this JSON array contain key X?'.",
            comparisonTable: {
              title: "Head-to-Head Comparison: PostgreSQL Index Types",
              headers: ["Index Type", "Supported Operators", "Internal Architecture", "Update Overhead", "Best Suited For"],
              rows: [
                ["B-Tree (Default)", "`=, <, <=, >, >=, BETWEEN, LIKE 'abc%'`", "Self-balancing multi-way search tree (B+ Tree)", "Low to Moderate", "Numbers, timestamps, standard text, foreign keys, PKs"],
                ["Hash", "`=` only (strictly equality)", "In-memory hash table on disk with bucket chaining", "Very Low (faster INSERT than B-Tree)", "Large UUIDs or long strings compared strictly with equality"],
                ["GIN (Inverted)", "`@> (contains), ? (exists), @@ (full-text match)`", "Inverted index mapping individual items to posting lists", "High (every inserted element updates multiple posting lists)", "JSONB documents, integer arrays (`int[]`), full-text search (`tsvector`)"],
                ["GiST (Search Tree)", "`&& (overlap), << (strictly left of), <-> (k-NN distance)`", "Balanced tree of hierarchical bounding predicates", "Moderate", "PostGIS spatial data, geometric polygons, IP CIDR ranges, nearest-neighbor"],
                ["BRIN (Block Range)", "`=, <, <=, >, >=`", "Stores min/max values for physical chunks of pages (e.g. 128 pages)", "Ultra Low (tiny index size: 1% of B-Tree)", "Massive append-only time-series data naturally sorted on disk"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. JSONB indexing with GIN:\nCREATE TABLE audit_events (\n    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n    event_payload JSONB NOT NULL\n);\n-- Index all JSON keys and values:\nCREATE INDEX idx_audit_payload_gin ON audit_events USING GIN (event_payload);\n\n-- Extremely fast seek inside JSON documents:\nSELECT * FROM audit_events \nWHERE event_payload @> '{\"action\": \"LOGIN_FAILED\", \"source\": \"API\"}';\n\n-- 2. BRIN Index for 1-Billion Row Time-Series Table:\nCREATE INDEX idx_logs_created_brin ON system_logs USING BRIN (created_at);"
            },
            tradeoffs: "GIN indexes are expensive to update because inserting a single row containing a JSON object with 20 keys requires updating 20 distinct posting lists. PostgreSQL uses a `fastupdate` buffer to mitigate this during bulk writes.",
            followUpQuestions: [
              {
                question: "When should you prefer BRIN over B-Tree?",
                answer: "When a table has hundreds of millions of rows and data is inserted sequentially in physical disk order (like append-only logs or IoT sensor data). A BRIN index on 100GB of data can be as small as 10MB."
              }
            ],
            usedInProduction: "E-commerce product catalogs store arbitrary dynamic attributes in PostgreSQL `attributes JSONB` with a GIN index to power faceted search filters without schema migrations.",
            relatedTopics: ["Covering Indexes", "SARGable Queries", "Database Internals"]
          }
        },
        {
          id: "sql-explain-analyze-interpretation",
          question: "What is the difference between EXPLAIN and EXPLAIN ANALYZE, and how do you read execution plans?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "EXPLAIN prints the optimizer's estimated execution plan without running the query; EXPLAIN ANALYZE actually executes the query on the database, recording true elapsed runtime, actual row counts, loop iterations, and buffer memory hits.",
            mentalModel: "EXPLAIN is Google Maps estimating: 'This route should take 20 minutes based on historical traffic statistics'. EXPLAIN ANALYZE is actually driving the car on the highway with a stopwatch: 'It actually took 45 minutes because of an unexpected construction detour'.",
            whatItIs: "The premier diagnostic tool used by database engineers to inspect the query planner's choices, cost calculations, index usage, join algorithms, and physical resource bottlenecks.",
            whyItExists: "Diagnosing slow queries without an execution plan is blind guesswork. Comparing estimated rows against actual rows instantly reveals stale database statistics or poor cardinality estimations.",
            comparisonTable: {
              title: "Head-to-Head Comparison: EXPLAIN vs EXPLAIN ANALYZE",
              headers: ["Feature / Dimension", "EXPLAIN", "EXPLAIN ANALYZE", "EXPLAIN (ANALYZE, BUFFERS)"],
              rows: [
                ["Executes Query?", "NO: Pure mathematical planning model", "YES: Query is executed for real!", "YES: Query is executed for real"],
                ["Safe for Write Queries (INSERT/UPDATE/DELETE)?", "100% Safe (doesn't modify data)", "DANGEROUS: Will actually modify/delete data! Wrap in a ROLLBACK transaction", "Dangerous unless wrapped in ROLLBACK"],
                ["Execution Time Metric", "Hypothetical cost units (`cost=0.00..45.12`)", "Real millisecond elapsed time (`actual time=0.034..1.214 rows=50`)", "Real millisecond elapsed time"],
                ["Buffer Cache Tracking", "No", "No", "YES: reports shared hit/read blocks (RAM vs Disk I/O)"],
                ["Detects Stale Statistics?", "No (only shows what optimizer guessed)", "YES: Huge gap between estimated rows and actual rows flags stale stats", "Yes"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Running EXPLAIN ANALYZE with Buffers in PostgreSQL:\nEXPLAIN (ANALYZE, BUFFERS, VERBOSE)\nSELECT c.name, COUNT(o.order_id) AS total_orders\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nWHERE c.created_at >= '2024-01-01'\nGROUP BY c.id, c.name;\n\n-- How to Safely Test a DELETE query with EXPLAIN ANALYZE:\nBEGIN;\nEXPLAIN ANALYZE \nDELETE FROM inactive_users WHERE last_login < '2020-01-01';\nROLLBACK; -- Critical: Rolls back all deleted rows!"
            },
            tradeoffs: "Never run `EXPLAIN ANALYZE` on a raw `DELETE FROM users` in production without an explicit `BEGIN; ... ROLLBACK;` wrapper, as it will permanently delete the records.",
            followUpQuestions: [
              {
                question: "What does 'Buffers: shared hit=421 read=12' mean in EXPLAIN ANALYZE?",
                answer: "'shared hit' means pages were retrieved directly from database RAM (buffer pool). 'read' means pages had to be fetched via physical disk I/O. A slow query with high 'read' is I/O-bound."
              }
            ],
            usedInProduction: "Site Reliability Engineers automate continuous query profiling via `auto_explain` in PostgreSQL, automatically logging EXPLAIN ANALYZE trees for any query taking longer than 500ms.",
            relatedTopics: ["Physical Join Algorithms", "Index Seek vs Index Scan", "SARGable Queries"]
          }
        },
        {
          id: "sql-partitioning-vs-sharding",
          question: "What is the difference between Database Partitioning (Range, List, Hash) and Database Sharding?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "Partitioning splits a large table into smaller sub-tables within a single database instance managed transparently by the engine; Sharding distributes database partitions across multiple independent physical server nodes (shared-nothing horizontal scaling).",
            mentalModel: "Partitioning is organizing a filing cabinet by putting receipts into 12 colored folders (one for each month) in the same drawer. Sharding is renting 12 separate storage warehouses in 12 different cities and shipping each month's receipts to a different warehouse.",
            whatItIs: "Architectural techniques for scaling relational databases when tables grow beyond hundreds of gigabytes or billions of rows.",
            whyItExists: "Single B-Trees degrade when they exceed memory buffer pools (causing page swapping). Partitioning keeps active working sets in memory, while sharding overcomes single-machine CPU, memory, and disk IOPS limits.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Table Partitioning vs Database Sharding",
              headers: ["Feature / Dimension", "Table Partitioning (Vertical / Declarative)", "Database Sharding (Horizontal Partitioning)"],
              rows: [
                ["Hardware Topology", "Single database server (or primary-replica cluster)", "Multiple independent database servers (Shared-Nothing Architecture)"],
                ["Management Layer", "Managed natively by RDBMS query optimizer", "Managed by application routing layer or proxy (Vitess, Citus)"],
                ["Partition Pruning", "Automatic: queries with partition key skip untouched partitions", "Router sends query only to specific target shard node"],
                ["Cross-Partition Transactions / Joins", "Full ACID support; standard JOINs across partitions", "Complex distributed 2-Phase Commit (2PC) or forbidden"],
                ["Operational Complexity", "Low: standard DDL (`PARTITION BY RANGE (date)`)", "Very high: shard re-balancing, failover, node synchronization"],
                ["Primary Limit Overcome", "B-Tree index depth, vacuum overhead, page eviction", "Total server disk capacity, write IOPS, network bandwidth"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Declarative Range Partitioning in PostgreSQL:\nCREATE TABLE measurement_logs (\n    sensor_id INT NOT NULL,\n    log_time TIMESTAMP NOT NULL,\n    temperature NUMERIC(5, 2)\n) PARTITION BY RANGE (log_time);\n\n-- Create individual monthly partitions:\nCREATE TABLE measurements_2024_01 PARTITION OF measurement_logs\n    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');\n\nCREATE TABLE measurements_2024_02 PARTITION OF measurement_logs\n    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');\n\n-- Partition Pruning in Action:\nEXPLAIN SELECT * FROM measurement_logs \nWHERE log_time >= '2024-01-10' AND log_time < '2024-01-15';\n-- Plan strictly inspects measurements_2024_01 and completely ignores all other months!"
            },
            tradeoffs: "If a query does not include the partition key in its WHERE clause, the engine must scan EVERY single partition (scatter-gather), which is slower than querying an unpartitioned indexed table.",
            followUpQuestions: [
              {
                question: "What is Partition Pruning?",
                answer: "Partition pruning is an optimizer feature where the query planner statically or dynamically discards partitions that cannot possibly contain matching rows based on the query's WHERE filter."
              }
            ],
            usedInProduction: "Uber and Instagram shard their core PostgreSQL and MySQL databases across hundreds of nodes using `shard_id = user_id % num_shards`, routing reads/writes via Citus or Vitess.",
            relatedTopics: ["B-Tree Indexes", "EXPLAIN ANALYZE", "System Design"]
          }
        }
      ]
    }
  ]
};
