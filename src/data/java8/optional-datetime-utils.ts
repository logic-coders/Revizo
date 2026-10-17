import { Category } from "@/types";

export const java8OptionalDateTimeCategory: Category = {
  id: "java8-optional-datetime",
  title: "Optional, Date/Time & Utilities",
  subTopics: [
    {
      id: "optional-class",
      title: "Optional Class & Defensive Programming",
      questions: [
        {
          id: "j8-optional-1",
          question: "What is the Optional class in Java 8 and why was it introduced?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-09-15",
          answer: {
            quickAnswer: "Optional<T> is a single-value container that either holds a non-null value or is empty, introduced to represent the presence or absence of a return value explicitly without using null.",
            mentalModel: "Think of an Optional like a gift box. Instead of someone handing you either a watch or invisible air (null) — and you immediately drop and break it because you expected something solid — they hand you a box. You open the box to check if the watch is inside (isPresent()) before trying to put it on your wrist.",
            whatItIs: "Optional<T> is an immutable container object. It can either contain a non-null reference of type T (Optional.of(value)) or nothing at all (Optional.empty()). It forces callers of an API to acknowledge that a value might be missing, eliminating the dreaded NullPointerException at compile-time/design-time.",
            whyItExists: "Sir Tony Hoare called null references his 'billion-dollar mistake.' Before Java 8, missing values were represented as null, forcing developers to write defensive if (obj != null) checks everywhere — or inevitably suffer production NullPointerExceptions when a check was forgotten.",
            codeDemo: {
              language: "java",
              code: "// BEFORE Java 8: Returning null (dangerous!)\npublic User findUserById(String id) {\n    if (!exists(id)) return null;\n    return new User(id);\n}\n// Caller might forget null check -> NullPointerException!\nString name = findUserById(\"123\").getName(); \n\n// JAVA 8: Returning Optional (safe & self-documenting)\npublic Optional<User> findUserSafely(String id) {\n    if (!exists(id)) return Optional.empty();\n    return Optional.of(new User(id));\n}\n\n// Caller is FORCED to handle the missing case:\nString userName = findUserSafely(\"123\")\n    .map(User::getName)\n    .orElse(\"Guest\");",
              explanation: "The caller cannot accidentally invoke getName() on a null reference; the compiler forces safe extraction."
            },
            tradeoffs: "Optional wraps a reference in an extra object allocation, adding slight memory overhead. It should be used primarily as a method return type, not as a field or method parameter.",
            followUpQuestions: [
              {
                question: "Should you use Optional.get() without checking isPresent()?",
                answer: "Never! Calling get() on an empty Optional throws NoSuchElementException, which is just as bad as a NullPointerException. Use orElse(), orElseGet(), or orElseThrow() instead."
              }
            ],
            usedInProduction: "Spring Data JPA repository methods (e.g., findById(id) returns Optional<T>) and Spring Security authentication lookups.",
            relatedTopics: ["NullPointerException", "Defensive Programming", "Monads"]
          }
        },
        {
          id: "j8-optional-2",
          question: "What is the critical difference between Optional.of() and Optional.ofNullable()?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-09-28",
          answer: {
            quickAnswer: "Optional.of(val) throws NullPointerException immediately if the value is null; Optional.ofNullable(val) returns an empty Optional (Optional.empty()) if the value is null.",
            mentalModel: "Optional.of() is a bouncer who arrests anyone arriving with an empty envelope. Optional.ofNullable() is a receptionist who politely accepts both full and empty envelopes without drama.",
            whatItIs: "Optional.of(T value) requires value to be non-null. If value is null, it immediately throws NullPointerException. Optional.ofNullable(T value) is defensive: if value is non-null, it returns Optional.of(value); if value is null, it returns Optional.empty().",
            whyItExists: "Allows developers to fail-fast when a null violates an invariant (of), or gracefully bridge legacy nullable return values into modern Optional pipelines (ofNullable).",
            comparisonTable: {
              title: "Optional.of() vs Optional.ofNullable()",
              headers: ["Dimension", "Optional.of(value)", "Optional.ofNullable(value)"],
              rows: [
                ["Null Behavior", "Throws `NullPointerException` immediately (fail-fast)", "Returns `Optional.empty()` safely (defensive)"],
                ["Argument Expectation", "Guaranteed non-null reference required", "Nullable reference tolerated"],
                ["Intended Design Purpose", "Enforce invariant; fail early on illegal nulls", "Bridge legacy APIs or map lookups that may return null"],
                ["Example", "`Optional.of(user.getId())` (where ID must exist)", "`Optional.ofNullable(map.get(key))`"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "String knownValue = \"Hello\";\nString mysteryValue = getLegacyValueThatMightBeNull();\n\n// 1. Optional.of: throws NPE if null\nOptional<String> opt1 = Optional.of(knownValue); // Safe\n// Optional.of(null); // THROWS java.lang.NullPointerException immediately!\n\n// 2. Optional.ofNullable: converts null to Optional.empty()\nOptional<String> opt2 = Optional.ofNullable(mysteryValue); // Safe, returns Optional.empty() if null\n\n// Bridging legacy Map lookup to Optional:\nMap<String, String> config = new HashMap<>();\nOptional<String> timeout = Optional.ofNullable(config.get(\"timeout\"));\nSystem.out.println(timeout.orElse(\"30s\")); // Prints \"30s\"",
              explanation: "Optional.ofNullable safely wraps legacy map.get() calls that return null for missing keys."
            },
            tradeoffs: "Using Optional.of() on unchecked external inputs is a common source of unexpected runtime NPEs.",
            followUpQuestions: [
              {
                question: "When should you prefer Optional.of() over Optional.ofNullable()?",
                answer: "When null is an illegal internal bug and you want to fail-fast immediately at the call site."
              }
            ],
            usedInProduction: "Wrapping legacy database, Servlet API, and 3rd-party library return values in modern microservices.",
            relatedTopics: ["Fail-Fast", "Null Safety", "Optional.empty"]
          }
        },
        {
          id: "j8-optional-3",
          question: "What is the difference between orElse() and orElseGet() and what performance bug can orElse() introduce?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-09-29",
          answer: {
            quickAnswer: "orElse(val) evaluates its default value eagerly on EVERY call regardless of whether the Optional is present; orElseGet(Supplier) evaluates its default lazily ONLY when the Optional is empty.",
            mentalModel: "orElse is ordering a backup pizza from Domino's every single night just in case your mom doesn't cook dinner (you pay for the pizza even when dinner is cooked!). orElseGet is only ordering the pizza if you open the fridge and find it completely empty.",
            whatItIs: "orElse(T other) is a standard method taking an already-evaluated value. Even if the Optional is populated, the expression inside orElse(...) is executed. orElseGet(Supplier<? extends T> other) takes a functional Supplier. The lambda is only invoked if the Optional is empty.",
            whyItExists: "Prevents severe performance degradation and unintended side effects when computing fallback defaults.",
            comparisonTable: {
              title: "orElse(T) vs orElseGet(Supplier<T>)",
              headers: ["Dimension", "orElse(T other)", "orElseGet(Supplier<? extends T> other)"],
              rows: [
                ["Evaluation Strategy", "Eager: evaluated on EVERY execution, even if present", "Lazy: evaluated ONLY when the Optional is empty"],
                ["Parameter Type", "Direct value instance (`T`)", "Functional interface (`Supplier<T>`)"],
                ["Performance Cost", "High if argument is a method call, constructor, or query", "Zero overhead when Optional is already populated"],
                ["Side-Effect Danger", "Method inside `orElse(...)` runs and causes unintended writes/queries", "Safely deferred until empty condition is met"],
                ["Best Practice Rule", "Use ONLY for pre-existing static constants (e.g. `\"DEFAULT\"`)", "Use for method calls, object instantiation, or computations"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "public class FallbackDemo {\n    public static String computeExpensiveDefault() {\n        System.out.println(\"-> EXECUTING EXPENSIVE DB QUERY / NETWORK CALL!\");\n        return \"ExpensiveFallback\";\n    }\n\n    public static void main(String[] args) {\n        Optional<String> user = Optional.of(\"Alice\");\n\n        System.out.println(\"--- Testing orElse ---\");\n        // BUG: computeExpensiveDefault() RUNS EVEN THOUGH user HAS A VALUE!\n        String val1 = user.orElse(computeExpensiveDefault());\n        System.out.println(\"Result: \" + val1);\n\n        System.out.println(\"\\n--- Testing orElseGet ---\");\n        // OPTIMAL: Lambda NEVER runs because user is present!\n        String val2 = user.orElseGet(() -> computeExpensiveDefault());\n        System.out.println(\"Result: \" + val2);\n    }\n}",
              explanation: "Notice the terminal output: orElse executes computeExpensiveDefault() unnecessarily; orElseGet does not."
            },
            tradeoffs: "Use orElse ONLY for pre-existing constants (e.g. orElse(\"UNKNOWN\")); use orElseGet for any method call, object instantiation, or computation.",
            followUpQuestions: [
              {
                question: "What is orElseThrow()?",
                answer: "orElseThrow(Supplier<? extends X> exceptionSupplier) throws a custom exception if the Optional is empty."
              }
            ],
            usedInProduction: "A classic code review comment in enterprise Java: 'Replace orElse(new Object()) with orElseGet(Object::new) to avoid redundant allocations.'",
            relatedTopics: ["Lazy Evaluation", "Supplier", "Performance Optimization"]
          }
        },
        {
          id: "j8-optional-4",
          question: "How do map(), flatMap(), and filter() work on an Optional instance?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-09-30",
          answer: {
            quickAnswer: "map() transforms the contained value and wraps it in a new Optional; flatMap() transforms using a function that returns an Optional and prevents double wrapping; filter() keeps the value if it matches a Predicate or returns Optional.empty().",
            mentalModel: "Opening a nested Russian Matryoshka doll: map wraps the inner doll in another layer; flatMap unpacks the inner doll so you don't end up with a doll inside a box inside another box.",
            whatItIs: "Optional mirrors Stream methods: (1) filter(Predicate): returns the Optional if value matches, or Optional.empty(). (2) map(Function): if present, applies function to value; if result is null, returns empty. (3) flatMap(Function<T, Optional<U>>): if present, applies function directly and flattens the result, preventing Optional<Optional<U>>.",
            whyItExists: "Enables elegant, null-safe navigation of deeply nested object graphs without nested if-null checks.",
            codeDemo: {
              language: "java",
              code: "class Address { private String zipCode; public String getZipCode() { return zipCode; } }\nclass User {\n    private Address address;\n    public Optional<Address> getAddress() { return Optional.ofNullable(address); }\n}\n\nOptional<User> user = Optional.of(new User());\n\n// Clean navigation of nested optional graph:\nString zip = user\n    // Use flatMap because getAddress() ALREADY returns Optional<Address>:\n    .flatMap(User::getAddress) \n    // Use map because getZipCode() returns raw String:\n    .map(Address::getZipCode) \n    // Use filter to validate postal code format:\n    .filter(z -> z.length() == 5)\n    .orElse(\"00000\");",
              explanation: "flatMap flattens Optional<Address>, preventing an ugly Optional<Optional<Address>>."
            },
            tradeoffs: "Don't write procedural code inside Optional chains (e.g. opt.map(v -> { doSideEffect(); return v; })); keep mapping pure.",
            followUpQuestions: [
              {
                question: "When should you use flatMap vs map on an Optional?",
                answer: "Use flatMap when the mapping function returns an Optional; use map when the mapping function returns a plain object."
              }
            ],
            usedInProduction: "Traversing nested JSON DTOs and database relations (Order -> Customer -> Address -> Country).",
            relatedTopics: ["Monadic Composition", "flatMap", "Deep Null Navigation"]
          }
        },
        {
          id: "j8-optional-5",
          question: "Why should Optional NOT be used as a field, method parameter, or in collections?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "Optional does not implement Serializable (breaking RMI, session storage, and JPA), adds heap pointer overhead, and passing Optional as a parameter complicates client calling code.",
            mentalModel: "A gift box is for delivering a present to someone's doorstep (return type). You don't build the foundation of your house out of cardboard gift boxes (fields).",
            whatItIs: "Architectural rules: (1) Fields: Optional is not java.io.Serializable. Using it as a field breaks Jackson, Hibernate, and distributed caching. (2) Parameters: Passing Optional<String> forces callers to write Optional.ofNullable(val) just to invoke your method. Use method overloading instead. (3) Collections: Map<Key, Optional<Val>> or List<Optional<T>> is an anti-pattern; use an empty collection or omit the key instead.",
            whyItExists: "Brian Goetz and the Java language team explicitly designed Optional as a method return type to represent absence of result without ambiguity.",
            codeDemo: {
              language: "java",
              code: "// ANTI-PATTERN 1: Optional as a class field (Breaks serialization!)\npublic class BadUser implements Serializable {\n    // private Optional<String> middleName; // NOT SERIALIZABLE! Throws NotSerializableException!\n    private String middleName; // Correct: plain nullable field\n\n    // Correct: Expose Optional in the getter!\n    public Optional<String> getMiddleName() {\n        return Optional.ofNullable(middleName);\n    }\n}\n\n// ANTI-PATTERN 2: Optional as a parameter\n// public void processOrder(Optional<Coupon> coupon) { ... } // Awkward for caller!\n// Correct: Overload method or take nullable parameter:\npublic void processOrder(Coupon coupon) { ... }",
              explanation: "Store plain fields in entities and return Optional from getter methods."
            },
            tradeoffs: "In Spring Data MongoDB and some modern serialization libraries, custom serializers exist, but the standard recommendation remains: return type only.",
            followUpQuestions: [
              {
                question: "Is Optional serializable in Java?",
                answer: "No, Optional does not implement java.io.Serializable."
              }
            ],
            usedInProduction: "Strictly enforced by SonarQube, Checkstyle, and Google ErrorProne static analysis rules across enterprise CI/CD.",
            relatedTopics: ["Serialization", "Anti-patterns", "SonarQube Rules"]
          }
        },
        {
          id: "j8-optional-6",
          question: "What is the difference between ifPresent() and isPresent()?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "isPresent() returns a boolean indicating whether a value is held (imperative); ifPresent(Consumer) executes a lambda callback if a value is present (functional).",
            mentalModel: "isPresent() is knocking on a door and asking 'Is anyone home?'. ifPresent() is sliding a letter under the door that is immediately read by whoever is inside.",
            whatItIs: "isPresent() is a query method returning boolean. if (opt.isPresent()) { opt.get(); } is the old imperative pattern and is considered a code smell. ifPresent(Consumer<? super T> action) accepts a lambda that executes only when a value is present, eliminating the need to call get().",
            whyItExists: "Encourages functional, declarative code and prevents NoSuchElementException.",
            codeDemo: {
              language: "java",
              code: "Optional<String> token = findAuthToken();\n\n// IMPERATIVE CODE SMELL: Re-creating null checks with isPresent + get\nif (token.isPresent()) {\n    System.out.println(\"Token: \" + token.get()); // Clunky!\n}\n\n// IDIOMATIC FUNCTIONAL STYLE: ifPresent taking a Consumer\ntoken.ifPresent(t -> System.out.println(\"Token: \" + t));\n\n// Or with method reference:\ntoken.ifPresent(System.out::println);",
              explanation: "ifPresent replaces the two-step check-and-get with a safe, single-line functional action."
            },
            tradeoffs: "In Java 8, ifPresent has no else-branch; Java 9 introduced ifPresentOrElse(Consumer, Runnable) to handle both present and empty branches.",
            followUpQuestions: [
              {
                question: "How do you handle both branches (if present and if empty) in Java 8?",
                answer: "In Java 8, you must use isPresent() with if-else, or use map(...).orElseGet(...)."
              }
            ],
            usedInProduction: "Dispatching audit events, caching tokens, and firing metrics beacons when results are available.",
            relatedTopics: ["Consumer", "Clean Code", "ifPresentOrElse"]
          }
        }
      ]
    },
    {
      id: "date-time-api",
      title: "Modern Date/Time API (java.time)",
      questions: [
        {
          id: "j8-datetime-1",
          question: "Why was the java.time (Date/Time) API introduced in Java 8 to replace java.util.Date?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-09-15",
          answer: {
            quickAnswer: "Legacy java.util.Date and Calendar were mutable, thread-unsafe, zero-indexed months confusingly (January = 0), lacked timezone clarity, and had broken design; java.time (JSR-310) is immutable, thread-safe, and clear.",
            mentalModel: "java.util.Date is like a shared whiteboard where multiple people write down their lunch times — anyone can erase or change someone else's time (mutable and thread-unsafe). java.time is like a printed receipt — once printed, it can never be altered (immutable).",
            whatItIs: "Java 8 introduced the java.time package (based on Joda-Time). All core classes (LocalDate, LocalTime, LocalDateTime, ZonedDateTime, Instant) are immutable and thread-safe. Months are properly 1-indexed (1 = January), and operations always return a new instance rather than modifying the existing object.",
            whyItExists: "SimpleDateFormat and java.util.Date caused countless concurrency bugs and timezone corruption in enterprise production applications.",
            codeDemo: {
              language: "java",
              code: "// BEFORE Java 8 (Disaster waiting to happen):\nDate oldDate = new Date();\n// Months were 0-indexed: 0 was January, 11 was December!\nDate brokenMonth = new Date(2026, 0, 15); // Year was 1900 + 2026 = 3926!\n// Mutable! Anyone can change your date reference:\noldDate.setTime(0); // Mutated in place!\n\n// JAVA 8: Immutable, thread-safe, intuitive\nLocalDate today = LocalDate.now();\nLocalDate birthday = LocalDate.of(2026, Month.OCTOBER, 17); // 1-indexed, clear!\n\n// All operations return a NEW instance (original is untouched):\nLocalDate nextWeek = today.plusWeeks(1);",
              explanation: "today remains unchanged after plusWeeks(1); immutability ensures thread safety."
            },
            tradeoffs: "Legacy databases and JDBC drivers pre-Java 8 required bridging with java.sql.Timestamp, though modern JDBC 4.2+ drivers natively map to java.time.",
            followUpQuestions: [
              {
                question: "Which JSR specification defines the Java 8 Date/Time API?",
                answer: "JSR-310, authored in collaboration with Joda-Time creator Stephen Colebourne."
              }
            ],
            usedInProduction: "Standard across all financial ledgers, flight scheduling systems, and REST API timestamps.",
            relatedTopics: ["Immutability", "Thread Safety", "JSR-310"]
          }
        },
        {
          id: "j8-datetime-2",
          question: "What are the differences between LocalDate, LocalTime, LocalDateTime, and ZonedDateTime?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "LocalDate represents date only (yyyy-MM-dd); LocalTime represents time only (HH:mm:ss); LocalDateTime combines both without timezone; ZonedDateTime includes full timezone rules and daylight saving adjustments.",
            mentalModel: "LocalDate is the date on a calendar page. LocalTime is the clock on your wall. LocalDateTime is the date and time on a printed movie ticket. ZonedDateTime is an international flight arrival board tracking local time in Tokyo with DST.",
            whatItIs: "Domain breakdown: (1) LocalDate: Year, month, day (e.g. birthday). (2) LocalTime: Hours, minutes, seconds, nanoseconds (e.g. alarm clock). (3) LocalDateTime: Combines date and time but has NO concept of timezone offset. (4) ZonedDateTime: Complete date and time with a ZoneId (e.g. 'America/New_York') and handles Daylight Saving Time (DST).",
            whyItExists: "Decouples human date concepts from machine timestamps and prevents time zone conversion bugs.",
            comparisonTable: {
              title: "LocalDate vs LocalTime vs LocalDateTime vs ZonedDateTime",
              headers: ["Type", "Contains Date?", "Contains Time?", "Timezone / Offset?", "Example Value", "Best For"],
              rows: [
                ["LocalDate", "Yes (Year, Month, Day)", "No", "No", "`2026-10-17`", "Birthdays, holidays, invoice dates"],
                ["LocalTime", "No", "Yes (Hour, Min, Sec, Nano)", "No", "`14:30:00`", "Alarm clocks, opening store hours"],
                ["LocalDateTime", "Yes", "Yes", "No", "`2026-10-17T14:30:00`", "Movie tickets, printed appointments"],
                ["ZonedDateTime", "Yes", "Yes", "Yes (`ZoneId` + DST rules)", "`2026-10-17T14:30+05:30[Asia/Kolkata]`", "International flight arrivals, global scheduling"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// 1. LocalDate: 2026-10-17\nLocalDate date = LocalDate.of(2026, 10, 17);\n\n// 2. LocalTime: 14:30:00\nLocalTime time = LocalTime.of(14, 30);\n\n// 3. LocalDateTime: 2026-10-17T14:30:00\nLocalDateTime dateTime = LocalDateTime.of(date, time);\n\n// 4. ZonedDateTime: with full timezone and DST rules\nZoneId tokyoZone = ZoneId.of(\"Asia/Tokyo\");\nZonedDateTime tokyoTime = dateTime.atZone(tokyoZone);\n\n// Convert Tokyo time to New York time:\nZonedDateTime nyTime = tokyoTime.withZoneSameInstant(ZoneId.of(\"America/New_York\"));\nSystem.out.println(\"Tokyo: \" + tokyoTime);\nSystem.out.println(\"New York: \" + nyTime);",
              explanation: "withZoneSameInstant recalculates the clock time to match the target timezone offset."
            },
            tradeoffs: "Never store user meetings across time zones as LocalDateTime; if the local government changes DST rules, a stored UTC Instant or ZonedDateTime is needed.",
            followUpQuestions: [
              {
                question: "What is ZoneOffset vs ZoneId?",
                answer: "ZoneOffset is a fixed difference from UTC (e.g., +05:30); ZoneId encompasses geographical rules and Daylight Saving Time changes (e.g., 'America/New_York')."
              }
            ],
            usedInProduction: "Flight booking engines computing departure and arrival times across different time zones.",
            relatedTopics: ["ZoneId", "ZonedDateTime", "Daylight Saving Time"]
          }
        },
        {
          id: "j8-datetime-3",
          question: "What is Instant and how does it differ from LocalDateTime?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "Instant is a machine-readable point on the universal UTC timeline (epoch seconds + nanoseconds); LocalDateTime is a human-readable date and time without any timezone context.",
            mentalModel: "Instant is an atomic clock in Greenwich ticking Unix epoch seconds for computers. LocalDateTime is the date printed on your local wedding invitation — meaningful only to people living in that town.",
            whatItIs: "Instant represents a single instantaneous point on the timeline, measured from the standard Java epoch of 1970-01-01T00:00:00Z. It has nanosecond resolution and is always in UTC. LocalDateTime is purely calendar/clock fields (year, month, day, hour); without a timezone, it cannot represent a specific instant in the physical universe.",
            whyItExists: "Separates machine time (event timestamps, audit logs, database row versions) from human calendar time.",
            comparisonTable: {
              title: "Instant vs LocalDateTime Comparison",
              headers: ["Dimension", "Instant", "LocalDateTime"],
              rows: [
                ["Perspective", "Machine / Computer time (universal physical timeline)", "Human calendar / wall-clock time"],
                ["Timezone Offset", "Always UTC (Unix epoch seconds + nanoseconds)", "None (context-free date and time)"],
                ["Unambiguous Global Point", "Yes: represents the exact same physical moment worldwide", "No: represents different physical moments across timezones"],
                ["Database Persistence", "Recommended for `created_at`, audit logs, telemetry", "Suitable for timezone-agnostic events (e.g. store opens at 9 AM)"],
                ["Conversion", "Convert to local time via `atZone(ZoneId)`", "Convert to Instant via `atZone(ZoneId).toInstant()`"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Machine timestamp (UTC):\nInstant nowUtc = Instant.now();\nSystem.out.println(\"Instant UTC: \" + nowUtc); // e.g. 2026-10-17T07:15:30.123456789Z\n\n// Epoch milliseconds (replaces System.currentTimeMillis()):\nlong epochMilli = nowUtc.toEpochMilli();\n\n// Converting Instant to human LocalDateTime in a specific zone:\nLocalDateTime localInParis = LocalDateTime.ofInstant(nowUtc, ZoneId.of(\"Europe/Paris\"));\nSystem.out.println(\"Paris Local: \" + localInParis);",
              explanation: "Instant is universal UTC; converting to LocalDateTime requires specifying a ZoneId."
            },
            tradeoffs: "Always persist Instant in database timestamps rather than LocalDateTime to ensure unambiguous comparisons.",
            followUpQuestions: [
              {
                question: "What is the precision of Instant in Java 8?",
                answer: "Nanosecond precision (10^-9 seconds), stored as epoch seconds (long) plus nanoseconds of second (int)."
              }
            ],
            usedInProduction: "Log timestamps, distributed tracing spans (OpenTelemetry), and database audit columns (createdAt, updatedAt).",
            relatedTopics: ["Unix Epoch", "UTC", "Machine Time"]
          }
        },
        {
          id: "j8-datetime-4",
          question: "What is the difference between Period and Duration in Java 8?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-05",
          answer: {
            quickAnswer: "Period measures date-based time (years, months, days) for human calendar dates; Duration measures time-based time (seconds, nanoseconds) for machine timestamps and precise clock intervals.",
            mentalModel: "Period is 'my passport expires in 2 years and 3 months.' Duration is 'the server health-check timed out after 45.5 seconds.'",
            whatItIs: "Period operates on LocalDate and represents human calendar concepts where a 'month' can have 28, 29, 30, or 31 days. Duration operates on LocalTime or Instant and represents a precise quantity of physical seconds and nanoseconds (e.g. 86,400 seconds in a standard day).",
            whyItExists: "Prevents bugs caused by assuming a month is always 30 days or a day is always 24 hours (which fails on DST transitions).",
            comparisonTable: {
              title: "Period vs Duration Comparison",
              headers: ["Dimension", "Period", "Duration"],
              rows: [
                ["Time Unit Focus", "Date-based: Years, Months, Days", "Time-based: Seconds, Nanoseconds, Milliseconds"],
                ["Compatible Types", "`LocalDate`", "`LocalTime`, `Instant`, `LocalDateTime`"],
                ["DST Awareness", "Respects variable calendar units (e.g. leap years, 28-31 day months)", "Strict physical seconds (e.g. 1 day is always exactly 86,400s)"],
                ["ISO-8601 Format", "`P1Y2M3D` (Period: 1 year, 2 months, 3 days)", "`PT15M30S` (Period of Time: 15 minutes, 30 seconds)"],
                ["Best Use Cases", "Calculating age, subscription renewal dates, contract terms", "HTTP request timeouts, benchmark execution latency, cache TTLs"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// 1. Period: Date-based (Years, Months, Days)\nLocalDate birthDate = LocalDate.of(1995, 5, 20);\nLocalDate currentDate = LocalDate.of(2026, 10, 17);\nPeriod age = Period.between(birthDate, currentDate);\nSystem.out.printf(\"Age: %d years, %d months, %d days%n\", \n    age.getYears(), age.getMonths(), age.getDays());\n\n// 2. Duration: Time-based (Hours, Minutes, Seconds, Nanos)\nInstant start = Instant.now();\ndoHeavyComputation();\nInstant end = Instant.now();\nDuration elapsed = Duration.between(start, end);\nSystem.out.println(\"Elapsed: \" + elapsed.toMillis() + \"ms\");",
              explanation: "Period.between calculates date spans; Duration.between calculates machine time differences."
            },
            tradeoffs: "Calling Duration.between() on two LocalDates will throw UnsupportedTemporalTypeException because LocalDate lacks second/nano fields.",
            followUpQuestions: [
              {
                question: "What ISO-8601 format does Period.toString() produce?",
                answer: "'P2Y3M15D' (Period: 2 Years, 3 Months, 15 Days)."
              }
            ],
            usedInProduction: "Period calculates subscription renewal dates; Duration sets connection and socket timeouts.",
            relatedTopics: ["ISO-8601", "Time Calculations", "ChronoUnit"]
          }
        },
        {
          id: "j8-datetime-5",
          question: "How does DateTimeFormatter provide thread-safe date parsing and formatting compared to SimpleDateFormat?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-06",
          answer: {
            quickAnswer: "DateTimeFormatter is immutable and 100% thread-safe, allowing a single static instance to be shared across all threads; SimpleDateFormat is mutable and thread-unsafe, corrupting dates in multi-threaded environments.",
            mentalModel: "SimpleDateFormat is a shared pencil with an eraser where threads constantly erase and overwrite each other's temporary parse buffers. DateTimeFormatter is an indestructible laser engraver that only reads instructions.",
            whatItIs: "SimpleDateFormat maintained internal mutable calendar state (e.g. Calendar.setTime()). When multiple threads shared one SimpleDateFormat, date parsing produced corrupted dates or NumberFormatExceptions. DateTimeFormatter is completely stateless and immutable, meaning you can safely declare private static final DateTimeFormatter FORMATTER.",
            whyItExists: "Eliminates one of the most notorious sources of subtle concurrency bugs and race conditions in pre-Java 8 code.",
            comparisonTable: {
              title: "DateTimeFormatter (Java 8+) vs SimpleDateFormat (Legacy)",
              headers: ["Dimension", "SimpleDateFormat (Java 1.1)", "DateTimeFormatter (Java 8+)"],
              rows: [
                ["Thread Safety", "Thread-UNSAFE (internal mutable state)", "100% Thread-SAFE & immutable"],
                ["Reusability", "Must allocate new instance per call or use `ThreadLocal`", "Can safely be declared `public static final`"],
                ["Concurrent Corruption", "Causes race conditions, incorrect dates, `NumberFormatException`", "Zero race conditions across thousands of threads"],
                ["Compatible Types", "`java.util.Date`, `java.util.Calendar`", "`LocalDate`, `LocalDateTime`, `Instant`, `ZonedDateTime`"],
                ["Package", "`java.text`", "`java.time.format`"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Pre-Java 8 Bug: Sharing SimpleDateFormat across threads causes race conditions!\n// private static final SimpleDateFormat SPRINT = new SimpleDateFormat(\"yyyy-MM-dd\"); // DANGEROUS!\n\n// Java 8: Completely thread-safe static formatter!\npublic class DateService {\n    private static final DateTimeFormatter FORMATTER = \n        DateTimeFormatter.ofPattern(\"dd-MMM-yyyy\");\n\n    // 1. Formatting: Date -> String\n    public static String formatDate(LocalDate date) {\n        return date.format(FORMATTER); // e.g. \"17-Oct-2026\"\n    }\n\n    // 2. Parsing: String -> Date\n    public static LocalDate parseDate(String text) {\n        return LocalDate.parse(text, FORMATTER);\n    }\n}",
              explanation: "FORMATTER can be safely shared across thousands of concurrent web request threads."
            },
            tradeoffs: "DateTimeFormatter pattern symbols differ slightly from SimpleDateFormat: 'u' is year, 'y' is year-of-era, 'M' is month, 'm' is minute.",
            followUpQuestions: [
              {
                question: "What built-in standard formatters exist in DateTimeFormatter?",
                answer: "DateTimeFormatter.ISO_LOCAL_DATE, ISO_INSTANT, ISO_OFFSET_DATE_TIME, RFC_1123_DATE_TIME, etc."
              }
            ],
            usedInProduction: "Standard formatting of JSON timestamps in Spring Boot Jackson message converters.",
            relatedTopics: ["SimpleDateFormat Concurrency", "Thread Safety", "ISO-8601"]
          }
        },
        {
          id: "j8-datetime-6",
          question: "What are TemporalAdjusters and how do you calculate business dates (e.g., next Sunday, last day of month)?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-07",
          answer: {
            quickAnswer: "TemporalAdjusters is a utility class providing functional strategies to adjust a date/time to external milestones (e.g., firstDayOfMonth, nextOrSame, lastInMonth).",
            mentalModel: "A personal calendar assistant: you don't calculate leap years or count days on your fingers; you simply tell your assistant: 'Schedule the meeting for the first Monday of next month.'",
            whatItIs: "TemporalAdjuster is a functional interface (Temporal adjustInto(Temporal temporal)). The TemporalAdjusters class provides pre-built factory adjusters: firstDayOfMonth(), lastDayOfMonth(), firstDayOfNextYear(), next(DayOfWeek), previousOrSame(DayOfWeek), and custom implementations.",
            whyItExists: "Replaces complex, error-prone manual calendar arithmetic with declarative, self-documenting code.",
            codeDemo: {
              language: "java",
              code: "LocalDate today = LocalDate.of(2026, 10, 17);\n\n// 1. Last day of current month:\nLocalDate lastDay = today.with(TemporalAdjusters.lastDayOfMonth());\nSystem.out.println(\"Last day of Oct: \" + lastDay); // 2026-10-31\n\n// 2. Next Friday:\nLocalDate nextFriday = today.with(TemporalAdjusters.next(DayOfWeek.FRIDAY));\nSystem.out.println(\"Next Friday: \" + nextFriday);\n\n// 3. First Monday of next month:\nLocalDate firstMondayNextMonth = today.with(TemporalAdjusters.firstDayOfNextMonth())\n    .with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));\nSystem.out.println(\"First Monday next month: \" + firstMondayNextMonth);\n\n// 4. Custom TemporalAdjuster: skip weekends to next working day\nTemporalAdjuster nextWorkingDay = temporal -> {\n    DayOfWeek dow = DayOfWeek.of(temporal.get(ChronoField.DAY_OF_WEEK));\n    int daysToAdd = (dow == DayOfWeek.FRIDAY) ? 3 : (dow == DayOfWeek.SATURDAY) ? 2 : 1;\n    return temporal.plus(daysToAdd, ChronoUnit.DAYS);\n};",
              explanation: "date.with(adjuster) applies calendar adjustments seamlessly while preserving immutability."
            },
            tradeoffs: "Always verify timezone adjustments if combining with ZonedDateTime across Daylight Saving Time shifts.",
            followUpQuestions: [
              {
                question: "Can TemporalAdjuster be implemented with a lambda?",
                answer: "Yes, TemporalAdjuster is a @FunctionalInterface with a single abstract method adjustInto(Temporal)."
              }
            ],
            usedInProduction: "Financial settlement cycles (T+2 settlement days), recurring invoice generation on the last day of each month.",
            relatedTopics: ["TemporalAdjuster", "DayOfWeek", "Business Day Calculations"]
          }
        },
        {
          id: "j8-datetime-7",
          question: "How do you convert between legacy java.util.Date / Calendar and modern java.time.Instant / LocalDateTime?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-08",
          answer: {
            quickAnswer: "Use date.toInstant() to convert Date to Instant, and Date.from(instant) to convert Instant to Date; bridge to LocalDateTime using atZone(ZoneId.systemDefault()).",
            mentalModel: "Instant is the international passport exchange office that bridges between the antique currency (java.util.Date) and the modern currency (java.time).",
            whatItIs: "Java 8 retrofitted the legacy java.util.Date and Calendar classes with bridge methods: Date.toInstant() and Date.from(Instant). Because Date represents UTC epoch milliseconds, Instant is the exact mathematical equivalent. To get to/from LocalDateTime, you must provide a ZoneId.",
            whyItExists: "Essential for modernizing legacy codebases and interacting with third-party libraries that still expect java.util.Date.",
            codeDemo: {
              language: "java",
              code: "// 1. java.util.Date -> modern java.time:\nDate legacyDate = new Date();\n\n// Date -> Instant:\nInstant instant = legacyDate.toInstant();\n\n// Date -> LocalDateTime (requires timezone!):\nLocalDateTime localDateTime = instant\n    .atZone(ZoneId.systemDefault())\n    .toLocalDateTime();\n\n// 2. modern java.time -> legacy java.util.Date:\n// Instant -> Date:\nDate dateFromInstant = Date.from(instant);\n\n// LocalDateTime -> Date (requires timezone!):\nDate dateFromLocal = Date.from(\n    localDateTime.atZone(ZoneId.systemDefault()).toInstant()\n);\n\n// 3. Calendar -> ZonedDateTime:\nCalendar calendar = Calendar.getInstance();\nZonedDateTime zdt = calendar.toInstant().atZone(calendar.getTimeZone().toZoneId());",
              explanation: "Instant serves as the universal conversion bridge between legacy and modern types."
            },
            tradeoffs: "Always specify the explicit ZoneId if the application server's default timezone can differ from user expectations.",
            followUpQuestions: [
              {
                question: "Why cannot LocalDateTime be directly converted to Date without a ZoneId?",
                answer: "Because LocalDateTime has no concept of a timezone; you cannot identify a physical UTC instant without knowing which geographical timezone that local clock belongs to."
              }
            ],
            usedInProduction: "Bridging legacy JPA/Hibernate entity mappings with modern Spring Boot service layers.",
            relatedTopics: ["Instant", "ZoneId.systemDefault", "Legacy Migration"]
          }
        }
      ]
    },
    {
      id: "java8-jvm-utilities",
      title: "JVM, Map & Utility Enhancements",
      questions: [
        {
          id: "j8-util-1",
          question: "What is Metaspace and how does it differ from PermGen in Java 8?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-09",
          answer: {
            quickAnswer: "Metaspace completely replaced PermGen in Java 8; it stores class metadata in OS native memory rather than the contiguous Java heap, auto-growing by default to prevent OutOfMemoryError.",
            mentalModel: "PermGen was a small fixed filing cabinet in your office (heap). Once full, the office shut down (java.lang.OutOfMemoryError: PermGen space). Metaspace is a digital warehouse in the cloud (native OS RAM) that automatically expands storage lockers as needed.",
            whatItIs: "In Java 7 and earlier, Permanent Generation (PermGen) stored class definitions, method bytecode, interned strings, and static variables within the JVM heap. Its fixed maximum size (-XX:MaxPermSize) frequently led to PermGen OOM when applications dynamically loaded classes (e.g. Spring proxies, CGLIB, hot deployments). Java 8 eliminated PermGen entirely and introduced Metaspace, which allocates from off-heap native memory.",
            whyItExists: "Eliminates arbitrary PermGen tuning and prevents classloader memory leak crashes during web application redeployments.",
            comparisonTable: {
              title: "PermGen (Java 7) vs Metaspace (Java 8+) Comparison",
              headers: ["Dimension", "PermGen (Java 7 & earlier)", "Metaspace (Java 8+)"],
              rows: [
                ["Memory Location", "Part of contiguous JVM Java Heap", "Allocated from OS Native Memory (off-heap)"],
                ["Default Size Limit", "Fixed 64MB / 82MB max limit (`-XX:MaxPermSize`)", "Auto-resizing; bounded only by available OS RAM"],
                ["Out of Memory Error", "`java.lang.OutOfMemoryError: PermGen space`", "`java.lang.OutOfMemoryError: Metaspace`"],
                ["Interned Strings Storage", "Stored inside PermGen (moved to Heap in Java 7)", "Stored in main Java Heap"],
                ["Static Variables Storage", "Stored inside PermGen", "Stored in main Java Heap (as `Class` object fields)"],
                ["Class Metadata Garbage Collection", "Tied to Full GC of the JVM heap", "Collected seamlessly when ClassLoader is dereferenced"],
                ["Key Tuning Flags", "`-XX:PermSize`, `-XX:MaxPermSize`", "`-XX:MetaspaceSize`, `-XX:MaxMetaspaceSize`"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// In Java 7: Flags that NO LONGER EXIST in Java 8:\n// -XX:PermSize=128m -XX:MaxPermSize=256m (JVM will warn and ignore in Java 8)\n\n// In Java 8+: Modern Metaspace configuration flags:\n// -XX:MetaspaceSize=128m      // Initial threshold before triggering GC\n// -XX:MaxMetaspaceSize=512m   // Hard upper cap on native memory allocation\n\n// Where did things move?\n// 1. Class Metadata -> Moved to Native Memory (Metaspace)\n// 2. Interned Strings -> Moved to Main Java Heap (already in Java 7)\n// 3. Static Variables -> Moved to Main Java Heap (as java.lang.Class instance fields)",
              explanation: "Metaspace dynamically allocates from native RAM, bounded only by available OS memory unless MaxMetaspaceSize is set."
            },
            tradeoffs: "Unconstrained Metaspace can consume all available server RAM, causing the OS Out-Of-Memory Killer (OOM-killer) to abruptly kill the JVM process; always set -XX:MaxMetaspaceSize in containerized environments (Docker/K8s).",
            followUpQuestions: [
              {
                question: "What error is thrown if Metaspace runs out of space?",
                answer: "java.lang.OutOfMemoryError: Metaspace."
              }
            ],
            usedInProduction: "JVM tuning for Kubernetes pods and Spring Boot microservices with dynamic class generation.",
            relatedTopics: ["PermGen", "JVM Memory Model", "OutOfMemoryError"]
          }
        },
        {
          id: "j8-util-2",
          question: "How do you configure and monitor Metaspace (-XX:MetaspaceSize, -XX:MaxMetaspaceSize) and what causes Metaspace OOM?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-10",
          answer: {
            quickAnswer: "Configure with -XX:MetaspaceSize (high-water mark for classloader GC) and -XX:MaxMetaspaceSize (hard cap); Metaspace OOM is caused by classloader leaks from un-garbage-collected dynamic proxies.",
            mentalModel: "MetaspaceSize is a water level sensor in a tank: when the water reaches this level, the drain opens (GC runs). MaxMetaspaceSize is the physical ceiling of the room.",
            whatItIs: "-XX:MetaspaceSize does NOT pre-allocate memory; it sets the initial high-water mark that triggers a garbage collection of dead classloaders. If surviving classes still need room, the threshold increases. -XX:MaxMetaspaceSize sets the absolute ceiling. Metaspace OOM occurs when frameworks generate thousands of dynamic classes (CGLIB, ByteBuddy, Hibernate proxies, Groovy scripts) while retaining strong references to their ClassLoaders, preventing garbage collection.",
            whyItExists: "Proper configuration prevents frequent early Full GCs while safeguarding server native RAM.",
            codeDemo: {
              language: "java",
              code: "// Recommended JVM Flags for 2GB Docker Container:\n// java -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m -Xms1024m -Xmx1024m -jar app.jar\n\n// Monitoring Metaspace programmatically in Java 8:\nList<MemoryPoolMXBean> memoryPools = ManagementFactory.getMemoryPoolMXBeans();\nfor (MemoryPoolMXBean pool : memoryPools) {\n    if (pool.getName().contains(\"Metaspace\")) {\n        MemoryUsage usage = pool.getUsage();\n        System.out.printf(\"Metaspace Used: %d MB, Max: %d MB%n\",\n            usage.getUsed() / (1024 * 1024),\n            usage.getMax() / (1024 * 1024));\n    }\n}",
              explanation: "MemoryPoolMXBean provides real-time telemetry into native Metaspace consumption."
            },
            tradeoffs: "Setting MetaspaceSize too low triggers frequent premature Full GCs during application startup.",
            followUpQuestions: [
              {
                question: "How do you inspect which classes are filling Metaspace?",
                answer: "Use jcmd <PID> GC.class_stats or analyze a heap dump using Eclipse Memory Analyzer (MAT) looking for ClassLoader instances."
              }
            ],
            usedInProduction: "Docker container memory tuning to prevent Kubernetes OOMKilled (Exit Code 137) errors.",
            relatedTopics: ["ClassLoader Leaks", "OOMKilled", "jcmd"]
          }
        },
        {
          id: "j8-util-3",
          question: "What is StringJoiner in Java 8 and how does String.join() utilize it?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-11",
          answer: {
            quickAnswer: "StringJoiner is a utility in java.util used to construct a sequence of characters separated by a delimiter, prefix, and suffix; String.join() is a convenient static wrapper built on top of StringJoiner.",
            mentalModel: "A necklace stringing machine: you set the knot type between beads (delimiter) and the clasps on both ends (prefix and suffix). You just drop beads in, and the necklace is produced ready to wear.",
            whatItIs: "StringJoiner manages character sequences with a mandatory delimiter (e.g. \", \") and optional prefix (e.g. \"[\") and suffix (e.g. \"]\"). String.join(delimiter, elements) internally creates a StringJoiner and feeds elements into it. It handles empty lists cleanly and includes setEmptyValue() for fallback formatting.",
            whyItExists: "Eliminates error-prone manual StringBuilder code that had to trim trailing commas or track boolean isFirst flags.",
            codeDemo: {
              language: "java",
              code: "// 1. Using StringJoiner directly:\nStringJoiner sj = new StringJoiner(\", \", \"{\", \"}\");\nsj.setEmptyValue(\"{EMPTY}\"); // If no elements added\nsj.add(\"id: 101\");\nsj.add(\"name: Alice\");\nsj.add(\"role: Admin\");\nSystem.out.println(sj.toString()); // \"{id: 101, name: Alice, role: Admin}\"\n\n// Merging two StringJoiners:\nStringJoiner sj2 = new StringJoiner(\", \", \"[\", \"]\");\nsj2.add(\"dept: IT\");\nsj.merge(sj2); // Merges sj2's content into sj without duplicating outer brackets\n\n// 2. Convenient String.join() wrapper:\nString path = String.join(\"/\", \"usr\", \"local\", \"bin\");\nSystem.out.println(path); // \"usr/local/bin\"",
              explanation: "String.join() is ideal for quick delimited concatenations; StringJoiner provides prefix/suffix/empty customization."
            },
            tradeoffs: "For massive, high-throughput string concatenations in tight loops, a reusable StringBuilder with pre-sized capacity may save a minor object allocation.",
            followUpQuestions: [
              {
                question: "What does String.join() do if an element in the collection is null?",
                answer: "It appends the literal string 'null' for that element."
              }
            ],
            usedInProduction: "Formatting REST URL paths, building CSV records, and constructing SQL parameters.",
            relatedTopics: ["String.join", "StringBuilder", "Collectors.joining"]
          }
        },
        {
          id: "j8-util-4",
          question: "What new methods were added to the Map interface in Java 8 (computeIfAbsent, computeIfPresent, merge, putIfAbsent, getOrDefault)?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-12",
          answer: {
            quickAnswer: "Java 8 added functional, atomic default methods to Map: getOrDefault, putIfAbsent, compute, computeIfAbsent, computeIfPresent, merge, replace, replaceAll, and forEach.",
            mentalModel: "Upgrading a manual filing cabinet with robotic push-buttons: instead of manually opening the drawer, looking if a file exists, creating a folder, and inserting it, you press one button ('computeIfAbsent') and the robot does it in one smooth motion.",
            whatItIs: "Pre-Java 8 map mutations required verbose multi-step lookups. Java 8 introduced: (1) getOrDefault(key, defaultVal). (2) putIfAbsent(key, val). (3) computeIfAbsent(key, mappingFn): computes value lazily only if absent or mapped to null. (4) computeIfPresent(key, remappingFn): updates existing value. (5) merge(key, val, remappingFn): merges new value with existing. (6) forEach(BiConsumer). (7) replaceAll(BiFunction).",
            whyItExists: "Reduces boilerplate, avoids redundant hash lookups, and provides atomic operations in ConcurrentHashMap.",
            codeDemo: {
              language: "java",
              code: "Map<String, List<String>> userRoles = new HashMap<>();\n\n// 1. computeIfAbsent: Creates list lazily on first access\nuserRoles.computeIfAbsent(\"Alice\", k -> new ArrayList<>()).add(\"ROLE_USER\");\nuserRoles.computeIfAbsent(\"Alice\", k -> new ArrayList<>()).add(\"ROLE_ADMIN\");\nSystem.out.println(userRoles.get(\"Alice\")); // [ROLE_USER, ROLE_ADMIN]\n\n// 2. getOrDefault: Safe default without null\nMap<String, Integer> inventory = new HashMap<>();\nint apples = inventory.getOrDefault(\"apples\", 0);\nSystem.out.println(\"Apples: \" + apples); // 0\n\n// 3. putIfAbsent: Stores only if key is not present\ninventory.putIfAbsent(\"oranges\", 50); // Stored\ninventory.putIfAbsent(\"oranges\", 100); // Ignored, remains 50\nSystem.out.println(\"Oranges: \" + inventory.get(\"oranges\")); // 50",
              explanation: "computeIfAbsent eliminates the classic 'if (!map.containsKey(k)) map.put(k, new List())' boilerplate."
            },
            tradeoffs: "If the mapping function inside computeIfAbsent returns null, no mapping is recorded in the map.",
            followUpQuestions: [
              {
                question: "Is computeIfAbsent atomic in ConcurrentHashMap?",
                answer: "Yes! In ConcurrentHashMap, computeIfAbsent is atomic and computed under a per-bin synchronization lock."
              }
            ],
            usedInProduction: "Implementing thread-safe in-memory caches, frequency counters, and multi-value maps.",
            relatedTopics: ["ConcurrentHashMap", "computeIfAbsent", "Map.merge"]
          }
        },
        {
          id: "j8-util-5",
          question: "How does Map.computeIfAbsent() prevent race conditions and duplicate initialization in caches?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-13",
          answer: {
            quickAnswer: "In ConcurrentHashMap, computeIfAbsent() locks the specific hash bucket while computing the mapping function, guaranteeing the mapping function executes at most once even under heavy concurrent thread access.",
            mentalModel: "A hotel registration desk where multiple guests try to book the exact same penthouse suite simultaneously. computeIfAbsent puts a lock on the suite door while checking availability, ensuring only one guest's booking payment is processed.",
            whatItIs: "The traditional cache lookup: if (!map.containsKey(key)) { V v = loadFromDB(key); map.put(key, v); } suffered from the 'cache stampede' / check-then-act race condition: 10 threads seeing containsKey(key) == false would all query the DB and overwrite each other. ConcurrentHashMap.computeIfAbsent(key, key -> loadFromDB(key)) executes atomically per hash bucket, ensuring loadFromDB runs exactly once.",
            whyItExists: "Eliminates cache stampedes and double-initialization bugs in concurrent multi-threaded services.",
            codeDemo: {
              language: "java",
              code: "public class UserCache {\n    private final Map<String, UserProfile> cache = new ConcurrentHashMap<>();\n\n    public UserProfile getUser(String userId) {\n        // Thread-safe, atomic, computed at most once per userId!\n        return cache.computeIfAbsent(userId, id -> {\n            System.out.println(\"Loading \" + id + \" from Remote DB (Heavy I/O)...\");\n            return fetchFromDatabase(id);\n        });\n    }\n\n    private UserProfile fetchFromDatabase(String id) {\n        return new UserProfile(id, \"Active\");\n    }\n}",
              explanation: "ConcurrentHashMap guarantees fetchFromDatabase is executed atomically per key."
            },
            tradeoffs: "Never perform long-running recursive map operations inside the computeIfAbsent lambda; modifying the same map recursively can cause a deadlock.",
            followUpQuestions: [
              {
                question: "What happens if the computation inside computeIfAbsent throws an exception?",
                answer: "The exception propagates to the caller, and no entry is added to the map."
              }
            ],
            usedInProduction: "Guava Cache and Caffeine cache internals, database connection pool initializers, and token memoizers.",
            relatedTopics: ["ConcurrentHashMap", "Cache Stampede", "Atomicity"]
          }
        },
        {
          id: "j8-util-6",
          question: "How does Map.merge() work and how does it simplify counting and aggregations?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-14",
          answer: {
            quickAnswer: "Map.merge(key, value, remappingBiFunction) inserts the value if key is absent; if key is present, it applies the BiFunction to merge existing value and new value into a single updated result.",
            mentalModel: "A bank deposit teller: if an account does not exist, open it with the initial deposit amount. If the account already exists, add the new deposit to the current balance.",
            whatItIs: "merge(K key, V value, BiFunction<? super V, ? super V, ? extends V> remappingFunction): (1) If key is not present or mapped to null, associates it with the given non-null value. (2) Otherwise, invokes the remapping function with (existingValue, newValue). (3) If the remapping function returns null, the key is removed from the map.",
            whyItExists: "The most concise and expressive idiom in Java 8 for frequency counting, value accumulation, and dictionary merging.",
            codeDemo: {
              language: "java",
              code: "List<String> words = Arrays.asList(\"apple\", \"banana\", \"apple\", \"cherry\", \"banana\", \"apple\");\nMap<String, Integer> wordCounts = new HashMap<>();\n\n// One-liner frequency counter using Map.merge:\nfor (String word : words) {\n    // If absent: set to 1; If present: sum (existingCount, 1) -> existingCount + 1\n    wordCounts.merge(word, 1, Integer::sum);\n}\nSystem.out.println(wordCounts); // {banana=2, cherry=1, apple=3}\n\n// Merging user permissions:\nMap<String, String> userPermissions = new HashMap<>();\nuserPermissions.put(\"Alice\", \"READ\");\n// Merging \"WRITE\" permission:\nuserPermissions.merge(\"Alice\", \"WRITE\", (oldPerm, newPerm) -> oldPerm + \",\" + newPerm);\nSystem.out.println(userPermissions.get(\"Alice\")); // \"READ,WRITE\"",
              explanation: "Integer::sum acts as the remapping function combining existing count and new count."
            },
            tradeoffs: "If the remapping function returns null, merge() removes the key; be mindful of null returns.",
            followUpQuestions: [
              {
                question: "What happens if you pass a null value to Map.merge(key, null, fn)?",
                answer: "It throws a NullPointerException immediately; value and remappingFunction cannot be null."
              }
            ],
            usedInProduction: "Aggregating metrics in real-time streaming counters, word-count analytics, and merging configuration overrides.",
            relatedTopics: ["Map.compute", "Integer::sum", "Frequency Counting"]
          }
        },
        {
          id: "j8-util-7",
          question: "What improvements were made to Comparator in Java 8 (Comparator.comparing, thenComparing, reversed, nullsFirst)?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-15",
          answer: {
            quickAnswer: "Java 8 transformed Comparator into a fluent functional API, adding static factory methods (comparing, naturalOrder) and default combinator methods (thenComparing, reversed, nullsFirst, nullsLast).",
            mentalModel: "Lego building blocks for sorting: instead of carving a custom wooden block every time, you snap together small standard bricks: 'sort by Last Name, then by First Name, with nulls placed at the very top'.",
            whatItIs: "Pre-Java 8 required writing cumbersome nested ternary if-else comparator classes. Java 8 introduced: (1) Comparator.comparing(keyExtractor). (2) Comparator.comparingInt / Double / Long (zero autoboxing). (3) thenComparing(secondaryExtractor): executes when primary keys are equal. (4) reversed(): inverts order. (5) nullsFirst() / nullsLast(): handles null elements safely without NPE.",
            whyItExists: "Brings declarative, multi-field sorting composability to Java collections and streams.",
            codeDemo: {
              language: "java",
              code: "class Person {\n    String lastName;\n    String firstName;\n    int age;\n    Person(String last, String first, int age) {\n        this.lastName = last; this.firstName = first; this.age = age;\n    }\n    public String getLastName() { return lastName; }\n    public String getFirstName() { return firstName; }\n    public int getAge() { return age; }\n    public String toString() { return lastName + \", \" + firstName + \" (\" + age + \")\"; }\n}\n\nList<Person> people = Arrays.asList(\n    new Person(\"Smith\", \"John\", 40),\n    new Person(\"Smith\", \"Alice\", 25),\n    new Person(\"Brown\", \"Charlie\", 30),\n    null\n);\n\n// Multi-level sort: nulls first -> lastName -> firstName -> age descending\nComparator<Person> complexComparator = Comparator.nullsFirst(\n    Comparator.comparing(Person::getLastName)\n        .thenComparing(Person::getFirstName)\n        .thenComparingInt(Person::getAge)\n);\n\npeople.sort(complexComparator);\npeople.forEach(System.out::println);",
              explanation: "Composes null-handling, primary, secondary, and primitive age sorting in a single readable statement."
            },
            tradeoffs: "Be careful with comparator.reversed(): chained at the end of thenComparing, it only reverses the final tie-breaker unless enclosed in parentheses.",
            followUpQuestions: [
              {
                question: "Why does comparingInt exist when comparing(Person::getAge) works?",
                answer: "comparingInt(ToIntFunction) avoids autoboxing int to Integer, providing superior performance in large collections."
              }
            ],
            usedInProduction: "Displaying multi-column table sorting in web applications and database query order specifications.",
            relatedTopics: ["thenComparing", "nullsFirst", "Fluent API"]
          }
        },
        {
          id: "j8-util-8",
          question: "What is the Java 8 Base64 API and how does it replace legacy unstandardized Base64 encoders?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-10-16",
          answer: {
            quickAnswer: "Java 8 introduced java.util.Base64 as an official, high-performance, RFC-compliant API with three variants: Basic, URL-safe, and MIME, replacing legacy proprietary sun.misc.BASE64Encoder.",
            mentalModel: "Translating binary machine code into plain readable text alphabet so it can safely travel over text-only postal routes (HTTP, email headers) without being corrupted.",
            whatItIs: "Pre-Java 8 had no official Base64 standard API, forcing developers to use internal sun.misc.BASE64Encoder (which generated compiler warnings and broke in Java 9) or external Apache Commons Codec. Java 8's java.util.Base64 provides: (1) Base64.getEncoder() / getDecoder() for standard RFC 4648. (2) getUrlEncoder() (replaces '+' with '-' and '/' with '_'). (3) getMimeEncoder() (breaks lines at 76 chars with CRLF).",
            whyItExists: "Provides a standardized, hardware-accelerated, official JDK implementation for encoding binary payloads.",
            codeDemo: {
              language: "java",
              code: "String originalText = \"Hello Java 8 World!\";\n\n// 1. Basic RFC 4648 Encoder\nString encoded = Base64.getEncoder()\n    .encodeToString(originalText.getBytes(StandardCharsets.UTF_8));\nSystem.out.println(\"Encoded: \" + encoded);\n\n// Decoding back:\nbyte[] decodedBytes = Base64.getDecoder().decode(encoded);\nString decoded = new String(decodedBytes, StandardCharsets.UTF_8);\nSystem.out.println(\"Decoded: \" + decoded); // \"Hello Java 8 World!\"\n\n// 2. URL-Safe Base64 (safe for web URLs and JWT tokens):\nString urlSafe = Base64.getUrlEncoder()\n    .encodeToString(\"user?query=123+456\".getBytes(StandardCharsets.UTF_8));\nSystem.out.println(\"URL Safe: \" + urlSafe);",
              explanation: "Base64.getUrlEncoder ensures tokens contain no characters that require percent-encoding in HTTP URLs."
            },
            tradeoffs: "Always specify StandardCharsets.UTF_8 when converting strings to byte arrays to prevent platform-dependent character encoding issues.",
            followUpQuestions: [
              {
                question: "Can Base64 encode an OutputStream directly?",
                answer: "Yes, Base64.getEncoder().wrap(outputStream) wraps an OutputStream to encode data on the fly without loading all bytes in memory."
              }
            ],
            usedInProduction: "JSON Web Tokens (JWT) signature encoding, Basic Auth HTTP headers, and binary image attachments.",
            relatedTopics: ["JWT", "RFC 4648", "StandardCharsets"]
          }
        }
      ]
    }
  ]
};
