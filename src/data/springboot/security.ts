import { Category } from "@/types";

export const springBootSecurityCategory: Category = {
  id: "sb-security",
  title: "Spring Security & Authentication",
  subTopics: [
    {
      id: "security-architecture-filters",
      title: "Security Architecture & Filter Chains",
      questions: [
        {
          id: "sb-security-architecture",
          question: "How does Spring Security work internally? Explain DelegatingFilterProxy, FilterChainProxy, and SecurityFilterChain.",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Servlet container registers `DelegatingFilterProxy`, which bridges servlet lifecycle to Spring's `FilterChainProxy` bean. `FilterChainProxy` evaluates requests against matching `SecurityFilterChain` instances, executing a series of security filters (Authentication, CSRF, Authorization).",
            mentalModel: "Think of an international airport security checkpoint: The Servlet container is the airport terminal entrance. DelegatingFilterProxy is the security line entrance. FilterChainProxy is the Chief of Security who directs you to Terminal 1 security vs Terminal 2 security (SecurityFilterChain), where you pass through metal detectors, passport scanners, and luggage inspection in order (Filters).",
            whatItIs: "Standard servlet filters are managed by the Servlet container (Tomcat) before Spring's ApplicationContext exists. `DelegatingFilterProxy` is a standard servlet filter that looks up the Spring bean `springSecurityFilterChain` (`FilterChainProxy`) in the ApplicationContext and delegates all filtering to it.",
            whyItExists: "Enables Spring-managed dependency injection, bean lifecycle, and dynamic configuration inside low-level servlet filter execution.",
            codeDemo: {
              language: "java",
              code: "// Conceptual Flow:\n// HTTP Request \n//   -> Servlet Container (Tomcat)\n//   -> DelegatingFilterProxy (in web.xml / Spring Boot AutoConfig)\n//   -> FilterChainProxy (Spring Bean: springSecurityFilterChain)\n//   -> List<SecurityFilterChain>\n//        -> SecurityContextHolderFilter\n//        -> HeaderWriterFilter\n//        -> CorsFilter\n//        -> CsrfFilter\n//        -> JwtAuthenticationFilter\n//        -> UsernamePasswordAuthenticationFilter\n//        -> ExceptionTranslationFilter\n//        -> AuthorizationFilter\n//   -> DispatcherServlet -> @RestController"
            },
            tradeoffs: "Because filters execute before DispatcherServlet, any exceptions thrown in security filters cannot be caught by `@ControllerAdvice` or `@ExceptionHandler`. They must be handled by `AuthenticationEntryPoint` or `AccessDeniedHandler`.",
            theyMightAskNext: [
              {
                question: "Can an application have multiple SecurityFilterChain beans?",
                answer: "Yes, by using `@Order(1)`, `@Order(2)` on `SecurityFilterChain` beans with distinct `securityMatcher(\"/api/**\")` patterns (e.g., stateless JWT for `/api/**` and session-based form login for `/admin/**`)."
              }
            ],
            usedInProduction: "Fundamental knowledge required for debugging why a JWT filter or CORS header was skipped or blocked before reaching Spring MVC controllers.",
            relatedTopics: ["sb-security-filter-chain-dsl", "sb-jwt-authentication-flow", "sb-cors-configuration"]
          }
        },
        {
          id: "sb-security-filter-chain-dsl",
          question: "How has Spring Security 6+ changed configuration, and why was WebSecurityConfigurerAdapter removed?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "`WebSecurityConfigurerAdapter` was deprecated in Spring Boot 2.7 and removed completely in Spring Boot 3.0 (Security 6). Modern Spring Security uses a component-based configuration exposing a `SecurityFilterChain` bean using the lambda-based DSL (`authorizeHttpRequests`, `csrf`, `cors`).",
            mentalModel: "Old way was subclassing a monolithic mega-class and overriding methods (rigid inheritance). New way is assembling lightweight LEGO bricks into a custom filter chain bean using clean lambda functional builders (composition over inheritance).",
            whatItIs: "Security 6 eliminates `authorizeRequests()` in favor of `authorizeHttpRequests()`, requires lambda DSL to prevent chaining confusion, and replaces `antMatchers()` with `requestMatchers()`.",
            whyItExists: "Encourages composition, simplifies custom filter ordering, prevents subclassing bugs, and prepares applications for GraalVM Native Image Ahead-of-Time compilation.",
            codeDemo: {
              language: "java",
              code: "@Configuration\n@EnableWebSecurity\n@EnableMethodSecurity // Replaces @EnableGlobalMethodSecurity\npublic class SecurityConfig {\n\n    @Bean\n    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {\n        return http\n            .csrf(csrf -> csrf.disable()) // Stateless API\n            .cors(Customizer.withDefaults())\n            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))\n            .authorizeHttpRequests(auth -> auth\n                .requestMatchers(\"/api/v1/auth/**\", \"/swagger-ui/**\", \"/v3/api-docs/**\").permitAll()\n                .requestMatchers(\"/api/v1/admin/**\").hasRole(\"ADMIN\")\n                .anyRequest().authenticated()\n            )\n            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)\n            .build();\n    }\n}"
            },
            tradeoffs: "Migrating from Spring Security 5 to 6 requires rewriting method chains into lambda syntax; attempting to call `.and()` is now deprecated and removed.",
            theyMightAskNext: [
              {
                question: "What replaced @EnableGlobalMethodSecurity in Spring Security 6?",
                answer: "`@EnableMethodSecurity` (prePostEnabled = true by default). It enables `@PreAuthorize`, `@PostAuthorize`, and `@PreFilter` using modern JSR-250 and Spring SpEL authorization rules."
              }
            ],
            usedInProduction: "Mandatory standard for all Spring Boot 3 enterprise services; eliminating `WebSecurityConfigurerAdapter` is step 1 in Spring Boot 3 migration roadmaps.",
            relatedTopics: ["sb-security-architecture", "sb-jwt-authentication-flow", "sb-spring-boot-3-migration"]
          }
        },
        {
          id: "sb-authentication-vs-authorization",
          question: "What is the difference between Authentication and Authorization, and how does SecurityContextHolder manage state?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Authentication verifies WHO you are (identity: username, password, JWT). Authorization determines WHAT you are allowed to do (permissions, roles: ROLE_ADMIN, read:orders). SecurityContextHolder stores the current Authentication object in a ThreadLocal by default.",
            mentalModel: "Authentication is showing your passport at the border to prove your identity. Authorization is the visa stamped inside that allows you to work, study, or only visit as a tourist.",
            whatItIs: "`SecurityContextHolder` -> `SecurityContext` -> `Authentication` (contains `Principal`, `Credentials`, `Authorities`). `SecurityContextHolder.MODE_THREADLOCAL` is the default strategy.",
            whyItExists: "Allows any service, repository, or controller to inspect the currently logged-in user and their roles without explicitly passing user objects through every method parameter.",
            comparisonTable: {
              title: "Authentication vs Authorization in Spring Security",
              headers: ["Feature / Dimension", "Authentication (AuthN)", "Authorization (AuthZ)"],
              rows: [
                ["Fundamental Question", "\"Who are you?\" (Identity verification)", "\"What are you allowed to do?\" (Permission grant)"],
                ["Mechanism / Proof", "Credentials: username/password, JWT signature, OAuth token, API key", "Authorities, Roles (`ROLE_ADMIN`, `ROLE_USER`), scopes (`read:reports`)"],
                ["Primary Component", "AuthenticationManager, AuthenticationProvider, UserDetailsService", "AuthorizationManager, SecurityFilterChain authorization rules, AccessDecisionManager"],
                ["HTTP Status Code on Failure", "401 Unauthorized (unauthenticated or invalid credentials)", "403 Forbidden (authenticated user lacks required permission)"],
                ["Spring Security Object", "Authentication (Principal, Credentials, isAuthenticated() = true)", "Collection<GrantedAuthority> (`getAuthorities()`) evaluated against security rules"],
                ["Execution Sequence", "Step 1: Executes first to establish identity", "Step 2: Executes after authentication succeeds"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Accessing currently authenticated user anywhere in the application:\nAuthentication auth = SecurityContextHolder.getContext().getAuthentication();\nif (auth != null && auth.isAuthenticated()) {\n    String username = auth.getName();\n    Collection<? extends GrantedAuthority> roles = auth.getAuthorities();\n    boolean isAdmin = roles.stream()\n        .anyMatch(r -> r.getAuthority().equals(\"ROLE_ADMIN\"));\n}\n\n// In Spring MVC Controller, inject directly:\n@GetMapping(\"/me\")\npublic UserProfile getProfile(@AuthenticationPrincipal CustomUserDetails user) {\n    return userProfileService.get(user.getId());\n}"
            },
            tradeoffs: "Because `SecurityContextHolder` uses ThreadLocal, spawning asynchronous threads (`new Thread()`, `@Async`, or parallel streams) will lose the security context unless configured with `SecurityContextHolder.MODE_INHERITABLETHREADLOCAL` or delegating task decorators.",
            theyMightAskNext: [
              {
                question: "What is the convention for Spring Security Roles vs Authorities?",
                answer: "A Role is an Authority prefixed with `ROLE_` (e.g., `ROLE_ADMIN`). Calling `.hasRole(\"ADMIN\")` automatically checks for the authority `ROLE_ADMIN`. Calling `.hasAuthority(\"READ_PRIVILEGE\")` checks the exact string."
              }
            ],
            usedInProduction: "Used everywhere to enforce multi-tenant tenancy checks and audit user actions via `SecurityContextHolder`.",
            relatedTopics: ["sb-security-architecture", "sb-method-security", "sb-async-task-executor"]
          }
        },
        {
          id: "sb-userdetailsservice-authprovider",
          question: "How do UserDetailsService, PasswordEncoder, and AuthenticationManager interact during authentication?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "`AuthenticationManager` (usually `ProviderManager`) delegates an `Authentication` token to an `AuthenticationProvider` (like `DaoAuthenticationProvider`). The provider calls `UserDetailsService.loadUserByUsername()` to fetch user credentials, and compares hashes using `PasswordEncoder.matches()`.",
            mentalModel: "Think of checking into a hotel: The front desk clerk (AuthenticationManager) sends your ID to the reservation desk (DaoAuthenticationProvider). The reservation desk looks up your file in the filing cabinet (UserDetailsService), and compares your face to the photo on file (PasswordEncoder). If matched, you get a room keycard (authenticated token).",
            whatItIs: "Core authentication pipeline. `PasswordEncoder` MUST use adaptive one-way hashing algorithms (e.g. `BCryptPasswordEncoder`, `Argon2PasswordEncoder`) with salts; never use MD5 or plain SHA-256.",
            whyItExists: "Decouples credential storage (SQL database, LDAP, Active Directory, Cognito) from authentication and password verification algorithms.",
            codeDemo: {
              language: "java",
              code: "@Service\npublic class CustomUserDetailsService implements UserDetailsService {\n    private final UserRepository userRepo;\n    public CustomUserDetailsService(UserRepository userRepo) { this.userRepo = userRepo; }\n\n    @Override\n    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {\n        User user = userRepo.findByEmail(email)\n            .orElseThrow(() -> new UsernameNotFoundException(\"User not found with email: \" + email));\n        return new org.springframework.security.core.userdetails.User(\n            user.getEmail(),\n            user.getPasswordHash(), // BCrypt hashed\n            user.getRoles().stream().map(SimpleGrantedAuthority::new).toList()\n        );\n    }\n}\n\n// PasswordEncoder Bean:\n@Bean\npublic PasswordEncoder passwordEncoder() {\n    return new BCryptPasswordEncoder(12); // Strength 12\n}"
            },
            tradeoffs: "Setting BCrypt strength too high (e.g., 16+) can cause 1,000ms+ CPU latency per login attempt, which attackers can exploit for Denial of Service (DoS) attacks by flooding login endpoints.",
            theyMightAskNext: [
              {
                question: "Why does DaoAuthenticationProvider hide UsernameNotFoundException by default?",
                answer: "To prevent User Enumeration attacks. By default, it catches `UsernameNotFoundException` and re-throws a generic `BadCredentialsException` so attackers cannot guess which emails are registered."
              }
            ],
            usedInProduction: "Standard implementation for database-backed username/password authentication in customer portals and administration dashboards.",
            relatedTopics: ["sb-security-architecture", "sb-jwt-authentication-flow"]
          }
        },
        {
          id: "sb-method-security",
          question: "How does Method Security (@PreAuthorize, @PostAuthorize, @Secured) work in Spring Boot?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Enable with `@EnableMethodSecurity`. `@PreAuthorize` evaluates a Spring Expression Language (SpEL) expression before method execution. `@PostAuthorize` executes after the method and can inspect the return object (`returnObject`). `@Secured` is a legacy role-only check without SpEL support.",
            mentalModel: "PreAuthorize is a security guard checking tickets before you enter the stadium. PostAuthorize is a receipt checker at the exit of an electronics store verifying that the item in your bag matches your receipt before letting you leave.",
            whatItIs: "Implemented via Spring AOP proxies (`MethodSecurityInterceptor` / `AuthorizationManagerBeforeMethodInterceptor`). It intercepts method invocations at the service or repository layer, evaluating user roles and dynamic entity ownership.",
            whyItExists: "URL-level security (`requestMatchers`) only checks coarse path segments. Method security allows fine-grained domain authorization (e.g. 'users can only edit orders where `order.customerId == authentication.principal.id`').",
            codeDemo: {
              language: "java",
              code: "@Service\npublic class AccountService {\n\n    // 1. Role-based check with SpEL\n    @PreAuthorize(\"hasRole('ADMIN') or hasAuthority('SCOPE_account:write')\")\n    public void freezeAccount(UUID accountId) { ... }\n\n    // 2. Fine-grained ownership check using SpEL parameters\n    @PreAuthorize(\"#customerId == authentication.principal.id or hasRole('ADMIN')\")\n    public AccountDetails getAccount(UUID customerId) { ... }\n\n    // 3. PostAuthorize: Inspect return value before returning to caller\n    @PostAuthorize(\"returnObject.ownerUsername == authentication.name\")\n    public Order getOrder(UUID orderId) {\n        return orderRepo.findById(orderId).orElseThrow();\n    }\n}"
            },
            tradeoffs: "Overusing `@PostAuthorize` with database mutations is dangerous: the database update method has ALREADY EXECUTED before `@PostAuthorize` evaluates. If authorization fails, the method throws `AccessDeniedException`, but changes may have committed unless wrapped in `@Transactional`.",
            theyMightAskNext: [
              {
                question: "What is the difference between @PreFilter and @PostFilter?",
                answer: "`@PreFilter` filters an incoming collection argument before the method runs. `@PostFilter` filters elements out of the returned collection based on a SpEL expression for each item."
              }
            ],
            usedInProduction: "Ubiquitous in multi-tenant SaaS applications to ensure users cannot view or manipulate records belonging to competing tenants (preventing Insecure Direct Object Reference / IDOR vulnerabilities).",
            relatedTopics: ["sb-authentication-vs-authorization", "sb-security-filter-chain-dsl"]
          }
        },
        {
          id: "sb-cors-csrf-protection",
          question: "What is CSRF (Cross-Site Request Forgery) and why is csrf.disable() common for stateless REST APIs?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "CSRF tricks an authenticated user's browser into executing unwanted actions on a trusted site by automatically transmitting browser session cookies. REST APIs using stateless JWT authentication in HTTP `Authorization: Bearer <token>` headers are immune to CSRF, so `csrf.disable()` is safe and standard.",
            mentalModel: "Think of a pre-signed check: If your bank uses signature stamps stored in your coat pocket (browser session cookies sent automatically on every visit to a website), a thief can secretly trigger payments. But if the bank requires you to recite a secret code from your smartphone app (Authorization header), no website can send it on your behalf.",
            whatItIs: "Spring Security enables CSRF protection by default using the Synchronizer Token Pattern (`CsrfFilter`). When using cookie-based session authentication, requests must submit a random token in `X-XSRF-TOKEN`.",
            whyItExists: "Protects browser-rendered web applications (Thymeleaf, JSP, traditional MVC) against forged form submissions from third-party websites.",
            codeDemo: {
              language: "java",
              code: "// 1. Stateless REST API (JWT in Authorization header) -> Disable CSRF\nhttp.csrf(csrf -> csrf.disable());\n\n// 2. Cookie-based SPA (React / Angular with session cookies) -> Enable with CookieCsrfTokenRepository\nhttp.csrf(csrf -> csrf\n    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())\n    .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())\n);"
            },
            tradeoffs: "WARNING: If your REST API stores JWTs in `HttpOnly` cookies rather than local memory or Authorization headers, you ARE vulnerable to CSRF and MUST NOT disable CSRF protection!",
            theyMightAskNext: [
              {
                question: "Which HTTP methods are checked by CsrfFilter by default?",
                answer: "State-modifying methods: POST, PUT, DELETE, and PATCH. Safe idempotent methods (GET, HEAD, OPTIONS, TRACE) are not checked."
              }
            ],
            usedInProduction: "Standard pattern in all mobile and SPA backend microservices using Bearer JWT authentication.",
            relatedTopics: ["sb-jwt-authentication-flow", "sb-cors-configuration"]
          }
        }
      ]
    },
    {
      id: "jwt-oauth2-microservices",
      title: "JWT, OAuth2 & Microservices Security",
      questions: [
        {
          id: "sb-jwt-authentication-flow",
          question: "How do you design a complete stateless JWT Authentication Filter in Spring Boot?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Create a `JwtAuthenticationFilter` extending `OncePerRequestFilter`. 1. Extract `Authorization: Bearer <token>` header, 2. Validate token signature and expiration with JJWT, 3. Extract claims (username, roles), 4. Construct `UsernamePasswordAuthenticationToken`, 5. Set it in `SecurityContextHolder.getContext().setAuthentication(auth)`.",
            mentalModel: "Like an electronic wristband at a music festival: security checks your ID once at the gate and clamps the encrypted digital wristband on your arm (JWT). At every stage or VIP lounge, the guard merely scans the wristband's digital cryptographic signature without looking up the central server database.",
            whatItIs: "Stateless authentication: the server stores no session state in memory (zero `HttpSession`). Scalable horizontally across thousands of microservices because any service holding the public key / secret can verify the token independently.",
            whyItExists: "Session replication across distributed Kubernetes pods requires sticky sessions or shared Redis clusters. JWT eliminates session storage entirely.",
            codeDemo: {
              language: "java",
              code: "@Component\npublic class JwtAuthenticationFilter extends OncePerRequestFilter {\n    private final JwtService jwtService;\n    private final UserDetailsService userDetailsService;\n\n    @Override\n    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)\n            throws ServletException, IOException {\n        final String authHeader = request.getHeader(\"Authorization\");\n        if (authHeader == null || !authHeader.startsWith(\"Bearer \")) {\n            filterChain.doFilter(request, response);\n            return;\n        }\n\n        final String jwt = authHeader.substring(7);\n        final String username = jwtService.extractUsername(jwt);\n\n        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {\n            UserDetails userDetails = userDetailsService.loadUserByUsername(username);\n            if (jwtService.isTokenValid(jwt, userDetails)) {\n                var authToken = new UsernamePasswordAuthenticationToken(\n                    userDetails, null, userDetails.getAuthorities());\n                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));\n                SecurityContextHolder.getContext().setAuthentication(authToken);\n            }\n        }\n        filterChain.doFilter(request, response);\n    }\n}"
            },
            tradeoffs: "Revocation problem: Once issued, a JWT is valid until it expires. You cannot immediately invalidate a compromised token without maintaining an in-memory or Redis-based token blacklist (which partially undermines statelessness). Use short expiration times (15 mins) and refresh tokens.",
            theyMightAskNext: [
              {
                question: "What is the difference between Access Tokens and Refresh Tokens?",
                answer: "Access tokens are short-lived (10–15 min) and passed on every API call. Refresh tokens are long-lived (7–30 days), stored securely in a database, and used solely to obtain a new access token without re-entering credentials."
              }
            ],
            usedInProduction: "Standard authentication architecture across Netflix, Spotify, and Uber for client-to-service communication.",
            relatedTopics: ["sb-security-filter-chain-dsl", "sb-oauth2-resource-server"]
          }
        },
        {
          id: "sb-oauth2-resource-server",
          question: "How do you configure Spring Boot as an OAuth2 Resource Server with JWT verification?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Add `spring-boot-starter-oauth2-resource-server`, set `spring.security.oauth2.resourceserver.jwt.issuer-uri` to your Identity Provider (Keycloak, Okta, Auth0), and configure `.oauth2ResourceServer(oauth2 -> oauth2.jwt(...))` in your `SecurityFilterChain`.",
            mentalModel: "Think of an airport lounge that accepts Amex Platinum cards: the lounge doesn't issue cards or hold user passwords; it checks the cryptographic signature of the card against American Express's public certificate (JWKS URL) to grant entry.",
            whatItIs: "An OAuth2 Resource Server hosts protected resources and accepts Bearer tokens issued by an external Authorization Server. Spring Boot automatically downloads public keys from the provider's `/.well-known/jwks.json` endpoint to verify token integrity.",
            whyItExists: "Separates identity management (SSO, MFA, password resets, social login) from business microservices.",
            codeDemo: {
              language: "properties",
              code: "# application.yml\nspring:\n  security:\n    oauth2:\n      resourceserver:\n        jwt:\n          issuer-uri: https://auth.revizo.com/realms/production\n          # Or directly: jwk-set-uri: https://auth.revizo.com/realms/production/protocol/openid-connect/certs\n\n// Java SecurityFilterChain:\n@Bean\npublic SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {\n    return http\n        .authorizeHttpRequests(auth -> auth\n            .requestMatchers(\"/public/**\").permitAll()\n            .requestMatchers(\"/orders/**\").hasAuthority(\"SCOPE_orders:read\")\n            .anyRequest().authenticated()\n        )\n        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))\n        .build();\n}"
            },
            tradeoffs: "Keycloak/Auth0 JWTs store roles in custom claims (`realm_access.roles`). You must configure a custom `JwtAuthenticationConverter` to map nested JSON claims into Spring `GrantedAuthority` objects.",
            theyMightAskNext: [
              {
                question: "What is a JWKS endpoint?",
                answer: "JSON Web Key Set (JWKS) is an endpoint hosted by the authorization server exposing public RSA/EC cryptographic keys used by resource servers to verify token signatures without sharing secrets."
              }
            ],
            usedInProduction: "Standard enterprise microservice architecture where Keycloak, Okta, or AWS Cognito manages identities and Spring Boot services act purely as resource servers.",
            relatedTopics: ["sb-jwt-authentication-flow", "sb-security-filter-chain-dsl"]
          }
        },
        {
          id: "sb-oauth2-client-login",
          question: "What is OAuth2 Authorization Code Grant with PKCE and how does Spring Boot implement it?",
          difficulty: "Advanced",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Authorization Code Grant with PKCE (Proof Key for Code Exchange) is the most secure OAuth2 flow for web and mobile clients. The client redirects to the authorization server with a `code_challenge`; upon approval, an authorization code is returned and exchanged for tokens using the secret `code_verifier`.",
            mentalModel: "Like picking up a registered package: you generate a secret password and send its encrypted hash to the post office. When your courier picks up the package, they must state the original secret password to prove they are authorized by you.",
            whatItIs: "PKCE prevents authorization code interception attacks. In Spring Boot, adding `spring-boot-starter-oauth2-client` provides `.oauth2Login()` which handles authorization redirects, callback handling, token exchange, and user profile population automatically.",
            whyItExists: "Replaces deprecated Implicit Grant and Resource Owner Password Credentials (ROPC) grants that leaked access tokens in browser URLs or exposed user passwords to clients.",
            codeDemo: {
              language: "properties",
              code: "# application.yml - Social Login with GitHub & Google\nspring:\n  security:\n    oauth2:\n      client:\n        registration:\n          github:\n            client-id: ${GITHUB_CLIENT_ID}\n            client-secret: ${GITHUB_CLIENT_SECRET}\n            scope: read:user,user:email\n\n// Java SecurityFilterChain:\n@Bean\npublic SecurityFilterChain clientFilterChain(HttpSecurity http) throws Exception {\n    return http\n        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())\n        .oauth2Login(Customizer.withDefaults()) // Enables auto redirect & callback handling\n        .build();\n}"
            },
            tradeoffs: "Managing session state across client-side single page apps (Next.js/React) and Spring Boot OAuth2 client requires handling cross-site cookies, SameSite attributes, and session replication.",
            theyMightAskNext: [
              {
                question: "What is the difference between OAuth2 and OpenID Connect (OIDC)?",
                answer: "OAuth2 is for AUTHORIZATION (accessing API resources via access token). OIDC is an identity layer built ON TOP OF OAuth2 for AUTHENTICATION (verifying identity via ID token)."
              }
            ],
            usedInProduction: "Used for 'Login with Google / GitHub / Microsoft' and enterprise corporate single-sign-on (SSO) portals.",
            relatedTopics: ["sb-oauth2-resource-server", "sb-session-management-stateless"]
          }
        },
        {
          id: "sb-session-management-stateless",
          question: "What are the 4 SessionCreationPolicy modes in Spring Security and when should you use each?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "1. STATELESS (Spring Security never creates or uses an HttpSession; mandatory for JWT APIs), 2. IF_REQUIRED (creates session only when needed; default), 3. ALWAYS (always creates session if one doesn't exist), 4. NEVER (never creates session, but will use one if it already exists).",
            mentalModel: "STATELESS is like paying with cash at a convenience store: zero records kept, no customer account created. IF_REQUIRED is like opening a tab at a bar only when you order a second drink.",
            whatItIs: "Configured via `http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`. In STATELESS mode, the `SecurityContextRepository` does not store `SecurityContext` in the HTTP session between requests.",
            whyItExists: "Prevents memory bloat and allows distributed microservice pods to scale horizontally without session synchronization bottlenecks.",
            codeDemo: {
              language: "java",
              code: "@Bean\npublic SecurityFilterChain filterChain(HttpSecurity http) throws Exception {\n    return http\n        // Mandatory for REST APIs using Bearer JWT:\n        .sessionManagement(session -> session\n            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)\n        )\n        .build();\n}"
            },
            tradeoffs: "In `STATELESS` mode, every single incoming HTTP request MUST include credentials (JWT Bearer token); if a request lacks the header, it is immediately treated as anonymous.",
            theyMightAskNext: [
              {
                question: "What is Spring Session and how does it relate to SessionCreationPolicy?",
                answer: "Spring Session externalizes servlet HTTP session storage to Redis or Hazelcast, enabling session clustering for stateful applications without relying on container-specific session replication."
              }
            ],
            usedInProduction: "`STATELESS` is configured across 100% of microservice REST backends.",
            relatedTopics: ["sb-jwt-authentication-flow", "sb-security-filter-chain-dsl"]
          }
        },
        {
          id: "sb-security-exception-handling",
          question: "How do you handle 401 Unauthorized vs 403 Forbidden custom JSON responses in Spring Security?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Configure `AuthenticationEntryPoint` for 401 Unauthorized (unauthenticated user attempting access), and `AccessDeniedHandler` for 403 Forbidden (authenticated user lacking necessary permissions/roles) in the `exceptionHandling()` DSL.",
            mentalModel: "401 Unauthorized is being stopped at the nightclub entrance because you don't have an ID: 'Who are you?'. 403 Forbidden is being stopped at the VIP lounge door with your standard ID: 'I know who you are, but you are not on the VIP guest list.'",
            whatItIs: "Default Spring Security returns HTML error pages or empty bodies. Implementing custom handlers ensures clean JSON payloads (`application/json`) matching your application's error schema.",
            whyItExists: "REST API frontend clients (React/iOS/Android) need machine-readable JSON status codes and messages, not redirecting to an HTML `/login` page.",
            comparisonTable: {
              title: "401 Unauthorized vs 403 Forbidden Comparison Matrix",
              headers: ["Dimension", "401 Unauthorized", "403 Forbidden"],
              rows: [
                ["Root Cause", "Missing, expired, malformed, or invalid authentication credentials", "Valid credentials, but authenticated user lacks required roles/permissions"],
                ["Spring Handler Interface", "AuthenticationEntryPoint (`commence()`)", "AccessDeniedHandler (`handle()`)"],
                ["Trigger Condition", "Anonymous user requests protected resource (`InsufficientAuthenticationException`)", "Authenticated user accesses forbidden resource (`AccessDeniedException`)"],
                ["Client Action Required", "Re-authenticate: log in, provide valid API key, or exchange refresh token", "Do NOT re-authenticate; escalate permissions or request administrative approval"],
                ["Typical REST Response", "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"JWT token expired\"}", "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"Role ROLE_ADMIN required\"}"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "@Configuration\npublic class SecurityExceptionConfig {\n\n    @Bean\n    public AuthenticationEntryPoint customAuthEntryPoint() {\n        return (request, response, authException) -> {\n            response.setContentType(MediaType.APPLICATION_JSON_VALUE);\n            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401\n            response.getWriter().write(\"\"\"\n                {\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required to access this resource\"}\n            \"\"\");\n        };\n    }\n\n    @Bean\n    public AccessDeniedHandler customAccessDeniedHandler() {\n        return (request, response, accessDeniedException) -> {\n            response.setContentType(MediaType.APPLICATION_JSON_VALUE);\n            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403\n            response.getWriter().write(\"\"\"\n                {\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You do not have permission to access this resource\"}\n            \"\"\");\n        };\n    }\n\n    // In SecurityFilterChain:\n    // http.exceptionHandling(ex -> ex\n    //     .authenticationEntryPoint(customAuthEntryPoint())\n    //     .accessDeniedHandler(customAccessDeniedHandler())\n    // );\n}"
            },
            tradeoffs: "Ensure the handlers set `HttpServletResponse.SC_UNAUTHORIZED` (401) and `SC_FORBIDDEN` (403) explicitly so API gateways and HTTP client interceptors trigger proper token refresh or login redirects.",
            theyMightAskNext: [
              {
                question: "Can you delegate Security exceptions to @ControllerAdvice?",
                answer: "Yes, by injecting `HandlerExceptionResolver` into your `AuthenticationEntryPoint` and calling `resolver.resolveException(request, response, null, authException)`."
              }
            ],
            usedInProduction: "Standard implementation in enterprise REST APIs to maintain consistent RFC 7807 error responses across both security and business layers.",
            relatedTopics: ["sb-global-exception-handling", "sb-problem-details-rfc7807"]
          }
        }
      ]
    },
    {
      id: "security-best-practices",
      title: "Security Hardening & Best Practices",
      questions: [
        {
          id: "sb-sql-injection-xss-prevention",
          question: "How does Spring Boot prevent SQL Injection and Cross-Site Scripting (XSS) vulnerabilities?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Spring Data JPA and JDBC use parameterized queries (`PreparedStatement`) by default, rendering SQL injection impossible. Spring Security adds XSS protection headers (`Content-Security-Policy`, `X-XSS-Protection`). XSS in HTML views is mitigated by auto-escaping in template engines (Thymeleaf).",
            mentalModel: "Parameterized SQL is like a pre-molded coin slot: only legitimate currency tokens fit the slot. Raw string concatenation is opening the vending machine door and letting customers throw in stones, paper, and metal wires.",
            whatItIs: "SQL Injection occurs when untrusted input is concatenated into query strings (`\"WHERE name = '\" + input + \"'\"`). XSS occurs when malicious JavaScript is stored and reflected into other users' web browsers.",
            whyItExists: "OWASP Top 10 vulnerabilities that cause catastrophic data breaches and credential theft.",
            codeDemo: {
              language: "java",
              code: "// ❌ VULNERABLE: String concatenation in native query\n@Query(value = \"SELECT * FROM users WHERE name = '\" + userInput + \"'\", nativeQuery = true)\n\n// ✅ SECURE: Parameterized binding via Spring Data JPA\n@Query(\"SELECT u FROM User u WHERE u.name = :name\")\nOptional<User> findByNameSafe(@Param(\"name\") String name);\n\n// Spring Security Content-Security-Policy header configuration:\nhttp.headers(headers -> headers\n    .contentSecurityPolicy(csp -> csp.policyDirectives(\"default-src 'self'; script-src 'self'\"))\n    .frameOptions(frame -> frame.deny()) // Clickjacking protection\n);"
            },
            tradeoffs: "Beware of dynamic JPQL or CriteriaBuilder queries where developers accidentally concatenate strings instead of using `builder.equal(...)` or `:parameter`.",
            theyMightAskNext: [
              {
                question: "How do you sanitize user-submitted HTML in Spring Boot?",
                answer: "Use OWASP Java HTML Sanitizer library to strip dangerous `<script>` and `onload=` attributes before storing content in databases."
              }
            ],
            usedInProduction: "Enforced via automated SAST (Static Application Security Testing) tools like SonarQube, Veracode, and Snyk in continuous delivery pipelines.",
            relatedTopics: ["sb-jpa-1", "sb-derived-queries-jpql"]
          }
        },
        {
          id: "sb-secure-actuator-endpoints",
          question: "How do you securely expose and restrict Spring Boot Actuator endpoints in production?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "1. Expose only required endpoints (`management.endpoints.web.exposure.include=health,info,metrics`), 2. Move actuator to a separate internal management port (`management.server.port=8081`), 3. Secure sensitive endpoints (`/actuator/env`, `/heapdump`) with `hasRole('ADMIN')` in Spring Security.",
            mentalModel: "Think of an electrical substation: the main building door is open to employees, but the high-voltage breaker room is locked behind a separate heavy steel door with biometric badge access on a private service alley.",
            whatItIs: "Spring Boot Actuator exposes operational endpoints. Exposing `/actuator/env` or `/actuator/heapdump` publicly can reveal database passwords, encryption keys, and internal IP addresses.",
            whyItExists: "Ensures monitoring agents (Prometheus, Datadog) can scrape metrics without exposing infrastructure internals to public internet attackers.",
            codeDemo: {
              language: "properties",
              code: "# application.properties - Secure Production Actuator Setup\nmanagement.server.port=8081 # Separate port (not exposed to external load balancer)\nmanagement.endpoints.web.exposure.include=health,metrics,prometheus\nmanagement.endpoint.health.show-details=when-authorized\nmanagement.endpoint.health.roles=ACTUATOR_ADMIN\n\n// In SecurityFilterChain:\nhttp.authorizeHttpRequests(auth -> auth\n    .requestMatchers(EndpointRequest.to(\"health\", \"info\")).permitAll()\n    .requestMatchers(EndpointRequest.toAnyEndpoint()).hasRole(\"ACTUATOR_ADMIN\")\n);"
            },
            tradeoffs: "Binding Actuator to a separate port (`management.server.port`) starts a separate internal Tomcat connector, which requires configuring Kubernetes liveness/readiness probes to target that port.",
            theyMightAskNext: [
              {
                question: "What is the security risk of exposing /actuator/restart or /actuator/env?",
                answer: "Remote Code Execution (RCE) and credential leakage. Attackers can view environment variables containing AWS/database keys or reconfigure logging/datasource endpoints dynamically."
              }
            ],
            usedInProduction: "Strict requirement in every cloud deployment: management ports are bound to private VPC subnets and blocked from external ingress controllers.",
            relatedTopics: ["sb-actuator-overview", "sb-security-filter-chain-dsl"]
          }
        },
        {
          id: "sb-secrets-management-vault",
          question: "How should sensitive credentials (passwords, API keys) be managed in Spring Boot without hardcoding?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Never commit secrets to Git. Use externalized secret providers: HashiCorp Vault (`spring-cloud-starter-vault-config`), AWS Secrets Manager / Parameter Store, or Kubernetes Secrets mounted as environment variables.",
            mentalModel: "Storing passwords in `application.yml` in Git is like taping your house key to the front door. External secrets management is a bank safe-deposit box: the application presents a temporary badge at startup to retrieve its secret keys.",
            whatItIs: "Spring Boot's `PropertySource` abstraction seamlessly integrates with HashiCorp Vault and cloud secret stores to inject credentials into `@Value` or `@ConfigurationProperties` transparently.",
            whyItExists: "Prevents credential leaks in source code repositories, enables automated secret rotation, and complies with security certifications (PCI-DSS, SOC2).",
            codeDemo: {
              language: "properties",
              code: "# Option 1: Kubernetes Secrets mapped to environment variables\n# SPRING_DATASOURCE_PASSWORD is populated from secretKeyRef in Pod spec\nspring.datasource.password=${DB_PASSWORD}\n\n# Option 2: Spring Cloud Vault Config\nspring.cloud.vault.uri=https://vault.internal.company.com\nspring.cloud.vault.authentication=KUBERNETES\nspring.cloud.vault.kubernetes.role=order-service-role\nspring.config.import=vault://secret/order-service"
            },
            tradeoffs: "If the external secrets store (Vault) is unreachable during pod startup, the application context fails to refresh and the pod will crash-loop until Vault recovers.",
            theyMightAskNext: [
              {
                question: "How do you handle secret rotation without restarting Spring Boot pods?",
                answer: "Use `@RefreshScope` on beans that consume secrets and trigger `/actuator/refresh` (or rely on Spring Cloud Vault automatic background renewal leases)."
              }
            ],
            usedInProduction: "Standard corporate policy in every mature software engineering organization; Git pre-commit hooks (TruffleHog, GitGuardian) reject any commit with hardcoded credentials.",
            relatedTopics: ["sb-profiles-external-config", "sb-value-vs-configprops"]
          }
        },
        {
          id: "sb-rate-limiting-bucket4j",
          question: "How do you implement API Rate Limiting in Spring Boot using Bucket4j and Redis?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Implement a Servlet Filter or Spring Cloud Gateway filter using the Token Bucket algorithm (Bucket4j). Store token buckets in Redis for distributed clusters to throttle requests by client IP or API key, returning HTTP 429 Too Many Requests when limits are exceeded.",
            mentalModel: "Think of an arcade game dispenser: the machine drops 10 tokens into the bowl every minute (refill rate). Each game play consumes 1 token. If you mash the button 20 times in 5 seconds, the dispenser locks and tells you to wait until more tokens drop into the bowl.",
            whatItIs: "Token Bucket algorithm maintains a bucket with a maximum capacity and a refill rate. When a request arrives, it attempts to consume tokens; if empty, the request is rejected with `X-RateLimit-Retry-After-Seconds`.",
            whyItExists: "Protects microservices against DoS attacks, abusive API scrapers, and brute-force password attacks while enforcing tiered pricing (Free vs Pro tiers).",
            codeDemo: {
              language: "java",
              code: "@Component\npublic class RateLimitingFilter extends OncePerRequestFilter {\n    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();\n\n    private Bucket createNewBucket() {\n        // 100 requests per minute with burst up to 100\n        Bandwidth limit = Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1)));\n        return Bucket.builder().addLimit(limit).build();\n    }\n\n    @Override\n    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)\n            throws ServletException, IOException {\n        String apiKey = request.getHeader(\"X-API-KEY\");\n        if (apiKey == null) apiKey = request.getRemoteAddr();\n\n        Bucket bucket = buckets.computeIfAbsent(apiKey, k -> createNewBucket());\n        if (bucket.tryConsume(1)) {\n            filterChain.doFilter(request, response);\n        } else {\n            response.setStatus(429); // Too Many Requests\n            response.setHeader(\"X-Rate-Limit-Retry-After-Seconds\", \"60\");\n            response.getWriter().write(\"{\\\"error\\\": \\\"Rate limit exceeded. Please try again later.\\\"}\");\n        }\n    }\n}"
            },
            tradeoffs: "In-memory rate limiters (`ConcurrentHashMap`) do not work across multiple load-balanced pods. Production distributed systems MUST back Bucket4j with Redis (`bucket4j-redis`) to share rate limits across instances.",
            theyMightAskNext: [
              {
                question: "What is the difference between Token Bucket and Leaky Bucket algorithms?",
                answer: "Token Bucket allows traffic bursts up to bucket capacity. Leaky Bucket processes requests at a strictly constant, smoothed output rate regardless of incoming bursts."
              }
            ],
            usedInProduction: "Standard implementation for public developer APIs (Stripe, GitHub, Twilio) to enforce rate limits and prevent service degradation.",
            relatedTopics: ["sb-security-architecture", "sb-spring-cloud-gateway"]
          }
        },
        {
          id: "sb-mtls-microservices",
          question: "What is Mutual TLS (mTLS) and how is it configured in Spring Boot for zero-trust microservice communication?",
          difficulty: "Advanced",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Standard TLS only verifies the server's identity to the client. Mutual TLS (mTLS) requires BOTH the client and server to authenticate each other using X.509 digital certificates. In Spring Boot, configure `server.ssl.client-auth=need` with a truststore containing authorized client certificates.",
            mentalModel: "Standard TLS is like showing your driver's license to a bouncer (one-way). mTLS is like two undercover secret agents meeting in an alley: Agent 1 checks Agent 2's badge, and Agent 2 simultaneously inspects Agent 1's badge before either speaks a single word.",
            whatItIs: "Provides Zero Trust network security. Even if an attacker gains access to the internal Kubernetes network, they cannot spoof microservice requests without the private certificate.",
            whyItExists: "Mandatory compliance for banking (PSD2 / Open Banking), payment networks, and zero-trust cloud infrastructure.",
            codeDemo: {
              language: "properties",
              code: "# application.properties - Server mTLS Configuration\nserver.port=8443\nserver.ssl.enabled=true\nserver.ssl.key-store=classpath:keystore.p12\nserver.ssl.key-store-password=secretKeystorePassword\nserver.ssl.key-store-type=PKCS12\n\n# Mutual Authentication (Require client certificate)\nserver.ssl.client-auth=need\nserver.ssl.trust-store=classpath:truststore.p12\nserver.ssl.trust-store-password=secretTruststorePassword\nserver.ssl.trust-store-type=PKCS12"
            },
            tradeoffs: "Managing certificate lifecycles, expiration dates, and renewals across hundreds of services can be an administrative nightmare. Most modern architectures offload mTLS to service meshes like Istio or Linkerd via sidecar proxies.",
            theyMightAskNext: [
              {
                question: "What is the difference between server.ssl.client-auth=want and need?",
                answer: "`want`: the server requests a client certificate; if provided, it is validated; if not, connection proceeds. `need`: client certificate is strictly mandatory; connection is dropped if absent."
              }
            ],
            usedInProduction: "Enforced across all inter-service communication in financial core banking backbones and healthcare health-record data exchanges.",
            relatedTopics: ["sb-security-architecture", "sb-secrets-management-vault"]
          }
        }
      ]
    }
  ]
};
