import { Category } from "@/types";

export const springBootMicroservicesCategory: Category = {
  id: "sb-microservices",
  title: "Microservices & Distributed Systems",
  subTopics: [
    {
      id: "service-discovery-gateway",
      title: "Discovery, Gateway & Tracing",
      questions: [
        {
          id: "sb-service-discovery-eureka",
          question: "How does Service Discovery (Eureka / Consul) work, and how does client-side load balancing work with Spring Cloud LoadBalancer?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Microservice instances register their dynamic IP/port with a Service Registry (Eureka/Consul) on startup and send periodic heartbeats (every 30s). Calling services use Spring Cloud LoadBalancer (`@LoadBalanced` WebClient/RestClient) to fetch the instance list from the registry and pick an instance using round-robin or least-connections.",
            mentalModel: "Think of an air traffic control radar: airplanes (microservice instances) report their altitude and GPS coordinates every 30 seconds. When a pilot needs to contact an airport (client service), they ask air traffic control for the active runway frequencies and route directly to an open lane.",
            whatItIs: "Client-side load balancing eliminates the single-point-of-failure and network hop of hardware load balancers. Spring Cloud LoadBalancer replaced Netflix Ribbon in modern Spring Cloud.",
            whyItExists: "In dynamic cloud/Kubernetes environments, autoscaling pods spin up and down with ephemeral IP addresses that cannot be hardcoded in configuration files.",
            codeDemo: {
              language: "java",
              code: "// Eureka Client Configuration in Spring Boot\n@Configuration\npublic class ClientConfig {\n    @Bean\n    @LoadBalanced // Enables client-side load balancing with Spring Cloud LoadBalancer\n    public RestClient.Builder restClientBuilder() {\n        return RestClient.builder();\n    }\n}\n\n@Service\npublic class OrderService {\n    private final RestClient restClient;\n\n    public OrderService(RestClient.Builder builder) {\n        // Resolves 'PAYMENT-SERVICE' virtual service name via Eureka registry!\n        this.restClient = builder.baseUrl(\"http://PAYMENT-SERVICE\").build();\n    }\n\n    public PaymentResponse pay(PaymentRequest req) {\n        return restClient.post()\n            .uri(\"/api/v1/payments\")\n            .body(req)\n            .retrieve()\n            .body(PaymentResponse.class);\n    }\n}"
            },
            tradeoffs: "In cloud-native Kubernetes environments, dedicated Eureka clusters are often redundant because Kubernetes native Services (`kube-dns`) and CoreDNS handle service discovery and load balancing natively.",
            theyMightAskNext: [
              {
                question: "What is Eureka's Self-Preservation Mode?",
                answer: "If Eureka stops receiving heartbeats from more than 15% of registered instances within 15 minutes (due to network partition, not server death), it enters self-preservation mode and stops deregistering instances to avoid catastrophic mass evictions."
              }
            ],
            usedInProduction: "Widely used in multi-region AWS/on-premise deployments; teams on pure Kubernetes prefer K8s headless services and CoreDNS.",
            relatedTopics: ["sb-spring-cloud-gateway", "sb-circuit-breaker-resilience4j"]
          }
        },
        {
          id: "sb-spring-cloud-gateway",
          question: "How does Spring Cloud Gateway work and how do Route Predicates and Gateway Filters differ?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring Cloud Gateway is a non-blocking API Gateway built on Spring WebFlux and Project Reactor (Netty). It matches requests to downstream microservices using Route Predicates (path, method, headers), and mutates requests/responses using Gateway Filters (auth, rate limiting, header injection).",
            mentalModel: "Think of an international customs gate: Route Predicates are the signs ('EU citizens this way', 'Cargo trucks to Lane 3'). Gateway Filters are the customs officers who stamp your passport, inspect luggage, check contraband, and add tracking stickers to your boxes before letting you proceed.",
            whatItIs: "Replaced legacy Netflix Zuul 1 (which was blocking). Handles cross-cutting edge concerns: authentication, token validation, rate limiting, request routing, SSL termination, and canary deployments.",
            whyItExists: "Prevents exposing dozens of individual microservice ports directly to the internet; provides a single unified entry point for clients.",
            codeDemo: {
              language: "yaml",
              code: "# application.yml - Spring Cloud Gateway Routes\nspring:\n  cloud:\n    gateway:\n      routes:\n        - id: order-service-route\n          uri: lb://ORDER-SERVICE # Dynamic routing via Service Discovery\n          predicates:\n            - Path=/api/v1/orders/**\n            - Method=GET,POST\n            - Header=X-Tenant-Id, .+\n          filters:\n            - AddRequestHeader=X-Gateway-Source, EdgeGateway\n            - RewritePath=/api/v1/orders/(?<segment>.*), /orders/$\\{segment}\n            - name: RequestRateLimiter\n              args:\n                redis-rate-limiter.replenishRate: 50\n                redis-rate-limiter.burstCapacity: 100"
            },
            tradeoffs: "Because Spring Cloud Gateway is strictly non-blocking (Reactor/Netty), NEVER block the thread inside custom Gateway Filters (e.g., executing blocking JDBC calls). Any blocking call will freeze the entire gateway event loop.",
            theyMightAskNext: [
              {
                question: "What is the difference between GlobalFilter and GatewayFilter?",
                answer: "GlobalFilter applies unconditionally to every single request traversing the gateway (e.g. global correlation ID tracing). GatewayFilter is scoped to specific configured routes (e.g. rate-limiting only `/payment/**`)."
              }
            ],
            usedInProduction: "The standard edge gateway routing billions of daily API requests in enterprise Spring Cloud architectures.",
            relatedTopics: ["sb-spring-webflux-reactive", "sb-rate-limiting-bucket4j", "sb-distributed-tracing-micrometer"]
          }
        },
        {
          id: "sb-distributed-tracing-micrometer",
          question: "How does Distributed Tracing work in Spring Boot 3 with Micrometer Tracing, OpenTelemetry, and Zipkin?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Micrometer Tracing (replacing Spring Cloud Sleuth in Spring Boot 3) injects a unique `traceId` (entire request journey) and `spanId` (individual service step) into logging MDC and HTTP/Kafka headers (W3C Trace Context). Spans are exported to Zipkin, Jaeger, or OpenTelemetry collectors for visualization.",
            mentalModel: "Think of tracking an Amazon parcel: the parcel tracking number (Trace ID) stays the same from warehouse to delivery truck to your doorstep. Each sorting facility scans and stamps its own local transit stamp (Span ID) with timestamps so you can pinpoint exactly which depot caused a 3-day delay.",
            whatItIs: "Standardized observability framework. Automatically instruments HTTP clients (RestClient, WebClient), message listeners (`@KafkaListener`), and database queries (via DataSource-Proxy).",
            whyItExists: "In a microservice call graph with 15 hops, diagnosing which specific service caused a 4-second timeout or 500 error is impossible without a unified Trace ID across all logs.",
            codeDemo: {
              language: "xml",
              code: "<!-- Spring Boot 3 Tracing Dependencies -->\n<dependency>\n    <groupId>io.micrometer</groupId>\n    <artifactId>micrometer-tracing-bridge-otel</artifactId>\n</dependency>\n<dependency>\n    <groupId>io.opentelemetry</groupId>\n    <artifactId>opentelemetry-exporter-zipkin</artifactId>\n</dependency>\n\n# application.properties\nmanagement.tracing.sampling.probability=1.0 # 100% trace sampling (use 0.1 in prod)\nlogging.pattern.level=%5p [${spring.application.name:},%X{traceId:-},%X{spanId:-}]"
            },
            tradeoffs: "Sampling 100% of traces in high-throughput production (100,000 TPS) generates terabytes of telemetry data, causing network saturation. Set sampling probability to 1%–5% (`sampling.probability=0.05`).",
            theyMightAskNext: [
              {
                question: "What is Baggage in distributed tracing?",
                answer: "Baggage is custom key-value metadata (e.g. `userId`, `tenantId`, `region`) that is propagated along with the trace context across all downstream HTTP headers and Kafka records."
              }
            ],
            usedInProduction: "Standard production observability stack in all enterprise microservice clusters, integrated with Grafana Tempo, Datadog, or Jaeger.",
            relatedTopics: ["sb-async-task-executor", "sb-spring-cloud-gateway", "sb-kafka-spring-boot"]
          }
        },
        {
          id: "sb-centralized-config-server",
          question: "How does Spring Cloud Config Server work and how do you achieve dynamic property reload with @RefreshScope?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring Cloud Config Server serves centralized external configuration from a Git repository or Vault. Client microservices fetch properties at startup. Annotating beans with `@RefreshScope` allows reloading updated properties dynamically when `/actuator/refresh` is triggered without restarting the pod.",
            mentalModel: "A central digital news bulletin: instead of printing new manuals and delivering them to every branch office daily (rebuilding/redeploying pods), the central office updates the website. The branch monitors notice the update and refresh their display screens on the fly (@RefreshScope).",
            whatItIs: "Config client loads configuration during the bootstrap phase (`spring.config.import=configserver:`). `@RefreshScope` wraps beans in a lazy proxy; when refreshed, the bean instance is destroyed and recreated on next method invocation with fresh property values.",
            whyItExists: "Enables changing logging levels, feature flags, and timeouts across 200 microservice instances simultaneously without triggering rolling Kubernetes deployments.",
            codeDemo: {
              language: "java",
              code: "@RestController\n@RefreshScope // Enables dynamic reload on /actuator/refresh\npublic class FeatureFlagController {\n\n    @Value(\"${features.new-checkout:false}\")\n    private boolean newCheckoutEnabled;\n\n    @GetMapping(\"/checkout-status\")\n    public String getStatus() {\n        return newCheckoutEnabled ? \"New Checkout Active\" : \"Legacy Checkout\";\n    }\n}\n\n# Trigger reload via POST request to actuator:\n# curl -X POST http://localhost:8080/actuator/refresh"
            },
            tradeoffs: "Dynamic refresh can cause subtle concurrency race conditions if stateful beans are re-instantiated in the middle of active user transactions.",
            theyMightAskNext: [
              {
                question: "How do you broadcast configuration refresh across 50 instances simultaneously?",
                answer: "Use Spring Cloud Bus backed by Kafka or RabbitMQ. Sending a single POST request to `/actuator/busrefresh` on one instance publishes an event that refreshes all 50 instances at once."
              }
            ],
            usedInProduction: "Used for dynamic feature toggles and rate-limit tuning; Kubernetes ConfigMaps with Stakater Reloader provide an alternative container-native approach.",
            relatedTopics: ["sb-value-vs-configprops", "sb-profiles-external-config"]
          }
        },
        {
          id: "sb-api-versioning",
          question: "What are the 4 main API Versioning strategies in Spring Boot and which is recommended?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "1. URI Path Versioning (`/api/v1/orders`), 2. Request Parameter Versioning (`/orders?version=1`), 3. Custom Header Versioning (`X-API-Version: 1`), 4. Content Negotiation / Media Type Versioning (`Accept: application/vnd.company.v1+json`). URI Path versioning is the industry-recommended standard for public APIs.",
            mentalModel: "URI path versioning is moving to a new office building with a clearly visible street address. Header versioning is staying in the same building but asking visitors to whisper a secret code at the door to be directed to the new room.",
            whatItIs: "Managing backward-incompatible breaking changes in REST APIs without breaking existing mobile and third-party API clients.",
            whyItExists: "Mobile apps cannot be forced to update immediately; thousands of users remain on older versions for months.",
            codeDemo: {
              language: "java",
              code: "@RestController\npublic class OrderVersioningController {\n\n    // 1. URI Path Versioning (Recommended - Clear, cache-friendly, explicit)\n    @GetMapping(\"/api/v1/orders/{id}\")\n    public OrderV1 getOrderV1(@PathVariable Long id) { ... }\n\n    @GetMapping(\"/api/v2/orders/{id}\")\n    public OrderV2 getOrderV2(@PathVariable Long id) { ... }\n\n    // 2. Custom Header Versioning\n    @GetMapping(value = \"/api/orders/{id}\", headers = \"X-API-VERSION=2\")\n    public OrderV2 getOrderHeaderV2(@PathVariable Long id) { ... }\n\n    // 3. Media Type / Accept Header (GitHub style)\n    @GetMapping(value = \"/api/orders/{id}\", produces = \"application/vnd.revizo.v2+json\")\n    public OrderV2 getOrderMediaV2(@PathVariable Long id) { ... }\n}"
            },
            tradeoffs: "Header and Media Type versioning make API testing in browser address bars cumbersome and break default HTTP caching at CDN and browser proxy layers.",
            theyMightAskNext: [
              {
                question: "How long should you support deprecated API versions in production?",
                answer: "Standard practice is a Deprecation Window (typically 6–12 months) with HTTP `Deprecation` and `Sunset` headers (RFC 8594) alerting clients of upcoming end-of-life dates."
              }
            ],
            usedInProduction: "URI Path versioning is used by Stripe, Twilio, and Google; Content-Negotiation versioning is used by GitHub.",
            relatedTopics: ["sb-rest-1", "sb-content-negotiation"]
          }
        }
      ]
    },
    {
      id: "resilience-fault-tolerance",
      title: "Resilience, Circuit Breakers & Outbox Pattern",
      questions: [
        {
          id: "sb-circuit-breaker-resilience4j",
          question: "How does the Circuit Breaker pattern work in Resilience4j and what are the 3 core state transitions?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Resilience4j Circuit Breaker prevents cascading failure when downstream dependencies fail. It has 3 states: 1. CLOSED (normal: requests pass through), 2. OPEN (failing: requests fail-fast immediately without calling downstream), 3. HALF-OPEN (probing: allows a trial batch of requests through to test if the service has recovered).",
            mentalModel: "Think of an electrical circuit breaker in your house: when an electrical short occurs, the breaker trips to OPEN to prevent the house from catching fire. After fixing the wire, you flip the switch to HALF-OPEN; if power flows cleanly, it snaps back to CLOSED.",
            whatItIs: "Monitors calls in a Count-based or Time-based sliding window. If failure rate exceeds `failureRateThreshold` (e.g. 50%), the breaker trips to OPEN. After a `waitDurationInOpenState` (e.g. 10s), it transitions to HALF-OPEN.",
            whyItExists: "Stops threads from blocking on dead downstream services, preventing thread-pool exhaustion and cascading outages across the entire microservice landscape.",
            codeDemo: {
              language: "java",
              code: "@Service\npublic class PaymentServiceClient {\n\n    @CircuitBreaker(name = \"paymentGateway\", fallbackMethod = \"fallbackPayment\")\n    public PaymentResponse processPayment(PaymentRequest req) {\n        // Remote REST call to third-party bank\n        return restClient.post().uri(\"/pay\").body(req).retrieve().body(PaymentResponse.class);\n    }\n\n    // Fallback must have matching signature + Throwable parameter\n    public PaymentResponse fallbackPayment(PaymentRequest req, Throwable t) {\n        log.warn(\"Payment gateway down. Falling back to queued processing. Reason: {}\", t.getMessage());\n        return new PaymentResponse(req.orderId(), PaymentStatus.QUEUED_FOR_RETRY);\n    }\n}\n\n# application.yml\nresilience4j.circuitbreaker.instances.paymentGateway:\n  slidingWindowType: COUNT_BASED\n  slidingWindowSize: 20\n  failureRateThreshold: 50 # 50% failures trips circuit\n  waitDurationInOpenState: 10s\n  permittedNumberOfCallsInHalfOpenState: 5"
            },
            tradeoffs: "Fallback methods must execute in the same class and have matching return types and arguments. Catching general `Throwable` in fallback is essential to intercept both exceptions and circuit open rejections.",
            theyMightAskNext: [
              {
                question: "What replaced Netflix Hystrix in modern Spring Boot microservices?",
                answer: "Resilience4j. Netflix officially deprecated Hystrix in 2018 in favor of Resilience4j, which is lightweight, modular, and built on functional programming principles (Vavr)."
              }
            ],
            usedInProduction: "Standard pattern in every production payment gateway, shipping carrier client, and third-party SMS/email integration.",
            relatedTopics: ["sb-retry-backoff-pattern", "sb-rate-limiter-resilience4j", "sb-fallback-mechanisms"]
          }
        },
        {
          id: "sb-retry-backoff-pattern",
          question: "How do you implement Retry with Exponential Backoff and Jitter in Spring Boot?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Use Resilience4j `@Retry(name = \"serviceName\")` or Spring Retry `@Retryable`. Configure maximum attempts, exponential multiplier (e.g., 2.0x), and add random Jitter to prevent the 'Thundering Herd' problem against downstream servers.",
            mentalModel: "Knocking on an occupied bathroom door: if you knock every 1 second, you annoy the occupant. If 50 people all knock at the exact same 10-second mark (synchronized backoff), the door breaks down. Exponential backoff waits 1s, then 2s, then 4s, and jitter adds random milliseconds so everyone knocks at staggered intervals.",
            whatItIs: "Automatic re-execution of transiently failing operations (e.g., `SocketTimeoutException`, HTTP 503, temporary database deadlocks).",
            whyItExists: "Transient network blips usually resolve within milliseconds; retrying immediately saves transactions from failing without human intervention.",
            codeDemo: {
              language: "properties",
              code: "# Resilience4j Retry Configuration with Exponential Backoff\nresilience4j.retry.instances.orderClient:\n  maxAttempts: 3\n  waitDuration: 500ms\n  enableExponentialBackoff: true\n  exponentialBackoffMultiplier: 2.0 # 500ms -> 1000ms -> 2000ms\n  enableRandomizedWait: true        # Jitter: adds random noise to backoff\n  retryExceptions:\n    - java.io.IOException\n    - org.springframework.web.client.ResourceAccessException\n  ignoreExceptions:\n    - com.company.exceptions.ClientBadRequestException # Do NOT retry 400s!"
            },
            tradeoffs: "NEVER retry non-idempotent operations (like HTTP POST credit card charges) unless the downstream service provides an Idempotency-Key; otherwise, clients get charged twice on network timeouts.",
            theyMightAskNext: [
              {
                question: "Why should you never retry HTTP 4xx Client Errors?",
                answer: "Because 4xx errors (e.g., 400 Bad Request, 401 Unauthorized, 404 Not Found) represent client-side mistakes; retrying identical bad inputs will fail 100% of the time and waste system resources."
              }
            ],
            usedInProduction: "Universal across cloud storage uploads (S3), distributed cache access, and inter-service HTTP communications.",
            relatedTopics: ["sb-circuit-breaker-resilience4j", "sb-kafka-error-handling-dlt"]
          }
        },
        {
          id: "sb-rate-limiter-resilience4j",
          question: "What is the difference between Resilience4j RateLimiter and Bulkhead?",
          difficulty: "Advanced",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "RateLimiter controls request rate OVER TIME (e.g., max 100 requests per second). Bulkhead isolates CONCURRENT executions (e.g., max 10 simultaneous threads), preventing one slow dependency from consuming all CPU/threads and sinking the ship.",
            mentalModel: "Think of an ocean ship: RateLimiter is a turnstile at the gangway admitting only 5 passengers per minute. Bulkhead is the watertight compartments dividing the ship's hull: if water floods one compartment (slow service), the watertight doors seal it off so the rest of the ship stays afloat.",
            whatItIs: "Resilience4j provides two Bulkhead implementations: 1. SemaphoreBulkhead (limits concurrent permits across existing threads), 2. ThreadPoolBulkhead (uses an isolated thread pool with a bounded queue).",
            whyItExists: "If a slow PDF generation service takes 30 seconds per request, 200 concurrent users will seize all 200 Tomcat container threads, freezing the entire application for all other users.",
            comparisonTable: {
              title: "Resilience4j RateLimiter vs Bulkhead Comparison Matrix",
              headers: ["Dimension", "RateLimiter", "Bulkhead (Semaphore / ThreadPool)"],
              rows: [
                ["Protected Resource", "Request velocity / frequency over a time window", "Concurrent thread count / execution capacity at any instant"],
                ["Governing Metric", "Rate: Calls per unit time (e.g. 50 calls / 1 second)", "Concurrency: Active concurrent tasks (e.g. max 10 concurrent threads)"],
                ["Threshold Exceeded Behavior", "Rejects calls exceeding rate with `RequestNotPermitted`", "Rejects calls exceeding concurrency with `BulkheadFullException`"],
                ["Primary Failure Threat", "External API throttling, HTTP 429, API scraping abuse", "Thread pool exhaustion, slow cascading downstream failure, OOM"],
                ["Queueing Ability", "Buffers calls up to `timeoutDuration` to smooth traffic bursts", "Can buffer tasks in a dedicated bounded queue (`ThreadPoolBulkhead`)"],
                ["Analogous Metaphor", "Turnstile admitting a metered count of guests per minute", "Watertight bulkhead compartments containing leaks to a single room"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "@Service\npublic class ReportService {\n\n    // Limits concurrent threads generating reports to max 5\n    @Bulkhead(name = \"reportGen\", type = Bulkhead.Type.SEMAPHORE, fallbackMethod = \"bulkheadFallback\")\n    public byte[] generateHeavyPdf(ReportRequest req) {\n        return pdfEngine.render(req);\n    }\n\n    public byte[] bulkheadFallback(ReportRequest req, BulkheadFullException ex) {\n        throw new ServiceBusyException(\"Report generation capacity full. Please retry shortly.\");\n    }\n}\n\n# application.yml\nresilience4j.bulkhead.instances.reportGen:\n  maxConcurrentCalls: 5\n  maxWaitDuration: 200ms"
            },
            tradeoffs: "`ThreadPoolBulkhead` introduces thread context-switching overhead and loses ThreadLocal context (like SecurityContext or MDC) unless task decorators are configured.",
            theyMightAskNext: [
              {
                question: "How do you combine CircuitBreaker, RateLimiter, and Bulkhead on the same method?",
                answer: "Stack the annotations. In Resilience4j, the execution order is: Bulkhead -> TimeLimiter -> RateLimiter -> CircuitBreaker -> Retry."
              }
            ],
            usedInProduction: "Essential when integrating with slow internal batch services, heavy image processing, or legacy mainframes.",
            relatedTopics: ["sb-circuit-breaker-resilience4j", "sb-rate-limiting-bucket4j"]
          }
        },
        {
          id: "sb-fallback-mechanisms",
          question: "What are the common Fallback Strategies in microservices when downstream calls fail?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Common strategies include: 1. Cached Data Fallback (return stale Redis or in-memory cache), 2. Default/Stub Fallback (empty list, generic message), 3. Degraded Quality Fallback (return low-res image, skip recommendations), 4. Asynchronous Queue Fallback (buffer request to Kafka/DB for later processing).",
            mentalModel: "Think of an online streaming service: if the personalized recommendation engine crashes, Netflix doesn't show a 500 error screen; it displays the generic 'Top 10 in your Country' list. You don't even notice the service failed.",
            whatItIs: "Graceful degradation pattern: accepting reduced functionality or eventual consistency rather than presenting hard error pages to customers.",
            whyItExists: "High availability: a non-critical feature failure (e.g. product reviews, related items) should never block high-value revenue actions (e.g. buying the product).",
            codeDemo: {
              language: "java",
              code: "@Service\npublic class ProductRecommendationClient {\n    private final RedisTemplate<String, List<ProductDto>> redisTemplate;\n\n    @CircuitBreaker(name = \"recommendationService\", fallbackMethod = \"getCachedOrTrendingFallback\")\n    public List<ProductDto> getPersonalizedRecommendations(String userId) {\n        return restClient.get().uri(\"/recommendations/\" + userId).retrieve().body(new ParameterizedTypeReference<>() {});\n    }\n\n    // Fallback: Return stale cache or static trending list\n    public List<ProductDto> getCachedOrTrendingFallback(String userId, Throwable t) {\n        List<ProductDto> cached = redisTemplate.opsForValue().get(\"rec:\" + userId);\n        if (cached != null) return cached;\n        return getStaticTrendingProducts(); // Graceful degradation!\n    }\n}"
            },
            tradeoffs: "Fallbacks are inappropriate for financial transactions: you cannot 'fallback' to a fake success receipt if payment debit fails.",
            theyMightAskNext: [
              {
                question: "What should a fallback method return for write mutations?",
                answer: "Enqueue the write into a persistent queue (Transactional Outbox or Kafka dead-letter queue) and return HTTP 202 Accepted with a tracking ticket ID."
              }
            ],
            usedInProduction: "Universal design in Amazon product detail pages: 100+ microservices compose a single page; failures in reviews or sellers gracefully degrade to static content without breaking the page.",
            relatedTopics: ["sb-circuit-breaker-resilience4j", "sb-outbox-pattern"]
          }
        },
        {
          id: "sb-cqrs-event-sourcing",
          question: "What is the CQRS (Command Query Responsibility Segregation) pattern in Spring Boot microservices?",
          difficulty: "Advanced",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "CQRS splits an application into two distinct models: 1. Command Model (handles write/mutations, business validation, high consistency using PostgreSQL/RDBMS), 2. Query Model (handles fast reads, projections, full-text search using Elasticsearch/MongoDB). The models are synchronized asynchronously via events (Kafka).",
            mentalModel: "Think of a newspaper: journalists write articles, editors fact-check and compile stories in the writing room (Command side). The printing press prints 100,000 read-only paper copies distributed across kiosks everywhere for readers to quickly consume without disturbing the journalists (Query side).",
            whatItIs: "Solves the mismatch between complex domain models optimized for write integrity (normalized 3NF relational tables) vs read models optimized for UI screens (denormalized JSON documents).",
            whyItExists: "In systems where read-to-write ratios exceed 100:1, relational joins, locks, and complex indices on write tables degrade write performance.",
            codeDemo: {
              language: "java",
              code: "// 1. Command Side (Write Model - Spring Data JPA / PostgreSQL)\n@Service\n@Transactional\npublic class OrderCommandService {\n    public UUID createOrder(CreateOrderCommand cmd) {\n        Order order = new Order(cmd);\n        orderRepository.save(order);\n        eventPublisher.publish(new OrderCreatedEvent(order)); // Asynchronously notify query model\n        return order.getId();\n    }\n}\n\n// 2. Query Side (Read Model - Spring Data Elasticsearch)\n@Service\npublic class OrderQueryService {\n    private final OrderSearchRepository searchRepo;\n    public Page<OrderDocument> searchOrders(String query, Pageable pageable) {\n        return searchRepo.findBySearchTerm(query, pageable); // Blazing fast denormalized read!\n    }\n}\n\n// Event Consumer updating Read Model:\n@KafkaListener(topics = \"order-events\")\npublic void syncReadModel(OrderCreatedEvent event) {\n    searchRepo.save(new OrderDocument(event));\n}"
            },
            tradeoffs: "Eventual consistency: after a user saves an order, reading the search model 10ms later might not immediately show the new record until Kafka consumer processes the event.",
            theyMightAskNext: [
              {
                question: "How does Event Sourcing complement CQRS?",
                answer: "Event Sourcing replaces table state with an immutable log of events (`OrderCreated`, `ItemAdded`, `OrderPaid`). The current state of an entity is derived by replaying its events. CQRS query models project these events into materialized views."
              }
            ],
            usedInProduction: "Standard architecture for e-commerce search, banking account history, and high-frequency trading platforms.",
            relatedTopics: ["sb-kafka-spring-boot", "sb-outbox-pattern", "sb-jpa-projections"]
          }
        },
        {
          id: "sb-outbox-pattern",
          question: "What is the Transactional Outbox Pattern and how does it prevent dual-write data inconsistency?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Dual-Write problem happens when an app saves to a database and publishes to Kafka in the same flow: if one succeeds and the other fails, data is corrupted. The Outbox Pattern atomically inserts an event row into an `outbox` table in the SAME local database transaction as the business entity. A separate CDC tool (Debezium) or poller reads the outbox and publishes to Kafka with guaranteed delivery.",
            mentalModel: "Think of mailing an invoice: instead of driving to the post office yourself right after writing the bill (what if your car breaks down halfway?), you drop the stamped envelope into your company's physical 'Outgoing Mail Tray' on your desk (the Outbox table). The mail clerk picks up all envelopes every 15 minutes and guarantees delivery.",
            whatItIs: "Guarantees At-Least-Once event delivery without distributed 2PC transactions. Uses Change Data Capture (CDC via Debezium reading Postgres WAL) or a scheduled poller.",
            whyItExists: "Network crashes can occur right after `orderRepo.save()` and before `kafkaTemplate.send()`, leaving the database updated while downstream services never hear about it.",
            codeDemo: {
              language: "java",
              code: "@Entity\n@Table(name = \"outbox\")\npublic class OutboxMessage {\n    @Id private UUID id;\n    private String aggregateType; // 'Order'\n    private String aggregateId;\n    private String eventType;     // 'ORDER_CREATED'\n    @Column(columnDefinition = \"jsonb\")\n    private String payload;\n    private Instant createdAt;\n}\n\n// Transactional Service:\n@Service\npublic class OrderService {\n    @Transactional\n    public Order createOrder(OrderRequest req) {\n        Order order = orderRepo.save(new Order(req));\n        \n        // Atomically saved in SAME DB transaction:\n        OutboxMessage outbox = new OutboxMessage(\n            UUID.randomUUID(), \"Order\", order.getId().toString(),\n            \"ORDER_CREATED\", toJson(order), Instant.now()\n        );\n        outboxRepo.save(outbox); \n        \n        return order;\n    }\n}"
            },
            tradeoffs: "Consumers will receive duplicate messages if the publisher crashes right after emitting to Kafka before updating the outbox status. Consumers MUST be idempotent.",
            theyMightAskNext: [
              {
                question: "What is Debezium CDC and why is it preferred over scheduled DB polling?",
                answer: "Debezium reads the database transaction log directly (PostgreSQL Write-Ahead Log / MySQL Binlog). It has zero impact on table indexes, sub-millisecond event streaming, and eliminates polling database CPU overhead."
              }
            ],
            usedInProduction: "Standard architectural pattern at Uber, Airbnb, and Shopify for microservice event publishing.",
            relatedTopics: ["sb-kafka-spring-boot", "sb-distributed-transactions-saga", "sb-kafka-idempotent-consumer"]
          }
        }
      ]
    },
    {
      id: "messaging-async-events",
      title: "Messaging, Kafka & Event Architecture",
      questions: [
        {
          id: "sb-kafka-spring-boot",
          question: "How do you integrate Apache Kafka in Spring Boot with @KafkaListener, KafkaTemplate, and consumer offset commits?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Add `spring-kafka`. Inject `KafkaTemplate<String, Object>` to produce messages. Use `@KafkaListener(topics = \"orders\", groupId = \"order-group\")` to consume messages. Configure `AckMode.MANUAL_IMMEDIATE` to explicitly commit consumer offsets only after business processing succeeds.",
            mentalModel: "Think of an immutable conveyor belt: producers place numbered boxes on the belt. Consumers read boxes one by one. The consumer keeps a handheld counter (offset). If the consumer drops a box before stamping it approved, they rewind their counter to re-read that box.",
            whatItIs: "Spring for Apache Kafka provides auto-configured ProducerFactory, ConsumerFactory, ConcurrentKafkaListenerContainerFactory, and message serialization (JSON/Avro).",
            whyItExists: "Enables event-driven architecture with high-throughput (millions of msgs/sec), persistence, replayability, and consumer group partitioning.",
            codeDemo: {
              language: "java",
              code: "// 1. Producer\n@Service\npublic class OrderEventProducer {\n    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;\n\n    public void sendOrderCreated(OrderEvent event) {\n        // Partitioning key (orderId) ensures all events for same order go to same partition!\n        kafkaTemplate.send(\"order-events\", event.orderId().toString(), event);\n    }\n}\n\n// 2. Consumer with Manual Ack\n@Component\npublic class InventoryConsumer {\n    @KafkaListener(topics = \"order-events\", groupId = \"inventory-group\")\n    public void handleOrderEvent(\n            @Payload OrderEvent event,\n            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,\n            Acknowledgment ack) {\n        try {\n            inventoryService.reserve(event);\n            ack.acknowledge(); // Commit offset to broker only on success!\n        } catch (Exception ex) {\n            log.error(\"Processing failed for order: {}\", event.orderId(), ex);\n            throw ex; // Triggers Spring Kafka Error Handler / DLT\n        }\n    }\n}"
            },
            tradeoffs: "By default, Spring Kafka uses `AckMode.BATCH` (auto-commits when batch finishes). If a consumer crashes mid-batch, duplicate processing can occur on restart. Use manual acknowledgment for critical financial events.",
            theyMightAskNext: [
              {
                question: "What is consumer group rebalancing in Kafka?",
                answer: "When a consumer pod joins, crashes, or is evicted, Kafka rebalances partition assignments across the remaining active consumers in the group, briefly pausing consumption."
              }
            ],
            usedInProduction: "Backbone for real-time telemetry, order checkout events, and stream processing in 90% of enterprise microservices.",
            relatedTopics: ["sb-kafka-error-handling-dlt", "sb-kafka-idempotent-consumer", "sb-outbox-pattern"]
          }
        },
        {
          id: "sb-kafka-error-handling-dlt",
          question: "How do you handle Kafka consumer errors using Retries and Dead Letter Topics (DLT) in Spring Boot?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Configure `DefaultErrorHandler` with a `BackOff` policy and a `DeadLetterPublishingRecoverer`. Transient failures retry with exponential backoff; if all retries are exhausted, the message is automatically published to a Dead Letter Topic (e.g. `order-events.DLT`) so the partition isn't blocked.",
            mentalModel: "Think of an airport baggage scanner: if a bag gets stuck on the scanner, the belt backs up and tries to scan it 3 times (retry). If it still fails, a mechanical arm shoves the bag onto a side inspection lane (Dead Letter Topic) so the main conveyor belt never stops moving for the hundreds of bags behind it.",
            whatItIs: "Prevents the 'poison pill' problem: a corrupt JSON payload that permanently crashes a consumer listener in an infinite restart loop, blocking all subsequent messages on that Kafka partition.",
            whyItExists: "Ensures high partition throughput and zero data loss while routing poisonous messages to an isolated topic for manual inspection and replay.",
            codeDemo: {
              language: "java",
              code: "@Configuration\npublic class KafkaErrorConfig {\n\n    @Bean\n    public DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {\n        // Route exhausted failures to <topic>.DLT\n        var recoverer = new DeadLetterPublishingRecoverer(template);\n        \n        // 3 retries with 1 second delay between attempts\n        var backOff = new FixedBackOff(1000L, 3);\n        \n        var errorHandler = new DefaultErrorHandler(recoverer, backOff);\n        // Do not retry poison pill deserialization errors — send directly to DLT:\n        errorHandler.addNotRetryableExceptions(DeserializationException.class, IllegalArgumentException.class);\n        return errorHandler;\n    }\n}"
            },
            tradeoffs: "Routing messages to a DLT breaks strict message ordering: subsequent messages for the same customer will be processed while the failing message sits in the DLT.",
            theyMightAskNext: [
              {
                question: "What is @RetryableTopic in Spring Kafka?",
                answer: "A declarative annotation that creates non-blocking retry topics (e.g., `orders-retry-1000`, `orders-retry-2000`) and a DLT automatically without blocking partition consumers during backoff."
              }
            ],
            usedInProduction: "Standard pattern in every enterprise Kafka implementation. Ops dashboards monitor DLT topic lag to trigger PagerDuty alerts.",
            relatedTopics: ["sb-kafka-spring-boot", "sb-kafka-idempotent-consumer", "sb-retry-backoff-pattern"]
          }
        },
        {
          id: "sb-kafka-idempotent-consumer",
          question: "How do you guarantee Idempotent Message Consumption in Spring Boot Kafka consumers?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Kafka guarantees At-Least-Once delivery, so duplicate messages WILL occur during rebalances or network retries. Implement idempotency by: 1. Extracting a unique message/business ID, 2. Checking if it was already processed in a deduplication database/Redis table with a unique constraint, 3. Atomically inserting the ID before or within the transaction.",
            mentalModel: "Think of depositing a check via mobile banking: if you take a photo and upload it, but your phone battery dies before receiving the confirmation, you upload it again. The bank's system checks the unique check serial number; seeing it was already credited, it safely ignores the duplicate upload without crediting your account twice.",
            whatItIs: "An idempotent operation produces the exact same state whether executed once or 100 times: `f(f(x)) = f(x)`.",
            whyItExists: "Kafka network blips or consumer rebalancing trigger message re-deliveries. Without idempotency, duplicate events cause double-charging or duplicate order fulfillment.",
            codeDemo: {
              language: "java",
              code: "@Component\npublic class IdempotentPaymentConsumer {\n    private final ProcessedMessageRepo deduplicationRepo;\n    private final PaymentService paymentService;\n\n    @KafkaListener(topics = \"payment-events\")\n    @Transactional\n    public void handlePayment(PaymentEvent event, Acknowledgment ack) {\n        // Check unique message ID (Idempotency Key)\n        if (deduplicationRepo.existsById(event.messageId())) {\n            log.info(\"Skipping duplicate event: {}\", event.messageId());\n            ack.acknowledge();\n            return;\n        }\n\n        paymentService.executePayment(event);\n        deduplicationRepo.save(new ProcessedMessage(event.messageId(), Instant.now()));\n        ack.acknowledge();\n    }\n}"
            },
            tradeoffs: "In-memory caches (ConcurrentHashMap) for deduplication are useless because pods restart and traffic is distributed across instances. Deduplication tables must be in a shared database or Redis with TTL.",
            theyMightAskNext: [
              {
                question: "What is Kafka Producer Idempotence (enable.idempotence=true)?",
                answer: "It prevents duplicate messages at the BROKER layer caused by producer network retries by attaching producer IDs (PID) and sequence numbers to messages. However, consumer-side idempotency is still required."
              }
            ],
            usedInProduction: "Mandatory in every fintech and payment processing event stream to guarantee financial ledger integrity.",
            relatedTopics: ["sb-kafka-spring-boot", "sb-outbox-pattern"]
          }
        },
        {
          id: "sb-spring-events-applicationlistener",
          question: "How do Spring Application Events work and how does @TransactionalEventListener solve race conditions?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Publish events via `ApplicationEventPublisher.publishEvent()`. Listeners use `@EventListener`. `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` ensures the listener executes ONLY after the database transaction has successfully committed, preventing listeners from reading uncommitted data or acting on rolled-back transactions.",
            mentalModel: "Think of an engagement party: `@EventListener` is sending wedding invitations the moment you buy the ring. `@TransactionalEventListener(AFTER_COMMIT)` is sending the invitations only after the proposal is accepted and the marriage certificate is signed at city hall.",
            whatItIs: "Spring's in-process event bus pattern. It decouples domain actions (e.g. order placement) from side-effects (e.g. sending confirmation email, publishing Kafka message).",
            whyItExists: "Standard `@EventListener` runs synchronously inside the active transaction. If the listener triggers an email and the database transaction later rolls back, the user receives an email for an order that does not exist!",
            codeDemo: {
              language: "java",
              code: "public record OrderPlacedEvent(UUID orderId, String customerEmail) {}\n\n@Service\npublic class OrderService {\n    private final ApplicationEventPublisher eventPublisher;\n\n    @Transactional\n    public void placeOrder(Order order) {\n        orderRepo.save(order);\n        // Event published, but listener waits for commit:\n        eventPublisher.publishEvent(new OrderPlacedEvent(order.getId(), order.getEmail()));\n    }\n}\n\n@Component\npublic class NotificationListener {\n    // Executes ONLY if and when placeOrder() commits successfully!\n    @Async\n    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)\n    public void handleOrderPlaced(OrderPlacedEvent event) {\n        emailService.sendConfirmation(event.customerEmail(), event.orderId());\n    }\n}"
            },
            tradeoffs: "Inside `TransactionPhase.AFTER_COMMIT`, the original database transaction has ALREADY committed and closed. If your listener needs to write to the database, it MUST open a new transaction with `@Transactional(propagation = Propagation.REQUIRES_NEW)`.",
            theyMightAskNext: [
              {
                question: "What happens if an exception is thrown inside a synchronous @EventListener?",
                answer: "Because it runs in the same thread and call stack, it propagates up and triggers a rollback of the enclosing transaction."
              }
            ],
            usedInProduction: "Standard pattern in domain-driven design (DDD) aggregate roots to dispatch asynchronous notifications and analytics without contaminating domain models.",
            relatedTopics: ["sb-transactional-1", "sb-async-task-executor", "sb-circular-dependencies"]
          }
        },
        {
          id: "sb-rabbitmq-vs-kafka",
          question: "When should you choose RabbitMQ vs Apache Kafka in a Spring Boot microservice architecture?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Use RabbitMQ for traditional message queuing, complex routing (topic/direct/fanout exchanges, headers), priority queues, and transient task distribution where messages are deleted upon acknowledgment. Use Kafka for high-throughput append-only event streaming, event replayability, distributed logs, and analytical stream processing.",
            mentalModel: "RabbitMQ is a postal courier: it picks up a package, sorts it through sophisticated routing hubs (exchanges), delivers it to the mailbox, and deletes its tracking record once received. Kafka is a public library bookshelf: every book is placed in chronological order, permanently preserved, and multiple readers can read at their own independent pace.",
            whatItIs: "RabbitMQ is a smart broker / dumb consumer (AMQP broker tracks message state). Kafka is a dumb broker / smart consumer (broker stores immutable partitions; consumers track their own offsets).",
            whyItExists: "Choosing the wrong broker causes severe operational headaches: using RabbitMQ for millions of events per second exhausts RAM; using Kafka for simple task queues requires managing partition offsets and consumer group rebalances.",
            comparisonTable: {
              title: "RabbitMQ vs Apache Kafka in Spring Boot Microservices",
              headers: ["Architecture Dimension", "RabbitMQ (AMQP)", "Apache Kafka"],
              rows: [
                ["Core Architectural Model", "Smart Broker / Dumb Consumer (broker tracks delivery and ACK state)", "Dumb Broker / Smart Consumer (broker stores immutable log; consumer tracks offset)"],
                ["Message Retention & Lifecycle", "Transient: messages are deleted immediately after consumer acknowledgment", "Persistent: messages stored in partitioned commit log for retention period (days/weeks)"],
                ["Message Replayability", "No (cannot replay historical acknowledged messages without separate plugins)", "Yes: consumers can rewind offsets (`seek()`) to replay events from any point in time"],
                ["Throughput & Latency", "Moderate throughput (10k–50k msgs/sec); microsecond-level latency", "Extremely high throughput (millions msgs/sec via sequential I/O & zero-copy)"],
                ["Routing Flexibility", "Extremely rich: Direct, Fanout, Topic, and Headers exchanges", "Simple partition key routing: hash(key) % partitions"],
                ["Priority Queues", "Supported natively (messages can be assigned 1–10 priority)", "Not supported (messages strictly ordered FIFO per partition)"],
                ["Ideal Spring Boot Use Case", "Asynchronous task workers, background jobs, order notifications, RPC commands", "Event streaming, event sourcing, transaction outbox, metric pipelines, CQRS sync"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// RabbitMQ: Complex exchange routing in Spring Boot\n@Bean\npublic TopicExchange orderExchange() {\n    return new TopicExchange(\"orders.exchange\");\n}\n@Bean\npublic Binding binding(Queue queue, TopicExchange exchange) {\n    return BindingBuilder.bind(queue).to(exchange).with(\"orders.eu.*.created\");\n}\n\n// Kafka: High-throughput partitioned event stream\n@KafkaListener(topics = \"telemetry-stream\", concurrency = \"3\")\npublic void consumeStream(ConsumerRecord<String, String> record) { ... }"
            },
            tradeoffs: "RabbitMQ messages are deleted once acknowledged (no message replay). Kafka allows rewinding consumer offsets to replay the last 7 days of historical events, invaluable for re-indexing or disaster recovery.",
            theyMightAskNext: [
              {
                question: "Can RabbitMQ do message replay?",
                answer: "RabbitMQ 3.8+ introduced RabbitMQ Streams (similar to Kafka's append-only log model), but Kafka remains the industry standard for high-throughput event streaming."
              }
            ],
            usedInProduction: "RabbitMQ for background worker task queues (image resizing, email rendering); Kafka for financial transactions, audit logs, and analytics event pipelines.",
            relatedTopics: ["sb-kafka-spring-boot", "sb-outbox-pattern"]
          }
        }
      ]
    }
  ]
};
