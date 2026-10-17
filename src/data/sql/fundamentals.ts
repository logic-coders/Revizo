import { Category } from "@/types";

export const sqlFundamentalsCategory: Category = {
  id: "sql-fundamentals",
  title: "SQL Fundamentals & Core Execution",
  icon: "📁",
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
            usedInProduction: "SaaS multi-tenant architectures use compound primary keys (tenant_id, id) for partition isolation while placing unique constraints on (tenant_id, email).",
            relatedTopics: ["Clustered vs Non-Clustered Indexes", "Database Normalization"]
          }
        },
        {
          id: "sql-three-valued-logic",
          question: "How does Three-Valued Logic (3VL) work in SQL, and what is the difference between NULL, Empty String (''), and Zero (0)?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "SQL implements Three-Valued Logic with truth states: TRUE, FALSE, and UNKNOWN. NULL represents 'missing or unknown value'. Comparing anything to NULL using = or != results in UNKNOWN, which WHERE clauses treat as FALSE.",
            mentalModel: "Zero is having $0 in your wallet (a known value: empty). Empty string is an empty text box on a form that someone explicitly cleared. NULL is not knowing whether the person even owns a wallet or has a name.",
            whatItIs: "In standard mathematics logic is binary (TRUE or FALSE). E.F. Codd designed SQL with ternary logic (TRUE, FALSE, UNKNOWN) because databases must represent missing, uncollected, or inapplicable real-world data.",
            whyItExists: "Without NULL semantics, applications would be forced to use sentinel values like -1, 9999-12-31, or 'N/A', which corrupt mathematical aggregations (e.g., AVG(salary) would include -1).",
            comparisonTable: {
              title: "Head-to-Head Comparison: NULL vs Empty String ('') vs Zero (0)",
              headers: ["Attribute / Behavior", "NULL", "Empty String ('')", "Numeric Zero (0)"],
              rows: [
                ["Meaning", "Missing, unknown, or inapplicable value", "Known string value containing zero characters", "Known integer/numeric quantity equal to 0"],
                ["Data Type", "Type-agnostic (can exist in any column)", "String/Text types (VARCHAR, CHAR, TEXT)", "Numeric types (INT, NUMERIC, FLOAT)"],
                ["Comparison (= value)", "NULL = NULL evaluates to UNKNOWN", "'' = '' evaluates to TRUE", "0 = 0 evaluates to TRUE"],
                ["IS NULL Check", "IS NULL evaluates to TRUE", "IS NULL evaluates to FALSE", "IS NULL evaluates to FALSE"],
                ["Aggregate (COUNT)", "COUNT(col) ignores it completely", "COUNT(col) counts it as a valid row", "COUNT(col) counts it as a valid row"],
                ["Aggregate (SUM / AVG)", "Ignored in calculation", "Incompatible type (string)", "Included (adds 0 to sum, increments denominator)"],
                ["Storage Size", "1 bit in null bitmap header per row", "1 or 2 bytes length prefix (in VARCHAR)", "2 to 8 bytes depending on numeric type"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. Three-Valued Logic Truth Table Trap:\nSELECT \n    CASE WHEN NULL = NULL THEN 'TRUE' ELSE 'NOT TRUE' END AS test1,        -- 'NOT TRUE' (evaluates to UNKNOWN)\n    CASE WHEN NULL IS NULL THEN 'TRUE' ELSE 'NOT TRUE' END AS test2,       -- 'TRUE'\n    CASE WHEN NOT (NULL = 5) THEN 'TRUE' ELSE 'NOT TRUE' END AS test3;    -- 'NOT TRUE' (NOT UNKNOWN is still UNKNOWN!)\n\n-- 2. Trap in WHERE Clause:\n-- If status has values: 'ACTIVE', 'INACTIVE', and NULL:\nSELECT COUNT(*) FROM users WHERE status <> 'ACTIVE';\n-- SURPRISE: This will NOT return users with status NULL!\n-- Fix with NULL check or COALESCE:\nSELECT COUNT(*) FROM users WHERE status <> 'ACTIVE' OR status IS NULL;"
            },
            tradeoffs: "Every nullable column requires a bit in the null bitmap of the table row header. Nullable columns can also prevent certain index optimizations and make join cardinality estimations less predictable for query planners.",
            followUpQuestions: [
              {
                question: "What is the difference between COALESCE and NULLIF?",
                answer: "COALESCE(val1, val2, ...) returns the first non-null argument in the list. NULLIF(val1, val2) returns NULL if val1 equals val2, otherwise returns val1. NULLIF is commonly used to prevent division by zero: amount / NULLIF(total, 0)."
              }
            ],
            usedInProduction: "Fintech payment ledgers enforce strict NOT NULL constraints with DEFAULT values on financial amount columns to mathematically avoid UNKNOWN propagation during accounting reconciliations.",
            relatedTopics: ["WHERE vs HAVING", "COUNT(*) vs COUNT(column)", "NOT IN vs NOT EXISTS"]
          }
        },
        {
          id: "sql-not-in-vs-not-exists",
          question: "What is the critical difference between NOT IN and NOT EXISTS when dealing with NULL values?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "If a subquery contains even a single NULL value, NOT IN returns zero rows (empty result set) due to 3-valued logic. NOT EXISTS evaluates row existence and safely handles NULLs without returning empty sets.",
            mentalModel: "NOT IN asks: 'Is X different from EVERY value in this list?'. If the list has a NULL, SQL says: 'I don't know what that NULL is, so I can't be sure X is different from it!' (UNKNOWN, so rejected). NOT EXISTS simply asks: 'Did the subquery find any matching row?' (TRUE or FALSE, never UNKNOWN).",
            whatItIs: "Both are SQL constructs used to write anti-joins (finding records in table A that have no counterpart in table B). However, their handling of NULLs and query execution strategies differ drastically.",
            whyItExists: "Understanding this difference is one of the most common senior SQL interview tests because a single NULL in a lookup table can silently cause a production query with NOT IN to return 0 records instead of thousands.",
            comparisonTable: {
              title: "Head-to-Head Comparison: NOT IN vs NOT EXISTS vs LEFT JOIN / IS NULL",
              headers: ["Feature / Dimension", "NOT IN (Subquery)", "NOT EXISTS (Correlated Subquery)", "LEFT JOIN ... WHERE col IS NULL"],
              rows: [
                ["NULL in Subquery Behavior", "FATAL TRAP: If subquery returns >= 1 NULL, outer query returns 0 rows", "SAFE: Correctly ignores NULLs and returns unmatched rows", "SAFE: Correctly handles NULLs"],
                ["Logic Model", "Ternary logic (x NOT IN (1, NULL) → UNKNOWN → False)", "Boolean existence test (EXISTS returns TRUE or FALSE)", "Relational set difference via outer join"],
                ["Execution Plan", "Often Materialize or SubPlan; engine must verify absence of NULLs", "Anti-Join plan (Hash Anti-Join or Merge Anti-Join)", "Hash Left Join followed by Filter (col IS NULL)"],
                ["Performance", "Often slowest when optimizer cannot prove column is NOT NULL", "Fastest in PostgreSQL and Oracle (stops on first match)", "Very fast, idiomatic in MySQL 5.7+"],
                ["Index Usage", "Can struggle if column is nullable", "Effectively leverages indexes on the correlated join key", "Effectively leverages indexes on foreign key"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Table: departments (id, name)\n-- Table: employees (id, name, department_id) -- department_id contains [10, 20, NULL]\n\n-- ========================================================\n-- 1. THE NOT IN NULL TRAP (Returns 0 rows!):\n-- ========================================================\nSELECT name \nFROM departments \nWHERE id NOT IN (SELECT department_id FROM employees); \n-- Evaluates to: id <> 10 AND id <> 20 AND id <> NULL\n-- Because anything <> NULL is UNKNOWN, the entire WHERE clause becomes UNKNOWN!\n\n-- ========================================================\n-- 2. THE PRODUCTION STANDARD: NOT EXISTS (Safe & Fast!):\n-- ========================================================\nSELECT d.name \nFROM departments d\nWHERE NOT EXISTS (\n    SELECT 1 \n    FROM employees e \n    WHERE e.department_id = d.id\n);\n\n-- ========================================================\n-- 3. ALTERNATIVE: LEFT JOIN with IS NULL:\n-- ========================================================\nSELECT d.name\nFROM departments d\nLEFT JOIN employees e ON d.id = e.department_id\nWHERE e.id IS NULL;"
            },
            tradeoffs: "If the subquery column is explicitly declared NOT NULL, the query optimizer can rewrite NOT IN as a Hash Anti-Join. But in production code, always default to NOT EXISTS for defensive programming.",
            followUpQuestions: [
              {
                question: "Why does SELECT 1 inside NOT EXISTS matter?",
                answer: "The projection inside EXISTS / NOT EXISTS is completely ignored by the query planner. Writing SELECT 1, SELECT *, or SELECT NULL has identical performance because the engine only checks for row presence."
              }
            ],
            usedInProduction: "Re-engagement batch jobs in marketing databases use NOT EXISTS to select customers who have made purchases previously but have zero orders in the last 90 days.",
            relatedTopics: ["Three-Valued Logic", "SQL Joins", "Query Optimization"]
          }
        },
        {
          id: "sql-char-varchar-text",
          question: "What is the difference between CHAR, VARCHAR, and TEXT in relational databases?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "CHAR is fixed-length and space-padded on disk; VARCHAR is variable-length with a length limit and byte prefix; TEXT is variable-length with unlimited (or multi-gigabyte) length stored inline or out-of-line (TOAST/LOB).",
            mentalModel: "CHAR(10) is a parking spot with exactly 10 slots: if you park a bicycle in it, the remaining 9 spots remain reserved and empty. VARCHAR(10) is an expandable elastic bag that only takes up as much room as what you put inside it, up to 10 items. TEXT is a bottomless storage warehouse.",
            whatItIs: "These are string data types in relational database engines (PostgreSQL, MySQL, SQL Server) that define how textual characters are stored, indexed, and retrieved on disk pages.",
            whyItExists: "Fixed-length columns allow direct arithmetic offset calculation on disk pages, while variable-length types conserve disk storage and buffer pool memory when data sizes vary widely.",
            comparisonTable: {
              title: "Head-to-Head Comparison: CHAR vs VARCHAR vs TEXT",
              headers: ["Feature / Dimension", "CHAR(N)", "VARCHAR(N)", "TEXT / CLOB"],
              rows: [
                ["Length Type", "Fixed length (always allocates N characters)", "Variable length (up to N characters)", "Variable length (unbounded, typically up to 1GB - 4GB)"],
                ["Padding Behavior", "Padded with trailing spaces to length N", "No padding; stores exact string length", "No padding; stores exact string length"],
                ["Storage Overhead", "Zero prefix overhead (fixed bytes)", "1 byte overhead (if N <= 255) or 2 bytes", "4 bytes header / pointer to LOB/TOAST table"],
                ["Memory Sort Buffers", "Allocates fixed N bytes in sort buffers", "Postgres allocates actual size; MySQL/MariaDB may pre-allocate max N bytes in memory temp tables", "Stored off-page; cannot be fully buffered in standard sort slots"],
                ["Index Key Limit", "Fully indexable", "Fully indexable (up to B-Tree index page limits)", "Cannot be fully indexed in standard B-Tree without prefix length or hashing"],
                ["Best Used For", "Fixed codes: ISO country codes ('US', 'IN'), MD5/SHA256 hashes, UUID strings", "Short variable text: user names, emails, URLs, titles", "Long content: blog posts, JSON blobs, descriptions, audit logs"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "CREATE TABLE product_catalog (\n    product_sku CHAR(8) NOT NULL,          -- Always exactly 8 chars (e.g., 'PROD1234')\n    country_code CHAR(2) NOT NULL,         -- ISO 3166-1 alpha-2 ('US', 'CA', 'GB')\n    title VARCHAR(255) NOT NULL,           -- Variable title, max 255 characters\n    description TEXT,                      -- Large rich text description (unbounded)\n    created_at TIMESTAMP DEFAULT NOW()\n);"
            },
            tradeoffs: "In PostgreSQL, CHAR, VARCHAR, and TEXT use the exact same underlying `varlena` storage engine, so CHAR(N) offers zero performance advantage and wastes space. In MySQL, however, fixed-length CHAR rows can improve in-memory table operations.",
            followUpQuestions: [
              {
                question: "What is TOAST in PostgreSQL?",
                answer: "The Oversized-Attribute Storage Technique (TOAST) automatically compresses large values (> 2KB) and splits them into chunks stored in a secondary TOAST table, keeping main data pages compact and fast for sequential scans."
              }
            ],
            usedInProduction: "Security services store bcrypt password hashes ($2a$12$...) and UUIDs in CHAR(60) or CHAR(36) because lengths are strictly uniform, while user profiles use VARCHAR(255) for email.",
            relatedTopics: ["Storage & Indexing", "Primary Key vs Unique Key"]
          }
        },
        {
          id: "sql-normalization-forms",
          question: "What is the difference between 1NF, 2NF, 3NF, and BCNF in Database Normalization, and when should you Denormalize?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "1NF enforces atomic values and no repeating groups; 2NF eliminates partial dependencies on composite keys; 3NF eliminates transitive dependencies (non-key determining non-key); BCNF ensures every determinant is a candidate key. Denormalization is applied intentionally to eliminate expensive JOINs in read-heavy analytical workloads.",
            mentalModel: "Think of an address book: 1NF means putting one phone number per line instead of comma-separated numbers in a single box. 2NF means separating customer info from order info so you don't repeat customer address on every line item. 3NF means moving Zip Code → City/State into a separate lookup table so city doesn't depend on zip. Denormalization is putting the customer's full name right on the shipping invoice so the delivery truck driver doesn't have to look up three separate binders.",
            whatItIs: "Normalization is a formal database design technique based on relational algebra and functional dependencies that organizes tables to minimize data redundancy and prevent insertion, update, and deletion anomalies.",
            whyItExists: "Without normalization, updating a customer's address requires updating 1,000 historical order rows. If an update fails halfway, the database becomes corrupt with conflicting addresses (Update Anomaly).",
            comparisonTable: {
              title: "Head-to-Head Comparison: Normal Forms (1NF → 2NF → 3NF → BCNF)",
              headers: ["Normal Form", "Core Rule / Condition", "Anomaly Eliminated", "Practical Real-World Test"],
              rows: [
                ["1NF (First Normal Form)", "Atomic values per column, unique row identity (PK), no repeating arrays/groups", "Cannot query multi-valued attributes efficiently", "No comma-separated values like 'Java, SQL, Spring' in a single cell"],
                ["2NF (Second Normal Form)", "Must be in 1NF + NO partial dependencies (every non-key attribute depends on WHOLE composite PK)", "Redundant non-key data repeated across composite keys", "If PK is (order_id, product_id), product_name cannot be stored in this table"],
                ["3NF (Third Normal Form)", "Must be in 2NF + NO transitive dependencies (non-key attributes depend ONLY on candidate keys)", "Update and Deletion anomalies on indirectly related attributes", "Column A determines Column B, and Column B determines Column C (e.g., zip_code → city)"],
                ["BCNF (Boyce-Codd)", "Must be in 3NF + every determinant in every functional dependency must be a Candidate Key", "Anomalies in tables with multiple overlapping composite candidate keys", "Strict extension of 3NF for multi-key dependencies"],
                ["Denormalization", "Deliberately re-introducing redundancy into tables", "Trades write speed and storage to eliminate multi-table JOINs", "Pre-computing total_amount on orders table or storing user_name on comments table"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. UNNORMALIZED (Violates 1NF with comma-separated tags):\n-- orders (order_id, customer_name, items: 'Laptop, Mouse, Keyboard')\n\n-- 2. NORMALIZED TO 3NF (Relational Architecture):\nCREATE TABLE customers (\n    customer_id BIGINT PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    email VARCHAR(255) NOT NULL UNIQUE\n);\n\nCREATE TABLE orders (\n    order_id BIGINT PRIMARY KEY,\n    customer_id BIGINT REFERENCES customers(customer_id),\n    order_date TIMESTAMP NOT NULL\n);\n\nCREATE TABLE order_items (\n    order_id BIGINT REFERENCES orders(order_id),\n    product_id BIGINT REFERENCES products(product_id),\n    quantity INT NOT NULL,\n    unit_price NUMERIC(10, 2) NOT NULL,\n    PRIMARY KEY (order_id, product_id) -- Composite PK\n);\n\n-- 3. CONTROLLED DENORMALIZATION for High-Throughput Analytics:\nALTER TABLE orders ADD COLUMN cached_total_amount NUMERIC(12, 2);"
            },
            tradeoffs: "High normalization (3NF/BCNF) optimizes write-heavy OLTP databases with fast INSERTs and zero duplicate data. However, reporting queries require 8-10 table JOINs. Read-heavy OLAP data warehouses (Snowflake, BigQuery) use Star Schemas with denormalized fact and dimension tables.",
            followUpQuestions: [
              {
                question: "What is an Update Anomaly?",
                answer: "An update anomaly occurs in unnormalized schemas where a piece of information (like a supplier's phone number) is duplicated across hundreds of product rows. Updating the phone number on some rows but missing others causes contradictory data."
              }
            ],
            usedInProduction: "Amazon and Uber use 3NF relational schemas for their core transactional booking engines, while streaming CDC events into denormalized columnar data lakes for real-time dashboards.",
            relatedTopics: ["Primary Key vs Unique Key", "Joins & Aggregations", "Performance & Indexing"]
          }
        },
        {
          id: "sql-foreign-key-actions",
          question: "What is the difference between ON DELETE CASCADE, ON DELETE SET NULL, and ON DELETE RESTRICT in SQL Foreign Keys?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "ON DELETE CASCADE automatically deletes all dependent child rows when the parent row is deleted; ON DELETE SET NULL updates child foreign key columns to NULL; ON DELETE RESTRICT (or NO ACTION) halts and aborts the deletion if child rows exist.",
            mentalModel: "Think of an employer and company laptops. CASCADE: if the company shuts down, all issued laptops are thrown in the trash. SET NULL: if the company shuts down, employees keep the laptops and they become unassigned personal laptops. RESTRICT: the company cannot shut down until every single laptop has been returned first.",
            whatItIs: "Referential actions defined on SQL FOREIGN KEY constraints that tell the relational engine how to automatically maintain referential integrity when a referenced parent record is deleted or updated.",
            whyItExists: "Without referential actions, deleting a customer record would leave orphaned order records pointing to non-existent customer IDs, corrupting database integrity.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Foreign Key Referential Delete Actions",
              headers: ["Action Clause", "Child Row Behavior on Parent Delete", "Child Column Nullability Requirement", "Production Safety Level", "Common Use Case"],
              rows: [
                ["ON DELETE CASCADE", "Child rows are automatically deleted", "Can be NOT NULL or NULL", "HIGH RISK (Accidental parent delete wipes out thousands of child rows)", "Parent-child containment (Order → OrderItems, Post → Comments)"],
                ["ON DELETE SET NULL", "Foreign key column in child rows is set to NULL", "Must allow NULL (cannot be NOT NULL)", "MODERATE (Preserves child historical records while disassociating)", "Audit logs, soft-deleted user assignments (Tickets → AssignedUser)"],
                ["ON DELETE RESTRICT", "Immediate error: aborts delete if any child row references parent", "Can be NOT NULL or NULL", "HIGHEST SAFETY (Prevents accidental data loss)", "Core master data (Customers → Bank Accounts, Country Codes)"],
                ["ON DELETE NO ACTION", "Deferred check: raises error at end of statement/transaction if references remain", "Can be NOT NULL or NULL", "HIGHEST SAFETY (Standard SQL default)", "PostgreSQL default; allows deferred constraint checking inside transactions"],
                ["ON DELETE SET DEFAULT", "Child foreign key column is reset to its column DEFAULT value", "Default value must exist in parent table", "LOW", "Fallback system assignment (AssignedAgent → DefaultQueue)"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. CASCADE: Deleting an order wipes its line items\nCREATE TABLE order_items (\n    item_id BIGINT PRIMARY KEY,\n    order_id BIGINT NOT NULL,\n    product_name VARCHAR(100),\n    CONSTRAINT fk_order FOREIGN KEY (order_id) \n        REFERENCES orders(order_id) ON DELETE CASCADE\n);\n\n-- 2. SET NULL: Deleting an employee leaves support tickets unassigned\nCREATE TABLE tickets (\n    ticket_id BIGINT PRIMARY KEY,\n    assigned_to BIGINT NULL,\n    title VARCHAR(200),\n    CONSTRAINT fk_assignee FOREIGN KEY (assigned_to) \n        REFERENCES employees(id) ON DELETE SET NULL\n);\n\n-- 3. RESTRICT: Cannot delete a department if employees still work in it\nALTER TABLE employees \nADD CONSTRAINT fk_dept FOREIGN KEY (department_id) \n    REFERENCES departments(id) ON DELETE RESTRICT;"
            },
            tradeoffs: "CASCADE deletes can trigger recursive cascading deletes down 5 levels of foreign keys, taking exclusive locks on dozens of tables and causing massive transaction timeouts or deadlocks in high-traffic OLTP systems.",
            followUpQuestions: [
              {
                question: "What is the difference between RESTRICT and NO ACTION in PostgreSQL?",
                answer: "RESTRICT enforces the check immediately. NO ACTION can be declared as DEFERRABLE INITIALLY DEFERRED, meaning the referential check is delayed until COMMIT time, allowing temporary violations within the transaction."
              }
            ],
            usedInProduction: "Enterprise platforms avoid CASCADE on critical financial tables; instead, they implement soft deletes (`is_deleted = TRUE` or `deleted_at`) with RESTRICT to guarantee auditability.",
            relatedTopics: ["Primary Key vs Unique Key", "ACID Transactions", "Database Normalization"]
          }
        }
      ]
    }
  ]
};
