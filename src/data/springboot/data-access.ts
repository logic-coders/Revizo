import { Category } from "@/types";

export const springBootDataCategory: Category = {
  id: "sb-data",
  title: "Data Access & Persistence",
  subTopics: [
    {
      id: "spring-data-jpa-repositories",
      title: "Spring Data JPA & Repositories",
      questions: [
        {
          id: "sb-jpa-1",
          question: "What is Spring Data JPA and how does it simplify data access?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-09-14",
          answer: {
            quickAnswer: "Spring Data JPA generates repository implementations automatically from interfaces — you declare 'findByDepartment(String dept)' and Spring creates the JPQL/SQL query at startup, zero boilerplate DAO code needed.",
            mentalModel: "Think of an executive assistant. Instead of writing out step-by-step instructions for filing paperwork, you just say 'find all documents from finance' and the assistant knows where the files are, how to search them, and brings you the results.",
            whatItIs: "Spring Data JPA is an abstraction over JPA (Hibernate) that reduces data access boilerplate. By extending JpaRepository<Entity, ID>, you get CRUD operations, pagination, sorting, and derived query methods generated at runtime. Key features: method name derived queries, @Query (JPQL and native SQL), pagination (Pageable/Page), sorting (Sort), specifications (dynamic queries), and auditing (@CreatedDate, @LastModifiedDate).",
            whyItExists: "Without Spring Data, every DAO required: EntityManager injection, manual JPQL queries, transaction handling, pagination logic, and boilerplate exception translation. For a typical entity, this meant 100+ lines of repetitive code. Spring Data reduces it to an interface declaration — the implementation is generated at startup, eliminating the most tedious layer of enterprise Java development.",
            codeDemo: {
              language: "java",
              code: "// Entity\n@Entity\n@Table(name = \"employees\")\npublic class Employee {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String name;\n    private String department;\n    private Double salary;\n}\n\n// Repository — Spring generates implementation!\npublic interface EmployeeRepo\n        extends JpaRepository<Employee, Long> {\n\n    // Derived query from method name\n    List<Employee> findByDepartment(String department);\n\n    // Custom JPQL\n    @Query(\"SELECT e FROM Employee e WHERE e.salary > :min\")\n    List<Employee> findHighEarners(@Param(\"min\") double min);\n\n    // Pagination built-in\n    Page<Employee> findByDepartment(String dept, Pageable p);\n}\n\n// Usage in service\n@Service\n@Transactional\npublic class EmployeeService {\n    private final EmployeeRepo repo;\n\n    public Page<Employee> getByDept(String dept, int page) {\n        return repo.findByDepartment(dept,\n            PageRequest.of(page, 20, Sort.by(\"name\")));\n    }\n}",
              explanation: "Method name parsing: findBy + FieldName + Keyword (And, Or, Between, LessThan, Like, OrderBy). Spring generates SQL at startup, catching query errors early."
            },
            tradeoffs: "Derived queries get unreadable fast: findByDepartmentAndSalaryGreaterThanAndNameContainingIgnoreCaseOrderByHireDateDesc — use @Query instead. N+1 query problem is still possible with lazy-loaded relationships; use @EntityGraph or JOIN FETCH. Spring Data hides the generated SQL — enable spring.jpa.show-sql=true during development. For complex analytics or batch operations, consider dropping to JdbcTemplate or native queries rather than forcing JPA.",
            followUpQuestions: [
              {
                question: "How do you handle the N+1 query problem with Spring Data JPA?",
                answer: "Use @EntityGraph on repository methods to specify which associations to fetch eagerly in a single query: @EntityGraph(attributePaths = {'department', 'projects'}) List<Employee> findAll(). Alternatively, use JPQL JOIN FETCH: @Query('SELECT e FROM Employee e JOIN FETCH e.department'). Avoid FetchType.EAGER on entity mappings — it applies globally and can't be turned off per query."
              },
              {
                question: "What's the difference between JpaRepository and CrudRepository?",
                answer: "CrudRepository provides basic CRUD (save, findById, delete, findAll). JpaRepository extends it with JPA-specific features: batch operations (saveAll, flush, deleteInBatch), pagination (findAll(Pageable)), sorting, and Example-based queries. Use JpaRepository unless you explicitly want to limit the API surface."
              }
            ],
            usedInProduction: "At DoorDash, Spring Data JPA repositories with custom @Query methods power the restaurant search and order management systems — Specification-based dynamic queries handle complex filters (cuisine, rating, distance, price range) that would be unmaintainable as derived method names.",
            relatedTopics: [
              "Dependency Injection",
              "Hibernate/JPA",
              "Database Transactions",
              "Connection Pooling (HikariCP)"
            ]
          }
        },
        {
          id: "sb-crud-vs-jpa-repo",
          question: "What is the hierarchy between Repository, CrudRepository, PagingAndSortingRepository, and JpaRepository?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Repository is a marker interface. CrudRepository adds basic CRUD methods. PagingAndSortingRepository adds pagination and sorting methods. JpaRepository extends both and adds JPA-specific operations (`flush()`, `saveAndFlush()`, `deleteInBatch()`). In Spring Data 3.x, `ListCrudRepository` returns `List<T>` instead of `Iterable<T>`.",
            mentalModel: "Think of driver licenses: Class C lets you drive a standard sedan (CrudRepository). Class B lets you drive a bus with passenger groups (PagingAndSorting). Class A commercial license lets you drive 18-wheelers with hydraulic trailers and heavy industrial equipment (JpaRepository).",
            whatItIs: "The interface inheritance chain: `Repository` <- `CrudRepository` <- `PagingAndSortingRepository` <- `JpaRepository`. In Spring Data 3.x (Spring Boot 3), `PagingAndSortingRepository` no longer extends `CrudRepository` directly to allow composable repository design.",
            whyItExists: "Allows developers to expose only the exact repository operations needed for a specific domain model, preventing accidental batch deletions or uncontrolled pagination queries.",
            comparisonTable: {
              title: "Spring Data Repository Hierarchy Comparison Matrix",
              headers: ["Interface", "Primary Capabilities", "Return Type for findAll()", "JPA-Specific Operations", "When to Use"],
              rows: [
                ["Repository<T, ID>", "Central marker interface for Spring Data typing", "N/A (marker only)", "None", "Creating custom base repositories without exposing standard CRUD methods"],
                ["CrudRepository<T, ID>", "Basic CRUD operations (save, findById, delete, count)", "Iterable<T>", "None (technology agnostic)", "Simple microservices needing lightweight CRUD across NoSQL or SQL"],
                ["ListCrudRepository<T, ID>", "Modern Spring Data 3.x CRUD interface", "List<T> (eliminates casting from Iterable)", "None", "Standard Spring Boot 3 applications avoiding Iterable boilerplate"],
                ["PagingAndSortingRepository<T, ID>", "Pagination (Pageable) and Sorting (Sort)", "Page<T> / Iterable<T>", "None", "Endpoints exposing paginated results without needing full JPA batching"],
                ["JpaRepository<T, ID>", "Full JPA suite: flush, batch deletes, query by example, entity graphs", "List<T>", "flush(), saveAndFlush(), deleteAllInBatch(), getReferenceById()", "Default choice for relational Spring Data JPA enterprise applications"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "public interface Repository<T, ID> {} // Marker interface\n\npublic interface CrudRepository<T, ID> extends Repository<T, ID> {\n    <S extends T> S save(S entity);\n    Optional<T> findById(ID id);\n    void deleteById(ID id);\n}\n\n// Spring Data 3.0+ interface:\npublic interface ListCrudRepository<T, ID> extends CrudRepository<T, ID> {\n    <S extends T> List<S> saveAll(Iterable<S> entities);\n    List<T> findAll(); // Returns List<T> instead of Iterable<T>!\n}\n\npublic interface JpaRepository<T, ID> extends ListCrudRepository<T, ID>, ListPagingAndSortingRepository<T, ID> {\n    void flush();\n    <S extends T> S saveAndFlush(S entity);\n    void deleteAllInBatch();\n}"
            },
            tradeoffs: "Using `JpaRepository` everywhere is common, but it exposes dangerous bulk operations like `deleteAllInBatch()` which executes a raw SQL `DELETE FROM table` bypassing JPA cascading and entity lifecycle callbacks.",
            theyMightAskNext: [
              {
                question: "What is the difference between save() and saveAndFlush() in JpaRepository?",
                answer: "`save()` delays writing to the database until the transaction commits or Hibernate decides to flush. `saveAndFlush()` executes SQL INSERT/UPDATE immediately and flushes the persistence context to the database, useful for getting DB-generated IDs or triggers within the same transaction."
              }
            ],
            usedInProduction: "Standard across 95% of Java enterprise applications. Domain-driven design advocates often declare custom base interfaces to prevent arbitrary `findAll()` calls in multi-million row tables.",
            relatedTopics: ["sb-jpa-1", "sb-derived-queries-jpql", "sb-jpa-pagination-sorting"]
          }
        },
        {
          id: "sb-derived-queries-jpql",
          question: "When should you use Derived Query Methods vs @Query (JPQL) vs Native SQL queries in Spring Data JPA?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Use Derived Queries for simple 1-2 property lookups (`findByEmail`). Use @Query (JPQL) for multi-table joins, aggregations, and database-independent object queries. Use Native SQL (`nativeQuery = true`) strictly for database-specific features (PostgreSQL JSONB, CTEs, full-text search) or performance-critical bulk operations.",
            mentalModel: "Derived query is ordering off a simple fast-food menu. JPQL is ordering custom dishes with dietary preferences from an international chef. Native SQL is stepping into the kitchen and cooking on the specialized gas grill yourself.",
            whatItIs: "Derived queries parse method names at startup. JPQL queries operate on entity names and fields (type-safe in entity model). Native queries run raw SQL directly against the database engine.",
            whyItExists: "Balances developer velocity for common queries with the raw power of vendor-specific SQL optimization when needed.",
            comparisonTable: {
              title: "Derived Query Methods vs @Query (JPQL) vs Native SQL",
              headers: ["Query Strategy", "Abstraction Target", "Validation Timing", "Database Portability", "Ideal Production Use Case"],
              rows: [
                ["Derived Query Methods", "Entity property naming conventions (`findByEmailAndStatus`)", "Application startup (fails fast on property typos)", "100% portable across all SQL databases", "Simple lookups by 1–2 fields, exists checks, and count queries"],
                ["@Query (JPQL / HQL)", "JPA Entity classes & object associations (`JOIN FETCH o.items`)", "Application startup (syntax checked against entity model)", "High (database-agnostic ANSI SQL abstraction)", "Complex business queries, multi-table joins, DTO constructor expressions"],
                ["Native SQL (`nativeQuery = true`)", "Physical database tables and raw columns", "Runtime (executed directly by database driver)", "Zero (tied directly to PostgreSQL, MySQL, Oracle, etc.)", "Vendor-specific features (PostgreSQL JSONB, CTEs, full-text search, spatial queries)"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "public interface OrderRepository extends JpaRepository<Order, UUID> {\n    // 1. Derived Query (Simple)\n    List<Order> findByCustomerIdAndStatus(UUID customerId, String status);\n\n    // 2. JPQL Query (Entity-based, DB-independent)\n    @Query(\"SELECT o FROM Order o JOIN FETCH o.items WHERE o.totalAmount > :minAmount\")\n    List<Order> findLargeOrdersWithItems(@Param(\"minAmount\") BigDecimal minAmount);\n\n    // 3. Native SQL Query (Vendor-specific, e.g. PostgreSQL JSONB or CTE)\n    @Query(value = \"SELECT * FROM orders o WHERE o.metadata->>'channel' = :channel\", nativeQuery = true)\n    List<Order> findByJsonbChannel(@Param(\"channel\") String channel);\n\n    // 4. Modifying Query (Requires @Modifying and @Transactional)\n    @Modifying\n    @Query(\"UPDATE Order o SET o.status = :newStatus WHERE o.id = :id\")\n    int updateStatus(@Param(\"id\") UUID id, @Param(\"newStatus\") String newStatus);\n}"
            },
            tradeoffs: "Native queries forfeit database portability (e.g. migrating from PostgreSQL to Oracle) and do not support dynamic sorting with `Sort` objects. With `@Modifying`, always specify `clearAutomatically = true` to prevent stale entity state in the Hibernate first-level cache.",
            theyMightAskNext: [
              {
                question: "Why does @Modifying require clearAutomatically = true?",
                answer: "Bulk UPDATE/DELETE queries bypass Hibernate's Persistence Context and execute directly in SQL. Entities already in memory remain unchanged and out-of-sync unless `clearAutomatically = true` clears the first-level cache."
              }
            ],
            usedInProduction: "Standard practice: 70% derived queries and JPQL for business logic; 30% native queries for complex reporting dashboards and database-specific JSONB queries.",
            relatedTopics: ["sb-jpa-1", "sb-n-plus-1-problem", "sb-transaction-management"]
          }
        },
        {
          id: "sb-jpa-projections",
          question: "How do Projections work in Spring Data JPA and why are Record/Class Projections better than Entity queries?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Projections retrieve only specific subset columns from database tables rather than loading entire heavy JPA entities. Class/Record Projections (DTO projections) provide compile-time safety and zero Hibernate dirty-checking overhead.",
            mentalModel: "Think of an employee ID badge: security guards only need your name and photo (projection). If they demanded your entire medical history, tax returns, and childhood photos (full JPA entity) every time you walked through the door, the lobby would grind to a halt.",
            whatItIs: "Two main types: 1. Interface-based projections (closed uses exact getter names, open uses `@Value(\"#{target.first + ' ' + target.last}\")`), 2. Class/Record-based DTO projections (`SELECT new com.pkg.UserDto(u.id, u.name) FROM User u`).",
            whyItExists: "Prevents OutOfMemoryErrors and high database I/O when loading tables with 40+ columns or huge text/JSON columns when you only need 2 fields for a dropdown or summary table.",
            codeDemo: {
              language: "java",
              code: "// Recommended: Java 17 Record Projection\npublic record UserSummaryDto(Long id, String username, String email) {}\n\npublic interface UserRepository extends JpaRepository<User, Long> {\n    // Class-based constructor expression in JPQL\n    @Query(\"\"\"\n        SELECT new com.company.dto.UserSummaryDto(u.id, u.username, u.email)\n        FROM User u WHERE u.active = true\n    \"\"\")\n    List<UserSummaryDto> findAllActiveUsers();\n\n    // Interface-based projection (Spring creates dynamic proxy)\n    interface UserEmailOnly {\n        String getEmail();\n    }\n    List<UserEmailOnly> findByDepartment(String dept);\n}"
            },
            tradeoffs: "Entities returned via DTO projections are not managed by Hibernate's Persistence Context. You cannot mutate them and expect automatic dirty checking to save them to the database.",
            theyMightAskNext: [
              {
                question: "What is the difference between Closed and Open interface projections?",
                answer: "Closed projections have getters matching entity property names exactly, allowing Spring Data to optimize the SQL SELECT statement. Open projections use SpEL `@Value`, forcing Spring to fetch the entire entity first before evaluating the expression."
              }
            ],
            usedInProduction: "Used in all high-traffic read endpoints (search results, autocomplete, paginated grid views) to achieve 5x faster serialization and 80% lower memory consumption.",
            relatedTopics: ["sb-jpa-1", "sb-n-plus-1-problem", "sb-jpa-pagination-sorting"]
          }
        },
        {
          id: "sb-jpa-auditing",
          question: "How do you implement automatic entity auditing (@CreatedDate, @LastModifiedDate, @CreatedBy) in Spring Data JPA?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "1. Annotate configuration with `@EnableJpaAuditing`. 2. Annotate base entity class with `@EntityListeners(AuditingEntityListener.class)`. 3. Annotate audit fields with `@CreatedDate`, `@LastModifiedDate`, `@CreatedBy`, `@LastModifiedBy`. 4. Implement `AuditorAware<String>` bean hooked to Spring Security.",
            mentalModel: "Like an automatic security camera and timestamp log at an evidence locker: whenever an evidence box is opened or modified, the badge reader automatically stamps the officer's ID and clock time on the box without the officer having to write it down manually.",
            whatItIs: "Spring Data JPA interceptor mechanism using JPA lifecycle callbacks (`@PrePersist`, `@PreUpdate`) via `AuditingEntityListener` to populate metadata columns before database writes.",
            whyItExists: "Mandatory compliance requirement (SOC2, ISO 27001, HIPAA) in enterprise systems to track who created/modified records and when, without cluttering service logic.",
            codeDemo: {
              language: "java",
              code: "@MappedSuperclass\n@EntityListeners(AuditingEntityListener.class)\npublic abstract class BaseAuditableEntity {\n    @CreatedDate\n    @Column(nullable = false, updatable = false)\n    private Instant createdAt;\n\n    @LastModifiedDate\n    @Column(nullable = false)\n    private Instant updatedAt;\n\n    @CreatedBy\n    @Column(updatable = false)\n    private String createdBy;\n\n    @LastModifiedBy\n    private String lastModifiedBy;\n}\n\n// AuditorAware hooked to Spring Security:\n@Component\npublic class SecurityAuditorAware implements AuditorAware<String> {\n    @Override\n    public Optional<String> getCurrentAuditor() {\n        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())\n            .filter(Authentication::isAuthenticated)\n            .map(Authentication::getName);\n    }\n}"
            },
            tradeoffs: "If saving entities from background threads, `@Async` methods, or Kafka listeners where `SecurityContextHolder` is empty, `AuditorAware` will return `Optional.empty()` unless you manually populate a system user context.",
            theyMightAskNext: [
              {
                question: "What is Hibernate Envers and how does it differ from Spring Data JPA Auditing?",
                answer: "Spring Data JPA Auditing only records the last updated user and timestamp on the current row. Hibernate Envers creates full audit history tables (e.g. `orders_AUD`) that record the entire history of every revision ever made to the entity."
              }
            ],
            usedInProduction: "Standard base class in 100% of enterprise CRUD applications across banking, healthcare, and e-commerce platforms.",
            relatedTopics: ["sb-jpa-1", "sb-security-architecture"]
          }
        },
        {
          id: "sb-jpa-pagination-sorting",
          question: "How do Page<T> and Slice<T> differ in Spring Data JPA pagination, and why does Page<T> cause performance bottlenecks?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "`Page<T>` executes TWO queries: the actual data query (LIMIT/OFFSET) and an expensive `COUNT(*)` query to calculate total pages. `Slice<T>` fetches only `limit + 1` rows to know if a 'next page' exists, executing ZERO count queries.",
            mentalModel: "Think of an infinite scroll social feed vs a book index: `Page<T>` counts every single grain of sand on the beach before telling you how many sandcastles you can build. `Slice<T>` just looks at the next step ahead: 'Is there another pebble? Yes? Keep walking.'",
            whatItIs: "`Pageable pageable = PageRequest.of(page, size, Sort.by(\"createdAt\").descending());`. Returning `Page<T>` provides `getTotalElements()` and `getTotalPages()`. Returning `Slice<T>` provides `hasNext()` and `hasPrevious()`.",
            whyItExists: "On large tables (10+ million rows), `SELECT COUNT(*)` requires a full index or table scan that can take 5–10 seconds, destroying API response times.",
            comparisonTable: {
              title: "Page<T> vs Slice<T> vs Keyset (Cursor) Pagination",
              headers: ["Pagination Type", "Database Queries Executed", "Count Query Overhead", "Navigation Capabilities", "Best Production Architecture"],
              rows: [
                ["Page<T>", "2 queries: Data query (LIMIT/OFFSET) + Count query (`SELECT COUNT(*)`)", "Severe on large tables: full table or index scan for count", "Numbered pages ('Page 4 of 250'), total element count, jump to page", "Desktop admin portals and back-office grids where exact total count is required"],
                ["Slice<T>", "1 query: Data query with `LIMIT size + 1` (checks if next record exists)", "Zero count queries: eliminates COUNT(*) completely", "Binary navigation: `hasNext()` and `hasPrevious()` only", "Mobile app feeds, infinite scroll, and 'Load More' buttons on large datasets"],
                ["Keyset / Cursor Pagination", "1 query: Indexed range query (`WHERE id > :lastId ORDER BY id LIMIT size`)", "Zero count queries; constant O(1) index seek time", "Forward / backward cursor traversal only (no random page jump)", "High-throughput public APIs, social media timelines (Twitter/Instagram feeds)"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "public interface TransactionRepository extends JpaRepository<Transaction, UUID> {\n    // ❌ Slow on big tables: Executes SELECT ... LIMIT 20 AND SELECT COUNT(*) ...\n    Page<Transaction> findByAccountId(UUID accountId, Pageable pageable);\n\n    // ✅ Fast: Executes SELECT ... LIMIT 21 (Zero count queries!)\n    // Perfect for infinite scroll / mobile apps / 'Load More' buttons\n    Slice<Transaction> findSliceByAccountId(UUID accountId, Pageable pageable);\n}\n\n// Usage in Controller:\n@GetMapping(\"/transactions\")\npublic ResponseEntity<Slice<TxDto>> getTransactions(\n        @RequestParam UUID accountId,\n        @RequestParam(defaultValue = \"0\") int page,\n        @RequestParam(defaultValue = \"20\") int size) {\n    Pageable pageable = PageRequest.of(page, size, Sort.by(\"createdAt\").descending());\n    return ResponseEntity.ok(txRepo.findSliceByAccountId(accountId, pageable).map(TxDto::from));\n}"
            },
            tradeoffs: "If the UI design strictly demands page numbers ('Page 1 of 53,200'), you must use `Page<T>`, but consider caching the total count or using keyset/cursor-based pagination instead of OFFSET.",
            theyMightAskNext: [
              {
                question: "What is Keyset (Cursor-based) pagination and why is OFFSET pagination slow?",
                answer: "With large offsets (`OFFSET 1000000 LIMIT 20`), the database must scan and discard 1,000,000 rows. Keyset pagination queries `WHERE id > :lastSeenId ORDER BY id ASC LIMIT 20`, utilizing the index directly with constant O(1) seek time."
              }
            ],
            usedInProduction: "Mobile feeds (Instagram, Twitter, LinkedIn) and high-volume transaction history systems use `Slice<T>` or Keyset pagination to prevent database CPU spikes.",
            relatedTopics: ["sb-jpa-1", "sb-jpa-projections", "sb-n-plus-1-problem"]
          }
        }
      ]
    },
    {
      id: "transaction-management",
      title: "Transaction Management & Pitfalls",
      questions: [
        {
          id: "sb-transactional-1",
          question: "Why might @Transactional NOT roll back, even when an exception is thrown?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "@Transactional only rolls back on RuntimeException (unchecked) by default — checked exceptions do NOT trigger rollback. It also fails silently on self-invocation (same class), non-public methods, or swallowed exceptions.",
            mentalModel: "Spring's @Transactional works by wrapping your class in a proxy — imagine a security guard at the building entrance. The guard only intercepts visitors through the front door (calls from other beans). If you move between rooms inside the building (self-invocation), the guard never sees it and can't roll back the transaction.",
            whatItIs: "Spring implements @Transactional using AOP proxies. When another bean calls a @Transactional method, Spring intercepts, begins a transaction, runs the method, then commits or rolls back. The proxy mechanism has several well-known pitfalls that catch even experienced developers.",
            whyItExists: "Managing begin/commit/rollback manually in every service method is error-prone. @Transactional externalizes this declaratively — but the proxy-based implementation has inherent limitations you must understand.",
            codeDemo: {
              language: "java",
              code: "// ❌ PITFALL 1: Checked exceptions do NOT roll back by default\n@Transactional\npublic void transferFunds() throws InsufficientFundsException {\n    debit(account);\n    credit(targetAccount); // throws checked ex → COMMITS!\n}\n// FIX:\n@Transactional(rollbackFor = InsufficientFundsException.class)\npublic void transferFunds() throws InsufficientFundsException { ... }\n\n// ❌ PITFALL 2: Self-invocation — proxy is bypassed\n@Service\npublic class PaymentService {\n    public void processPayment() {\n        this.savePayment(); // Direct call — @Transactional IGNORED!\n    }\n    @Transactional\n    public void savePayment() {\n        paymentRepo.save(...); // Runs WITHOUT transaction!\n    }\n}\n// FIX: Move savePayment() to a separate @Service\n\n// ❌ PITFALL 3: Exception swallowed — no rollback\n@Transactional\npublic void debitAccount(long id, double amount) {\n    try {\n        accountRepo.debit(id, amount);\n        auditService.log(id); // throws RuntimeException\n    } catch (Exception e) {\n        log.error(\"Error\", e); // Swallowed → COMMITS!\n    }\n}\n\n// ❌ PITFALL 4: Private method — proxy can't intercept\n@Transactional\nprivate void internalSave() { ... } // Silently ignored!\n\n// ❌ PITFALL 5: Wrong propagation\n@Transactional(propagation = Propagation.REQUIRES_NEW)\npublic void inner() { ... } // Always a fresh, separate transaction"
            },
            tradeoffs: "The proxy approach is clean but opaque — mistakes are silent. Always use @Transactional(rollbackFor = Exception.class) for safety in financial code. Write integration tests with @DataJpaTest or Testcontainers to verify rollback under failure.",
            theyMightAskNext: [
              {
                question: "What is the difference between REQUIRED, REQUIRES_NEW, and NESTED propagation?",
                answer: "REQUIRED (default): joins existing transaction or creates one. REQUIRES_NEW: suspends current and starts a fresh one — outer unaffected by inner outcome. NESTED: uses a savepoint within the outer — inner can rollback to savepoint while outer still commits."
              },
              {
                question: "What happens if money is debited but the application crashes before credit?",
                answer: "Inside a single @Transactional, the uncommitted debit rolls back on restart. Across microservices, you need the Saga pattern (choreography or orchestration) or Outbox pattern — the industry standard for distributed transactions."
              }
            ],
            usedInProduction: "In banking systems, @Transactional(rollbackFor = Exception.class) is always used. Teams validate rollback behavior with Testcontainers integration tests. Self-invocation bugs are caught via Spring proxy validation in code review.",
            relatedTopics: [
              "Transaction Isolation Levels",
              "Spring Bean Lifecycle",
              "Saga Pattern",
              "Spring AOP and Proxies"
            ]
          }
        },
        {
          id: "sb-transaction-propagation",
          question: "Can you explain all 7 Propagation types in Spring @Transactional with concrete real-world use cases?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "1. REQUIRED (default: joins current or creates new), 2. REQUIRES_NEW (suspends current, always creates fresh independent transaction), 3. NESTED (uses JDBC savepoint inside existing transaction), 4. MANDATORY (must run inside existing transaction or throws exception), 5. SUPPORTS (runs in transaction if present, non-transactional if not), 6. NOT_SUPPORTED (suspends current transaction and runs non-transactionally), 7. NEVER (throws exception if transaction exists).",
            mentalModel: "Think of joining a conversation: REQUIRED joins if people are already talking, starts one if quiet. REQUIRES_NEW steps into a private soundproof phone booth to make a separate call. NESTED writes a bookmark on the whiteboard so you can erase back to it. NEVER slaps a hand if anyone starts a conversation.",
            whatItIs: "Propagation enum in `org.springframework.transaction.annotation` that defines how transactions boundaries interact when one transactional method calls another.",
            whyItExists: "Crucial for audit logs, email dispatch counters, and payment retries where child operations must commit even if the parent business transaction fails and rolls back.",
            comparisonTable: {
              title: "Spring @Transactional: All 7 Propagation Behaviors Compared",
              headers: ["Propagation Type", "If Transaction Exists", "If No Transaction Exists", "Rollback Boundary Impact", "Typical Real-World Use Case"],
              rows: [
                ["REQUIRED (Default)", "Joins existing transaction", "Creates a new transaction", "Rollback in child marks entire outer transaction for rollback", "Standard CRUD service operations; shared unit of work"],
                ["REQUIRES_NEW", "Suspends current; creates new independent transaction", "Creates a new transaction", "Child commits or rolls back independently of parent", "Audit logging, payment gateway attempts, security token counters"],
                ["NESTED", "Creates a JDBC savepoint inside existing transaction", "Creates a new transaction", "Child can roll back to savepoint without failing outer transaction", "Sub-tasks where partial failure is recoverable (e.g. optional notification)"],
                ["MANDATORY", "Joins existing transaction", "Throws IllegalTransactionStateException", "Same as parent", "Internal helper methods that must never execute outside a transaction"],
                ["SUPPORTS", "Joins existing transaction", "Runs non-transactionally", "Participates if active; no-op if absent", "Read-only lookup methods called from both transactional and non-transactional code"],
                ["NOT_SUPPORTED", "Suspends current transaction", "Runs non-transactionally", "Completely detached from transaction", "Long-running external network I/O, heavy file generation, third-party API calls"],
                ["NEVER", "Throws IllegalTransactionStateException", "Runs non-transactionally", "N/A", "Operations strictly incompatible with open database transactions"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "@Service\npublic class OrderService {\n    private final AuditService auditService;\n    private final OrderRepository orderRepo;\n\n    @Transactional(propagation = Propagation.REQUIRED)\n    public void placeOrder(Order order) {\n        try {\n            orderRepo.save(order);\n            processPayment(order); // Might fail and throw RuntimeException\n        } catch (Exception ex) {\n            // Audit log MUST be saved even though order rolled back!\n            auditService.logFailure(order.getId(), ex.getMessage());\n            throw ex; // Triggers rollback for Order\n        }\n    }\n}\n\n@Service\npublic class AuditService {\n    // Suspends order transaction, commits audit log independently to DB!\n    @Transactional(propagation = Propagation.REQUIRES_NEW)\n    public void logFailure(UUID orderId, String error) {\n        auditRepo.save(new AuditRecord(orderId, error));\n    }\n}"
            },
            tradeoffs: "REQUIRES_NEW holds TWO physical database connections simultaneously (one suspended, one active). High usage under load can quickly exhaust the HikariCP connection pool and cause deadlocks.",
            theyMightAskNext: [
              {
                question: "How does NESTED differ from REQUIRES_NEW?",
                answer: "REQUIRES_NEW uses a separate physical connection and independent commit/rollback. NESTED uses a single physical connection with a JDBC savepoint; if NESTED fails, it rolls back only to the savepoint, allowing the parent to continue and commit."
              }
            ],
            usedInProduction: "Standard pattern in payment gateways: audit logs and rate-limit counters execute with `REQUIRES_NEW`, while core checkout operations execute with `REQUIRED`.",
            relatedTopics: ["sb-transactional-1", "sb-transaction-isolation", "sb-hikaricp-connection-pool"]
          }
        },
        {
          id: "sb-transaction-isolation",
          question: "What are the 4 Transaction Isolation Levels and what concurrency anomalies do they prevent?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "1. READ UNCOMMITTED (allows Dirty Reads), 2. READ COMMITTED (prevents Dirty Reads; standard default in PostgreSQL/Oracle), 3. REPEATABLE READ (prevents Dirty & Non-Repeatable Reads; MySQL InnoDB default), 4. SERIALIZABLE (prevents all anomalies including Phantom Reads via strict locking or MVCC).",
            mentalModel: "Think of viewing a shared Google Doc: Read Uncommitted sees text while the author is still typing backspaces. Read Committed only sees text after the author presses 'Publish'. Repeatable Read guarantees that if you re-read page 1, the words never change during your reading session. Serializable locks the entire document so only one editor can touch it at a time.",
            whatItIs: "Anomalies:\n• Dirty Read: Tx 1 reads uncommitted changes from Tx 2 that might later be rolled back.\n• Non-Repeatable Read: Tx 1 reads row A, Tx 2 updates row A and commits; Tx 1 re-reads row A and sees different values.\n• Phantom Read: Tx 1 queries range (e.g. `WHERE age > 30`), Tx 2 inserts new matching row and commits; Tx 1 re-queries range and sees a new 'phantom' row.",
            whyItExists: "Configures the classic trade-off between strict data consistency and high concurrent database throughput.",
            comparisonTable: {
              title: "Transaction Isolation Levels vs Concurrency Anomalies",
              headers: ["Isolation Level", "Dirty Read Prevention", "Non-Repeatable Read Prevention", "Phantom Read Prevention", "Database Default / Performance"],
              rows: [
                ["READ UNCOMMITTED", "❌ Allowed (reads uncommitted mutations)", "❌ Allowed", "❌ Allowed", "Fastest throughput; unsafe for financial data"],
                ["READ COMMITTED", "✅ Prevented", "❌ Allowed (re-reading row sees committed changes)", "❌ Allowed", "Default in PostgreSQL, Oracle, SQL Server; excellent balance"],
                ["REPEATABLE READ", "✅ Prevented", "✅ Prevented (row reads locked or MVCC snapshotted)", "❌ Allowed (MySQL InnoDB uses Next-Key locks to prevent)", "Default in MySQL InnoDB; snapshot read overhead"],
                ["SERIALIZABLE", "✅ Prevented", "✅ Prevented", "✅ Prevented (strict range/predicate locks)", "Slowest throughput; frequent lock contention & deadlocks"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "@Service\npublic class FinancialReportService {\n    // Enforce Repeatable Read for accounting calculations\n    @Transactional(isolation = Isolation.REPEATABLE_READ, readOnly = true)\n    public FinancialSummary generateAnnualSummary(int year) {\n        BigDecimal q1 = calculateQuarter(1, year);\n        BigDecimal q2 = calculateQuarter(2, year);\n        // Guaranteed that underlying account balances will NOT change between queries\n        return new FinancialSummary(q1, q2);\n    }\n}"
            },
            tradeoffs: "SERIALIZABLE drastically degrades throughput by acquiring range locks and causes frequent `CannotAcquireLockException` or deadlocks, requiring application-level retry logic.",
            theyMightAskNext: [
              {
                question: "How does MySQL InnoDB prevent Phantom Reads in Repeatable Read?",
                answer: "Using Next-Key Locking (a combination of record locks and gap locks on index ranges) and MVCC (Multi-Version Concurrency Control) snapshot reads."
              }
            ],
            usedInProduction: "Banking ledgers and inventory reservations use REPEATABLE READ or Optimistic Locking (`@Version`) rather than global SERIALIZABLE.",
            relatedTopics: ["sb-transactional-1", "sb-optimistic-vs-pessimistic-locking"]
          }
        },
        {
          id: "sb-transactional-self-invocation",
          question: "Why does self-invocation break @Transactional in Spring Boot and what are 3 ways to solve it?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring @Transactional uses dynamic proxies (CGLIB). When method A calls method B on `this` inside the same class, the call bypasses the proxy entirely, executing plain Java method invocation without opening a transaction.",
            mentalModel: "Calling a colleague at work through the corporate switchboard triggers call recording and billing (the proxy). Walking across the desk and whispering directly to them bypasses the switchboard completely.",
            whatItIs: "All Spring AOP features (`@Transactional`, `@Async`, `@Cacheable`, `@Secured`) suffer from the self-invocation issue because proxies only intercept calls originating from outside the bean instance.",
            whyItExists: "Fundamental architectural limitation of dynamic proxy-based AOP (as opposed to compile-time or load-time bytecode weaving like AspectJ).",
            codeDemo: {
              language: "java",
              code: "@Service\npublic class OrderService {\n    // Solution 1: Refactor into separate service (BEST & CLEANEST)\n    private final PaymentProcessor paymentProcessor;\n    \n    // Solution 2: Programmatic TransactionTemplate (Highly reliable)\n    private final TransactionTemplate transactionTemplate;\n\n    public void processOrder(Order order) {\n        // Bypasses @Transactional if on same class!\n        // Instead, wrap explicitly:\n        transactionTemplate.execute(status -> {\n            saveOrder(order);\n            return null;\n        });\n    }\n\n    // Solution 3: Self-injection with @Lazy (Spring 4.3+)\n    // @Autowired @Lazy private OrderService self;\n    // self.saveOrder(order); // Hits proxy!\n}"
            },
            tradeoffs: "Self-injection with `@Lazy` is considered a code smell. The industry standard is either extracting the transactional method to a separate collaborator bean or using `TransactionTemplate`.",
            theyMightAskNext: [
              {
                question: "Can AspectJ compile-time weaving solve self-invocation?",
                answer: "Yes. AspectJ weaves transaction bytecode directly into the class file (AJC compiler) or at class-load time (LTW), so method calls within the same class invoke transaction logic without needing proxies."
              }
            ],
            usedInProduction: "A top 3 source of silent production bugs in Spring codebases. Catching these is why companies write strict ArchUnit rules and code review checklists.",
            relatedTopics: ["sb-transactional-1", "sb-async-task-executor", "sb-bean-lifecycle"]
          }
        },
        {
          id: "sb-transaction-readonly",
          question: "What does @Transactional(readOnly = true) actually do under the hood with Hibernate and JDBC?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "`readOnly = true` provides 3 major optimizations: 1. Sets Hibernate FlushMode to MANUAL (completely disables dirty checking and memory snapshotting), 2. Sets JDBC Connection `setReadOnly(true)` (enables driver-level routing to read replicas), 3. Prevents accidental SQL INSERT/UPDATE/DELETE.",
            mentalModel: "Like boarding a museum tour with 'Observer' pass: the guards know you cannot touch or move any exhibits, so they don't bother taking forensic fingerprint inventory after every room you visit (no dirty checking).",
            whatItIs: "A hint passed to the transaction manager and persistence provider (Hibernate `SessionImpl`). Because Hibernate knows objects will not be mutated, it skips creating memory snapshot copies in the First-Level Cache.",
            whyItExists: "Saves massive CPU and heap memory allocations on large query result sets (e.g. loading 5,000 entities to generate an export CSV).",
            codeDemo: {
              language: "java",
              code: "@Service\n@Transactional(readOnly = true) // Best practice: default class-level to readOnly\npublic class CustomerQueryService {\n    \n    private final CustomerRepository customerRepo;\n\n    // Inherits readOnly = true: zero dirty checking, routed to Read-Replica\n    public List<CustomerDto> searchCustomers(String query) {\n        return customerRepo.search(query).stream().map(CustomerDto::from).toList();\n    }\n\n    // Override with readOnly = false for mutations\n    @Transactional\n    public CustomerDto updateEmail(Long id, String email) {\n        Customer customer = customerRepo.findById(id).orElseThrow();\n        customer.setEmail(email); // Dirty checking active -> automatically updates DB on commit\n        return CustomerDto.from(customer);\n    }\n}"
            },
            tradeoffs: "If a developer attempts to modify an entity inside `readOnly = true`, Hibernate will silently ignore changes because it never flushes the Session, leading to puzzling bugs where changes aren't saved without throwing an error.",
            theyMightAskNext: [
              {
                question: "How does readOnly = true enable Multi-DataSource Read/Write splitting?",
                answer: "A custom `AbstractRoutingDataSource` can inspect `TransactionSynchronizationManager.isCurrentTransactionReadOnly()` and automatically route reads to a MySQL/PostgreSQL read replica, and writes to the primary master database."
              }
            ],
            usedInProduction: "Universal architectural best practice: annotate the entire `@Service` class with `@Transactional(readOnly = true)`, and selectively add `@Transactional` on writing methods.",
            relatedTopics: ["sb-transactional-1", "sb-jpa-1", "sb-hikaricp-connection-pool"]
          }
        },
        {
          id: "sb-distributed-transactions-saga",
          question: "Why is 2PC (Two-Phase Commit) an anti-pattern in modern microservices, and how does the Saga Pattern solve distributed transactions?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "2PC/XA relies on centralized coordinators that lock database resources across networks, creating catastrophic latency, single points of failure, and violating microservice autonomy. The Saga pattern breaks distributed transactions into a sequence of local transactions where failures trigger explicit Compensating Transactions.",
            mentalModel: "2PC is planning a wedding where all 200 guests must hold their breath on the phone together until the last bridesmaid arrives. The Saga pattern is booking hotel, flight, and car separately; if the flight is canceled, you phone the hotel and cancel your reservation (compensating action) with a refund.",
            whatItIs: "Two Saga styles: 1. Choreography (event-driven: services listen to Kafka events and execute next step), 2. Orchestration (a dedicated orchestrator state machine directs services what to do via command/reply channels).",
            whyItExists: "Microservices each own their private database (Order DB, Payment DB, Inventory DB). Distributed ACID transactions are impossible without tight coupling and severe availability bottlenecks (CAP theorem).",
            codeDemo: {
              language: "java",
              code: "// Saga Orchestrator Workflow (Conceptual)\n@Service\npublic class OrderSagaOrchestrator {\n    public void executeOrderSaga(OrderContext ctx) {\n        try {\n            inventoryClient.reserveStock(ctx.getItems()); // Step 1\n            paymentClient.deductPayment(ctx.getAmount()); // Step 2 (Fails!)\n            shippingClient.scheduleDelivery(ctx);         // Step 3\n        } catch (PaymentFailedException ex) {\n            // COMPENSATING TRANSACTIONS\n            inventoryClient.releaseStock(ctx.getItems()); // Rollback Step 1\n            orderClient.markFailed(ctx.getOrderId());\n        }\n    }\n}"
            },
            tradeoffs: "Sagas sacrifice Immediate Consistency for Eventual Consistency. Sagas lack read isolation: dirty reads can occur while a saga is midway through execution, requiring semantic locking or counter-measures.",
            theyMightAskNext: [
              {
                question: "Why is idempotency mandatory in Saga compensating transactions?",
                answer: "Because network retries and event brokers (Kafka) guarantee at-least-once delivery. If a compensating event (`releaseStock`) is delivered twice, stock must not be incremented twice."
              }
            ],
            usedInProduction: "Core architectural pattern in payment checkouts at Uber, Airbnb, and Amazon where orders touch fraud, payment, inventory, and fulfillment services across independent datastores.",
            relatedTopics: ["sb-transactional-1", "sb-kafka-spring-boot", "sb-outbox-pattern"]
          }
        }
      ]
    },
    {
      id: "hibernate-performance-tuning",
      title: "Hibernate Performance & Tuning",
      questions: [
        {
          id: "sb-n-plus-1-problem",
          question: "What is the N+1 Query Problem in Hibernate/JPA and what are 3 concrete ways to eliminate it?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The N+1 problem occurs when fetching 1 parent entity generates 1 initial SQL query, and accessing a lazy association on each child generates N additional individual SQL queries. Eliminate it using: 1. `JOIN FETCH` in JPQL, 2. `@EntityGraph` annotation, or 3. `@BatchSize`.",
            mentalModel: "Going grocery shopping for 10 recipes: instead of writing a combined grocery list and buying everything in 1 trip (JOIN FETCH), you drive to the store 1 time for the recipe list, and then drive back to the store 10 separate times for each single ingredient (N+1 queries).",
            whatItIs: "A common performance killer in ORMs. If you query 50 `Author` entities and loop through each author's `books`, Hibernate fires 1 query to get the authors, plus 50 queries (`SELECT * FROM book WHERE author_id = ?`) for their books (51 queries total).",
            whyItExists: "Default lazy loading (`FetchType.LAZY`) defers fetching child collections until they are accessed in code.",
            codeDemo: {
              language: "java",
              code: "public interface AuthorRepository extends JpaRepository<Author, Long> {\n    // Solution 1: JPQL JOIN FETCH (Eagerly loads in 1 SQL JOIN query)\n    @Query(\"SELECT a FROM Author a JOIN FETCH a.books\")\n    List<Author> findAllWithBooksJoinFetch();\n\n    // Solution 2: @EntityGraph (Declarative, reusable)\n    @EntityGraph(attributePaths = {\"books\"})\n    List<Author> findAll();\n}\n\n// Solution 3: In Entity - @BatchSize (Batches queries using WHERE IN)\n@Entity\npublic class Author {\n    @OneToMany(mappedBy = \"author\")\n    @BatchSize(size = 50) // Replaces 50 individual queries with: WHERE author_id IN (?, ?, ...)\n    private List<Book> books;\n}"
            },
            tradeoffs: "Never fix N+1 by setting `FetchType.EAGER` on entity relationship annotations! EAGER applies globally to every single query in the application and cannot be disabled dynamically, leading to Cartesian explosions.",
            theyMightAskNext: [
              {
                question: "What is the MultipleBagFetchException in Hibernate?",
                answer: "Occurs when attempting to simultaneously `JOIN FETCH` two or more `List` collections (`Bag` in Hibernate), creating a Cartesian product. Fix by changing `List` to `Set` or fetching the second collection via `@BatchSize` or a second query."
              }
            ],
            usedInProduction: "Standard audit check in enterprise CI pipelines using tools like `Hypersistence Optimizer` or Spring SQL logging counters to fail tests that trigger more than 2 SQL queries per endpoint.",
            relatedTopics: ["sb-jpa-1", "sb-jpa-projections", "sb-lazy-initialization-exception"]
          }
        },
        {
          id: "sb-lazy-initialization-exception",
          question: "What causes LazyInitializationException and why is Open Session in View (OSIV) an anti-pattern in production?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "`LazyInitializationException: could not initialize proxy - no Session` occurs when code tries to access a lazy-loaded association outside an active `@Transactional` boundary after the Hibernate Session has closed. Spring Boot enables Open Session in View (`spring.jpa.open-in-view=true`) by default, which keeps database connections open throughout the web request, causing connection pool starvation.",
            mentalModel: "Think of checking out a library book with a reference card: if you ask for the referenced chapter while still in the library (inside transaction), the librarian grabs it. If you walk home and call from your living room (outside session), the library is closed and the phone rings dead.",
            whatItIs: "Hibernate proxies need an open JDBC session to execute the SQL query for unloaded collections. OSIV keeps the Hibernate session open in a servlet filter until the HTTP response is written, hiding lazy loading issues from developers.",
            whyItExists: "OSIV was introduced as a convenience so beginners wouldn't encounter `LazyInitializationException` when rendering JSP/Thymeleaf views.",
            codeDemo: {
              language: "properties",
              code: "# application.properties - Disable OSIV in production!\nspring.jpa.open-in-view=false\n\n// Fix Lazy loading cleanly at the Service layer using DTO mapping:\n@Service\n@Transactional(readOnly = true)\npublic class OrderQueryService {\n    private final OrderRepository orderRepo;\n\n    public OrderResponseDto getOrder(Long id) {\n        // Fetch entity with necessary associations inside @Transactional boundary\n        Order order = orderRepo.findByIdWithItems(id).orElseThrow();\n        // Convert to DTO before leaving service layer:\n        return OrderResponseDto.from(order);\n    }\n}"
            },
            tradeoffs: "With `spring.jpa.open-in-view=true`, if a controller calls a slow third-party API or takes 2 seconds to serialize JSON, the physical database connection from HikariCP is held idle for the entire duration, exhausting the connection pool under modest traffic.",
            theyMightAskNext: [
              {
                question: "What warning does Spring Boot log at startup regarding OSIV?",
                answer: "`spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning.`"
              }
            ],
            usedInProduction: "Mandatory configuration in all high-concurrency microservices: set `spring.jpa.open-in-view=false` and enforce DTO mapping inside service layer transactions.",
            relatedTopics: ["sb-n-plus-1-problem", "sb-transactional-1", "sb-hikaricp-connection-pool"]
          }
        },
        {
          id: "sb-l1-vs-l2-cache",
          question: "What is the difference between First-Level Cache and Second-Level Cache in Hibernate?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "First-Level Cache (L1) is bound to the current Hibernate Session / EntityManager and is enabled by default. Second-Level Cache (L2) is shared across all Sessions and across the entire ApplicationContext (or cluster via Redis/Ehcache), requiring explicit configuration.",
            mentalModel: "L1 cache is your personal desk drawer (only you can see items; thrown away when you leave the office). L2 cache is the shared office library down the hall where all coworkers can share and reuse pre-fetched reference manuals.",
            whatItIs: "L1 guarantees identity map semantics within a transaction: `repo.findById(1) == repo.findById(1)`. L2 caches entity data across transactions using `@Cacheable` and `@org.hibernate.annotations.Cache`.",
            whyItExists: "L1 prevents redundant queries within the same request. L2 prevents repeated database hits for static or rarely changing reference data (countries, postal codes, product catalog) across millions of requests.",
            comparisonTable: {
              title: "Hibernate First-Level (L1) vs Second-Level (L2) Cache",
              headers: ["Feature / Dimension", "First-Level Cache (L1)", "Second-Level Cache (L2)"],
              rows: [
                ["Scope & Lifecycle", "Bound to the current Hibernate Session / EntityManager (short-lived)", "Shared across the entire ApplicationContext / cluster (long-lived)"],
                ["Configuration Requirement", "Mandatory and enabled by default; cannot be disabled", "Optional; requires explicit configuration (Ehcache, Hazelcast, Redisson)"],
                ["Thread Safety", "Not thread-safe: strictly accessed by a single request thread", "Fully thread-safe: shared across all application threads and nodes"],
                ["Entity Identity", "Guarantees Java reference equality (`a == b`) within the same session", "Returns hydrated entity copies or cached disassembled attribute arrays"],
                ["Invalidation Mechanism", "Automatically discarded when Session/Transaction closes (`session.clear()`)", "Explicit TTL, LRU eviction, or cluster invalidation via pub/sub"],
                ["Primary Use Case", "Deduplicating queries within a single HTTP request or transaction", "Caching static, read-heavy reference tables (countries, roles, product catalog)"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Configure Hibernate L2 Cache with Redisson / Ehcache\n@Entity\n@Table(name = \"countries\")\n@Cacheable\n@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_ONLY)\npublic class Country {\n    @Id private String code;\n    private String name;\n}\n\n# application.yml\nspring:\n  jpa:\n    properties:\n      hibernate:\n        cache:\n          use_second_level_cache: true\n          region.factory_class: org.redisson.hibernate.RedissonRegionFactory"
            },
            tradeoffs: "L2 cache invalidation in distributed clusters is notorious: if another microservice updates the database directly via SQL, the L2 cache becomes stale unless cache eviction events are broadcast via Redis Pub/Sub.",
            theyMightAskNext: [
              {
                question: "What is the Query Cache in Hibernate?",
                answer: "An auxiliary cache to L2 that caches query result IDs (e.g. `SELECT id FROM user WHERE role = 'ADMIN'`). It requires L2 cache to be enabled and is invalidated whenever any row in the target table is modified."
              }
            ],
            usedInProduction: "Widely used for read-heavy, low-mutation reference datasets like product categories, tax rates, and geographic boundaries.",
            relatedTopics: ["sb-jpa-1", "sb-transaction-readonly"]
          }
        },
        {
          id: "sb-optimistic-vs-pessimistic-locking",
          question: "What is the difference between Optimistic Locking and Pessimistic Locking in Spring Data JPA?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Optimistic Locking assumes conflicts are rare and uses a `@Version` column (`OptimisticLockException` on conflict). Pessimistic Locking assumes conflicts are frequent and locks database rows directly using SQL `SELECT ... FOR UPDATE` (`LockModeType.PESSIMISTIC_WRITE`).",
            mentalModel: "Optimistic locking is editing a shared Google doc: anyone can edit, but if someone else pressed 'Save' while you were typing, the system rejects your save and tells you to merge. Pessimistic locking is physically locking the room so nobody else can even look at the document until you finish.",
            whatItIs: "Optimistic check: `UPDATE table SET val = ?, version = version + 1 WHERE id = ? AND version = ?`. If rows updated == 0, conflict detected. Pessimistic check: database-level row lock held for the entire transaction.",
            whyItExists: "To prevent the Lost Update problem where concurrent transactions overwrite each other's changes without noticing.",
            comparisonTable: {
              title: "Optimistic Locking vs Pessimistic Locking in Spring Data JPA",
              headers: ["Dimension", "Optimistic Locking (@Version)", "Pessimistic Locking (SELECT ... FOR UPDATE)"],
              rows: [
                ["Core Philosophy", "Conflict is rare: proceed without locking, check on commit", "Conflict is frequent: acquire exclusive row lock immediately"],
                ["Implementation", "Database column (`@Version private Long version`) incremented on update", "Database-level lock mode (`LockModeType.PESSIMISTIC_WRITE`)"],
                ["Database Lock Duration", "Zero locks held during read; brief update lock during UPDATE", "Lock held on database row for the entire duration of the transaction"],
                ["Failure Mode / Exception", "Throws `OptimisticLockException` / `ObjectOptimisticLockingFailureException`", "Throws `CannotAcquireLockException` / `PessimisticLockException` / Deadlock"],
                ["Concurrency & Scalability", "Very high throughput; non-blocking reads and writes", "Lower throughput; concurrent transactions block and queue up"],
                ["Ideal Production Scenario", "User profile edits, CMS articles, e-commerce shopping carts", "Flash sale inventory reservations, bank account transfers, airline seat booking"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// 1. Optimistic Locking (High Concurrency, Low Contention)\n@Entity\npublic class Account {\n    @Id private Long id;\n    private BigDecimal balance;\n    @Version\n    private Long version; // Auto-incremented on each update!\n}\n\n// 2. Pessimistic Locking (High Contention, e.g. Flash Sales, Ticket Booking)\npublic interface FlightSeatRepository extends JpaRepository<FlightSeat, Long> {\n    @Lock(LockModeType.PESSIMISTIC_WRITE)\n    @Query(\"SELECT s FROM FlightSeat s WHERE s.id = :id\")\n    Optional<FlightSeat> findByIdForBooking(@Param(\"id\") Long id);\n}"
            },
            tradeoffs: "Pessimistic locking causes database lock contention, reduced throughput, and deadlocks if transactions lock rows in different orders. Optimistic locking requires application-level retry loops when `OptimisticLockException` occurs.",
            theyMightAskNext: [
              {
                question: "How do you handle OptimisticLockException gracefully in Spring Boot?",
                answer: "Catch `ObjectOptimisticLockingFailureException` and use `@Retryable(retryFor = ObjectOptimisticLockingFailureException.class, maxAttempts = 3, backoff = @Backoff(delay = 100))` from Spring Retry."
              }
            ],
            usedInProduction: "Optimistic locking is the standard for 90% of web apps (user profiles, articles, orders). Pessimistic locking is reserved for extreme hot spots (concert ticket seat selection, flash sale limited stock).",
            relatedTopics: ["sb-transaction-isolation", "sb-transactional-1"]
          }
        },
        {
          id: "sb-hikaricp-connection-pool",
          question: "How do you configure HikariCP for high-throughput production, and how do you diagnose connection leaks?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "HikariCP is the ultra-fast default connection pool in Spring Boot. Configure `maximum-pool-size` (usually CPU count * 2 + disk count), `minimum-idle`, `connection-timeout`, and crucially set `leak-detection-threshold` (e.g. 2000ms) to log stack traces of unclosed connections.",
            mentalModel: "Think of an airport taxi queue: having 1,000 taxis waiting in a small 2-lane terminal doesn't speed up passenger exits—it creates massive gridlock. A lean, fast fleet of 20 taxis constantly moving gets passengers through 10x faster.",
            whatItIs: "HikariCP uses bytecode instrumentation, FastList, and ConcurrentBag for microsecond-level connection acquisition. Connection leaks occur when code opens a JDBC connection and fails to close it (e.g., missing finally block or long-running transaction).",
            whyItExists: "Opening physical TCP/TLS connections to databases costs 20–50ms. Connection pools keep an established pool of warm connections ready for instant reuse.",
            codeDemo: {
              language: "properties",
              code: "# application.properties - Production HikariCP Tuning\n# Database formula: maxPoolSize = (core_count * 2) + effective_spindle_count\nspring.datasource.hikari.maximum-pool-size=20\nspring.datasource.hikari.minimum-idle=10\nspring.datasource.hikari.connection-timeout=30000 # 30s wait before failure\nspring.datasource.hikari.idle-timeout=600000      # 10 min\nspring.datasource.hikari.max-lifetime=1800000     # 30 min (must be < DB wait_timeout)\n\n# CRITICAL LEAK DETECTION:\n# Logs a stack trace if a thread holds a connection longer than 2 seconds!\nspring.datasource.hikari.leak-detection-threshold=2000"
            },
            tradeoffs: "Setting `maximum-pool-size=200` is a common mistake: PostgreSQL and MySQL perform significantly worse when overwhelmed by hundreds of concurrent connection contexts competing for CPU caches and disk I/O.",
            theyMightAskNext: [
              {
                question: "What error indicates HikariCP connection pool exhaustion?",
                answer: "`SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms.` This means all connections are busy and callers queued beyond `connection-timeout`."
              }
            ],
            usedInProduction: "Configured across all production services at Netflix and DoorDash; `leak-detection-threshold` is an essential safety rail in microservice staging environments.",
            relatedTopics: ["sb-transactional-1", "sb-lazy-initialization-exception"]
          }
        },
        {
          id: "sb-database-migrations-flyway",
          question: "How do you manage database schema migrations with Flyway or Liquibase in Spring Boot?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Add `flyway-core`, place versioned SQL scripts in `src/main/resources/db/migration` (`V1__init.sql`, `V2__add_index.sql`). At startup, Spring Boot checks the `flyway_schema_history` table, executes unapplied migrations in strict order, and hashes them for checksum verification.",
            mentalModel: "Think of Git commit history for your database schema: each developer commits a migration script with an incremented version number. When the app starts up, Flyway checks which commits the database has applied and applies the remaining ones in order.",
            whatItIs: "Flyway executes before Hibernate initialization (or `spring.jpa.hibernate.ddl-auto=validate`), ensuring the database schema matches entity mappings before any queries run.",
            whyItExists: "Never use `ddl-auto=update` in production! It cannot rename columns, drop tables safely, or roll back cleanly. Flyway guarantees repeatable, audited, zero-downtime database evolution.",
            codeDemo: {
              language: "sql",
              code: "-- File Naming Convention:\n-- V<Version>__<Description>.sql\n-- src/main/resources/db/migration/V1__init_schema.sql\nCREATE TABLE users (\n    id BIGSERIAL PRIMARY KEY,\n    username VARCHAR(50) NOT NULL UNIQUE,\n    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n);\n\n-- src/main/resources/db/migration/V2__add_email_to_users.sql\nALTER TABLE users ADD COLUMN email VARCHAR(255);\nCREATE INDEX idx_users_email ON users(email);\n\n-- application.properties\n-- spring.jpa.hibernate.ddl-auto=validate\n-- spring.flyway.enabled=true\n-- spring.flyway.baseline-on-migrate=true"
            },
            tradeoffs: "Never modify an existing migration script after it has been executed in any environment! Flyway computes a SHA-256 checksum; modifying the script causes a `FlywayException: Validate failed: Checksum mismatch` at startup.",
            theyMightAskNext: [
              {
                question: "What is the difference between Repeatable Migrations (R__) and Versioned Migrations (V__)?",
                answer: "Versioned (`V__`) run exactly once in order. Repeatable (`R__`) have no version number and re-execute automatically whenever their file checksum changes, perfect for Views, Stored Procedures, and Functions."
              }
            ],
            usedInProduction: "Standard in 100% of production CD pipelines. Zero-downtime schema migrations follow the Expand-Contract pattern using Flyway scripts.",
            relatedTopics: ["sb-jpa-1", "sb-hikaricp-connection-pool"]
          }
        }
      ]
    }
  ]
};
