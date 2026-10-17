import { Category } from "@/types";

export const sqlWindowFunctionsCategory: Category = {
  id: "sql-window-functions",
  title: "Window Functions & Analytical SQL",
  icon: "🪟",
  subTopics: [
    {
      id: "sql-window-advanced",
      title: "Analytical Windowing, Frames & Classic LeetCode Patterns",
      questions: [
        {
          id: "sql-running-total-moving-avg",
          question: "How do you calculate a Running Total and a 7-day Moving Average in SQL using Window Framing?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "A running total uses `SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`. A 7-day moving average uses `AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`.",
            mentalModel: "Think of an accountant with an adding machine: for every transaction on the tape, they add it to the running sum of all previous numbers printed above it. For a moving average, they only sum the last 7 lines and divide by 7.",
            whatItIs: "Window frame clauses (`ROWS` or `RANGE BETWEEN ... AND ...`) specify the dynamic subset of rows within the partition that are passed to the aggregate function for each evaluated row.",
            whyItExists: "Before window frames, computing running totals required quadratic self-joins (`JOIN ON b.date <= a.date`) which ground database systems to a halt on datasets over 10,000 rows.",
            comparisonTable: {
              title: "Head-to-Head Comparison: ROWS vs RANGE vs GROUPS Window Framing",
              headers: ["Frame Type", "Units of Measure", "Duplicate Value Handling in ORDER BY", "Default Frame Specification", "Performance"],
              rows: [
                ["ROWS", "Physical row count (e.g., 6 PRECEDING)", "Treats peer/tied rows as separate individual units", "Explicit specification required", "Fastest: straight pointer arithmetic"],
                ["RANGE", "Logical value offset of ORDER BY expression", "COLLAPSES PEER ROWS: treats identical values as a single unit", "Default when ORDER BY is present: `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`", "Can be slower; requires checking values of peer rows"],
                ["GROUPS", "Groups of tied peer rows", "Treats each distinct peer group as 1 step offset", "Available in PostgreSQL 11+, SQLite 3.28+", "Moderately fast"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 1. Running Total (Cumulative Balance):\nSELECT \n    transaction_id,\n    account_id,\n    trans_date,\n    amount,\n    SUM(amount) OVER (\n        PARTITION BY account_id \n        ORDER BY trans_date \n        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n    ) AS running_balance\nFROM transactions;\n\n-- 2. 7-Day Moving Average of Daily Revenue:\nSELECT \n    sales_date,\n    daily_revenue,\n    ROUND(AVG(daily_revenue) OVER (\n        ORDER BY sales_date \n        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n    ), 2) AS moving_avg_7d\nFROM daily_sales\nORDER BY sales_date;"
            },
            tradeoffs: "The default window frame when `ORDER BY` is present without an explicit frame is `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. If there are duplicate dates, RANGE sums all matching duplicates together on every peer row rather than accumulating row-by-row. Always write `ROWS BETWEEN` for running totals.",
            followUpQuestions: [
              {
                question: "What is the difference between UNBOUNDED PRECEDING and CURRENT ROW?",
                answer: "UNBOUNDED PRECEDING starts the frame at the very first row of the partition. CURRENT ROW ends the frame at the current row being processed, preventing future rows from being included."
              }
            ],
            usedInProduction: "Fintech core banking systems and Robinhood stock portfolio charts compute cumulative user net worth and 50-day / 200-day Simple Moving Averages (SMA) using window frames.",
            relatedTopics: ["Window Functions Overview", "LAG & LEAD", "Performance Tuning"]
          }
        },
        {
          id: "sql-top-n-per-category",
          question: "How do you find the Top N records per category (e.g., Top 3 highest paid employees in each department)?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "Partition by category and order by metric descending inside a CTE with `DENSE_RANK()` or `ROW_NUMBER()`, then filter the outer query `WHERE rank <= N`.",
            mentalModel: "Think of an Olympic gymnastics competition: each country has its own team (PARTITION BY). The judges score each athlete from highest to lowest (ORDER BY DESC). You award medals to the top 3 gymnasts from each country (WHERE rank <= 3).",
            whatItIs: "One of the top 3 most frequently tested SQL interview patterns at Meta, Amazon, and Google. It tests ability to group data without collapsing rows, handle ties, and filter on window output.",
            whyItExists: "A standard `GROUP BY` with `MAX()` only returns the single highest value. It cannot retrieve the top 3, nor can it preserve associated columns like the employee's name, hire date, or title.",
            comparisonTable: {
              title: "Top N Per Category: Ranking Function Selection Matrix",
              headers: ["Function Used", "Tie Handling", "Result Count Guarantee", "When to Choose"],
              rows: [
                ["DENSE_RANK()", "Ties get same rank; next rank is contiguous", "May return > N rows if ties exist for rank N", "Best for compensation tiers / top salary brackets where all tied earners deserve inclusion"],
                ["ROW_NUMBER()", "Ties broken arbitrarily (or via tiebreaker column)", "Guarantees EXACTLY at most N rows per group", "Best for UI pagination, displaying exactly top 3 cards per category"],
                ["RANK()", "Ties get same rank; skips subsequent ranks", "Can return fewer or more rows unpredictably", "Competitive tournament leaderboards (Olympic medal rules)"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Top 3 Highest Paid Employees per Department:\nWITH RankedEmployees AS (\n    SELECT \n        employee_id,\n        name,\n        department_id,\n        salary,\n        DENSE_RANK() OVER (\n            PARTITION BY department_id \n            ORDER BY salary DESC\n        ) AS salary_rank\n    FROM employees\n)\nSELECT \n    department_id,\n    salary_rank,\n    name,\n    salary\nFROM RankedEmployees\nWHERE salary_rank <= 3\nORDER BY department_id, salary_rank, name;"
            },
            tradeoffs: "Window functions cannot be placed directly in the WHERE clause (`WHERE DENSE_RANK() <= 3` is a syntax error) because WHERE executes before SELECT. You must wrap the query in a CTE or derived table subquery.",
            followUpQuestions: [
              {
                question: "How can you optimize a Top N Per Category query on massive tables?",
                answer: "Create a composite index on `(category_column, metric_column DESC)`. In PostgreSQL and MySQL 8+, this allows the engine to perform an Index Skip Scan or loose index scan, stopping after finding N rows per group."
              }
            ],
            usedInProduction: "E-commerce search engines use Top N per category to display the 4 best-selling products under each category shelf on the home page.",
            relatedTopics: ["ROW_NUMBER vs RANK vs DENSE_RANK", "Nth Highest Salary", "Composite Indexes"]
          }
        },
        {
          id: "sql-islands-and-gaps-streak",
          question: "How do you solve the classic 'Islands and Gaps' problem to calculate consecutive active daily login streaks?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "The most elegant solution is the 'Difference of Two Sequences' technique: subtract `ROW_NUMBER()` days from each consecutive event date. Consecutive dates increment at the exact same pace as row numbers, resulting in a constant anchor date for the island.",
            mentalModel: "Imagine you count days [Day 10, Day 11, Day 12]. If you subtract row numbers [1, 2, 3] respectively, you get [Day 9, Day 9, Day 9]. Every consecutive streak produces an identical anchor date! If there is a 3-day gap to Day 16, subtracting row #4 gives Day 12 (a new island anchor).",
            whatItIs: "A classic SQL algorithmic challenge: 'Islands' are contiguous sequences of consecutive records (e.g., consecutive days a user logged in); 'Gaps' are the missing intervals between islands.",
            whyItExists: "Gamification features (Duolingo streak, Snapchat streaks, GitHub contribution streaks) require identifying unbroken streaks across millions of daily user log events.",
            comparisonTable: {
              title: "Islands & Gaps Solving Techniques Compared",
              headers: ["Technique", "Algorithm Complexity", "RDBMS Compatibility", "Code Complexity", "Best Suited For"],
              rows: [
                ["Row Number Difference (Date - ROW_NUMBER)", "O(N log N) single window sort", "Universal (Postgres, MySQL 8+, SQL Server, Oracle)", "Low (~10 lines of SQL)", "Continuous date streaks (daily logins, attendance)"],
                ["LAG / LEAD State Change + Running Sum", "O(N log N) two-pass window", "Universal across modern SQL engines", "Moderate (~15 lines)", "Threshold-based states (temperature > 100°F bursts)"],
                ["Self-Join (Cartesian interval overlap)", "O(N^2) quadratic nested loops", "Legacy SQL without window functions", "High, prone to performance failure", "Never use in modern production"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Calculate User Consecutive Login Streaks:\nWITH DistinctUserLogins AS (\n    -- Step 1: Deduplicate multiple logins on the same day\n    SELECT DISTINCT user_id, CAST(login_time AS DATE) AS login_date\n    FROM user_logins\n),\nStreakGroups AS (\n    -- Step 2: Compute Island Group Anchor\n    SELECT \n        user_id,\n        login_date,\n        login_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) * INTERVAL '1 day') AS streak_group\n    FROM DistinctUserLogins\n),\nStreakLengths AS (\n    -- Step 3: Aggregate streak length per island\n    SELECT \n        user_id,\n        MIN(login_date) AS streak_start,\n        MAX(login_date) AS streak_end,\n        COUNT(*) AS consecutive_days\n    FROM StreakGroups\n    GROUP BY user_id, streak_group\n)\n-- Step 4: Find longest streak per user\nSELECT user_id, MAX(consecutive_days) AS longest_streak\nFROM StreakLengths\nGROUP BY user_id\nORDER BY longest_streak DESC;"
            },
            tradeoffs: "Always deduplicate multiple events occurring on the same day before computing `ROW_NUMBER()`. If a user logs in 3 times in one day, identical dates with different row numbers will destroy the arithmetic difference anchor.",
            followUpQuestions: [
              {
                question: "How do you find only the CURRENT active streak (streak including today)?",
                answer: "Filter the grouped streaks WHERE streak_end >= CURRENT_DATE - INTERVAL '1 day'. If the user's latest streak did not end today or yesterday, their active streak has broken."
              }
            ],
            usedInProduction: "Duolingo and fitness tracking apps compute daily user streak badges and notify users before midnight if their current streak is about to expire.",
            relatedTopics: ["LAG & LEAD", "Window Framing", "Logical Execution Order"]
          }
        },
        {
          id: "sql-ntile-cumedist-percentrank",
          question: "What is the difference between NTILE(), CUME_DIST(), and PERCENT_RANK() in analytical SQL?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "NTILE(N) divides rows into N equal-sized numbered buckets (1 to N); CUME_DIST() calculates the cumulative distribution fraction (number of rows <= current / total rows); PERCENT_RANK() calculates relative rank percentile ((rank - 1) / (total - 1)).",
            mentalModel: "NTILE(4) divides students into 4 letter-grade buckets (Quartiles: 1, 2, 3, 4). CUME_DIST tells you: 'You scored higher than or equal to 85% of test takers'. PERCENT_RANK tells you your percentile score on a standardized exam (0.0 to 1.0).",
            whatItIs: "Statistical and distribution window functions in standard SQL used to segment datasets into quantiles, percentiles, and cumulative distributions.",
            whyItExists: "Financial portfolios, credit scoring systems, and sales incentives require categorizing records into deciles (top 10%) or computing exact statistical percentiles.",
            comparisonTable: {
              title: "Head-to-Head Comparison: NTILE vs CUME_DIST vs PERCENT_RANK",
              headers: ["Function", "Output Range", "Formula / Logic", "Tie Handling", "Typical Business Use"],
              rows: [
                ["NTILE(n)", "Integers from 1 to n", "Divides sorted rows into n equal buckets; larger buckets get extra row if uneven", "Can place tied values into different adjacent buckets", "Quartiles (4), Deciles (10), Percentiles (100)"],
                ["CUME_DIST()", "0 < value <= 1.0", "Number of peer rows <= current row / Total rows in partition", "Ties always receive the EXACT SAME cumulative distribution value", "Market share coverage, SLA compliance %"],
                ["PERCENT_RANK()", "0.0 <= value <= 1.0", "(Rank - 1) / (Total rows - 1) (First row is always 0.0)", "Ties always receive the exact same percentile rank", "Standardized test score percentiles, credit risk tiering"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "SELECT \n    customer_id,\n    total_spend,\n    -- Segment customers into 4 spending tiers (1 = Top Spenders):\n    NTILE(4) OVER (ORDER BY total_spend DESC) AS spend_quartile,\n    -- Cumulative distribution (fraction of customers who spend <= current):\n    ROUND(CUME_DIST() OVER (ORDER BY total_spend)::numeric, 4) AS cume_dist,\n    -- Relative percentile rank (0.0 to 1.0):\n    ROUND(PERCENT_RANK() OVER (ORDER BY total_spend)::numeric, 4) AS percentile_rank\nFROM customer_lifetime_value\nORDER BY total_spend DESC;"
            },
            tradeoffs: "Be cautious with NTILE when ties exist: because NTILE strictly enforces equal bucket sizes, two customers with the exact same purchase amount can be split across bucket 1 and bucket 2. Use CUME_DIST or DENSE_RANK if ties must share tier assignment.",
            followUpQuestions: [
              {
                question: "What does NTILE(4) do if there are 10 rows?",
                answer: "It distributes rows into bucket sizes: [3, 3, 2, 2]. The extra 2 rows are allocated to the first two buckets (1 and 2)."
              }
            ],
            usedInProduction: "Credit card underwriting algorithms use NTILE(10) to segment loan applicants into 10 risk deciles to assign interest rates.",
            relatedTopics: ["ROW_NUMBER vs RANK vs DENSE_RANK", "Window Functions Overview"]
          }
        },
        {
          id: "sql-first-last-nth-value",
          question: "What is the difference between FIRST_VALUE(), LAST_VALUE(), and NTH_VALUE(), and why does LAST_VALUE() often return unexpected results?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "FIRST_VALUE() returns the first value in the window frame; LAST_VALUE() returns the last value in the window frame; NTH_VALUE(col, N) returns the Nth value. LAST_VALUE() frequently returns the CURRENT row's value because the default window frame stops at CURRENT ROW!",
            mentalModel: "If you walk down a hallway looking at doors, FIRST_VALUE is remembering the first door you passed at the entrance. LAST_VALUE is supposed to be the door at the end of the hall, but because your field of view (window frame) stops at your feet (CURRENT ROW), you keep reporting the door you are currently standing next to!",
            whatItIs: "Window value functions that retrieve values from specific relative ordinal positions within a defined window partition frame.",
            whyItExists: "Comparing each row against the baseline first event (e.g., initial signup attribution channel) or the eventual final event (e.g., last touch before purchase conversion).",
            comparisonTable: {
              title: "Head-to-Head Comparison: Window Value Functions",
              headers: ["Function", "Value Retrieved", "Default Frame Trap?", "Mandatory Frame Fix for Entire Partition"],
              rows: [
                ["FIRST_VALUE(col)", "First row value in the window frame", "No trap: first row is always in frame", "Works correctly with default frame"],
                ["LAST_VALUE(col)", "Last row value in the window frame", "MAJOR TRAP: Default frame stops at CURRENT ROW, so it returns current value!", "Must explicitly add: `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`"],
                ["NTH_VALUE(col, n)", "Value at exact ordinal position n", "May return NULL if n-th row has not been reached yet", "Must add `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` to see future N"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- The LAST_VALUE() Gotcha and How to Fix It:\nSELECT \n    emp_name,\n    department,\n    salary,\n    -- Correct: Returns highest salary in dept\n    FIRST_VALUE(emp_name) OVER (\n        PARTITION BY department ORDER BY salary DESC\n    ) AS highest_paid_emp,\n    \n    -- BUGGY: Returns CURRENT ROW emp_name because default frame stops at CURRENT ROW!\n    LAST_VALUE(emp_name) OVER (\n        PARTITION BY department ORDER BY salary DESC\n    ) AS buggy_lowest_paid,\n    \n    -- FIXED: Frame expanded to span entire partition!\n    LAST_VALUE(emp_name) OVER (\n        PARTITION BY department ORDER BY salary DESC\n        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\n    ) AS correct_lowest_paid\nFROM employees;"
            },
            tradeoffs: "Expanding the window frame with `UNBOUNDED FOLLOWING` requires the engine to buffer all partition rows in memory before emitting the first row, increasing memory footprint.",
            followUpQuestions: [
              {
                question: "How can you get the lowest paid employee without using LAST_VALUE?",
                answer: "Invert the sort order in FIRST_VALUE: FIRST_VALUE(emp_name) OVER (PARTITION BY department ORDER BY salary ASC). This avoids the LAST_VALUE frame pitfall entirely."
              }
            ],
            usedInProduction: "Marketing attribution engines track multi-touch journeys: `FIRST_VALUE(campaign)` identifies first-touch acquisition channel, while `LAST_VALUE(campaign)` identifies conversion closing channel.",
            relatedTopics: ["Running Total & Moving Averages", "LAG & LEAD", "Window Framing"]
          }
        },
        {
          id: "sql-user-sessionization-30min",
          question: "How do you implement User Sessionization with a 30-minute inactivity timeout in SQL?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "Use `LAG()` to compute the time elapsed since the previous event. If elapsed time > 30 minutes (or first event), flag it as 1 else 0. Then compute a running sum `SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY event_time)` to create a unique session ID.",
            mentalModel: "Imagine a turnstile counter. Every time a customer walks through within 30 minutes of the previous person, the counter stays the same. If 30 minutes pass without anyone walking through, the turnstile clicks (+1), establishing a brand new session cohort.",
            whatItIs: "Sessionization transforms raw, stateless clickstream event logs into stateful user browsing sessions based on inactivity threshold boundaries (typically 30 minutes, the Google Analytics standard).",
            whyItExists: "Raw logs record individual button clicks and pageviews. Product analytics and attribution require grouping those clicks into discrete visit sessions to compute session duration and bounce rates.",
            comparisonTable: {
              title: "Sessionization Approaches Compared",
              headers: ["Technique", "Engine Support", "Scalability on Big Data", "Code Cleanliness"],
              rows: [
                ["Window Functions (LAG + Running SUM)", "Universal in modern SQL (Postgres, BigQuery, Snowflake, Spark)", "Excellent: scales linearly O(N log N) with partition by user", "High: clean 2-step CTE"],
                ["Self-Join on Time Ranges", "Universal across legacy engines", "Horrible: O(N^2) explosion of matching timestamp intervals", "Low, difficult to debug"],
                ["Procedural Loop / Python UDF", "Requires procedural PL/pgSQL or PySpark", "Slower serialization overhead across cluster", "Imperative state machine"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- 30-Minute Clickstream Sessionization Pipeline:\nWITH EventDelays AS (\n    SELECT \n        event_id, user_id, event_time, page_url,\n        -- Calculate time gap in minutes from previous event\n        EXTRACT(EPOCH FROM (event_time - LAG(event_time) OVER (\n            PARTITION BY user_id ORDER BY event_time\n        ))) / 60.0 AS minutes_since_last_event\n    FROM user_events\n),\nSessionFlags AS (\n    SELECT \n        *,\n        -- Flag 1 if first event (NULL) or inactive > 30 minutes\n        CASE \n            WHEN minutes_since_last_event IS NULL OR minutes_since_last_event > 30 THEN 1 \n            ELSE 0 \n        END AS is_new_session\n    FROM EventDelays\n)\n-- Create unique Session ID via running sum of session flags\nSELECT \n    event_id, user_id, event_time, page_url,\n    CONCAT(user_id, '_', SUM(is_new_session) OVER (\n        PARTITION BY user_id ORDER BY event_time\n    )) AS session_id\nFROM SessionFlags\nORDER BY user_id, event_time;"
            },
            tradeoffs: "If a user has 10 million events in a single partition, computing `SUM() OVER ()` can run into memory limits on a single worker node in distributed engines like Presto or Trino. Partitioning by `(user_id, event_date)` helps bound window memory.",
            followUpQuestions: [
              {
                question: "How do you calculate average session duration once session IDs are established?",
                answer: "Group by session_id: SELECT session_id, EXTRACT(EPOCH FROM (MAX(event_time) - MIN(event_time))) AS duration_seconds FROM sessionized_events GROUP BY session_id."
              }
            ],
            usedInProduction: "Google Analytics, Mixpanel, and Segment ingest millions of raw websocket click events per second and run scheduled dbt models using this exact LAG + cumulative sum pattern to rebuild sessions.",
            relatedTopics: ["LAG & LEAD", "Running Total & Moving Averages", "Islands & Gaps"]
          }
        },
        {
          id: "sql-window-aggregate-vs-group-by",
          question: "What is the difference between Window Aggregates (SUM() OVER ()) and Standard GROUP BY aggregates?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "GROUP BY collapses multiple rows into a single summary row per group, discarding individual row details; Window Aggregates calculate summary metrics over a partition while preserving every individual row in the result set.",
            mentalModel: "GROUP BY is a blender: you toss in 5 fruits and get 1 glass of smoothie (individual fruits disappear). A Window Aggregate is a sticker machine: you hand it 5 fruits and it slaps a label on each fruit telling you how much the entire basket weighs, while handing all 5 whole fruits back to you.",
            whatItIs: "Two distinct aggregation paradigms in SQL: grouped reduction (relational group-by) vs non-destructive analytical partitioning (windowing).",
            whyItExists: "Queries often require comparing an individual employee's salary against their department's average or total salary. With GROUP BY, this required an aggregate query joined back to the base table. Window aggregates do this in a single clean pass.",
            comparisonTable: {
              title: "Head-to-Head Comparison: Window Aggregates vs GROUP BY",
              headers: ["Feature / Dimension", "Window Aggregate (`SUM() OVER (...)`)", "Standard `GROUP BY` Clause"],
              rows: [
                ["Output Cardinality", "Preserves 100% of input rows (1 input row = 1 output row)", "Collapses rows: 1 output row per distinct group key"],
                ["Non-Grouped Columns", "Can project any column from base tables freely", "Cannot project un-aggregated columns not present in GROUP BY"],
                ["Syntax Location", "Written in SELECT projection or ORDER BY", "Dedicated clause after WHERE and before HAVING"],
                ["Execution Phase", "Phase 5: Evaluated during SELECT phase", "Phase 3: Evaluated before HAVING and SELECT"],
                ["Filtering Results", "Must wrap in CTE/subquery to filter on window result", "Filtered directly via HAVING clause in same query"],
                ["Primary Use Case", "Ratios, percentage of total, moving metrics alongside row detail", "Summary tables, dashboards, rollups"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: "-- Comparing Individual Salary to Department Total & Average:\nSELECT \n    emp_id,\n    name,\n    department,\n    salary,\n    -- Window aggregate calculates dept total without collapsing rows:\n    SUM(salary) OVER (PARTITION BY department) AS dept_total_payroll,\n    -- Calculate employee's percentage contribution to department payroll:\n    ROUND(\n        (salary * 100.0) / SUM(salary) OVER (PARTITION BY department), \n        2\n    ) AS pct_of_dept_payroll\nFROM employees\nORDER BY department, salary DESC;"
            },
            tradeoffs: "Window functions execute late in the pipeline (SELECT phase), so they cannot be indexed directly. Computing window functions across massive unpartitioned datasets requires an in-memory sort of the entire dataset.",
            followUpQuestions: [
              {
                question: "Can you combine GROUP BY and Window Functions in the same query?",
                answer: "Yes! The GROUP BY collapses rows first, and the window function operates over the aggregated summary rows. For example: SELECT dept, SUM(sales), RANK() OVER (ORDER BY SUM(sales) DESC) FROM sales GROUP BY dept; is completely valid."
              }
            ],
            usedInProduction: "E-commerce order confirmation emails display line-item breakdowns alongside total order discounts and running subtotal balances computed via window aggregates.",
            relatedTopics: ["GROUP BY & ROLLUP", "Logical Execution Order", "Top N per Category"]
          }
        }
      ]
    }
  ]
};
