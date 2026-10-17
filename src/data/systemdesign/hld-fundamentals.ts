import { Category } from "@/types";

export const hldFundamentalsCategory: Category = {
  id: "hld-fundamentals",
  title: "High-Level Design (HLD) Fundamentals",
  subTopics: [
    {
      id: "scalability-load-balancing",
      title: "Scalability & Load Balancing",
      questions: [
        {
          id: "hld-scale-1",
          question: "What is the difference between Vertical and Horizontal Scaling, and how do you make a service stateless?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Vertical scaling (scale up) adds more CPU, RAM, or disk to a single machine; it has a hard hardware ceiling and single point of failure. Horizontal scaling (scale out) adds more commodity servers behind a load balancer; it requires stateless application servers where session data and state are offloaded to distributed stores like Redis or databases.",
            mentalModel: "Vertical scaling is hiring a taller, stronger builder who can carry 10 bricks at once. Horizontal scaling is hiring 10 normal builders working in parallel. Eventually, no single human can carry 1,000 bricks, but 100 builders can easily divide the load.",
            whatItIs: "A foundational architecture decision. Stateful services store client session state (e.g., login tokens, shopping carts) in server local memory, binding a user to a specific machine via 'sticky sessions'. Stateless services store no client state in application memory, allowing any server in the cluster to handle any request.",
            whyItExists: "Enables systems to withstand exponential traffic spikes without physical hardware limits or catastrophic single points of failure.",
            comparisonTable: {
              title: "Vertical Scaling (Scale-Up) vs Horizontal Scaling (Scale-Out)",
              headers: ["Dimension", "Vertical Scaling (Scale-Up)", "Horizontal Scaling (Scale-Out)"],
              rows: [
                ["Scaling Approach", "Upgrade hardware (CPU, RAM, NVMe) on 1 machine", "Add commodity VM/container instances behind a Load Balancer"],
                ["Ceiling / Capacity", "Hard physical ceiling (socket / RAM bus limit)", "Theoretically unlimited horizontal elasticity"],
                ["Downtime Risk", "Requires reboot / maintenance window to resize", "Zero downtime (rolling deployments & dynamic autoscaling)"],
                ["Fault Tolerance", "Single Point of Failure (SPOF); server crash kills app", "High Availability (HA); traffic fails over to healthy nodes"],
                ["Cost Curve", "Exponentially expensive for ultra high-end hardware", "Linear & cost-effective using standard cloud instances"],
                ["Session State", "Can keep state in local server heap memory", "Requires 100% Stateless architecture (state in Redis/DB)"],
                ["Network Latency", "Zero distributed network hops (all in-memory)", "Small network hop to centralized cache (Redis: <1ms)"]
              ]
            },
            codeDemo: {
              language: "java",
              code: "// ❌ STATEFUL ANTI-PATTERN (Breaks horizontal scaling)\n@RestController\npublic class CartController {\n    // Bound to local server JVM heap! If server crashes or LB routes to node 2, cart is lost!\n    private Map<String, List<Item>> userCarts = new ConcurrentHashMap<>();\n}\n\n// ✅ STATELESS BEST PRACTICE (Scales to infinity)\n@RestController\npublic class CartController {\n    private final RedisTemplate<String, CartDto> redisTemplate;\n\n    @PostMapping(\"/cart/add\")\n    public ResponseEntity<Void> addToCart(@AuthenticationPrincipal User user, @RequestBody Item item) {\n        // State lives in shared Redis cluster accessible by all 100 app instances\n        redisTemplate.opsForList().rightPush(\"cart:\" + user.getId(), item);\n        return ResponseEntity.ok().build();\n    }\n}"
            },
            tradeoffs: "Statelessness introduces a network hop to Redis/DB for every request. Vertical scaling is simpler for small startups with low traffic (<5,000 DAU) since it avoids distributed systems complexities.",
            theyMightAskNext: [
              {
                question: "What are Sticky Sessions and why are they considered an architectural anti-pattern?",
                answer: "Sticky sessions (session affinity) configure the load balancer to route all requests from a specific user IP/cookie to the same physical server. It causes uneven traffic distribution, prevents autoscaling down, and loses user data when a node crashes."
              }
            ],
            usedInProduction: "Standard architecture for Netflix and Uber: edge API services are 100% stateless, scaling from 200 to 2,000 EC2 instances dynamically during peak evening hours.",
            relatedTopics: ["Load Balancing", "Redis Caching", "Microservices"]
          }
        },
        {
          id: "hld-scale-2",
          question: "What is the difference between Layer 4 (L4) and Layer 7 (L7) Load Balancers?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Layer 4 (Transport layer) load balancers route traffic based on IP address and TCP/UDP port without decrypting or inspecting packet content. Layer 7 (Application layer) load balancers terminate TLS, inspect HTTP headers, cookies, URLs, and payloads, enabling content-based routing and rate limiting.",
            mentalModel: "An L4 load balancer is a post office sorting letters based purely on the ZIP code stamped on the outside of the envelope (fast, blind). An L7 load balancer opens the envelope, reads the letter, and routes it depending on whether it's an invoice, a complaint, or a VIP order (smart, resource-intensive).",
            whatItIs: "L4 operates at the transport layer (e.g., AWS Network Load Balancer, Linux IPVS). L7 operates at the application layer (e.g., AWS Application Load Balancer, NGINX, HAProxy, Envoy).",
            whyItExists: "L4 provides ultra-low latency (millions of packets/sec with minimal CPU). L7 provides intelligent routing: sending `/api/v1/video` to video streaming clusters and `/api/v1/auth` to authentication microservices.",
            comparisonTable: {
              title: "Layer 4 (Transport) vs Layer 7 (Application) Load Balancers",
              headers: ["Dimension", "Layer 4 (L4) Load Balancer", "Layer 7 (L7) Load Balancer"],
              rows: [
                ["OSI Layer", "Transport Layer (TCP / UDP)", "Application Layer (HTTP, HTTPS, gRPC, WebSocket)"],
                ["Inspection Depth", "Packet headers only (IP + Port); payload is blind", "Deep packet inspection (Headers, Cookies, URL Path, Body)"],
                ["Routing Capability", "IP hash, Round-Robin, Least Connections", "Path-based routing (/api/video vs /api/auth), Header routing"],
                ["TLS / SSL", "TLS Passthrough (cannot decrypt traffic)", "TLS Termination & SSL offloading at edge"],
                ["Throughput & Latency", "Ultra-fast; millions of packets/sec with minimal latency", "Slightly higher latency (must decrypt & buffer HTTP frames)"],
                ["Resource Usage", "Minimal CPU & RAM overhead", "Higher CPU consumption (SSL decryption & string parsing)"],
                ["Sticky Sessions", "Client IP address affinity only", "Cookie-based sticky sessions and JWT inspection"],
                ["Industry Standards", "AWS NLB, Linux IPVS, HAProxy (TCP mode)", "AWS ALB, NGINX, Envoy, Traefik, Kong"]
              ]
            },
            codeDemo: {
              language: "nginx",
              code: "# Layer 7 Routing in NGINX (Content-Based Routing)\nhttp {\n    upstream auth_service {\n        server 10.0.1.10:8080;\n        server 10.0.1.11:8080;\n    }\n    upstream order_service {\n        server 10.0.2.10:8080;\n        server 10.0.2.11:8080;\n    }\n\n    server {\n        listen 80;\n        # Route based on HTTP URL Path (L7 feature)\n        location /api/v1/auth/ {\n            proxy_pass http://auth_service;\n        }\n        location /api/v1/orders/ {\n            proxy_pass http://order_service;\n        }\n    }\n}"
            },
            tradeoffs: "L7 requires TLS decryption and HTTP parsing, consuming significantly more CPU and memory than L4. Common enterprise pattern: L4 NLB at the edge forward to L7 NGINX/Envoy ingress controllers.",
            theyMightAskNext: [
              {
                question: "Can an L4 load balancer perform sticky sessions based on HTTP cookies?",
                answer: "No. Cookies exist in HTTP headers at Layer 7. L4 can only perform affinity based on Client IP address."
              }
            ],
            usedInProduction: "AWS ALB routes path-based microservices; Cloudflare uses L4 Maglev/XDP for DDoS mitigation and L7 Envoy for WAF and caching.",
            relatedTopics: ["Reverse Proxy", "API Gateway", "TLS Termination"]
          }
        },
        {
          id: "hld-scale-3",
          question: "Can you compare the common Load Balancing Algorithms: Round Robin, Least Connections, and Consistent Hashing?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Round Robin rotates requests sequentially across servers (best for uniform workloads). Least Connections routes to the server with the fewest active TCP connections (best for long-lived sessions like WebSockets). Consistent Hashing routes requests with the same key (e.g. user ID or URL) to the same server while minimizing rebalancing when servers are added/removed (best for distributed caches).",
            mentalModel: "Round Robin is dealing playing cards one-by-one around the circle. Least Connections is a grocery store coordinator pointing you to the cashier line with the fewest shopping carts. Consistent Hashing is assigning people to bank tellers based on the first letter of their last name.",
            whatItIs: "Algorithms executed by load balancers and reverse proxies to distribute incoming load evenly across a pool of healthy backend instances.",
            whyItExists: "Uneven traffic distribution causes 'hot spotting' where one server runs at 100% CPU while other nodes sit idle.",
            codeDemo: {
              language: "java",
              code: "// Consistent Hashing Concept in Java (TreeMap based ring)\npublic class ConsistentHashRouter<T> {\n    private final SortedMap<Long, T> ring = new TreeMap<>();\n    private final int numberOfReplicas; // Virtual nodes\n\n    public ConsistentHashRouter(int numberOfReplicas, Collection<T> nodes) {\n        this.numberOfReplicas = numberOfReplicas;\n        for (T node : nodes) add(node);\n    }\n\n    public T get(String key) {\n        if (ring.isEmpty()) return null;\n        long hash = hash(key);\n        if (!ring.containsKey(hash)) {\n            SortedMap<Long, T> tailMap = ring.tailMap(hash);\n            hash = tailMap.isEmpty() ? ring.firstKey() : tailMap.firstKey();\n        }\n        return ring.get(hash);\n    }\n}"
            },
            tradeoffs: "Weighted Round Robin assumes equal request cost; if one request takes 10 seconds and another takes 2 milliseconds, Round Robin will overload servers. Least Connections is vastly superior for variable-duration workloads.",
            theyMightAskNext: [
              {
                question: "Why are Virtual Nodes essential in Consistent Hashing?",
                answer: "Without virtual nodes, servers map to uneven arcs on the hash ring, causing severe traffic skew. Virtual nodes (e.g. 100-200 points per physical machine) distribute load evenly across all nodes."
              }
            ],
            usedInProduction: "Consistent hashing is the core routing algorithm in Apache Cassandra, Amazon DynamoDB, Akamai CDN, and Memcached client drivers.",
            relatedTopics: ["Consistent Hashing", "Distributed Caching", "L4 vs L7 Load Balancing"]
          }
        },
        {
          id: "hld-scale-4",
          question: "What is the difference between a Reverse Proxy, a Forward Proxy, and an API Gateway?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A Forward Proxy acts on behalf of CLIENTS to access the internet (hides client identity, content filtering, corporate firewalls). A Reverse Proxy acts on behalf of SERVERS (hides backend topology, SSL termination, caching). An API Gateway is an advanced reverse proxy specifically designed for microservices, providing auth, rate limiting, request transformation, and API analytics.",
            mentalModel: "Forward proxy is a corporate secretary who dials outbound phone calls for employees so outsiders only see the company switchboard number. Reverse proxy is a building receptionist who greets visitors and directs them to conference rooms. API Gateway is an airport security & ticketing hub that validates tickets, inspects baggage, checks visas, and directs you to your flight gate.",
            whatItIs: "Forward Proxy: Client -> Forward Proxy -> Internet -> Web Server.\nReverse Proxy: Client -> Internet -> Reverse Proxy -> Internal Servers.\nAPI Gateway: Client -> API Gateway (Auth, Throttling, Circuit Breaking) -> Microservices.",
            whyItExists: "Separates cross-cutting concerns (security, SSL, logging, rate limiting) from business domain microservices.",
            comparisonTable: {
              title: "Forward Proxy vs Reverse Proxy vs API Gateway",
              headers: ["Feature", "Forward Proxy", "Reverse Proxy", "API Gateway"],
              rows: [
                ["Protects", "Client", "Server", "Microservices"],
                ["Network Location", "Client-side private network / edge", "Server edge / DMZ", "Microservices ingress entry"],
                ["Primary Purpose", "Client anonymity, egress content filtering, cache", "Ingress traffic security, SSL termination, load balancing", "JWT authentication, rate limiting, routing, canary"],
                ["Protocol Handling", "Forward HTTP/HTTPS, SOCKS", "L4/L7 TCP, HTTP/1.1, HTTP/2", "REST, gRPC, WebSocket, GraphQL translation"],
                ["Real-World Examples", "Squid, Apache Traffic Server", "NGINX, HAProxy, Traefik, Envoy", "Kong, Spring Cloud Gateway, AWS API Gateway"]
              ]
            },
            codeDemo: {
              language: "nginx",
              code: `# NGINX Reverse Proxy & Upstream Load Balancing Configuration
upstream backend_microservices {
    server app-node1.internal:8080 weight=3;
    server app-node2.internal:8080 weight=2;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.revizo.com;

    # SSL Termination at edge
    ssl_certificate     /etc/ssl/certs/api.crt;
    ssl_certificate_key /etc/ssl/private/api.key;

    location /api/v1/orders {
        proxy_pass http://backend_microservices;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`
            },
            tradeoffs: "An API Gateway can become a single point of failure and an architectural bottleneck if business logic or heavy transformations are inappropriately placed inside it.",
            theyMightAskNext: [
              {
                question: "What is the Backend For Frontend (BFF) pattern?",
                answer: "Creating dedicated API gateways tailored to specific client interfaces (e.g., one BFF for mobile iOS/Android optimizing for low bandwidth, and another BFF for desktop web)."
              }
            ],
            usedInProduction: "Netflix Zuul / Spring Cloud Gateway act as API gateways routing to 1,000+ microservices; NGINX sits in front as the reverse proxy.",
            relatedTopics: ["L4 vs L7 Load Balancing", "Rate Limiting", "Spring Cloud Gateway"]
          }
        },
        {
          id: "hld-scale-5",
          question: "How do Active-Active and Active-Passive High Availability (HA) architectures differ?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "In Active-Passive (Master-Slave/Standby), one node handles all production traffic while the passive standby remains idle, replicating data; on primary failure, a failover promotes the standby. In Active-Active, two or more nodes simultaneously process live traffic in parallel, providing immediate zero-downtime failover and higher resource utilization.",
            mentalModel: "Active-Passive is carrying a spare tire in your trunk: it sits unused until you get a flat, requiring you to pull over and swap it on (failover downtime). Active-Active is a four-wheel-drive dual-engine plane: both engines run simultaneously; if one fails mid-air, the second engine keeps the plane flying with zero pause.",
            whatItIs: "High availability design patterns measuring RTO (Recovery Time Objective) and RPO (Recovery Point Objective). Multi-region Active-Active provides geographic disaster recovery.",
            whyItExists: "Single server failures are inevitable in cloud infrastructure. HA guarantees 99.99% ('four nines' = 52 minutes downtime/year) or 99.999% availability.",
            comparisonTable: {
              title: "Active-Passive vs Active-Active High Availability",
              headers: ["Dimension", "Active-Passive (Master-Standby)", "Active-Active (Multi-Master)"],
              rows: [
                ["Traffic Handling", "1 primary active, 1 standby idle", "All nodes actively process live traffic"],
                ["Hardware Utilization", "50% wasted capacity (standby idle)", "100% compute utilization across all nodes"],
                ["Failover Time (RTO)", "Seconds to minutes (requires promotion)", "Near 0 ms (immediate traffic redirection)"],
                ["Data Loss Risk (RPO)", "Minimal with sync replication; potential lag with async", "Risk of write conflicts / split-brain state"],
                ["System Complexity", "Low (single master writer, standard replicas)", "Very High (conflict resolution, CRDTs, multi-region sync)"],
                ["Consistency Model", "Strong Consistency (linearizable writes)", "Eventual Consistency (Last-Write-Wins / vector clocks)"],
                ["Primary Use Cases", "Banking ledgers, relational OLTP databases", "Global CDN, DNS, multi-region payment gateways (Visa)"]
              ]
            },
            codeDemo: {
              language: "yaml",
              code: `# Keepalived / HAProxy VRRP Configuration for Active-Passive Failover
vrrp_script check_haproxy {
    script "killall -0 haproxy"
    interval 2
    weight 2
}

vrrp_instance VI_1 {
    state MASTER            # BACKUP on passive node
    interface eth0
    virtual_router_id 51
    priority 101            # Priority 100 on passive standby
    virtual_ipaddress {
        192.168.1.100       # Floating Virtual IP (VIP) transfers on failure
    }
    track_script {
        check_haproxy
    }
}`
            },
            tradeoffs: "Active-Active databases are extremely complex due to multi-master write conflicts. If two users update the same record in US-East and EU-West simultaneously, conflict resolution (e.g., Last-Write-Wins or CRDTs) is required.",
            theyMightAskNext: [
              {
                question: "What is Split-Brain in High Availability clusters?",
                answer: "A network partition where the active and passive nodes lose communication. Both assume the other is dead, and both promote themselves to active master, corrupting the database with divergent conflicting writes."
              }
            ],
            usedInProduction: "Banking databases use Active-Passive with automated failover for strict ACID safety; global payment networks (Visa/Mastercard) use multi-region Active-Active.",
            relatedTopics: ["CAP Theorem", "Consensus Algorithms", "Database Replication"]
          }
        },
        {
          id: "hld-scale-6",
          question: "How do Cloud Auto-Scaling and Health Checks prevent service flapping during traffic surges?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Auto-scaling dynamically scales instance counts based on metrics (CPU > 70%, p99 latency > 200ms). Flapping (rapid scale-out followed by immediate scale-in) is prevented using Cooldown Periods (e.g. 300s), step-scaling policies, and hysteresis thresholds. Health checks distinguish between liveness (process alive) and readiness (ready for traffic).",
            mentalModel: "Flapping is like a broken room thermostat: the heater kicks on at 69.9°F, hits 70.1°F 10 seconds later and shuts off, then kicks on again 10 seconds later, burning out the motor. Hysteresis sets a buffer (turn on at 68°F, turn off at 72°F) to maintain smooth operation.",
            whatItIs: "Reactive and predictive scaling policies implemented in Kubernetes (Horizontal Pod Autoscaler - HPA) and AWS Auto Scaling Groups (ASG).",
            whyItExists: "Traffic spikes (Black Friday, marketing push) overwhelm fixed capacity, while off-peak hours waste thousands of dollars on idle cloud servers.",
            codeDemo: {
              language: "yaml",
              code: "# Kubernetes HPA with Flapping Stabilization Window\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: order-service-hpa\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: order-service\n  minReplicas: 5\n  maxReplicas: 50\n  metrics:\n    - type: Resource\n      resource:\n        name: cpu\n        target:\n          type: Utilization\n          averageUtilization: 70\n  behavior:\n    scaleDown:\n      stabilizationWindowSeconds: 300 # Wait 5 minutes before scaling in to prevent flapping!"
            },
            tradeoffs: "VM-based autoscaling takes 3–5 minutes to spin up an EC2 instance. For flash sales where traffic jumps 100x in 2 seconds, reactive autoscaling is too slow; scheduled pre-warming or serverless scale-to-zero is required.",
            theyMightAskNext: [
              {
                question: "What metrics are best for auto-scaling web services?",
                answer: "Avoid relying solely on CPU utilization; use Request Count Per Target (RPS) or concurrency queue depth, as I/O-bound services can run out of threads while CPU remains at only 30%."
              }
            ],
            usedInProduction: "Standard in all Kubernetes production clusters managing millions of pods on AWS EKS and Google GKE.",
            relatedTopics: ["Kubernetes Probes", "Graceful Shutdown", "Vertical vs Horizontal Scaling"]
          }
        }
      ]
    },
    {
      id: "caching-cdn",
      title: "Distributed Caching & CDN",
      questions: [
        {
          id: "hld-cache-1",
          question: "What are the 4 primary Caching Strategies: Cache-Aside, Write-Through, Write-Back, and Write-Around?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "1. Cache-Aside (Lazy Loading): Application reads from cache; on miss, reads DB, writes to cache. 2. Write-Through: Application writes to cache, and cache synchronously writes to DB before confirming. 3. Write-Back (Write-Behind): Application writes to cache, which acknowledges immediately and asynchronously flushes batches to DB. 4. Write-Around: Application writes directly to DB, bypassing cache.",
            mentalModel: "Cache-Aside is checking your personal desk for a file; if missing, you walk to the archive, grab it, and leave a copy on your desk. Write-Through is handing a paper to an assistant who stamps it and immediately files it in the vault before nodding. Write-Back is dropping documents into an outbox tray for nightly filing. Write-Around is walking directly to the archive to file without keeping a desk copy.",
            whatItIs: "Patterns dictating how application code, in-memory caches (Redis/Memcached), and permanent databases interact during read and write operations.",
            whyItExists: "Databases are bounded by disk I/O and network connections (~1,000–5,000 QPS). In-memory caches serve 100,000+ QPS with sub-millisecond latencies.",
            codeDemo: {
              language: "java",
              code: "// 1. Cache-Aside Pattern (Most Common)\npublic User getUser(Long id) {\n    String key = \"user:\" + id;\n    User cached = redis.get(key);\n    if (cached != null) return cached;\n\n    User user = database.findById(id);\n    if (user != null) {\n        redis.setex(key, 3600, user); // TTL 1 hour\n    }\n    return user;\n}\n\n// Write mutation with Cache-Aside: Best practice is EVICT (delete), not update!\npublic void updateUser(User user) {\n    database.save(user);\n    redis.delete(\"user:\" + user.getId()); // Evict to prevent race conditions\n}"
            },
            tradeoffs: "Write-Back provides blazing fast writes, but risks DATA LOSS if the cache node crashes before flushing to database. Cache-Aside can suffer from stale data during concurrent writes.",
            theyMightAskNext: [
              {
                question: "In Cache-Aside, why should you DELETE the cache key on update rather than UPDATE it?",
                answer: "To avoid race conditions: if Thread A updates DB then updates Cache, and Thread B updates DB concurrently, the cache can end up with Thread A's stale value permanently. Deleting the key forces the next read to fetch the latest DB state."
              }
            ],
            usedInProduction: "Cache-Aside is used in 90% of web apps; Write-Back is used for high-frequency write operations like real-time view counts, click tracking, and IoT sensor streams.",
            relatedTopics: ["Cache Eviction Policies", "Cache Stampede", "Redis vs Memcached"]
          }
        },
        {
          id: "hld-cache-2",
          question: "How do Cache Eviction Policies (LRU, LFU, FIFO, ARC) work and when should you choose each?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "When cache memory reaches its limit, eviction policies decide which items to purge. LRU (Least Recently Used) discards items not accessed for the longest time. LFU (Least Frequently Used) discards items with the lowest access count. FIFO (First-In-First-Out) purges the oldest stored items. ARC (Adaptive Replacement Cache) dynamically balances recency and frequency.",
            mentalModel: "LRU is organizing your closet: clothes you haven't worn in months are donated. LFU is keeping clothes you wear 50 times a year even if you didn't wear them yesterday, discarding clothes you only wore once. FIFO is a grocery shelf selling milk strictly by arrival date.",
            whatItIs: "LRU is implemented with a Doubly Linked List + HashMap for O(1) reads and O(1) evictions. LFU requires frequency counters and min-heaps or frequency buckets.",
            whyItExists: "RAM is expensive and finite; caches cannot store the entire database in memory.",
            codeDemo: {
              language: "java",
              code: "// LRU Cache Implementation using Java LinkedHashMap\npublic class LRUCache<K, V> extends LinkedHashMap<K, V> {\n    private final int capacity;\n\n    public LRUCache(int capacity) {\n        // accessOrder = true enables LRU (default is insertion-order)\n        super(capacity, 0.75f, true);\n        this.capacity = capacity;\n    }\n\n    @Override\n    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {\n        return size() > capacity; // Automatically evicts least recently accessed entry\n    }\n}"
            },
            tradeoffs: "LRU suffers from 'cache pollution': a one-time batch scan (e.g. nightly analytics job reading 10 million rows) will flush out all popular hot keys. LFU solves this, but suffers from historical bias where old popular items linger forever.",
            theyMightAskNext: [
              {
                question: "How does Redis implement LRU memory eviction?",
                answer: "Redis does NOT use true LRU (which consumes extra memory for pointers). It uses an Approximated LRU algorithm: it samples 5 random keys and evicts the best candidate among the sample, achieving 99% accuracy with zero pointer overhead."
              }
            ],
            usedInProduction: "LRU is default in Redis (`allkeys-lru`); Caffeine cache in Java uses Window TinyLFU (W-TinyLFU) to beat both LRU and LFU in real-world hit ratios.",
            relatedTopics: ["Redis Caching", "Cache-Aside", "LLD LRU Cache"]
          }
        },
        {
          id: "hld-cache-3",
          question: "What are Cache Penetration, Cache Breakdown (Stampede), and Cache Avalanche, and how do you prevent each?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "1. Cache Penetration: Queries for non-existent keys bypass cache and hammer database (Fix: Bloom filter or cache null values with short TTL). 2. Cache Breakdown (Stampede): A single ultra-hot key expires, and thousands of concurrent requests all hit the DB simultaneously (Fix: Mutex lock, SingleFlight, or proactive background refresh). 3. Cache Avalanche: Thousands of keys expire at the exact same second, crushing the database (Fix: Add random TTL jitter: `TTL = base + rand(300)`).",
            mentalModel: "Penetration is asking a librarian for a book that doesn't exist 10,000 times: each time the librarian walks to the basement. Stampede is the Justin Bieber ticket key expiring: 50,000 fans rush the database teller at once. Avalanche is all alarm clocks ringing at 7:00:00 AM, causing everyone to crash the highway at the exact same second.",
            whatItIs: "The three classic failure modes of distributed caching systems that can trigger catastrophic cascading database outages.",
            whyItExists: "Uncoordinated cache eviction and malicious traffic exploit the performance gap between memory (<1ms) and disk databases (100ms+ under load).",
            codeDemo: {
              language: "java",
              code: "// Prevention 1: Cache Null Object (Penetration)\nif (user == null) {\n    redis.setex(\"user:\" + id, 60, \"NULL_OBJECT\"); // Cache empty result for 60s\n}\n\n// Prevention 2: Distributed Mutex / SingleFlight (Stampede)\nString lockKey = \"lock:user:\" + id;\nif (redis.setNx(lockKey, \"1\", 5 /* seconds */)) {\n    try {\n        user = db.get(id);\n        redis.set(key, user);\n    } finally {\n        redis.del(lockKey);\n    }\n} else {\n    Thread.sleep(50);\n    return getUser(id); // Retry from cache\n}\n\n// Prevention 3: Random Jitter (Avalanche)\nint jitter = new Random().nextInt(300); // 0 - 5 min random jitter\nredis.setex(key, 3600 + jitter, value); // Spreads out expiration times!"
            },
            tradeoffs: "Caching null objects consumes cache memory if attackers query millions of random IDs; Bloom Filters are memory-efficient alternatives that reject invalid IDs before touching cache or DB.",
            theyMightAskNext: [
              {
                question: "How does a Bloom Filter prevent Cache Penetration?",
                answer: "A Bloom Filter is a space-efficient probabilistic data structure that tests set membership: it can definitively tell if an element is NOT in the database (0% false negatives), rejecting fraudulent queries with zero DB hits."
              }
            ],
            usedInProduction: "Standard defense in high-volume services (Twitter, e-commerce flash sales) to guarantee database uptime during celebrity tweets or viral events.",
            relatedTopics: ["Cache-Aside", "Redis vs Memcached", "Bloom Filters"]
          }
        },
        {
          id: "hld-cache-4",
          question: "When should you choose Redis vs Memcached for distributed caching?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Choose Redis for rich data structures (Strings, Hashes, Lists, Sets, Sorted Sets, Bitmaps, HyperLogLogs), persistence (RDB/AOF), pub/sub, Lua scripting, and high availability via Redis Sentinel/Cluster. Choose Memcached for simple key-value string caching where multithreaded vertical CPU scaling on large multi-core servers is required.",
            mentalModel: "Memcached is a simple, blazing-fast multi-lane highway toll booth: it processes simple tokens across all lanes efficiently. Redis is an advanced Swiss Army knife: it stores structured items, saves to disk, runs scripts, and executes distributed locks.",
            whatItIs: "Redis is primarily single-threaded for command execution (using non-blocking I/O multiplexing; I/O threads added in Redis 6). Memcached is multi-threaded and scales across all CPU cores on a single box.",
            whyItExists: "Different design philosophies: Memcached focused purely on lightweight in-memory caching; Redis evolved into a multi-model in-memory data store.",
            comparisonTable: {
              title: "Redis vs Memcached Architectural Comparison",
              headers: ["Feature / Dimension", "Redis", "Memcached"],
              rows: [
                ["Data Structures", "Strings, Hashes, Lists, Sets, Sorted Sets, Bitmaps, Streams", "Pure Key-Value (Strings / raw serialized bytes only)"],
                ["Persistence", "RDB snapshots + AOF append-only log with fsync", "Pure in-memory (No disk persistence; data lost on restart)"],
                ["Threading Architecture", "Single-threaded event loop for commands (I/O threads in v6+)", "Multi-threaded with internal slab allocator (scales across all CPU cores)"],
                ["High Availability", "Native Redis Sentinel & Redis Cluster with automatic failover", "None natively (relies on client-side consistent hashing)"],
                ["Scripting & Transactions", "Lua Scripting (atomic execution), MULTI/EXEC transactions", "Atomic CAS (Check-And-Set) only"],
                ["Pub / Sub & Streaming", "Native Pub/Sub channels and Kafka-like Streams", "Not supported"],
                ["Memory Eviction", "LRU, LFU, Random, TTL-based eviction across keys", "LRU per slab class (can cause early eviction even with free RAM)"],
                ["Best Use Cases", "Leaderboards (ZSET), rate limiting, caching, distributed locks", "Pure high-throughput caching of static serialized objects"]
              ]
            },
            codeDemo: {
              language: "java",
              code: `// Redis Multi-Data-Structure Usage (Spring Data Redis)
@Service
public class RedisFeatureDemo {
    @Autowired
    private StringRedisTemplate redis;

    public void demonstrateStructures() {
        // 1. Key-Value with TTL
        redis.opsForValue().set("session:user:101", "token_abc", Duration.ofMinutes(30));

        // 2. Sorted Set for Real-Time Leaderboard (O(log N))
        redis.opsForZSet().add("leaderboard:gaming", "player_alpha", 9850.0);
        redis.opsForZSet().add("leaderboard:gaming", "player_beta", 10200.0);

        // 3. Atomic Rate Limiter Counter
        Long requests = redis.opsForValue().increment("rate:ip:192.168.1.1");
    }
}`
            },
            tradeoffs: "Because Redis command execution is single-threaded, a slow command (like `KEYS *` on 10 million keys) blocks the entire server for all other clients. Never run `KEYS *` in production; use `SCAN` instead.",
            theyMightAskNext: [
              {
                question: "How does Redis Sorted Set (ZSET) implement leaderboards?",
                answer: "ZSET uses a combination of a SkipList and a HashTable, providing O(log N) element additions, removals, and rank lookups, perfect for real-time gaming or sales leaderboards."
              }
            ],
            usedInProduction: "Redis powers Twitter feeds, Uber driver geospatial locations, and GitHub rate limiting; Memcached is used by Meta for pure read caching across billions of requests.",
            relatedTopics: ["Distributed Caching", "Rate Limiting", "Cache Eviction Policies"]
          }
        },
        {
          id: "hld-cache-5",
          question: "How does a Content Delivery Network (CDN) work and how do Push vs Pull CDNs differ?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A CDN is a globally distributed network of Edge Point of Presence (PoP) servers that cache static assets (images, CSS, JS, video) physically close to users. In a Pull CDN (most common), the edge server pulls content from the origin server on the first user request. In a Push CDN, the content author uploads new content to the CDN edge directly before any user requests it.",
            mentalModel: "Without a CDN, every customer worldwide must fly to the factory in New York to buy shoes (150ms round-trip latency). A CDN opens retail stores in London, Tokyo, Mumbai, and Sydney: 99% of customers buy from their local neighborhood store in 5ms.",
            whatItIs: "Uses Anycast DNS or BGP geo-routing to route user DNS queries to the geographically closest edge server. Supports HTTP/2, HTTP/3, TLS termination, and image auto-optimization (WebP/AVIF).",
            whyItExists: "Light speed through fiber optics is finite: a TCP handshake from Australia to US-East takes 200ms minimum. Edge caching reduces latency to <15ms and saves 80%+ bandwidth on origin servers.",
            comparisonTable: {
              title: "Push CDN vs Pull CDN Comparison",
              headers: ["Dimension", "Pull CDN (Origin-Pull)", "Push CDN (Direct Ingest)"],
              rows: [
                ["How It Works", "Edge server fetches content from origin on first cache miss", "Content creator explicitly uploads/pushes content to CDN storage directly"],
                ["First-Request Latency", "Slower on cache miss (origin round-trip)", "Instant cache hit (content is pre-warmed at edge)"],
                ["Storage & Cost", "Minimal cost (only requested popular assets cached)", "Higher cost (all uploaded assets stored across all edge nodes)"],
                ["Content Staleness", "Governed by Cache-Control / TTL / manual purge", "Strictly controlled by upload updates"],
                ["Traffic on Origin", "Spikes on cache miss; low for cached hits", "Near zero origin traffic (origin not involved in edge delivery)"],
                ["Best Use Cases", "Websites, blogs, e-commerce images, API responses", "Software installation ISOs, game patches, large fixed video files"]
              ]
            },
            codeDemo: {
              language: "http",
              code: "# HTTP Response Headers controlling CDN Caching\nHTTP/1.1 200 OK\nContent-Type: image/webp\n# Cache in browser for 1 year, allow public CDN edge caching, immutable asset\nCache-Control: public, max-age=31536000, immutable\nETag: \"33a64df551425fcc3c3a\"\n\n# CDN Edge Cache Status Header:\n# CF-Cache-Status: HIT  (Served directly from Cloudflare Edge)\n# CF-Cache-Status: MISS (Fetched from origin server)"
            },
            tradeoffs: "Push CDNs are suitable for rarely changing heavy files (operating system ISOs, video game patch downloads). Pull CDNs are ideal for websites with millions of images where pre-uploading everything would waste storage.",
            theyMightAskNext: [
              {
                question: "What is Dynamic Content Acceleration (DCA) in CDNs?",
                answer: "Optimizing non-cacheable API traffic by keeping pre-warmed persistent TCP/TLS connections from CDN edges to the origin server, routing over private Tier-1 fiber backbones to bypass public internet congestion."
              }
            ],
            usedInProduction: "Cloudflare, AWS CloudFront, and Fastly serve over 70% of all public web traffic globally.",
            relatedTopics: ["L4 vs L7 Load Balancing", "Caching Strategies", "Reverse Proxy"]
          }
        },
        {
          id: "hld-cache-6",
          question: "How do you achieve Cache Invalidation in distributed systems and why is it considered one of CS's hardest problems?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Cache invalidation ensures cached copies reflect source-of-truth database updates. Strategies: 1. TTL-based expiration (eventual consistency), 2. Explicit programmatic purge on DB write (`redis.del()`), 3. CDC Event-Driven Invalidation (Debezium reads Postgres WAL and broadcasts cache eviction messages over Kafka), 4. Versioned Cache Keys (`user:101:v2`).",
            mentalModel: "Like printing newspaper corrections: if yesterday's front-page story had a typo, you can't magically recall all 500,000 printed papers from readers' homes. You either wait for yesterday's paper to be recycled (TTL) or send delivery couriers to shred them (event-driven purge).",
            whatItIs: "As Phil Karlton famously said: 'There are only two hard things in Computer Science: cache invalidation and naming things.' In distributed environments, race conditions and network delays cause stale cache overwrites.",
            whyItExists: "Serving stale prices on an e-commerce checkout or stale balances on a bank dashboard causes direct financial and legal loss.",
            codeDemo: {
              language: "java",
              code: "// CDC Event-Driven Cache Invalidation with Kafka\n@Component\npublic class CacheInvalidationConsumer {\n    private final RedisTemplate<String, Object> redisTemplate;\n\n    @KafkaListener(topics = \"db.cdc.users\", groupId = \"cache-invalidator\")\n    public void onUserDatabaseChange(UserChangeEvent event) {\n        // Evict specific user key when database row changes\n        String cacheKey = \"user:\" + event.userId();\n        redisTemplate.delete(cacheKey);\n        log.info(\"Evicted stale cache key: {}\", cacheKey);\n    }\n}"
            },
            tradeoffs: "Purging by wildcards (`redis.keys(\"user:*\")`) is an O(N) blocking operation that freezes Redis. Always use precise keys, Redis Sets of keys, or versioned namespaces.",
            theyMightAskNext: [
              {
                question: "What is Dual-Write Inconsistency in caching?",
                answer: "Occurs when Application writes to DB and then writes to Cache: if the cache write fails or another thread writes concurrently in reverse order, the cache remains permanently out of sync with the database."
              }
            ],
            usedInProduction: "Standard at Shopify and Pinterest: Debezium CDC reads MySQL binlogs and streams invalidation events to Redis across multi-region clusters.",
            relatedTopics: ["Cache-Aside", "Transactional Outbox Pattern", "Kafka Event Streams"]
          }
        }
      ]
    },
    {
      id: "database-scaling-storage",
      title: "Database Scaling, Sharding & Storage",
      questions: [
        {
          id: "hld-db-1",
          question: "How does Horizontal Database Sharding work and how do you choose an effective Shard Key?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Sharding splits a single large database table horizontally across multiple independent database servers (shards), each holding a subset of rows. The Shard Key determines which shard holds a specific record (e.g. `shard = hash(userId) % numberOfShards`). A great shard key has high cardinality, distributes data and queries uniformly, and avoids cross-shard joins.",
            mentalModel: "Think of an encyclopedia set: instead of one 50,000-page book that collapses the bookshelf, the set is split into 26 volumes (A–Z). The first letter of the word is the shard key.",
            whatItIs: "Architectural solution for databases exceeding single-node disk capacity (10TB+) or write IOPS limits. Common strategies: Range-based (by date/letter), Hash-based (MurmurHash3), and Directory-based (lookup service).",
            whyItExists: "Read replicas solve read scaling, but only sharding solves WRITE scaling and storage capacity limits on relational databases.",
            codeDemo: {
              language: "java",
              code: "// Application-level Hash Sharding Router\npublic class ShardRouter {\n    private final List<DataSource> shards;\n\n    public DataSource getShardForCustomer(UUID customerId) {\n        // MurmurHash3 provides uniform hash distribution\n        int hash = Hashing.murmur3_32_fixed().hashBytes(customerId.toString().getBytes()).asInt();\n        int shardIndex = Math.abs(hash) % shards.size();\n        return shards.get(shardIndex);\n    }\n}"
            },
            tradeoffs: "Sharding introduces massive engineering complexity: 1. Cross-shard joins are impossible without distributed query engines, 2. Distributed transactions across shards require 2PC/Sagas, 3. Re-sharding (adding shards from 4 to 8) requires complex data migration.",
            theyMightAskNext: [
              {
                question: "What is the 'Celebrity / Hot Shard' problem in sharding?",
                answer: "If you shard by `influencer_id`, a celebrity like Elon Musk (100M followers) will direct 90% of all platform reads and writes to one single physical shard, crashing it while other shards sit idle. Fix: composite shard key (`influencer_id + random_salt`)."
              }
            ],
            usedInProduction: "Instagram shards PostgreSQL by User ID using custom 64-bit ID generation; Slack shards MySQL databases by Workspace ID.",
            relatedTopics: ["Consistent Hashing", "SQL vs NoSQL", "Read Replicas"]
          }
        },
        {
          id: "hld-db-2",
          question: "When should you choose SQL vs NoSQL (Document, Key-Value, Columnar, Graph)?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Use SQL (PostgreSQL/MySQL) for structured schemas, complex relational joins, and strict ACID transaction guarantees (banking, order checkout). Use Key-Value (Redis/DynamoDB) for simple fast O(1) lookups and session caches. Use Document (MongoDB) for semi-structured JSON catalogs and rapid schema iteration. Use Columnar (Cassandra/HBase/ClickHouse) for high-write time-series, analytics, and telemetry. Use Graph (Neo4j) for deep relationships (social graphs, fraud rings).",
            mentalModel: "SQL is an accounting ledger with fixed columns and audit rules. Document is a filing cabinet of JSON folders. Key-Value is a coat-check ticket rack. Columnar is a spreadsheet grouped by columns for lightning-fast averages. Graph is a spiderweb map connecting who knows whom.",
            whatItIs: "Polyglot persistence: selecting the optimal storage engine for each specific access pattern rather than forcing a single database on the entire application.",
            whyItExists: "No single database engine satisfies all dimensions of CAP theorem, high write throughput, complex analytical queries, and arbitrary schema changes.",
            comparisonTable: {
              title: "SQL vs NoSQL Paradigms Comparison",
              headers: ["Database Type", "Key Technologies", "Data Model", "ACID / Consistency", "Best For", "When to Avoid"],
              rows: [
                ["Relational (SQL)", "PostgreSQL, MySQL, Oracle", "Tables, rows, fixed schemas, foreign keys", "Strict ACID, Strong Consistency", "Financial ledgers, complex joins, ERP/e-commerce checkout", "Unstructured petabyte data, massive write throughput"],
                ["Document (NoSQL)", "MongoDB, Couchbase", "JSON / BSON documents with dynamic fields", "ACID per document; tunable replica consistency", "Product catalogs, CMS, user profiles, rapidly evolving schemas", "Complex multi-table relational joins across tables"],
                ["Key-Value (NoSQL)", "Redis, DynamoDB, Aerospike", "Hash map (Key -> Value bytes/JSON)", "Eventual to Strong (configurable in DynamoDB)", "Session stores, shopping carts, caching, real-time counters", "Complex range queries, multi-attribute indexing"],
                ["Wide-Column (NoSQL)", "Apache Cassandra, ScyllaDB, HBase", "Sparse multi-dimensional sorted maps", "Tunable Quorum Consistency (BASE / AP system)", "Time-series metrics, IoT sensor streams, write-heavy audit logs", "Frequent relational updates and ad-hoc SQL aggregation queries"],
                ["Graph (NoSQL)", "Neo4j, Amazon Neptune", "Nodes, directed edges, properties", "Full ACID (Neo4j)", "Social networks, fraud detection rings, recommendation engines", "High-volume simple key-value reads, tabular report aggregations"]
              ]
            },
            codeDemo: {
              language: "sql",
              code: `-- SQL: Strict Schema & Relational Integrity with ACID Transactions
BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 100.00 WHERE account_id = 'ACC_101';
UPDATE accounts SET balance = balance + 100.00 WHERE account_id = 'ACC_202';
INSERT INTO audit_log (from_acc, to_acc, amount, created_at) VALUES ('ACC_101', 'ACC_202', 100.00, NOW());
COMMIT;

-- NoSQL (MongoDB): Flexible Denormalized Document Model
// db.orders.insertOne({
//   orderId: "ORD-9921",
//   customer: { id: "CUST-1", name: "Alice" },
//   items: [{ sku: "BOOK-1", price: 29.99, qty: 1 }],
//   status: "PAID",
//   createdAt: new Date()
// });`
            },
            tradeoffs: "Running 4 different database technologies in production requires distinct operational expertise, backup strategies, monitoring tools, and replication runbooks for each system.",
            theyMightAskNext: [
              {
                question: "What are NewSQL databases (Google Spanner, CockroachDB)?",
                answer: "Distributed relational databases that provide both horizontal scalability (like NoSQL) AND full ACID transactions with standard SQL (using Paxos/Raft consensus and TrueTime atomic clocks)."
              }
            ],
            usedInProduction: "Uber uses MySQL (schemaless) for trips, Redis for driver locations, Elasticsearch for receipt search, and ClickHouse for business intelligence analytics.",
            relatedTopics: ["ACID vs BASE", "Database Sharding", "CAP Theorem"]
          }
        },
        {
          id: "hld-db-3",
          question: "What is Replication Lag in Master-Slave databases and how do you achieve Read-Your-Own-Writes consistency?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "In Master-Slave architectures, writes go to Master and replicate asynchronously to Read Replicas. Replication Lag is the delay (typically 10ms–2000ms) before replicas catch up. If a user updates their profile and refreshes the page, the read from a replica returns stale data. Solve via Read-Your-Own-Writes: route reads from the user who just modified data directly to the Master for 5–10 seconds.",
            mentalModel: "Updating your status on a bulletin board: you pin a new note on the master board in Head Office. A courier photocopies it to branch offices. If you immediately walk to the branch office next door, the courier hasn't arrived yet, so you see the old notice.",
            whatItIs: "A common user-facing concurrency anomaly caused by asynchronous replication in distributed database setups.",
            whyItExists: "Synchronous replication guarantees zero lag, but slows down all writes because the master must wait for network acknowledgments from every replica worldwide before confirming.",
            codeDemo: {
              language: "java",
              code: "// Read-Your-Own-Writes routing via Cookie/Header Timestamp\npublic class RoutingDataSource extends AbstractRoutingDataSource {\n    @Override\n    protected Object determineCurrentLookupKey() {\n        HttpServletRequest req = getCurrentHttpRequest();\n        Long lastWriteTime = (Long) req.getSession().getAttribute(\"LAST_WRITE_TIME\");\n\n        // If user made a write in the last 5 seconds, read from MASTER to avoid stale data!\n        if (lastWriteTime != null && (System.currentTimeMillis() - lastWriteTime) < 5000) {\n            return \"MASTER\";\n        }\n        return \"REPLICA\"; // Otherwise read from cheap replica\n    }\n}"
            },
            tradeoffs: "Routing all user reads to Master after writes can cause Master database overload if users constantly perform writes (e.g., chat applications).",
            theyMightAskNext: [
              {
                question: "What is Monotonic Read consistency?",
                answer: "A consistency guarantee that if a user observes a particular value at time T, they will never observe an older, stale value on subsequent reads (e.g. by preventing the load balancer from bouncing consecutive reads between fast and lagging replicas)."
              }
            ],
            usedInProduction: "Facebook and Twitter enforce Read-Your-Own-Writes for profile updates, tweets, and comments using user session timestamps.",
            relatedTopics: ["Database Sharding", "CAP Theorem", "Active-Active HA"]
          }
        },
        {
          id: "hld-db-4",
          question: "How do B+ Trees and Log-Structured Merge (LSM) Trees differ in database storage engines?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "B+ Trees (used by PostgreSQL, MySQL InnoDB) store data in balanced tree pages on disk, optimized for fast random READS (O(log N)) and range scans, but suffer from write amplification due to random disk page writes. LSM Trees (used by Cassandra, RocksDB, ScyllaDB) write sequentially to an in-memory MemTable and append-only WAL, flushing immutable SSTables to disk with background compaction, achieving extreme WRITE throughput.",
            mentalModel: "B+ Tree is a library filing cabinet: when a new book arrives, you walk to the exact drawer and wedge it into alphabetical order (random write). LSM Tree is an author's notebook: you write notes sequentially at the end of the page as fast as possible (append write); once a month, an editor compiles and sorts notes into an organized book (compaction).",
            whatItIs: "The internal storage engine data structure that dictates whether a database is read-optimized or write-optimized.",
            whyItExists: "Disks (even SSDs) perform sequential writes 10x–50x faster than random page overwrites.",
            comparisonTable: {
              title: "B+ Tree vs Log-Structured Merge (LSM) Tree",
              headers: ["Dimension", "B+ Tree (PostgreSQL, MySQL InnoDB)", "LSM Tree (Cassandra, RocksDB, ScyllaDB)"],
              rows: [
                ["Primary Optimization", "Optimized for fast random READS & range scans", "Optimized for extreme WRITE throughput"],
                ["Disk I/O Pattern", "Random I/O (overwrites 8KB/16KB disk pages in-place)", "Sequential I/O (appends to MemTable + WAL, flushes SSTables)"],
                ["Write Amplification", "High on small writes (overwrites entire page for 10-byte change)", "Controlled during write, occurs during background compaction"],
                ["Read Complexity", "O(log N) — checks predictable tree levels", "O(log N) across MemTable + multiple SSTable disk levels"],
                ["Index Structure", "Clustered index with B+ tree branch & leaf pages", "MemTable in RAM + immutable SSTables on disk + Bloom filters"],
                ["Compaction Overhead", "None (pages updated in place, space freed via vacuum)", "Heavy background compaction merges SSTable files (I/O spikes)"],
                ["Concurrency Model", "Fine-grained page-level latching & locks", "Lock-free appends; background thread compaction"],
                ["Ideal Workloads", "OLTP transactional CRUD, low-write e-commerce databases", "Time-series metrics, real-time messaging, append-only logs"]
              ]
            },
            codeDemo: {
              language: "java",
              code: `// Conceptual LSM-Tree Storage Engine Write Path (MemTable -> WAL -> SSTable)
public class LSMTreeEngine {
    private final ConcurrentSkipListMap<byte[], byte[]> memTable = new ConcurrentSkipListMap<>();
    private final WriteAheadLog wal;
    private final long MEMTABLE_THRESHOLD = 64 * 1024 * 1024; // 64 MB

    public synchronized void put(byte[] key, byte[] value) throws IOException {
        // 1. Fast sequential disk write to Write-Ahead Log (durability)
        wal.append(key, value);

        // 2. Insert into in-memory sorted skip list (O(log N) RAM insertion)
        memTable.put(key, value);

        // 3. Flush to immutable SSTable on disk if threshold reached
        if (memTable.size() >= MEMTABLE_THRESHOLD) {
            flushToSSTable(new ConcurrentSkipListMap<>(memTable));
            memTable.clear();
        }
    }
}`
            },
            tradeoffs: "LSM Trees suffer from Write Amplification during background compaction, which can cause temporary disk I/O latency spikes (compaction debt).",
            theyMightAskNext: [
              {
                question: "Why do LSM Trees rely on Bloom Filters?",
                answer: "Because a key might reside in any of several SSTable files on disk. A Bloom Filter checks each SSTable in memory, avoiding expensive disk reads for SSTables that don't contain the requested key."
              }
            ],
            usedInProduction: "Kafka and Cassandra use append-only sequential disk writes; MySQL InnoDB uses B+ Trees for relational transactions.",
            relatedTopics: ["SQL vs NoSQL", "Database Sharding", "Bloom Filters"]
          }
        },
        {
          id: "hld-db-5",
          question: "What is the difference between ACID and BASE in data storage systems?",
          difficulty: "Easy",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "ACID guarantees strict, immediate mathematical consistency (Atomicity, Consistency, Isolation, Durability) typical of relational SQL databases. BASE embraces distributed systems reality (Basically Available, Soft state, Eventual consistency), sacrificing immediate consistency for high availability and horizontal scalability across global networks.",
            mentalModel: "ACID is a bank vault transaction: the money either leaves Account A and arrives in Account B simultaneously, or the vault refuses the transfer. BASE is an email newsletter: when you hit send, readers in Europe see it 2 seconds before readers in Japan, but eventually, everyone receives the email.",
            whatItIs: "Two opposing paradigms in transaction design dictated by Eric Brewer's CAP theorem.",
            whyItExists: "Strict ACID transactions across geographically distributed multi-datacenter clusters introduce unacceptable network latency and availability bottlenecks.",
            comparisonTable: {
              title: "ACID vs BASE Architecture Comparison",
              headers: ["Property Dimension", "ACID (Relational / Strong Consistency)", "BASE (Distributed / Eventual Consistency)"],
              rows: [
                ["A: Atomicity vs Basically Available", "All operations in transaction succeed or entire unit rolls back", "System prioritizes uptime and availability even during partial node failures"],
                ["C / S: Consistency vs Soft State", "Immediate consistency: data satisfies all constraints at all times", "State is fluid and can change over time without user input due to replication lag"],
                ["I / E: Isolation vs Eventual Consistency", "Concurrent transactions are isolated (preventing dirty/phantom reads)", "Data across distributed replicas converges eventually once writes cease"],
                ["D: Durability", "Committed transactions survive crashes via disk WAL / redo log", "Durability achieved through quorum replication across multiple nodes/racks"],
                ["CAP Positioning", "CP (Consistency + Partition Tolerance) or CA", "AP (Availability + Partition Tolerance)"],
                ["Data Correctness Guarantee", "Mathematical guarantee handled by database engine", "Shifted to application layer (idempotency, reconciliation, CRDTs)"],
                ["Real-World Systems", "PostgreSQL, MySQL, Oracle, Google Spanner", "Apache Cassandra, DynamoDB, Couchbase, Riak"]
              ]
            },
            codeDemo: {
              language: "java",
              code: `// ACID: Spring Declarative Relational Transaction (Rollback on error)
@Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class)
public void transferMoney(Long fromId, Long toId, BigDecimal amount) {
    accountRepo.debit(fromId, amount);
    accountRepo.credit(toId, amount); // If this fails, entire debit is rolled back!
}

// BASE: Eventual Consistency via Asynchronous Event (Outbox Pattern)
public void checkoutOrder(Order order) {
    orderRepo.save(order); // Local immediate save
    eventPublisher.publish("order.placed", new OrderPlacedEvent(order.getId()));
    // Inventory and billing update asynchronously; eventual consistency reached in 500ms
}`
            },
            tradeoffs: "BASE systems push the burden of handling out-of-order, stale, or conflicting data onto application developers rather than having the database engine handle it automatically.",
            theyMightAskNext: [
              {
                question: "What does Eventual Consistency mean in practice?",
                answer: "If no new updates are made to a given data item, all replicas will eventually return the last updated value after replication completes."
              }
            ],
            usedInProduction: "Banking ledgers use ACID; Amazon shopping carts, social media feeds, and YouTube view counts use BASE.",
            relatedTopics: ["CAP Theorem", "SQL vs NoSQL", "Distributed Transactions"]
          }
        },
        {
          id: "hld-db-6",
          question: "How does Polyglot Persistence work in modern cloud-native architectures?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Polyglot Persistence is using multiple specialized database technologies within the same application architecture, where each microservice uses the database type best suited for its specific data model and query patterns.",
            mentalModel: "A professional master chef's kitchen: you don't use a meat cleaver to peel an apple, slice bread, and stir soup. You use a paring knife for fruit (Redis), a bread knife for bread (Elasticsearch), a cleaver for meat (PostgreSQL), and a giant stockpot for soup (Amazon S3).",
            whatItIs: "Breaking the anti-pattern of forcing one giant Oracle or MySQL database to handle relational tables, full-text search, in-memory caches, graph relationships, and video storage.",
            whyItExists: "Maximizes performance, simplifies query logic, and prevents a single database failure from taking down the entire company.",
            codeDemo: {
              language: "text",
              code: "Real-World Polyglot Architecture (E-Commerce Platform):\n\n[Client App]\n     │\n[API Gateway]\n     │\n ┌───┴──────────────────────┬──────────────────────┬────────────────────┐\n │ (Orders & Payments)      │ (Product Search)     │ (User Sessions)    │ (Product Images)\n ▼                          ▼                      ▼                    ▼\n[PostgreSQL]             [Elasticsearch]        [Redis Cluster]       [AWS S3 / CloudFront]\n- Strict ACID            - Inverted Index       - Sub-ms Latency      - Unlimited Object Store\n- Relational integrity   - Fuzzy searching      - In-memory caching   - CDN Edge Caching\n- Financial audit trail  - Faceted filters      - TTL expiration      - High durability"
            },
            tradeoffs: "Data synchronization challenge: when an item price changes in PostgreSQL, you must sync the change to Elasticsearch and invalidate Redis, creating potential distributed sync discrepancies.",
            theyMightAskNext: [
              {
                question: "How do you synchronize data between different databases in a polyglot architecture?",
                answer: "Use Change Data Capture (CDC via Debezium/Kafka) to stream change events from the primary database of record (PostgreSQL) to secondary search indexes (Elasticsearch) and caches (Redis)."
              }
            ],
            usedInProduction: "Standard architecture at Netflix, Airbnb, and Amazon, where dozens of specialized datastores cooperate via event streams.",
            relatedTopics: ["SQL vs NoSQL", "Transactional Outbox Pattern", "Distributed Caching"]
          }
        },
        {
          id: "hld-db-7",
          question: "What is Database Connection Pool Exhaustion and how do you calculate optimal pool size?",
          difficulty: "Intermediate",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Connection pool exhaustion occurs when all database connections are in use, causing incoming requests to queue and time out. The optimal pool size is calculated using the formula: `connections = (core_count * 2) + effective_spindle_count`. Having thousands of connections degrades database performance due to CPU context switching and disk I/O contention.",
            mentalModel: "Think of a supermarket checkout area: having 100 cashier lanes when there are only 4 employees in the store doesn't speed up checkout; employees waste all their time sprinting between lanes. A tight pool of 4–8 active cashiers maximizes throughput.",
            whatItIs: "Connection pools (HikariCP, c3p0) maintain persistent open TCP/TLS connections to prevent 30ms handshake overhead on every database query.",
            whyItExists: "Databases are thread/process bound (PostgreSQL forks a process per connection). Too many connections exhaust server RAM and CPU cache lines.",
            codeDemo: {
              language: "properties",
              code: "# Formula: pool_size = (CPU_cores * 2) + disk_count\n# Example: 4 Core DB server with 1 SSD = (4 * 2) + 1 = 9 to 10 connections!\n\n# HikariCP production configuration:\nspring.datasource.hikari.maximum-pool-size=20\nspring.datasource.hikari.connection-timeout=5000 # Fail fast after 5s\nspring.datasource.hikari.leak-detection-threshold=2000 # Detect long-running queries\n\n# Database Proxy for serverless/microservices: AWS RDS Proxy / PgBouncer\n# Pools 10,000 Lambda connections down to 50 physical Postgres connections"
            },
            tradeoffs: "Small pool sizes require queries to be fast and non-blocking; long-running transactions (or slow 3rd-party HTTP calls inside `@Transactional`) will tie up connections and cause cascading timeouts.",
            theyMightAskNext: [
              {
                question: "What is PgBouncer and why is it used in PostgreSQL architectures?",
                answer: "PgBouncer is a lightweight connection pooler that multiplexes thousands of ephemeral client connections over a small pool of persistent PostgreSQL connections, protecting the database from process-per-connection memory exhaustion."
              }
            ],
            usedInProduction: "AWS RDS Proxy and PgBouncer are standard in Kubernetes and AWS Lambda serverless architectures.",
            relatedTopics: ["HikariCP", "Transaction Management", "Microservices"]
          }
        }
      ]
    },
    {
      id: "message-queues-microservices",
      title: "Message Brokers & Asynchronous Queues",
      questions: [
        {
          id: "hld-queue-1",
          question: "What is the architectural difference between a Message Queue (RabbitMQ) and an Append-Only Event Log (Apache Kafka)?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Message Queues (RabbitMQ) are transient: messages are routed through exchanges and deleted once consumed/acknowledged by a worker. Append-Only Logs (Kafka) are persistent: messages are written to immutable ordered partitions on disk and retained for days/months; consumers track their own offsets and can replay historical events.",
            mentalModel: "RabbitMQ is an office paper shredder inbox: you complete the task on the sticky note, stamp it done, and shred the note. Kafka is a permanent court transcript: every testimony is recorded in chronological order forever; multiple lawyers can review the transcript at their own pace and rewind to reread page 42.",
            whatItIs: "RabbitMQ implements the AMQP protocol with smart broker routing. Kafka is an event streaming platform designed for high-throughput, distributed log partitioning, and parallel stream processing.",
            whyItExists: "Task distribution (resizing an image, sending an email) needs queue semantics. Event streaming (financial ledgers, IoT telematics, audit trails) needs persistence and replayability.",
            comparisonTable: {
              title: "RabbitMQ (Message Queue) vs Apache Kafka (Append-Only Event Log)",
              headers: ["Architectural Dimension", "RabbitMQ (AMQP Broker)", "Apache Kafka (Distributed Event Log)"],
              rows: [
                ["Core Architecture", "Smart Broker / Dumb Consumer (broker tracks delivery & ACKs)", "Dumb Broker / Smart Consumer (consumer tracks offset index)"],
                ["Message Retention", "Transient: messages are deleted immediately upon consumer ACK", "Persistent: immutable messages retained for days/months on disk"],
                ["Replayability", "No: once consumed and acknowledged, messages cannot be re-read", "Yes: consumers can rewind offset to replay historical events anytime"],
                ["Ordering Guarantees", "FIFO within a single queue; breaks on retries or multiple workers", "Strict ordering guaranteed within each individual partition"],
                ["Throughput Capacity", "10,000 – 50,000 messages / second per node", "1,000,000+ messages / second via Zero-Copy OS page cache"],
                ["Routing Capabilities", "Highly sophisticated (Topic, Direct, Fanout, Header exchanges)", "Simple routing based on message partition key hash"],
                ["Consumer Model", "Push model (broker pushes messages to available workers)", "Pull model (consumers poll partitions at their own pace)"],
                ["Best Use Cases", "Task execution, asynchronous background jobs (PDF export, emails)", "Real-time stream processing, event sourcing, telemetry, CDC pipelines"]
              ]
            },
            codeDemo: {
              language: "java",
              code: `// 1. Kafka: Replay historical events by seeking to specific offset
@KafkaListener(topics = "order-events", groupId = "analytics-group")
public void seekAndReplay(ConsumerSeekCallback callback) {
    // Rewind back to offset 0 to re-process entire event stream!
    callback.seek("order-events", 0, 0L);
}

// 2. RabbitMQ: Explicit channel acknowledgment (message deleted after ack)
@RabbitListener(queues = "task-queue", ackMode = "MANUAL")
public void handleTask(Message message, Channel channel) throws IOException {
    try {
        processTask(message);
        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    } catch (Exception e) {
        channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, true);
    }
}`
            },
            tradeoffs: "Kafka does not support individual message acknowledgment: if message #5 in a partition fails, consumer offset cannot advance past #5 without poison pill recovery (DLT) or skipping.",
            theyMightAskNext: [
              {
                question: "How does Kafka achieve 1,000,000+ messages per second throughput?",
                answer: "Through 4 key optimizations: Sequential disk I/O, OS Page Cache, Zero-Copy data transfer (`sendfile` system call bypassing user space), and batching of messages in memory."
              }
            ],
            usedInProduction: "RabbitMQ for background job workers in Celery/Spring; Kafka for real-time analytics and event-driven microservices at Uber, Netflix, and LinkedIn.",
            relatedTopics: ["Kafka Spring Boot", "At-Least-Once Delivery", "Transactional Outbox Pattern"]
          }
        },
        {
          id: "hld-queue-2",
          question: "What are At-Most-Once, At-Least-Once, and Exactly-Once message delivery semantics?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "1. At-Most-Once: Messages may be lost, but are never duplicated (commit offset before processing). 2. At-Least-Once: Messages are never lost, but may be duplicated during retries/rebalances (commit offset after processing). 3. Exactly-Once: Every message is processed effectively once (requires idempotent consumers or distributed two-phase commit protocols like Kafka Transactions).",
            mentalModel: "At-Most-Once is shooting an arrow at a target: if the wind blows it away, you don't shoot again. At-Least-Once is ringing a doorbell: if nobody answers, you ring it again until they open, even if they hear 3 rings. Exactly-Once is a certified registered package where you sign a biometric receipt upon opening.",
            whatItIs: "The theoretical guarantees provided by distributed messaging systems across network partitions and hardware crashes.",
            whyItExists: "Network timeouts are ambiguous: did the receiver crash before processing, or did the ACK get lost on the return path? Retrying produces duplicates.",
            codeDemo: {
              language: "java",
              code: "// Idempotent Consumer Pattern for At-Least-Once Kafka\n@KafkaListener(topics = \"payment-events\")\n@Transactional\npublic void processPayment(PaymentEvent event, Acknowledgment ack) {\n    // 1. Check idempotency table with unique message ID\n    if (processedMessageRepo.existsById(event.getMessageId())) {\n        log.warn(\"Duplicate event detected: {}. Skipping.\", event.getMessageId());\n        ack.acknowledge();\n        return;\n    }\n\n    // 2. Execute business mutation\n    walletService.debit(event.getUserId(), event.getAmount());\n\n    // 3. Record message ID in database\n    processedMessageRepo.save(new ProcessedMessage(event.getMessageId(), Instant.now()));\n    \n    // 4. Commit offset\n    ack.acknowledge();\n}"
            },
            tradeoffs: "True end-to-end Exactly-Once Processing (EOP) across independent third-party systems is practically impossible without Idempotent Consumer design.",
            theyMightAskNext: [
              {
                question: "How does Kafka achieve Exactly-Once Semantics (EOS) within its own ecosystem?",
                answer: "Using transactional producers (`initTransactions`, `sendOffsetsToTransaction`) that commit produced records and consumer offsets atomically to the internal `__transaction_state` topic."
              }
            ],
            usedInProduction: "Financial services design for At-Least-Once transport + Idempotent Consumer processing at the application layer.",
            relatedTopics: ["Idempotency in Distributed APIs", "Dead Letter Queues", "Transactional Outbox Pattern"]
          }
        },
        {
          id: "hld-queue-3",
          question: "When should you choose gRPC vs REST vs GraphQL for microservice communication?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Use gRPC (Protocol Buffers + HTTP/2) for internal east-west microservice communication requiring ultra-low latency, streaming, and strong type safety. Use REST (JSON + HTTP/1.1 or 2) for public-facing developer APIs with broad browser/tooling compatibility. Use GraphQL for mobile apps and complex frontends to avoid over-fetching and under-fetching nested data in a single round-trip.",
            mentalModel: "REST is a standard postal letter (readable, universal, slightly bulky). gRPC is a pneumatic tube shooting binary capsules at 200 mph between internal offices. GraphQL is a personal personal shopper who collects exactly the 3 items you wrote on your checklist across 5 departments.",
            whatItIs: "Protocols defining client-server and inter-service serialization, transport, and schema contracts.",
            whyItExists: "JSON serialization overhead and HTTP/1.1 head-of-line blocking cause high latency in call chains involving 10+ microservices.",
            comparisonTable: {
              title: "gRPC vs REST vs GraphQL Comparison Matrix",
              headers: ["Dimension", "gRPC", "REST (HTTP/JSON)", "GraphQL"],
              rows: [
                ["Underlying Protocol", "HTTP/2 (Multiplexed binary streams)", "HTTP/1.1 or HTTP/2", "HTTP (typically POST single endpoint)"],
                ["Data Serialization", "Protocol Buffers (Compact binary format)", "JSON (Human-readable text strings)", "JSON over query documents"],
                ["Schema & Contract", "Strict contract defined in `.proto` files", "Optional OpenAPI / Swagger specifications", "Strict Schema Definition Language (SDL) with types"],
                ["Performance & Speed", "Blazing Fast (5x–10x faster serialization, low bandwidth)", "Moderate (JSON parsing and header overhead)", "Moderate (runtime query parsing & execution tree overhead)"],
                ["Streaming Support", "Bidirectional, Client-side & Server-side streaming natively", "Limited (Server-Sent Events / chunked transfer)", "Subscriptions via WebSockets"],
                ["Over/Under-Fetching", "Fixed message fields; field masks supported", "Common: returns fixed DTO payload regardless of client need", "Eliminated: client requests exact needed fields only"],
                ["Browser Compatibility", "Requires gRPC-Web proxy for frontend browser use", "Native in all web browsers and client libraries", "Native in all web browsers with GraphQL clients (Apollo/Urql)"],
                ["Best Use Cases", "Internal east-west microservice RPC, ultra-low latency systems", "Public third-party APIs, standard web/mobile CRUD backends", "Complex mobile/frontend UIs aggregating data from multiple services"]
              ]
            },
            codeDemo: {
              language: "protobuf",
              code: "// Protocol Buffer Definition for gRPC\nsyntax = \"proto3\";\n\nservice OrderService {\n    rpc GetOrder (OrderRequest) returns (OrderResponse);\n    rpc StreamOrderUpdates (OrderRequest) returns (stream OrderStatusUpdate); // Server Streaming\n}\n\nmessage OrderRequest {\n    string order_id = 1; // Compact binary tag (not string key!)\n}\n\nmessage OrderResponse {\n    string order_id = 1;\n    double amount = 2;\n    string status = 3;\n}"
            },
            tradeoffs: "gRPC payloads are binary and cannot be easily inspected in browser network tabs without specialized developer tools. GraphQL shifts query complexity to the server, risking expensive N+1 database queries unless DataLoader is configured.",
            theyMightAskNext: [
              {
                question: "Why is gRPC 5x to 10x faster than REST over JSON?",
                answer: "1. Protocol Buffers use compact binary encoding with integer field tags instead of verbose text strings. 2. HTTP/2 multiplexing allows hundreds of requests over a single TCP connection without head-of-line blocking."
              }
            ],
            usedInProduction: "Google and Netflix use gRPC for 99% of internal microservice RPC calls; Shopify and GitHub expose GraphQL public APIs.",
            relatedTopics: ["HTTP/2 vs HTTP/3", "API Gateway", "Microservices"]
          }
        },
        {
          id: "hld-queue-4",
          question: "How do you design an Idempotent API in distributed systems using Idempotency Keys?",
          difficulty: "Advanced",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "Clients generate a unique UUID `Idempotency-Key` and pass it in the HTTP header for mutating operations (POST). The server checks if the key exists in an atomic distributed store (Redis/DB). If new, it acquires a lock, processes the payment, and stores the response JSON with a TTL. If duplicate, it returns the cached response without re-executing.",
            mentalModel: "Like an elevator call button: pressing the button once requests the elevator. Pressing it 20 times in rapid frustration does NOT dispatch 20 separate elevators; the system sees the elevator is already called and keeps the same light on.",
            whatItIs: "An API design contract guaranteeing that making multiple identical requests has the same outcome as making a single request.",
            whyItExists: "Network timeouts leave clients unsure if their payment succeeded. If they retry, an un-idempotent API charges the customer twice.",
            codeDemo: {
              language: "java",
              code: "@PostMapping(\"/api/v1/payments\")\npublic ResponseEntity<PaymentResponse> charge(\n        @RequestHeader(\"Idempotency-Key\") String idempotencyKey,\n        @RequestBody PaymentRequest req) {\n\n    String redisKey = \"idempotency:\" + idempotencyKey;\n    // Atomic check-and-set lock\n    Boolean acquired = redis.opsForValue().setIfAbsent(redisKey, \"PROCESSING\", Duration.ofMinutes(2));\n    \n    if (Boolean.FALSE.equals(acquired)) {\n        Object cached = redis.opsForValue().get(redisKey);\n        if (\"PROCESSING\".equals(cached)) {\n            return ResponseEntity.status(409).build(); // Concurrent duplicate request\n        }\n        return ResponseEntity.ok((PaymentResponse) cached); // Return original cached response!\n    }\n\n    PaymentResponse response = paymentGateway.charge(req);\n    redis.opsForValue().set(redisKey, response, Duration.ofHours(24)); // Cache response for 24 hours\n    return ResponseEntity.ok(response);\n}"
            },
            tradeoffs: "If the initial request crashes midway before updating the cache, the idempotency key may remain stuck in `PROCESSING` state until TTL expiration. Implement heartbeat leases or database status columns.",
            theyMightAskNext: [
              {
                question: "Which HTTP methods are idempotent by specification?",
                answer: "GET, PUT, DELETE, HEAD, and OPTIONS are idempotent according to RFC 7231. POST and PATCH are non-idempotent by default."
              }
            ],
            usedInProduction: "Standard implementation across Stripe, PayPal, and Adyen payment APIs.",
            relatedTopics: ["At-Least-Once Delivery", "Distributed Locking", "REST Controllers"]
          }
        },
        {
          id: "hld-queue-5",
          question: "How does Distributed Tracing propagate context across microservices and async Kafka queues?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "The entry point (API Gateway) generates a unique `TraceId` and `SpanId`. When making outbound HTTP calls, these IDs are injected into headers using W3C Trace Context standards (`traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`). For Kafka, tracing interceptors inject the trace headers into `RecordHeaders` so the downstream consumer extracts and continues the trace.",
            mentalModel: "Think of an Olympic relay baton: Runner 1 carries the baton (Trace ID) and hands it to Runner 2. If Runner 2 writes a letter and mails it across the country (Kafka message), they tape the baton tracking number onto the envelope so the recipient can resume the race.",
            whatItIs: "Based on Google's Dapper paper. Implemented via OpenTelemetry (OTel), Jaeger, Zipkin, and AWS X-Ray.",
            whyItExists: "In an architecture with 50 microservices, debugging which service caused a 4-second latency spike or 500 error is impossible without end-to-end trace correlation.",
            codeDemo: {
              language: "java",
              code: "// Producer injecting Trace context into Kafka Record Headers\nProducerRecord<String, OrderEvent> record = new ProducerRecord<>(\"orders\", order.getId(), order);\n// Micrometer / OpenTelemetry automatically injects:\n// record.headers().add(\"traceparent\", \"00-4bf92f3577b34da6a3ce929d0e0e4736-...\".getBytes());\nkafkaTemplate.send(record);\n\n// Consumer automatically extracts traceparent and continues span:\n@KafkaListener(topics = \"orders\")\npublic void consume(OrderEvent event) {\n    // MDC.get(\"traceId\") matches the original HTTP request traceId from Gateway!\n    log.info(\"Processing order in background worker: {}\", event.getId());\n}"
            },
            tradeoffs: "Trace header propagation fails silently if developers spawn raw un-instrumented Java threads (`new Thread().start()`) or use custom non-standard HTTP client libraries.",
            theyMightAskNext: [
              {
                question: "What is the difference between TraceId and SpanId?",
                answer: "A TraceId represents the entire end-to-end user request path across all services. A SpanId represents a single unit of contiguous work within a specific microservice."
              }
            ],
            usedInProduction: "Standard observability infrastructure across all modern cloud deployments, integrated with Datadog, Honeycomb, or Grafana Tempo.",
            relatedTopics: ["Micrometer Tracing", "API Gateway", "Logging Frameworks"]
          }
        },
        {
          id: "hld-queue-6",
          question: "How do Dead Letter Queues (DLQ) and Exponential Backoff Retries isolate poison pills?",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A Poison Pill is a corrupt message that permanently crashes consumer logic (e.g., malformed JSON or null pointer). Without isolation, the consumer restarts, re-reads the poison message, and crashes in an infinite loop, blocking the entire queue. DLQ pattern retries the message N times with exponential backoff; if all retries fail, it routes the message to an isolated Dead Letter Queue for engineering inspection.",
            mentalModel: "Think of a sorting conveyor belt: an unmarked, dripping hazardous canister rolls down the belt. If the worker refuses it and places it back at the front of the belt, the entire assembly line freezes. Instead, a robot arm shoves the canister into a sealed hazardous containment bin (DLQ) so normal packages can proceed.",
            whatItIs: "Fault-tolerance mechanism for message brokers (RabbitMQ DLX, AWS SQS DLQ, Kafka DLT).",
            whyItExists: "Prevents a single bad client payload from halting order processing for thousands of paying customers.",
            codeDemo: {
              language: "properties",
              code: "# Kafka Non-Blocking Retry & DLT Topology\n# Topic: orders\n# Retry 1: orders-retry-1000  (delay 1s)\n# Retry 2: orders-retry-2000  (delay 2s)\n# Final:   orders-dlt         (dead letter topic for manual inspection)\n\n// Java Spring Kafka Declarative Annotation:\n@RetryableTopic(\n    attempts = \"3\",\n    backoff = @Backoff(delay = 1000, multiplier = 2.0),\n    dltStrategy = DltStrategy.FAIL_ON_ERROR\n)\n@KafkaListener(topics = \"orders\")\npublic void handle(OrderEvent event) {\n    orderService.process(event);\n}"
            },
            tradeoffs: "Routing messages to a DLQ breaks strict FIFO message ordering: subsequent events for that customer will be processed while the failing event sits in the DLQ.",
            theyMightAskNext: [
              {
                question: "How do you reprocess messages from a DLQ after fixing the bug?",
                answer: "By creating a dedicated replay consumer service or CLI script that reads messages from the DLQ topic and re-publishes them to the primary topic once the application bug is resolved."
              }
            ],
            usedInProduction: "Mandatory in every enterprise event pipeline; ops teams configure Prometheus alerts when DLQ message count > 0.",
            relatedTopics: ["Kafka Error Handling", "Circuit Breakers", "At-Least-Once Delivery"]
          }
        }
      ]
    }
  ]
};
