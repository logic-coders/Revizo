import { Category } from "@/types";

export const java17ModulesMigrationCategory: Category = {
  id: "java17-architecture-migration",
  title: "JPMS & Enterprise Migration",
  subTopics: [
    {
      id: "java-platform-module-system",
      title: "Java Platform Module System (JPMS)",
      questions: [
        {
          id: "java-17-mod-1",
          question: "What is the Java Platform Module System (JPMS / JEP 261) and why was it introduced in Java 9?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "JPMS (Project Jigsaw) introduced modularity above the package level to modularize the massive monolithic JDK, solve 'JAR hell', provide reliable configuration, and enforce strong encapsulation.",
            mentalModel: "Upgrading from shipping thousands of loose parts in a single giant cardboard box (monolithic rt.jar) to standardized shipping containers with manifests listing exact dependencies and export permits.",
            whatItIs: "Before Java 9, the runtime was a single monolithic rt.jar (~60MB), and classpaths were flat and error-prone (JAR hell, missing class crashes at runtime). JPMS broke the JDK into ~90 modular components (java.base, java.sql, java.desktop) and introduced module-info.java to declare explicit dependencies and exports.",
            whyItExists: "Allows creating custom minimal Java runtimes, eliminates classpath shadowing bugs, and prevents access to internal non-public APIs.",
            codeDemo: {
              language: "java",
              code: "// module-info.java (declared at root of source tree)\nmodule com.enterprise.orders {\n    // 1. Explicit dependencies on other modules:\n    requires java.sql;\n    requires com.enterprise.billing;\n\n    // 2. Explicitly exported packages (visible to other modules):\n    exports com.enterprise.orders.api;\n    exports com.enterprise.orders.dto;\n\n    // Unexported packages (e.g. com.enterprise.orders.internal)\n    // are 100% INACCESSIBLE to outside code, even via public classes!\n}",
              explanation: "Only packages explicitly listed in 'exports' are accessible to consumers."
            },
            tradeoffs: "Migrating complex enterprise multi-module Maven/Gradle applications to full JPMS modules requires updating all third-party dependencies.",
            followUpQuestions: [
              {
                question: "What is the root foundational module required by all Java code?",
                answer: "java.base, which is implicitly required by all modules without needing an explicit 'requires java.base;' declaration."
              }
            ],
            usedInProduction: "Modular microservices packaging custom 30MB Docker containers using jlink.",
            relatedTopics: ["module-info.java", "Project Jigsaw", "JAR Hell"]
          }
        },
        {
          id: "java-17-mod-2",
          question: "What is module-info.java and what are its key directives (requires, exports, opens, uses, provides)?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "module-info.java defines the module descriptor with 5 primary directives: requires (depends on), exports (public access), opens (reflection access), uses (consumes service), and provides (implements service).",
            mentalModel: "A formal customs declaration form for a shipping container: listing incoming goods needed (requires), goods for sale (exports), goods open for internal inspection (opens), and service contracts (uses/provides).",
            whatItIs: "Directives: (1) requires <module>: specifies a compile-time and runtime dependency. (2) exports <package>: allows external modules to access public types in that package. (3) opens <package>: allows deep reflection (setAccessible) by frameworks like Spring/Jackson. (4) uses <serviceInterface>: declares dependency on a ServiceLoader service. (5) provides <serviceInterface> with <implementationClass>: registers a service implementation.",
            whyItExists: "Provides a declarative contract enforced by the compiler and the JVM classloader.",
            codeDemo: {
              language: "java",
              code: "open module com.enterprise.service {\n    requires java.net.http;\n    requires com.fasterxml.jackson.databind;\n\n    // Exports API package for compile-time use:\n    exports com.enterprise.service.api;\n\n    // Opens DTO package specifically to Jackson for reflection:\n    opens com.enterprise.service.dto to com.fasterxml.jackson.databind;\n\n    // ServiceLoader provider:\n    provides com.enterprise.spi.PaymentProvider \n        with com.enterprise.service.internal.StripePaymentProvider;\n}",
              explanation: "Notice 'opens ... to' restricts deep reflection strictly to the Jackson module."
            },
            tradeoffs: "Declaring an entire module 'open module' disables strong encapsulation for all packages in that module.",
            followUpQuestions: [
              {
                question: "What is the difference between 'exports' and 'opens'?",
                answer: "'exports' permits compile-time and runtime access to public types only; 'opens' permits runtime deep reflection on private members."
              }
            ],
            usedInProduction: "Spring Boot 3 applications integrating with Jackson, Hibernate, and ServiceLoader plugins.",
            relatedTopics: ["ServiceLoader", "Reflection Security", "opens to"]
          }
        },
        {
          id: "java-17-mod-3",
          question: "What is the difference between requires and requires transitive?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "requires creates a private dependency; requires transitive creates a public dependency, automatically passing that dependency downstream to any module that depends on you (implied readability).",
            mentalModel: "Subcontracting: if you hire an electrician (requires), only you interact with him. If you build a home with electrical wiring that the homeowner must inspect and operate (requires transitive), the electrician's work is part of the homeowner's direct contract.",
            whatItIs: "If Module B declares requires A, only Module B can see Module A. If Module C requires B, C CANNOT see Module A. If Module B declares requires transitive A, then any module that requires B (like Module C) automatically gains readability of Module A without needing an explicit requires A.",
            whyItExists: "Essential when a module's public API returns types belonging to another module (e.g. java.sql.Connection).",
            comparisonTable: {
              title: "requires vs requires transitive in JPMS",
              headers: ["Dimension", "requires <module>", "requires transitive <module>"],
              rows: [
                ["Readability Scope", "Private to the declaring module only", "Public / Transitive (passed down to all consumer modules)"],
                ["Implied Readability", "Consumers of your module DO NOT gain access to `<module>`", "Consumers of your module automatically gain readability to `<module>`"],
                ["Public API Types", "Used when `<module>` types are purely internal implementation details", "Mandatory when public methods in your module accept or return types from `<module>`"],
                ["Coupling Risk", "Low: encapsulating internal dependencies cleanly", "Higher: exposes third-party module as part of your public contract"],
                ["Example Scenario", "`requires org.apache.commons.lang3;` (used internally for string utils)", "`requires transitive java.sql;` (public methods return `java.sql.Connection`)"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// In module 'com.enterprise.data':\nmodule com.enterprise.data {\n    // Because DataService returns java.sql.Connection in its public methods,\n    // clients of com.enterprise.data MUST be able to see java.sql:\n    requires transitive java.sql;\n    exports com.enterprise.data.service;\n}\n\n// In module 'com.enterprise.app':\nmodule com.enterprise.app {\n    // Automatically gets access to java.sql without writing 'requires java.sql;'!\n    requires com.enterprise.data;\n}",
              explanation: "requires transitive avoids forcing downstream clients to manually declare transient dependencies."
            },
            tradeoffs: "Overusing requires transitive creates tight coupling across modular boundaries; use only when returning third-party types from public API methods.",
            followUpQuestions: [
              {
                question: "Why does java.sql use requires transitive java.xml?",
                answer: "Because java.sql.SQLXML has methods in its public interface that return types from java.xml."
              }
            ],
            usedInProduction: "Core enterprise SDKs and API gateway client libraries.",
            relatedTopics: ["Implied Readability", "Transitive Dependencies", "API Design"]
          }
        },
        {
          id: "java-17-mod-4",
          question: "What are the differences between Named Modules, Unnamed Modules, and Automatic Modules?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "Named modules have a module-info.java on the module-path; Automatic modules are traditional JARs placed on the module-path (auto-named); Unnamed modules represent all JARs on the traditional classpath.",
            mentalModel: "An international airport: Named modules are citizens with verified passports. Automatic modules are visitors with temporary travel visas. Unnamed modules are people in the domestic terminal before passport checkpoints were built.",
            whatItIs: "(1) Named Module: contains module-info.java, loaded from --module-path. Has explicit boundaries. (2) Automatic Module: standard JAR without module-info placed on --module-path; exports all packages and reads all modules. (3) Unnamed Module: all JARs on traditional -classpath; can read all modules, but named modules cannot read the unnamed module.",
            whyItExists: "Enables smooth incremental migration from legacy classpaths to modern modularity.",
            comparisonTable: {
              title: "Named vs Unnamed vs Automatic Modules Comparison",
              headers: ["Module Category", "Source / Location", "Has module-info?", "Exports Packages?", "Reads Other Modules?"],
              rows: [
                ["Named Module", "Placed on `--module-path`", "Yes (`module-info.java` present)", "Only packages listed in explicit `exports` directives", "Only modules listed in explicit `requires` directives"],
                ["Automatic Module", "Traditional JAR placed on `--module-path`", "No (auto-named from JAR or `MANIFEST.MF`)", "Exports all internal packages to all modules", "Reads all modules on `--module-path` and unnamed module"],
                ["Unnamed Module", "All JARs and classes on `-classpath`", "No (`module-info.java` ignored even if present)", "Exports all packages (accessible to classpath code)", "Reads all modules on module-path, but named modules CANNOT read it"]
              ]
            },
            codeDemo: {
              language: "bash",
              code: "# 1. Traditional Classpath (Everything lives in Unnamed Module):\njava -cp \"lib/*:app.jar\" com.corp.Main\n\n# 2. Modern Module Path (Named Modules):\njava --module-path \"mods:lib\" --module com.corp.app/com.corp.Main\n\n# 3. Mixing both (Incremental Migration):\n# Place modern modules on --module-path and legacy dependencies on -classpath",
              explanation: "Named modules and classpath code can coexist seamlessly during migration."
            },
            tradeoffs: "A named module cannot declare a dependency on an unnamed module on the classpath.",
            followUpQuestions: [
              {
                question: "How is an Automatic Module's name determined?",
                answer: "From the Automatic-Module-Name attribute in MANIFEST.MF, or derived from the JAR file name if absent."
              }
            ],
            usedInProduction: "Migrating enterprise Gradle and Maven multi-project builds to Java 17.",
            relatedTopics: ["Module Path", "Classpath", "Automatic-Module-Name"]
          }
        },
        {
          id: "java-17-mod-5",
          question: "What is the jdeps tool and how do you analyze module dependencies and internal API usage?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-10-05",
          answer: {
            quickAnswer: "jdeps is a static bytecode analysis tool bundled with the JDK that scans JAR files to discover package/module dependencies and flags illegal usage of internal JDK APIs.",
            mentalModel: "An automated X-ray security scanner for your JAR files: scans every class and prints a detailed report of all dependencies and warning violations before deploying to production.",
            whatItIs: "Running jdeps reveals: (1) Which JDK modules your application depends on (e.g. java.base, java.sql). (2) Uses of encapsulated internal APIs (like sun.misc.Unsafe) with suggested replacements. (3) Generates module-info.java templates automatically via --generate-module-info.",
            whyItExists: "The primary tool used by architects to prepare Java 8/11 applications for migration to Java 17.",
            codeDemo: {
              language: "bash",
              code: "# 1. Scan application for illegal internal JDK API usage:\njdeps --jdk-internals target/myapp.jar\n\n# Example Output:\n# myapp.jar -> jdk.unsupported\n#    com.corp.Cache -> sun.misc.Unsafe   JDK internal API (suggest replacement: VarHandle)\n\n# 2. Analyze which JDK modules your JAR depends on:\njdeps -s target/myapp.jar\n# Output:\n# myapp.jar -> java.base\n# myapp.jar -> java.sql\n# myapp.jar -> java.net.http\n\n# 3. Auto-generate module-info.java stub:\njdeps --generate-module-info output_dir target/myapp.jar",
              explanation: "jdeps identifies internal API violations and suggests modern replacements like VarHandle."
            },
            tradeoffs: "jdeps performs static analysis only; dynamic reflection calls (Class.forName) will not be detected by jdeps.",
            followUpQuestions: [
              {
                question: "What flag in jdeps shows only summary dependencies?",
                answer: "-s or --summary."
              }
            ],
            usedInProduction: "CI/CD build pipelines validating that pull requests do not introduce encapsulated internal API calls.",
            relatedTopics: ["jdeps", "Static Analysis", "JDK Internals"]
          }
        },
        {
          id: "java-17-mod-6",
          question: "What is jlink and how does it create ultra-small custom minimal Java runtime images for Docker?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-06",
          answer: {
            quickAnswer: "jlink strips away all unused JDK modules to assemble a tailored, minimal custom JRE (as small as 30MB) specifically for your application, dramatically shrinking Docker container sizes.",
            mentalModel: "Packing a customized survival backpack: instead of hauling an entire 500-pound tool shed on your hiking trip, you pack only the exact 3 tools your application actually needs.",
            whatItIs: "The full JDK/JRE is ~300MB–500MB because it includes AWT, Swing, CORBA, and management tools. jlink links your application's modular dependencies with only the specific JDK modules required (e.g. java.base, java.net.http, java.sql). It strips debug symbols, compresses bytecode, and generates a standalone executable runtime image containing its own java binary.",
            whyItExists: "Reduces container image download times, cold-start latency, memory footprint, and attack surface in Kubernetes.",
            codeDemo: {
              language: "bash",
              code: "# Step 1: Discover required modules using jdeps:\n# Result: java.base,java.sql,java.net.http\n\n# Step 2: Use jlink to generate custom minimal JRE:\njlink --module-path $JAVA_HOME/jmods \\\n      --add-modules java.base,java.sql,java.net.http \\\n      --strip-debug \\\n      --compress 2 \\\n      --no-header-files \\\n      --no-man-pages \\\n      --output /custom-jre\n\n# Step 3: Inspect resulting JRE size:\ndu -sh /custom-jre\n# Size: ~35MB! (Compared to 350MB standard OpenJDK)",
              explanation: "jlink builds a production runtime containing only the modules your app actually executes."
            },
            tradeoffs: "Requires application and dependencies to be modular or well-mapped with explicit JDK module dependencies.",
            followUpQuestions: [
              {
                question: "Can jlink create a custom runtime for non-modular applications?",
                answer: "Yes, by packaging only the required JDK platform modules into the custom JRE and running the non-modular app on its classpath."
              }
            ],
            usedInProduction: "Multi-stage Dockerfiles building ultra-compact Alpine/Distroless microservice images.",
            relatedTopics: ["jlink", "Docker Optimization", "Distroless"]
          }
        }
      ]
    },
    {
      id: "migration-from-java8-11",
      title: "Enterprise Migration to Java 17",
      questions: [
        {
          id: "java-17-mig-1",
          question: "What are the mandatory prerequisites for upgrading to Spring Boot 3.x (Java 17 baseline & Jakarta EE 9+)?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "Spring Boot 3.x requires Java 17 as the minimum baseline and upgrades from Java EE (javax.*) to Jakarta EE 9/10 (jakarta.*), requiring all package imports to be migrated.",
            mentalModel: "A mandatory nationwide currency change: all old paper bills (javax.*) must be exchanged at the bank for new digital currency (jakarta.*); vending machines (Spring Boot 3) will reject the old bills immediately.",
            whatItIs: "Oracle transferred Java EE to the Eclipse Foundation, which rebranded it as Jakarta EE. Due to trademark agreements, package names changed from javax.servlet.*, javax.persistence.*, javax.validation.* to jakarta.servlet.*, jakarta.persistence.*, jakarta.validation.*. Spring Boot 3 completely dropped support for Java 8 and 11, setting Java 17 LTS as the strict minimum requirement.",
            whyItExists: "Enables Spring Boot 3 to leverage modern Java 17 features (Records, Sealed Classes, Pattern Matching, GraalVM Native Images).",
            codeDemo: {
              language: "java",
              code: "// BEFORE Spring Boot 3 (Java 8/11 with javax):\nimport javax.servlet.http.HttpServletRequest; // FAILS in Spring Boot 3!\nimport javax.persistence.Entity;             // FAILS in Spring Boot 3!\nimport javax.validation.constraints.NotNull; // FAILS in Spring Boot 3!\n\n// AFTER Spring Boot 3 (Java 17 with jakarta):\nimport jakarta.servlet.http.HttpServletRequest;\nimport jakarta.persistence.Entity;\nimport jakarta.validation.constraints.NotNull;\n\n// pom.xml minimum compiler target:\n// <properties>\n//     <java.version>17</java.version>\n// </properties>",
              explanation: "All JPA entities, Servlet filters, and bean validations must be migrated from javax to jakarta."
            },
            tradeoffs: "Third-party libraries that still depend on javax.* must be updated to their Jakarta-compatible versions (e.g. Hibernate 6, Tomcat 10).",
            followUpQuestions: [
              {
                question: "Did javax.crypto or javax.sql change to jakarta?",
                answer: "No! Packages belonging to Java SE (standard library) like javax.crypto, javax.sql, and javax.net remained in javax; only Java EE enterprise packages changed to jakarta."
              }
            ],
            usedInProduction: "The central migration milestone for all enterprise Spring Boot services transitioning in 2024–2026.",
            relatedTopics: ["Spring Boot 3", "Jakarta EE", "Hibernate 6"]
          }
        },
        {
          id: "java-17-mig-2",
          question: "What happened to the Java EE modules (javax.xml.bind / JAXB, JAX-WS, CORBA) in Java 11/17?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "Java EE and CORBA modules (like JAXB) were deprecated in Java 9 and completely removed from the JDK in Java 11; applications must add explicit third-party Maven/Gradle dependencies to compile on Java 17.",
            mentalModel: "The JDK trimmed its oversized luggage: XML serialization and antique CORBA tools were evicted from the standard carry-on bag, but you can still download them as optional cargo if needed.",
            whatItIs: "In Java 8, java.xml.bind (JAXB), java.xml.ws (JAX-WS), and javax.activation were bundled inside rt.jar. In Java 11, they were purged entirely (JEP 320). When migrating Java 8 apps to Java 17, code referencing JAXB fails to compile with 'package javax.xml.bind does not exist' unless explicit dependencies are added to pom.xml/build.gradle.",
            whyItExists: "Lightens the JDK footprint and decouples enterprise XML/SOAP tooling from the core language runtime.",
            codeDemo: {
              language: "xml",
              code: "<!-- Required in pom.xml when migrating Java 8 apps to Java 17 -->\n<dependency>\n    <groupId>jakarta.xml.bind</groupId>\n    <artifactId>jakarta.xml.bind-api</artifactId>\n    <version>4.0.0</version>\n</dependency>\n<dependency>\n    <groupId>org.glassfish.jaxb</groupId>\n    <artifactId>jaxb-runtime</artifactId>\n    <version>4.0.0</version>\n</dependency>",
              explanation: "Explicitly declaring JAXB dependencies restores XML parsing on Java 17."
            },
            tradeoffs: "Failing to add the runtime implementation (jaxb-runtime) results in ClassNotFoundException at runtime.",
            followUpQuestions: [
              {
                question: "What tool automates package migration from javax to jakarta?",
                answer: "OpenRewrite (org.openrewrite.recipe:rewrite-spring) provides automated recipes that rewrite imports across entire repositories."
              }
            ],
            usedInProduction: "Migrating legacy SOAP clients, XML data binding pipelines, and insurance banking systems.",
            relatedTopics: ["JAXB", "JEP 320", "OpenRewrite"]
          }
        },
        {
          id: "java-17-mig-3",
          question: "How do you resolve common reflection and proxy errors when upgrading to Java 17 (Lombok, Mockito, ByteBuddy, CGLIB)?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "Update tool versions to Java 17-compatible releases (Lombok 1.18.22+, Mockito 4+, ByteBuddy 1.12+), or temporarily pass --add-opens flags to the JVM to permit deep reflection.",
            mentalModel: "Upgrading your building's electronic locks: old key fobs from 2014 stop working. You must issue new NFC keycards (upgrade library versions) or leave an emergency maintenance master key turned in the lock (--add-opens).",
            whatItIs: "Lombok manipulates internal javac ASTs; Mockito and Hibernate use CGLIB/ByteBuddy to generate dynamic proxies using private reflection. In Java 17, Strong Encapsulation (JEP 403) blocks these reflection tricks with InaccessibleObjectException. Upgrading to modern library versions switches them to modern MethodHandles and clean bytecode generation.",
            whyItExists: "Prevents mysterious build failures during Maven/Gradle compile cycles when adopting Java 17.",
            codeDemo: {
              language: "xml",
              code: "<!-- Upgrade Lombok in pom.xml to Java 17 compatible version -->\n<dependency>\n    <groupId>org.projectlombok</groupId>\n    <artifactId>lombok</artifactId>\n    <version>1.18.30</version> <!-- Java 17 compatible -->\n    <scope>provided</scope>\n</dependency>\n\n<!-- Upgrade Mockito to modern inline mock maker -->\n<dependency>\n    <groupId>org.mockito</groupId>\n    <artifactId>mockito-core</artifactId>\n    <version>5.5.0</version>\n    <scope>test</scope>\n</dependency>",
              explanation: "Modern library versions are designed to work within Java 17 module encapsulation rules."
            },
            tradeoffs: "Avoid relying permanently on --add-opens flags in production; treat them as temporary stepping stones.",
            followUpQuestions: [
              {
                question: "Why did older versions of Mockito fail to mock classes in Java 17?",
                answer: "Older Mockito used CGLIB subclassing, which failed to reflect on private classes; Mockito 5 switched to the ByteBuddy inline mock maker."
              }
            ],
            usedInProduction: "Standard build-engineering upgrade steps across large enterprise CI/CD Jenkins/GitHub Actions pipelines.",
            relatedTopics: ["Lombok", "Mockito", "ByteBuddy"]
          }
        },
        {
          id: "java-17-mig-4",
          question: "What changes were made to memory flags and defaults between Java 8 and Java 17 (e.g. PermGen vs Metaspace, GC defaults)?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "Java 8 used Parallel GC and PermGen was already replaced with Metaspace; Java 17 defaults to G1 GC, enforces unified logging (-Xlog), removes CMS flags, and features container-aware cgroup v2 memory limits.",
            mentalModel: "Trading in a 2014 car for a 2022 model: the dashboard controls are digital (-Xlog), the cruise control is smarter (G1 GC), and the engine automatically detects container gas tank limits (cgroup v2).",
            whatItIs: "Key shifts: (1) Default GC changed from Parallel GC (Java 8) to G1 GC. (2) Unified GC logging: -Xlog:gc* replaces -XX:+PrintGCDetails. (3) Container awareness: Java 17 natively respects Docker/K8s cgroup v1 & v2 CPU/memory limits (-XX:+UseContainerSupport is default). (4) Compact Strings: Java 9+ stores Latin-1 strings in byte[] instead of char[], cutting string memory usage by ~50%.",
            whyItExists: "Optimizes the JVM for containerized, microservice, and multi-tenant cloud architectures.",
            comparisonTable: {
              title: "Java 8 vs Java 17 Defaults, Memory & Architecture Comparison",
              headers: ["JVM Feature / Setting", "Java 8 Baseline", "Java 17 LTS Baseline"],
              rows: [
                ["Default Garbage Collector", "Parallel GC (throughput focused, multi-second STW pauses)", "G1 GC (latency-balanced with target pause times)"],
                ["String Memory Encoding", "UTF-16 (`char[]` taking 2 bytes per ASCII/Latin-1 character)", "Compact Strings (Latin-1 encoded as `byte[]`, cutting heap by ~50%)"],
                ["Container Awareness", "None (allocates heap based on host physical RAM; causes OOMKills)", "Native cgroup v1 & v2 support (`-XX:MaxRAMPercentage=75.0` default)"],
                ["GC Logging Syntax", "Legacy verbose flags (`-XX:+PrintGCDetails`, `-XX:+PrintGCDateStamps`)", "Unified JVM logging framework (`-Xlog:gc*`)"],
                ["Internal API Access", "Accessible via reflection (`sun.misc.Unsafe`, internal packages)", "Strongly encapsulated by default (throws `InaccessibleObjectException`)"],
                ["Removed Components", "Included CMS GC, Nashorn JS, JAXB, CORBA, applets", "CMS, Nashorn, CORBA completely removed from JDK distribution"]
              ]
            },
            codeDemo: {
              language: "bash",
              code: "# Obsolete Java 8 Flags that FAIL or produce warnings in Java 17:\n# -XX:+PrintGCDetails       -> Replaced by -Xlog:gc*\n# -XX:+PrintGCDateStamps    -> Replaced by -Xlog:gc*:time\n# -XX:+UseConcMarkSweepGC   -> Fatal error! Removed in Java 14\n# -XX:PermSize=128m         -> Ignored\n\n# Modern Java 17 Production Command Line:\njava -XX:+UseG1GC \\\n     -XX:MaxRAMPercentage=75.0 \\\n     -Xlog:gc*:file=/var/log/gc.log:time,uptime:filecount=5,filesize=50M \\\n     -jar microservice.jar",
              explanation: "MaxRAMPercentage=75 automatically configures heap based on Docker container memory limits."
            },
            tradeoffs: "Compact Strings are enabled by default; do not disable them (-XX:-CompactStrings) without rigorous profiling.",
            followUpQuestions: [
              {
                question: "What is Compact Strings in Java 9+?",
                answer: "A feature where Strings containing only Latin-1 characters use 1 byte per char instead of 2 bytes, slashing heap consumption by up to 50% for text."
              }
            ],
            usedInProduction: "Tuning JVM startup scripts in Kubernetes Helm charts and Docker entrypoint scripts.",
            relatedTopics: ["Compact Strings", "cgroups", "MaxRAMPercentage"]
          }
        },
        {
          id: "java-17-mig-5",
          question: "What performance and throughput gains can enterprises expect when migrating from Java 8 to Java 17?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-05",
          answer: {
            quickAnswer: "Enterprises typically observe 10–25% higher throughput, 20–40% lower memory footprints (via Compact Strings and G1 string deduplication), and up to 80% shorter GC pause times simply by upgrading runtimes.",
            mentalModel: "Re-running the exact same software on a brand-new supercomputer: your application code doesn't change, but it runs faster and cooler because the underlying engine has had 7 years of deep engineering optimizations.",
            whatItIs: "Cumulative optimizations: (1) JIT Compilers: heavily improved C2 compiler vectorization and escape analysis. (2) Memory: Compact Strings (saves ~25% heap), G1 String Deduplication. (3) Concurrency: Thread-local handshakes, biased locking removal, and CAS optimizations. (4) Apple Silicon (AArch64) native execution (JEP 391) running near bare-metal speeds on Mac hardware.",
            whyItExists: "Provides a compelling business ROI for enterprise leadership to invest in migrating off Java 8.",
            codeDemo: {
              language: "java",
              code: "// Enabling G1 String Deduplication to save memory in Java 17:\n// java -XX:+UseG1GC -XX:+UseStringDeduplication -jar app.jar\n\n// How String Deduplication works:\n// If 10,000 Order objects hold separate String instances with value \"USD\",\n// G1 GC scans the heap and points all 10,000 instances to a single shared byte[] array!\n// Saves megabytes of heap memory with zero code changes!",
              explanation: "G1 String Deduplication deduplicates identical byte arrays in heap memory automatically."
            },
            tradeoffs: "String deduplication uses a small amount of background CPU during GC to calculate string hashes.",
            followUpQuestions: [
              {
                question: "Was Biased Locking removed in modern Java?",
                answer: "Yes, deprecated in Java 15 and disabled by default because modern atomic instructions made its complex lock-revocation cost outweigh its benefits."
              }
            ],
            usedInProduction: "Business case presentations and performance benchmarks for Fortune 500 cloud modernization initiatives.",
            relatedTopics: ["String Deduplication", "Cloud Cost Optimization", "AArch64"]
          }
        },
        {
          id: "java-17-mig-6",
          question: "What is the step-by-step migration checklist for moving a large enterprise monorepo from Java 8/11 to 17?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-06",
          answer: {
            quickAnswer: "A 6-phase roadmap: (1) Audit with jdeps & OpenRewrite, (2) Upgrade build plugins (Maven/Gradle), (3) Upgrade dependencies (Lombok, Mockito, Spring), (4) Replace removed Java EE APIs, (5) Clean JVM flags, (6) Benchmark and validate on staging.",
            mentalModel: "Upgrading a passenger train while it's in service: you first inspect the track and switches (audit), replace the wheels (dependencies), update the engine (JVM 17), test on a secondary line (staging), and finally switch main traffic over.",
            whatItIs: "Phase 1: Run jdeps to spot internal APIs and use OpenRewrite for automated recipe transformations. Phase 2: Update Maven Compiler Plugin (3.11+) and Gradle (7.3+). Phase 3: Upgrade core libraries (Spring Boot 3, Hibernate 6, Jackson 2.15, Mockito 5, Lombok 1.18.30). Phase 4: Replace javax.* with jakarta.* and add JAXB dependencies if needed. Phase 5: Purge obsolete JVM flags (CMS, PrintGCDetails) and add necessary --add-opens during transition. Phase 6: Run JMH benchmarks and test in staging.",
            whyItExists: "A structured, battle-tested playbook that prevents chaotic multi-month migration blockers.",
            codeDemo: {
              language: "bash",
              code: "# Step-by-step terminal execution:\n# 1. Automated code migration using OpenRewrite:\nmvn org.openrewrite.maven:rewrite-maven-plugin:run \\\n    -Drewrite.recipeArtifactCoordinates=org.openrewrite.recipe:rewrite-spring:5.1.0 \\\n    -Drewrite.activeRecipes=org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0\n\n# 2. Compile with Java 17 release target:\nmvn clean compile -Dmaven.compiler.release=17\n\n# 3. Run full test suite:\nmvn verify",
              explanation: "OpenRewrite automates thousands of tedious import updates across enterprise repositories."
            },
            tradeoffs: "Migrating in two hops (Java 8 -> 11, then 11 -> 17) can be easier for extremely massive legacy monolithic codebases.",
            followUpQuestions: [
              {
                question: "What is the '-release 17' compiler flag?",
                answer: "It configures compiler source, target, and the exact platform bootstrap APIs to match Java 17 without needing older JDK installations."
              }
            ],
            usedInProduction: "Standard migration strategy used by enterprise consulting architects across banking and retail sectors.",
            relatedTopics: ["OpenRewrite", "Maven Compiler Plugin", "Release Flag"]
          }
        }
      ]
    }
  ]
};
