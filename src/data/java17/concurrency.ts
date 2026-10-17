import { Category } from "@/types";

export const java17ConcurrencyCategory: Category = {
  id: "java17-concurrency-loom",
  title: "Concurrency & Virtual Threads",
  subTopics: [
    {
      id: "concurrency-fundamentals",
      title: "Core Locking & Synchronization",
      questions: [
        {
          id: "java-conc-sync-1",
          question: "What is the difference between synchronized and ReentrantLock? When would you choose one over the other?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "synchronized is a built-in Java keyword for mutual exclusion — simple but limited. ReentrantLock is an API-based lock from java.util.concurrent.locks supporting try-locking, timed locking, interruptible locking, and fairness policies.",
            mentalModel: "Think of synchronized as a hotel room key — if someone else has it, you wait with no way out. ReentrantLock is a smart lock with a keypad: you can knock and walk away if no one answers (tryLock), set a timeout, or ask to be let in in the order you arrived (fairness).",
            whatItIs: "synchronized is a language keyword that implicitly acquires an intrinsic monitor lock on an object or class. ReentrantLock implements the Lock interface, providing identical mutual-exclusion semantics with explicit control. Both locks are reentrant: a thread holding the lock can re-acquire it without self-deadlock.",
            whyItExists: "synchronized lacked non-blocking lock attempts, interruptibility, and fairness. ReentrantLock was added in Java 5 to provide flexible, advanced synchronization primitives for high-concurrency systems.",
            comparisonTable: {
              title: "synchronized vs ReentrantLock Comparison",
              headers: ["Feature / Dimension", "synchronized Keyword", "ReentrantLock API"],
              rows: [
                ["Mechanism Type", "JVM intrinsic monitor lock (language keyword)", "API class in `java.util.concurrent.locks`"],
                ["Lock Acquisition", "Implicit (acquired upon entering block/method)", "Explicit (`lock.lock()`, must unlock in `finally`)"],
                ["Non-blocking Try-Lock", "No: always blocks indefinitely until lock is free", "Yes: `tryLock()` returns boolean immediately"],
                ["Timed Acquisition", "No: cannot specify timeout", "Yes: `tryLock(long timeout, TimeUnit unit)`"],
                ["Fairness Policy", "Unfair only (JVM chooses arbitrary waiting thread)", "Configurable: fair (FIFO order) or unfair (default)"],
                ["Interruptibility", "Cannot interrupt thread blocked on synchronized", "Yes: `lockInterruptibly()` responds to Thread.interrupt()"],
                ["Condition Variables", "Single condition per object (`wait()`, `notify()`)", "Multiple conditions per lock (`lock.newCondition()`)"],
                ["Best Use Case", "Simple, low-contention locking; less boilerplate", "Complex concurrency, timed backoff, fairness, deadlocks"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// 1. synchronized: simple, implicit\npublic class Counter {\n    private int count = 0;\n    public synchronized void increment() {\n        count++; // Lock acquired on 'this', released automatically\n    }\n}\n\n// 2. ReentrantLock: explicit, flexible\npublic class BankAccount {\n    private double balance;\n    private final ReentrantLock lock = new ReentrantLock(true); // Fair lock\n\n    public void withdraw(double amount) {\n        lock.lock(); // MUST unlock in finally!\n        try {\n            if (balance >= amount) balance -= amount;\n        } finally {\n            lock.unlock();\n        }\n    }\n\n    // tryLock: avoid blocking indefinitely\n    public boolean tryWithdraw(double amount) {\n        if (lock.tryLock()) {\n            try {\n                if (balance >= amount) { balance -= amount; return true; }\n            } finally {\n                lock.unlock();\n            }\n        }\n        return false; // Lock was busy, do something else\n    }\n}",
              explanation: "ReentrantLock requires unlocking inside a finally block to prevent permanent deadlocks if an exception is thrown."
            },
            tradeoffs: "Always prefer synchronized when sufficient — it is less verbose, impossible to forget to unlock, and heavily optimized by the JVM. Use ReentrantLock when you require tryLock, timeouts, fairness, or multiple Condition variables.",
            followUpQuestions: [
              {
                question: "How do you prevent deadlocks between two account transfers?",
                answer: "Always acquire locks in a globally consistent order (e.g., sort accounts by ID and lock lower ID first). Or use tryLock() with a timeout."
              }
            ],
            usedInProduction: "High-throughput financial ledgers use ReentrantLock with tryLock() to fail-fast on contended accounts; simple in-memory caches use synchronized.",
            relatedTopics: ["ReentrantLock", "Deadlock Prevention", "Condition"]
          }
        },
        {
          id: "java-17-conc-2",
          question: "How does ReentrantLock.tryLock() prevent deadlocks with timeouts?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "tryLock(timeout, unit) attempts to acquire the lock within the specified time; if unavailable, it returns false rather than blocking indefinitely, allowing the thread to back off and release held locks.",
            mentalModel: "Two people trying to pass each other in a narrow hallway: instead of standing stubbornly face-to-face forever (deadlock), one person waits 2 seconds, steps backward (backs off), and lets the other pass before trying again.",
            whatItIs: "In the classic Dining Philosophers problem, threads deadlock because they block forever waiting for a second resource while holding a first. tryLock() breaks the 'Hold and Wait' condition. If the second lock cannot be acquired within a timeout, the thread releases its first lock, waits for a randomized backoff period, and retries.",
            whyItExists: "Indefinite blocking with synchronized is the leading cause of hung threads and unresponsive microservice outages.",
            codeDemo: {
              language: "java",
              code: "public boolean transferMoney(Account from, Account to, double amount, long timeoutMs) \n        throws InterruptedException {\n    long stopTime = System.currentTimeMillis() + timeoutMs;\n    while (true) {\n        if (from.lock.tryLock(50, TimeUnit.MILLISECONDS)) {\n            try {\n                if (to.lock.tryLock(50, TimeUnit.MILLISECONDS)) {\n                    try {\n                        from.debit(amount);\n                        to.credit(amount);\n                        return true; // Successfully transferred!\n                    } finally {\n                        to.lock.unlock();\n                    }\n                }\n            } finally {\n                from.lock.unlock(); // Back off and release first lock!\n            }\n        }\n        if (System.currentTimeMillis() > stopTime) return false; // Timed out\n        Thread.sleep(ThreadLocalRandom.current().nextInt(10, 50)); // Random backoff\n    }\n}",
              explanation: "If 'to' cannot be locked, 'from' is released immediately, breaking the deadlock condition."
            },
            tradeoffs: "High contention can cause livelock (threads repeatedly trying, failing, and backing off together); randomize backoff intervals to prevent resonance.",
            followUpQuestions: [
              {
                question: "What is Livelock?",
                answer: "A situation where two or more threads continuously change their state in response to each other without making any practical progress."
              }
            ],
            usedInProduction: "Banking transfers, distributed database two-phase commit protocols, and distributed lock managers.",
            relatedTopics: ["Livelock", "Deadlock", "Backoff Strategies"]
          }
        },
        {
          id: "java-17-conc-3",
          question: "What is ReentrantReadWriteLock vs StampedLock (optimistic reading) in Java?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "ReentrantReadWriteLock allows multiple concurrent readers but blocks all readers during writes; StampedLock adds an optimistic reading mode that does not acquire a lock at all, providing dramatically higher read throughput.",
            mentalModel: "A library reference board: ReentrantReadWriteLock requires readers to wear a visitor badge that blocks the librarian from writing updates. StampedLock's optimistic read lets you glance at the board without touching a badge; you only check if the version number changed after reading.",
            whatItIs: "ReentrantReadWriteLock can cause write starvation if readers constantly arrive. StampedLock (introduced in Java 8, heavily used in 17) returns a stamp (long version). tryOptimisticRead() acquires no lock. You read fields, then call validate(stamp). If true, the read is valid. If false (a writer modified data concurrently), you fall back to a full read lock.",
            whyItExists: "Caches and in-memory indexes with 99% read workloads suffer reader lock contention under ReentrantReadWriteLock.",
            comparisonTable: {
              title: "ReentrantReadWriteLock vs StampedLock Comparison",
              headers: ["Dimension", "ReentrantReadWriteLock", "StampedLock (Java 8+)"],
              rows: [
                ["Reentrancy", "Fully reentrant (same thread can acquire multiple times)", "Non-reentrant (re-acquiring same lock causes self-deadlock)"],
                ["Optimistic Reading", "Not supported (all reads acquire pessimistic shared lock)", "Supported via `tryOptimisticRead()` and `validate(stamp)`"],
                ["Read Lock Cost", "Memory barrier + CAS updates on shared state", "Zero lock acquired during optimistic read (fast validation)"],
                ["Write Starvation", "Common under continuous streams of incoming readers", "Prevented: writers can proceed during optimistic reads"],
                ["Lock Degradation / Upgrades", "Read-to-Write upgrade NOT supported; write-to-read allowed", "Supports dynamic lock conversions via `tryConvertToWriteLock()`"],
                ["Condition Variables", "Supported via `writeLock().newCondition()`", "Not supported (`newCondition()` throws UnsupportedOperationException)"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "import java.util.concurrent.locks.StampedLock;\n\npublic class Point {\n    private double x, y;\n    private final StampedLock sl = new StampedLock();\n\n    // High-performance Optimistic Read:\n    public double distanceFromOrigin() {\n        long stamp = sl.tryOptimisticRead(); // Non-blocking, zero lock acquired!\n        double curX = x, curY = y;\n        if (!sl.validate(stamp)) { // Check if a writer wrote concurrently\n            stamp = sl.readLock(); // Fall back to pessimistic read lock\n            try {\n                curX = x;\n                curY = y;\n            } finally {\n                sl.unlockRead(stamp);\n            }\n        }\n        return Math.sqrt(curX * curX + curY * curY);\n    }\n\n    // Exclusive Write:\n    public void move(double deltaX, double deltaY) {\n        long stamp = sl.writeLock();\n        try {\n            x += deltaX;\n            y += deltaY;\n        } finally {\n            sl.unlockWrite(stamp);\n        }\n    }\n}",
              explanation: "tryOptimisticRead() executes without memory barriers or lock contention when no writes occur."
            },
            tradeoffs: "StampedLock is NOT reentrant! If a thread holding a read lock attempts to re-acquire a write lock or read lock without care, it will deadlock itself.",
            followUpQuestions: [
              {
                question: "Is StampedLock reentrant?",
                answer: "No! Unlike ReentrantLock, StampedLock is non-reentrant. Never re-acquire a StampedLock on the same thread."
              }
            ],
            usedInProduction: "In-memory caching engines, geolocation distance lookups, and configuration registries in low-latency trading.",
            relatedTopics: ["StampedLock", "Optimistic Locking", "Write Starvation"]
          }
        },
        {
          id: "java-17-conc-4",
          question: "What are the 4 conditions for a Deadlock and how do you detect and resolve them using thread dumps?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "Deadlock requires Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait; breaking any ONE condition prevents deadlock. Detect via jstack <pid> or JConsole, which highlights deadlock cycles automatically.",
            mentalModel: "A 4-way traffic gridlock intersection: 4 cars enter simultaneously, each blocking the car to its left. No car can move forward without another backing up.",
            whatItIs: "Coffman conditions: (1) Mutual Exclusion: resources cannot be shared. (2) Hold and Wait: thread holds one resource while requesting another. (3) No Preemption: resources cannot be forcibly seized. (4) Circular Wait: Thread A waits for B, B waits for A. Running jstack <pid> scans the JVM monitor tables and explicitly outputs: 'Found 1 deadlock.' listing the offending threads and lock addresses.",
            whyItExists: "Deadlocks freeze production server instances without crashing or throwing exceptions, causing silent service failure.",
            codeDemo: {
              language: "bash",
              code: "# 1. Generate thread dump using jstack:\njstack 12345 > thread_dump.txt\n\n# 2. Inspecting Deadlock output in the dump:\n# Found one Java-level deadlock:\n# =============================\n# \"Thread-1\":\n#   waiting to lock monitor 0x00007f (object 0x00000007), which is held by \"Thread-2\"\n# \"Thread-2\":\n#   waiting to lock monitor 0x00008a (object 0x00000006), which is held by \"Thread-1\"\n\n# 3. Prevention via Global Lock Ordering in Java:\n// ALWAYS acquire locks in ascending order of their IDs:\npublic void lockBoth(Account a1, Account a2) {\n    Account first = a1.getId() < a2.getId() ? a1 : a2;\n    Account second = a1.getId() < a2.getId() ? a2 : a1;\n    synchronized (first) {\n        synchronized (second) {\n            // Safe: Circular wait is mathematically impossible!\n        }\n    }\n}",
              explanation: "Enforcing consistent global resource ordering mathematically breaks the Circular Wait condition."
            },
            tradeoffs: "Global lock ordering requires all developers across a team to adhere strictly to the established sorting rule.",
            followUpQuestions: [
              {
                question: "Can programmatic deadlocks be detected at runtime inside Java code?",
                answer: "Yes, using ManagementFactory.getThreadMXBean().findDeadlockedThreads()."
              }
            ],
            usedInProduction: "Standard SRE diagnostic playbook during high-severity production outage triage.",
            relatedTopics: ["Coffman Conditions", "jstack", "Thread Dumps"]
          }
        },
        {
          id: "java-17-conc-5",
          question: "What are ThreadLocal variables and why do they cause catastrophic memory leaks in thread pools?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "ThreadLocal provides thread-confined variables; in thread pools (Tomcat/Spring), worker threads never die, so failing to call threadLocal.remove() retains references indefinitely, causing major memory leaks.",
            mentalModel: "Leaving your winter coat inside a rental bowling locker: if the bowling alley never resets the locker for the next bowler, coats accumulate until the facility runs out of space.",
            whatItIs: "ThreadLocal<T> stores data in a ThreadLocalMap held by the current Thread object. In a web server, worker threads are reused across thousands of HTTP requests. If Request 1 sets ThreadLocal<UserContext> and fails to call .remove(), the UserContext object remains pinned in memory for the lifetime of the JVM thread pool, causing OutOfMemoryError and security data leaks across users.",
            whyItExists: "Allows passing contextual data (security tokens, transaction IDs, database connections) through deeply nested calls without passing them as explicit method parameters.",
            codeDemo: {
              language: "java",
              code: "public class SecurityContextHolder {\n    private static final ThreadLocal<UserContext> CONTEXT = new ThreadLocal<>();\n\n    public static void set(UserContext user) { CONTEXT.set(user); }\n    public static UserContext get() { return CONTEXT.get(); }\n    public static void clear() { CONTEXT.remove(); } // MANDATORY!\n}\n\n// Enterprise Filter Pattern: Always clean up in finally block!\npublic void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) \n        throws IOException, ServletException {\n    try {\n        SecurityContextHolder.set(extractUser(req));\n        chain.doFilter(req, res); // Process web request\n    } finally {\n        // CRITICAL: Must remove to prevent memory leaks and data bleeding!\n        SecurityContextHolder.clear();\n    }\n}",
              explanation: "The finally block guarantees clean removal even if downstream code throws an exception."
            },
            tradeoffs: "ThreadLocal variables cannot be safely read by child asynchronous threads spawned by CompletableFuture or parallel streams (use InheritableThreadLocal with caution).",
            followUpQuestions: [
              {
                question: "Why does ThreadLocalMap use WeakReferences for keys but strong references for values?",
                answer: "The key is a WeakReference to the ThreadLocal object, but the value is strongly referenced. If the ThreadLocal is garbage collected, the value remains pinned in memory until remove() is called or the thread dies."
              }
            ],
            usedInProduction: "Spring Security's SecurityContextHolder and MDC (Mapped Diagnostic Context) in SLF4J logging.",
            relatedTopics: ["Memory Leaks", "ThreadLocalMap", "MDC Logging"]
          }
        },
        {
          id: "java-17-conc-6",
          question: "What is Condition in java.util.concurrent.locks and how does it replace wait(), notify(), and notifyAll()?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-05",
          answer: {
            quickAnswer: "Condition decouples thread waiting into multiple distinct wait-sets per lock (await/signal), solving the notifyAll() herd effect inherent in object monitors.",
            mentalModel: "A doctor's office with two separate waiting rooms: one for patients waiting for X-rays (notFull), one for patients waiting for test results (notEmpty). The receptionist can summon only the X-ray patients without disturbing the test-result patients.",
            whatItIs: "An intrinsic synchronized monitor lock has only ONE single wait-set (calling wait() or notify() wakes arbitrary threads). A single ReentrantLock can create multiple distinct Condition instances: lock.newCondition(). A thread can wait specifically on notFull.await() or notEmpty.await(), allowing targeted signaling via signal().",
            whyItExists: "Enables efficient bounded buffers and queues without waking up dozens of threads that cannot proceed (thundering herd problem).",
            codeDemo: {
              language: "java",
              code: "public class BoundedBuffer<T> {\n    private final ReentrantLock lock = new ReentrantLock();\n    private final Condition notFull  = lock.newCondition(); // Producers wait here\n    private final Condition notEmpty = lock.newCondition(); // Consumers wait here\n    private final Object[] items = new Object[10];\n    private int count = 0, putptr = 0, takeptr = 0;\n\n    public void put(T x) throws InterruptedException {\n        lock.lock();\n        try {\n            while (count == items.length) notFull.await(); // Wait until space exists\n            items[putptr] = x;\n            if (++putptr == items.length) putptr = 0;\n            count++;\n            notEmpty.signal(); // Wake up ONE waiting consumer!\n        } finally { lock.unlock(); }\n    }\n\n    public T take() throws InterruptedException {\n        lock.lock();\n        try {\n            while (count == 0) notEmpty.await(); // Wait until item exists\n            T x = (T) items[takeptr];\n            if (++takeptr == items.length) takeptr = 0;\n            count--;\n            notFull.signal(); // Wake up ONE waiting producer!\n            return x;\n        } finally { lock.unlock(); }\n    }\n}",
              explanation: "notFull and notEmpty allow targeted signaling without waking the wrong thread type."
            },
            tradeoffs: "Always await inside a while loop (while (condition) condition.await();) to guard against spurious wakeups.",
            followUpQuestions: [
              {
                question: "What is a spurious wakeup?",
                answer: "A thread waking up from await() without having been signaled or interrupted (permitted by OS threading primitives); hence the condition must always be re-checked in a loop."
              }
            ],
            usedInProduction: "Internal implementation of ArrayBlockingQueue and custom connection pool managers.",
            relatedTopics: ["Spurious Wakeup", "Bounded Buffer", "ArrayBlockingQueue"]
          }
        }
      ]
    },
    {
      id: "memory-model-atomics",
      title: "Java Memory Model & Atomics",
      questions: [
        {
          id: "java-17-atom-1",
          question: "What is the Java Memory Model (JMM) and the Happens-Before relationship?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "The JMM defines the rules for how changes made by one thread to shared memory become visible to other threads, governed by the Happens-Before relationship which guarantees memory visibility and ordering.",
            mentalModel: "Writing an entry in an official ledger: if Action A 'happens-before' Action B, any auditor reading the ledger at Action B is mathematically guaranteed to see all changes written at Action A.",
            whatItIs: "Modern CPUs reorder instructions and use multi-level hardware caches (L1/L2/L3). Without rules, Thread 2 might see Thread 1's writes out of order or never see them at all. The Happens-Before relationship guarantees that memory writes by one action are visible to another action. Key rules: (1) Program order: each action in a thread happens-before later actions. (2) Monitor lock: unlock on a monitor happens-before subsequent lock. (3) Volatile write: write to a volatile field happens-before subsequent read. (4) Thread start/join.",
            whyItExists: "Provides a strict formal specification ensuring multithreaded Java code behaves predictably across all CPU architectures (x86, ARM, Apple Silicon).",
            codeDemo: {
              language: "java",
              code: "public class JmmDemo {\n    private int data = 0;\n    private volatile boolean ready = false;\n\n    // Thread 1:\n    public void writer() {\n        data = 42;          // 1. Normal write\n        ready = true;       // 2. Volatile write (Memory Barrier injected!)\n    }\n\n    // Thread 2:\n    public void reader() {\n        if (ready) {        // 3. Volatile read (Memory Barrier injected!)\n            // GUARANTEED: data is 42! It can NEVER be 0 because 1 happens-before 2,\n            // 2 happens-before 3, and 3 happens-before 4!\n            System.out.println(\"Data: \" + data); \n        }\n    }\n}",
              explanation: "The volatile write-read pair establishes a happens-before edge, ensuring data=42 is visible."
            },
            tradeoffs: "Enforcing happens-before introduces memory barrier instructions (e.g. MFENCE) on the CPU, carrying a minor performance cost.",
            followUpQuestions: [
              {
                question: "Can an optimizing JIT compiler reorder instructions across a volatile write?",
                answer: "No! The JMM forbids compiler reordering that would move normal reads/writes from before a volatile write to after it."
              }
            ],
            usedInProduction: "Low-latency message queues (LMAX Disruptor), concurrent caches, and lock-free data structures.",
            relatedTopics: ["Memory Barriers", "volatile", "Instruction Reordering"]
          }
        },
        {
          id: "java-17-atom-2",
          question: "What does the volatile keyword guarantee (visibility vs atomicity)?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "volatile guarantees Visibility (all threads see the latest value immediately from main memory) and Ordering (prevents instruction reordering), but it does NOT guarantee Atomicity.",
            mentalModel: "A glass whiteboard in the office: when someone writes a number on the glass, everyone in the room sees it instantly (visibility). But if two people try to write on the same glass at the exact same second, their markers collide and produce illegible scribbles (no atomicity).",
            whatItIs: "Marking a field volatile forces the CPU to flush writes to main memory and invalidate local CPU caches on reads. However, compound operations like count++ (which consists of read -> increment -> write) are NOT atomic. Two threads executing count++ concurrently will overwrite each other even if count is volatile.",
            whyItExists: "Provides a lightweight synchronization mechanism without the overhead of locks for simple state flags.",
            comparisonTable: {
              title: "volatile vs Synchronized / Atomic (Visibility vs Atomicity)",
              headers: ["Property / Operation", "volatile Keyword", "Atomic Variables (e.g. AtomicInteger)", "synchronized / ReentrantLock"],
              rows: [
                ["Visibility Guarantee", "Yes: writes immediately flushed to main memory", "Yes: volatile memory semantics on internal value", "Yes: memory barrier on lock acquisition/release"],
                ["Instruction Reordering", "Prevented via memory barriers (Happens-Before)", "Prevented via memory barriers", "Prevented across lock boundaries"],
                ["Compound Operations (e.g. count++)", "No: prone to race conditions and lost updates", "Yes: hardware CAS loop ensures atomicity", "Yes: mutually exclusive block ensures atomicity"],
                ["Locking Overhead", "Zero locking overhead (pure CPU cache control)", "Zero mutex locking; non-blocking CAS", "Thread suspension, context switching overhead"],
                ["Primary Use Case", "Status flags, cancellation signals, one-writer flags", "High-frequency counters, sequence generators", "Complex multi-variable transactional updates"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "public class VolatileTest {\n    // ✅ CORRECT USE OF VOLATILE: Simple boolean shutdown flag\n    private volatile boolean running = true;\n\n    public void stop() { running = false; } // Visible to worker thread instantly\n    public void run() {\n        while (running) {\n            // Worker executes without infinite loop caching bug\n        }\n    }\n\n    // ❌ FLAWED USE OF VOLATILE: Counter (NOT thread-safe!)\n    private volatile int counter = 0;\n    public void increment() {\n        // Race condition! counter++ is THREE bytecode steps:\n        // 1. getfield (read)\n        // 2. iadd (add 1)\n        // 3. putfield (write)\n        counter++; // Inaccurate under multiple threads! Use AtomicInteger instead!\n    }\n}",
              explanation: "volatile ensures running=false is seen instantly, but counter++ suffers from race conditions."
            },
            tradeoffs: "Use volatile for single-write status flags; use AtomicInteger, LongAdder, or synchronized when multiple threads perform read-modify-write compound actions.",
            followUpQuestions: [
              {
                question: "How do you make counter++ thread-safe?",
                answer: "Use AtomicInteger.incrementAndGet() (lock-free CAS) or wrap the increment in synchronized."
              }
            ],
            usedInProduction: "Graceful shutdown flags in background worker threads and double-checked locking in lazy singletons.",
            relatedTopics: ["AtomicInteger", "Race Condition", "Double-Checked Locking"]
          }
        },
        {
          id: "java-conc-bigdecimal-1",
          question: "Why is BigDecimal preferred over double for monetary calculations? Why avoid double even when the database uses DECIMAL?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "double uses IEEE 754 binary floating-point which cannot precisely represent decimal fractions (0.1 + 0.2 != 0.3); BigDecimal provides exact arbitrary-precision decimal representation with configurable rounding modes.",
            mentalModel: "Imagine measuring fine gold dust with a crude carpenter's tape measure (double) vs an ultra-precise digital scale (BigDecimal). The tape measure rounds off fractions, losing gold on every transaction.",
            whatItIs: "double is a binary floating-point type where base-10 fractions like 0.1 become repeating infinite fractions in base-2 (0.10000000000000000555...). BigDecimal stores an unscaled BigInteger and an integer scale, allowing exact decimal calculations. Even if a SQL database stores DECIMAL, loading it into a Java double converts the exact decimal into an imprecise binary approximation.",
            whyItExists: "Financial regulations require exact penny precision; compounding rounding errors in high-volume banking cause real financial losses.",
            codeDemo: {
              language: "java",
              code: "// ❌ The double trap:\ndouble d1 = 0.1;\ndouble d2 = 0.2;\nSystem.out.println(d1 + d2); // 0.30000000000000004 (WRONG!)\n\n// ❌ WRONG: Creating BigDecimal from double retains the flaw!\nBigDecimal bad = new BigDecimal(0.1); // 0.10000000000000000555...\n\n// ✅ CORRECT: Always use String constructor or BigDecimal.valueOf:\nBigDecimal b1 = new BigDecimal(\"0.1\");\nBigDecimal b2 = new BigDecimal(\"0.2\");\nBigDecimal sum = b1.add(b2);\nSystem.out.println(sum); // 0.3 (EXACT!)\n\n// ✅ Safe comparison with compareTo (equals checks scale too!):\nBigDecimal one = new BigDecimal(\"1.0\");\nBigDecimal oneZero = new BigDecimal(\"1.00\");\nSystem.out.println(one.equals(oneZero)); // false! (Scale differs)\nSystem.out.println(one.compareTo(oneZero) == 0); // true! (Values equal)",
              explanation: "Always use new BigDecimal(String) and use compareTo() for value comparisons."
            },
            tradeoffs: "BigDecimal is immutable and slower than primitive double; use compareTo() instead of equals() to ignore trailing zeroes.",
            followUpQuestions: [
              {
                question: "Why does BigDecimal.equals() return false for 1.0 and 1.00?",
                answer: "Because equals() compares both numerical value AND scale (number of digits to the right of the decimal point). Use compareTo() to compare numerical value only."
              }
            ],
            usedInProduction: "Core banking platforms (Stripe, PayPal, Adyen) for all monetary amounts, fees, and currency conversions.",
            relatedTopics: ["IEEE 754", "RoundingMode", "Financial Computing"]
          }
        },
        {
          id: "java-17-atom-3",
          question: "How do atomic classes (AtomicInteger, AtomicReference) work using hardware Compare-And-Swap (CAS)?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "Atomic classes use non-blocking CPU instructions (Compare-And-Swap) that update memory only if it matches an expected value; if another thread updated it first, the operation retries in an optimistic loop without locking.",
            mentalModel: "Reserving a seat on an airplane: you tell the server 'I want seat 4A, assuming it is currently EMPTY'. If someone booked it half a second before you, the server rejects your update, and your app refreshes the screen to pick another seat.",
            whatItIs: "CAS is a single atomic hardware CPU instruction (e.g. CMPXCHG on x86). It accepts: memory address (V), expected value (A), and new value (B). If V == A, V is updated to B and returns true. If V != A, it does nothing and returns false. AtomicInteger.incrementAndGet() executes CAS in a loop until it succeeds, achieving thread safety with zero mutex lock overhead.",
            whyItExists: "Locks (synchronized/mutex) involve kernel transitions, context switching, and thread suspension. CAS operates directly at hardware CPU speeds.",
            codeDemo: {
              language: "java",
              code: "import java.util.concurrent.atomic.AtomicInteger;\n\npublic class CasCounter {\n    private final AtomicInteger count = new AtomicInteger(0);\n\n    public void increment() {\n        // Non-blocking atomic increment:\n        count.incrementAndGet();\n    }\n\n    // Conceptual implementation of how CAS works internally:\n    public int customUpdate(int delta) {\n        int current;\n        int next;\n        do {\n            current = count.get(); // Read current expected value\n            next = current + delta;\n            // Atomically update ONLY if memory still equals 'current':\n        } while (!count.compareAndSet(current, next)); // Retry on race\n        return next;\n    }\n}",
              explanation: "compareAndSet retries optimistic loop execution without suspending the thread."
            },
            tradeoffs: "Under extreme thread contention (dozens of threads pounding one counter), repeated CAS retries burn CPU cycles; use LongAdder instead.",
            followUpQuestions: [
              {
                question: "What is the ABA problem in CAS?",
                answer: "A value changes from A to B and back to A; CAS succeeds thinking nothing changed. Solved using AtomicStampedReference which pairs values with version stamps."
              }
            ],
            usedInProduction: "High-throughput metric counters, rate limiters, and lock-free thread-pool queues.",
            relatedTopics: ["Compare-And-Swap", "ABA Problem", "AtomicStampedReference"]
          }
        },
        {
          id: "java-17-atom-4",
          question: "What is the difference between LongAdder and AtomicLong under heavy thread contention?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "AtomicLong uses a single memory location where all threads contend on one CAS loop; LongAdder stripes the counter across an internal array of cells, allowing threads to update different cells without contention and summing them on demand.",
            mentalModel: "A grocery store with 1 register (AtomicLong) where 100 shoppers fight to pay. LongAdder opens 8 self-checkout lanes (cells); each shopper uses an open lane, and the manager sums receipts at the end of the day.",
            whatItIs: "Introduced in Java 8 and standard in Java 17: under low contention, LongAdder updates a base variable like AtomicLong. Under high contention, it dynamically expands an array of Cell objects. Each thread hashes to a separate Cell to avoid cache line bouncing. calling sum() aggregates all cells.",
            whyItExists: "AtomicLong performance collapses exponentially under high contention as CPU cores repeatedly invalidate each other's L1/L2 caches.",
            comparisonTable: {
              title: "LongAdder vs AtomicLong Comparison Matrix",
              headers: ["Dimension", "AtomicLong", "LongAdder (Java 8+)"],
              rows: [
                ["Internal Architecture", "Single 64-bit volatile memory location", "Striped array of `Cell` objects + base variable"],
                ["Contention Scaling", "Degrades sharply: all threads spin on single CAS", "Scales linearly: threads hash to independent cells"],
                ["Throughput Under Load", "Low to moderate under heavy thread contention", "Extremely high (~10x faster under high parallelism)"],
                ["Memory Footprint", "Minimal: 8-byte primitive + object header", "Higher: dynamic cell array allocation with cache padding"],
                ["Read Cost / Accuracy", "`get()` is instantaneous, exact atomic snapshot", "`sum()` must iterate and accumulate all cells (eventual/approximate)"],
                ["CAS Operations", "Supports `compareAndSet()`, `getAndAdd()`, etc.", "No arbitrary CAS support (only increment/add/sum)"],
                ["Best Production Use Case", "Strict sequence numbering, unique ID generation", "Throughput metrics, telemetry counters, access logs"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "import java.util.concurrent.atomic.AtomicLong;\nimport java.util.concurrent.atomic.LongAdder;\n\npublic class CounterBenchmark {\n    // Under 32 concurrent threads hammering the counter:\n    // AtomicLong: Heavy CPU cache invalidation, throughput drops\n    private final AtomicLong atomicLong = new AtomicLong(0);\n\n    // LongAdder: ~10x higher throughput under multi-core contention!\n    private final LongAdder longAdder = new LongAdder();\n\n    public void recordHit() {\n        longAdder.increment(); // Distributes writes across internal cells\n    }\n\n    public long getMetrics() {\n        return longAdder.sum(); // Sums cells together on read\n    }\n}",
              explanation: "LongAdder trades a small amount of memory to eliminate thread contention entirely."
            },
            tradeoffs: "LongAdder consumes more memory and sum() is a snapshot (not an instantaneous atomic point-in-time state); for exact state sequencing, stick with AtomicLong.",
            followUpQuestions: [
              {
                question: "When should you choose AtomicLong over LongAdder?",
                answer: "When you need atomic compare-and-set operations (e.g. CAS sequence generators) or when read frequency matches write frequency."
              }
            ],
            usedInProduction: "Prometheus metric counters, Micrometer telemetry, and web server request-rate metrics.",
            relatedTopics: ["Striped64", "Cache Invalidation", "Throughput Optimization"]
          }
        },
        {
          id: "java-17-atom-5",
          question: "What is the VarHandle API (JEP 193) and how does it replace sun.misc.Unsafe?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-05",
          answer: {
            quickAnswer: "VarHandle is a standard, safe, and performant API introduced to perform atomic memory operations (CAS, volatile reads/writes, acquire/release fences) on variables without resorting to proprietary sun.misc.Unsafe.",
            mentalModel: "Upgrading from an illegal back-alley lockpick (Unsafe) to an official certified electronic master keycard (VarHandle).",
            whatItIs: "Historically, high-performance library authors used sun.misc.Unsafe for low-overhead volatile and CAS operations. Java 9 introduced java.lang.invoke.VarHandle, which provides typed variable references supporting fine-grained memory access modes: get/set (plain), getVolatile/setVolatile, getAcquire/setRelease, and compareAndSet.",
            whyItExists: "Java 17 strongly encapsulates JDK internals and deprecates Unsafe; VarHandle provides an official, safe alternative with zero JVM overhead.",
            codeDemo: {
              language: "java",
              code: "import java.lang.invoke.MethodHandles;\nimport java.lang.invoke.VarHandle;\n\npublic class Node {\n    private volatile int state = 0;\n    private static final VarHandle STATE_HANDLE;\n\n    static {\n        try {\n            STATE_HANDLE = MethodHandles.lookup()\n                .findVarHandle(Node.class, \"state\", int.class);\n        } catch (ReflectiveOperationException e) {\n            throw new ExceptionInInitializerError(e);\n        }\n    }\n\n    public boolean tryActivate() {\n        // Atomic CAS directly on the 'state' field without wrapping in AtomicInteger!\n        return STATE_HANDLE.compareAndSet(this, 0, 1);\n    }\n}",
              explanation: "VarHandle performs atomic CAS directly on a plain int field, avoiding the heap allocation of an AtomicInteger object."
            },
            tradeoffs: "VarHandle lookups must be performed inside static initializers; lookup errors throw ReflectiveOperationException.",
            followUpQuestions: [
              {
                question: "What access modes does VarHandle support?",
                answer: "Plain, Opaque, Release/Acquire, and Volatile access modes, reflecting the C++11 memory model."
              }
            ],
            usedInProduction: "Core engine of modern concurrent libraries, Netty buffer pools, and Project Reactor internals.",
            relatedTopics: ["sun.misc.Unsafe", "Memory Access Modes", "MethodHandles"]
          }
        },
        {
          id: "java-17-atom-6",
          question: "What is False Sharing and how does @Contended prevent CPU cache line ping-pong?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-06",
          answer: {
            quickAnswer: "False sharing occurs when independent variables accessed by different threads reside on the same 64-byte CPU cache line, causing unnecessary cache invalidation; @Contended adds padding to isolate variables onto distinct cache lines.",
            mentalModel: "Two neighbors sharing a duplex wall: whenever neighbor A hammers a nail, neighbor B's pictures fall off the wall, even though neither enters the other's apartment.",
            whatItIs: "CPUs manage memory in 64-byte cache lines. If Thread 1 updates variable X and Thread 2 updates variable Y, and both X and Y sit in the same 64-byte chunk of memory, core 1 invalidates core 2's cache line on every single write. @jdk.internal.vm.annotation.Contended inserts 128 bytes of padding around fields to prevent this ping-pong effect.",
            whyItExists: "Crucial for ultra-high-throughput architectures where cache invalidation is the primary latency bottleneck.",
            codeDemo: {
              language: "java",
              code: "// Problem: value1 and value2 sit next to each other on the same 64-byte cache line!\npublic class FalseSharingDemo {\n    public volatile long value1 = 0L; // 8 bytes\n    public volatile long value2 = 0L; // 8 bytes\n    // Thread 1 writing value1 constantly invalidates Thread 2 reading value2!\n}\n\n// Solution: LongAdder's internal Cell uses @Contended padding:\n// @jdk.internal.vm.annotation.Contended\n// static final class Cell {\n//     volatile long value;\n//     // JVM injects padding bytes before and after 'value'!\n// }",
              explanation: "Padding ensures each thread's cache line remains unaffected by neighboring variables."
            },
            tradeoffs: "Padding consumes additional memory (128 bytes per variable); only apply on heavily contended hot fields.",
            followUpQuestions: [
              {
                question: "What flag is required to use @Contended in user applications?",
                answer: "-XX:-RestrictContended (by default, @Contended is restricted to internal JDK classes)."
              }
            ],
            usedInProduction: "Disruptor RingBuffer, LongAdder Cells, and ultra-low latency exchange matching engines.",
            relatedTopics: ["CPU Cache Lines", "False Sharing", "Memory Alignment"]
          }
        }
      ]
    },
    {
      id: "concurrent-collections",
      title: "Concurrent Collections",
      questions: [
        {
          id: "java-conc-map-1",
          question: "What is the difference between HashMap and ConcurrentHashMap? Why is HashMap dangerous in concurrent applications?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "HashMap is not thread-safe — concurrent puts can cause data loss, corruption, or infinite loops (Java 7). ConcurrentHashMap uses CAS + per-bucket synchronization, allowing high-concurrency reads and writes without locking the entire map.",
            mentalModel: "Imagine a library where anyone can simultaneously rearrange shelves (HashMap). If two librarians rearrange at the same time, books end up misplaced or a shelf collapses. ConcurrentHashMap assigns each shelf its own librarian — only that shelf pauses during rearrangement; all others operate normally.",
            whatItIs: "HashMap has zero synchronization. ConcurrentHashMap is designed specifically for thread-safety. In Java 8/17, reads are completely lock-free via volatile node references. Writes use Compare-And-Swap (CAS) to insert the first node in a bucket, or synchronize only on the head node of that specific bucket, allowing concurrent writes to different buckets.",
            whyItExists: "Hashtable and Collections.synchronizedMap() lock the entire map on every operation, creating an intolerable performance bottleneck in modern multi-core servers.",
            comparisonTable: {
              title: "HashMap vs ConcurrentHashMap Comparison",
              headers: ["Dimension", "HashMap", "ConcurrentHashMap (Java 8/17)"],
              rows: [
                ["Thread Safety", "Not thread-safe (data corruption, infinite loops)", "Thread-safe across all concurrent operations"],
                ["Locking Strategy", "None (completely unsynchronized)", "Lock-free volatile reads; CAS + per-bucket head-node locks"],
                ["Null Keys and Values", "Allows 1 null key and multiple null values", "Disallows null keys AND null values (throws NPE)"],
                ["Concurrency Overhead", "Zero overhead (fastest for single-threaded usage)", "Slight memory and CPU overhead for concurrency metadata"],
                ["Atomic Compound Methods", "No native atomic operations (e.g. `putIfAbsent`)", "Rich atomic API: `computeIfAbsent`, `merge`, `replace`"],
                ["Performance Under Contention", "Unsafe / corrupted data structure", "High throughput: concurrent writes to different buckets without blocking"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// ❌ DANGEROUS: HashMap in concurrent threads leads to race conditions:\nMap<String, Integer> unsafeMap = new HashMap<>();\n\n// ✅ ConcurrentHashMap: Thread-safe, highly scalable\nMap<String, Integer> safeMap = new ConcurrentHashMap<>();\n\n// Atomic computeIfAbsent: executes lambda only if key absent\nsafeMap.computeIfAbsent(\"user_101\", k -> 100);\n\n// Atomic merge: sums counter safely across threads\nsafeMap.merge(\"visitors\", 1, Integer::sum);\n\n// ⚠️ Gotcha: ConcurrentHashMap disallows NULL keys and NULL values!\n// safeMap.put(null, 1); // Throws NullPointerException!\n// safeMap.put(\"key\", null); // Throws NullPointerException!",
              explanation: "ConcurrentHashMap disallows null keys and values to prevent ambiguous concurrency states."
            },
            tradeoffs: "ConcurrentHashMap is slightly slower than HashMap in single-threaded code and disallows null keys/values.",
            followUpQuestions: [
              {
                question: "Why does ConcurrentHashMap disallow null keys and null values?",
                answer: "Because in a concurrent context, map.get(k) == null is ambiguous: does the key not exist, or is it mapped to null? Checking containsKey(k) after get(k) is a race condition because another thread could have added the key in between."
              }
            ],
            usedInProduction: "Caching session tokens, frequency counters, and rate-limiting buckets in Spring Boot web apps.",
            relatedTopics: ["ConcurrentHashMap", "Thread Safety", "Collections.synchronizedMap"]
          }
        },
        {
          id: "java-17-c-coll-2",
          question: "How does ConcurrentHashMap achieve thread-safety internally in Java 8/17 without segment locking?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "Java 8/17 replaced Java 7's Segment array with a Node array using lock-free CAS for empty buckets and synchronized locks on individual bucket head nodes for populated buckets, converting long collision lists into Red-Black Trees.",
            mentalModel: "Upgrading from 16 warehouse security zones (Java 7 segments) to a smart warehouse where every individual shelf bin has its own lock, and checking inventory (reading) requires no lock at all.",
            whatItIs: "Internal mechanics: (1) Reads: completely lock-free using volatile memory reads on node items and next pointers. (2) Writes to empty bucket: uses CAS to insert the new Node without locking. (3) Writes to existing bucket: uses synchronized(headNode) to lock only that specific bucket. (4) Treeification: when a bucket exceeds 8 nodes (TREEIFY_THRESHOLD) and table capacity >= 64, it converts into a Red-Black Tree (TreeBin) with O(log N) operations.",
            whyItExists: "Java 7 had a fixed concurrency level of 16 Segments. Modern Java scales concurrency dynamically to match the number of buckets in the hash table.",
            codeDemo: {
              language: "java",
              code: "// Simplified conceptual snippet of ConcurrentHashMap write logic:\nfinal V putVal(K key, V value) {\n    int hash = spread(key.hashCode());\n    for (Node<K,V>[] tab = table;;) {\n        Node<K,V> f;\n        int i = (n - 1) & hash; // Calculate bucket index\n        if ((f = tabAt(tab, i)) == null) {\n            // 1. Bucket is empty -> Use lock-free CAS to insert!\n            if (casTabAt(tab, i, null, new Node<>(hash, key, value)))\n                break; // Success with zero locking!\n        }\n        else {\n            // 2. Bucket is populated -> Lock ONLY the head node 'f'!\n            synchronized (f) {\n                // Insert into linked list or Red-Black Tree\n            }\n        }\n    }\n}",
              explanation: "Notice empty buckets use CAS; populated buckets lock only the head node."
            },
            tradeoffs: "TreeBin nodes consume more memory than linked list nodes; size() returns an estimated count using LongAdder-style base and counter cells.",
            followUpQuestions: [
              {
                question: "How does ConcurrentHashMap.size() work?",
                answer: "It uses a base count and an array of CounterCells (like LongAdder) to avoid contending on a single size counter."
              }
            ],
            usedInProduction: "Standard in-memory store for high-throughput messaging brokers and web application caches.",
            relatedTopics: ["Treeification", "CAS", "Red-Black Tree"]
          }
        },
        {
          id: "java-17-c-coll-3",
          question: "What is CopyOnWriteArrayList and when should you choose it over synchronized lists?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "CopyOnWriteArrayList creates a fresh copy of the backing array on every write (add, set, remove); reads are completely lock-free and iterate over an immutable snapshot without ConcurrentModificationException.",
            mentalModel: "Publishing a printed daily newspaper: printing a new edition is expensive (copy on write), but thousands of commuters can read their copies simultaneously on the train without bothering each other (lock-free reads).",
            whatItIs: "An implementation of List where all mutative operations make a clone of the underlying array. Readers read from the current immutable array reference without any locking or synchronization. Iterators iterate over the snapshot taken at creation time and do not support remove().",
            whyItExists: "Designed for scenarios where reads vastly outnumber writes (e.g. 99% reads, 1% writes) like event listener registries.",
            codeDemo: {
              language: "java",
              code: "import java.util.concurrent.CopyOnWriteArrayList;\n\npublic class EventBus {\n    // Ideal use case: Listener registry\n    private final List<EventListener> listeners = new CopyOnWriteArrayList<>();\n\n    public void register(EventListener l) {\n        listeners.add(l); // Expensive: copies array, but rare!\n    }\n\n    public void fireEvent(Event event) {\n        // Extremely FAST: Completely lock-free read iteration!\n        // NO ConcurrentModificationException even if a listener registers during dispatch!\n        for (EventListener l : listeners) {\n            l.onEvent(event);\n        }\n    }\n}",
              explanation: "Iterating CopyOnWriteArrayList never throws ConcurrentModificationException."
            },
            tradeoffs: "Writes are O(N) memory allocations; terrible choice for write-heavy workloads.",
            followUpQuestions: [
              {
                question: "What happens if you call iterator.remove() on a CopyOnWriteArrayList?",
                answer: "It throws UnsupportedOperationException because the iterator operates on an immutable snapshot."
              }
            ],
            usedInProduction: "Event listener registries, routing tables, and security authorization rule sets.",
            relatedTopics: ["Snapshot Iteration", "EventBus Pattern", "CopyOnWriteArraySet"]
          }
        },
        {
          id: "java-17-c-coll-4",
          question: "What are Blocking Queues (ArrayBlockingQueue, LinkedBlockingQueue) in Producer-Consumer architectures?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "BlockingQueue blocks producers when the queue is full (put) and blocks consumers when the queue is empty (take), providing backpressure and thread coordination for producer-consumer workflows.",
            mentalModel: "A restaurant kitchen ticket rack: if the rack has 10 tickets (full), the waiter waits before posting more orders. If the rack is empty, the chef waits for a new ticket to appear.",
            whatItIs: "Key implementations: (1) ArrayBlockingQueue: bounded queue backed by a circular array using a single lock for both put and take. (2) LinkedBlockingQueue: optionally bounded queue backed by linked nodes using two separate locks (takeLock and putLock) for higher producer-consumer concurrency.",
            whyItExists: "Core concurrency primitive that prevents producers from overwhelming consumers and running the system out of memory.",
            codeDemo: {
              language: "java",
              code: "BlockingQueue<Order> queue = new LinkedBlockingQueue<>(100); // Bounded queue!\n\n// Producer Thread:\nRunnable producer = () -> {\n    try {\n        while (true) {\n            Order order = generateOrder();\n            queue.put(order); // BLOCKS if queue is full (Backpressure!)\n        }\n    } catch (InterruptedException e) { Thread.currentThread().interrupt(); }\n};\n\n// Consumer Thread:\nRunnable consumer = () -> {\n    try {\n        while (true) {\n            Order order = queue.take(); // BLOCKS if queue is empty!\n            processOrder(order);\n        }\n    } catch (InterruptedException e) { Thread.currentThread().interrupt(); }\n};",
              explanation: "put() and take() coordinate flow control automatically without manual wait/notify code."
            },
            tradeoffs: "Never use an unbounded LinkedBlockingQueue in production; producers running faster than consumers will exhaust JVM heap memory.",
            followUpQuestions: [
              {
                question: "Why does LinkedBlockingQueue have higher throughput than ArrayBlockingQueue?",
                answer: "LinkedBlockingQueue uses two separate locks (one for head, one for tail), allowing a producer and a consumer to operate simultaneously."
              }
            ],
            usedInProduction: "ThreadPoolExecutor task queues and asynchronous log appenders (Logback/Log4j2 AsyncAppender).",
            relatedTopics: ["Backpressure", "ThreadPoolExecutor", "Producer-Consumer"]
          }
        },
        {
          id: "java-17-c-coll-5",
          question: "What is ConcurrentLinkedQueue and how does it use the Michael & Scott lock-free algorithm?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-05",
          answer: {
            quickAnswer: "ConcurrentLinkedQueue is an unbounded thread-safe FIFO queue that uses non-blocking Compare-And-Swap (CAS) pointers rather than locks, based on the Michael & Scott algorithm.",
            mentalModel: "A conveyor belt where packages are attached using magnets that automatically latch on with zero gears or brake pads.",
            whatItIs: "Unlike BlockingQueue which blocks threads when empty/full, ConcurrentLinkedQueue never blocks. Operations like poll() return null if empty, and offer() always succeeds immediately. It maintains volatile head and tail pointers and updates node links atomically using CAS loops.",
            whyItExists: "Delivers maximum throughput for non-blocking task distribution where threads should never be put to sleep by the OS.",
            codeDemo: {
              language: "java",
              code: "ConcurrentLinkedQueue<Task> taskQueue = new ConcurrentLinkedQueue<>();\n\n// Lock-free insertion (never blocks):\ntaskQueue.offer(new Task(\"Task 1\"));\n\n// Lock-free retrieval (returns null if empty, never blocks):\nTask next = taskQueue.poll();\nif (next != null) {\n    next.execute();\n}\n\n// Warning: size() is NOT O(1)!\n// int s = taskQueue.size(); // O(N) traversal! Avoid in loops!",
              explanation: "poll() returns null immediately if empty rather than blocking the calling thread."
            },
            tradeoffs: "taskQueue.size() is an O(N) traversal, not O(1); use isEmpty() instead of size() == 0.",
            followUpQuestions: [
              {
                question: "Why is ConcurrentLinkedQueue.size() O(N)?",
                answer: "Because maintaining an exact atomic size counter in a lock-free queue would require contention on that counter, destroying the lock-free throughput advantage."
              }
            ],
            usedInProduction: "Netty event loop message queues and low-latency actor frameworks (Akka).",
            relatedTopics: ["Michael & Scott Algorithm", "Lock-Free", "CAS"]
          }
        },
        {
          id: "java-17-c-coll-6",
          question: "What is the difference between ConcurrentSkipListMap and ConcurrentHashMap?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-06",
          answer: {
            quickAnswer: "ConcurrentHashMap is an unordered O(1) hash table; ConcurrentSkipListMap is a thread-safe, sorted, lock-free map implementing NavigableMap with O(log N) operations based on a Skip List.",
            mentalModel: "ConcurrentHashMap is numbered storage bins (fast O(1) lookups, but unsorted). ConcurrentSkipListMap is an alphabetized card catalog with express express-elevator skip tabs to jump directly to sections (sorted, O(log N)).",
            whatItIs: "ConcurrentSkipListMap is the concurrent equivalent of TreeMap. It maintains keys in sorted natural order (or via a custom Comparator). A Skip List is a probabilistic multi-level linked list where higher levels skip over elements to achieve O(log N) search, insertion, and deletion without complex tree rebalancing locks.",
            whyItExists: "TreeMap cannot be safely concurrent without locking the entire tree; ConcurrentSkipListMap provides a lock-free concurrent sorted map.",
            comparisonTable: {
              title: "ConcurrentHashMap vs ConcurrentSkipListMap",
              headers: ["Dimension", "ConcurrentHashMap", "ConcurrentSkipListMap"],
              rows: [
                ["Ordering", "Unordered (hash-based bucket distribution)", "Sorted (natural ordering or custom `Comparator`)"],
                ["Data Structure", "Hash table with linked lists and Red-Black trees", "Probabilistic Skip List (multi-level linked lists)"],
                ["Time Complexity", "O(1) average for get, put, remove", "O(log N) for get, put, remove, and range searches"],
                ["Range Queries", "No support for range queries or submaps", "Full `NavigableMap` support: `subMap`, `headMap`, `tailMap`"],
                ["Null Keys / Values", "Neither null keys nor null values allowed", "Neither null keys nor null values allowed"],
                ["Primary Use Case", "General-purpose high-speed caching and lookups", "Leaderboards, sliding time windows, sorted indexes"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "import java.util.concurrent.ConcurrentSkipListMap;\n\n// Thread-safe sorted map:\nConcurrentSkipListMap<Integer, String> scores = new ConcurrentSkipListMap<>();\nscores.put(85, \"Bob\");\nscores.put(95, \"Alice\");\nscores.put(70, \"Charlie\");\n\n// Navigable range queries (thread-safe!):\nSystem.out.println(\"Highest: \" + scores.lastEntry()); // 95=Alice\nSystem.out.println(\"Submap >= 80: \" + scores.tailMap(80)); // {85=Bob, 95=Alice}\n\n// Lock-free concurrent reads and writes:",
              explanation: "ConcurrentSkipListMap provides thread-safe range queries and sorted submaps."
            },
            tradeoffs: "ConcurrentSkipListMap operations are O(log N) compared to ConcurrentHashMap's O(1); use only when sorted keys or range queries are required.",
            followUpQuestions: [
              {
                question: "What is ConcurrentSkipListSet?",
                answer: "A thread-safe NavigableSet implementation backed by a ConcurrentSkipListMap (the concurrent equivalent of TreeSet)."
              }
            ],
            usedInProduction: "Leaderboards, time-window sliding metrics, and order book matching engines in crypto/equities.",
            relatedTopics: ["Skip List", "NavigableMap", "TreeMap"]
          }
        }
      ]
    },
    {
      id: "virtual-threads-loom",
      title: "Virtual Threads & Project Loom",
      questions: [
        {
          id: "java-17-loom-1",
          question: "What are Virtual Threads (Project Loom) and how do they differ from OS Platform Threads?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-01",
          answer: {
            quickAnswer: "Platform threads are heavy 1-to-1 OS kernel threads with fixed 1MB stacks; Virtual Threads are ultra-lightweight JVM-managed threads with small dynamic stacks (few hundred bytes) that allow running millions of concurrent threads.",
            mentalModel: "Platform threads are full-sized commercial airplanes (expensive, limited to a few hundred flights). Virtual threads are passengers: millions of passengers ride on a few dozen planes (carrier threads) without each passenger needing their own private jet.",
            whatItIs: "Introduced in preview in Java 19 and finalized in Java 21 (incubated in 17 via Project Loom). In standard Java, Thread is a wrapper around an OS thread (limited to ~2,000–5,000 threads before RAM exhaustion). Virtual threads are managed entirely by the JVM runtime and multiplexed over a small pool of carrier OS platform threads.",
            whyItExists: "Brings back the simplicity of the 'one thread per request' programming model while achieving the scalability of asynchronous/reactive frameworks.",
            comparisonTable: {
              title: "Virtual Threads (Project Loom) vs Platform (OS) Threads",
              headers: ["Dimension", "Platform (OS) Threads", "Virtual Threads (Project Loom)"],
              rows: [
                ["Management / Entity", "1-to-1 mapping with OS kernel thread", "JVM-managed user-mode threads multiplexed over carrier threads"],
                ["Memory Footprint", "Heavy: ~1 MB reserved stack memory per thread", "Lightweight: ~few hundred bytes to few KB dynamic stack"],
                ["Scalability Limit", "~2,000 to 5,000 threads before OS RAM exhaustion", "Millions of concurrent threads without memory issues"],
                ["Creation Overhead", "Heavy syscall to OS kernel; thread pooling mandatory", "Near zero cost: instant instantiation; pooling is an anti-pattern"],
                ["Blocking I/O Handling", "Blocks underlying OS thread, consuming valuable resources", "Unmounts from carrier thread; parks until I/O completes"],
                ["Ideal Workload", "Long-running compute/CPU-bound mathematical tasks", "High-concurrency I/O-bound microservices (HTTP/DB calls)"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// Creating a million virtual threads with ZERO OutOfMemoryError!\npublic void launchMillionThreads() {\n    for (int i = 0; i < 1_000_000; i++) {\n        Thread.ofVirtual().start(() -> {\n            try {\n                Thread.sleep(1000); // Does NOT block the OS thread!\n            } catch (InterruptedException e) {}\n        });\n    }\n    System.out.println(\"1,000,000 threads running concurrently!\");\n}",
              explanation: "Sleeping or waiting in a virtual thread unmounts it from the carrier OS thread."
            },
            tradeoffs: "Virtual threads are designed for I/O-bound tasks (database, HTTP, disk); they provide zero throughput benefit for pure CPU-bound mathematical operations.",
            followUpQuestions: [
              {
                question: "What happens when a Virtual Thread executes a blocking I/O call?",
                answer: "The JVM unmounts the virtual thread from its carrier thread and parks it in memory; the carrier OS thread is free to execute other virtual threads."
              }
            ],
            usedInProduction: "Spring Boot 3.2+ running on Java 21 with server.tomcat.threads.max=1000000; revolutionizing cloud microservices.",
            relatedTopics: ["Project Loom", "Platform Threads", "Thread per Request"]
          }
        },
        {
          id: "java-17-loom-2",
          question: "How do Virtual Threads achieve high throughput on I/O-bound tasks using Continuation and Carrier threads?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-02",
          answer: {
            quickAnswer: "Virtual threads run on OS carrier threads; when a virtual thread encounters blocking I/O, its stack state is frozen into a Continuation object on the heap, and the carrier thread is freed to run another task.",
            mentalModel: "Playing a video game and pausing to go eat dinner: your game state is saved to memory (continuation). Your brother sits down at the console (carrier thread) and plays his game. When you return, your saved state is loaded right where you left off.",
            whatItIs: "Under the hood, Project Loom relies on java.lang.Continuation. When a virtual thread executes Socket.read() or Thread.sleep(): (1) The JVM catches the park request. (2) The call stack frames are copied from the carrier thread onto the JVM heap. (3) The carrier thread immediately picks up another virtual thread. (4) When the OS socket receives bytes, an event triggers unparking, and the continuation is mounted back onto any available carrier thread.",
            whyItExists: "Decouples thread scheduling from OS kernel context switches, making blocking operations virtually free.",
            codeDemo: {
              language: "java",
              code: "// How virtual threads eliminate blocking penalties:\nRunnable ioTask = () -> {\n    // When calling an external REST API or Database:\n    String response = makeHttpCall(); // Blocking call!\n    // The JVM unmounts this virtual thread automatically.\n    // The underlying ForkJoinPool worker thread keeps serving other requests!\n    process(response);\n};",
              explanation: "Blocking calls do not tie up OS threads; the JVM manages task suspension in user space."
            },
            tradeoffs: "Stack copying adds a tiny CPU cost; only beneficial when tasks spend significant time waiting on I/O.",
            followUpQuestions: [
              {
                question: "What is a Carrier Thread?",
                answer: "A standard OS platform thread (usually from a ForkJoinPool) that physically executes the bytecode of a virtual thread."
              }
            ],
            usedInProduction: "Modern Java web servers (Tomcat, Jetty, Helidon Nima) serving 100,000+ concurrent connections on minimal hardware.",
            relatedTopics: ["Continuations", "Carrier Threads", "Non-blocking I/O"]
          }
        },
        {
          id: "java-17-loom-3",
          question: "Why do Virtual Threads make reactive programming (WebFlux, RxJava) largely unnecessary for typical enterprise web apps?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-03",
          answer: {
            quickAnswer: "Reactive programming was invented solely to avoid blocking scarce OS threads; Virtual Threads allow writing simple, sequential, readable blocking code with the same massive concurrency scale as reactive frameworks.",
            mentalModel: "Reactive programming is speaking in complicated sign language because the room is too small for everyone to talk. Virtual Threads expands the room to the size of a stadium, so everyone can speak plain English again.",
            whatItIs: "Reactive libraries (Spring WebFlux, Project Reactor, Mono/Flux) achieve scalability by breaking code into complex callback chains (flatMap, zip, map). However, reactive code is notoriously difficult to debug, write, test, and trace (stack traces are obfuscated). Virtual threads deliver the same non-blocking scalability while letting developers write plain try-catch blocks and sequential lines of code.",
            whyItExists: "Restores human readability and debuggability to concurrent enterprise Java applications.",
            codeDemo: {
              language: "java",
              code: "// Reactive WebFlux (Complex, hard to debug, unreadable stack traces):\npublic Mono<UserDto> getUserReactive(String id) {\n    return userClient.fetchUser(id)\n        .flatMap(user -> orderClient.fetchOrders(user.getId())\n            .map(orders -> new UserDto(user, orders))\n        )\n        .onErrorResume(ex -> Mono.just(UserDto.empty()));\n}\n\n// Modern Java with Virtual Threads (Simple, sequential, full stack traces!):\npublic UserDto getUserLoom(String id) {\n    try {\n        User user = userClient.fetchUser(id); // Plain blocking call!\n        List<Order> orders = orderClient.fetchOrders(user.getId()); // Plain blocking call!\n        return new UserDto(user, orders);\n    } catch (Exception ex) {\n        return UserDto.empty();\n    }\n}",
              explanation: "Virtual threads allow readable sequential code to match the throughput of complex reactive chains."
            },
            tradeoffs: "Reactive programming still has merits for true streaming backpressure (e.g. streaming sensor feeds), but for standard request-response CRUD, virtual threads are superior.",
            followUpQuestions: [
              {
                question: "Can standard debuggers and thread dumps inspect Virtual Threads?",
                answer: "Yes! Unlike reactive Mono/Flux, Virtual Threads produce clear, chronological, human-readable stack traces."
              }
            ],
            usedInProduction: "Spring Boot 3.x teams actively migrating away from WebFlux back to Spring MVC + Virtual Threads.",
            relatedTopics: ["Spring WebFlux", "Project Reactor", "Clean Code"]
          }
        },
        {
          id: "java-17-loom-4",
          question: "How do you create and execute Virtual Threads (Executors.newVirtualThreadPerTaskExecutor())?",
          difficulty: "Medium",
          frequency: 5,
          lastVerified: "2026-10-04",
          answer: {
            quickAnswer: "Use Executors.newVirtualThreadPerTaskExecutor() to create an ExecutorService that spawns a new, short-lived virtual thread for every submitted task.",
            mentalModel: "A disposable coffee cup: you grab a fresh cup for every cup of coffee, use it, and discard it. You never wash and store 10,000 coffee cups in a shared cabinet (no pooling).",
            whatItIs: "Modern Java introduces: (1) Thread.ofVirtual().start(runnable): starts a single virtual thread. (2) Thread.ofVirtual().unstarted(runnable): creates an unstarted virtual thread. (3) Executors.newVirtualThreadPerTaskExecutor(): creates an ExecutorService where submit(task) spawns a dedicated virtual thread that terminates upon task completion.",
            whyItExists: "Seamlessly integrates virtual threads with existing ExecutorService APIs across all existing Java frameworks.",
            codeDemo: {
              language: "java",
              code: "// 1. Modern ExecutorService with Virtual Threads:\ntry (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    // Submit 10,000 tasks concurrently:\n    for (int i = 0; i < 10_000; i++) {\n        final int taskId = i;\n        executor.submit(() -> {\n            System.out.println(\"Executing task \" + taskId + \" on \" + Thread.currentThread());\n            Thread.sleep(100); // Simulate I/O\n            return taskId;\n        });\n    }\n} // AutoCloseable executor awaits all tasks to finish before exiting!\n\n// 2. Direct Thread creation:\nThread vThread = Thread.ofVirtual()\n    .name(\"audit-worker-\", 1)\n    .start(() -> System.out.println(\"Running in virtual thread!\"));",
              explanation: "try-with-resources on the executor automatically waits for all submitted virtual threads to complete."
            },
            tradeoffs: "Never pool virtual threads; creating a virtual thread is as cheap as allocating a plain Java object.",
            followUpQuestions: [
              {
                question: "Is Executors.newVirtualThreadPerTaskExecutor() AutoCloseable?",
                answer: "Yes, in Java 19+, ExecutorService implements AutoCloseable and its close() method waits for all tasks to complete."
              }
            ],
            usedInProduction: "Configuring Tomcat in Spring Boot 3 via 'spring.threads.virtual.enabled=true'.",
            relatedTopics: ["ExecutorService", "try-with-resources", "Thread.ofVirtual"]
          }
        },
        {
          id: "java-17-loom-5",
          question: "What is Thread Pinning in Virtual Threads and why does synchronized block carrier threads?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-05",
          answer: {
            quickAnswer: "Thread pinning occurs when a virtual thread cannot be unmounted from its OS carrier thread during blocking I/O, typically caused by executing I/O inside a synchronized block or native method (JNI).",
            mentalModel: "Handcuffing the airline passenger to the pilot's seat: the passenger cannot step off the plane during a layover, forcing the entire airplane to stay grounded on the runway.",
            whatItIs: "When a virtual thread executes a blocking operation inside a synchronized block/method or calling a native JNI method, the JVM's current implementation cannot unmount the virtual thread. The virtual thread is 'pinned' to the carrier OS thread, blocking the carrier thread from serving other virtual threads. Replacing synchronized with ReentrantLock resolves pinning!",
            whyItExists: "The #1 production performance trap when adopting Virtual Threads in existing Java codebases.",
            codeDemo: {
              language: "java",
              code: "// ❌ PINNING PROBLEM: synchronized block during blocking I/O pins the carrier thread!\npublic class PinningExample {\n    public synchronized String fetchBlocked() { // Locks 'this' monitor\n        // If HTTP call blocks, carrier OS thread is PINNED and CANNOT be reused!\n        return callSlowHttpService();\n    }\n}\n\n// ✅ PINNING SOLUTION: Replace synchronized with ReentrantLock!\npublic class UnpinnedExample {\n    private final ReentrantLock lock = new ReentrantLock();\n\n    public String fetchSafe() {\n        lock.lock();\n        try {\n            // Virtual thread unmounts cleanly even while waiting on lock or I/O!\n            return callSlowHttpService();\n        } finally {\n            lock.unlock();\n        }\n    }\n}",
              explanation: "ReentrantLock allows the virtual thread to unmount safely during waits, preventing carrier starvation."
            },
            tradeoffs: "Diagnose pinning using the JVM flag: -Djdk.tracePinnedThreads=full.",
            followUpQuestions: [
              {
                question: "How do you detect thread pinning in production?",
                answer: "Run the JVM with the flag -Djdk.tracePinnedThreads=full, which logs stack traces whenever a pinned thread blocks."
              }
            ],
            usedInProduction: "Major open-source libraries (JDBC drivers, Apache Commons, Jackson) migrated synchronized blocks to ReentrantLock for Loom compatibility.",
            relatedTopics: ["Thread Pinning", "synchronized", "ReentrantLock"]
          }
        },
        {
          id: "java-17-loom-6",
          question: "Why should you NEVER pool Virtual Threads?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-06",
          answer: {
            quickAnswer: "Virtual threads are cheap, short-lived objects designed to be created and discarded per task; pooling them wastes memory, introduces state contamination, and limits concurrency.",
            mentalModel: "Pooling platform threads is like owning a taxi fleet because cars are expensive. Pooling virtual threads is like reusing paper coffee cups — unnecessary, unhygienic, and defeating the point of disposable convenience.",
            whatItIs: "Thread pools (Executors.newFixedThreadPool) were invented solely because OS platform threads are expensive (1MB stack + OS kernel creation). Virtual threads cost less than 1KB and take microseconds to instantiate. Pooling virtual threads caps concurrency artificially and introduces bugs if ThreadLocal state bleeds between tasks.",
            whyItExists: "A vital architectural shift: developers must unlearn 20 years of thread-pooling muscle memory when moving to modern Java.",
            codeDemo: {
              language: "java",
              code: "// ❌ ANTI-PATTERN: Pooling virtual threads (Defeats the purpose!)\n// ExecutorService badPool = Executors.newFixedThreadPool(100, Thread.ofVirtual().factory());\n\n// ✅ IDIOMATIC USAGE: New virtual thread per task, never pooled!\nExecutorService goodExecutor = Executors.newVirtualThreadPerTaskExecutor();\n\n// If you need to limit concurrency to a downstream resource (e.g. max 10 DB connections),\n// DO NOT limit threads! Use a Semaphore instead:\npublic class DatabaseRateLimiter {\n    private final Semaphore semaphore = new Semaphore(10); // Max 10 concurrent DB queries\n\n    public void queryDb() throws InterruptedException {\n        semaphore.acquire();\n        try {\n            executeDatabaseQuery();\n        } finally {\n            semaphore.release();\n        }\n    }\n}",
              explanation: "Use Semaphores to throttle downstream resources, not thread pool sizing."
            },
            tradeoffs: "If throttling access to an external API or database is required, use a Semaphore rather than limiting thread counts.",
            followUpQuestions: [
              {
                question: "How do you control concurrency with Virtual Threads if you don't use a thread pool?",
                answer: "Use java.util.concurrent.Semaphore to throttle concurrency to downstream resources (like database connection pools)."
              }
            ],
            usedInProduction: "Fundamental architectural guideline for microservice design on Java 17/21.",
            relatedTopics: ["Semaphore", "Thread Pooling", "Anti-patterns"]
          }
        }
      ]
    }
  ]
};
