import { Category } from "@/types";

export const interviewFrameworkCategory: Category = {
  id: "sd-interview-framework",
  title: "System Design Interview Playbook & Capacity Estimation",
  subTopics: [
    {
      id: "sd-interview-strategy",
      title: "45-Minute Interview Blueprint & Process",
      questions: [
        {
          id: "sd-framework-1",
          question: "How should you pace a 45-minute System Design interview step-by-step?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A winning 45-minute interview divides into 5 distinct phases: (1) Scope & Clarify Requirements (5 mins), (2) Back-of-the-Envelope Calculations (5 mins), (3) High-Level Architecture & API Design (10-12 mins), (4) Deep Dive into Core Bottlenecks (15 mins), and (5) Wrap-up, Failure Modes & Trade-offs (5 mins).",
            mentalModel: "Think of an architectural design interview as steering a ship through fog. Do not jump straight to drawing boxes. First map the terrain (clarify scope), calculate fuel and cargo limits (capacity math), lay down the main sea routes (high-level boxes), navigate treacherous straits (deep dive on difficult edge cases), and prepare lifeboats (fault tolerance).",
            whatItIs: "The structured methodology top FAANG/MANG and Tier-1 engineering interviewers look for to evaluate seniority, structured thinking, communication, trade-off analysis, and production engineering maturity.",
            whyItExists: "Junior and mid-level candidates fail system design interviews mostly not because of a lack of technical knowledge, but because of poor time management, jumping straight to tech buzzwords (e.g., 'Let's put Kafka and Redis here') before understanding requirements, or getting lost in trivial rabbit holes.",
            codeDemo: {
              language: "markdown",
              code: `⏱️ 45-Minute System Design Schedule:

00:00 - 05:00 (5 min)  -> Requirements & Clarification
  * Functional Requirements (Top 3 features ONLY)
  * Non-Functional Requirements (Latency, Availability, Consistency, Scale)
  * Out-of-Scope (Explicitly state what you will NOT build today)

05:00 - 10:00 (5 min)  -> Capacity Estimation & Math
  * Daily Active Users (DAU), Read/Write QPS & Peak QPS
  * Network Ingress/Egress Bandwidth
  * Storage for 5 years & Memory/Cache sizing (80/20 rule)

10:00 - 22:00 (12 min) -> High-Level Design (HLD)
  * REST/gRPC API contracts & Data Models
  * End-to-end Request Flow: Client -> CDN/DNS -> API Gateway -> App Server -> DB/Cache

22:00 - 38:00 (16 min) -> Deep Dive & Bottleneck Resolution
  * Zoom in on the 2 hardest components (e.g., Hot Partitioning, Distributed Locking, Fan-out)
  * Concurrency, replication lag, idempotency, data consistency

38:00 - 45:00 (7 min)  -> Failure Modes, Monitoring & Wrap-Up
  * Single Points of Failure (SPOFs), DR, Chaos Engineering, Metrics & Alerts`,
              explanation: "Sticking to this timeline prevents running out of time before addressing core distributed system challenges."
            },
            tradeoffs: "Spending too much time on capacity math (>10 mins) leaves no time for deep dives. Skipping math altogether leads to ungrounded architectural choices.",
            followUpQuestions: [
              {
                question: "What should you do if the interviewer stays silent?",
                answer: "Interviewers often stay silent to test if you can drive the design. Explicitly state assumptions, propose options with trade-offs, and check in: 'I'll proceed with an asynchronous write-behind cache for sub-10ms latency; does this sound aligned with your expectations?'"
              }
            ],
            usedInProduction: "Standard evaluation rubric at Google (L5/L6), Meta (E5/E6), Amazon (SDE III / Principal), and Uber.",
            relatedTopics: ["Requirements Engineering", "Capacity Estimation", "Trade-off Communication"]
          }
        },
        {
          id: "sd-framework-2",
          question: "How do you systematically identify and frame Functional vs Non-Functional Requirements?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Functional Requirements (FR) define what the system must do from an end-user perspective (features, inputs, outputs). Non-Functional Requirements (NFR) define system qualities and constraints: Latency (p99 < 50ms), Availability (99.99%), Consistency (Strong vs Eventual), Scalability (100M DAU), and Durability.",
            mentalModel: "FR is the 'Engine and Steering Wheel' (what the vehicle does). NFR is the 'Top Speed, Fuel Efficiency, Crash Safety, and Reliability' (how well it performs under pressure).",
            whatItIs: "The crucial first step of the interview where you define the contract of what you are building and rule out ambiguity.",
            whyItExists: "Interviewers deliberately give ambiguous 1-line prompts like 'Design YouTube' or 'Design Twitter'. They want to see if you can extract the 20% of features that drive 80% of architectural complexity.",
            comparisonTable: {
              title: "Functional Requirements (FR) vs Non-Functional Requirements (NFR)",
              headers: ["Dimension", "Functional Requirements (FR)", "Non-Functional Requirements (NFR)"],
              rows: [
                ["Definition", "WHAT the system must do from an end-user perspective", "HOW WELL the system must perform its tasks under scale"],
                ["Primary Focus", "Core features, user workflows, API inputs & outputs", "Latency SLAs, High Availability, Consistency, Throughput, Durability"],
                ["Evaluation Metric", "Pass / Fail behavior tests, feature acceptance", "Numbers: p99 latency < 50ms, 99.999% availability, 10M DAU"],
                ["System Impact", "Dictates service boundaries & database schema", "Dictates caching, replication, sharding, consensus, and CAP choices"],
                ["Interview Role", "Scope to 3-4 features to prevent unbounded rabbit holes", "The primary differentiator between Mid-level and Staff Engineer answers"]
              ]
            },
            codeDemo: {
              language: "markdown",
              code: `Example: Design a Ride-Hailing Platform (Uber)

Functional Requirements (Scope to 3-4):
1. Rider requests ride with pickup & drop-off locations.
2. System matches rider with nearby available drivers in real-time (< 30s).
3. Driver accepts/rejects ride.
4. Real-time location tracking of driver for rider during trip.

Non-Functional Requirements (The 'ILITIEs'):
1. High Availability (99.999%): Service must not go down; riders must always hail a ride.
2. Ultra-Low Latency (< 100ms): Driver location updates every 4 seconds.
3. Eventual Consistency: Driver location updates can tolerate slight lag.
4. Strong Consistency: Financial transactions and ride state transitions (avoid double-booking drivers).
5. Scalability: 50M DAU, 1M concurrent active drivers worldwide.`,
              explanation: "Distinguishing between where strong consistency is mandatory (ride state) vs where eventual consistency is acceptable (location ping) demonstrates senior-level judgment."
            },
            tradeoffs: "Adding too many functional features (e.g., tipping, ratings, promo codes) dilutes time needed for distributed system scaling challenges.",
            followUpQuestions: [
              {
                question: "How do you handle an interviewer who asks for too many features?",
                answer: "Prioritize: 'To ensure we design a resilient, deeply scalable architecture today, let's prioritize ride matching and location tracking first. If time permits, we'll design surge pricing and payment settlement.'"
              }
            ],
            usedInProduction: "Used in PRDs (Product Requirement Documents) and RFCs across tech companies to scope milestones.",
            relatedTopics: ["System Scoping", "CAP Theorem", "SLA / SLO Definition"]
          }
        },
        {
          id: "sd-framework-3",
          question: "What are the essential 'Latency Numbers Every Programmer Should Know' for back-of-the-envelope estimation?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Key latency milestones: L1 cache reference (0.5 ns), Mutex lock/unlock (20 ns), Main Memory RAM access (100 ns), SSD random read (100 µs), Disk sequential read (1 ms), Same-datacenter network round trip (0.5 ms), SSD sequential read (1 ms), HDD random read (10 ms), Cross-country network round trip (US East to West: 50-100 ms).",
            mentalModel: "Compare computer operations to human scales: 1 CPU cycle = 1 heart beat (1 second). RAM access = 1 trip to the refrigerator (3 minutes). SSD access = walking to the neighborhood grocery store (1.5 days). Magnetic disk seek = walking across the continent (6 months). Cross-continent network = a journey to Mars (several years).",
            whatItIs: "Jeff Dean's rule-of-thumb order-of-magnitude latencies that dictate whether an architecture will hit SLA targets.",
            whyItExists: "Knowing these numbers enables immediate validation of whether an architecture will meet a 50ms p99 SLA without testing on hardware.",
            codeDemo: {
              language: "markdown",
              code: `Latency Hierarchy (Orders of Magnitude):

Level 1 Cache (L1):        0.5 ns
Branch mispredict:         5 ns
L2 Cache:                  7 ns
Mutex lock/unlock:         25 ns
Main Memory (RAM):         100 ns        (0.1 µs)
Compress 1KB with Zstandard: 3 µs
Send 1KB over 10 Gbps network: 10 µs
Read 4KB randomly from SSD:  150 µs       (0.15 ms)
Read 1MB sequentially from RAM: 250 µs   (0.25 ms)
Same-datacenter Network RTT:   500 µs   (0.5 ms)
Read 1MB sequentially from SSD: 1 ms
Disk Seek (HDD random):        10 ms
Read 1MB sequentially from HDD: 20 ms
Cross-ocean Network RTT (US->EU): 150 ms`,
              explanation: "Memory is ~1,000x faster than SSD random reads, and SSDs are ~100x faster than rotational HDDs."
            },
            tradeoffs: "RAM is fast but volatile and expensive ($3-5 per GB) vs NVMe SSD ($0.08 per GB) vs S3 Object Storage ($0.02 per GB).",
            followUpQuestions: [
              {
                question: "How does this affect database design?",
                answer: "It dictates B-Trees (optimized to match 4KB/8KB SSD page boundaries) vs LSM-Trees (turning random writes into sequential memory append logs followed by sequential disk flushes)."
              }
            ],
            usedInProduction: "Calculated by Google Site Reliability Engineering (SRE) and performance engineering teams when drafting capacity plans.",
            relatedTopics: ["Storage Hierarchy", "Network Latency", "SSD vs HDD Performance"]
          }
        },
        {
          id: "sd-framework-4",
          question: "How do you calculate QPS, Peak QPS, and the Read/Write Ratio in Back-of-the-Envelope estimations?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Daily seconds = 86,400 ≈ 10^5 (100,000) for fast mental math. Average QPS = (DAU × Daily Requests per User) / 86,400. Peak QPS = Average QPS × Peak Factor (typically 2x to 5x depending on traffic bursts).",
            mentalModel: "Think of QPS as highway lane capacity. You don't build a highway for average 3 AM traffic; you design it for rush hour (Peak factor 2x-4x).",
            whatItIs: "The fundamental arithmetic needed to size server clusters, load balancer pools, and database connection limits.",
            whyItExists: "Without estimating QPS, you cannot decide whether a single PostgreSQL node (handles ~5,000-10,000 read QPS) suffices or if you need Redis caching and horizontal sharding.",
            codeDemo: {
              language: "text",
              code: `Standard Mental Math Shortcuts:
* 1 Day = 86,400 seconds ≈ 100,000 seconds (10^5)
* 100 Million requests / day ≈ 1,000 requests / second (QPS)
* 1 Billion requests / day ≈ 10,000 QPS

Example: Twitter / X Feed
- DAU: 300 Million
- Average user reads 50 tweets/day, posts 2 tweets/day
- Total Reads/day = 300M * 50 = 15 Billion reads
- Total Writes/day = 300M * 2 = 600 Million writes
- Read/Write Ratio = 15B : 600M = 25:1 (Heavy Read-Dominant System!)

Calculations:
- Read QPS = 15,000,000,000 / 100,000 = 150,000 QPS
- Write QPS = 600,000,000 / 100,000 = 6,000 QPS
- Peak Read QPS (2x factor) = 300,000 QPS
- Peak Write QPS (2x factor) = 12,000 QPS`,
              explanation: "Using 100,000 seconds makes mental division trivial in high-pressure interviews while staying within 15% accuracy."
            },
            tradeoffs: "Over-optimizing for peak can lead to 10x over-provisioning infrastructure costs; autoscaling and load shedding bridge this gap.",
            followUpQuestions: [
              {
                question: "What peak factor should you assume for flash sale or ticket drop systems?",
                answer: "For events like Black Friday or Taylor Swift ticket drops, peak factors can reach 10x to 50x normal baseline traffic."
              }
            ],
            usedInProduction: "All auto-scaling policies on AWS EC2/ECS and GCP compute groups are derived from peak QPS projections.",
            relatedTopics: ["Capacity Estimation", "Autoscaling", "Traffic Shaping"]
          }
        },
        {
          id: "sd-framework-5",
          question: "How do you calculate 5-year storage capacity and network ingress/egress bandwidth?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Daily Storage = Daily Writes × Average Record Payload Size. 5-Year Storage = Daily Storage × 365 × 5 (≈ Daily Storage × 2,000). Bandwidth Ingress = Write QPS × Payload Size. Bandwidth Egress = Read QPS × Payload Size.",
            mentalModel: "Think of storage as a swimming pool filling with water every second, and bandwidth as the diameter of the inflow and outflow pipes.",
            whatItIs: "The calculation that determines storage engine choice (disk vs object store S3) and CDN/network infrastructure costs.",
            whyItExists: "Interviewers want to see if you distinguish between hot storage (fast SSDs), warm storage, and cold archival storage (S3 Glacier).",
            codeDemo: {
              language: "text",
              code: `Example: Photo Sharing Service (Instagram)
- 10 Million new photos uploaded / day
- Average image file size: 2 MB
- Metadata per photo: 2 KB

1. Storage Calculations:
- Daily Media Storage = 10M * 2 MB = 20 TB / day
- 5-Year Media Storage = 20 TB * 365 * 5 ≈ 36.5 Petabytes (PB)
- Daily Metadata = 10M * 2 KB = 20 GB / day
- 5-Year Metadata = 20 GB * 2,000 days = 40 TB

Architectural Decision:
-> Store 36.5 PB media in Object Storage (AWS S3 / GCS) behind a CDN.
-> Store 40 TB structured metadata in Sharded Relational DB or Cassandra.

2. Bandwidth Calculations:
- Ingress Bandwidth = 10M photos / 100,000s * 2 MB = 100 photos/s * 2 MB = 200 MB/s (1.6 Gbps)
- Read:Write ratio is 100:1 -> Egress Bandwidth = 200 MB/s * 100 = 20 GB/s (160 Gbps)
Decision: CDN caching is mandatory to offload 95%+ of egress from origin servers.`,
              explanation: "Notice how bandwidth converts from Bytes to bits (multiply by 8) when talking about network pipe capacity."
            },
            tradeoffs: "Compressing images saves 70% storage and bandwidth at the cost of server CPU processing cycles.",
            followUpQuestions: [
              {
                question: "How do you account for replication factor in storage sizing?",
                answer: "Always multiply raw storage by the replication factor (typically 3x in distributed databases like Cassandra/HDFS or Kafka)."
              }
            ],
            usedInProduction: "FinOps and Cloud infrastructure budgeting across AWS/Azure.",
            relatedTopics: ["S3 Object Storage", "CDN Architecture", "Bandwidth Sizing"]
          }
        },
        {
          id: "sd-framework-6",
          question: "How do you calculate Memory Cache capacity using the Pareto 80/20 principle?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The Pareto Principle states that 20% of content generates 80% of read traffic. To achieve an 80%+ cache hit ratio, calculate the total read volume per day and size your Redis/Memcached cluster to hold 20% of those daily active hot keys.",
            mentalModel: "Like a library: 20% of best-seller books are checked out 80% of the time. Keep those 20% on the front display shelf (RAM) instead of walking to deep warehouse basements (Disk DB).",
            whatItIs: "The standard estimation technique for sizing distributed caching tiers without paying for 100% data residency in expensive RAM.",
            whyItExists: "RAM costs ~50x more than SSD disk storage. Blindly trying to cache all data wastes millions of dollars.",
            codeDemo: {
              language: "text",
              code: `Example: Twitter Home Timeline Cache Sizing

Parameters:
- DAU: 200 Million
- Each user fetches timeline 10 times a day
- Timeline size cached: 500 Tweet IDs per user
- ID size = 8 bytes (int64) -> 500 * 8 bytes = 4 KB per user timeline

Daily Cache Requirement:
- 100% of Active User Timelines = 200M * 4 KB = 800 GB

Applying the 80/20 Rule:
- Hot users active multiple times / day = 20% of 200M = 40M users
- Cache Size for 80% hit rate = 40M * 4 KB = 160 GB of RAM

Cluster Hardware Sizing:
- Reserve 30% buffer for Redis metadata overhead & memory fragmentation
- Total RAM needed = 160 GB * 1.3 ≈ 208 GB
- Using standard AWS r6g.2xlarge nodes (64 GB RAM each):
  Number of cache instances = 208 GB / 64 GB ≈ 4 nodes (+ 4 replicas for HA)`,
              explanation: "Factoring in Redis internal metadata overhead (jemalloc fragmentation + pointers) prevents unexpected OOM (Out Of Memory) evictions."
            },
            tradeoffs: "Higher cache hit ratio targets (e.g. 95%) require exponentially more RAM (approaching 50-60% of total data).",
            followUpQuestions: [
              {
                question: "What happens when cache memory gets full?",
                answer: "The eviction policy takes over: volatile-lru, allkeys-lru, or LFU depending on whether all keys or only TTL keys are eligible."
              }
            ],
            usedInProduction: "Redis Enterprise and AWS ElastiCache sizing calculators.",
            relatedTopics: ["Cache Eviction Policies", "Redis Cluster", "Pareto 80/20"]
          }
        },
        {
          id: "sd-framework-7",
          question: "How do you systematically structure API Design and endpoint contracts in an interview?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Design clean RESTful or gRPC contracts matching the Functional Requirements. Specify: (1) HTTP Method & Resource URI, (2) Request Headers (Auth token, Idempotency-Key), (3) Request Body (JSON schema), (4) Response Body & HTTP Status Codes (200, 201, 400, 409, 429), and (5) Pagination Strategy (Keyset vs Offset).",
            mentalModel: "APIs are the legal contract between client and server. If the contract is ambiguous, neither frontend nor backend engineers can work in parallel.",
            whatItIs: "The step where you translate high-level features into concrete network communication specifications.",
            whyItExists: "Shows the interviewer that you understand developer ergonomics, backward compatibility, idempotency, and security.",
            codeDemo: {
              language: "markdown",
              code: `POST /api/v1/posts
Headers:
  Authorization: Bearer <jwt_token>
  Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
  Content-Type: application/json
Request Body:
{
  "content": "Designing scalable distributed systems!",
  "media_ids": ["img_091248", "img_091249"],
  "visibility": "PUBLIC"
}
Response: 201 Created
{
  "post_id": "pst_8931238472",
  "author_id": "usr_10283",
  "created_at": 1730000000,
  "status": "PUBLISHED"
}

GET /api/v1/users/{userId}/timeline?limit=20&cursor=pst_8931238472
Response: 200 OK
{
  "items": [ ... ],
  "next_cursor": "pst_8930001122",
  "has_more": true
}`,
              explanation: "Always use Keyset/Cursor-based pagination instead of Offset/Limit for large, real-time datasets to avoid skipping/duplicating items and high DB seek costs."
            },
            tradeoffs: "REST with JSON is universally human-readable and debuggable but slower and heavier than binary gRPC/Protobuf.",
            followUpQuestions: [
              {
                question: "Why is cursor pagination superior to offset pagination?",
                answer: "Offset pagination (OFFSET 1000000 LIMIT 20) forces the database to scan and discard 1,000,000 rows. Cursor pagination (WHERE id < cursor LIMIT 20) uses index B-Tree direct seek in O(log N) time."
              }
            ],
            usedInProduction: "Standard Stripe, GitHub, and Twitter v2 public developer APIs.",
            relatedTopics: ["RESTful API", "Keyset Pagination", "Idempotency Keys"]
          }
        },
        {
          id: "sd-framework-8",
          question: "How do you choose between SQL and NoSQL databases systematically?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Use SQL (PostgreSQL, MySQL) when you need ACID transactions, complex JOINs, structured relational schemas, and strong financial integrity. Use NoSQL when you need massive horizontal write scalability (Cassandra), flexible document structures (MongoDB), ultra-fast key-value lookups (Redis/DynamoDB), or graph traversal (Neo4j).",
            mentalModel: "SQL is a bespoke tailored suit: precise, high-integrity, strictly fitted. NoSQL is athletic spandex: highly stretchable across dozens of machines, built for speed and heavy movement.",
            whatItIs: "The database selection criteria matrix based on query patterns, access frequency, consistency requirements, and data volume.",
            whyItExists: "A wrong database choice can cripple a company's scalability or cause devastating data corruption.",
            codeDemo: {
              language: "table",
              code: "Decision Framework Matrix: Database Selection\n\n| Database Type | Key Access Pattern | Consistency / SLA | Best Real-World Examples |\n|---|---|---|---|\n| Relational (PostgreSQL / MySQL) | Complex JOINs, foreign keys, secondary indexes | Strong ACID guarantees mandatory | Banking ledgers, Orders, Payment billing |\n| Key-Value (Redis / DynamoDB) | Simple O(1) primary key lookups (GET / PUT) | Sub-millisecond latency SLA | User sessions, Shopping carts, Token caches |\n| Wide-Column (Cassandra / ScyllaDB) | Write-heavy append workloads, time-series | Linear scale across petabytes | IoT sensor metrics, Chat history, Activity logs |\n| Document Store (MongoDB / Couchbase) | Nested JSON structures, polymorphic schemas | Dynamic schema iteration | Product catalogs, Content management systems |\n| Graph Database (Neo4j / AWS Neptune) | Multi-hop relationship traversal | Real-time path / clique search | Social graphs, Fraud rings, Recommendation engines |",
              explanation: "Modern cloud systems use Polyglot Persistence: PostgreSQL for user accounts, Cassandra for time-series events, and Redis for caching."
            },
            tradeoffs: "NoSQL provides elastic horizontal scale and high availability at the cost of giving up complex multi-table JOINs and cross-partition ACID transactions.",
            followUpQuestions: [
              {
                question: "Can NewSQL databases (like CockroachDB, Spanner) replace both?",
                answer: "NewSQL provides horizontal scaling + ACID transactions, but at higher compute costs, higher write latency due to distributed consensus (Raft/Paxos), and operational complexity."
              }
            ],
            usedInProduction: "Uber uses MySQL + Schemaless (built on MySQL) for trips, and Cassandra for location telemetry.",
            relatedTopics: ["SQL vs NoSQL", "ACID vs BASE", "Polyglot Persistence"]
          }
        },
        {
          id: "sd-framework-9",
          question: "How do you detect and eliminate Single Points of Failure (SPOFs) in an architecture?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A Single Point of Failure (SPOF) is any component whose breakdown halts the entire system. Eliminate SPOFs by: (1) Redundancy at every tier (N+1 or Active-Passive/Active-Active), (2) Multi-Availability Zone (AZ) deployments, (3) Automated health checks and failovers, (4) Circuit breakers and graceful degradation.",
            mentalModel: "Commercial airplanes have at least 2 engines, multiple independent hydraulic systems, and backup electrical generators. A distributed system must survive losing any single node, rack, or datacenter without human intervention.",
            whatItIs: "The reliability engineering process of stress-testing an architectural diagram to ensure no isolated box brings down the platform.",
            whyItExists: "Hardware fails, networks partition, power supplies burn out, and cloud providers experience AZ blackouts daily.",
            codeDemo: {
              language: "markdown",
              code: `SPOF Elimination Checklist:

1. DNS Tier:
   - Vulnerability: Single DNS provider goes down (e.g., Dyn DDoS attack).
   - Fix: Dual-DNS provider setup (e.g., Route53 + Cloudflare NS delegation).

2. Load Balancer Tier:
   - Vulnerability: Active LB crashes.
   - Fix: VRRP / Keepalived with redundant standby LB sharing a Floating Virtual IP (VIP).

3. Application Servers:
   - Vulnerability: App server crashes on OOM.
   - Fix: Stateless instances behind auto-scaling groups across 3 Availability Zones (AZs).

4. Database Tier:
   - Vulnerability: Primary DB disk fails.
   - Fix: Primary-Replica replication with automated failover via Raft/Patroni/Orchestrator.

5. Caching Tier:
   - Vulnerability: Redis node fails, slamming database (Cache Stampede).
   - Fix: Redis Cluster with Master-Replica pairs and Sentinel automated failover.`,
              explanation: "Always trace every box in your diagram and ask: 'What happens if this box dies right now?'"
            },
            tradeoffs: "Redundancy increases cloud infrastructure costs by 2x to 3x and introduces distributed state synchronization complexity.",
            followUpQuestions: [
              {
                question: "What is Split-Brain syndrome during automated database failover?",
                answer: "When network partition isolates the primary, the replica promotes itself to primary. If the old primary continues accepting writes, data divergence occurs. Solved using quorum leases (etcd/Consul) or STONITH."
              }
            ],
            usedInProduction: "Netflix Chaos Monkey randomly terminates AWS instances in production to prove no SPOFs exist.",
            relatedTopics: ["High Availability", "Failover Strategies", "Chaos Engineering"]
          }
        },
        {
          id: "sd-framework-10",
          question: "How do you handle the 'Hot Partition' (Celebrity Problem) in distributed systems?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A hot partition occurs when traffic concentrates disproportionately on a single shard/key (e.g., Elon Musk with 180M followers posting a tweet, or a viral product on Amazon). Solve it via: (1) Salted keys (appending random suffix 0..N), (2) In-memory local L1 caching, (3) Read replicas, and (4) Hybrid Fan-Out (push for normal users, pull for celebrities).",
            mentalModel: "If 100,000 people try to enter a stadium through 1 designated turnstile door, the door breaks. Distribute them across 50 doors using randomized ticketing (salting).",
            whatItIs: "The fundamental bottleneck in key-based distributed partitioning (consistent hashing, Kafka partitions, Cassandra shards).",
            whyItExists: "Standard sharding formulas (hash(key) % N) assume uniform distribution. Human social activity follows power-law distributions (Pareto 80/20 or Zipfian), concentrating 90% of reads/writes on 0.01% of keys.",
            codeDemo: {
              language: "java",
              code: `// Salting Hot Keys for High-Throughput Distributed Counters
public class HotKeySalter {
    private static final int SALT_RANGE = 20; // 20 sub-keys

    // Writing: Distribute increments across 20 distinct Redis keys
    public void incrementHotCounter(String hotKey) {
        int randomSalt = ThreadLocalRandom.current().nextInt(SALT_RANGE);
        String saltedKey = hotKey + ":" + randomSalt;
        redisClient.incr(saltedKey); // Parallel writes to 20 different shards!
    }

    // Reading: Aggregate across all 20 sub-keys
    public long getHotCounterValue(String hotKey) {
        List<String> keys = new ArrayList<>();
        for (int i = 0; i < SALT_RANGE; i++) {
            keys.add(hotKey + ":" + i);
        }
        List<String> values = redisClient.mget(keys.toArray(new String[0]));
        return values.stream()
                     .filter(Objects::nonNull)
                     .mapToLong(Long::parseLong)
                     .sum();
    }
}`,
              explanation: "Salting divides 200,000 QPS hot writes across 20 nodes (10,000 QPS each), preventing any single node from burning out."
            },
            tradeoffs: "Salting makes writes blisteringly fast and distributed, but makes reads more expensive because the system must query all salted partitions and aggregate them.",
            followUpQuestions: [
              {
                question: "How does Twitter handle celebrity fan-out specifically?",
                answer: "Twitter uses a hybrid model: ordinary users push tweets into follower timelines (Fan-out on Write). Celebrities do NOT push; followers merge celebrity tweets on-demand when loading their feed (Fan-out on Read)."
              }
            ],
            usedInProduction: "Twitter timeline generation, Instagram live video comments, and Amazon Prime Day flash deals.",
            relatedTopics: ["Consistent Hashing", "Fan-out on Write vs Read", "Distributed Counters"]
          }
        }
      ]
    },
    {
      id: "sd-interview-deep-dives",
      title: "Architecture Strategy & Trade-off Presentation",
      questions: [
        {
          id: "sd-framework-11",
          question: "How should you articulate architectural trade-offs to score top marks in Senior/Staff interviews?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Always frame decisions using the formula: 'We choose Option A over Option B because our priority is X, accepting the drawback of Y, which we mitigate using Z.' Never state an architecture is 'the best'; in distributed systems, there are no solutions, only trade-offs.",
            mentalModel: "An engineering leader is an economic allocator of resources. Every architectural choice has a cost (latency, complexity, money, consistency). Explicitly laying out the invoice builds immediate trust with the interviewer.",
            whatItIs: "The communication framework that distinguishes L4 (Mid-level) engineers from L5 (Senior) and L6 (Staff) engineers in FAANG system design evaluations.",
            whyItExists: "Interviewers care less about your final diagram and more about how you think through alternatives when constraints shift.",
            codeDemo: {
              language: "markdown",
              code: `Trade-off Articulation Formula:

❌ Junior Answer:
"We will use Apache Kafka here because it's super fast and handles lots of messages."

✅ Senior / Staff Answer:
"For our payment event pipeline, we have two primary options:
1. RabbitMQ (AMQP broker with granular routing and broker-tracked acknowledgments).
2. Apache Kafka (Distributed append-only commit log with consumer-managed offsets).

Decision:
We choose Kafka because our non-functional requirement demands high write throughput
(50,000 msgs/sec) and event replayability for downstream fraud analytics and auditing.

Drawback Accepted:
Kafka does not offer per-message dead-letter routing or individual message ACKs out-of-the-box.

Mitigation:
We will handle poison-pill messages at the consumer level by publishing unprocessable events
to a separate retry-and-DLQ Kafka topic with an exponential backoff consumer."`,
              explanation: "This structured rationale shows deep operational empathy and architectural maturity."
            },
            tradeoffs: "Over-analyzing every minor decision can stall interview progress. Reserve deep trade-off analysis for core architectural forks.",
            followUpQuestions: [
              {
                question: "What if the interviewer challenges your decision?",
                answer: "Do not get defensive. Welcome the challenge: 'That is a valid point. If our write volume drops below 2,000 QPS and complex topic routing becomes the dominant requirement, RabbitMQ would significantly simplify operations.'"
              }
            ],
            usedInProduction: "Standard format for Architecture Decision Records (ADRs) at Spotify, Netflix, and Amazon.",
            relatedTopics: ["Architecture Decision Records", "Communication Skills", "Interview Rubrics"]
          }
        },
        {
          id: "sd-framework-12",
          question: "How do you choose between Push (Fan-out on Write) vs Pull (Fan-out on Read) models?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Push (Fan-out on Write) writes the new item to all follower feeds at publish time: O(1) read latency, but high write amplification (O(N) writes where N = followers). Pull (Fan-out on Read) keeps posts in author tables; feeds are aggregated dynamically when a user reads: O(1) write latency, but expensive multi-query reads O(M) where M = followees.",
            mentalModel: "Push is like a newspaper delivery person dropping the paper on every subscriber's porch at dawn. Pull is like every reader walking down to the corner newsstand when they wake up.",
            whatItIs: "The central architectural debate in all feed, notification, social network, and pub/sub design problems.",
            whyItExists: "User fan-out characteristics break naive designs. A celebrity with 100M followers posting a video causes a 100M write spike if pushed blindly.",
            comparisonTable: {
              title: "Push (Fan-out on Write) vs Pull (Fan-out on Read) Comparison",
              headers: ["Dimension", "Push (Fan-out on Write)", "Pull (Fan-out on Read)"],
              rows: [
                ["Write Latency", "High: O(N) writes where N = number of followers", "Ultra-Low: O(1) single write to author table"],
                ["Read Latency", "Ultra-Low: O(1) fetch from precomputed timeline cache", "High: O(M) multi-query fan-in where M = followees"],
                ["Storage Overhead", "Massive: post IDs duplicated across millions of user feeds", "Minimal: single copy of post stored in database"],
                ["Hot Key Sensitivity", "Vulnerable to celebrities / influencers (huge write spikes)", "Vulnerable to users following thousands of active creators"],
                ["Resource Bottleneck", "Write IOPS & asynchronous worker pool capacity", "Read query aggregation & database CPU / cache load"],
                ["Industry Recommendation", "Normal users (<25k followers) in hybrid architectures", "Celebrities (>25k followers) aggregated at read time"]
              ]
            },
            codeDemo: {
              language: "text",
              code: `Comparison: Push vs Pull Architecture

Feature               | Push (Fan-out on Write)      | Pull (Fan-out on Read)
----------------------|------------------------------|-----------------------------
Write Latency         | High (O(N) where N=followers)| Ultra-Low (O(1) write)
Read Latency          | Ultra-Low (O(1) precomputed) | High (O(M) where M=followees)
Storage Overhead      | Massive (Duplicated IDs)     | Minimal (Single copy stored)
Hot Key Sensitivity   | Vulnerable to Celebrities    | Vulnerable to Inactive users
System Complexity     | Async Background Workers     | Heavy Caching & Aggregation

Hybrid Solution (Industry Standard - Twitter / Instagram):
1. Normal Users (< 25,000 followers): Use PUSH.
   -> Async Celery/Kafka worker inserts post ID into follower Redis timeline lists.
2. Celebrities / Influencers (> 25,000 followers): Use PULL.
   -> Do not fan out to 50M followers.
3. Client Read:
   -> Fetch user's precomputed Redis timeline (Fast!).
   -> Query celebrity followees' recent posts and merge in-memory sorted by timestamp.`,
              explanation: "The hybrid model balances sub-50ms feed load times with predictable asynchronous write loads."
            },
            tradeoffs: "The hybrid model increases application logic complexity because the client/aggregator must know which followees are VIPs/celebrities.",
            followUpQuestions: [
              {
                question: "How do you handle inactive users in a Push model to save Redis RAM?",
                answer: "Do not fan out to users who haven't logged in for 14+ days. When an inactive user logs back in, trigger a cold-start feed rebuild."
              }
            ],
            usedInProduction: "Twitter Home Timeline, Instagram Feed, LinkedIn Activity Stream.",
            relatedTopics: ["Fan-out on Write", "Fan-out on Read", "Timeline Generation"]
          }
        },
        {
          id: "sd-framework-13",
          question: "How do you design for Idempotency across distributed payment and ordering workflows?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Idempotency ensures an API operation produces the exact same outcome even if called multiple times with the same input. Implement it using: (1) Client-generated unique Idempotency Keys (UUID v4), (2) Atomic DB Insert / Distributed Lock on the key in Redis with a short TTL, (3) Recording request state (IN_PROGRESS, SUCCESS, FAILED), and (4) Returning the cached response on duplicate attempts.",
            mentalModel: "The elevator call button: pressing the 'Up' button 10 times does not summon 10 separate elevator cars; the elevator registers the first click and ignores subsequent clicks.",
            whatItIs: "The crucial distributed systems pattern that prevents double billing, duplicate order creation, and repeated email notifications during network timeouts.",
            whyItExists: "Networks are unreliable. A client sends a payment request, the server executes it, but the network drops the HTTP 200 response. The client retries. Without idempotency, the customer is charged twice.",
            codeDemo: {
              language: "java",
              code: `// Idempotency Filter / Interceptor Pattern in Spring Boot
@Component
public class IdempotencyHandler {
    @Autowired private StringRedisTemplate redis;
    @Autowired private PaymentService paymentService;

    public PaymentResponse handlePayment(String idempotencyKey, PaymentRequest req) {
        String lockKey = "idemp:" + idempotencyKey;
        // Step 1: Atomic SETNX with 120s TTL to acquire exclusive processing lock
        Boolean acquired = redis.opsForValue().setIfAbsent(lockKey, "IN_PROGRESS", Duration.ofSeconds(120));
        
        if (Boolean.FALSE.equals(acquired)) {
            // Step 2: Request already exists! Wait or return cached result
            String status = redis.opsForValue().get(lockKey);
            if ("IN_PROGRESS".equals(status)) {
                throw new ConcurrentRequestException("Transaction currently processing. Please wait.");
            }
            return deserializeCachedResponse(status); // Return original success response!
        }

        try {
            // Step 3: Execute core business logic
            PaymentResponse response = paymentService.executeCharge(req);
            // Step 4: Cache final result in Redis with 24h TTL
            redis.opsForValue().set(lockKey, serialize(response), Duration.ofHours(24));
            return response;
        } catch (Exception ex) {
            redis.delete(lockKey); // Release lock on fatal error so user can retry
            throw ex;
        }
    }
}`,
              explanation: "Redis SETNX provides the atomic check-and-set primitive needed to prevent race conditions during retry bursts."
            },
            tradeoffs: "Requires clients to manage and persist unique idempotency keys per transaction; adds a Redis lookup latency (1-2ms) to write paths.",
            followUpQuestions: [
              {
                question: "What if Redis crashes while storing idempotency keys?",
                answer: "Back up idempotency with a unique constraint in the SQL database: `UNIQUE KEY uk_idempotency_key (idempotency_key)`."
              }
            ],
            usedInProduction: "Stripe Charges API, PayPal Payment Gateway, Amazon Order Placement Service.",
            relatedTopics: ["Distributed Locks", "Network Retries", "Two-Phase Commit"]
          }
        },
        {
          id: "sd-framework-14",
          question: "How do you design a robust Disaster Recovery (DR) plan with RPO and RTO objectives?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "RPO (Recovery Point Objective) is the maximum acceptable data loss measured in time (e.g., 5 minutes of data). RTO (Recovery Time Objective) is the maximum acceptable system downtime (e.g., service restored in < 15 minutes). DR strategies range from Backup & Restore (RTO hours, RPO hours) to Pilot Light, Warm Standby, and Multi-Region Active-Active (RTO ~0, RPO ~0).",
            mentalModel: "RPO is your camera roll: if your phone drops into the ocean, how many hours of photos are you willing to lose? RTO is how long it takes you to walk into an Apple Store and buy a new working phone.",
            whatItIs: "The business continuity and resilience framework for surviving catastrophic regional cloud outages, earthquakes, or submarine cable cuts.",
            whyItExists: "Entire AWS regions (e.g., us-east-1) have suffered multi-hour power and network failures. Tier-1 systems must have proven failover mechanisms.",
            codeDemo: {
              language: "text",
              code: `Disaster Recovery Strategy Comparison:

Strategy           | RPO       | RTO       | Cost   | Complexity
-------------------|-----------|-----------|--------|-------------
1. Backup & Restore| Hours     | Hours/Days| $      | Low (S3 backups)
2. Pilot Light     | Minutes   | < 1 Hour  | $$     | Medium (Core DB replicated, app servers off)
3. Warm Standby    | Seconds   | < 5 Mins  | $$$    | High (Scaled-down live cluster in Region B)
4. Active-Active   | Real-time | ~0 Mins   | $$$$   | Very High (Full multi-region live traffic)

Implementation of Multi-Region Active-Active:
- Global Server Load Balancing (GSLB) via Route53 Latency-Based Routing
- Cross-region asynchronous DB replication (e.g., Aurora Global Database, DynamoDB Global Tables)
- Conflict resolution using Last-Write-Wins (LWW) or Conflict-Free Replicated Data Types (CRDTs)`,
              explanation: "Active-Active eliminates failover downtime because both regions are already serving production traffic simultaneously."
            },
            tradeoffs: "Active-Active multi-region introduces write latency penalties (speed of light cross-continent round-trip is ~70ms) and risk of cross-region write skew.",
            followUpQuestions: [
              {
                question: "How do you test a Disaster Recovery plan safely?",
                answer: "Run regular 'GameDay' simulations: intentionally sever network traffic to Region A and verify that Region B seamlessly absorbs all load without data corruption."
              }
            ],
            usedInProduction: "Netflix active-active multi-region failover, AWS S3 cross-region replication, Google Spanner multi-continent instances.",
            relatedTopics: ["High Availability", "Multi-Region Replication", "Route53 DNS Failover"]
          }
        },
        {
          id: "sd-framework-15",
          question: "How do you design a Content Delivery Network (CDN) caching and invalidation strategy?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "CDNs cache static assets (images, videos, JS/CSS) and cacheable dynamic API responses at edge servers geographically close to users. Invalidation strategies include: (1) Cache-Control headers with TTL (max-age, s-maxage), (2) Content Hash Versioning (main.a8b1c.js), (3) Programmatic API purge (Cloudflare/CloudFront cache purge), and (4) Stale-While-Revalidate.",
            mentalModel: "A CDN is like having convenience stores in every neighborhood instead of forcing everyone to drive to a single massive central factory warehouse.",
            whatItIs: "Edge caching network (Cloudflare, Akamai, AWS CloudFront) reducing latency from 200ms to < 10ms for static and dynamic assets.",
            whyItExists: "Origin servers collapse if millions of global users hit them simultaneously for 5MB video chunks or uncompressed images.",
            codeDemo: {
              language: "http",
              code: `// HTTP Response Headers for High-Performance Edge Caching

// 1. Static Immutable Assets (Bundles, Images with Hash):
Cache-Control: public, max-age=31536000, immutable
// Edge & Browser will cache for 1 full year without ever hitting origin!

// 2. Dynamic Semi-Static Content (e.g. User Public Profile):
Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=86400
// s-maxage=300: CDN edge caches for 5 minutes
// max-age=60: Browser caches for 1 minute
// stale-while-revalidate: Serve stale copy immediately while asynchronously fetching fresh data!

// 3. Sensitive User Data (Banking, Cart):
Cache-Control: private, no-cache, no-store, must-revalidate`,
              explanation: "`stale-while-revalidate` eliminates edge cache misses by serving stale content instantly while a background fetch updates the edge cache."
            },
            tradeoffs: "Overly aggressive caching causes users to see outdated content; instant edge cache purge APIs take 15-60 seconds to propagate globally.",
            followUpQuestions: [
              {
                question: "What is CDN Dynamic Site Acceleration (DSA)?",
                answer: "DSA keeps persistent pre-warmed TCP/TLS connections open between CDN edge nodes and origin servers, using optimized BGP routing to bypass public internet congestion."
              }
            ],
            usedInProduction: "Cloudflare Workers, Fastly Varnish, AWS CloudFront, Akamai Edge.",
            relatedTopics: ["Edge Computing", "HTTP Caching Headers", "Anycast Routing"]
          }
        },
        {
          id: "sd-framework-16",
          question: "How do you design a high-throughput Distributed Counter (e.g., YouTube views, TikTok likes)?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A naive atomic counter in SQL (`UPDATE table SET count = count + 1`) serializes all writes on a single row lock, capping at ~500-1,000 QPS. To scale to 100,000+ QPS: (1) Use In-Memory Redis batching, (2) Sharded Counters (divide the counter into N slots and aggregate on read), or (3) Asynchronous message queue buffering with Kafka and micro-batch DB flushes.",
            mentalModel: "Instead of having 10,000 people drop coins into a single piggy bank one by one (causing a massive line), give out 20 piggy banks. When you want the total, add up the coins in all 20 piggy banks.",
            whatItIs: "The design pattern for handling write-heavy metric tracking without causing database row-lock contention.",
            whyItExists: "Viral videos receive hundreds of thousands of views per second. No single relational database row lock can sustain that concurrency.",
            codeDemo: {
              language: "java",
              code: `// Micro-Batching Distributed Counter with Redis & Scheduled DB Flush
@Service
public class DistributedViewCounter {
    @Autowired private StringRedisTemplate redis;
    @Autowired private VideoRepository videoRepo;

    // Fast Path: Sub-millisecond write to Redis In-Memory Hash
    public void recordView(String videoId) {
        redis.opsForHash().increment("video_views_buffer", videoId, 1);
    }

    // Background Worker: Flushes accumulated counts to DB every 5 seconds
    @Scheduled(fixedRate = 5000)
    public void flushViewsToDatabase() {
        Map<Object, Object> buffer = redis.opsForHash().entries("video_views_buffer");
        if (buffer.isEmpty()) return;

        // Atomically reset buffer so new increments go to fresh batch
        redis.delete("video_views_buffer");

        // Single batch update to PostgreSQL / Cassandra
        List<VideoViewUpdate> updates = buffer.entrySet().stream()
            .map(e -> new VideoViewUpdate((String) e.getKey(), Long.parseLong((String) e.getValue())))
            .collect(Collectors.toList());

        videoRepo.batchIncrementViews(updates);
    }
}`,
              explanation: "Batching 5,000 writes into 1 bulk database query reduces database I/O by 99.9%."
            },
            tradeoffs: "Counters become eventually consistent; if the Redis buffer crashes before flushing, a few seconds of view count data could be lost unless backed by an AOF log.",
            followUpQuestions: [
              {
                question: "How does YouTube prevent view count fraud?",
                answer: "Initial view counts are incremented quickly; past ~300 views, counts enter a verification pipeline where IP anomalies, watch duration, and bot signatures are audited before updating public counters."
              }
            ],
            usedInProduction: "YouTube video view counter, Twitter like counter, Reddit upvote system.",
            relatedTopics: ["Redis INCRBY", "Write Buffering", "Eventual Consistency"]
          }
        },
        {
          id: "sd-framework-17",
          question: "How do you design a secure Role-Based Access Control (RBAC) and Permission System?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Structure authorization into 4 core tables: `Users`, `Roles`, `Permissions`, and a join table `Role_Permissions`. Users are assigned roles; roles bundle fine-grained permissions. For high-scale distributed systems, embed roles and permissions into cryptographically signed JWT claims or evaluate permissions at the API Gateway using Open Policy Agent (OPA) with local caching.",
            mentalModel: "Think of an airport: A 'Pilot' badge (Role) grants access to the cockpit and runway (Permissions). A 'Passenger' badge grants access only to the gate and cabin.",
            whatItIs: "The standard authorization architecture ensuring users can only access authorized endpoints, tenant data, and admin capabilities.",
            whyItExists: "Hardcoding permission checks (`if (user.role == 'ADMIN')`) causes fragile code, privilege escalation vulnerabilities, and impossible enterprise audit requirements.",
            codeDemo: {
              language: "sql",
              code: `-- Relational Schema for Enterprise RBAC
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    organization_id UUID NOT NULL
);

CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY, -- 'ORG_ADMIN', 'EDITOR', 'VIEWER'
    description TEXT
);

CREATE TABLE permissions (
    id VARCHAR(100) PRIMARY KEY -- 'documents:create', 'documents:delete', 'billing:view'
);

CREATE TABLE role_permissions (
    role_id VARCHAR(50) REFERENCES roles(id),
    permission_id VARCHAR(100) REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    role_id VARCHAR(50) REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);`,
              explanation: "De-coupling users from permissions through roles allows adding or removing capabilities across thousands of users instantly."
            },
            tradeoffs: "RBAC is simple to implement but struggles with fine-grained context (e.g., 'can edit document only between 9 AM and 5 PM if owner'). That requires ABAC (Attribute-Based Access Control) or Google Zanzibar.",
            followUpQuestions: [
              {
                question: "What is Google Zanzibar?",
                answer: "Google's global authorization system powering Drive, YouTube, and Cloud. It models relationships as a directed graph of tuples `(object#relation@user)` and resolves permissions via graph traversal."
              }
            ],
            usedInProduction: "AWS IAM, GitHub organization permissions, Auth0, Okta, and Google Cloud IAM.",
            relatedTopics: ["RBAC vs ABAC", "JWT Token Claims", "Google Zanzibar"]
          }
        },
        {
          id: "sd-framework-18",
          question: "How do you design a distributed Task Scheduler (like Quartz / Celery / Cron)?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A distributed task scheduler consists of: (1) A persistent Task Store (PostgreSQL / DynamoDB) storing cron schedules and next execution timestamps, (2) Leader Election (via etcd/ZooKeeper/Raft) or a Sharded Poller using Redis Sorted Sets (`ZREVRANGEBYSCORE` with timestamp as score), (3) Distributed Locks to prevent duplicate execution, (4) Worker pools consuming tasks via Kafka/RabbitMQ, and (5) Heartbeat monitoring.",
            mentalModel: "Think of an airport flight dispatch board: Upcoming flights are queued chronologically. As departure time approaches, the control tower dispatches the flight to an available gate and runway crew.",
            whatItIs: "A cluster-aware job scheduling platform capable of executing millions of recurring or one-shot delayed tasks reliably without double execution.",
            whyItExists: "A single Linux `crontab` fails if the machine reboots, cannot scale across a cluster, and provides zero retry or failure recovery guarantees.",
            codeDemo: {
              language: "java",
              code: `// Distributed Task Poller using Redis Sorted Set (ZSET)
public class RedisTaskScheduler {
    @Autowired private StringRedisTemplate redis;
    private static final String TASK_ZSET_KEY = "delayed_tasks";

    // Schedule task to run at epoch timestamp
    public void scheduleTask(String taskId, long executionTimeMillis) {
        redis.opsForZSet().add(TASK_ZSET_KEY, taskId, (double) executionTimeMillis);
    }

    // Poller loop running across worker nodes
    public void pollAndDispatchReadyTasks() {
        long now = System.currentTimeMillis();
        // Step 1: Fetch tasks where score (executionTime) <= current time
        Set<String> readyTasks = redis.opsForZSet().rangeByScore(TASK_ZSET_KEY, 0, now, 0, 50);

        for (String taskId : readyTasks) {
            // Step 2: Atomically remove from ZSET to claim task (prevents race condition across nodes)
            Long removed = redis.opsForZSet().remove(TASK_ZSET_KEY, taskId);
            if (removed != null && removed > 0) {
                // Successfully claimed! Dispatch to worker queue
                kafkaTemplate.send("task-execution-topic", taskId);
            }
        }
    }
}`,
              explanation: "Using `ZREVRANGEBYSCORE` with atomic `ZREM` ensures multiple poller nodes do not pick up the same scheduled task."
            },
            tradeoffs: "Polling Redis/DB introduces slight polling lag (e.g. 500ms). For microsecond precision, hierarchical timing wheels (like Kafka's purgatory) are required.",
            followUpQuestions: [
              {
                question: "What is a Hierarchical Timing Wheel?",
                answer: "A circular buffer of timer buckets representing seconds, minutes, and hours (like a clock). Inserting and canceling tasks takes O(1) time without scanning sorted lists."
              }
            ],
            usedInProduction: "Uber Cherami / Cadence (now Temporal), Airbnb Chronos, Celery Beat, Quartz Scheduler.",
            relatedTopics: ["Redis Sorted Sets", "Timing Wheels", "Distributed Locks"]
          }
        },
        {
          id: "sd-framework-19",
          question: "How do you design a Distributed Webhook Delivery Engine with retry backoff?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A webhook engine pushes HTTP notifications to external customer endpoints when events occur. Core design: (1) Ingest events into Kafka, (2) Worker pool consumes and executes HTTP POST with timeout (5s), (3) Sign payload with HMAC-SHA256 for security, (4) On failure, route to delayed retry queues with Exponential Backoff + Full Jitter (e.g., 1m, 5m, 1h, 6h, 24h), (5) Route exhausted retries to DLQ and disable failing endpoints.",
            mentalModel: "Like registered mail delivery: the postal service attempts delivery. If no one answers, they leave a note and retry tomorrow, up to 3 attempts before returning the parcel to the depot.",
            whatItIs: "The external event notification pipeline used by payment gateways, CI/CD platforms, and SaaS APIs.",
            whyItExists: "External customer servers are frequently down, misconfigured, slow, or returning 500 errors. You cannot let customer downtime block your internal transaction pipelines.",
            codeDemo: {
              language: "java",
              code: `// HMAC-SHA256 Signature Header for Webhook Security
public class WebhookSigner {
    public static String computeSignature(String payload, String secret) throws Exception {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKey);
        byte[] hash = sha256Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        return Hex.encodeHexString(hash);
    }
}
// Dispatched HTTP Request:
// POST https://customer.com/webhooks
// X-Webhook-Signature: t=1730000000,v1=5d41402abc4b2a76b9719d911017c592
// X-Webhook-Id: evt_123456789`,
              explanation: "Including a timestamp `t` and HMAC prevents replay attacks by malicious interceptors."
            },
            tradeoffs: "Aggressive retries can accidentally DDoS a struggling customer server. Adding randomized jitter and circuit breakers is mandatory.",
            followUpQuestions: [
              {
                question: "What is 'Exponential Backoff with Full Jitter'?",
                answer: "Instead of retrying at exact intervals (2s, 4s, 8s) which causes thundering herd synchronization, multiply by random jitter: `sleep = random(0, min(max_backoff, base * 2^attempt))`."
              }
            ],
            usedInProduction: "Stripe Webhooks, GitHub Webhook Delivery, Shopify Notifications, Twilio Event Streams.",
            relatedTopics: ["HMAC Verification", "Exponential Backoff", "Dead Letter Queue"]
          }
        },
        {
          id: "sd-framework-20",
          question: "How do you achieve Zero-Downtime Database Migrations in production?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Use the 'Expand and Contract' (Parallel Run) pattern in 4 phases: (1) Expand: Add new column/table without touching old ones (allow nulls), (2) Dual-Write: App writes to BOTH old and new schemas, (3) Backfill: Asynchronous script migrates historical data in small batches, (4) Contract: Switch reads to new schema, remove dual-writes, and safely drop the old schema.",
            mentalModel: "Changing an airplane engine mid-flight: You install engine 2 alongside engine 1, fire it up, verify full thrust, and only then shut down and detach engine 1.",
            whatItIs: "The engineering procedure for altering relational database schemas (renaming columns, changing data types, splitting tables) without taking the application offline.",
            whyItExists: "Running `ALTER TABLE users RENAME COLUMN phone TO mobile` locks the table in PostgreSQL/MySQL, blocking all reads and writes and causing total downtime.",
            codeDemo: {
              language: "markdown",
              code: `4-Step Expand and Contract Roadmap:

Phase 1: Expand (Deploy v1.1)
  * SQL: ADD COLUMN mobile_number VARCHAR(20) DEFAULT NULL;
  * Old code v1.0 continues running without errors.

Phase 2: Dual-Write (Deploy v1.2)
  * App writes new user phone numbers to BOTH phone AND mobile_number.
  * App continues reading from old 'phone' column.

Phase 3: Backfill Historical Data (Background Job)
  * Run batch updater:
    UPDATE users SET mobile_number = phone 
    WHERE mobile_number IS NULL AND id BETWEEN 1 AND 10000;
  * Sleep 50ms between batches to avoid saturating replication lag and disk I/O.

Phase 4: Contract (Deploy v1.3 & Cleanup)
  * Switch application reads from 'phone' to 'mobile_number'.
  * Stop writing to old 'phone' column.
  * Drop old column after 1 week: ALTER TABLE users DROP COLUMN phone;`,
              explanation: "At no point during this 4-step sequence is the database table locked or the application unavailable."
            },
            tradeoffs: "Requires running 2-3 separate application deployments and maintaining dual-write synchronization logic for days.",
            followUpQuestions: [
              {
                question: "How do tools like GitHub's gh-ost or pt-online-schema-change work?",
                answer: "They create an empty shadow copy of the table, apply the schema alter, continuously copy binlog delta events from the original table to the shadow table, and perform an atomic cut-over swap."
              }
            ],
            usedInProduction: "GitHub gh-ost, Shopify database platform team, Stripe migrations.",
            relatedTopics: ["Expand and Contract", "Schema Migrations", "Table Locking"]
          }
        },
        {
          id: "sd-framework-21",
          question: "How do you design a Real-Time Collaborative Editing system (like Google Docs)?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Real-time collaborative editing resolves concurrent character insertions and deletions across multiple users without locking. The two dominant approaches are: (1) Operational Transformation (OT) used by Google Docs (relies on a central server to sequence and transform operations), and (2) Conflict-Free Replicated Data Types (CRDTs) like Yjs and Automerge (mathematically peer-to-peer mergeable without central coordination).",
            mentalModel: "OT is like a courtroom court reporter who reads every statement and adjusts timestamps so everyone agrees on who spoke first. CRDTs are like unique jigsaw puzzle pieces that can be assembled in any order and still produce the exact same picture.",
            whatItIs: "The distributed consensus algorithm for rich-text and document synchronization across concurrent web/mobile clients.",
            whyItExists: "If Alice and Bob simultaneously type at character position 5, simple string replacement causes characters to overwrite or scramble each other.",
            codeDemo: {
              language: "text",
              code: `Operational Transformation (OT) vs CRDT:

1. Operational Transformation (Google Docs):
   - User A types 'X' at pos 3 -> Op A: Insert(3, 'X')
   - User B deletes char at pos 1 -> Op B: Delete(1)
   - Both send ops to Central Server.
   - Server transforms Op A against Op B:
     Since Op B deleted a char before pos 3, Op A's target shifted left!
     Transformed Op A' = Insert(2, 'X').
   - Server broadcasts transformed ops to all clients.

2. CRDT (Conflict-Free Replicated Data Types - Figma / Apple Notes):
   - Every character is given an immutable, globally unique fractional ID:
     Letter 'C' at ID [0.1, User1], Letter 'A' at ID [0.2, User2], Letter 'T' at ID [0.3, User1]
   - Inserting between 'C' and 'A' creates ID [0.15, User3].
   - Characters are sorted deterministically by fractional index.
   - Merging requires no central server lock; commutativity ensures identical state.`,
              explanation: "CRDTs support offline editing and peer-to-peer WebRTC synchronization without requiring an active server connection."
            },
            tradeoffs: "CRDTs consume more memory because every single character retains historical metadata and tombstone deletion markers.",
            followUpQuestions: [
              {
                question: "What is a 'Tombstone' in CRDT text editing?",
                answer: "When a user deletes a character, the system doesn't erase it from memory; it marks it as a tombstone (invisible) to maintain valid positional coordinates for other concurrent edits."
              }
            ],
            usedInProduction: "Google Docs (OT), Figma (Custom CRDT), Apple Notes (CRDT), Notion.",
            relatedTopics: ["Operational Transformation", "CRDTs", "WebSocket Synchronization"]
          }
        },
        {
          id: "sd-framework-22",
          question: "How do you design a Session Management system for millions of concurrent users?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Three primary architectures: (1) Centralized In-Memory Cache (Redis Cluster): Session ID stored in secure HttpOnly cookie; session state lives in Redis (instant invalidation, sub-millisecond lookup), (2) Stateless JWT (JSON Web Tokens): State cryptographically signed and stored on client (zero server DB lookups, but hard to revoke), (3) Hybrid JWT + Revocation Blacklist: Short-lived JWT (15 mins) + Refresh Token stored in Redis for revocation.",
            mentalModel: "Centralized session is a coat check ticket: you hold a numbered token, the coat check attendant holds your coat. JWT is a certified passport: your information is stamped directly into the passport book with a digital seal.",
            whatItIs: "The authentication state management architecture across web, mobile, and third-party API clients.",
            whyItExists: "Storing session state in local server RAM (sticky sessions) breaks horizontal autoscaling; if server #3 restarts, all its users are logged out.",
            codeDemo: {
              language: "markdown",
              code: `Modern Hybrid Session Architecture (Industry Standard):

1. Client Login:
   - Client sends credentials (email/password).
   - Auth Service validates and returns:
     * Access Token (JWT): 15-minute expiration, contains user_id & permissions.
     * Refresh Token (UUID v4): 30-day expiration, stored in Redis:
       Key: "refresh_token:<uuid>" -> Value: "{user_id, device_fingerprint}"

2. API Requests:
   - Client passes Access Token in Authorization header: Bearer <jwt>.
   - Microservices validate JWT signature locally using Public RSA Key (0 DB I/O!).

3. Token Expiration:
   - When Access Token expires after 15 mins, client calls /auth/refresh with Refresh Token.
   - Auth service checks Redis. If valid, issues a new 15-min JWT.

4. Instant Logout / Security Revocation:
   - To kick a compromised user, delete their Refresh Token from Redis.
   - The user is permanently locked out within 15 minutes without maintaining a massive JWT blacklist.`,
              explanation: "Short-lived JWTs give the speed of stateless tokens while Redis refresh tokens give administrators instant revocation power."
            },
            tradeoffs: "Stateless JWT cannot be immediately revoked before expiration unless a centralized blacklist is maintained, which negates statelessness.",
            followUpQuestions: [
              {
                question: "Why should session tokens always use HttpOnly and SameSite cookie flags?",
                answer: "`HttpOnly` prevents JavaScript access, completely neutralizing Cross-Site Scripting (XSS) session theft. `SameSite=Strict/Lax` prevents Cross-Site Request Forgery (CSRF)."
              }
            ],
            usedInProduction: "OAuth2 / OIDC protocols, Auth0, AWS Cognito, Netflix account authentication.",
            relatedTopics: ["JWT vs Session Cookies", "OAuth2 Flow", "Redis Session Store"]
          }
        },
        {
          id: "sd-framework-23",
          question: "How do you design a Scalable Full-Text Search Engine (like Elasticsearch)?",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Full-text search engines use Inverted Indexes instead of forward tables. Documents are tokenized, stemmed, and stripped of stop words during indexing. The inverted index maps every unique word to a Posting List of document IDs containing that word. Distributed search (Elasticsearch) shards the index across nodes and uses a Scatter-Gather coordination pattern for queries.",
            mentalModel: "The index at the very back of a textbook: Instead of reading 1,000 pages to find where 'Consistent Hashing' is mentioned, look up 'Consistent Hashing' in the index to instantly see pages [42, 118, 209].",
            whatItIs: "The search architecture powering product search (Amazon), log analytics (ELK stack), and autocomplete engines.",
            whyItExists: "Relational SQL `LIKE '%keyword%'` queries perform full table scans (O(N) time) and cannot use B-Tree indexes, making them impossible for large text datasets.",
            codeDemo: {
              language: "text",
              code: `Inverted Index Data Structure:

Input Documents:
Doc 1: "Distributed systems scale horizontally"
Doc 2: "Relational databases scale vertically"

Text Processing Pipeline:
1. Tokenization: ["distributed", "systems", "scale", "horizontally"]
2. Normalization & Stemming: "systems" -> "system", "scaling" -> "scale"

Inverted Index Postings List:
Term          | Postings List (DocID, Frequency, Position)
--------------|--------------------------------------------
database      | [Doc 2: pos 1]
distributed   | [Doc 1: pos 0]
horizontally  | [Doc 1: pos 3]
relational    | [Doc 2: pos 0]
scale         | [Doc 1: pos 2], [Doc 2: pos 2]
system        | [Doc 1: pos 1]
vertically    | [Doc 2: pos 3]

Query: "scale AND distributed"
-> Fetch postings for 'scale': [Doc 1, Doc 2]
-> Fetch postings for 'distributed': [Doc 1]
-> Intersect lists: Result = [Doc 1] (Completed in microseconds!)`,
              explanation: "Sorted postings lists allow intersection and union operations in O(A + B) linear time using two-pointer algorithms."
            },
            tradeoffs: "Inverted indexes are expensive to update on individual document writes; Lucene writes immutable segment files and merges them asynchronously in the background.",
            followUpQuestions: [
              {
                question: "What is BM25 ranking algorithm?",
                answer: "BM25 is the industry-standard probabilistic relevance scoring algorithm based on Term Frequency (TF) and Inverse Document Frequency (IDF) with document length normalization."
              }
            ],
            usedInProduction: "Elasticsearch, Apache Solr, Amazon OpenSearch, Lucene.",
            relatedTopics: ["Inverted Index", "BM25 Ranking", "Scatter-Gather Pattern"]
          }
        },
        {
          id: "sd-framework-24",
          question: "How do you design a distributed Asset Transcoding and Media Processing Pipeline?",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A media processing pipeline ingests high-resolution video/audio, segments it into chunks, and transcodes it in parallel into multiple bitrates and codecs (HLS/DASH). Architecture: (1) S3 Pre-Signed Upload URL, (2) S3 ObjectCreated event triggers Kafka/SQS, (3) Splitter worker segments video into 10s chunks, (4) Transcoder worker pool encodes chunks in parallel via FFmpeg, (5) Stitcher generates master HLS playlist (.m3u8), (6) CDN caches chunks.",
            mentalModel: "Assembly line factory: A raw 4K movie is chopped into 500 short 10-second scenes. 500 workers transcode individual scenes simultaneously into 1080p, 720p, and 480p. The final assembler binds them into an interactive playlist.",
            whatItIs: "The distributed media architecture powering YouTube, Netflix, TikTok, and Vimeo.",
            whyItExists: "Transcoding a 2-hour 4K video serially on a single machine takes 4 hours. Chunking and parallelizing across 50 GPU instances finishes in 3 minutes.",
            codeDemo: {
              language: "markdown",
              code: `Media Transcoding Pipeline Architecture:

1. Direct Upload:
   Client -> API Gateway -> Generates S3 Pre-Signed URL
   Client -> S3: Direct multipart upload (bypasses app server memory!)

2. Event Notification:
   S3 -> EventBridge / SQS: "raw_video_uploaded.mp4"

3. Parallel DAG Workflow (AWS Step Functions / Temporal):
   [Raw Video]
       │
       ▼
   [Video Chunker (FFmpeg)] -> Splits video into 10-second .ts chunks
       │
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
   Chunk 001      Chunk 002      Chunk 003     ... Chunk N
   [Worker Pool: GPU spot instances running FFmpeg transcode]
   - 1080p @ 4.5 Mbps
   - 720p  @ 2.2 Mbps
   - 480p  @ 800 Kbps
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
       │
       ▼
   [Playlist Generator] -> Compiles master.m3u8 index file
       │
       ▼
   [Output S3 Bucket] -> Invalidation trigger to CloudFront CDN`,
              explanation: "Direct S3 pre-signed uploads prevent multiterabyte video streams from exhausting application server bandwidth."
            },
            tradeoffs: "Chunking introduces complexity in maintaining Audio/Video sync at keyframe (I-frame) boundaries; splitting must strictly occur on keyframes.",
            followUpQuestions: [
              {
                question: "What is Adaptive Bitrate Streaming (ABR)?",
                answer: "ABR client players continuously measure local Wi-Fi/cellular bandwidth and switch dynamically between 1080p, 720p, or 480p chunks every 5-10 seconds without buffering."
              }
            ],
            usedInProduction: "YouTube video ingestion, Netflix Archer transcoding platform, TikTok media pipeline.",
            relatedTopics: ["HLS & DASH Protocols", "Pre-Signed URLs", "Adaptive Bitrate Streaming"]
          }
        },
        {
          id: "sd-framework-25",
          question: "What are the common Red Flags that instantly disqualify candidates in System Design interviews?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The top 7 red flags: (1) Jumping straight to drawing architecture diagrams before asking clarifying questions, (2) Dropping buzzwords (Kafka, Redis, K8s) without being able to explain why they are needed, (3) Assuming the network is reliable and zero-latency, (4) Designing a SPOF and failing to notice it when asked, (5) Ignoring data consistency and race conditions, (6) Defensiveness when challenged, and (7) Silence without communicating thought processes.",
            mentalModel: "An interview is a simulation of working together on a high-stakes production incident. If you do not listen, jump to conclusions, ignore edge cases, or get defensive, interviewers conclude you will be a risky teammate in production.",
            whatItIs: "The explicit failure modes documented in FAANG interviewer grading rubrics.",
            whyItExists: "Knowing these red flags enables candidates to self-correct during the interview.",
            codeDemo: {
              language: "markdown",
              code: `Candidate Red Flags vs Senior Signals:

🚩 Red Flag 1: "Let's put Kafka, Redis, Elasticsearch, and Cassandra here!"
✅ Senior Signal: "Let's start with a simple PostgreSQL database. At 5,000 write QPS, PostgreSQL will hit disk I/O limits, so this is when we introduce Kafka to buffer writes."

🚩 Red Flag 2: Stays silent for 3 minutes drawing boxes.
✅ Senior Signal: Think aloud continuously: "I'm thinking about whether we should fan-out on read or write. Given our 100:1 read ratio, fan-out on write is attractive, but celebrity accounts require special handling."

🚩 Red Flag 3: Ignores failures ("The database will just write it").
✅ Senior Signal: Proactively plans for failure: "If this worker crashes halfway through charging the card, we need an idempotency key and a dead-letter queue to prevent double charges."

🚩 Red Flag 4: Argues obstinately when the interviewer points out a flaw.
✅ Senior Signal: "That's a great catch. I hadn't factored in the cross-region replication lag. We can address that with quorum reads or sticky regional routing."`,
              explanation: "Senior candidates treat the interviewer as a collaborative peer tackling a complex architecture problem together."
            },
            tradeoffs: "Over-communicating minor implementation trivia can chew up valuable time needed for high-level trade-offs.",
            followUpQuestions: [
              {
                question: "How should you conclude the final 3 minutes of a system design interview?",
                answer: "Summarize: 'To recap, our architecture satisfies the 100M DAU requirement with sub-50ms latency using X caching. If we had more time, the two areas I would strengthen next are automated multi-region DR failover and telemetry metrics.'"
              }
            ],
            usedInProduction: "Google, Meta, and Amazon Staff Bar Raiser evaluation standards.",
            relatedTopics: ["Interview Strategy", "Communication Skills", "Bar Raiser Evaluation"]
          }
        }
      ]
    }
  ]
};
