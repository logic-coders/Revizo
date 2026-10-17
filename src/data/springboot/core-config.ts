import { Category } from "@/types";

export const springBootCoreCategory: Category = {
  id: "sb-core",
  title: "Core Architecture & IoC",
  subTopics: [
    {
      id: "auto-config-starters",
      title: "Auto-Configuration & Starters",
      questions: [
        {
          id: "sb-auto-1",
          question: "What is Spring Boot Auto-Configuration?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-09-15",
          answer: {
            quickAnswer: "Auto-configuration automatically sets up Spring beans based on what's on your classpath — add a JDBC driver JAR and Spring configures a DataSource for you, zero XML needed.",
            mentalModel: "It's like checking into a smart hotel. The room detects you brought a laptop (classpath has a JDBC driver) and automatically provides a desk, monitor, and WiFi password (DataSource, EntityManager, transaction manager). You didn't ask — it saw what you needed and set it up.",
            whatItIs: "Auto-configuration is Spring Boot's mechanism to automatically create and configure beans based on classpath contents, existing beans, and property values. Triggered by @EnableAutoConfiguration (included in @SpringBootApplication), it evaluates auto-configuration classes using conditional annotations: @ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty. Each auto-config class is a @Configuration that only activates when its conditions are met.",
            whyItExists: "Pre-Spring Boot, setting up a Spring app required dozens of XML files or @Configuration classes — manually wiring DataSources, ViewResolvers, TransactionManagers, and MessageConverters. A simple CRUD app needed 200+ lines of configuration. Auto-configuration applies convention-over-configuration: sensible defaults are provided, and developers only configure what's unique to their app. This reduced project setup from hours to minutes.",
            codeDemo: {
              language: "java",
              code: "// This single annotation enables everything:\n@SpringBootApplication  // = @Configuration\n                        //   + @EnableAutoConfiguration\n                        //   + @ComponentScan\npublic class MyApp {\n    public static void main(String[] args) {\n        SpringApplication.run(MyApp.class, args);\n    }\n}\n\n// Override defaults via application.properties:\n// server.port=8081\n// spring.datasource.url=jdbc:mysql://localhost/mydb\n\n// Exclude specific auto-configurations:\n@SpringBootApplication(\n    exclude = {DataSourceAutoConfiguration.class})\npublic class MyApp { }\n\n// Custom auto-configuration:\n@Configuration\n@ConditionalOnClass(MyService.class)\n@ConditionalOnMissingBean(MyService.class)\npublic class MyServiceAutoConfig {\n    @Bean\n    public MyService myService() {\n        return new DefaultMyService();\n    }\n}\n\n// Debug what's auto-configured:\n// Run with: --debug or debug=true in properties",
              explanation: "Auto-config classes live in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports — Spring evaluates each class's @Conditional annotations at startup."
            },
            tradeoffs: "Auto-configuration can hide what's happening — developers may not realize a DataSource, security filter, or cache manager was silently created. Use --debug to audit. Ordering matters: if your @Bean is created before auto-configuration runs, @ConditionalOnMissingBean won't detect it. Auto-configuration classes run AFTER user @Configuration classes — design custom beans accordingly. Excluding an auto-config can have cascading effects (e.g., excluding DataSource breaks JPA, which breaks Spring Data repositories).",
            followUpQuestions: [
              {
                question: "How does Spring Boot decide which auto-configurations to apply?",
                answer: "It reads all auto-configuration class names from META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports on the classpath. Each class is a @Configuration with @Conditional annotations — Spring evaluates every condition (class present? property set? bean missing?) and only registers the beans if ALL conditions are met."
              },
              {
                question: "What's the difference between @ConditionalOnClass and @ConditionalOnBean?",
                answer: "@ConditionalOnClass checks if a CLASS is on the classpath (compile-time dependency). @ConditionalOnBean checks if a BEAN is already registered in the ApplicationContext (runtime state). Auto-configs typically use @ConditionalOnClass to detect library presence, then @ConditionalOnMissingBean to avoid overriding user-defined beans."
              }
            ],
            usedInProduction: "Every Spring Boot microservice at Alibaba Cloud uses auto-configuration — adding spring-cloud-starter-alibaba-nacos automatically configures service discovery, config management, and health endpoints without a single line of explicit setup across 10,000+ microservices.",
            relatedTopics: [
              "Spring Boot Starters",
              "Dependency Injection",
              "@Conditional Annotations",
              "application.properties"
            ]
          }
        },
        {
          id: "sb-auto-2",
          question: "What are Spring Boot Starters?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-09-12",
          answer: {
            quickAnswer: "Starters are curated dependency bundles — add one POM entry like spring-boot-starter-web and get Tomcat, Jackson, Spring MVC, and validation, all with tested-compatible versions.",
            mentalModel: "Starters are like meal kits. Instead of buying flour, yeast, cheese, and tomato sauce separately (and hoping they go together), you order a 'pizza kit' (starter-web) and everything arrives pre-measured and compatible.",
            whatItIs: "Starters are dependency descriptors following the pattern spring-boot-starter-*. Each starter declares a curated set of transitive dependencies AND their corresponding auto-configuration. Examples: starter-web (Spring MVC + Tomcat + Jackson), starter-data-jpa (Hibernate + HikariCP + Spring Data), starter-security (Spring Security + auto-config), starter-test (JUnit 5 + Mockito + AssertJ). Version management is handled by the parent BOM.",
            whyItExists: "Before starters, adding JPA required manually finding compatible versions of Hibernate, HikariCP, Spring Data JPA, and the JDBC driver — a common source of classpath hell. Starters solve this: one dependency entry pulls in everything you need with versions the Spring team has tested together. You never specify versions for Spring-managed dependencies.",
            codeDemo: {
              language: "xml",
              code: "<!-- pom.xml — one starter = everything you need -->\n<parent>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-starter-parent</artifactId>\n    <version>3.2.0</version>\n</parent>\n\n<dependencies>\n    <!-- Web: Tomcat + MVC + Jackson + Validation -->\n    <dependency>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter-web</artifactId>\n    </dependency>\n\n    <!-- Data: Hibernate + HikariCP + Spring Data JPA -->\n    <dependency>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter-data-jpa</artifactId>\n    </dependency>\n\n    <!-- Test: JUnit 5 + Mockito + AssertJ + TestContainers -->\n    <dependency>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter-test</artifactId>\n        <scope>test</scope>\n    </dependency>\n</dependencies>\n<!-- No <version> tags needed — parent BOM manages all -->",
              explanation: "The parent BOM (Bill of Materials) manages all dependency versions. Never specify versions for Spring-managed dependencies."
            },
            tradeoffs: "Starters pull in transitive dependencies you might not need (starter-web includes Tomcat even if you want Netty — use exclusions). The 'magic' can obscure what's actually on your classpath; run mvn dependency:tree to audit. Creating custom starters requires careful attention to auto-configuration ordering and conditional bean registration. Upgrading the parent version can introduce breaking changes across many transitive dependencies at once.",
            followUpQuestions: [
              {
                question: "How do you replace Tomcat with Jetty or Undertow?",
                answer: "Exclude spring-boot-starter-tomcat from spring-boot-starter-web, then add spring-boot-starter-jetty or spring-boot-starter-undertow. Auto-configuration detects which embedded server is on the classpath and configures it automatically."
              },
              {
                question: "Can you create a custom starter for your organization?",
                answer: "Yes. Create two modules: (1) an auto-configuration module with @Configuration + @Conditional beans, and (2) a starter module that depends on the auto-config module plus any required libraries. Register the auto-config class in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports."
              }
            ],
            usedInProduction: "At Spotify, custom Spring Boot starters encapsulate company-wide standards — a single 'spotify-starter-service' dependency adds observability (Prometheus metrics + Jaeger tracing), standardized error handling, and mTLS configuration to every new microservice with zero per-team setup.",
            relatedTopics: [
              "Auto-Configuration",
              "Dependency Management",
              "Spring Boot Parent POM"
            ]
          }
        },
        {
          id: "sb-auto-how-it-works",
          question: "How does @EnableAutoConfiguration work internally, and how did Spring Boot 2.7 / 3.0 change auto-configuration discovery?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "@EnableAutoConfiguration uses AutoConfigurationImportSelector to scan classpaths. Prior to Spring Boot 2.7, it read META-INF/spring.factories; from Spring Boot 2.7 and 3.0+, it reads META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports.",
            mentalModel: "Think of AutoConfigurationImportSelector like a plug-in directory in an operating system. Instead of checking every file on disk, the system opens a single manifest file that lists all registered device drivers, and tests if the corresponding hardware is plugged in.",
            whatItIs: "At bootstrap, @EnableAutoConfiguration triggers AutoConfigurationImportSelector.selectImports(), which loads candidate @Configuration class names from the new imports file. Each candidate class is annotated with @AutoConfiguration and condition annotations (@ConditionalOnClass, @ConditionalOnMissingBean, etc.). The ConditionEvaluator processes them, and matching beans are registered into the BeanDefinitionRegistry.",
            whyItExists: "Spring factories files had performance and modularity bottlenecks: all factory types (listeners, initializers, auto-configurations) were lumped together in spring.factories with complex comma-separated values. The new .imports file format is line-oriented, faster to parse, and cleanly isolates auto-configuration from general factory components.",
            codeDemo: {
              language: "java",
              code: "// File location in Spring Boot 3.x:\n// META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\n// com.company.audit.AuditAutoConfiguration\n\n@AutoConfiguration(after = DataSourceAutoConfiguration.class)\n@ConditionalOnClass(AuditClient.class)\n@ConditionalOnProperty(prefix = \"audit\", name = \"enabled\", havingValue = \"true\", matchIfMissing = true)\npublic class AuditAutoConfiguration {\n    @Bean\n    @ConditionalOnMissingBean\n    public AuditService auditService(AuditClient client) {\n        return new DefaultAuditService(client);\n    }\n}"
            },
            tradeoffs: "Migrating from Spring Boot 2.x to 3.x requires renaming and moving custom auto-configuration listings from spring.factories to the new .imports location, or custom auto-configurations will silently fail to register.",
            theyMightAskNext: [
              {
                question: "What is the @AutoConfiguration annotation introduced in 2.7?",
                answer: "@AutoConfiguration replaces top-level @Configuration for auto-config classes. It provides explicit ordering attributes (after, afterName, before, beforeName) without relying on @AutoConfigureAfter/@AutoConfigureBefore."
              },
              {
                question: "How can you view the Conditions Evaluation Report in a running app?",
                answer: "Start with --debug, or access the Spring Boot Actuator endpoint GET /actuator/conditions to view all positive and negative matches with evaluation reasons."
              }
            ],
            usedInProduction: "Used by internal platform engineering teams at Netflix and Uber to distribute shared telemetry, security filters, and gRPC interceptors without requiring manual wiring from application developers.",
            relatedTopics: ["sb-auto-1", "sb-conditional-annotations", "sb-custom-starter"]
          }
        },
        {
          id: "sb-conditional-annotations",
          question: "What are @Conditional annotations in Spring Boot and how do you create a custom condition?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "@Conditional annotations conditionally register a bean or configuration only when specific environmental criteria are met. Common types include @ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty, and custom Condition implementations.",
            mentalModel: "Think of an electrical circuit breaker or a conditional bouncer at a club: unless you have the VIP ticket (class present) and no one else is currently occupying the booth (missing bean), entry is denied.",
            whatItIs: "Built on top of Spring 4's @Conditional(Condition.class), Spring Boot provides specialized condition annotations in org.springframework.boot.autoconfigure.condition. They evaluate during the bean definition phase before beans are instantiated.",
            whyItExists: "They prevent NoSuchBeanDefinitionException or ClassNotFoundException when external libraries are optional, and they allow developer-declared beans to effortlessly take precedence over framework defaults.",
            codeDemo: {
              language: "java",
              code: "// Custom Condition Example\npublic class OnProductionRegionCondition implements Condition {\n    @Override\n    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {\n        String region = context.getEnvironment().getProperty(\"cloud.region\");\n        return \"us-east-1\".equalsIgnoreCase(region);\n    }\n}\n\n// Usage on a Bean or Configuration\n@Configuration\n@Conditional(OnProductionRegionCondition.class)\npublic class UsEastReplicationConfig {\n    @Bean\n    public ReplicationService replicationService() {\n        return new UsEastReplicationService();\n    }\n}"
            },
            tradeoffs: "Condition evaluation ordering is critical: @ConditionalOnBean should not be used on user-level @Configuration classes because bean creation order is not guaranteed. Use @ConditionalOnClass or @ConditionalOnProperty instead.",
            theyMightAskNext: [
              {
                question: "What is the difference between @ConditionalOnProperty and @Profile?",
                answer: "@Profile activates beans based on active profiles (e.g., dev, prod), while @ConditionalOnProperty allows fine-grained boolean/value checks against specific application property keys (with matchIfMissing options)."
              }
            ],
            usedInProduction: "Used extensively in multi-cloud microservices to toggle AWS vs GCP vs LocalStack storage backends purely based on environment variables.",
            relatedTopics: ["sb-auto-1", "sb-custom-starter", "sb-profiles-external-config"]
          }
        },
        {
          id: "sb-exclude-autoconfig",
          question: "How do you disable or exclude specific auto-configuration classes in Spring Boot?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "You can exclude auto-configurations via @SpringBootApplication(exclude = {...}), @EnableAutoConfiguration(exclude = {...}), or via application.properties using spring.autoconfigure.exclude.",
            mentalModel: "Like unsubscribing from a default channel bundle in a cable TV package: you still get the base service, but you specifically turn off sports or movies you don't need.",
            whatItIs: "Spring Boot auto-configuration exclusion prevents AutoConfigurationImportSelector from adding specified auto-configuration classes to the configuration queue, ensuring no default beans from that class are registered.",
            whyItExists: "Commonly needed when you bring a starter (e.g. spring-boot-starter-data-jpa) but want to manually configure multiple DataSources, or use an embedded server without security auto-configurations interfering during local tests.",
            codeDemo: {
              language: "java",
              code: "// Option 1: Annotation-based exclusion\n@SpringBootApplication(exclude = {\n    DataSourceAutoConfiguration.class,\n    HibernateJpaAutoConfiguration.class\n})\npublic class MultiDbApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(MultiDbApplication.class, args);\n    }\n}\n\n# Option 2: application.properties / application.yml\n# spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration"
            },
            tradeoffs: "Excluding an auto-configuration can break downstream auto-configurations that depend on its beans. For instance, excluding DataSourceAutoConfiguration will prevent JdbcTemplate and TransactionManager auto-configurations from loading.",
            theyMightAskNext: [
              {
                question: "Can you exclude auto-configurations for test slices only?",
                answer: "Yes, in tests using slice annotations like @DataJpaTest or @WebMvcTest, you can specify excludeAutoConfiguration = {SecurityAutoConfiguration.class}."
              }
            ],
            usedInProduction: "Essential in multi-tenant or multi-datacenter enterprise applications where 2 or 3 distinct Oracle and PostgreSQL DataSources must be configured manually via custom @Bean factories.",
            relatedTopics: ["sb-auto-1", "sb-hikaricp-connection-pool"]
          }
        },
        {
          id: "sb-custom-starter",
          question: "How do you create a production-grade custom Spring Boot Starter from scratch?",
          difficulty: "Advanced",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A standard custom starter consists of two modules: an 'autoconfigure' module (contains @AutoConfiguration, @Conditional beans, and .imports file) and a 'starter' module (an empty aggregator POM declaring dependencies on autoconfigure and third-party libraries).",
            mentalModel: "Think of it as packaging an IKEA furniture kit: the autoconfigure module is the assembly instruction manual and screws, while the starter module is the complete shipping box that bundles the manual with the wood panels.",
            whatItIs: "According to Spring Boot conventions, custom starters should be named foo-spring-boot-starter (not spring-boot-starter-foo, which is reserved for official Spring starters). It packages auto-configuration classes with appropriate metadata.",
            whyItExists: "In large enterprises with dozens of microservices, custom starters standardize logging, distributed tracing, authentication tokens, rate limits, and database audit fields with zero boilerplate in client services.",
            codeDemo: {
              language: "xml",
              code: "<!-- 1. Custom Starter POM (aggregator) -->\n<artifactId>company-audit-spring-boot-starter</artifactId>\n<dependencies>\n    <dependency>\n        <groupId>com.company</groupId>\n        <artifactId>company-audit-spring-boot-autoconfigure</artifactId>\n    </dependency>\n    <dependency>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-starter</artifactId>\n    </dependency>\n</dependencies>\n\n<!-- 2. Inside autoconfigure module: -->\n<!-- src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports -->\ncom.company.audit.AuditAutoConfiguration"
            },
            tradeoffs: "Custom starters must be rigorously tested with ApplicationContextRunner to verify both positive and negative conditional matches, or misconfigurations will silently cascade across hundreds of services.",
            theyMightAskNext: [
              {
                question: "What is spring-boot-configuration-processor?",
                answer: "An annotation processor that generates META-INF/spring-configuration-metadata.json during compilation, enabling IDE autocomplete and documentation for custom @ConfigurationProperties."
              }
            ],
            usedInProduction: "Used by FinTech platforms like PayPal and Adyen to enforce PCI-DSS logging filters and token masking across all microservices automatically.",
            relatedTopics: ["sb-auto-how-it-works", "sb-conditional-annotations", "sb-value-vs-configprops"]
          }
        }
      ]
    },
    {
      id: "ioc-dependency-injection",
      title: "IoC & Dependency Injection",
      questions: [
        {
          id: "sb-di-1",
          question: "What is Dependency Injection and how does Spring implement it?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-09-15",
          answer: {
            quickAnswer: "DI is giving an object its dependencies from outside rather than letting it create them itself. Spring's IoC container manages this via constructor injection (preferred), setter injection, or field injection (@Autowired).",
            mentalModel: "Without DI, a chef goes to the market, buys ingredients, grows herbs, and then cooks. With DI, the ingredients are delivered to the kitchen — the chef just cooks. The chef doesn't know (or care) where the ingredients came from, and you can easily swap suppliers.",
            whatItIs: "Dependency Injection is a pattern where an object's collaborators are provided externally rather than created internally. Spring's IoC (Inversion of Control) container manages the lifecycle and wiring of all @Component/@Service/@Repository/@Controller beans. Three injection types: Constructor (recommended — dependencies are final, immutable, explicit), Setter (for optional dependencies), Field (@Autowired — convenient but hides dependencies). The container resolves dependencies by type, with @Qualifier for disambiguation.",
            whyItExists: "Tight coupling (new MyRepo() inside a service) makes code untestable, inflexible, and fragile. DI provides: (1) testability — mock dependencies in unit tests, (2) loose coupling — swap implementations without modifying dependent classes, (3) configurability — change behavior via profiles/qualifiers, (4) lifecycle management — Spring handles creation, scoping, and destruction.",
            codeDemo: {
              language: "java",
              code: "// ✅ Constructor Injection (RECOMMENDED)\n@Service\npublic class OrderService {\n    private final OrderRepository orderRepo;\n    private final PaymentGateway gateway;\n    private final NotificationService notifier;\n\n    // @Autowired is optional for single constructor in Spring 4.3+\n    public OrderService(OrderRepository orderRepo,\n                        PaymentGateway gateway,\n                        NotificationService notifier) {\n        this.orderRepo = orderRepo;\n        this.gateway = gateway;\n        this.notifier = notifier;\n    }\n}\n\n// ⚠️ Field Injection — avoid in production\n@Service\npublic class BadService {\n    @Autowired private SomeRepo repo;\n    // Hidden dependency, can't be final, hard to test\n}",
              explanation: "Constructor injection: dependencies are final, explicit, always fully initialized, and trivially testable with 'new OrderService(mockRepo, mockGateway, mockNotif)'."
            },
            tradeoffs: "Constructor injection can lead to 'constructor bloat' when a class has 7+ dependencies — this is usually a design smell (Single Responsibility Principle violation), not a DI problem. Field injection is tempting for brevity but makes dependencies invisible, prevents final fields, and requires Spring to instantiate the object (can't new it in tests). Circular dependencies (A→B→A) cause startup failures — redesign with an intermediary, @Lazy, or events. DI adds indirection — tracing 'who created this object?' requires understanding the container.",
            followUpQuestions: [
              {
                question: "Why is constructor injection preferred over field injection?",
                answer: "Four reasons: (1) Dependencies are final/immutable — no accidental reassignment. (2) All dependencies are visible in the constructor signature — no hidden surprises. (3) Objects are always fully initialized — no partially constructed state. (4) Easy to unit test without Spring: just call new Service(mock1, mock2). Field injection requires reflection or a full Spring context to test."
              },
              {
                question: "How does Spring resolve circular dependencies?",
                answer: "With constructor injection, circular dependencies cause a BeanCurrentlyInCreationException at startup — Spring can't create A without B, but B needs A. Solutions: (1) Redesign to remove the cycle (best), (2) Use @Lazy on one constructor param (Spring injects a proxy), (3) Use setter injection on one side (Spring can create partial objects), (4) Use ApplicationEventPublisher to decouple via events."
              }
            ],
            usedInProduction: "At Amazon, Spring DI with @Profile annotations enables seamless environment switching — the same OrderService works with a DynamoDB repository in production and an in-memory HashMap repository in local development, without changing a single line of service-layer code.",
            relatedTopics: [
              "Auto-Configuration",
              "Spring Bean Scopes",
              "ApplicationContext",
              "@Profile and @Conditional"
            ]
          }
        },
        {
          id: "sb-di-types",
          question: "Why is Field Injection (@Autowired on fields) strongly discouraged in modern Spring Boot?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Field injection violates encapsulation, prevents fields from being final/immutable, hides class dependencies, and makes pure POJO unit testing without Spring Context or reflection impossible.",
            mentalModel: "Imagine a device whose batteries can only be inserted by opening up the sealed outer casing with specialized factory tools (reflection), rather than having an open battery door (constructor).",
            whatItIs: "Field injection uses reflection to inject beans directly into private fields. In contrast, constructor injection enforces that all dependencies are supplied at instantiation time, allowing fields to be declared `final`.",
            whyItExists: "Field injection became popular early on because it looked cleaner with less boilerplate. With Lombok (@RequiredArgsConstructor) and Spring 4.3+ (automatic constructor autowiring), the boilerplate argument is obsolete.",
            codeDemo: {
              language: "java",
              code: "// ❌ Anti-pattern: Field injection\n@Service\npublic class PaymentService {\n    @Autowired\n    private PaymentGateway gateway; // Non-final, hidden, requires reflection\n}\n\n// ✅ Modern Best Practice: Constructor injection + Lombok\n@Service\n@RequiredArgsConstructor\npublic class PaymentService {\n    private final PaymentGateway gateway; // Final, immutable, compiler-enforced\n\n    // In unit tests, simply: new PaymentService(mockGateway);\n}"
            },
            tradeoffs: "Constructor injection can reveal code smells: if a constructor requires 10 parameters, it's an immediate signal that the class violates the Single Responsibility Principle and should be refactored.",
            theyMightAskNext: [
              {
                question: "When is Setter Injection appropriate?",
                answer: "Setter injection is used strictly for optional or mutable dependencies that have sensible defaults and can be reconfigured dynamically at runtime."
              }
            ],
            usedInProduction: "Standard corporate static analysis rule (SonarQube rule java:S3749) flags all field injections as major code quality violations across modern enterprise codebases.",
            relatedTopics: ["sb-di-1", "sb-bean-lifecycle"]
          }
        },
        {
          id: "sb-stereotypes",
          question: "What is the difference between @Component, @Service, @Repository, and @Controller?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "@Component is the generic stereotype for any Spring bean. @Service, @Repository, and @Controller are specialized semantic stereotypes for the service, persistence, and presentation layers; @Repository additionally enables automatic DataAccessException translation.",
            mentalModel: "Think of @Component as 'Employee'. @Service is 'Manager', @Repository is 'Archivist', and @Controller is 'Receptionist'. All are Employees, but each has dedicated duties and special toolkits.",
            whatItIs: "All three specialized annotations are meta-annotated with @Component, so they are all discovered by @ComponentScan. However, Spring and AOP tools attach specific advice based on the stereotype: @Repository enables PersistenceExceptionTranslationPostProcessor to translate vendor-specific SQL exceptions into Spring's unchecked DataAccessException hierarchy.",
            whyItExists: "Layered architecture clarity, tool integration, and enabling aspect pointcuts that target specific tiers (e.g., transaction management on @Service, metrics on @Repository).",
            comparisonTable: {
              title: "@Component vs @Service vs @Repository vs @Controller Comparison Matrix",
              headers: ["Stereotype Annotation", "Target Architectural Layer", "Specialized Capabilities / Features", "Exception Translation", "Typical Usage"],
              rows: [
                ["@Component", "Any general utility / cross-cutting layer", "Basic auto-detection, component scanning, and lifecycle bean management", "No automatic translation", "Custom security helpers, strategy classes, API mappers, cache adapters"],
                ["@Service", "Business logic / Service layer", "Semantic marker for transaction demarcation; targets service-layer AOP pointcuts", "No automatic translation", "Domain services, transaction orchestrators, business rule validators"],
                ["@Repository", "Data access / Persistence layer", "Encapsulates storage, retrieval, and search; targets persistence advice", "Yes (translates JDBC/Hibernate SQL errors to DataAccessException)", "DAO classes, custom query repositories, database access adapters"],
                ["@Controller / @RestController", "Presentation / Web API layer", "Maps incoming HTTP requests, handles serialization (JSON/XML) or MVC view resolution", "Translates controller exceptions via @ExceptionHandler / @ControllerAdvice", "REST API controllers, MVC web controllers, GraphQL query/mutation resolvers"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "@Target(ElementType.TYPE)\n@Retention(RetentionPolicy.RUNTIME)\n@Documented\n@Component // Meta-annotation\npublic @interface Service {}\n\n@Target(ElementType.TYPE)\n@Retention(RetentionPolicy.RUNTIME)\n@Documented\n@Component\npublic @interface Repository {\n    // Automatically triggers exception translation\n}"
            },
            tradeoffs: "Using generic @Component everywhere works for DI, but forfeits database exception translation and clean architectural layering.",
            theyMightAskNext: [
              {
                question: "What exception translation does @Repository perform?",
                answer: "It catches HibernateException, SQLException, or PersistenceException and wraps them into DataAccessException (e.g., DuplicateKeyException, CannotAcquireLockException), decoupling callers from the underlying DB technology."
              }
            ],
            usedInProduction: "Standard across all enterprise Spring Boot microservices to delineate clean Hexagonal or Layered Architecture boundaries.",
            relatedTopics: ["sb-di-1", "sb-controller-vs-restcontroller"]
          }
        },
        {
          id: "sb-primary-qualifier",
          question: "How do @Primary and @Qualifier resolve NoUniqueBeanDefinitionException in Spring Boot?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "When multiple beans match a required type, Spring throws NoUniqueBeanDefinitionException. @Primary sets a default bean candidate, while @Qualifier specifies the exact bean name at the injection site.",
            mentalModel: "If an office has three printers (Color, Black&White, Photo), @Primary sets the default printer everyone uses if they just click 'Print'. @Qualifier is explicitly choosing 'Photo Printer' when printing high-gloss pictures.",
            whatItIs: "@Primary is placed on the bean definition to give it preference during autowiring. @Qualifier can be placed on both the bean definition and the injection point (constructor param or field) to bind by specific name. @Qualifier takes precedence over @Primary.",
            whyItExists: "Enables multiple implementations of an interface (e.g., S3StorageService and LocalStorageService) to coexist in the same application context without ambiguity.",
            comparisonTable: {
              title: "@Primary vs @Qualifier Conflict Resolution Comparison",
              headers: ["Feature / Dimension", "@Primary", "@Qualifier", "Target Resolution Strategy"],
              rows: [
                ["Annotation Target", "Bean definition class or @Bean factory method", "Both injection points (constructor/field) and bean definitions", "Class vs Site"],
                ["Resolution Mechanism", "Specifies the default candidate when no qualifier is specified", "Explicitly targets a specific bean by its unique name or custom qualifier tag", "Default vs Explicit"],
                ["Precedence Order", "Lower precedence: overridden whenever @Qualifier is present", "Highest precedence: always overrides @Primary", "Qualifier > Primary"],
                ["Refactoring Safety", "Safe: requires no string literals on injection points", "String-based qualifiers risk runtime NoSuchBeanDefinitionException on rename", "Type-safe custom qualifiers recommended"],
                ["Best Use Case", "Designating the primary primary implementation (e.g. Postgres DB or Default Mailer)", "Selecting specialized implementations (e.g. PayPal vs Stripe vs Crypto payment processors)", "Default fallback vs Granular targeting"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "public interface NotificationSender {\n    void send(String msg);\n}\n\n@Component(\"emailSender\")\n@Primary // Default if no qualifier specified\npublic class EmailNotificationSender implements NotificationSender { ... }\n\n@Component(\"smsSender\")\npublic class SmsNotificationSender implements NotificationSender { ... }\n\n@Service\npublic class AlertService {\n    private final NotificationSender urgentSender;\n\n    // Explicitly select smsSender despite @Primary on emailSender\n    public AlertService(@Qualifier(\"smsSender\") NotificationSender urgentSender) {\n        this.urgentSender = urgentSender;\n    }\n}"
            },
            tradeoffs: "Hardcoding string qualifier names can cause subtle runtime failures if bean names are refactored. Use custom qualifier annotations with @Qualifier meta-annotations to ensure compile-time safety.",
            theyMightAskNext: [
              {
                question: "Can you create custom qualifier annotations?",
                answer: "Yes, define an annotation like `@Retention(RUNTIME) @Qualifier public @interface FastDelivery {}` and use `@FastDelivery` on both the bean and constructor parameter."
              }
            ],
            usedInProduction: "Used in payment processing platforms to route transactions to Stripe, Adyen, or PayPal based on currency and region.",
            relatedTopics: ["sb-di-1", "sb-profiles-external-config"]
          }
        },
        {
          id: "sb-bean-scopes",
          question: "What are Spring Bean Scopes and how do you solve the prototype-in-singleton proxy problem?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring supports singleton (default), prototype, request, session, and application scopes. When a prototype bean is injected into a singleton, it is only injected once at startup; to get a new instance each time, use @Lookup, ObjectProvider<T>, or scoped proxies (proxyMode = TARGET_CLASS).",
            mentalModel: "A singleton is a shared coffee machine in the break room. A prototype is a fresh disposable paper cup. If the coffee machine glues one paper cup to its spout at installation time (singleton injection), everyone drinks from the exact same stale cup. You need a cup dispenser (@Lookup / ObjectProvider) that dispenses a new cup on every pour.",
            whatItIs: "Singleton: one instance per ApplicationContext. Prototype: a new instance created on every getBean() or injection request. Request/Session: tied to web request/session lifecycles. Because singletons are instantiated only once, their dependencies are resolved once.",
            whyItExists: "To safely manage stateful beans (prototype/request) alongside stateless services (singleton) without memory leaks or concurrency corruption.",
            codeDemo: {
              language: "java",
              code: "@Component\n@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)\npublic class TokenValidator {\n    private final UUID sessionId = UUID.randomUUID();\n    // stateful processing\n}\n\n@Service\npublic class AuthManager {\n    // Solution 1: ObjectProvider (Modern & Clean)\n    private final ObjectProvider<TokenValidator> validatorProvider;\n\n    public AuthManager(ObjectProvider<TokenValidator> validatorProvider) {\n        this.validatorProvider = validatorProvider;\n    }\n\n    public void process() {\n        TokenValidator validator = validatorProvider.getObject(); // Fresh instance!\n    }\n\n    // Solution 2: @Lookup method injection\n    // @Lookup\n    // public abstract TokenValidator getValidator();\n}"
            },
            tradeoffs: "Spring manages creation of prototype beans, but does NOT manage their destruction: `@PreDestroy` is NEVER called on prototype beans! Callers must clean up resources manually to avoid memory leaks.",
            theyMightAskNext: [
              {
                question: "How does Scoped Proxy work for web request-scoped beans?",
                answer: "Using `@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)`. Spring injects a CGLIB proxy into the singleton; when methods are called, the proxy delegates to the current thread's RequestContextHolder."
              }
            ],
            usedInProduction: "Used in multi-tenant SaaS platforms where tenant context and user authentication credentials must be isolated per HTTP request without thread pollution.",
            relatedTopics: ["sb-di-1", "sb-bean-lifecycle"]
          }
        },
        {
          id: "sb-circular-dependencies",
          question: "What causes circular dependencies in Spring Boot and how do you resolve them in Spring Boot 2.6+ / 3.x?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A circular dependency occurs when Bean A depends on Bean B, and Bean B depends on Bean A. Starting in Spring Boot 2.6, circular references are disabled by default (BeanCurrentlyInCreationException). Resolve them by architectural refactoring, using @Lazy, or event publishing.",
            mentalModel: "The chicken and the egg problem: Chicken constructor requires Egg, Egg constructor requires Chicken. The incubator cannot build either because both demand the other exist first.",
            whatItIs: "Prior to Spring Boot 2.6, setter injection resolved circular dependencies by creating uninitialized instances in a three-level cache (`singletonFactories`). From 2.6 onward, `spring.main.allow-circular-references=false` by default to enforce clean architecture.",
            whyItExists: "Circular dependencies indicate high architectural coupling and violate the Single Responsibility Principle, making systems fragile and hard to test.",
            codeDemo: {
              language: "java",
              code: "// Problem:\n@Service\npublic class OrderService {\n    public OrderService(PaymentService paymentService) { ... }\n}\n@Service\npublic class PaymentService {\n    public PaymentService(OrderService orderService) { ... } // BOOM!\n}\n\n// Solution 1: Use @Lazy (Temporary Fix)\n@Service\npublic class OrderService {\n    public OrderService(@Lazy PaymentService paymentService) {\n        this.paymentService = paymentService; // Spring injects a CGLIB proxy\n    }\n}\n\n// Solution 2: Best Practice - Extract third collaborator or use Events\n@Service\npublic class OrderService {\n    private final ApplicationEventPublisher eventPublisher;\n    public void placeOrder() {\n        eventPublisher.publishEvent(new OrderPlacedEvent(orderId));\n    }\n}"
            },
            tradeoffs: "Enabling `spring.main.allow-circular-references=true` is an anti-pattern that conceals design flaws and can cause subtle initialization bugs during startup.",
            theyMightAskNext: [
              {
                question: "How does @Lazy resolve circular dependency under the hood?",
                answer: "Spring injects a dynamic CGLIB proxy instead of the real bean. The actual bean target is only resolved and instantiated when the first method on that proxy is invoked at runtime."
              }
            ],
            usedInProduction: "Standard practice in modern microservice codebases is to treat circular dependencies as hard build failures, requiring domain redesign or event-driven decoupling.",
            relatedTopics: ["sb-di-1", "sb-spring-events-applicationlistener"]
          }
        }
      ]
    },
    {
      id: "configuration-properties",
      title: "Configuration & Externalized Properties",
      questions: [
        {
          id: "sb-value-vs-configprops",
          question: "What is the difference between @Value and @ConfigurationProperties?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "@Value is for injecting individual values using SpEL and lacks relaxed binding or validation. @ConfigurationProperties maps structured, hierarchical properties to strongly-typed POJOs/records with relaxed binding and JSR-380 validation.",
            mentalModel: "@Value is like hand-picking single apples from a basket using individual sticky notes. @ConfigurationProperties is an entire pre-packed, organized crate with compartments and quality-control inspection seals.",
            whatItIs: "@Value(\"${app.timeout:5000}\") supports property evaluation and SpEL (#{}). @ConfigurationProperties(prefix = \"app.payment\") binds grouped properties to a class/record, supporting relaxed binding (kebab-case, camelCase, snake_case) and @Validated.",
            whyItExists: "As applications grow to hundreds of configuration keys, @Value becomes scattered, error-prone, untyped, and difficult to test or validate at startup.",
            comparisonTable: {
              title: "@Value vs @ConfigurationProperties Comparison Matrix",
              headers: ["Feature / Dimension", "@Value(\"${...}\")", "@ConfigurationProperties(prefix = \"...\")"],
              rows: [
                ["Binding Target", "Individual fields, parameters, or constructor arguments", "Entire strongly typed POJO classes or Java 17+ records"],
                ["Relaxed Binding Support", "No: property key must match exactly (e.g. exact kebab-case or camelCase)", "Yes: seamlessly binds `kebab-case`, `camelCase`, `snake_case`, and uppercase ENV vars"],
                ["SpEL (Spring Expression Language)", "Supported: allows evaluation with `#{...}` and system property calculations", "Not supported: strictly binds externalized property values directly"],
                ["JSR-380 Bean Validation", "Not supported directly on injected values", "Fully supported: works with `@Validated`, `@NotNull`, `@Min`, `@Max`, `@NotBlank`"],
                ["Complex / Hierarchical Structure", "Cumbersome for maps, nested objects, and collections", "Native support for nested lists, maps, records, and deep hierarchical config trees"],
                ["Production Best Practice", "One-off dynamic flags or SpEL expressions", "Standard for all microservice configurations, database pools, and external API credentials"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Recommended: Java 17 Record with @ConfigurationProperties\n@ConfigurationProperties(prefix = \"app.payment\")\n@Validated\npublic record PaymentProperties(\n    @NotBlank String gatewayUrl,\n    @Min(100) @Max(10000) int timeoutMs,\n    RetryConfig retry\n) {\n    public record RetryConfig(int maxAttempts, Duration backoff) {}\n}\n\n// Enable in @Configuration or main class:\n// @EnableConfigurationProperties(PaymentProperties.class)\n\n# Matches any of these in application.yml:\n# app.payment.gateway-url, app.payment.gatewayUrl, APP_PAYMENT_GATEWAYURL"
            },
            tradeoffs: "@Value supports SpEL expressions (e.g., `#{systemProperties['user.home']}`), which @ConfigurationProperties does not. Use @Value only for dynamic SpEL expressions.",
            theyMightAskNext: [
              {
                question: "What is relaxed binding in Spring Boot?",
                answer: "Spring Boot matches property names regardless of casing style: `my-prop`, `myProp`, `my_prop`, and `MY_PROP` all bind seamlessly to the same Java field `myProp`."
              }
            ],
            usedInProduction: "Production microservices at Netflix and Uber encapsulate all connection, retry, and credential settings into @ConfigurationProperties classes with startup validation.",
            relatedTopics: ["sb-profiles-external-config", "sb-bean-validation"]
          }
        },
        {
          id: "sb-profiles-external-config",
          question: "How do Spring Profiles work and what is the exact configuration property loading precedence?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring Profiles segregate configuration per environment (dev, stage, prod). Spring Boot evaluates external configuration from over 17 sources; command-line arguments and OS environment variables override application.properties.",
            mentalModel: "Think of an inheritance cascade or layers of clothing: your base thermal shirt (application.yml) is worn first, followed by your winter jacket (profile-specific yml), and an umbrella on top (command-line argument) that shields everything below it.",
            whatItIs: "Profiles can be activated via `spring.profiles.active=prod` or JVM argument `-Dspring.profiles.active=prod`. The top precedence order (highest to lowest) is:\n1. Command-line arguments (`--server.port=9090`)\n2. Spring Boot DevTools global settings\n3. OS environment variables (`SERVER_PORT=9090`)\n4. Java System properties (`-Dserver.port=9090`)\n5. Profile-specific files outside JAR (`config/application-prod.yml`)\n6. Profile-specific files packaged inside JAR\n7. Default `application.yml` inside JAR.",
            whyItExists: "Allows identical build artifacts (Docker images) to be deployed across Dev, Test, Staging, and Production environments, dynamically tuned via Kubernetes ConfigMaps and environment variables.",
            codeDemo: {
              language: "yaml",
              code: "# application.yml (Base / Defaults)\napp:\n  name: OrderService\n  feature-flag: false\n\n---\n# Profile definition in same file (or application-prod.yml)\nspring:\n  config:\n    activate:\n      on-profile: prod\napp:\n  feature-flag: true\n\n// Java usage:\n@Service\n@Profile(\"prod\")\npublic class ProductionReportGenerator implements ReportGenerator { ... }"
            },
            tradeoffs: "In Spring Boot 2.4+, `spring.profiles.include` was replaced with `spring.config.import` and profile groups (`spring.profiles.group.prod=proddb,prodmetrics`), which changes how multi-document YAML files are parsed.",
            theyMightAskNext: [
              {
                question: "How do you map OS environment variables with periods in Spring Boot?",
                answer: "Replace dots (`.`) and hyphens (`-`) with underscores (`_`) and convert to uppercase. E.g., `spring.datasource.url` becomes `SPRING_DATASOURCE_URL`."
              }
            ],
            usedInProduction: "Standard Kubernetes container deployment: base configuration in JAR, overridden by ConfigMap mounted as environment variables, with secrets mounted via HashiCorp Vault.",
            relatedTopics: ["sb-value-vs-configprops", "sb-yaml-vs-properties"]
          }
        },
        {
          id: "sb-yaml-vs-properties",
          question: "What are the key differences between application.properties and application.yml in Spring Boot?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "YAML provides hierarchical, readable indentation, multi-profile documents (`---`), and native list support without repeating key prefixes, whereas .properties uses flat key-value pairs. @PropertySource cannot load YAML files by default.",
            mentalModel: "Properties is like writing repetitive full postal addresses on every single envelope. YAML is like an organized folder tree with subfolders where you only declare the parent directory once.",
            whatItIs: "Spring Boot uses SnakeYAML library to parse .yml/.yaml files. If both application.properties and application.yml exist in the same directory, `application.properties` takes precedence.",
            whyItExists: "YAML significantly reduces visual repetition for complex, deeply nested configurations like security filter chains or cloud gateways.",
            comparisonTable: {
              title: "application.properties vs application.yml Comparison Matrix",
              headers: ["Feature / Dimension", "application.properties", "application.yml / application.yaml"],
              rows: [
                ["Syntax & Readability", "Flat key-value lines with repetitive prefixes (`app.datasource.pool...`)", "Hierarchical tree structure using 2-space indentation (clean and concise)"],
                ["List / Collection Support", "Indexed brackets: `server.nodes[0]=1.1.1.1`, `server.nodes[1]=2.2.2.2`", "Native YAML bullet lists (`- 1.1.1.1\\n- 2.2.2.2`)"],
                ["Multi-Profile Documents", "Requires separate files: `application-dev.properties`, `application-prod.properties`", "Supports single-file multi-profiles using `---` document separators"],
                ["Loading Precedence", "Takes higher precedence when both files exist in the same location", "Lower precedence than .properties in identical locations"],
                ["@PropertySource Compatibility", "Supported natively out-of-the-box", "Not supported by default; requires custom `YamlPropertySourceFactory`"],
                ["Syntax Sensitivity", "Not indentation sensitive; whitespace errors rare", "Strictly whitespace- and indentation-sensitive; tabs cause boot failure"]
              ]
            },
            codeDemo: {
              language: "yaml",
              code: "# application.yml - Clean hierarchy & lists\nspring:\n  datasource:\n    url: jdbc:postgresql://localhost:5432/orders\n    hikari:\n      maximum-pool-size: 20\n  kafka:\n    bootstrap-servers:\n      - 10.0.0.1:9092\n      - 10.0.0.2:9092\n\n# Equivalent application.properties:\n# spring.datasource.url=jdbc:postgresql://localhost:5432/orders\n# spring.datasource.hikari.maximum-pool-size=20\n# spring.kafka.bootstrap-servers[0]=10.0.0.1:9092\n# spring.kafka.bootstrap-servers[1]=10.0.0.2:9092"
            },
            tradeoffs: "YAML is indentation-sensitive; a single whitespace error can break boot parsing. Also, `@PropertySource` on `@Configuration` classes does not load YAML out of the box without a custom `PropertySourceFactory`.",
            theyMightAskNext: [
              {
                question: "How can you make @PropertySource work with YAML?",
                answer: "Implement a custom `PropertySourceFactory` that parses the YAML resource using `YamlPropertiesFactoryBean` and pass it to `@PropertySource(value = \"custom.yml\", factory = YamlPropertySourceFactory.class)`."
              }
            ],
            usedInProduction: "Over 85% of modern microservice projects prefer YAML for main configs due to clean readability in Git diffs.",
            relatedTopics: ["sb-profiles-external-config", "sb-value-vs-configprops"]
          }
        },
        {
          id: "sb-commandline-runner",
          question: "What is the difference between CommandLineRunner, ApplicationRunner, and @EventListener(ApplicationReadyEvent)?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "All three run startup code after the context is refreshed. CommandLineRunner passes raw `String[] args`, ApplicationRunner provides parsed `ApplicationArguments` with option/non-option flags, and ApplicationReadyEvent triggers after all runners have finished.",
            mentalModel: "Think of plane takeoff: ApplicationContext initialization is checking instruments; CommandLineRunner / ApplicationRunner is the taxiing phase on the runway; ApplicationReadyEvent is the 'fasten seatbelt sign turns off' announcement indicating full cruising altitude.",
            whatItIs: "Runners execute just before `SpringApplication.run()` completes. Multiple runners can be ordered using `@Order(1)`. `ApplicationReadyEvent` is published by SpringApplication after all runners have successfully executed and the web server is ready to accept HTTP traffic.",
            whyItExists: "For executing database seeders, warm-up caches, or sending startup notification pings without risking incomplete bean wiring.",
            comparisonTable: {
              title: "CommandLineRunner vs ApplicationRunner vs ApplicationReadyEvent",
              headers: ["Startup Mechanism", "Execution Phase", "Argument Handling Format", "Ordering Support", "Typical Production Use Case"],
              rows: [
                ["CommandLineRunner", "Just before SpringApplication.run() finishes", "Raw unparsed `String[] args`", "@Order or Ordered interface", "Simple CLI utilities, legacy argument parsing, quick cache warmups"],
                ["ApplicationRunner", "Just before SpringApplication.run() finishes", "Parsed `ApplicationArguments` (`getOptionValues(\"key\")`, non-options)", "@Order or Ordered interface", "Advanced startup tasks reading CLI flags (`--seed=true`), database migrations"],
                ["@EventListener(ApplicationReadyEvent)", "After all Runners have completed and HTTP port is bound", "Spring Event object (`ApplicationReadyEvent`)", "@Order on event listener methods", "Sending operational ready heartbeats, notifying service mesh/Eureka, starting async queues"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "@Component\n@Order(1)\npublic class DataSeeder implements ApplicationRunner {\n    @Override\n    public void run(ApplicationArguments args) throws Exception {\n        // Parsed access: --env=staging\n        if (args.containsOption(\"seed\")) {\n            List<String> values = args.getOptionValues(\"seed\");\n            // run seeding\n        }\n    }\n}\n\n@Component\npublic class StartupAlertListener {\n    @EventListener(ApplicationReadyEvent.class)\n    public void onReady() {\n        System.out.println(\"Application is 100% ready for incoming traffic!\");\n    }\n}"
            },
            tradeoffs: "Long-running or blocking tasks inside runners delay the application from opening its HTTP port, which will cause Kubernetes readiness/startup probes to fail and restart the pod.",
            theyMightAskNext: [
              {
                question: "What happens if an unhandled exception is thrown inside a CommandLineRunner?",
                answer: "It aborts application startup, closes the ApplicationContext, and exits the JVM process with a non-zero exit code."
              }
            ],
            usedInProduction: "Used to warm up Redis caches and verify essential database connectivity before opening the container to load balancer traffic.",
            relatedTopics: ["sb-bean-lifecycle", "sb-kubernetes-probes"]
          }
        },
        {
          id: "sb-bean-lifecycle",
          question: "Can you detail the complete Spring Bean Lifecycle phases from instantiation to destruction?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The lifecycle involves: 1. Instantiation → 2. Populate Properties → 3. Aware Interfaces (`BeanNameAware`, `ApplicationContextAware`) → 4. `BeanPostProcessor.postProcessBeforeInitialization` → 5. `@PostConstruct` / `InitializingBean.afterPropertiesSet()` / custom initMethod → 6. `BeanPostProcessor.postProcessAfterInitialization` (AOP proxies created here) → 7. Bean Ready → 8. `@PreDestroy` / `DisposableBean.destroy()`.",
            mentalModel: "Think of an automotive assembly line: 1. Chassis stamped (instantiation), 2. Engine and seats installed (properties), 3. Serial number stamped (Aware), 4. Pre-inspection (BPP Before), 5. Ignition test (init), 6. Clear protective coating applied (AOP Proxy via BPP After), 7. Car driven off lot.",
            whatItIs: "The lifecycle is managed by `BeanFactory` / `ApplicationContext`. Crucially, AOP proxies (for `@Transactional`, `@Async`, `@Cacheable`, `@PreAuthorize`) are wrapped around beans during step 6 by `AbstractAutoProxyCreator`.",
            whyItExists: "Enables non-invasive enterprise services (transactions, security, telemetry, proxies) to be dynamically woven into plain Java classes without modifying business logic.",
            codeDemo: {
              language: "java",
              code: "@Component\npublic class LifecycleDemoBean implements InitializingBean, DisposableBean, BeanNameAware {\n    \n    @Override\n    public void setBeanName(String name) {\n        System.out.println(\"1. BeanNameAware: \" + name);\n    }\n\n    @PostConstruct\n    public void postConstruct() {\n        System.out.println(\"2. @PostConstruct invoked\");\n    }\n\n    @Override\n    public void afterPropertiesSet() throws Exception {\n        System.out.println(\"3. InitializingBean.afterPropertiesSet()\");\n    }\n\n    @PreDestroy\n    public void preDestroy() {\n        System.out.println(\"4. @PreDestroy invoked\");\n    }\n\n    @Override\n    public void destroy() throws Exception {\n        System.out.println(\"5. DisposableBean.destroy()\");\n    }\n}"
            },
            tradeoffs: "Calling an `@Async` or `@Transactional` method from inside `@PostConstruct` will fail to execute asynchronously or transactionally because the AOP proxy has not yet completed initialization at that point.",
            theyMightAskNext: [
              {
                question: "What is the difference between BeanPostProcessor and BeanFactoryPostProcessor?",
                answer: "BeanFactoryPostProcessor (e.g. PropertySourcesPlaceholderConfigurer) operates on bean definition metadata before any bean instances are created. BeanPostProcessor operates on bean instances after they have been instantiated."
              }
            ],
            usedInProduction: "Custom BeanPostProcessors are used by architecture teams to scan for custom company annotations, register dynamic metrics, or inject security credentials.",
            relatedTopics: ["sb-di-1", "sb-transactional-self-invocation"]
          }
        },
        {
          id: "sb-lazy-initialization",
          question: "What is Lazy Initialization in Spring Boot and what are its performance trade-offs?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Lazy initialization (`spring.main.lazy-initialization=true`) defers bean instantiation until the bean is first requested, drastically speeding up application startup at the expense of higher first-request latency and delayed error discovery.",
            mentalModel: "Think of an all-you-can-eat buffet vs an à-la-carte kitchen: Eager initialization cooks all 50 dishes before opening the doors. Lazy initialization cooks a dish only when a customer specifically orders it.",
            whatItIs: "Introduced in Spring Boot 2.2, setting `spring.main.lazy-initialization=true` marks all beans as `@Lazy` by default. Can also be applied selectively on individual beans via `@Lazy`.",
            whyItExists: "Reduces developer feedback loops in large enterprise monoliths with 2,000+ beans where startup can take over 2 minutes. In local dev, startup drops from 90s to 8s.",
            codeDemo: {
              language: "properties",
              code: "# Global lazy initialization in application.properties\nspring.main.lazy-initialization=true\n\n# Or programmatically in main class:\nSpringApplication app = new SpringApplication(MyApplication.class);\napp.setLazyInitialization(true);\napp.run(args);\n\n// Mark critical beans as eager even when global lazy is true:\n@Component\n@Lazy(false)\npublic class EssentialHealthChecker { ... }"
            },
            tradeoffs: "Trade-offs: (1) Misconfigurations, missing environment variables, or ClassNotFoundErrors are hidden at startup and crash at runtime during production user requests. (2) First request latency spikes (cold start). (3) OutOfMemoryErrors may happen unexpectedly during peak load rather than upfront.",
            theyMightAskNext: [
              {
                question: "Should you use global lazy initialization in production Kubernetes pods?",
                answer: "Generally NO. In production, fail-fast eager initialization is preferred so Kubernetes readiness probes immediately catch broken configurations before routing live user traffic."
              }
            ],
            usedInProduction: "Heavily utilized in local development profiles and CI integration test suites to cut test execution time by 60–75%.",
            relatedTopics: ["sb-profiles-external-config", "sb-graalvm-aot-native-image"]
          }
        }
      ]
    }
  ]
};
