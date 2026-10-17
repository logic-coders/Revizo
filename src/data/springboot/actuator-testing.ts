import { Category } from "@/types";

export const springBootActuatorTestingCategory: Category = {
  id: "sb-actuator-testing",
  title: "Actuator, Testing & Cloud-Native",
  subTopics: [
    {
      id: "actuator-metrics-observability",
      title: "Actuator, Metrics & Observability",
      questions: [
        {
          id: "sb-actuator-overview",
          question: "What is Spring Boot Actuator and what are its key production endpoints?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring Boot Actuator brings production-ready features (health checks, auditing, metrics collection, environment inspection) to your application via HTTP/JMX endpoints. Key endpoints: `/health` (liveness/readiness), `/metrics` (Prometheus data), `/info` (git/build info), `/env` (active properties), `/loggers` (dynamic log level changes).",
            mentalModel: "Think of an aircraft cockpit dashboard: while the engines and passengers fly in the cabin (business logic), the pilot monitors altimeters, fuel gauges, oil pressure, and temperature sensors on the dashboard (Actuator) to ensure safe flight.",
            whatItIs: "A sub-project of Spring Boot enabled via `spring-boot-starter-actuator`. In Spring Boot 2 & 3, all endpoints except `/health` are disabled by default for security; they must be explicitly exposed using `management.endpoints.web.exposure.include`.",
            whyItExists: "Before Actuator, DevOps teams had to write custom servlets and scripts to check if an app was healthy, view JVM memory, or inspect active database connections.",
            codeDemo: {
              language: "properties",
              code: "# application.properties\nmanagement.endpoints.web.exposure.include=health,info,metrics,prometheus,loggers\nmanagement.endpoint.health.show-details=always # Shows DB, Disk, Redis health\nmanagement.endpoint.health.probes.enabled=true # Enables k8s liveness & readiness\nmanagement.info.git.mode=full                  # Exposes git commit, branch, build timestamp\n\n# Access endpoints:\n# curl http://localhost:8080/actuator/health\n# curl http://localhost:8080/actuator/metrics/jvm.memory.used"
            },
            tradeoffs: "Never expose `management.endpoints.web.exposure.include=*` in production without strict Spring Security authentication; exposing `/actuator/heapdump` or `/actuator/env` can leak database credentials and private encryption keys.",
            theyMightAskNext: [
              {
                question: "How do you hide sensitive values in /actuator/env?",
                answer: "Spring Boot automatically masks keys containing 'password', 'secret', 'key', or 'token' with `******`. You can customize the regex pattern via `management.endpoint.env.keys-to-sanitize`."
              }
            ],
            usedInProduction: "Mandatory in 100% of production Kubernetes deployments for automated pod health restarts and Prometheus metric scraping.",
            relatedTopics: ["sb-secure-actuator-endpoints", "sb-custom-health-indicator", "sb-micrometer-prometheus"]
          }
        },
        {
          id: "sb-custom-health-indicator",
          question: "How do you implement a custom HealthIndicator in Spring Boot for external dependencies?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Create a bean implementing `HealthIndicator` and override the `health()` method. Return `Health.up()` if the dependency is reachable, or `Health.down().withDetail(\"error\", ex.getMessage()).build()` if unreachable. Spring Boot aggregates all indicators into the overall `/actuator/health` status.",
            mentalModel: "A physician performing a health checkup: the doctor checks your heart, lungs, and blood pressure (individual HealthIndicators). If any vital organ fails, the overall diagnosis is 'UNHEALTHY' (HTTP 503).",
            whatItIs: "Spring Boot auto-configures health indicators for DataSource, Redis, RabbitMQ, Kafka, DiskSpace, and Elasticsearch. Custom indicators verify third-party REST partners or proprietary TCP sockets.",
            whyItExists: "Kubernetes readiness probes rely on `/actuator/health`. If your microservice cannot talk to its mandatory database or downstream billing gateway, it should mark itself DOWN so load balancers stop routing user traffic to it.",
            codeDemo: {
              language: "java",
              code: "@Component\npublic class PaymentGatewayHealthIndicator implements HealthIndicator {\n    private final RestClient paymentRestClient;\n\n    public PaymentGatewayHealthIndicator(RestClient.Builder builder) {\n        this.paymentRestClient = builder.baseUrl(\"https://api.stripe.com\").build();\n    }\n\n    @Override\n    public Health health() {\n        try {\n            // Ping third-party health endpoint with 2 second timeout\n            paymentRestClient.get().uri(\"/v1/health\").retrieve().toBodilessEntity();\n            return Health.up()\n                .withDetail(\"service\", \"Stripe Gateway\")\n                .withDetail(\"latencyMs\", 42)\n                .build();\n        } catch (Exception ex) {\n            return Health.down()\n                .withDetail(\"service\", \"Stripe Gateway\")\n                .withDetail(\"error\", ex.getMessage())\n                .build(); // Flips overall status to 503 Service Unavailable\n        }\n    }\n}"
            },
            tradeoffs: "Keep health check timeouts extremely short (under 2 seconds)! A slow health check will cause Kubernetes readiness probe timeouts, leading to pods being repeatedly killed and restarted.",
            theyMightAskNext: [
              {
                question: "What is ReactiveHealthIndicator in Spring WebFlux?",
                answer: "The non-blocking equivalent returning `Mono<Health>`, preventing event-loop thread blocking during reactive health checks."
              }
            ],
            usedInProduction: "Standard practice in e-commerce checkout microservices to monitor payment gateways, warehouse inventory APIs, and fraud detection services.",
            relatedTopics: ["sb-actuator-overview", "sb-kubernetes-probes"]
          }
        },
        {
          id: "sb-micrometer-prometheus",
          question: "How do you record custom application metrics in Spring Boot using Micrometer (Counters, Gauges, Timers)?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Add `micrometer-registry-prometheus`. Inject `MeterRegistry`. Use `Counter` for monotonic incrementing counts (orders placed), `Timer` for latencies and execution durations (checkout duration), and `Gauge` for fluctuating instantaneous values (active queue size or cache size). Expose at `/actuator/prometheus`.",
            mentalModel: "Counter is an odometer in a car (only goes up). Gauge is a speedometer (goes up and down reflecting current instantaneous speed). Timer is a stopwatch that records both how many times the stopwatch clicked and the duration distribution of all laps.",
            whatItIs: "Micrometer is the 'SLF4J for metrics'. It provides a vendor-neutral dimensional metrics facade that exports to Prometheus, Datadog, InfluxDB, or CloudWatch with dimensional tags/labels.",
            whyItExists: "Allows setting up Prometheus alerting rules (e.g., 'Alert if 5xx error rate exceeds 2% over 5 minutes') and building Grafana dashboards.",
            codeDemo: {
              language: "java",
              code: "@Service\npublic class OrderMetricsService {\n    private final Counter orderCounter;\n    private final Timer orderProcessingTimer;\n\n    public OrderMetricsService(MeterRegistry registry) {\n        // 1. Counter with dimensional tags\n        this.orderCounter = Counter.builder(\"orders.placed.total\")\n            .description(\"Total number of completed orders\")\n            .tag(\"tier\", \"premium\")\n            .register(registry);\n\n        // 2. Timer with percentiles\n        this.orderProcessingTimer = Timer.builder(\"orders.processing.duration\")\n            .description(\"Time taken to process and validate order\")\n            .publishPercentiles(0.5, 0.95, 0.99) // p50, p95, p99 latencies\n            .register(registry);\n    }\n\n    public void recordOrder(Runnable businessAction) {\n        orderCounter.increment();\n        orderProcessingTimer.record(businessAction); // Measures execution time!\n    }\n}"
            },
            tradeoffs: "High Cardinality Danger: NEVER use dynamic, unbounded values (like `userId`, `orderId`, or email addresses) as Micrometer tag values! Each unique tag combination generates a new time-series in Prometheus, exhausting Prometheus server memory.",
            theyMightAskNext: [
              {
                question: "What is the @Timed annotation in Micrometer?",
                answer: "A declarative annotation placed on methods or classes that automatically records execution count and duration metrics without writing manual timer boilerplate."
              }
            ],
            usedInProduction: "Standard observability practice in every modern technology company, powering production Grafana alerts and PagerDuty escalations.",
            relatedTopics: ["sb-actuator-overview", "sb-distributed-tracing-micrometer"]
          }
        },
        {
          id: "sb-dynamic-logging-actuator",
          question: "How do you change logging levels dynamically in production using /actuator/loggers without restarting the application?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Send an HTTP POST request to `/actuator/loggers/{packageName}` with JSON payload `{\"configuredLevel\": \"DEBUG\"}`. Spring Boot updates the Logback/Log4j2 logger immediately in memory, allowing instant diagnosis of live issues.",
            mentalModel: "Adjusting volume on a radio: instead of unplugging the radio and disassembling the electronics (restarting pods), you simply turn the volume dial from 2 (INFO) to 10 (DEBUG) to hear every whisper, and dial it back down when you finish listening.",
            whatItIs: "Exposed via `spring-boot-starter-actuator`. Allows inspecting current log levels via `GET /actuator/loggers` and mutating log levels per package via `POST`.",
            whyItExists: "Running in DEBUG mode permanently fills disks and degrades throughput. Dynamic logging lets engineers turn on DEBUG for a single specific package for 5 minutes to reproduce an issue, and turn it back to INFO immediately.",
            codeDemo: {
              language: "bash",
              code: "# 1. Inspect current log level for a specific package:\ncurl http://localhost:8080/actuator/loggers/com.company.payment\n# Output: {\"configuredLevel\":\"INFO\",\"effectiveLevel\":\"INFO\"}\n\n# 2. Dynamically switch to DEBUG on the fly:\ncurl -X POST http://localhost:8080/actuator/loggers/com.company.payment \\\n     -H \"Content-Type: application/json\" \\\n     -d '{\"configuredLevel\": \"DEBUG\"}'\n\n# 3. Reset back to default inherited level:\ncurl -X POST http://localhost:8080/actuator/loggers/com.company.payment \\\n     -H \"Content-Type: application/json\" \\\n     -d '{\"configuredLevel\": null}'"
            },
            tradeoffs: "Dynamic log level changes are kept in memory only; if the Kubernetes pod restarts, it will revert to the log levels defined in `application.properties` or `logback-spring.xml`.",
            theyMightAskNext: [
              {
                question: "How do you secure /actuator/loggers from unauthorized access?",
                answer: "Protect it with Spring Security role check: `requestMatchers(\"/actuator/loggers/**\").hasRole(\"ADMIN\")` and audit every log change in security logs."
              }
            ],
            usedInProduction: "Invaluable for P1 incident troubleshooting: triage teams enable DEBUG on an unstable payment adapter without interrupting live user traffic.",
            relatedTopics: ["sb-actuator-overview", "sb-secure-actuator-endpoints"]
          }
        },
        {
          id: "sb-graceful-shutdown",
          question: "How does Graceful Shutdown work in Spring Boot and why is it essential for zero-downtime deployments in Kubernetes?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Enable via `server.shutdown=graceful`. When a termination signal (SIGTERM) is received, the embedded web server (Tomcat/Undertow) stops accepting new HTTP connections and allows existing in-flight requests a grace period (e.g., 30s) to finish before the JVM shuts down.",
            mentalModel: "Closing a restaurant at 10 PM: Graceful shutdown is locking the front doors so no new walk-in customers enter, but allowing the 5 seated dinner parties already eating their entrees to finish their dessert and pay before turning off the kitchen lights.",
            whatItIs: "Introduced in Spring Boot 2.3. Without graceful shutdown, the JVM process terminates immediately on SIGTERM, abruptly dropping active TCP connections and causing HTTP 502 Bad Gateway errors on client browsers.",
            whyItExists: "Kubernetes rolling deployments constantly terminate old pods and spin up new ones. Graceful shutdown ensures zero dropped requests during deployments.",
            codeDemo: {
              language: "properties",
              code: "# application.properties\nserver.shutdown=graceful\nspring.lifecycle.timeout-per-shutdown-phase=30s # Max wait for active requests\n\n# Kubernetes deployment preStop hook:\n# Gives K8s ingress/kube-proxy time to remove pod IP from endpoint slices\n# lifecycle:\n#   preStop:\n#     exec:\n#       command: [\"sleep\", \"5\"]"
            },
            tradeoffs: "If an active request hangs (e.g. infinite loop or deadlocked DB query), Spring Boot will forcibly terminate the container once `timeout-per-shutdown-phase` expires.",
            theyMightAskNext: [
              {
                question: "Why is a preStop sleep hook needed in Kubernetes alongside Spring Boot graceful shutdown?",
                answer: "Because Kubernetes pod termination and iptables/kube-proxy endpoint removal happen asynchronously. Adding `preStop: sleep 5` ensures ingress controllers stop routing new traffic to the pod BEFORE Spring stops accepting connections."
              }
            ],
            usedInProduction: "Mandatory standard configuration in all production Kubernetes manifests to achieve 99.99% availability during rolling releases.",
            relatedTopics: ["sb-kubernetes-probes", "sb-embedded-containers"]
          }
        },
        {
          id: "sb-memory-cpu-troubleshooting",
          question: "How do you troubleshoot 100% CPU usage and OutOfMemoryError in a production Spring Boot application?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "For 100% CPU: take 3 consecutive Thread Dumps 10 seconds apart via `jcmd <pid> Thread.print` or `/actuator/threaddump`; find high-CPU thread IDs with `top -H -p <pid>` and look for RUNNABLE threads in tight loops. For OOM: generate a Heap Dump (`-XX:+HeapDumpOnOutOfMemoryError` or `/actuator/heapdump`) and analyze dominator tree leaks with Eclipse Memory Analyzer (MAT).",
            mentalModel: "CPU spike is a factory worker frantically running on a broken treadmill (Thread dump captures them running in place). OOM is an overcrowded warehouse stuffed to the ceiling with unopened boxes (Heap dump inventories who owns the boxes and why the garbage truck couldn't throw them out).",
            whatItIs: "Standard forensic incident response triage. High CPU is typically caused by unindexed database loops, regex catastrophic backtracking, or frequent Full GC thrashing. OOM is caused by unbounded in-memory caches, unclosed resources, or excessive page sizes.",
            whyItExists: "You cannot attach an IDE debugger to a production pod without halting live user traffic; thread and heap dumps provide non-invasive snapshots.",
            codeDemo: {
              language: "bash",
              code: "# 1. Identify high-CPU thread ID in Linux:\ntop -H -p <PID> # Find thread ID (e.g. 10452) -> Convert to hex: 0x28d4\n\n# 2. Capture Thread Dump using jcmd:\njcmd <PID> Thread.print > threaddump.txt\ngrep -A 30 \"nid=0x28d4\" threaddump.txt # Inspect exact call stack!\n\n# 3. Mandatory JVM parameters in Kubernetes Dockerfile for OOM:\n# -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps/heapdump.hprof\n\n# 4. Trigger Heap Dump on demand via Actuator:\ncurl http://localhost:8080/actuator/heapdump -o heap.hprof"
            },
            tradeoffs: "Taking a heap dump on a 16GB+ JVM pauses the process (Stop-the-World) while memory is flushed to disk, which may trip Kubernetes health check probes and trigger a pod restart. Use Java Flight Recorder (JFR) for continuous <2% overhead profiling.",
            theyMightAskNext: [
              {
                question: "What is the difference between Shallow Heap and Retained Heap in Eclipse MAT?",
                answer: "Shallow Heap is the memory consumed by the object itself (its fields and header). Retained Heap is the total memory freed if that object were garbage collected (including all child objects it exclusively holds references to)."
              }
            ],
            usedInProduction: "Standard runbook executed by SRE and platform engineering teams during major production incidents.",
            relatedTopics: ["sb-actuator-overview", "sb-hikaricp-connection-pool"]
          }
        }
      ]
    },
    {
      id: "testing-strategies",
      title: "Testing Slices & Testcontainers",
      questions: [
        {
          id: "sb-testing-overview",
          question: "What is the Testing Pyramid in Spring Boot and how do Unit Tests, Slice Tests, and Full Integration Tests differ?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The testing pyramid comprises: 1. Unit Tests (70%: pure JUnit 5 + Mockito, zero Spring context, runs in milliseconds), 2. Test Slices (20%: `@WebMvcTest`, `@DataJpaTest`, loads only specific architectural slice), 3. Full Integration Tests (10%: `@SpringBootTest` + Testcontainers, boots entire application context, runs in seconds).",
            mentalModel: "Testing a car: Unit testing tests the alternator on a workbench. Slice testing tests the engine connected to the transmission on a diagnostic rig. Full integration testing tests the entire assembled car on a real racetrack.",
            whatItIs: "Balancing test execution speed with test confidence. Loading `@SpringBootTest` for every single test creates a 30-minute slow CI pipeline; relying purely on unit tests fails to verify database queries and HTTP serialization.",
            whyItExists: "Enables fast local TDD feedback loops while maintaining rock-solid deployment safety.",
            codeDemo: {
              language: "java",
              code: "// 1. Pure Unit Test (Fastest - No Spring!)\n@ExtendWith(MockitoExtension.class)\nclass OrderServiceTest {\n    @Mock private OrderRepository repo;\n    @InjectMocks private OrderService service;\n    @Test void shouldCalculateTotal() { ... }\n}\n\n// 2. Slice Test (Fast - Loads ONLY Web layer)\n@WebMvcTest(OrderController.class)\nclass OrderControllerTest {\n    @Autowired private MockMvc mockMvc;\n    @MockBean private OrderService service;\n    @Test void shouldReturn200() { ... }\n}\n\n// 3. Full Integration Test (Deep confidence - Real DB)\n@SpringBootTest\n@Testcontainers\nclass OrderIntegrationTest { ... }"
            },
            tradeoffs: "Developers frequently overuse `@SpringBootTest` for simple logic tests, resulting in slow, brittle CI test suites that take 45+ minutes to build.",
            theyMightAskNext: [
              {
                question: "How does Spring test context caching work?",
                answer: "Spring caches the `ApplicationContext` across tests having identical configuration. If 10 test classes share the exact same configuration, the context is built ONCE and reused, speeding up test suites."
              }
            ],
            usedInProduction: "Standard testing ratio enforced by automated build gates in GitHub Actions and GitLab CI.",
            relatedTopics: ["sb-springboottest-vs-webmvctest", "sb-mockbean-vs-spybean", "sb-testcontainers-integration"]
          }
        },
        {
          id: "sb-springboottest-vs-webmvctest",
          question: "What is the difference between @SpringBootTest, @WebMvcTest, and @DataJpaTest?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "`@SpringBootTest` loads the ENTIRE ApplicationContext (all beans, services, repositories, security). `@WebMvcTest` loads only the presentation layer (controllers, controller advice, filters; repositories must be mocked). `@DataJpaTest` loads only JPA entities, repositories, and an embedded or Testcontainers database (disables services and controllers).",
            mentalModel: "If the app is a whole house: `@SpringBootTest` turns on the power, heating, plumbing, and security alarm for the entire mansion. `@WebMvcTest` only turns on the lights in the foyer. `@DataJpaTest` only turns on the basement water heater.",
            whatItIs: "Test Slices introduced in Spring Boot 1.4 to test individual application layers in isolation with fast startup times.",
            whyItExists: "Testing a REST controller does not need database connection pools, Kafka producers, or scheduled tasks to load.",
            comparisonTable: {
              title: "@SpringBootTest vs @WebMvcTest vs @DataJpaTest Comparison Matrix",
              headers: ["Test Annotation", "Context Scope Loaded", "Database / Persistence", "HTTP Mocking Tool", "Execution Speed & Use Case"],
              rows: [
                ["@SpringBootTest", "Full ApplicationContext (all beans, services, repos, security, config)", "Real or embedded DB connected based on profile", "TestRestTemplate, WebTestClient, or @AutoConfigureMockMvc", "Slowest (heavy startup); End-to-end user journeys & critical multi-service flows"],
                ["@WebMvcTest", "Presentation slice only: Controllers, @ControllerAdvice, Filters", "Disabled (Repositories and Services MUST be mocked via @MockBean)", "MockMvc (mocked HTTP request/response dispatch)", "Fast (under 1–2s); Validating HTTP status codes, JSON serialization, input validation (@Valid)"],
                ["@DataJpaTest", "Persistence slice only: @Entity, Repositories, EntityManager, DataSource", "Enabled (auto-configures embedded H2 or Testcontainers; auto-rolls back)", "None (no web environment initialized)", "Very fast; Testing complex custom @Query, JPQL joins, derived queries, and SQL constraints"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Test ONLY Web Layer with @WebMvcTest\n@WebMvcTest(UserController.class)\nclass UserControllerTest {\n    @Autowired private MockMvc mockMvc;\n    @MockBean private UserService userService; // Must mock collaborators!\n\n    @Test\n    void shouldValidateInvalidInput() throws Exception {\n        mockMvc.perform(post(\"/users\")\n                .contentType(MediaType.APPLICATION_JSON)\n                .content(\"{\\\"email\\\": \\\"invalid-email\\\"}\"))\n            .andExpect(status().isBadRequest())\n            .andExpect(jsonPath(\"$.email\").exists());\n    }\n}\n\n// Test ONLY Data Layer with @DataJpaTest\n@DataJpaTest\nclass UserRepositoryTest {\n    @Autowired private UserRepository userRepo;\n    @Test\n    void shouldFindActiveUsers() {\n        userRepo.save(new User(\"alice\", true));\n        assertThat(userRepo.findByActiveTrue()).hasSize(1);\n    }\n}"
            },
            tradeoffs: "`@DataJpaTest` runs tests in a transaction that automatically rolls back at the end of each test method. While great for test isolation, it hides transaction commit errors or flush bugs unless `TestEntityManager.flush()` is called explicitly.",
            theyMightAskNext: [
              {
                question: "What does @AutoConfigureTestDatabase do in @DataJpaTest?",
                answer: "By default, it replaces your configured real database with an in-memory database (H2/HSQLDB). Set `replace = AutoConfigureTestDatabase.Replace.NONE` when testing against real PostgreSQL using Testcontainers."
              }
            ],
            usedInProduction: "Used in all high-velocity engineering teams to keep unit/slice test suites running in under 2 minutes.",
            relatedTopics: ["sb-testing-overview", "sb-mockbean-vs-spybean", "sb-testcontainers-integration"]
          }
        },
        {
          id: "sb-mockbean-vs-spybean",
          question: "What is the difference between @MockBean, @SpyBean, and plain Mockito @Mock, and how does @MockBean pollute context caching?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "`@Mock` is a pure Mockito mock outside of Spring. `@MockBean` registers a mock inside Spring's `ApplicationContext`, replacing any existing bean of that type. `@SpyBean` wraps an existing real bean in a Mockito spy, allowing verification while calling real methods. Caution: each unique `@MockBean` configuration creates a NEW ApplicationContext, degrading test suite performance.",
            mentalModel: "Plain `@Mock` is an actor rehearsing alone in a hotel room. `@MockBean` is having that actor walk onto the Broadway stage during the live play and physically replace the lead actor. `@SpyBean` is having a prompter stand next to the lead actor on stage taking notes while the actor speaks their real lines.",
            whatItIs: "Spring Boot annotations in `org.springframework.boot.test.mock.mockito`. Automatically reset after each test method (`MockitoTestExecutionListener`).",
            whyItExists: "Allows replacing external payment gateways or third-party web services with mocks inside Spring integration tests.",
            comparisonTable: {
              title: "@Mock vs @MockBean vs @SpyBean Comparison Matrix",
              headers: ["Annotation", "Framework Ecosystem", "Spring ApplicationContext Interaction", "Default Method Behavior", "Context Cache Impact"],
              rows: [
                ["Mockito @Mock", "Pure Mockito (Unit testing)", "None: does NOT interact with or modify Spring ApplicationContext", "All methods return dummy values (null, 0, empty list) unless stubbed", "Zero impact: executes with instant unit test speed"],
                ["Spring Boot @MockBean", "Spring Boot Test (Integration testing)", "Replaces the actual bean in Spring ApplicationContext with a Mockito mock", "All methods return dummy defaults unless stubbed with when()", "High: each unique set of @MockBeans triggers a separate ApplicationContext startup"],
                ["Spring Boot @SpyBean", "Spring Boot Test (Integration testing)", "Wraps the real existing bean in Spring ApplicationContext with a Mockito spy", "Executes real implementation methods while recording method invocations for verify()", "High: causes context cache invalidation if configured differently per test class"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "@SpringBootTest\nclass CheckoutServiceTest {\n    @Autowired private CheckoutService checkoutService;\n\n    // Replaces real PaymentGateway in Spring Context with Mockito mock:\n    @MockBean private PaymentGateway paymentGateway;\n\n    // Spies on real AuditService (calls real method, but tracks invocations):\n    @SpyBean private AuditService auditService;\n\n    @Test\n    void testCheckout() {\n        when(paymentGateway.charge(any())).thenReturn(PaymentResult.SUCCESS);\n        checkoutService.checkout(orderId);\n        verify(auditService).recordAudit(any()); // Verify spy\n    }\n}"
            },
            tradeoffs: "Context Cache Pollution: Spring caches ApplicationContext based on configuration. If Test A has `@MockBean Service1`, Test B has `@MockBean Service2`, and Test C has no mock beans, Spring must start 3 separate ApplicationContexts, tripling test run times!",
            theyMightAskNext: [
              {
                question: "What replaced @MockBean in Spring Boot 3.4+ / Spring Framework 6.2?",
                answer: "Spring Framework 6.2 introduced `@MockitoBean` and `@MockitoSpyBean`, standardizing mock bean integration directly into core Spring Framework and deprecating Boot's legacy `@MockBean`."
              }
            ],
            usedInProduction: "Standard practice: group common `@MockBean` definitions into an abstract base test class to prevent context cache thrashing across test runs.",
            relatedTopics: ["sb-springboottest-vs-webmvctest", "sb-testing-overview"]
          }
        },
        {
          id: "sb-testcontainers-integration",
          question: "How do you use Testcontainers in Spring Boot 3 with @ServiceConnection for real database integration testing?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Testcontainers runs real Docker containers (PostgreSQL, Kafka, Redis) for integration tests. Spring Boot 3.1+ introduced `@ServiceConnection`, which automatically discovers container ports and auto-configures `spring.datasource.url`, username, and password with zero manual `DynamicPropertyRegistry` boilerplate.",
            mentalModel: "Old testing with in-memory H2 is like practicing tennis against a smooth brick wall: it doesn't bounce the way a real opponent hits. Testcontainers with `@ServiceConnection` spins up a real professional tennis opponent (actual PostgreSQL container) on demand in 2 seconds.",
            whatItIs: "Eliminates the 'H2 vs PostgreSQL' discrepancy: in-memory H2 databases support different SQL syntax, lack native JSONB/full-text search, and hide real database deadlocks or lock semantics.",
            whyItExists: "Guarantees tests run against the exact same database engine version running in production Kubernetes.",
            codeDemo: {
              language: "java",
              code: "@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)\n@Testcontainers\nclass OrderIntegrationTest {\n\n    // Starts real PostgreSQL Docker container!\n    // @ServiceConnection auto-wires Spring Boot DataSource properties automatically\n    @Container\n    @ServiceConnection\n    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(\"postgres:16-alpine\");\n\n    @Container\n    @ServiceConnection\n    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse(\"confluentinc/cp-kafka:7.5.0\"));\n\n    @Autowired private OrderRepository orderRepo;\n\n    @Test\n    void shouldPersistOrderInRealPostgres() {\n        Order order = orderRepo.save(new Order(\"ORD-123\", BigDecimal.TEN));\n        assertThat(order.getId()).isNotNull();\n    }\n}"
            },
            tradeoffs: "Requires Docker running on the host machine or CI runner. Container startup adds 2–5 seconds of initial overhead (mitigated by sharing containers via `@RestartScope` or singleton container pattern across test suites).",
            theyMightAskNext: [
              {
                question: "Can you use Testcontainers for local development (running the app against Docker)?",
                answer: "Yes! Spring Boot 3.1+ allows running your application in local development using `TestApplication.from(MyApp::main).with(MyTestcontainersConfig.class).run(args)`, spinning up local dev DBs automatically."
              }
            ],
            usedInProduction: "The universal gold standard for enterprise integration testing in GitHub Actions, replacing flaky embedded H2 and mock Kafka servers.",
            relatedTopics: ["sb-springboottest-vs-webmvctest", "sb-database-migrations-flyway"]
          }
        },
        {
          id: "sb-mockmvc-testing",
          question: "How do you test REST controllers with MockMvc and assert status codes, headers, and JSONPath responses?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "`MockMvc` provides end-to-end testing of Spring MVC controller pipelines without starting an HTTP server. It simulates HTTP requests, tests filters, message converters, bean validation, and allows rich assertions using `status()`, `header()`, and `jsonPath(\"$.fieldName\")`.",
            mentalModel: "Like a flight simulator for airplanes: you sit in the exact cockpit, flip all the actual switches, and experience simulated turbulence, but the airplane never physically leaves the ground.",
            whatItIs: "Dispatches requests directly into Spring MVC's `DispatcherServlet`. Supports mocking security authentication via `SecurityMockMvcRequestPostProcessors.jwt()` or `.csrf()`.",
            whyItExists: "Faster than spinning up an actual embedded Tomcat and network port while still exercising serialization, validation, and HTTP status codes.",
            codeDemo: {
              language: "java",
              code: "@WebMvcTest(OrderController.class)\nclass OrderControllerTest {\n    @Autowired private MockMvc mockMvc;\n    @MockBean private OrderService orderService;\n\n    @Test\n    void shouldReturnOrderWhenAuthenticated() throws Exception {\n        UUID id = UUID.randomUUID();\n        when(orderService.getOrder(id)).thenReturn(new OrderDto(id, \"PENDING\", new BigDecimal(\"99.00\")));\n\n        mockMvc.perform(get(\"/api/v1/orders/{id}\", id)\n                .with(jwt().jwt(j -> j.claim(\"scope\", \"orders:read\")))\n                .accept(MediaType.APPLICATION_JSON))\n            .andExpect(status().isOk())\n            .andExpect(header().string(\"Content-Type\", \"application/json\"))\n            .andExpect(jsonPath(\"$.id\").value(id.toString()))\n            .andExpect(jsonPath(\"$.status\").value(\"PENDING\"))\n            .andExpect(jsonPath(\"$.amount\").value(99.00));\n    }\n}"
            },
            tradeoffs: "`MockMvc` operates at the mock servlet level and cannot test real network features (HTTP/2, chunked transfer encoding, WebSockets). For full network transport testing, use `TestRestTemplate` or `WebTestClient` with `@SpringBootTest(webEnvironment = RANDOM_PORT)`.",
            theyMightAskNext: [
              {
                question: "What is jsonPath syntax based on?",
                answer: "Jayway JsonPath library. `$` is root, `$.store.book[0].title` accesses nested properties, `$.books[?(@.price < 10)]` filters by predicate, and `$.items.length()` checks array size."
              }
            ],
            usedInProduction: "Standard testing tool in 95% of Spring MVC unit/slice test suites.",
            relatedTopics: ["sb-springboottest-vs-webmvctest", "sb-bean-validation"]
          }
        }
      ]
    },
    {
      id: "spring-boot-3-cloud-native",
      title: "Spring Boot 3, GraalVM & Kubernetes",
      questions: [
        {
          id: "sb-spring-boot-3-migration",
          question: "What are the major architectural breaking changes in Spring Boot 3.0 that developers must know?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "1. Java 17 Baseline (Java 8/11 no longer supported), 2. Jakarta EE 9/10 baseline (`javax.*` renamed to `jakarta.*` across Servlets, JPA, Validation), 3. Spring Security 6 (removal of `WebSecurityConfigurerAdapter`), 4. Trailing slash URL matching removed, 5. Built-in Ahead-Of-Time (AOT) and GraalVM Native Image support, 6. Micrometer Tracing replaces Spring Cloud Sleuth.",
            mentalModel: "A massive continental railway gauge upgrade: all old narrow-gauge train engines (Java 8, `javax.*`) are retired, and standard high-speed electric tracks (Java 17, `jakarta.*`, AOT) are installed across the entire network.",
            whatItIs: "Spring Boot 3.0 (released Nov 2022) is the first major revision in 4.5 years, built on Spring Framework 6. It modernizes the entire enterprise Java ecosystem.",
            whyItExists: "Oracle transferred Java EE to the Eclipse Foundation, requiring the package rename to `jakarta.*`. It also incorporates modern Java 17 language features (Records, Pattern Matching) across the core framework.",
            codeDemo: {
              language: "java",
              code: "// BEFORE (Spring Boot 2.x - javax)\nimport javax.persistence.Entity;\nimport javax.validation.constraints.NotNull;\nimport javax.servlet.http.HttpServletRequest;\n\n// AFTER (Spring Boot 3.x - jakarta)\nimport jakarta.persistence.Entity;\nimport jakarta.persistence.Id;\nimport jakarta.validation.constraints.NotNull;\nimport jakarta.servlet.http.HttpServletRequest;\n\n// Trailing slash behavior in Spring Boot 3:\n// /users and /users/ are now treated as TWO DIFFERENT URLs by default!\n// To restore legacy behavior (discouraged):\n// configurer.setUseTrailingSlashMatch(true);"
            },
            tradeoffs: "Third-party libraries that haven't updated to `jakarta.*` will crash with `ClassNotFoundException: javax.servlet.Filter`. Upgrading requires updating all database drivers, Lombok, and Swagger/OpenAPI (`springdoc-openapi` v2).",
            theyMightAskNext: [
              {
                question: "What tool helps automate migration to Spring Boot 3?",
                answer: "OpenRewrite (`org.openrewrite.recipe:rewrite-spring:upgradeSpringBoot_3_0`), which automatically updates pom.xml dependencies and renames `javax.*` imports to `jakarta.*` across your entire codebase."
              }
            ],
            usedInProduction: "Active priority migration across global enterprise engineering teams to maintain security patches and avoid End-of-Life (EOL) Spring Boot 2.x vulnerability risks.",
            relatedTopics: ["sb-spring-boot-3-migration", "sb-graalvm-aot-native-image", "sb-security-filter-chain-dsl"]
          }
        },
        {
          id: "sb-graalvm-aot-native-image",
          question: "How does GraalVM Ahead-Of-Time (AOT) Native Image work in Spring Boot 3, and what are its pros and cons?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring AOT processes bean definitions, reflections, and proxies at COMPILE TIME rather than runtime, compiling the application directly into a standalone platform-native machine binary (via GraalVM `native-image`). Startup time drops to 30ms and RAM drops to 40MB.",
            mentalModel: "Standard JVM is packing IKEA furniture in flat boxes with instruction manuals and tools: every time you boot the app, the JVM unboxes the parts, reads the manual (reflection), and builds the furniture (JIT compilation). GraalVM Native Image is delivering pre-assembled, welded solid oak furniture: instant use, zero assembly required.",
            whatItIs: "Spring Boot 3 integrates Spring AOT engine (`spring-boot-maven-plugin:build-image`). Analyzes the closed-world assumption: all classes and reflections must be known at compile time.",
            whyItExists: "Ideal for serverless architectures (AWS Lambda, Google Cloud Run) where JVM cold-start latency (10–30 seconds) is unacceptable.",
            codeDemo: {
              language: "bash",
              code: "# Build a GraalVM native executable directly using Docker Buildpacks:\n./mvnw -Pnative spring-boot:build-image\n\n# Or local native executable:\n./mvnw -Pnative native:compile\n\n# Run the native binary:\n./target/revizo-api\n# Output: Started Application in 0.038 seconds (process running for 0.042)!\n# Memory footprint: 45MB vs 450MB standard JVM"
            },
            tradeoffs: "Cons: 1. Build times are long (5–10 minutes and requires 8GB+ RAM during compile), 2. Peak sustained throughput is often 5–10% lower than a fully warmed-up JVM with C2 JIT compiler, 3. Libraries using dynamic reflection require explicit `reflect-config.json` hints.",
            theyMightAskNext: [
              {
                question: "What is RuntimeHints in Spring AOT?",
                answer: "A programmatic API (`RuntimeHintsRegistrar`) that informs the GraalVM native compiler about classes loaded via reflection, resources accessed via classpath, or dynamic proxies that would otherwise be pruned."
              }
            ],
            usedInProduction: "Widely used for Kubernetes scale-to-zero serverless functions (Knative / AWS Lambda) and high-density microservice clusters.",
            relatedTopics: ["sb-spring-boot-3-migration", "sb-docker-buildpacks", "sb-startup-optimization-cds"]
          }
        },
        {
          id: "sb-docker-buildpacks",
          question: "How do Cloud Native Buildpacks work in Spring Boot and why are they preferred over custom Dockerfiles?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring Boot includes built-in Cloud Native Buildpack support (`./mvnw spring-boot:build-image`). It builds production-grade, secure, layered OCI container images without writing a `Dockerfile` and without needing a local Docker daemon on your host machine.",
            mentalModel: "Writing a custom Dockerfile is cooking a recipe from scratch where you have to remember food safety rules, non-root users, and clean pans. Cloud Native Buildpacks is a Michelin-star commercial kitchen automation system that packages your meal according to strict international safety and layering standards automatically.",
            whatItIs: "Implements the Cloud Native Computing Foundation (CNCF) Buildpacks specification using Paketo buildpacks. Splits the application into distinct image layers: dependencies, Spring Boot loader, snapshot dependencies, application classes.",
            whyItExists: "Eliminates common Dockerfile security anti-patterns (running as root, missing multi-stage builds, monolithic single-layer JARs that break Docker caching on every 1-line code change).",
            codeDemo: {
              language: "bash",
              code: "# Build OCI container image without Dockerfile:\n./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=registry.revizo.com/api:1.0.0\n\n# Docker image layers created automatically:\n# Layer 1: OS base (Ubuntu Bionic with security patches)\n# Layer 2: OpenJDK 17 runtime\n# Layer 3: Application dependencies (cached across builds!)\n# Layer 4: Spring Boot loader\n# Layer 5: Application code & resources (only layer re-uploaded on code changes)"
            },
            tradeoffs: "Customizing low-level OS packages (e.g. installing custom fonts or C libraries like `wkhtmltopdf`) requires configuring custom Buildpack bindings or custom builder images.",
            theyMightAskNext: [
              {
                question: "What is Layered JAR in Spring Boot?",
                answer: "Spring Boot organizes the executable JAR into layers (`dependencies`, `spring-boot-loader`, `application`). When code changes, Docker only pushes the 2MB application layer instead of re-pushing a 100MB fat JAR."
              }
            ],
            usedInProduction: "Standard image creation mechanism in enterprise CI pipelines at VMware, Pivotal, and Fortune 500 banks.",
            relatedTopics: ["sb-graalvm-aot-native-image", "sb-startup-optimization-cds"]
          }
        },
        {
          id: "sb-kubernetes-probes",
          question: "How do Kubernetes Liveness and Readiness Probes integrate with Spring Boot Actuator?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring Boot automatically provides dedicated probe endpoints: `/actuator/health/liveness` (checks if internal JVM state is alive; failure restarts container) and `/actuator/health/readiness` (checks if app is ready to accept HTTP traffic; failure stops routing traffic).",
            mentalModel: "Liveness probe is checking for a heartbeat: if the patient has flatlined (deadlocked threads), call the defibrillator (restart pod). Readiness probe is checking if the surgeon has scrubbed in: if the surgeon is still washing their hands (warming up cache, waiting for DB), don't roll the patient into the operating room yet.",
            whatItIs: "Uses `LivenessState` (`CORRECT`, `BROKEN`) and `ReadinessState` (`ACCEPTING_TRAFFIC`, `REFUSING_TRAFFIC`). Automatically active when Spring Boot detects it is running inside a Kubernetes environment.",
            whyItExists: "Prevents routing user traffic to a starting pod whose connection pools are still initializing, and recovers automatically from catastrophic deadlocks without manual engineer intervention.",
            codeDemo: {
              language: "yaml",
              code: "# Kubernetes Deployment Spec\nports:\n  - containerPort: 8080\nlivenessProbe:\n  httpGet:\n    path: /actuator/health/liveness\n    port: 8080\n  initialDelaySeconds: 30\n  periodSeconds: 10\nreadinessProbe:\n  httpGet:\n    path: /actuator/health/readiness\n    port: 8080\n  initialDelaySeconds: 15\n  periodSeconds: 5\n\n// Java: Programmatically publish readiness state changes\n@Autowired private ApplicationEventPublisher eventPublisher;\npublic void pauseTrafficForMaintenance() {\n    AvailabilityChangeEvent.publish(eventPublisher, this, ReadinessState.REFUSING_TRAFFIC);\n}"
            },
            tradeoffs: "NEVER include external dependencies (like remote database or Kafka checks) in the Liveness Probe! If the database has a 10-second network hiccup, all 50 microservice pods will fail their liveness checks and reboot simultaneously, creating a catastrophic cascading restart storm.",
            theyMightAskNext: [
              {
                question: "What is Kubernetes Startup Probe and when should you use it with Spring Boot?",
                answer: "Startup Probe protects slow-starting applications. It disables liveness checks until the startup probe succeeds, preventing Kubernetes from prematurely killing a pod during a 60-second database migration or warm-up phase."
              }
            ],
            usedInProduction: "Configured across 100% of production Kubernetes Helm charts and deployment manifests.",
            relatedTopics: ["sb-actuator-overview", "sb-custom-health-indicator", "sb-graceful-shutdown"]
          }
        },
        {
          id: "sb-startup-optimization-cds",
          question: "How do you optimize Spring Boot startup time using Application Class Data Sharing (AppCDS) and JVM tuning?",
          difficulty: "Advanced",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "AppCDS dumps loaded class metadata into a shared archive (`.jsa`) during build; subsequent starts memory-map the archive directly, reducing startup time by 40–50% and memory by 20%. Combine with `-XX:TieredStopAtLevel=1` (for test/dev) and lazy initialization.",
            mentalModel: "Think of reading a large dictionary: instead of looking up and parsing 20,000 words every morning (classloading & bytecode verification), you take a high-resolution photocopy of the already-parsed index. Tomorrow morning, you just open the photocopy instantly.",
            whatItIs: "AppCDS is a JVM feature standard in OpenJDK 17+. Spring Boot 3.3 introduced automated CDS training and archive creation in the Spring Boot Maven/Gradle plugin.",
            whyItExists: "Enterprise Spring Boot microservices typically load 15,000–25,000 classes at startup. Parsing and verifying bytecode on every container launch consumes 5–15 seconds of CPU time.",
            codeDemo: {
              language: "bash",
              code: "# 1. Perform training run to generate CDS class list and archive:\njava -XX:ArchiveClassesAtExit=app.jsa -Dspring.context.exit=onRefresh -jar app.jar\n\n# 2. Production startup using the generated shared archive:\njava -XX:SharedArchiveFile=app.jsa -jar app.jar\n# Startup time drops from 6.5s to 3.2s!\n\n# In Dockerfile with Spring Boot 3.3+:\n# RUN java -Djarmode=tools -jar app.jar extract\n# RUN java -XX:ArchiveClassesAtExit=application.jsa -Dspring.context.exit=onRefresh -jar application.jar"
            },
            tradeoffs: "The CDS archive (`.jsa`) is architecture-specific (x86_64 vs arm64) and JVM-build-specific; you cannot create an archive on macOS ARM and run it inside a Linux x86 container.",
            theyMightAskNext: [
              {
                question: "What is Project CRaC (Coordinated Restore at Checkpoint) in Spring Boot?",
                answer: "Project CRaC checkpoints a fully warmed-up running JVM memory snapshot to disk. On pod startup, it restores from the checkpoint in under 50 milliseconds with full JIT compiler performance."
              }
            ],
            usedInProduction: "Standard container optimization for high-density microservices on Kubernetes, reducing cluster autoscaling delays from 20s to under 4s.",
            relatedTopics: ["sb-graalvm-aot-native-image", "sb-kubernetes-probes", "sb-lazy-initialization"]
          }
        }
      ]
    }
  ]
};
