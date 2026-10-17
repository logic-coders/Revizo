import { Category } from "@/types";

export const springBootWebCategory: Category = {
  id: "sb-web",
  title: "Web & RESTful APIs",
  subTopics: [
    {
      id: "rest-controllers-mvc",
      title: "REST Controllers & MVC Architecture",
      questions: [
        {
          id: "sb-rest-1",
          question: "How do you create REST APIs in Spring Boot?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-09-14",
          answer: {
            quickAnswer: "Annotate a class with @RestController, define handler methods with @GetMapping/@PostMapping etc., and Spring auto-serializes return values to JSON via Jackson.",
            mentalModel: "A REST controller is like a restaurant host. The host (@RestController) receives guests (HTTP requests) at specific doors (@GetMapping('/users')), directs them to the right table (handler method), and sends them home with their order (JSON response). Jackson is the kitchen that plates everything into JSON.",
            whatItIs: "@RestController combines @Controller + @ResponseBody — every method's return value is automatically serialized to JSON (via Jackson) and written to the HTTP response body. Mapping annotations — @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping — bind HTTP methods to handler methods. Parameters come from @PathVariable, @RequestParam, @RequestBody, and @RequestHeader. ResponseEntity<T> gives full control over status code, headers, and body.",
            whyItExists: "Without @RestController, building a REST API in Spring MVC required @Controller + @ResponseBody on every method + manual content negotiation. Spring Boot simplified this to a single annotation, added Jackson auto-configuration, and provided embedded Tomcat — reducing a REST API from a multi-file, multi-config undertaking to a single class.",
            codeDemo: {
              language: "java",
              code: "@RestController\n@RequestMapping(\"/api/v1/users\")\npublic class UserController {\n    private final UserService service;\n\n    public UserController(UserService service) {\n        this.service = service;\n    }\n\n    @GetMapping\n    public ResponseEntity<List<UserDTO>> getAll(\n            @RequestParam(defaultValue = \"0\") int page,\n            @RequestParam(defaultValue = \"20\") int size) {\n        return ResponseEntity.ok(service.findAll(page, size));\n    }\n\n    @GetMapping(\"/{id}\")\n    public ResponseEntity<UserDTO> getById(@PathVariable Long id) {\n        return service.findById(id)\n            .map(ResponseEntity::ok)\n            .orElse(ResponseEntity.notFound().build());\n    }\n\n    @PostMapping\n    public ResponseEntity<UserDTO> create(\n            @Valid @RequestBody CreateUserRequest req) {\n        UserDTO created = service.create(req);\n        URI loc = URI.create(\"/api/v1/users/\" + created.id());\n        return ResponseEntity.created(loc).body(created);\n    }\n\n    @DeleteMapping(\"/{id}\")\n    @ResponseStatus(HttpStatus.NO_CONTENT)\n    public void delete(@PathVariable Long id) {\n        service.delete(id);\n    }\n}",
              explanation: "ResponseEntity gives full control over HTTP status codes and headers. Use @Valid with Bean Validation for automatic input validation."
            },
            tradeoffs: "Don't expose JPA entities directly from controllers — use DTOs to control the API surface and prevent lazy-loading exceptions (LazyInitializationException). @RestController returns JSON by default; for content negotiation (XML, CSV), configure HttpMessageConverters. PUT vs PATCH semantics matter: PUT replaces the entire resource, PATCH updates specific fields — mixing them up is a common API design mistake. Versioning (/v1/) should be decided early; changing it later breaks clients.",
            followUpQuestions: [
              {
                question: "What's the difference between @Controller and @RestController?",
                answer: "@Controller returns view names (for SSR/Thymeleaf). @RestController returns data (serialized to JSON/XML via Jackson). @RestController = @Controller + @ResponseBody on every method. Use @Controller for server-rendered HTML pages, @RestController for APIs."
              },
              {
                question: "How do you handle exceptions globally in REST APIs?",
                answer: "Use @ControllerAdvice with @ExceptionHandler methods. Create a GlobalExceptionHandler class annotated with @RestControllerAdvice. Each @ExceptionHandler method catches a specific exception type and returns a standardized error response (ErrorDTO with status, message, timestamp). This centralizes error handling instead of try-catch in every controller."
              }
            ],
            usedInProduction: "At Stripe, REST controllers with ResponseEntity and @ControllerAdvice provide the idempotent, versioned API layer that processes billions of payment requests — each endpoint returns precise HTTP status codes (201 Created, 402 Payment Required, 429 Too Many Requests) that client SDKs rely on.",
            relatedTopics: [
              "Dependency Injection",
              "@ControllerAdvice",
              "Spring Data JPA",
              "Bean Validation"
            ]
          }
        },
        {
          id: "sb-controller-vs-restcontroller",
          question: "What happens under the hood when @RestController executes, and how does HttpMessageConverter work?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "@RestController is meta-annotated with @Controller and @ResponseBody. When a handler returns an object, RequestResponseBodyMethodProcessor invokes the configured HttpMessageConverter list (e.g. MappingJackson2HttpMessageConverter) to serialize the Java object directly to HTTP response bytes, bypassing ViewResolvers.",
            mentalModel: "Think of @Controller as a theatre director preparing an entire stage set (HTML view). Think of @RestController as an API dispenser dropping an exact JSON package directly into the delivery chute without touching the stage.",
            whatItIs: "DispatcherServlet routes incoming requests to HandlerMethod. Because the class is annotated with @ResponseBody, Spring knows the return value is not a view name. It inspects the HTTP 'Accept' header and selects the first HttpMessageConverter that can write the Java type in the requested MediaType (e.g., application/json).",
            whyItExists: "Enables building pure REST microservices and Single Page Application (SPA) backends without JSP/Thymeleaf rendering overhead.",
            comparisonTable: {
              title: "@Controller vs @RestController Architectural Comparison",
              headers: ["Dimension", "@Controller", "@RestController"],
              rows: [
                ["Meta-Annotation", "`@Component`", "`@Controller` + `@ResponseBody`"],
                ["Default Return Value", "View name template (`\"index\"` -> `index.html`)", "Domain data serialized to JSON / XML"],
                ["Processing Pipeline", "ViewResolver -> Thymeleaf / JSP template rendering", "RequestResponseBodyMethodProcessor -> HttpMessageConverter (Jackson)"],
                ["HTTP Response Body", "HTML web page content", "Raw serialized bytes (JSON, XML, Protobuf)"],
                ["Primary Use Case", "Traditional server-side rendered (SSR) web portals", "Stateless REST microservices, mobile backends, SPA APIs"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "@Target(ElementType.TYPE)\n@Retention(RetentionPolicy.RUNTIME)\n@Documented\n@Controller\n@ResponseBody // Tells Spring to serialize return value directly\npublic @interface RestController {}\n\n// Customizing Jackson Object Mapper converter:\n@Configuration\npublic class WebJacksonConfig {\n    @Bean\n    public ObjectMapper objectMapper() {\n        return JsonMapper.builder()\n            .findAndAddModules()\n            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)\n            .build();\n    }\n}"
            },
            tradeoffs: "If an endpoint returns a String, `StringHttpMessageConverter` runs instead of Jackson, outputting `text/plain`. If the client expects JSON, this causes parsing errors on frontend clients.",
            theyMightAskNext: [
              {
                question: "Can @RestController still return a file or binary image?",
                answer: "Yes, by returning `ResponseEntity<byte[]>` or `ResponseEntity<Resource>` with `HttpHeaders.CONTENT_TYPE` set to `image/png` or `application/octet-stream`."
              }
            ],
            usedInProduction: "Standard controller base in 99% of Spring Boot cloud APIs; custom HttpMessageConverters are configured to enforce ISO-8601 UTC date formats and null-field exclusion across all responses.",
            relatedTopics: ["sb-rest-1", "sb-content-negotiation", "sb-problem-details-rfc7807"]
          }
        },
        {
          id: "sb-request-annotations",
          question: "What are the exact differences between @PathVariable, @RequestParam, @RequestBody, and @RequestHeader?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "@PathVariable extracts URI template segments (/orders/{id}). @RequestParam extracts URL query parameters or form fields (?status=ACTIVE). @RequestBody deserializes the HTTP request payload (JSON/XML). @RequestHeader extracts HTTP request headers (Authorization, X-Tenant-ID).",
            mentalModel: "Think of postal delivery: @PathVariable is the house number in the street address. @RequestParam is the delivery instructions ('ring bell twice'). @RequestBody is the package contents inside the cardboard box. @RequestHeader is the barcode and postage stamp on the outside.",
            whatItIs: "Spring MVC annotations that bind incoming HTTP elements to method parameters. By default, `@PathVariable`, `@RequestParam`, and `@RequestBody` are required (`required = true`); missing parameters cause 400 Bad Request.",
            whyItExists: "Provides type-safe, declarative argument resolution without manually parsing HttpServletRequest strings.",
            comparisonTable: {
              title: "@PathVariable vs @RequestParam vs @RequestBody vs @RequestHeader",
              headers: ["Annotation", "HTTP Request Source", "Example URL / Request", "Required Default", "Ideal Use Case"],
              rows: [
                ["@PathVariable", "URI path segments (`/orders/{id}`)", "`GET /orders/1024`", "`required = true`", "Identifying a specific resource entity by ID or slug"],
                ["@RequestParam", "Query string parameters or form data", "`GET /orders?status=PENDING&page=2`", "`required = true`", "Filtering, sorting, pagination, and optional query flags"],
                ["@RequestBody", "HTTP request payload (JSON / XML)", "`POST /orders` + body `{\"item\":\"book\"}`", "`required = true`", "Creating or updating complex structured objects (POST/PUT/PATCH)"],
                ["@RequestHeader", "HTTP request headers", "`Authorization: Bearer xyz`, `X-Tenant-Id: 5`", "`required = true`", "Security tokens, correlation IDs, tenant contexts, API versioning"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "@GetMapping(\"/accounts/{accountId}/transactions\")\npublic ResponseEntity<List<TxDTO>> getTransactions(\n    @PathVariable(\"accountId\") UUID accountId,\n    @RequestParam(value = \"status\", defaultValue = \"COMPLETED\") String status,\n    @RequestParam(value = \"page\", defaultValue = \"0\") int page,\n    @RequestHeader(\"X-Correlation-Id\") String correlationId,\n    @CookieValue(value = \"session_id\", required = false) String sessionId\n) {\n    // Type conversion happens automatically (e.g. String -> UUID, String -> int)\n    return ResponseEntity.ok(txService.get(accountId, status, page));\n}"
            },
            tradeoffs: "Avoid passing sensitive data (passwords, tokens, PII) in @RequestParam or @PathVariable, as URLs are logged in web server logs, proxies, and browser history.",
            theyMightAskNext: [
              {
                question: "What exception is thrown when a required @RequestParam or @RequestBody is missing?",
                answer: "MissingServletRequestParameterException for missing query params, and HttpMessageNotReadableException for missing or malformed JSON body. Both translate to HTTP 400 Bad Request."
              }
            ],
            usedInProduction: "Universal across all REST APIs; `@RequestHeader` is heavily used in distributed tracing and multi-tenant systems to propagate correlation and tenant IDs.",
            relatedTopics: ["sb-rest-1", "sb-bean-validation", "sb-global-exception-handling"]
          }
        },
        {
          id: "sb-content-negotiation",
          question: "How does Content Negotiation work in Spring Boot and how do you support both JSON and XML?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Content Negotiation allows clients to request different response representations using the HTTP 'Accept' header. To support XML alongside JSON, add `jackson-dataformat-xml` to your pom.xml; Spring Boot auto-configures both converters seamlessly.",
            mentalModel: "Like a restaurant menu offering English and Spanish: the customer shows their language preference on their ID card (Accept: application/xml), and the kitchen prints the receipt in that language.",
            whatItIs: "ContentNegotiationManager inspects: 1. URL path extension (deprecated in modern Spring), 2. Query parameter (?format=xml, if enabled), 3. HTTP 'Accept' header (standard). It delegates to Jackson's XML or JSON converter based on client preference.",
            whyItExists: "Enables legacy systems (expecting XML/SOAP) and modern web frontends (expecting JSON) to consume the exact same Spring Boot REST endpoints.",
            codeDemo: {
              language: "xml",
              code: "<!-- Add to pom.xml for XML support -->\n<dependency>\n    <groupId>com.fasterxml.jackson.dataformat</groupId>\n    <artifactId>jackson-dataformat-xml</artifactId>\n</dependency>\n\n// Java Controller - supports both automatically:\n@GetMapping(value = \"/users/{id}\", produces = {\n    MediaType.APPLICATION_JSON_VALUE,\n    MediaType.APPLICATION_XML_VALUE\n})\npublic UserDto getUser(@PathVariable Long id) {\n    return userService.findById(id);\n}\n\n# Client Request 1: GET /users/1 with Accept: application/json -> Returns JSON\n# Client Request 2: GET /users/1 with Accept: application/xml  -> Returns XML"
            },
            tradeoffs: "When `jackson-dataformat-xml` is on the classpath, Spring MVC may choose XML as default if clients send `Accept: */*`. You must configure `defaultContentType(MediaType.APPLICATION_JSON)` to prioritize JSON.",
            theyMightAskNext: [
              {
                question: "What HTTP status code is returned if the server cannot produce the requested Accept format?",
                answer: "HTTP 406 Not Acceptable (HttpMediaTypeNotAcceptableException)."
              }
            ],
            usedInProduction: "Critical in enterprise banking systems that integrate with legacy XML core banking engines and modern mobile apps via the same Spring Boot gateways.",
            relatedTopics: ["sb-rest-1", "sb-controller-vs-restcontroller"]
          }
        },
        {
          id: "sb-embedded-containers",
          question: "How do embedded servlet containers work in Spring Boot, and how do you switch from Tomcat to Undertow or Jetty?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring Boot inverts traditional deployment: instead of packaging a WAR and deploying it to an external Tomcat, the application JAR starts an embedded Tomcat/Undertow server programmatically via `ServletWebServerFactory`.",
            mentalModel: "Traditional deployment is like buying a video game cartridge and taking it to an arcade hall with big stationary machines. Embedded deployment is a Nintendo Switch: the game and the console are packaged together in your pocket.",
            whatItIs: "At startup, `ServletWebServerApplicationContext` creates and starts an instance of `WebServer` (Tomcat, Jetty, or Undertow). To switch, exclude `spring-boot-starter-tomcat` from `spring-boot-starter-web` and add `spring-boot-starter-undertow`.",
            whyItExists: "Eliminates 'works on my machine' environmental discrepancies between external application servers, simplifies CI/CD Docker packaging, and allows fast local debugging.",
            codeDemo: {
              language: "xml",
              code: "<!-- pom.xml: Replace Tomcat with high-performance Undertow -->\n<dependency>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-web</artifactId>\n    <exclusions>\n        <exclusion>\n            <groupId>org.springframework.boot</groupId>\n            <artifactId>spring-boot-starter-tomcat</artifactId>\n        </exclusion>\n    </exclusions>\n</dependency>\n\n<dependency>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-undertow</artifactId>\n</dependency>\n\n# application.yml: Configure Undertow buffer & worker threads\n# server.undertow.threads.worker=128\n# server.undertow.buffer-size=16384"
            },
            tradeoffs: "Undertow has lower memory footprint and higher concurrency throughput than Tomcat in benchmark loads, but Tomcat has broader ecosystem support, mature JMX monitoring, and the largest community troubleshooting presence.",
            theyMightAskNext: [
              {
                question: "How do you customize embedded Tomcat programmatically?",
                answer: "Implement a `WebServerFactoryCustomizer<TomcatServletWebServerFactory>` bean to configure max connections, acceptor threads, or SSL ciphers in Java."
              }
            ],
            usedInProduction: "High-throughput real-time bidding and ad-tech microservices frequently swap Tomcat for Undertow to achieve lower latency and reduced thread-context overhead.",
            relatedTopics: ["sb-auto-2", "sb-virtual-threads-boot32"]
          }
        },
        {
          id: "sb-cors-configuration",
          question: "How do you configure Cross-Origin Resource Sharing (CORS) in Spring Boot, and why do pre-flight OPTIONS requests fail?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Configure CORS via: 1. Global `WebMvcConfigurer.addCorsMappings()`, 2. `@CrossOrigin` annotation on controllers/methods, or 3. `CorsFilter` bean / `SecurityFilterChain.cors()`. Pre-flight OPTIONS fails when Spring Security intercepts it before the CORS filter executes.",
            mentalModel: "Think of an international customs border: before high-value goods (POST/PUT/DELETE with headers) are shipped, a courier sends an advance manifest (OPTIONS request). If customs blocks the manifest with 401/403, the cargo never leaves port.",
            whatItIs: "CORS is a browser security mechanism that restricts HTTP requests made from a different domain/port. Browsers send an automatic pre-flight HTTP `OPTIONS` request. In applications using Spring Security, CORS MUST be configured inside Spring Security using `.cors(Customizer.withDefaults())` so the `CorsFilter` runs before security authentication filters.",
            whyItExists: "Protects users against Cross-Site Scripting (XSS) and unauthorized requests from malicious third-party origins in web browsers.",
            codeDemo: {
              language: "java",
              code: "@Configuration\npublic class CorsConfig {\n    // Recommended: Global CorsConfigurationSource for Spring Security\n    @Bean\n    public CorsConfigurationSource corsConfigurationSource() {\n        CorsConfiguration config = new CorsConfiguration();\n        config.setAllowedOrigins(List.of(\"https://app.revizo.com\"));\n        config.setAllowedMethods(List.of(\"GET\", \"POST\", \"PUT\", \"DELETE\", \"OPTIONS\"));\n        config.setAllowedHeaders(List.of(\"Authorization\", \"Content-Type\", \"X-Requested-With\"));\n        config.setAllowCredentials(true);\n        config.setMaxAge(3600L); // Cache preflight for 1 hour\n\n        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();\n        source.registerCorsConfiguration(\"/api/**\", config);\n        return source;\n    }\n}"
            },
            tradeoffs: "Setting `allowedOrigins(\"*\")` while `allowCredentials(true)` is rejected by modern browsers as an invalid and insecure security configuration.",
            theyMightAskNext: [
              {
                question: "Why does @CrossOrigin not work when Spring Security is present?",
                answer: "Because Spring Security filter chains execute before Spring MVC handlers. If an unauthenticated OPTIONS pre-flight hits Spring Security, it gets blocked with a 401 or 403 before reaching the controller's @CrossOrigin annotation."
              }
            ],
            usedInProduction: "Standard in all decoupled frontend-backend architectures (React/Vue/Next.js hosted on a CDN connecting to Spring Boot APIs).",
            relatedTopics: ["sb-security-architecture", "sb-security-filter-chain-dsl"]
          }
        }
      ]
    },
    {
      id: "validation-exception-handling",
      title: "Validation & Error Handling",
      questions: [
        {
          id: "sb-global-exception-handling",
          question: "How do you implement global exception handling in Spring Boot using @RestControllerAdvice and @ExceptionHandler?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Create a class annotated with @RestControllerAdvice containing methods annotated with @ExceptionHandler. Each handler catches specific exception classes and returns a structured ErrorDTO with appropriate HTTP status codes.",
            mentalModel: "Think of an emergency hospital triage center: instead of doctors dealing with administration, all incoming accidents are routed to a centralized specialist team that evaluates the injury, applies standard protocol, and issues a standardized medical report.",
            whatItIs: "@RestControllerAdvice is a specialization of @ControllerAdvice that combines @ControllerAdvice and @ResponseBody. It intercepts exceptions thrown by any @RequestMapping handler in the application using Spring AOP, ensuring consistent API responses.",
            whyItExists: "Eliminates repetitive try-catch blocks in controllers, prevents leaking raw Java stack traces and internal database schemas to clients, and ensures uniform JSON error contracts.",
            codeDemo: {
              language: "java",
              code: "public record ApiError(\n    Instant timestamp,\n    int status,\n    String error,\n    String message,\n    String path\n) {}\n\n@RestControllerAdvice\npublic class GlobalExceptionHandler {\n\n    @ExceptionHandler(ResourceNotFoundException.class)\n    public ResponseEntity<ApiError> handleNotFound(\n            ResourceNotFoundException ex, HttpServletRequest request) {\n        ApiError error = new ApiError(\n            Instant.now(),\n            HttpStatus.NOT_FOUND.value(),\n            \"Not Found\",\n            ex.getMessage(),\n            request.getRequestURI()\n        );\n        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);\n    }\n\n    @ExceptionHandler(Exception.class)\n    public ResponseEntity<ApiError> handleGeneralError(\n            Exception ex, HttpServletRequest request) {\n        // Log stack trace internally, return sanitized message to client\n        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)\n            .body(new ApiError(Instant.now(), 500, \"Internal Error\", \"An unexpected error occurred\", request.getRequestURI()));\n    }\n}"
            },
            tradeoffs: "If multiple @ExceptionHandler methods match an exception hierarchy (e.g. `FileNotFoundException` vs `IOException`), Spring selects the most specific exception match.",
            theyMightAskNext: [
              {
                question: "Can @RestControllerAdvice handle exceptions thrown by Servlet Filters or Interceptors?",
                answer: "No. Servlet Filters run before DispatcherServlet, so filter exceptions do not reach @ControllerAdvice. To handle filter exceptions, catch them inside the filter and forward to a custom ErrorController or write to HttpServletResponse directly."
              }
            ],
            usedInProduction: "Mandatory in every enterprise API to satisfy security compliance standards (e.g., OWASP top 10 preventing information disclosure through stack traces).",
            relatedTopics: ["sb-rest-1", "sb-bean-validation", "sb-problem-details-rfc7807"]
          }
        },
        {
          id: "sb-bean-validation",
          question: "How does Jakarta Bean Validation work in Spring Boot, and how do you handle MethodArgumentNotValidException?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Add `spring-boot-starter-validation`, annotate DTO fields with validation constraints (@NotNull, @Size, @Email, @Min), and add `@Valid` to the controller `@RequestBody` parameter. Validation failures throw `MethodArgumentNotValidException`, which is caught in @RestControllerAdvice to return field-specific error maps.",
            mentalModel: "Like an automated passport control scanner: if the passport expiration date or photo dimensions fail required standards, the gate displays exact reasons ('photo too dark', 'document expired') without wasting an officer's time.",
            whatItIs: "Based on Hibernate Validator (JSR-380 / Jakarta Validation specification). `@Valid` is standard Jakarta EE; `@Validated` is a Spring-specific annotation that supports validation groups and method-level validation on `@Service` classes.",
            whyItExists: "Enforces input integrity at the presentation boundary before corrupt data enters domain services or databases.",
            codeDemo: {
              language: "java",
              code: "public record CreateUserRequest(\n    @NotBlank(message = \"Username is required\")\n    @Size(min = 3, max = 20, message = \"Username must be 3-20 characters\")\n    String username,\n\n    @NotBlank(message = \"Email is required\")\n    @Email(message = \"Invalid email format\")\n    String email,\n\n    @Min(value = 18, message = \"Must be at least 18 years old\")\n    int age\n) {}\n\n// Controller:\n@PostMapping(\"/users\")\npublic ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest req) { ... }\n\n// In @RestControllerAdvice:\n@ExceptionHandler(MethodArgumentNotValidException.class)\npublic ResponseEntity<Map<String, String>> handleValidationExceptions(\n        MethodArgumentNotValidException ex) {\n    Map<String, String> errors = new HashMap<>();\n    ex.getBindingResult().getFieldErrors().forEach(error -> \n        errors.put(error.getField(), error.getDefaultMessage()));\n    return ResponseEntity.badRequest().body(errors);\n}"
            },
            tradeoffs: "In Spring Boot 2.3+, `spring-boot-starter-validation` was removed from `spring-boot-starter-web`. It must be explicitly included in your build configuration.",
            theyMightAskNext: [
              {
                question: "What is the difference between @Valid and @Validated?",
                answer: "@Valid is standard Jakarta EE and supports cascading nested object validation. @Validated is a Spring annotation that supports validation groups (e.g. validating different fields on Create vs Update) and service-layer method validation."
              }
            ],
            usedInProduction: "Standard across fintech onboarding, payment checkout, and authentication endpoints to reject malformed inputs immediately with HTTP 400.",
            relatedTopics: ["sb-rest-1", "sb-custom-validator", "sb-global-exception-handling"]
          }
        },
        {
          id: "sb-problem-details-rfc7807",
          question: "What is the RFC 7807 Problem Details specification and how is it implemented in Spring Boot 3?",
          difficulty: "Advanced",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "RFC 7807 standardizes HTTP error payloads (type, title, status, detail, instance). Spring Boot 3 / Spring Framework 6 introduces built-in `ProblemDetail` class and `ResponseEntityExceptionHandler`, activated globally via `spring.mvc.problemdetails.enabled=true`.",
            mentalModel: "Before RFC 7807, every tech company invented their own JSON error format ({'err': 'msg'} vs {'error_code': 400, 'reason': '...'} vs {'errors': []}). RFC 7807 is the standard international plug adapter that makes all error formats universally understood by any API client.",
            whatItIs: "A standardized schema with media type `application/problem+json`. Spring 6 provides `ProblemDetail.forStatusAndDetail(status, detail)` and allows adding custom key-value metadata via `.setProperty(\"invalidParams\", ...)`.",
            whyItExists: "Enables client SDKs, API gateways, and web browsers to parse errors consistently across different microservices written in different languages.",
            codeDemo: {
              language: "java",
              code: "# application.properties - Enable RFC 7807 globally\nspring.mvc.problemdetails.enabled=true\n\n// Custom ProblemDetail in @RestControllerAdvice\n@ExceptionHandler(OrderNotFoundException.class)\npublic ProblemDetail handleOrderNotFound(OrderNotFoundException ex) {\n    ProblemDetail problem = ProblemDetail.forStatusAndDetail(\n        HttpStatus.NOT_FOUND, ex.getMessage());\n    problem.setTitle(\"Order Not Found\");\n    problem.setType(URI.create(\"https://api.revizo.com/errors/order-not-found\"));\n    problem.setProperty(\"orderId\", ex.getOrderId());\n    problem.setProperty(\"timestamp\", Instant.now());\n    return problem;\n}"
            },
            tradeoffs: "Enabling problem details globally changes the error structure of all built-in Spring Boot errors (e.g., 404, 405), which can break legacy frontend applications that expect the old default Spring error JSON.",
            theyMightAskNext: [
              {
                question: "What class should you extend for RFC 7807 global exception handling in Spring Boot 3?",
                answer: "Extend `ResponseEntityExceptionHandler` in your `@RestControllerAdvice`. It provides over 15 pre-built hooks for Spring MVC exceptions that automatically return ProblemDetail."
              }
            ],
            usedInProduction: "Required standard in modern OpenAPI 3.0 / Swagger specifications and REST API governance in Fortune 500 microservice ecosystems.",
            relatedTopics: ["sb-global-exception-handling", "sb-bean-validation"]
          }
        },
        {
          id: "sb-custom-validator",
          question: "How do you create a custom Constraint Annotation and ConstraintValidator in Spring Boot?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "1. Create an annotation marked with `@Constraint(validatedBy = YourValidator.class)`. 2. Define message(), groups(), and payload() attributes. 3. Implement `ConstraintValidator<YourAnnotation, TargetType>` with the `isValid()` method.",
            mentalModel: "Like programming a customized breathalyzer test: the annotation is the mouthpiece with legal labels, and the validator class is the sensor chip inside that measures whether blood alcohol is below 0.05.",
            whatItIs: "Custom Bean Validation allows complex business-rule validations (e.g. validating valid IBANs, phone numbers with country codes, or checking if a username is already taken).",
            whyItExists: "Built-in annotations (@NotNull, @Pattern) cannot handle multi-field cross-validation or Spring bean dependency injection (e.g. database lookups).",
            codeDemo: {
              language: "java",
              code: "@Target({ElementType.FIELD})\n@Retention(RetentionPolicy.RUNTIME)\n@Constraint(validatedBy = PhoneNumberValidator.class)\npublic @interface ValidPhoneNumber {\n    String message() default \"Invalid phone number format\";\n    Class<?>[] groups() default {};\n    Class<? extends Payload>[] payload() default {};\n}\n\n// Validator class (Spring auto-wires dependencies here!)\npublic class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {\n    @Override\n    public boolean isValid(String value, ConstraintValidatorContext context) {\n        if (value == null) return false;\n        return value.matches(\"^\\\\+[1-9]\\\\d{1,14}$\"); // E.164 international format\n    }\n}"
            },
            tradeoffs: "Avoid injecting heavy database repositories into `ConstraintValidator` if high write throughput is needed, as validation runs on every request and can cause database connection contention.",
            theyMightAskNext: [
              {
                question: "Can a ConstraintValidator perform class-level cross-field validation?",
                answer: "Yes, by targeting `ElementType.TYPE` on the annotation, the validator receives the entire DTO instance, allowing cross-field comparisons (e.g., verifying `startDate` is before `endDate`)."
              }
            ],
            usedInProduction: "Widely used to validate complex domain formats such as credit card numbers (Luhn algorithm), tax IDs (EIN/SSN), and promo code eligibility.",
            relatedTopics: ["sb-bean-validation", "sb-global-exception-handling"]
          }
        },
        {
          id: "sb-response-entity-status",
          question: "What is the difference between ResponseEntity<T>, @ResponseStatus, and returning raw DTOs from controller methods?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Raw DTOs always return HTTP 200 with default headers. @ResponseStatus sets a static status code (e.g., 201 Created). ResponseEntity<T> provides full programmatic control over status codes, custom HTTP headers, cookies, and conditional responses.",
            mentalModel: "Raw DTO is sending an unsealed postcard with standard postage. @ResponseStatus is sticking a pre-printed 'Express Delivery' stamp on it. ResponseEntity is a courier envelope where you can write custom routing headers, change the delivery tier dynamically, and insert tracking slips.",
            whatItIs: "ResponseEntity represents the entire HTTP response (status code, headers, body). It is a builder-pattern wrapper (`ResponseEntity.status(...).header(...).body(...)`).",
            whyItExists: "Enables dynamic HTTP status transitions (e.g., 200 OK vs 201 Created vs 204 No Content vs 304 Not Modified based on runtime logic).",
            comparisonTable: {
              title: "ResponseEntity<T> vs @ResponseStatus vs Raw DTOs",
              headers: ["Feature / Dimension", "Raw DTO Return", "@ResponseStatus", "ResponseEntity<T>"],
              rows: [
                ["Status Code Flexibility", "Fixed to 200 OK (static)", "Fixed to declared annotation value (e.g. 201 Created)", "Dynamic: programmatic status per branch (200, 201, 204, 304, 404)"],
                ["Custom HTTP Headers", "Cannot attach custom headers", "Cannot attach custom headers", "Full control: `.header(name, value)`, `.contentType()`, `.eTag()`, `.location()`"],
                ["Response Body", "Directly serialized to JSON", "Directly serialized to JSON (or empty for void)", "Full control: body can be DTO, binary byte[], Resource, or empty"],
                ["Boilerplate Overhead", "Lowest (pure business return type)", "Minimal (1 simple annotation on method/exception)", "Slightly higher (wraps return type in builder)"],
                ["Ideal Use Case", "Simple query reads always returning 200 OK", "Void deletion methods (`204 No Content`), simple static creations", "File downloads, conditional HTTP 304 caching, dynamic multi-status flows"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Option 1: ResponseEntity - dynamic status and custom headers\n@GetMapping(\"/documents/{id}\")\npublic ResponseEntity<byte[]> downloadDoc(@PathVariable String id) {\n    byte[] pdf = docService.load(id);\n    return ResponseEntity.ok()\n        .header(HttpHeaders.CONTENT_DISPOSITION, \"attachment; filename=report.pdf\")\n        .contentType(MediaType.APPLICATION_PDF)\n        .contentLength(pdf.length)\n        .body(pdf);\n}\n\n// Option 2: @ResponseStatus - static status for void methods\n@DeleteMapping(\"/items/{id}\")\n@ResponseStatus(HttpStatus.NO_CONTENT) // Always 204\npublic void deleteItem(@PathVariable Long id) {\n    itemService.delete(id);\n}"
            },
            tradeoffs: "Overusing raw DTO returns without specifying proper HTTP status codes often leads to returning HTTP 200 for operations that actually created resources (201) or had no content (204).",
            theyMightAskNext: [
              {
                question: "How do you implement HTTP ETag caching with ResponseEntity?",
                answer: "Using `ResponseEntity.ok().eTag(versionHash).body(resource)`. If the client sends `If-None-Match`, Spring can return `304 Not Modified` without retransmitting the body."
              }
            ],
            usedInProduction: "Standard practice in REST design: use ResponseEntity for fine-grained status codes and headers, or use @ResponseStatus on lightweight deletion/mutation endpoints.",
            relatedTopics: ["sb-rest-1", "sb-controller-vs-restcontroller"]
          }
        }
      ]
    },
    {
      id: "async-reactive-web",
      title: "Async, Reactive & Virtual Threads",
      questions: [
        {
          id: "sb-async-task-executor",
          question: "How does @Async work in Spring Boot, how do you configure a ThreadPoolTaskExecutor, and how do you propagate MDC context?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "@Async runs methods in a separate worker thread. Enable it with @EnableAsync. You must define a custom ThreadPoolTaskExecutor (default SimpleAsyncTaskExecutor creates new threads per task without pooling), and use a TaskDecorator to propagate SLF4J MDC logging context.",
            mentalModel: "Like submitting a tax form: instead of waiting at the counter while the auditor reviews 50 pages (blocking), the clerk stamps 'Received', hands you a receipt (CompletableFuture), and puts the file in an inbox for background processors to work on.",
            whatItIs: "Spring wraps @Async beans in an AOP proxy (`AsyncAnnotationAdvisor`). When invoked, the proxy submits the call as a `Callable` to the executor and returns a `CompletableFuture<T>` or `void`.",
            whyItExists: "For non-blocking operations: sending verification emails, auditing, generating PDF reports, or background webhook dispatching.",
            codeDemo: {
              language: "java",
              code: "@Configuration\n@EnableAsync\npublic class AsyncConfig {\n    @Bean(name = \"emailTaskExecutor\")\n    public Executor emailTaskExecutor() {\n        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();\n        executor.setCorePoolSize(10);\n        executor.setMaxPoolSize(50);\n        executor.setQueueCapacity(500);\n        executor.setThreadNamePrefix(\"email-async-\");\n        executor.setTaskDecorator(new MdcTaskDecorator()); // Copy traceId\n        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());\n        executor.initialize();\n        return executor;\n    }\n}\n\n// TaskDecorator for distributed tracing:\npublic class MdcTaskDecorator implements TaskDecorator {\n    @Override\n    public Runnable decorate(Runnable runnable) {\n        Map<String, String> context = MDC.getCopyOfContextMap();\n        return () -> {\n            try {\n                if (context != null) MDC.setContextMap(context);\n                runnable.run();\n            } finally {\n                MDC.clear();\n            }\n        };\n    }\n}"
            },
            tradeoffs: "Pitfalls: (1) Self-invocation fails because it bypasses the AOP proxy. (2) Async methods must be `public`. (3) Uncaught exceptions in `void` async methods are lost unless an `AsyncUncaughtExceptionHandler` is registered.",
            theyMightAskNext: [
              {
                question: "Why should you never use the default SimpleAsyncTaskExecutor in production?",
                answer: "Because it does NOT reuse threads — it creates a brand new operating system thread for every single task, leading to thread exhaustion and OutOfMemoryError under load."
              }
            ],
            usedInProduction: "Standard in all production email notification, analytics event dispatching, and distributed transaction outbox processing engines.",
            relatedTopics: ["sb-virtual-threads-boot32", "sb-transactional-self-invocation"]
          }
        },
        {
          id: "sb-resttemplate-vs-webclient",
          question: "What is the difference between RestTemplate, WebClient, and the modern RestClient in Spring Boot 3.2+?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "RestTemplate is the legacy synchronous, blocking HTTP client (in maintenance mode). WebClient is non-blocking and reactive (requires Project Reactor / Netty). RestClient (introduced in Spring Boot 3.2 / Spring 6.1) provides modern fluent, functional synchronous HTTP calls on top of standard servlet or virtual thread executors.",
            mentalModel: "RestTemplate is an old landline telephone. WebClient is a high-speed fiber-optic asynchronous messaging protocol. RestClient is a sleek modern smartphone with a beautiful touch UI that feels fluent and modern without requiring a PhD in reactive streams.",
            whatItIs: "RestClient combines the fluent API design of WebClient with the familiar synchronous execution model of RestTemplate. It works seamlessly with modern HTTP interfaces (`@HttpExchange`).",
            whyItExists: "Developers wanted the clean, functional API design of WebClient without being forced to pull in heavy reactive dependencies (`spring-boot-starter-webflux`).",
            comparisonTable: {
              title: "RestTemplate vs WebClient vs RestClient Comparison",
              headers: ["Dimension", "RestTemplate (Legacy)", "WebClient (Reactive)", "RestClient (Spring Boot 3.2+)"],
              rows: [
                ["I/O Execution Model", "Synchronous blocking (1 thread per request)", "Asynchronous, non-blocking reactive streams", "Synchronous blocking (optimized for Virtual Threads)"],
                ["API Style", "Template-based (`getForObject`, `exchange`)", "Fluent functional reactive builder (`.uri().retrieve()`)", "Fluent functional builder (`.uri().retrieve()`)"],
                ["Required Dependencies", "`spring-boot-starter-web`", "`spring-boot-starter-webflux` + Project Reactor", "`spring-boot-starter-web` (No WebFlux needed)"],
                ["Streaming / Backpressure", "No support for streaming", "Native support for reactive backpressure & SSE", "No reactive streaming; simple chunked streams"],
                ["Maintenance Status", "Maintenance mode (no new features)", "Active (standard for reactive architectures)", "Recommended default for synchronous/virtual thread apps"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Modern Spring Boot 3.2+ RestClient\n@Configuration\npublic class RestClientConfig {\n    @Bean\n    public RestClient restClient(RestClient.Builder builder) {\n        return builder\n            .baseUrl(\"https://api.github.com\")\n            .defaultHeader(\"Accept\", \"application/vnd.github.v3+json\")\n            .build();\n    }\n}\n\n@Service\npublic class GitHubService {\n    private final RestClient restClient;\n\n    public GitHubService(RestClient restClient) {\n        this.restClient = restClient;\n    }\n\n    public RepoDto getRepo(String owner, String repo) {\n        return restClient.get()\n            .uri(\"/repos/{owner}/{repo}\", owner, repo)\n            .retrieve()\n            .body(RepoDto.class);\n    }\n}"
            },
            tradeoffs: "If you need true streaming or reactive backpressure, `WebClient` is still required. For standard blocking/synchronous REST integration, `RestClient` is now the recommended standard.",
            theyMightAskNext: [
              {
                question: "What are HTTP Interfaces (@HttpExchange) in Spring 6 / Boot 3?",
                answer: "Declarative HTTP clients: you declare an interface with `@HttpExchange`, `@GetExchange(\"/users\")`, and Spring creates the client implementation automatically using `HttpServiceProxyFactory`."
              }
            ],
            usedInProduction: "Modern Spring Boot 3 microservices are actively migrating away from RestTemplate towards RestClient or HTTP Interfaces for inter-service communication.",
            relatedTopics: ["sb-spring-webflux-reactive", "sb-virtual-threads-boot32"]
          }
        },
        {
          id: "sb-spring-webflux-reactive",
          question: "What are the core differences between Spring MVC (Servlet) and Spring WebFlux (Reactive)?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring MVC uses synchronous blocking I/O with a dedicated thread per HTTP request on Tomcat. Spring WebFlux uses asynchronous, non-blocking I/O with an event-loop model (Netty) and Reactive Streams (Mono/Flux) handling thousands of concurrent requests with few threads.",
            mentalModel: "Spring MVC is like a bank with 200 teller windows: each customer monopolizes one teller until their paperwork is stamped. WebFlux is like a modern fast-food counter: one cashier takes 100 orders in 2 minutes, hands out order buzzers, and serves customers only when their food is actually ready.",
            whatItIs: "MVC relies on Java Servlet specification and thread-local state. WebFlux relies on Reactive Streams backpressure, Project Reactor (`Mono` for 0..1, `Flux` for 0..N), and non-blocking sockets.",
            whyItExists: "For streaming data, WebSockets, high-concurrency microservices, or gateways where thousands of concurrent connections would exhaust Tomcat's 200-thread pool.",
            comparisonTable: {
              title: "Spring MVC (Servlet) vs Spring WebFlux (Reactive)",
              headers: ["Dimension", "Spring MVC (Servlet Stack)", "Spring WebFlux (Reactive Stack)"],
              rows: [
                ["Concurrency Model", "Thread-per-request (blocking I/O)", "Event loop (non-blocking I/O via Netty)"],
                ["Embedded Server", "Apache Tomcat / Jetty (Servlet 3.1+)", "Eclipse Netty / Undertow"],
                ["Database Drivers", "Blocking JDBC, standard JPA/Hibernate", "Non-blocking R2DBC, Reactive Mongo/Redis/Cassandra"],
                ["Thread Utilization", "Large thread pool (200 threads default in Tomcat)", "Tiny thread pool (typically 1 thread per CPU core)"],
                ["Failure Under Blocking Call", "Affects only the single calling thread", "Catastrophic: blocks the event loop for all requests!"],
                ["Debugging & Stack Traces", "Simple, linear, standard stack traces", "Complex asynchronous reactive call graphs"],
                ["Ideal Use Cases", "Standard enterprise CRUD, relational SQL apps", "High-concurrency streaming, API gateways, live dashboards"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Spring WebFlux Reactive Controller\n@RestController\n@RequestMapping(\"/api/v1/stream\")\npublic class ReactiveStockController {\n    private final StockPriceService stockService;\n\n    @GetMapping(value = \"/prices\", produces = MediaType.TEXT_EVENT_STREAM_VALUE)\n    public Flux<StockPrice> streamStockPrices() {\n        return stockService.getPriceUpdates()\n            .delayElements(Duration.ofSeconds(1));\n    }\n}"
            },
            tradeoffs: "Golden Rule: WebFlux is completely broken if ANY blocking library is called on the event loop (e.g. blocking JDBC, `Thread.sleep()`, standard JPA). Blocking an event-loop thread freezes all other requests multiplexed on that thread.",
            theyMightAskNext: [
              {
                question: "Can you use Spring Data JPA with WebFlux?",
                answer: "No, standard JPA/Hibernate is fundamentally blocking. You must use Spring Data R2DBC (Reactive Relational Database Connectivity) or reactive NoSQL drivers (MongoDB, Cassandra, Redis)."
              }
            ],
            usedInProduction: "Core engine of Spring Cloud Gateway, streaming financial ticker endpoints, and high-frequency IoT ingest services.",
            relatedTopics: ["sb-resttemplate-vs-webclient", "sb-server-sent-events", "sb-virtual-threads-boot32"]
          }
        },
        {
          id: "sb-server-sent-events",
          question: "How do you implement Server-Sent Events (SSE) and real-time streaming in Spring Boot?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Return `SseEmitter` from a Spring MVC controller method or return `Flux<ServerSentEvent<T>>` with `produces = MediaType.TEXT_EVENT_STREAM_VALUE` in Spring WebFlux.",
            mentalModel: "A one-way radio broadcast: the client dials into the station once (HTTP connection), and the server broadcasts real-time news alerts over that open frequency whenever an event happens.",
            whatItIs: "SSE is a W3C standard for unidirectional server-to-client streaming over standard HTTP. Unlike WebSockets, it works over HTTP/1.1 and HTTP/2, requires no special handshake, supports automatic browser reconnection, and passes through corporate firewalls seamlessly.",
            whyItExists: "For notifications, live order progress bars, dashboard updates, and AI chat completion streaming (ChatGPT-like token streaming) where client-to-server bi-directional communication is unnecessary.",
            codeDemo: {
              language: "java",
              code: "// Spring MVC SseEmitter\n@RestController\npublic class NotificationController {\n    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();\n\n    @GetMapping(value = \"/api/notifications/stream\", produces = MediaType.TEXT_EVENT_STREAM_VALUE)\n    public SseEmitter streamNotifications() {\n        SseEmitter emitter = new SseEmitter(180_000L); // 3 min timeout\n        emitters.add(emitter);\n        emitter.onCompletion(() -> emitters.remove(emitter));\n        emitter.onTimeout(() -> emitters.remove(emitter));\n        return emitter;\n    }\n\n    public void broadcast(String message) {\n        for (SseEmitter emitter : emitters) {\n            try {\n                emitter.send(SseEmitter.event().name(\"alert\").data(message));\n            } catch (IOException e) {\n                emitters.remove(emitter);\n            }\n        }\n    }\n}"
            },
            tradeoffs: "In Spring MVC, each open `SseEmitter` holds an asynchronous servlet request thread context. In high-concurrency environments with 10,000+ simultaneous connections, WebFlux or Virtual Threads must be used.",
            theyMightAskNext: [
              {
                question: "What is the difference between SSE and WebSockets?",
                answer: "SSE is unidirectional (server -> client), runs over standard HTTP, and has automatic reconnects. WebSockets is full-duplex bi-directional (both ways), uses a custom protocol (ws://), and requires custom reconnect logic."
              }
            ],
            usedInProduction: "Standard implementation for streaming LLM tokens in generative AI backends and real-time order delivery tracking dashboards.",
            relatedTopics: ["sb-spring-webflux-reactive", "sb-virtual-threads-boot32"]
          }
        },
        {
          id: "sb-virtual-threads-boot32",
          question: "How do Virtual Threads work in Spring Boot 3.2+ (Java 21) and how do they challenge the need for reactive programming?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Enable virtual threads via `spring.threads.virtual.enabled=true`. Tomcat and @Async executors switch to virtual threads, allowing blocking code (JPA, JDBC, RestClient) to achieve reactive-scale throughput with standard imperative code and simple stack traces.",
            mentalModel: "Platform threads are heavy passenger trains (expensive, limited track capacity). Virtual threads are lightweight passengers who step off the train when waiting for data and step back onto any available train when data arrives, without tying up tracks.",
            whatItIs: "Introduced in Java 21 (Project Loom) and supported out-of-the-box in Spring Boot 3.2. When a virtual thread executes a blocking I/O call (e.g. database query, HTTP call), the JVM unmounts it from the carrier platform thread, freeing the carrier to execute other virtual threads.",
            whyItExists: "Allows developers to write clean, sequential, synchronous code (no complex `flatMap`, `Mono`, or `Flux` mental overhead) while still scaling to hundreds of thousands of concurrent I/O operations.",
            codeDemo: {
              language: "properties",
              code: "# application.properties in Spring Boot 3.2+\n# Automatically switches Tomcat request-processing threads to Virtual Threads\nspring.threads.virtual.enabled=true\n\n// Java code remains 100% clean imperative Spring MVC:\n@GetMapping(\"/users/{id}\")\npublic UserDto getUser(@PathVariable Long id) {\n    // Blocking DB call + blocking HTTP call — scales to 100,000 requests without thread exhaustion!\n    User user = userRepository.findById(id).orElseThrow();\n    CreditScore score = creditClient.getScore(user.getSsn());\n    return new UserDto(user, score);\n}"
            },
            tradeoffs: "Watch out for thread pinning: executing synchronized blocks or native methods while performing blocking I/O prevents unmounting. Replace `synchronized` with `ReentrantLock`.",
            theyMightAskNext: [
              {
                question: "Should you pool Virtual Threads in an ExecutorService?",
                answer: "NEVER. Virtual threads are cheap and disposable (created in sub-microseconds). Pooling them is an anti-pattern; always create a new virtual thread per task (`Executors.newVirtualThreadPerTaskExecutor()`)."
              }
            ],
            usedInProduction: "Major cloud microservices at Netflix, Amazon, and fintech platforms are standardizing on Spring Boot 3.2+ with virtual threads to simplify their architecture while sustaining peak traffic.",
            relatedTopics: ["sb-spring-webflux-reactive", "sb-embedded-containers", "sb-async-task-executor"]
          }
        }
      ]
    }
  ]
};
