import { Category } from "@/types";

export const sqlPerformanceIndexingCategory: Category = {
  id: "sql-performance-indexing",
  title: "Performance, Indexing & Optimization",
  icon: "⚡",
  subTopics: [
    {
      id: "sql-indexing",
      title: "B-Tree Indexes & Query Tuning",
      questions: [
        {
          id: "sql-clustered-vs-nonclustered",
          question: "What is the difference between a Clustered Index and a Non-Clustered (Secondary) Index?",
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
        }
      ]
    }
  ]
};
