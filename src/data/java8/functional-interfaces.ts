import { Category } from "@/types";

export const java8FunctionalInterfacesCategory: Category = {
  id: "java8-functional-interfaces",
  title: "Functional Interfaces",
  subTopics: [
    {
      id: "core-functional-interfaces",
      title: "Core Functional Interfaces",
      questions: [
        {
          id: "j8-func-1",
          question: "What is @FunctionalInterface and what happens if you omit the annotation?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-09-21",
          answer: {
            quickAnswer: "@FunctionalInterface is an informative annotation that tells the compiler an interface is intended to have exactly one abstract method; omitting it still allows the interface to be used as a lambda target if it meets SAM criteria.",
            mentalModel: "Think of @FunctionalInterface like @Override. You don't technically need @Override for method overriding to work, but it instructs the compiler to guard against typos and illegal signature changes.",
            whatItIs: "A functional interface (also known as Single Abstract Method or SAM interface) has exactly one abstract method. It can have any number of default or static methods, as well as abstract methods declared in java.lang.Object (like equals). The @FunctionalInterface annotation triggers a compile-time error if someone adds a second abstract method or if no abstract methods exist.",
            whyItExists: "Provides compiler verification, generates clear IDE warnings, and documents architectural intent for API consumers.",
            codeDemo: {
              language: "java",
              code: "@FunctionalInterface\npublic interface PaymentGateway {\n    // Exactly ONE abstract method\n    boolean process(String accountId, double amount);\n\n    // Default methods do not count toward SAM count\n    default void log(String msg) {\n        System.out.println(\"[LOG] \" + msg);\n    }\n\n    // Static methods do not count\n    static PaymentGateway testGateway() {\n        return (acc, amt) -> true;\n    }\n\n    // Methods matching java.lang.Object do not count\n    @Override\n    boolean equals(Object obj);\n\n    // If you uncomment below, compilation fails immediately:\n    // void cancelTransaction(String txId);\n}",
              explanation: "Only the single non-Object abstract method counts toward the functional interface requirement."
            },
            tradeoffs: "Omitting the annotation risks another developer unknowingly adding an abstract method later, breaking all lambda call sites throughout the codebase.",
            followUpQuestions: [
              {
                question: "Can an empty interface (marker interface) be annotated with @FunctionalInterface?",
                answer: "No, the compiler will throw an error: 'No abstract method found in interface'."
              }
            ],
            usedInProduction: "Used on domain callback interfaces, event listeners, and business rule evaluation engines in Spring Boot services.",
            relatedTopics: ["SAM Interfaces", "Annotations", "Lambda Expressions"]
          }
        },
        {
          id: "j8-func-2",
          question: "How does Predicate<T> work and how do you compose predicates with and(), or(), and negate()?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-09-22",
          answer: {
            quickAnswer: "Predicate<T> represents a boolean-valued function of one argument with test(T t), combinable via short-circuiting logical methods and(), or(), and negate().",
            mentalModel: "A security checkpoint with multiple criteria (badge valid AND temperature normal OR visitor pass). Each predicate is a distinct sensor test that can be wired together into an automated security gate.",
            whatItIs: "Predicate<T> in java.util.function defines boolean test(T t). It provides default methods for boolean composition: predicateA.and(predicateB), predicateA.or(predicateB), and predicateA.negate(). It also provides a static method Predicate.isEqual(targetRef) for object equality.",
            whyItExists: "Decouples filtering logic into reusable, modular rule sets that can be passed directly to Stream.filter(), collection removal, or validation pipelines.",
            codeDemo: {
              language: "java",
              code: "Predicate<String> isNotNull = Objects::nonNull;\nPredicate<String> isNotEmpty = s -> !s.trim().isEmpty();\nPredicate<String> hasMinLength = s -> s.length() >= 5;\n\n// Composing predicates:\nPredicate<String> isValidUsername = isNotNull\n    .and(isNotEmpty)\n    .and(hasMinLength);\n\nList<String> usernames = Arrays.asList(\"admin\", \"\", null, \"bob\", \"superuser\");\n\nList<String> validUsers = usernames.stream()\n    .filter(isValidUsername)\n    .collect(Collectors.toList());\n// Output: [admin, superuser]\n\n// Negating:\nPredicate<String> isInvalid = isValidUsername.negate();",
              explanation: "and() performs short-circuit evaluation: if isNotNull evaluates to false, isNotEmpty is never called, preventing NullPointerException."
            },
            tradeoffs: "Excessive predicate chaining can obscure stack traces during debugging; break complex boolean logic into well-named intermediate predicates.",
            followUpQuestions: [
              {
                question: "What is Predicate.isEqual()?",
                answer: "A static utility method that returns a predicate testing if an input equals a target object via Objects.equals(target, input)."
              }
            ],
            usedInProduction: "Widely used in specification query builders (Spring Data JPA Specifications) and input validation filters.",
            relatedTopics: ["Stream.filter", "Boolean Algebra", "Short-circuit Evaluation"]
          }
        },
        {
          id: "j8-func-3",
          question: "How does Function<T, R> work and what is the difference between andThen() and compose()?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-09-23",
          answer: {
            quickAnswer: "Function<T, R> transforms an input of type T into output R via apply(); andThen() executes the caller first then the parameter (f(g(x))), while compose() executes the parameter first then caller (g(f(x))).",
            mentalModel: "Think of andThen as steps in an assembly line: 'Bake the cake, and then ice it.' Think of compose as mathematical function composition: g.compose(f) means 'apply f first, then apply g to the result.'",
            whatItIs: "Function<T, R> is the quintessential functional transformation interface. Its abstract method is R apply(T t). Default methods: f1.andThen(f2) produces a function that first applies f1, then applies f2 to the result. f1.compose(f2) produces a function that first applies f2, then applies f1 to the result.",
            whyItExists: "Enables declarative mathematical pipeline transformations, ETL processing, and clean separation between data conversion steps.",
            comparisonTable: {
              title: "Function.andThen() vs compose() Comparison",
              headers: ["Dimension", "andThen(after)", "compose(before)"],
              rows: [
                ["Execution Order", "Left-to-Right: Caller executes first, then parameter (`f.andThen(g)` -> `g(f(x))`)", "Right-to-Left: Parameter executes first, then caller (`f.compose(g)` -> `f(g(x))`)"],
                ["Mathematical Notation", "Diagrammatic pipeline order: `x |> f |> g`", "Classical composition: `(f ∘ g)(x)`"],
                ["Parameter Signature", "`Function<? super R, ? extends V> after`", "`Function<? super V, ? extends T> before`"],
                ["Mental Model", "Assembly line: step 1, and then step 2", "Wrapper / Decorator: wrap inner function result into outer"],
                ["Readability / Preference", "Highly readable for linear pipelines (preferred in 95% of Java code)", "Mathematical style; often leads to inverted readability"],
                ["Supported on BiFunction?", "Yes (`biFunction.andThen(...)`)", "No (single output cannot feed two input parameters)"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "Function<Integer, Integer> multiplyByTwo = x -> x * 2;\nFunction<Integer, Integer> addTen = x -> x + 10;\n\n// andThen: multiplyByTwo FIRST, then addTen\n// (3 * 2) + 10 = 6 + 10 = 16\nint result1 = multiplyByTwo.andThen(addTen).apply(3);\nSystem.out.println(\"andThen: \" + result1); // 16\n\n// compose: addTen FIRST, then multiplyByTwo\n// (3 + 10) * 2 = 13 * 2 = 26\nint result2 = multiplyByTwo.compose(addTen).apply(3);\nSystem.out.println(\"compose: \" + result2); // 26\n\n// Identity function: returns whatever is passed\nFunction<String, String> identity = Function.identity();",
              explanation: "andThen executes left-to-right; compose executes right-to-left."
            },
            tradeoffs: "Compose can be counterintuitive to developers unfamiliar with mathematical notation (f ∘ g); andThen is generally preferred in production for linear readability.",
            followUpQuestions: [
              {
                question: "What is Function.identity() used for?",
                answer: "Returns a function that always returns its input argument (t -> t), essential in Collectors.toMap() when using the object itself as the key or value."
              }
            ],
            usedInProduction: "Standard in Map-Reduce pipelines, DTO-to-Entity converters, and currency conversion workflows.",
            relatedTopics: ["Collectors.toMap", "Function Composition", "Stream.map"]
          }
        },
        {
          id: "j8-func-4",
          question: "What is Consumer<T> and when is it preferred over Function?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-09-24",
          answer: {
            quickAnswer: "Consumer<T> accepts a single input argument and returns no result (void), used for operations executed purely for side effects such as printing, logging, or saving.",
            mentalModel: "A paper shredder or a database writer. You insert a document, it processes the item, and nothing comes back out to the conveyor belt.",
            whatItIs: "Consumer<T> defines void accept(T t). It provides one default method: andThen(Consumer<? super T> after) to chain consecutive side-effect actions on the same input object. It is preferred over Function when an operation produces no meaningful return value.",
            whyItExists: "Provides type safety and clear intent for terminal side effects, avoiding the awkwardness of returning dummy null or Void objects.",
            comparisonTable: {
              title: "The 4 Core Java 8 Functional Interfaces Comparison",
              headers: ["Interface", "Abstract Method", "Input Args", "Return Type", "Primary Purpose / Use Case"],
              rows: [
                ["Predicate<T>", "`boolean test(T t)`", "1 (type T)", "`boolean`", "Filtering, condition checks, boolean validation (`Stream.filter`)"],
                ["Function<T, R>", "`R apply(T t)`", "1 (type T)", "`R` (transformed)", "Data transformation, projection, mapping (`Stream.map`)"],
                ["Consumer<T>", "`void accept(T t)`", "1 (type T)", "`void`", "Terminal side effects, printing, logging, saving (`forEach`, `ifPresent`)"],
                ["Supplier<T>", "`T get()`", "0 (no arguments)", "`T` (generated)", "Lazy evaluation, factory object creation (`Optional.orElseGet`)"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "Consumer<String> logger = msg -> System.out.println(\"[INFO] \" + msg);\nConsumer<String> metrics = msg -> System.out.println(\"[METRIC] Emitted event for: \" + msg);\n\n// Chaining consumers with andThen\nConsumer<String> auditPipeline = logger.andThen(metrics);\n\nList<String> events = Arrays.asList(\"UserLogin\", \"OrderPlaced\", \"Logout\");\nevents.forEach(auditPipeline);",
              explanation: "Each event string is passed sequentially to logger, then metrics via accept()."
            },
            tradeoffs: "Consumers inherently produce side effects (I/O, database writes, state mutations), violating pure functional immutability if used indiscriminately inside intermediate stream operations.",
            followUpQuestions: [
              {
                question: "Can Consumer modify the internal state of the passed object?",
                answer: "Yes! If the passed object is mutable, consumer.accept(order) can modify order fields (e.g., order.setStatus('PROCESSED'))."
              }
            ],
            usedInProduction: "Powers Iterable.forEach(), Optional.ifPresent(), and Spring WebClient response handlers.",
            relatedTopics: ["Optional.ifPresent", "Iterable.forEach", "Side Effects"]
          }
        },
        {
          id: "j8-func-5",
          question: "What is Supplier<T> and how is it used for lazy evaluation and factory patterns?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-09-25",
          answer: {
            quickAnswer: "Supplier<T> takes no arguments and returns a value of type T via get(), enabling lazy on-demand computation and factory instantiation.",
            mentalModel: "A vending machine token. You don't get the cold soda until you insert the token and press the button (calling get()). If you never press the button, no soda is dispensed and no refrigeration energy was wasted.",
            whatItIs: "Supplier<T> represents a supplier of results with a single method T get(). Unlike an eagerly evaluated variable, passing a Supplier passes the computation recipe. The computation only executes if and when the consumer decides to call get().",
            whyItExists: "Critical for avoiding expensive computations (database queries, string concatenations, network calls) when the result might never actually be needed.",
            codeDemo: {
              language: "java",
              code: "public class Logger {\n    private boolean debugEnabled = false;\n\n    // Eager evaluation: expensiveData() ALWAYS runs, even if debug is disabled!\n    public void logEager(String message) {\n        if (debugEnabled) System.out.println(message);\n    }\n\n    // Lazy evaluation with Supplier: expensiveData() runs ONLY if debug is true\n    public void logLazy(Supplier<String> messageSupplier) {\n        if (debugEnabled) System.out.println(messageSupplier.get());\n    }\n}\n\n// Usage:\nLogger logger = new Logger();\n// Lazy: generateExpensiveReport() will NEVER execute\nlogger.logLazy(() -> generateExpensiveReport());\n\n// Used in Optional for defaults:\nOptional<User> user = Optional.empty();\nUser u = user.orElseGet(() -> fetchUserFromRemoteService()); // Lazy fetch",
              explanation: "orElseGet takes a Supplier, deferring remote service calls until the Optional is verified to be empty."
            },
            tradeoffs: "Suppliers must be evaluated each time get() is called unless manually memoized (cached).",
            followUpQuestions: [
              {
                question: "What is the difference between orElse(expensive()) and orElseGet(() -> expensive())?",
                answer: "orElse evaluates expensive() eagerly regardless of whether the Optional has a value; orElseGet evaluates the Supplier lazily only when the Optional is empty."
              }
            ],
            usedInProduction: "Widely used in SLF4J 2.x and Log4j2 lazy logging, Optional.orElseGet(), and Spring @Bean factory definitions.",
            relatedTopics: ["Optional.orElseGet", "Lazy Evaluation", "Factory Pattern"]
          }
        },
        {
          id: "j8-func-6",
          question: "Why did Java 8 introduce primitive functional interfaces (e.g., IntPredicate, LongConsumer, DoubleFunction)?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-09-26",
          answer: {
            quickAnswer: "To prevent the massive performance and garbage collection overhead of autoboxing and unboxing between primitive types (int, long, double) and their boxed wrapper objects (Integer, Long, Double).",
            mentalModel: "Boxing a primitive is like putting a tiny screw inside an enormous cardboard Amazon shipping box. When you need the screw, you have to tear open the box. Repeating this a million times a second chokes your workspace with cardboard trash (GC pressure).",
            whatItIs: "Generics in Java operate only on reference types. A Predicate<Integer> requires every primitive int to be boxed into an Integer object (allocating 16-24 bytes on the heap per number) and unboxed inside test(). Java 8 introduced primitive specializations like IntPredicate (int -> boolean), LongConsumer (long -> void), and DoubleFunction<R> (double -> R) that operate directly on raw JVM registers/primitives without heap allocation.",
            whyItExists: "High-performance numeric computing, low-latency financial systems, and big data processing cannot tolerate millions of boxed object allocations.",
            comparisonTable: {
              title: "Boxed vs Primitive Functional Interfaces",
              headers: ["Dimension", "Boxed Interface (e.g. Predicate<Integer>)", "Primitive Interface (e.g. IntPredicate)"],
              rows: [
                ["Parameter Type", "Object reference (`Integer` wrapper)", "Raw primitive (`int` 32-bit register)"],
                ["Heap Allocation", "16 to 24 bytes per element allocated on heap", "0 bytes: values held entirely in CPU registers/stack"],
                ["Autoboxing Overhead", "Heavy CPU cost boxing and unboxing every item", "Zero autoboxing or unboxing"],
                ["Garbage Collector Impact", "High GC pressure from millions of short-lived objects", "Zero GC pressure; no object churn"],
                ["Generics Support", "Standard Java generics (`Predicate<T>`)", "Specialized type (no generics overhead)"],
                ["Production Benchmark", "Orders of magnitude slower in high-volume loops", "Near bare-metal C-speed array processing"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Boxed version: Allocates 1,000,000 Integer objects on heap!\nPredicate<Integer> isPositive = n -> n > 0;\n\n// Primitive specialized version: ZERO heap allocation!\nIntPredicate isPositivePrimitive = n -> n > 0;\n\n// Running primitive benchmark comparison:\nint[] data = IntStream.range(1, 1_000_000).toArray();\n\n// Using primitive IntStream with IntPredicate:\nlong count = Arrays.stream(data)\n    .filter(isPositivePrimitive) // Direct primitive CPU register comparison\n    .count();",
              explanation: "IntPredicate avoids autoboxing int to Integer, saving tens of megabytes of heap and avoiding GC pauses."
            },
            tradeoffs: "Increases the API surface area in java.util.function with dozens of specialized classes (43 interfaces total), requiring developers to select the correct specialized type.",
            followUpQuestions: [
              {
                question: "What are the three primitive types supported in java.util.function specializations?",
                answer: "int, long, and double (representing 32-bit int, 64-bit int, and IEEE floating-point types)."
              }
            ],
            usedInProduction: "Crucial in real-time trading engines, telemetry metrics processing, and high-volume stream aggregations.",
            relatedTopics: ["Autoboxing", "Garbage Collection", "Primitive Streams"]
          }
        }
      ]
    },
    {
      id: "two-arity-specializations",
      title: "Bi-Interfaces & Operators",
      questions: [
        {
          id: "j8-twoarity-1",
          question: "How does BiFunction<T, U, R> work and how does it differ from Function<T, R>?",
          difficulty: "Easy",
          frequency: 4,
          lastVerified: "2026-09-27",
          answer: {
            quickAnswer: "BiFunction<T, U, R> accepts two arguments of types T and U and produces a result of type R via apply(T t, U u), whereas Function<T, R> only accepts one argument.",
            mentalModel: "A mixer machine that takes two ingredients (flour + water) and outputs dough. A standard Function only takes one ingredient.",
            whatItIs: "BiFunction<T, U, R> is the two-arity version of Function. Abstract method: R apply(T t, U u). It provides one default method: andThen(Function<? super R, ? extends V> after) to chain an additional transformation on its result. Note that it has no compose() method because the output of a single function cannot feed into a two-argument input.",
            whyItExists: "Essential for operations that combine, merge, or coordinate pairs of items (e.g., Map.compute, Map.merge, and zip operations).",
            comparisonTable: {
              title: "Function<T, R> vs BiFunction<T, U, R> Comparison",
              headers: ["Dimension", "Function<T, R>", "BiFunction<T, U, R>"],
              rows: [
                ["Input Arity", "Single argument (`T`)", "Two arguments (`T`, `U`)"],
                ["SAM Signature", "`R apply(T t)`", "`R apply(T t, U u)`"],
                ["Method Composition", "Supports both `.andThen()` and `.compose()`", "Supports `.andThen()`, but NOT `.compose()`"],
                ["Why compose() Missing?", "Single output feeds another single input naturally", "Upstream function only yields 1 value, cannot satisfy 2 parameters"],
                ["Core Production Use", "`Stream.map()`, DTO transformers, field getters", "`Map.compute()`, `Map.merge()`, multi-service response combiners"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Calculating total price with tax:\nBiFunction<Double, Double, Double> calculateTotal = (subtotal, taxRate) -> subtotal + (subtotal * taxRate);\n\n// Chaining with andThen to format currency:\nFunction<Double, String> formatCurrency = amt -> String.format(\"$%.2f\", amt);\n\nBiFunction<Double, Double, String> pricePipeline = calculateTotal.andThen(formatCurrency);\n\nString finalBill = pricePipeline.apply(100.0, 0.08);\nSystem.out.println(finalBill); // \"$108.00\"",
              explanation: "calculateTotal processes two arguments, and andThen formats the resulting double into a currency string."
            },
            tradeoffs: "Java only provides built-in interfaces up to two arguments (BiPredicate, BiFunction, BiConsumer); three or more arguments require custom functional interfaces.",
            followUpQuestions: [
              {
                question: "Why is there no compose() method in BiFunction?",
                answer: "Because compose() requires the output of another function to match the input of the caller; a standard function only produces one result, which cannot satisfy two parameters."
              }
            ],
            usedInProduction: "Heavily used in Map.compute(), Map.merge(), and reactive zip operators combining API responses.",
            relatedTopics: ["Map.merge", "BinaryOperator", "Function"]
          }
        },
        {
          id: "j8-twoarity-2",
          question: "What are UnaryOperator<T> and BinaryOperator<T> and when should you use them over Function/BiFunction?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-09-28",
          answer: {
            quickAnswer: "UnaryOperator<T> extends Function<T, T> and BinaryOperator<T> extends BiFunction<T, T, T>; they must be used when all operand types and the return type are identical.",
            mentalModel: "UnaryOperator is like adjusting the volume on your stereo (sound in -> modified sound out). BinaryOperator is like an arithmetic addition (number + number = number).",
            whatItIs: "UnaryOperator<T> specializes Function<T, T> where the input and output types are the same. BinaryOperator<T> specializes BiFunction<T, T, T> where both inputs and the result are the exact same type. They provide cleaner type signatures and include static utility methods like BinaryOperator.minBy and maxBy.",
            whyItExists: "Simplifies API signatures, enhances type inference, and powers reduction operations like Stream.reduce() and List.replaceAll().",
            comparisonTable: {
              title: "Unary/BinaryOperator vs Function/BiFunction Comparison",
              headers: ["Interface", "Extends", "SAM Signature", "Type Homogeneity", "Primary Use Case"],
              rows: [
                ["UnaryOperator<T>", "Function<T, T>", "`T apply(T t)`", "Strictly homogeneous (Input T -> Output T)", "`List.replaceAll()`, string transformations, state mutation"],
                ["Function<T, R>", "None", "`R apply(T t)`", "Heterogeneous (Input T -> Output R can differ)", "DTO mapping, projection, entity conversion"],
                ["BinaryOperator<T>", "BiFunction<T, T, T>", "`T apply(T t1, T t2)`", "Strictly homogeneous (Inputs and output all type T)", "`Stream.reduce()`, mathematical addition, finding min/max"],
                ["BiFunction<T, U, R>", "None", "`R apply(T t, U u)`", "Heterogeneous (T, U, and R can all be different)", "Combining two disparate models into a composite object"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// List.replaceAll takes UnaryOperator<T>\nList<String> codes = Arrays.asList(\"us\", \"uk\", \"jp\");\nUnaryOperator<String> toUpper = String::toUpperCase;\ncodes.replaceAll(toUpper); // [\"US\", \"UK\", \"JP\"]\n\n// Stream.reduce takes BinaryOperator<T>\nBinaryOperator<Integer> sumOperator = (a, b) -> a + b;\nint total = Arrays.asList(1, 2, 3, 4).stream()\n    .reduce(0, sumOperator);\nSystem.out.println(\"Total: \" + total); // 10",
              explanation: "BinaryOperator ensures operands and result are homogeneous, making it ideal for fold/reduce operations."
            },
            tradeoffs: "If the output type needs to differ from the input type, you must use Function<T, R> or BiFunction<T, U, R>.",
            followUpQuestions: [
              {
                question: "What is the relationship between BinaryOperator and Stream.reduce()?",
                answer: "Stream.reduce(BinaryOperator<T> accumulator) uses the operator to sequentially combine two elements of type T into one accumulated result of type T."
              }
            ],
            usedInProduction: "In-place collection transformations (List.replaceAll) and parallel reductions in Big Data stream jobs.",
            relatedTopics: ["Stream.reduce", "List.replaceAll", "Function"]
          }
        },
        {
          id: "j8-twoarity-3",
          question: "How do BinaryOperator.minBy() and BinaryOperator.maxBy() work with custom Comparators?",
          difficulty: "Medium",
          frequency: 4,
          lastVerified: "2026-09-29",
          answer: {
            quickAnswer: "minBy and maxBy are static factory methods on BinaryOperator that return a BinaryOperator that evaluates two elements using a provided Comparator and returns the minimum or maximum.",
            mentalModel: "Think of an automated referee: you provide the rulebook (Comparator), and whenever two players contest a point, the referee declares the winner (minBy or maxBy).",
            whatItIs: "BinaryOperator.minBy(Comparator<? super T> comp) returns a BinaryOperator<T> which yields the lesser of two elements according to the comparator. Similarly, maxBy yields the greater. Under the hood: (a, b) -> comparator.compare(a, b) <= 0 ? a : b.",
            whyItExists: "Avoids writing manual ternary comparisons inside stream reductions and collectors.",
            codeDemo: {
              language: "java",
              code: "class Product {\n    String name;\n    double price;\n    Product(String name, double price) { this.name = name; this.price = price; }\n    public double getPrice() { return price; }\n}\n\nList<Product> products = Arrays.asList(\n    new Product(\"Keyboard\", 75.0),\n    new Product(\"Monitor\", 250.0),\n    new Product(\"Mouse\", 25.0)\n);\n\n// BinaryOperator that picks the cheaper product:\nBinaryOperator<Product> cheaper = BinaryOperator.minBy(\n    Comparator.comparingDouble(Product::getPrice)\n);\n\n// Finding the cheapest product using reduce:\nOptional<Product> cheapest = products.stream().reduce(cheaper);\nSystem.out.println(\"Cheapest: \" + cheapest.get().name); // Mouse",
              explanation: "BinaryOperator.minBy neatly encapsulates the comparison logic into a reusable binary operator."
            },
            tradeoffs: "Throws NullPointerException if the comparator or either element being compared is null unless wrapped with Comparator.nullsFirst().",
            followUpQuestions: [
              {
                question: "Can minBy/maxBy be used with Collectors.reducing?",
                answer: "Yes, Collectors.reducing(BinaryOperator.maxBy(...)) is commonly used in downstream grouping queries to find top items per category."
              }
            ],
            usedInProduction: "Finding top performers, lowest latency server endpoints, and best-priced inventory items in e-commerce pipelines.",
            relatedTopics: ["Comparator", "Stream.reduce", "Collectors.maxBy"]
          }
        },
        {
          id: "j8-twoarity-4",
          question: "What is BiConsumer<T, U> and where is it commonly used in Java 8 (e.g., Map.forEach)?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-09-30",
          answer: {
            quickAnswer: "BiConsumer<T, U> accepts two input arguments and returns no result (void), commonly used for iterating key-value pairs in Map.forEach() and accumulating items in custom collectors.",
            mentalModel: "A clerk receiving two documents at a counter (passport + ticket), stamping both into the travel manifest, and returning nothing.",
            whatItIs: "BiConsumer<T, U> defines void accept(T t, U u). It represents an operation that performs side effects across two inputs. It provides an andThen(BiConsumer after) default method to sequence multiple two-parameter actions.",
            whyItExists: "Before Java 8, iterating a Map required awkward map.entrySet() loops. Map.forEach(BiConsumer) provides clean, readable iteration of key-value pairs.",
            codeDemo: {
              language: "java",
              code: "Map<String, Integer> stockMap = new HashMap<>();\nstockMap.put(\"AAPL\", 180);\nstockMap.put(\"GOOGL\", 140);\nstockMap.put(\"MSFT\", 370);\n\n// Java 8: Clean Map.forEach taking BiConsumer\nBiConsumer<String, Integer> stockPrinter = (ticker, price) -> \n    System.out.println(ticker + \" is trading at $\" + price);\n\nstockMap.forEach(stockPrinter);\n\n// Custom collector accumulator:\nBiConsumer<List<String>, String> accumulator = List::add;",
              explanation: "stockMap.forEach passes both the key and the value directly to the BiConsumer."
            },
            tradeoffs: "Like Consumer, BiConsumers are intended for side effects; mutating outer non-thread-safe collections can lead to race conditions.",
            followUpQuestions: [
              {
                question: "What role does BiConsumer play in Collector implementation?",
                answer: "In a Collector<T, A, R>, the accumulator function is a BiConsumer<A, T> that folds an input element of type T into the mutable accumulator A."
              }
            ],
            usedInProduction: "Standard in Map inspection, REST API response header parsing, and custom Stream collectors.",
            relatedTopics: ["Map.forEach", "Collector Accumulator", "Consumer"]
          }
        },
        {
          id: "j8-twoarity-5",
          question: "How can you design custom multi-argument functional interfaces (e.g., TriFunction) in Java 8?",
          difficulty: "Medium",
          frequency: 3,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "Declare a custom @FunctionalInterface with three input generic types and one return generic type, defining a single abstract method R apply(T t, U u, V v).",
            mentalModel: "If standard plug adapters only come with 1 or 2 prongs, you can build your own custom 3-prong industrial outlet by following the exact same wiring standard (@FunctionalInterface).",
            whatItIs: "Java 8 only provides single-argument (Function) and two-argument (BiFunction) functional interfaces in java.util.function. When an operation requires 3 or more arguments, you can define your own @FunctionalInterface.",
            whyItExists: "Allows functional patterns to scale to 3D coordinates, database triple joins, financial triangle arbitrage, or complex constructor bindings.",
            codeDemo: {
              language: "java",
              code: "@FunctionalInterface\npublic interface TriFunction<T, U, V, R> {\n    R apply(T t, U u, V v);\n\n    // Optional default composition method:\n    default <K> TriFunction<T, U, V, K> andThen(Function<? super R, ? extends K> after) {\n        Objects.requireNonNull(after);\n        return (T t, U u, V v) -> after.apply(apply(t, u, v));\n    }\n}\n\n// Usage:\nTriFunction<String, Double, Integer, String> invoiceGenerator = \n    (item, price, qty) -> String.format(\"%d x %s = $%.2f\", qty, item, price * qty);\n\nString invoice = invoiceGenerator.apply(\"Mechanical Keyboard\", 89.99, 3);\nSystem.out.println(invoice); // \"3 x Mechanical Keyboard = $269.97\"",
              explanation: "The TriFunction cleanly passes three parameters and can be chained with andThen."
            },
            tradeoffs: "Having many custom functional interfaces (QuadFunction, PentaFunction) usually indicates a code smell; consider bundling related parameters into a parameter object or record.",
            followUpQuestions: [
              {
                question: "What is currying in Java functional programming?",
                answer: "Currying translates a multi-argument function into a chain of single-argument functions: Function<T, Function<U, Function<V, R>>>."
              }
            ],
            usedInProduction: "Used in graphical rendering engines (RGB to Pixel converters) and geolocation algorithms (lat, lon, elevation -> Point3D).",
            relatedTopics: ["Currying", "Custom Interfaces", "BiFunction"]
          }
        }
      ]
    }
  ]
};
