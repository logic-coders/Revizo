import { Category } from "@/types";

export const hldCaseStudiesCategory: Category = {
  id: "sd-hld-case-studies",
  title: "Top 10 High-Level Design (HLD) Interview Problems",
  subTopics: [
    {
      id: "sd-hld-core-cases",
      title: "Production System Case Studies",
      questions: [
        {
          id: "sd-hld-case-1",
          question: "Design a URL Shortener (TinyURL / Bitly)",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A globally distributed URL shortening service that maps long URLs to unique 7-character Base62 keys and executes HTTP 301/302 redirects with sub-15ms p99 latency.",
            mentalModel: "Think of a coat-check ticket at a theater: you hand over a bulky, heavy winter coat (200-character URL), and get back a tiny plastic token with a 7-character number (tinyurl.com/a8B9z1). When leaving, presenting the token instantly retrieves your coat.",
            whatItIs: "A distributed key-value mapping and redirection engine testing high-throughput reads, distributed unique ID generation, hash collision prevention, and edge caching.",
            whyItExists: "Long URLs break in SMS limits, look ugly in social posts, cannot be typed easily from physical billboards, and prevent marketing teams from tracking click metrics and geographical analytics.",
            codeDemo: {
              language: "markdown",
              code: `⏱️ 45-MINUTE SYSTEM DESIGN ROADMAP: TINYURL

=============================================================================
Step 1: Clarify requirements (5 min)
=============================================================================
* Functional Requirements:
  1. Given a long URL, system returns a unique short URL (e.g. https://tiny.url/aZ81k9q).
  2. Given a short URL, system redirects the client to original long URL in < 15ms.
  3. Optional custom alias support (e.g. https://tiny.url/my-portfolio).
  4. Configurable link expiration TTL (default 2 years).
* Non-Functional Requirements:
  1. High Availability (99.999%): Redirection must never fail; a broken link loses revenue.
  2. Ultra-Low Latency: p99 read redirection latency < 15ms.
  3. Read-Heavy Profile: 100:1 read-to-write ratio.
* Out-of-Scope:
  - User billing, link analytics dashboards, real-time click heatmaps.

=============================================================================
Step 2: Estimate scale (5 min)
=============================================================================
* Traffic Estimation:
  - New URLs created: 100 Million / month ≈ 40 writes / sec.
  - Redirections: 10 Billion / month ≈ 4,000 reads / sec.
  - Peak Read QPS: 4,000 * 2.5x ≈ 10,000 QPS.
* Storage Estimation (5 Years):
  - Total records = 100M * 12 * 5 = 6 Billion URLs.
  - Per record size ≈ 500 bytes (Short key: 7B, Long URL: 450B, UserID, CreatedAt, TTL).
  - Total Storage = 6 Billion * 500 bytes = 3 Terabytes (fits easily on a small database cluster!).
* Bandwidth Estimation:
  - Ingress: 40 writes/s * 500 B = 20 KB/s.
  - Egress: 4,000 reads/s * 500 B = 2 MB/s.
* Memory Cache Estimation (80/20 Pareto Rule):
  - 20% of hot URLs generate 80% of traffic.
  - Daily reads = 10 Billion / 30 = 333 Million reads / day.
  - Hot cache capacity = 333M * 0.20 * 500 bytes ≈ 33 GB RAM.
  - Sizing: A single AWS r6g.xlarge Redis node (32 GB) handles the entire active cache!

=============================================================================
Step 3: API + data model (5 min)
=============================================================================
* REST API Endpoints:
  1. POST /api/v1/urls
     Headers: Authorization: Bearer <token>, Content-Type: application/json
     Request:  { "long_url": "https://example.com/very/long/path", "custom_alias": "promo26", "expire_days": 30 }
     Response: 201 Created -> { "short_url": "https://tiny.url/promo26", "expires_at": 1730000000 }
  2. GET /{shortKey}
     Response: 301 Moved Permanently (or 302 Found)
     Headers: Location: https://example.com/very/long/path

* Data Model & Database Choice:
  Table: url_mapping
  - short_key VARCHAR(7) PRIMARY KEY (Partition Key)
  - original_url VARCHAR(2048) NOT NULL
  - user_id UUID
  - created_at TIMESTAMP
  - expires_at TIMESTAMP
  Database Selection: NoSQL Key-Value Store (Amazon DynamoDB / ScyllaDB) because query patterns are 100% primary-key lookups (O(1)), requiring no JOINs and zero multi-table transactions.

=============================================================================
Step 4: High-level design (10 min)
=============================================================================
* Architectural Diagram:
  [Client Browser / Mobile]
         │ GET /aZ81k9q
         ▼
  [Cloudflare CDN / Edge Cache] <── (Serves 80% of redirects directly at the edge!)
         │ Cache Miss
         ▼
  [Load Balancer / Reverse Proxy (Envoy / NGINX)]
         │
         ▼
  [URL Redirection Microservice]
         │
         ├──> [Redis Cluster] (Sub-millisecond memory lookup for hot 33GB keys)
         │       │ (Cache Miss)
         └───> [DynamoDB Primary Table] (Partition Key: short_key)

* Core Request Flows:
  - Write Path: Client sends long URL -> App server acquires unique 64-bit ID from Snowflake Ticket Generator -> Encodes ID to Base62 (7 characters) -> Inserts into DynamoDB -> Writes to Redis cache -> Returns short URL.
  - Read Path: Client hits Cloudflare CDN edge -> Edge checks cache -> On miss, hits App Server -> Checks Redis -> Checks DynamoDB -> Returns HTTP 302 redirect.

=============================================================================
Step 5: Deep dive on key components (15 min)
=============================================================================
* 1. Short Key Generation (Base62 vs Hash):
  - Base62 characters: [0-9, a-z, A-Z] = 62 possibilities.
  - A 7-character string gives: 62^7 = 3.52 Trillion unique URLs!
  - Why NOT MD5 / SHA-256? MD5 produces 128-bit hash. Taking first 7 characters causes frequent hash collisions, forcing expensive DB read-before-write checks.
  - Best Pattern: Range-Based Ticket Server (Flickr model) or Twitter Snowflake:
    * Maintain a distributed counter service allocating 1,000,000 ID ranges to app servers (Server 1: 1M-2M, Server 2: 2M-3M).
    * When Server 1 receives a URL, it increments its local in-memory counter and converts the integer directly to Base62:
      ID 11157 -> Base62 -> "2TX". Collision probability is mathematically ZERO!
* 2. HTTP 301 vs 302 Redirection:
  - 301 Moved Permanently: Browser caches the redirect locally. Subsequent clicks bypass your servers completely (lowest server load, but loses click analytics).
  - 302 Found (Temporary): Browser always queries your server before redirecting. Enables real-time click tracking, geolocation analytics, and bot detection.
  - Recommendation: Use 302 Found for commercial tracking; use 301 if absolute lowest infrastructure cost is the goal.

=============================================================================
Step 6: Bottlenecks, trade-offs, wrap-up (5 min)
=============================================================================
* Bottlenecks & SPOFs:
  - Hot Keys: A viral tweet with a short URL can hammer a single Redis shard. Mitigate with local in-memory L1 cache (Caffeine) inside the app server with a 10s TTL.
  - Database Crash: DynamoDB multi-AZ replication guarantees single-digit ms automated failover.
* Expired Links Cleanup:
  - Never run heavy SQL DELETE scans. Use DynamoDB TTL feature: DynamoDB scans partitions in the background and purges expired records at zero compute cost.
* Observability & SRE:
  - Monitor p99 redirection latency SLI (< 15ms target) and Redis Cache Hit Ratio (> 90%).`,
              explanation: "Base62 conversion of a range-partitioned 64-bit ID guarantees zero collisions, predictable 7-character lengths, and high write throughput."
            },
            tradeoffs: "Using 302 redirects allows comprehensive click analytics and bot filtering at the cost of higher server traffic; 301 eliminates origin traffic through aggressive browser caching but blinds analytics.",
            followUpQuestions: [
              {
                question: "How do you prevent malicious users from short-linking phishing sites or malware?",
                answer: "Integrate Google Safe Browsing API or an asynchronous ML pipeline that scans uploaded URLs against malware blocklists and quarantines suspicious URLs."
              },
              {
                question: "What if two users submit the exact same long URL?",
                answer: "Options: (1) Return the same short key (saves storage, but prevents separate user deletion), or (2) Salt the URL with the user_id to generate independent short URLs."
              }
            ],
            usedInProduction: "Bitly, TinyURL, t.co (Twitter), lnkd.in (LinkedIn).",
            relatedTopics: ["Base62 Encoding", "Distributed Counter", "Redis Caching", "HTTP 301 vs 302"]
          }
        },
        {
          id: "sd-hld-case-2",
          question: "Design a Distributed Rate Limiter",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A high-performance distributed traffic throttler that limits client requests based on IP, User ID, or API Key using atomic Redis Lua scripts to protect downstream services from overload and DDoS attacks.",
            mentalModel: "Think of a nightclub bouncer at the velvet rope: A venue allows at most 50 people per hour. The bouncer checks a wristband counter on every arrival. If the quota is full, the bouncer tells you to wait outside until someone leaves (HTTP 429 Too Many Requests).",
            whatItIs: "An infrastructural gatekeeper positioned at the API Gateway to enforce request quotas, prevent API abuse, and isolate tenant noisy-neighbor problems.",
            whyItExists: "Without rate limiting, a single rogue script loop, web scraping crawler, or credential-stuffing botnet can saturate backend database connections and trigger cascading system-wide outages.",
            codeDemo: {
              language: "markdown",
              code: `⏱️ 45-MINUTE SYSTEM DESIGN ROADMAP: DISTRIBUTED RATE LIMITER

=============================================================================
Step 1: Clarify requirements (5 min)
=============================================================================
* Functional Requirements:
  1. Throttles requests based on Client IP, Authenticated User ID, or API Key.
  2. Configurable multi-tier limits (e.g. Free Tier: 60 req/min; Pro Tier: 10,000 req/min).
  3. When limit is breached, returns HTTP 429 (Too Many Requests) with Retry-After header.
* Non-Functional Requirements:
  1. Ultra-Low Latency: Adds < 2ms overhead to the request path.
  2. Fault Tolerance: If rate limiter fails, decide Fail-Open vs Fail-Closed (typically Fail-Open).
  3. High Scalability: Supports 500,000+ total QPS across multi-region server clusters.
* Out-of-Scope:
  - Deep packet inspection (WAF), billing charge calculation per request.

=============================================================================
Step 2: Estimate scale (5 min)
=============================================================================
* Scale Numbers:
  - Total System Ingress: 100,000 requests / second.
  - Active Users: 10 Million Daily Active Users.
  - Rate Limiter Record Size ≈ 32 bytes (Key: "ratelimit:usr_123:min", Value: Counter int, TTL).
* Memory Estimation:
  - 10M active keys * 32 bytes ≈ 320 MB of RAM (Trivially fits in a small Redis cluster!).
* Latency Target:
  - Total overhead: < 2ms at p99. Network hops must be minimized to local regional cache.

=============================================================================
Step 3: API + data model (5 min)
=============================================================================
* Standard Response Headers (RFC 6585):
  HTTP/1.1 429 Too Many Requests
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1730000060
  Retry-After: 42

* Data Store & Key Structure:
  Redis Key: "rl:{tenant_id}:{user_id}:{window_epoch}"
  Data Structure: Redis Sorted Set (ZSET) or Hash Counter with EXPIRE.

=============================================================================
Step 4: High-level design (10 min)
=============================================================================
* Architecture Diagram:
  [Client Device]
         │ HTTPS Request
         ▼
  [Cloudflare / AWS CloudFront] (L3/L4 DDoS Mitigation)
         │
         ▼
  [API Gateway (Envoy / Kong)]
         │ (Rate Limiter Filter Interceptor)
         ├───> [Redis Cluster] (Sub-millisecond Lua Script execution)
         │
     Allowed?
     ├── YES ──> [Downstream Microservices (Order, Payment, Catalog)]
     └── NO  ──> [HTTP 429 (Too Many Requests) returned instantly]

=============================================================================
Step 5: Deep dive on key components (15 min)
=============================================================================
* 1. Algorithm Comparison:
  - Token Bucket: Refills tokens at constant rate. Allows bursts up to bucket capacity. Simple, memory-efficient. (AWS / Stripe standard).
  - Leaky Bucket: Smooths traffic into a steady constant stream. Drops excess.
  - Fixed Window Counter: Divides time into 1-minute blocks. Vulnerable to 2x burst at window edges!
  - Sliding Window Log: Logs request timestamps in Redis ZSET. 100% accurate, but high RAM cost.
  - Sliding Window Counter (Best Balance): Approximates current count by weighting previous window.

* 2. Atomic Execution via Redis Lua Script:
  Executing multiple Redis commands (GET -> INCR -> EXPIRE) causes race conditions in distributed clusters. Lua scripts execute atomically inside Redis:

-- Sliding Window Counter Lua Script
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local current_time = tonumber(ARGV[2])
local window = tonumber(ARGV[3]) -- e.g. 60s

-- Step 1: Remove timestamps older than current_time - window
redis.call('ZREMRANGEBYSCORE', key, 0, current_time - window)
local current_requests = redis.call('ZCARD', key)

-- Step 2: Check quota
if current_requests < limit then
    redis.call('ZADD', key, current_time, current_time)
    redis.call('EXPIRE', key, window)
    return 1 -- ALLOWED
else
    return 0 -- BLOCKED (429)
end

=============================================================================
Step 6: Bottlenecks, trade-offs, wrap-up (5 min)
=============================================================================
* Multi-Region Synchronization:
  - Cross-ocean replication (100ms RTT) destroys rate limiter latency.
  - Solution: Local Rate Limiting per region with proportional quotas (e.g. US-East gets 60% of quota, EU-West gets 40%), or asynchronous batch token reservations.
* Fail-Open vs Fail-Closed:
  - If Redis cluster crashes: Fail-Open to allow user traffic through while triggering high-priority SRE pager alarms.
* Client Fingerprint Spoofing:
  - Malicious bots spoof 'X-Forwarded-For' IP. Combine TLS JA3 fingerprints, authenticated session cookies, and API tokens.`,
              explanation: "Using an atomic Redis Lua script ensures complete thread-safety across distributed API Gateway instances without distributed locks."
            },
            tradeoffs: "Sliding Window Log with ZSET guarantees 100% boundary accuracy but requires O(N) memory per request timestamp; Sliding Window Counter approximates with 99.5% accuracy using O(1) memory.",
            followUpQuestions: [
              {
                question: "What is the difference between Fail-Open and Fail-Closed?",
                answer: "Fail-Open allows traffic through when the rate limiter is down (prioritizes user experience); Fail-Closed blocks traffic to protect fragile databases from collapsing."
              },
              {
                question: "How do you rate limit distributed botnets with rotating IP addresses?",
                answer: "Apply behavioral rate limiting: analyze request path patterns, request frequency per user session cookie, and challenge suspicious IP ranges with CAPTCHA."
              }
            ],
            usedInProduction: "Stripe API, Cloudflare WAF, GitHub REST API, Kong API Gateway.",
            relatedTopics: ["Token Bucket", "Redis Lua Scripts", "Sliding Window Counter", "HTTP 429"]
          }
        },
        {
          id: "sd-hld-case-3",
          question: "Design a Real-Time Messaging Platform (WhatsApp / Slack / Messenger)",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A low-latency, bi-directional messaging platform supporting 1-on-1 and group chats, read receipts, online presence, and offline delivery over persistent WebSockets backed by Cassandra/ScyllaDB.",
            mentalModel: "Think of an air traffic control network: airplanes (chat clients) maintain open radio frequencies (WebSockets) with regional control towers (Gateway servers). When Plane A wants to message Plane B, the tower looks up which tower Plane B is currently connected to and relays the transmission instantly.",
            whatItIs: "A distributed full-duplex communication platform managing millions of concurrent persistent TCP connections, message routing, ordering guarantees, and push notifications.",
            whyItExists: "Traditional HTTP request-response polling causes excessive mobile battery drain, bandwidth waste on repeated TCP/TLS handshakes, and unacceptable latency for conversational messaging.",
            codeDemo: {
              language: "markdown",
              code: `⏱️ 45-MINUTE SYSTEM DESIGN ROADMAP: WHATSAPP / SLACK

=============================================================================
Step 1: Clarify requirements (5 min)
=============================================================================
* Functional Requirements:
  1. 1-on-1 instant messaging with real-time delivery (< 100ms).
  2. Small-to-medium group chats (up to 500 members).
  3. Delivery and Read Receipts (Sent, Delivered, Read ticks).
  4. Online / Offline presence indicators and last seen timestamps.
  5. Push notifications for offline users (APNS / FCM).
* Non-Functional Requirements:
  1. Ultra-Low Latency: Message transit < 100ms worldwide.
  2. High Availability (99.999%): Service must not drop connection sessions.
  3. Zero Message Loss: Messages must be durably stored.
  4. Strict Chronological Ordering within conversations.
* Out-of-Scope:
  - Video calling, VoIP audio streaming, end-to-end signal protocol key exchange.

=============================================================================
Step 2: Estimate scale (5 min)
=============================================================================
* Traffic Estimation:
  - 1 Billion Daily Active Users (DAU).
  - Daily Messages = 1B * 40 msgs/day = 40 Billion messages / day.
  - Average Message QPS = 40B / 100,000s = 400,000 msgs / sec.
  - Peak Message QPS = 400,000 * 2.5x = 1,000,000 msgs / sec.
* Storage Estimation (5 Years):
  - Average text payload = 100 bytes.
  - Daily storage = 40B * 100 B = 4 Terabytes / day.
  - 5-Year storage = 4 TB * 365 * 5 ≈ 7.3 Petabytes (with 3x replication ≈ 22 PB).
* Concurrent Connections:
  - 100 Million concurrent users active at any second = 100M open WebSocket connections.

=============================================================================
Step 3: API + data model (5 min)
=============================================================================
* Communication Protocol:
  - WebSockets (RFC 6455): Full-duplex persistent TCP connections. Minimal 2-byte framing overhead.

* Database Schema (Apache Cassandra / ScyllaDB):
  Why Cassandra? High write throughput (LSM-tree), linear horizontal scaling, excellent for chronological time-series appends.

  CREATE TABLE messages (
      conversation_id UUID,
      message_id TIMEUUID, -- Snowflake or TimeUUID guarantees monotonic chronological sorting!
      sender_id UUID,
      message_body TEXT,
      media_url TEXT,
      status VARCHAR(10), -- SENT, DELIVERED, READ
      PRIMARY KEY (conversation_id, message_id)
  ) WITH CLUSTERING ORDER BY (message_id ASC);

=============================================================================
Step 4: High-level design (10 min)
=============================================================================
* Architecture Diagram:
  [Alice (Client)]
         │ WebSocket: SendMessage(Recipient: Bob, Text: "Hey")
         ▼
  [Chat Gateway Server 4]
         │ (Lookup Bob's active connection server)
         ▼
  [Session Registry (Redis Cluster)]
         │ (Bob is connected to Chat Gateway Server 12)
         ▼
  [Kafka / Redis PubSub Message Bus]
         │ (Publish message to channel: gateway-node-12)
         ▼
  [Chat Gateway Server 12]
         ├── (Bob is Online) ──> WebSocket Push to Bob (Delivered!)
         └── (Bob is Offline) ──> Enqueue to APNS / FCM Push Notification Service
         │
         ▼ (Async write to disk)
  [Cassandra Message Store Cluster]

=============================================================================
Step 5: Deep dive on key components (15 min)
=============================================================================
* 1. Message Ordering & ID Generation:
  - Standard auto-increment cannot scale across distributed database nodes.
  - Wall-clock timestamps ('System.currentTimeMillis()') skew due to NTP clock drift.
  - Solution: 64-bit Snowflake IDs or Cassandra TimeUUID. Message IDs are composed of:
    [41-bit Epoch Timestamp | 10-bit Machine ID | 12-bit Monotonic Sequence Number].
    Guarantees strict global ordering within any conversation.
* 2. Online Presence & Heartbeat Engine:
  - Clients send heartbeat ping every 30 seconds over the existing WebSocket.
  - Redis Key: "presence:{user_id}" -> EXPIRE 60s.
  - If a client disconnects abruptly (tunnel, dead battery), the key expires in 60s without manual cleanup.
* 3. Group Chat Optimization:
  - Small Groups (< 100 members): Fan-out on send. Gateway queries group members and pushes to each member's inbox.
  - Large Channels (Slack #general with 50,000 members): Do NOT duplicate messages 50,000 times! Store 1 single message in Cassandra, and broadcast via Redis Pub/Sub to actively connected channel listeners.

=============================================================================
Step 6: Bottlenecks, trade-offs, wrap-up (5 min)
=============================================================================
* Bottlenecks & SPOFs:
  - Chat Gateway Node Crash: If Gateway 4 dies, 100,000 WebSockets drop. Clients reconnect with exponential backoff and jitter to prevent a thundering herd on surviving gateway nodes.
  - Out-of-Order Delivery over Flaky Cellular Networks: Client maintains local sequence numbers; if sequence gap is detected, client requests missing range.
* WhatsApp Ephemeral Storage Trade-off:
  - WhatsApp stores messages on server disk ONLY until delivered, then purges them (End-to-End encrypted on client SQLite). Saves petabytes of cloud storage costs!`,
              explanation: "Partitioning Cassandra by `conversation_id` with `message_id TIMEUUID` clustering ensures sequential disk reads when loading chat history."
            },
            tradeoffs: "Storing chat history permanently requires massive petabyte storage clusters; purging messages upon delivery saves millions of dollars but shifts chat backup responsibility to user iCloud/Google Drive.",
            followUpQuestions: [
              {
                question: "How do you handle end-to-end encryption (E2EE) at scale?",
                answer: "Use the Signal Protocol (Double Ratchet Algorithm). The server acts only as a blind courier relaying encrypted ciphertext without holding the private decryption keys."
              },
              {
                question: "What happens if a user is in poor cellular coverage and sends 10 messages?",
                answer: "The mobile app writes messages to a local SQLite 'Outbox' table with client UUIDs; once network reconnects, it flushes them sequentially with idempotency keys."
              }
            ],
            usedInProduction: "WhatsApp (Erlang/FreeBSD), Slack (WebSockets + Envoy), Discord (Elixir + ScyllaDB).",
            relatedTopics: ["WebSockets", "Cassandra Data Modeling", "Redis Pub/Sub", "Presence Heartbeats"]
          }
        },
        {
          id: "sd-hld-case-4",
          question: "Design a Video Streaming Platform (YouTube / Netflix)",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A scalable video ingestion, transcoding, and content delivery network streaming petabytes of video content globally with Adaptive Bitrate Streaming (HLS/DASH) and sub-second playback start.",
            mentalModel: "Think of a global publishing company: authors submit massive raw draft books. Translators chop the book into chapters and translate them simultaneously into English, Spanish, and Japanese at different reading levels. Copies are stocked in regional bookstores (CDNs) so readers get immediate local delivery.",
            whatItIs: "A distributed media streaming architecture capable of ingesting gigabytes of raw video files, transcoding them into multiple bitrates in parallel, and serving them via edge CDN caching.",
            whyItExists: "Raw video files are gigabytes in size. Attempting to stream raw MP4 files causes long initial buffering times, constant pauses on mobile data, and overwhelms application servers.",
            codeDemo: {
              language: "markdown",
              code: `⏱️ 45-MINUTE SYSTEM DESIGN ROADMAP: YOUTUBE / NETFLIX

=============================================================================
Step 1: Clarify requirements (5 min)
=============================================================================
* Functional Requirements:
  1. Content creators upload high-resolution videos (up to 4K).
  2. Distributed transcoding into multiple resolutions (1080p, 720p, 480p, 360p).
  3. Viewers stream videos smoothly with Adaptive Bitrate Streaming (ABR).
  4. Real-time view count tracking, likes, and comment threads.
* Non-Functional Requirements:
  1. Highly Reliable Playback: Re-buffering ratio < 1%.
  2. Low Playback Start Latency: First frame rendered in < 500ms.
  3. Video Durability: 99.999999999% (11 9s) durability for uploaded content.
  4. Scalability: Support 1 Billion video views per day.
* Out-of-Scope:
  - Live streaming ingestion (Twitch/YouTube Live), video copyright fingerprinting (Content ID).

=============================================================================
Step 2: Estimate scale (5 min)
=============================================================================
* Upload Scale:
  - 500 hours of video uploaded every minute!
  - Daily Ingestion = 500 hrs * 60 mins * 100 MB/min ≈ 3 TB / minute ≈ 4.3 Petabytes / day!
* Streaming Egress Scale:
  - 1 Billion views / day. Average view duration = 5 minutes @ 720p (2 Mbps) ≈ 75 MB.
  - Daily Egress Bandwidth = 1B * 75 MB ≈ 75 Petabytes / day ≈ 7 Gbps egress!
  - Crucial Finding: 99%+ of video chunks MUST be served directly by CDN edge caches (Cloudflare, Akamai, or Netflix Open Connect appliances). Origin servers cannot handle 75 PB/day egress.

=============================================================================
Step 3: API + data model (5 min)
=============================================================================
* Core API Endpoints:
  1. POST /api/v1/videos/upload-url
     Request:  { "filename": "tutorial.mp4", "filesize": 524288000 }
     Response: 200 OK -> { "upload_url": "https://s3.amazonaws.com/raw-bucket?signature=...", "video_id": "v_123" }
  2. GET /api/v1/videos/{videoId}/master.m3u8
     Response: 200 OK (HLS Master Playlist file containing links to 1080p, 720p, 480p streams).

* Database Schema (Metadata Store - PostgreSQL / CockroachDB):
  Table: videos
  - id UUID PRIMARY KEY
  - creator_id UUID NOT NULL
  - title VARCHAR(255)
  - duration_seconds INT
  - status VARCHAR(20) -- UPLOADING, PROCESSING, READY, FAILED
  - cdn_url VARCHAR(500)
  - view_count BIGINT DEFAULT 0

=============================================================================
Step 4: High-level design (10 min)
=============================================================================
* Write Path (Ingestion & Transcoding Pipeline):
  [Creator Client]
         │ 1. Request Pre-Signed Multipart S3 URL
         ▼
  [API Gateway]
         │ 2. Direct S3 Upload (Bypasses app servers completely!)
         ▼
  [S3 Bucket: raw-uploads]
         │ 3. S3 Event Notification -> Kafka Queue
         ▼
  [Transcoding DAG Engine (Temporal / AWS Step Functions)]
         │ 4. Video Chunker: splits video into 10-second segments (.ts)
         ├── Worker Pool 1: Transcode 1080p (4.5 Mbps H.264/AV1)
         ├── Worker Pool 2: Transcode 720p (2.2 Mbps)
         ├── Worker Pool 3: Transcode 480p (800 Kbps)
         └── Master Playlist Generator (.m3u8 index file)
         ▼
  [S3 Bucket: processed-videos]

* Read Path (Streaming):
  [Viewer Client Player]
         │ 1. GET /videos/{id}/master.m3u8
         ▼
  [CDN Edge Server (Cloudflare / Netflix Open Connect)]
         │ 2. Player measures network bandwidth continuously
         │ 3. Requests 10s chunks (.ts) matching current Wi-Fi/4G speed (ABR)
         ▼
  [Origin S3 Storage] (Only contacted on CDN edge cache misses)

=============================================================================
Step 5: Deep dive on key components (15 min)
=============================================================================
* 1. Adaptive Bitrate Streaming (ABR - HLS / DASH):
  - Video is chopped into 10-second immutable chunks (.ts files) across multiple bitrates.
  - The client player requests Chunk 1 at 480p for instant playback (< 300ms start).
  - Once the player buffers 3 chunks and detects fast Wi-Fi, it seamlessly requests Chunk 4 at 1080p without stuttering.
* 2. High-Throughput Distributed View Counter:
  - 1 Billion views / day = 12,000 views / sec (viral videos receive 100,000+ views/sec).
  - Running direct SQL 'UPDATE videos SET view_count = view_count + 1' serializes on row locks and crashes the DB.
  - Solution: In-Memory Redis Hash Buffer:
    'HINCRBY video:views:buffer {videoId} 1'
    A scheduled background daemon flushes aggregated batches to PostgreSQL every 10 seconds.

=============================================================================
Step 6: Bottlenecks, trade-offs, wrap-up (5 min)
=============================================================================
* Bottlenecks & Optimizations:
  - Resuming Failed 10GB Uploads: Use S3 Multipart Upload API. Chunks are uploaded in 5MB blocks with individual ETags; failed uploads only retransmit missing 5MB blocks.
  - ISP Origin Congestion: Netflix installs custom hardware caching appliances (Open Connect Appliances - OCAs) directly inside global ISP datacenters, pre-seeding popular movies overnight.
* Trade-offs:
  - Pre-transcoding into 20 different bitrate/codec combinations consumes massive compute. YouTube pre-transcodes top resolutions immediately, and defers 4K/AV1 transcoding until a video gains viral traction.`,
              explanation: "Direct S3 multipart pre-signed uploads eliminate app server memory bottlenecks, while HLS ABR ensures zero buffering across flaky cellular connections."
            },
            tradeoffs: "Pre-transcoding into dozens of codec/resolution permutations requires enormous compute power. Netflix pre-transcodes everything; YouTube transcodes only top resolutions initially, deferring 4K/AV1 encoding until a video gains viral traction.",
            followUpQuestions: [
              {
                question: "How does Netflix Open Connect (OCA) work?",
                answer: "Netflix builds custom hardware storage appliances (OCAs) and installs them directly inside Internet Service Provider (ISP) datacenters worldwide, pre-loading popular movies during overnight off-peak hours."
              },
              {
                question: "How do you resume an interrupted 10GB video upload?",
                answer: "Use S3 Multipart Upload API. The client uploads 5MB parts independently with individual ETags and tracks uploaded parts in local storage; on network failure, only unuploaded 5MB parts are re-transmitted."
              }
            ],
            usedInProduction: "YouTube Video Architecture, Netflix Open Connect Appliance (OCA), Twitch Live HLS.",
            relatedTopics: ["HLS / DASH", "Adaptive Bitrate Streaming", "CDN Edge Caching", "Pre-Signed URLs"]
          }
        },
        {
          id: "sd-hld-case-5",
          question: "Design an E-Commerce Flash Sale System (Amazon Prime Day / Flipkart BBD)",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "An extreme-concurrency inventory reservation and checkout platform capable of selling limited stock to millions of concurrent users without overselling, race conditions, or database crashes.",
            mentalModel: "Think of an Olympic stadium with 10,000 concert tickets: 1 million people rush the gate. The guards keep 990,000 outside in an organized waiting lawn. The first 10,000 through the turnstile get a physical numbered voucher. Only voucher holders enter the box office to pay quietly.",
            whatItIs: "An extreme write-concurrency architecture that shields databases from traffic spikes by executing atomic in-memory stock pre-decrement and decoupling orders via asynchronous queues.",
            whyItExists: "If 100,000 concurrent requests hit PostgreSQL with `UPDATE inventory SET stock = stock - 1 WHERE item_id = 1`, database row locks serialize, thread pools exhaust, latency jumps to 30s, and the site crashes with negative inventory.",
            codeDemo: {
              language: "markdown",
              code: `⏱️ 45-MINUTE SYSTEM DESIGN ROADMAP: FLASH SALE SYSTEM

=============================================================================
Step 1: Clarify requirements (5 min)
=============================================================================
* Functional Requirements:
  1. Users view flash sale product catalog with live countdown timer.
  2. Users click 'Buy Now' to claim a limited-stock item (e.g. 10,000 units).
  3. System strictly prevents over-selling (Inventory >= 0 at all times).
  4. Item is temporarily reserved for 10 minutes for payment; returned if abandoned.
* Non-Functional Requirements:
  1. Extreme Concurrency: 1,000,000 users clicking 'Buy Now' in the first second.
  2. Strict Consistency: Zero overselling, zero duplicate inventory assignment.
  3. Low Latency: Instant feedback (won or sold-out) in < 200ms.
* Out-of-Scope:
  - Recommendation engine, warehouse logistics routing, customer reviews.

=============================================================================
Step 2: Estimate scale (5 min)
=============================================================================
* Traffic Estimation:
  - Flash sale stock: 10,000 units.
  - Active users at countdown 00:00:00 = 1,000,000 concurrent users.
  - Peak Write QPS: 1,000,000 requests in 2 seconds = 500,000 QPS!
* Database Capacity Reality Check:
  - PostgreSQL handles ~5,000 write QPS on high-end NVMe hardware.
  - Attempting 500,000 write QPS directly against SQL causes immediate crash.
  - Decision: 100% of stock reservation MUST happen in-memory in Redis!

=============================================================================
Step 3: API + data model (5 min)
=============================================================================
* API Contracts:
  POST /api/v1/flash-sale/orders
  Headers: Authorization: Bearer <token>, Idempotency-Key: <uuid>
  Request:  { "item_id": "item_iphone16", "quantity": 1 }
  Response:
    - 200 OK: { "status": "RESERVED", "order_token": "ord_8129", "expires_in_seconds": 600 }
    - 409 Conflict: { "status": "SOLD_OUT", "message": "All items have been claimed." }

* Redis In-Memory State:
  Key 1: "flash_sale:stock:{itemId}" -> String integer (e.g. 10000)
  Key 2: "flash_sale:users_bought:{itemId}" -> Redis Set (for deduplication)

=============================================================================
Step 4: High-level design (10 min)
=============================================================================
* Multi-Tier Traffic Shield Architecture:
  Tier 1: CDN Edge Caching (Cloudflare)
  - Product page HTML, images, price are 100% static assets served from CDN.
  - Origin receives ZERO traffic for page browsing or countdown timers.

  Tier 2: Virtual Waiting Room (Cloudflare Waiting Room / Envoy Queue)
  - Regulates traffic into the checkout backend to the exact capacity the system can absorb.

  Tier 3: In-Memory Redis Lua Engine:
  - Pre-warms Redis with stock: SET flash_sale:stock:iphone16 10000.
  - Executes atomic reservation Lua script.

  Tier 4: Asynchronous Queue Decoupling (Apache Kafka):
  - Winning requests (10,000 only!) enqueued into Kafka 'order-processing-topic'.
  - Database worker pool consumes from Kafka at a smooth, steady rate of 500 orders/sec.

=============================================================================
Step 5: Deep dive on key components (15 min)
=============================================================================
* 1. Atomic Redis Lua Script (Zero Race Conditions):
  -- Atomic Flash Sale Stock Claim
  local stock_key = KEYS[1]
  local user_bought_key = KEYS[2]
  local user_id = ARGV[1]

  -- 1. Prevent duplicate purchase by same user
  if redis.call('SISMEMBER', user_bought_key, user_id) == 1 then
      return -1 -- ALREADY_PURCHASED
  end

  -- 2. Atomically check and decrement stock
  local current_stock = tonumber(redis.call('GET', stock_key) or 0)
  if current_stock > 0 then
      redis.call('DECR', stock_key)
      redis.call('SADD', user_bought_key, user_id)
      return 1 -- SUCCESS (Stock Reserved!)
  else
      return 0 -- SOLD OUT
  end

* 2. Payment Expiration & Stock Rollback:
  - When an order is reserved, an expiration timer (10 mins) is registered in Redis.
  - If customer completes payment within 10 mins: Order status -> 'CONFIRMED'.
  - If customer abandons payment after 10 mins:
    Order status -> 'EXPIRED'.
    System executes: 'redis.call('INCR', stock_key)' to return the stock back to the pool!

=============================================================================
Step 6: Bottlenecks, trade-offs, wrap-up (5 min)
=============================================================================
* Anti-Bot & Fraud Defense:
  - Tokenize the 'Buy Now' URL with an HMAC signature revealed only at the exact sale second.
  - Integrate Cloudflare Turnstile CAPTCHA and rate limit by device fingerprint.
* Single Point of Failure (SPOF) Defense:
  - Redis Sentinel / Redis Cluster with multi-AZ read replicas and synchronous replication (WAIT command) ensures zero lost stock counts during node failover.`,
              explanation: "By handling 99% of requests in-memory via Redis Lua script, the database never experiences more than the exact 10,000 winning order inserts."
            },
            tradeoffs: "Pre-decrementing stock in Redis can lead to temporary phantom sold-out states if winners abandon payment, requiring stock-release reconciliation jobs.",
            followUpQuestions: [
              {
                question: "How do you prevent bot scripts and auto-clickers from cleaning out inventory?",
                answer: "Enforce dynamic CAPTCHA (Cloudflare Turnstile), tokenize the 'Buy Now' URL with an HMAC key revealed only at the exact sale second, and rate limit per device fingerprint."
              },
              {
                question: "What if the primary Redis node crashes mid-sale?",
                answer: "Use Redis Sentinel / Redis Cluster with synchronous replication (WAIT command) or a distributed consensus key-value store (etcd/Dragonfly) to prevent stock count rollbacks."
              }
            ],
            usedInProduction: "Alibaba Singles' Day, Flipkart Big Billion Days, Xiaomi Flash Sales, Amazon Lightning Deals.",
            relatedTopics: ["Redis Lua Scripts", "Virtual Waiting Rooms", "Optimistic Locking", "Inventory Concurrency"]
          }
        },
        {
          id: "sd-hld-case-6",
          question: "Design a Ride-Hailing Service (Uber / Lyft / Grab)",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A real-time geospatial ride matching and dispatch engine that tracks millions of active drivers every 4 seconds, finds nearby available drivers using Uber H3 hexagonal spatial indexing, and coordinates trip state machines.",
            mentalModel: "Think of an air traffic radar board divided into honeycomb cells: Every 4 seconds, every airplane broadcasts its GPS coordinates. When a passenger requests a flight from Cell X, the radar looks only at Cell X and its 6 immediate neighboring honeycomb cells to find the closest pilot.",
            whatItIs: "A distributed real-time geospatial system managing millions of concurrent telemetry streams, dynamic spatial indexing, route optimization, and driver-rider state machines.",
            whyItExists: "Calculating Cartesian distance between millions of riders and drivers using standard SQL `ST_Distance` on every ping causes quadratic CPU exhaustion and database lockouts.",
            codeDemo: {
              language: "markdown",
              code: `⏱️ 45-MINUTE SYSTEM DESIGN ROADMAP: UBER / LYFT

=============================================================================
Step 1: Clarify requirements (5 min)
=============================================================================
* Functional Requirements:
  1. Drivers broadcast GPS coordinates every 4 seconds.
  2. Riders request a ride with pickup and destination coordinates.
  3. System queries and matches the closest available drivers within 5km radius.
  4. Driver accepts/declines ride within 15 seconds.
  5. Live map tracking of driver approaching pickup location.
* Non-Functional Requirements:
  1. High Availability (99.999%): Service must not fail during peak commuting hours.
  2. Low Latency Matching: Driver match dispatched in < 5 seconds.
  3. Low Latency Location Ingestion: Location ping p99 latency < 200ms.
  4. Strong Consistency for Trip State: A driver must never be booked twice simultaneously.
* Out-of-Scope:
  - Driver background checks, airport queue geofencing, carpool split fares.

=============================================================================
Step 2: Estimate scale (5 min)
=============================================================================
* Scale Calculations:
  - 1 Million concurrent active drivers worldwide.
  - Driver sends GPS ping every 4 seconds:
    Ingress QPS = 1,000,000 / 4s = 250,000 Location Pings / sec!
  - 10 Million Daily Active Riders.
  - Ride Requests: 1 Million rides / day ≈ 20 requests / sec (Peak: 100 QPS).
* Storage Reality:
  - Writing 250,000 location updates/sec directly to persistent disk crashes any database.
  - Solution: Real-time driver locations are transient and held purely in-memory (Redis); only completed trip breadcrumbs are persisted to cold Cassandra storage.

=============================================================================
Step 3: API + data model (5 min)
=============================================================================
* Core APIs:
  1. WebSocket Location Telemetry:
     Driver -> Server: { "driver_id": "d_123", "lat": 37.7749, "lng": -122.4194, "bearing": 180, "status": "AVAILABLE" }
  2. POST /api/v1/rides/request
     Request:  { "rider_id": "r_999", "pickup": [37.7749, -122.4194], "dropoff": [37.7833, -122.4167] }
     Response: 201 Created -> { "trip_id": "trip_001", "status": "MATCHING" }

* Data Model (PostgreSQL - Strong ACID for Trips):
  Table: trips
  - id UUID PRIMARY KEY
  - rider_id UUID NOT NULL
  - driver_id UUID
  - status VARCHAR(20) -- REQUESTED, MATCHING, ACCEPTED, ARRIVED, IN_TRIP, COMPLETED
  - pickup_geom GEOMETRY(Point, 4326)
  - fare DECIMAL(10, 2)
  - version INT DEFAULT 1 (For Optimistic Locking!)

=============================================================================
Step 4: High-level design (10 min)
=============================================================================
* Location Ingestion & Matching Pipeline:
  [1 Million Active Drivers]
         │ (Every 4s sends: {driver_id, lat, lng, bearing, status})
         ▼
  [Netty / WebSocket Gateway Cluster]
         │
         ├──> [Kafka: driver-location-updates]
         │       │
         │       ▼
         │    [Location Service Workers]
         │       │ Update in-memory spatial index (Uber H3 Resolution 8 ≈ 460m)
         │       ▼
         └──> [Redis In-Memory Geospatial Grid / H3 Ring Sets]
              Key: "h3:{cell_index}" -> Set of available driver IDs

  [Rider App: Request Ride]
         │
         ▼
  [Dispatch & Matching Engine]
         │ 1. Convert pickup GPS to H3 Cell Index: H3.geoToH3(lat, lng, 8)
         │ 2. Find neighboring rings: cells = H3.kRing(h3_index, 2) (Covers ~2.5km)
         │ 3. Query Redis for available drivers in those 19 cells (Sub-ms lookup!)
         │ 4. Filter top candidate driver by ETA routing engine (OSRM)
         │ 5. Lock candidate driver with Redis Distributed Lock
         ▼
  [Push Notification to Driver App] ("Incoming Ride: 15s to accept")

=============================================================================
Step 5: Deep dive on key components (15 min)
=============================================================================
* 1. Geospatial Indexing (Why Uber H3 Hexagons?):
  - Geohash: Interleaves latitude and longitude into base32 string. Disadvantage: Rectangular cells with severe edge boundary distortion at poles.
  - Uber H3 (Hexagonal Hierarchical Spatial Index):
    * Every hexagon has exactly 6 neighbors with identical distance between centers!
    * Unlike squares where diagonal neighbors are sqrt(2) further than adjacent neighbors, hexagons model smooth radial movement and circular search radius accurately.
* 2. Trip State Machine & Concurrency:
  - If two riders request a ride in the same street simultaneously, prevent double-booking using Optimistic Locking:
    UPDATE trips SET status = 'ACCEPTED', driver_id = 'd_123', version = version + 1
    WHERE id = 'trip_001' AND status = 'MATCHING' AND version = 1;

=============================================================================
Step 6: Bottlenecks, trade-offs, wrap-up (5 min)
=============================================================================
* Dynamic Surge Pricing:
  - Apache Flink streaming job aggregates ride requests (demand) vs available drivers (supply) in each H3 hexagon every 30 seconds; applies surge multiplier when ratio exceeds threshold.
* Driver Network Disconnect:
  - If a driver loses cellular connection in a tunnel, Redis TTL (15s) automatically removes the driver from the active spatial index, preventing dispatchers from assigning unreachable drivers.`,
              explanation: "Using Uber H3 hexagons ensures uniform neighbor distances, while Redis in-memory spatial sets provide sub-millisecond driver lookups."
            },
            tradeoffs: "Updating driver location every 4s in persistent disk databases destroys I/O. Decouple by storing real-time transient location purely in RAM (Redis), saving only completed trip historical breadcrumbs to cold storage.",
            followUpQuestions: [
              {
                question: "How does Dynamic Surge Pricing work?",
                answer: "Aggregates ride requests (demand) vs available drivers (supply) in each H3 hexagon every 30 seconds using Apache Flink streaming analytics; when ratio exceeds threshold, a surge multiplier is applied."
              },
              {
                question: "What happens if two riders request the same closest driver simultaneously?",
                answer: "A Redis distributed lock or database conditional update `WHERE driver_status = 'AVAILABLE'` ensures only the first request claims the driver; the second request seamlessly falls through to candidate #2."
              }
            ],
            usedInProduction: "Uber H3 Spatial Index, Lyft dispatch platform, Grab real-time matching.",
            relatedTopics: ["Uber H3 Hexagons", "Geospatial Indexing", "Redis GEOADD", "Optimistic Locking"]
          }
        },
        {
          id: "sd-hld-case-7",
          question: "Design a Social Network Feed (Twitter / X / Instagram Timeline)",
          difficulty: "Hard",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A high-throughput timeline aggregation and generation engine supporting tweet publishing, following social graphs, and instant timeline feeds using a Hybrid Fan-out model.",
            mentalModel: "Think of an office memo distribution: When an intern writes a memo (5 readers), they walk to each reader's desk and drop a copy (Fan-out on write). When the CEO writes a company-wide memo (100,000 employees), they don't print 100,000 papers; they post it on the central lobby bulletin board, and employees read it when they walk past (Fan-out on read).",
            whatItIs: "A distributed social graph feed generation architecture balancing massive read-heavy traffic with high fan-out write spikes.",
            whyItExists: "Naive queries like `SELECT * FROM tweets WHERE user_id IN (SELECT followee_id FROM follows WHERE user_id = 123) ORDER BY created_at DESC LIMIT 20` perform massive relational JOINs and collapse at scale.",
            codeDemo: {
              language: "markdown",
              code: `⏱️ 45-MINUTE SYSTEM DESIGN ROADMAP: TWITTER / X NEWS FEED

=============================================================================
Step 1: Clarify requirements (5 min)
=============================================================================
* Functional Requirements:
  1. Users publish tweets (text, media).
  2. Users follow / unfollow other users.
  3. Users view their Home Timeline (feed of tweets from followees sorted chronologically or ranked).
  4. Users view a User Timeline (tweets published by a specific user).
* Non-Functional Requirements:
  1. Read-Heavy Profile: 100:1 to 500:1 read-to-write ratio.
  2. Fast Feed Rendering: Home timeline load p99 < 100ms.
  3. Eventual Consistency: A tweet appearing in a follower's feed 2-3 seconds later is acceptable.
  4. High Availability (99.999%): Browsing feeds must never fail.
* Out-of-Scope:
  - Direct messaging, trending hashtags ranking algorithm, ads insertion engine.

=============================================================================
Step 2: Estimate scale (5 min)
=============================================================================
* Traffic Estimation:
  - 300 Million Daily Active Users (DAU).
  - Reads: 300M * 50 timeline views/day = 15 Billion views / day ≈ 150,000 Read QPS.
  - Writes: 300M * 2 tweets/day = 600 Million tweets / day ≈ 6,000 Write QPS.
  - Read:Write Ratio = 150,000 : 6,000 = 25:1.
* Storage Estimation:
  - 600M tweets * 300 bytes metadata = 180 GB / day ≈ 65 TB / year (fits on Cassandra).
* Memory Cache Sizing (Home Timelines in Redis):
  - Precompute timelines for 300M users. Store top 800 tweet IDs per active user (800 * 8 bytes ≈ 6.4 KB).
  - 300M * 6.4 KB ≈ 1.9 Terabytes of RAM (distributed across a 32-node Redis cluster).

=============================================================================
Step 3: API + data model (5 min)
=============================================================================
* REST API Endpoints:
  1. POST /api/v1/tweets
     Request:  { "content": "Designing distributed systems!", "media_ids": [] }
     Response: 201 Created -> { "tweet_id": "tw_8912", "created_at": 1730000000 }
  2. GET /api/v1/timeline/home?limit=20&cursor=tw_8912
     Response: 200 OK -> { "tweets": [ ... ], "next_cursor": "tw_8890", "has_more": true }

* Redis Data Structure for Timelines:
  Key: "timeline:{userId}"
  Data Structure: Redis Sorted Set (ZSET)
  Score: Tweet Timestamp (epoch milliseconds)
  Value: Tweet ID (64-bit int)
  Command: 'ZREVRANGEBYSCORE timeline:usr_123 +inf -inf LIMIT 0 20'

=============================================================================
Step 4: High-level design (10 min)
=============================================================================
* The Hybrid Fan-Out Architecture:
  [Client Posts Tweet]
         │
         ▼
  [Tweet Ingestion Service]
         │ Writes tweet to PostgreSQL / Cassandra
         ▼
  [Kafka Topic: tweet-events]
         │
         ▼
  [Fan-Out Workers]
         │ Checks author's follower count:
         │
         ├── Followers < 25,000 (Regular User):
         │   PUSH (Fan-Out on Write)
         │   -> Worker pushes Tweet ID into each follower's Redis ZSET.
         │
         └── Followers > 25,000 (Celebrity / VIP like Elon Musk):
             PULL (Fan-Out on Read)
             -> Do NOT fan out to 100M followers! System would freeze.
             -> Stores tweet in author's User Timeline only.

  [Client Reads Home Feed]
         │
         ▼
  [Feed Aggregator Service]
         │ 1. Fetches precomputed timeline from user's Redis ZSET (Fast!).
         │ 2. Queries recent tweets of celebrity accounts the user follows.
         │ 3. Merges and sorts top 20 tweets in memory in < 25ms!

=============================================================================
Step 5: Deep dive on key components (15 min)
=============================================================================
* 1. Solving the Celebrity Problem (Hot Partitions):
  - In pure Push systems, a celebrity with 100M followers posting a tweet triggers 100,000,000 Redis write operations, creating huge queue backpressure.
  - The Hybrid solution completely eliminates write amplification for celebrities while keeping read latency sub-50ms for normal users.
* 2. Inactive User Optimization:
  - Do NOT precompute or update timelines for users who haven't logged in for 14+ days.
  - When an inactive user opens the app, trigger a Cold-Start Rebuild: fetch tweets from their followees and populate their Redis ZSET on the fly.

=============================================================================
Step 6: Bottlenecks, trade-offs, wrap-up (5 min)
=============================================================================
* Pagination Strategy:
  - Never use SQL OFFSET / LIMIT (causes quadratic B-Tree scan and skips items as new tweets arrive).
  - Use Keyset / Cursor Pagination ('WHERE tweet_id < cursor LIMIT 20').
* Handling Tweet Deletions:
  - Publish 'TweetDeleted' event to Kafka. Client hides it optimistically; asynchronous workers remove the ID from Redis ZSETs; database sets 'is_deleted = true'.`,
              explanation: "The Hybrid Fan-out model protects write infrastructure from celebrity storms while maintaining sub-50ms read latency for 99% of users."
            },
            tradeoffs: "Hybrid fan-out increases application complexity because read aggregators must dynamically bifurcate followees into celebrity vs regular buckets.",
            followUpQuestions: [
              {
                question: "How do you implement algorithmic ranked feeds (like For You page) instead of reverse-chronological?",
                answer: "Candidate Generation filters recent tweets from followees and topics via embedding retrieval, followed by a Heavy Ranker (Machine Learning model scoring engagement probability: P(like), P(retweet), P(reply)) before final rendering."
              },
              {
                question: "How do you handle tweet deletions?",
                answer: "Publish a `TweetDeleted` event to Kafka. Clients remove it from UI, Redis workers asynchronously delete the ID from follower ZSETs, and the relational database marks it `is_deleted = true`."
              }
            ],
            usedInProduction: "Twitter Timeline (Early Fanout + Search Mixer), Instagram Feed Service, LinkedIn Feed.",
            relatedTopics: ["Fan-out on Write vs Read", "Redis Sorted Sets", "Social Graph Sharding", "Hybrid Timeline Architecture"]
          }
        },
        {
          id: "sd-hld-case-8",
          question: "Design a Distributed In-Memory Cache (Redis Cluster / Memcached)",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A partitioned, fault-tolerant distributed in-memory cache supporting sub-millisecond reads/writes, consistent hashing / hash slots, master-replica replication, and LRU/LFU eviction.",
            mentalModel: "Think of a circular carousel with 16,384 numbered luggage bins distributed across 6 baggage handlers (servers). When a bag arrives, its barcode hash determines the bin number. If handler #3 takes a break, only their assigned bins transfer to their designated backup handler without moving everyone else's luggage.",
            whatItIs: "A distributed memory management infrastructure pooling hundreds of gigabytes of RAM across server clusters with automated failover and eviction.",
            whyItExists: "Single-node caches hit memory capacity and CPU networking limits. Distributed caching provides horizontal scale and shields origin databases from being crushed by read traffic.",
            codeDemo: {
              language: "markdown",
              code: `⏱️ 45-MINUTE SYSTEM DESIGN ROADMAP: DISTRIBUTED CACHE CLUSTER

=============================================================================
Step 1: Clarify requirements (5 min)
=============================================================================
* Functional Requirements:
  1. Put(key, value, ttl) & Get(key) with sub-millisecond latency.
  2. Support multiple cache eviction strategies (LRU, LFU, volatile-ttl).
  3. Support data persistence snapshots (RDB / AOF).
* Non-Functional Requirements:
  1. Ultra-High Throughput: 1,000,000+ QPS.
  2. High Availability: Automated master-replica failover in < 5 seconds.
  3. Elastic Scalability: Add or remove nodes with minimal data redistribution.
* Out-of-Scope:
  - Multi-datacenter active-active cross-WAN replication, ACID transactions.

=============================================================================
Step 2: Estimate scale (5 min)
=============================================================================
* Scale Numbers:
  - Target Throughput: 1,000,000 QPS.
  - Total Memory Capacity: 500 Gigabytes of RAM.
  - Node Sizing: Standard AWS r6g.2xlarge instances (64 GB RAM each).
  - Number of Master Nodes = 500 GB / 64 GB ≈ 8 Master Nodes (+ 8 Replicas for HA = 16 instances total).

=============================================================================
Step 3: API + data model (5 min)
=============================================================================
* Protocol & Commands:
  - Binary or RESP (REdis Serialization Protocol):
    GET key
    SET key value EX seconds
    DEL key
    EXPIRE key seconds

=============================================================================
Step 4: High-level design (10 min)
=============================================================================
* Partitioning Strategy: Redis Hash Slots:
  - Redis Cluster divides the entire keyspace into 16,384 fixed hash slots:
    Hash Slot = CRC16(key) % 16384
  - Master Node 1: Owns Slots 0 - 5460
  - Master Node 2: Owns Slots 5461 - 10922
  - Master Node 3: Owns Slots 10923 - 16383
* Cluster Topology:
  Master 1 (Slots 0-5460)     <---> Replica 1 (Warm standby)
  Master 2 (Slots 5461-10922) <---> Replica 2
  Master 3 (Slots 10923-16383)<---> Replica 3

* Client Smart Routing:
  - Client library (Jedis / Lettuce) maintains a local slot cache.
  - Hashes key -> determines target master node -> connects directly to that node in O(1) time without central proxy overhead!

=============================================================================
Step 5: Deep dive on key components (15 min)
=============================================================================
* 1. Node Failure Detection via Gossip Protocol:
  - Nodes continuously ping each other every 100ms over internal cluster bus.
  - If Master 2 fails to respond for 'node_timeout' (5s), surviving masters flag it as PFAIL (Possible Failure).
  - When majority of masters agree, state transitions to FAIL.
  - Replica 2 initiates election, votes itself new Master, and takes over slots 5461-10922 in < 6 seconds!
* 2. Approximated LRU Eviction:
  - True LRU requires maintaining pointers for every single key in a linked list, wasting 16-24 bytes per key.
  - Redis uses Approximated LRU: samples 5 random keys and evicts the oldest among that random sample. Achieves 99% accuracy of true LRU with zero memory overhead!

=============================================================================
Step 6: Bottlenecks, trade-offs, wrap-up (5 min)
=============================================================================
* Persistence Options:
  - RDB (Snapshot): Fast restart, compact file, but risks losing last 5 minutes of data on sudden power failure.
  - AOF (Append-Only File): Fsync every second, near-zero data loss, larger disk footprint.
  - Recommended: Hybrid RDB + AOF preamble.
* Cache Invalidation:
  - Avoid Cache Stampede by applying Mutex Locking or Probabilistic Early Expiration (XFetch algorithm).`,
              explanation: "Fixed 16,384 hash slots make cluster resharding deterministic and eliminate the need for complex distributed coordinators like ZooKeeper."
            },
            tradeoffs: "Redis runs single-threaded for command execution to eliminate lock contention, but multi-threaded I/O handles network socket reading/writing.",
            followUpQuestions: [
              {
                question: "What is the difference between Redis and Memcached?",
                answer: "Memcached is multi-threaded and purely key-value strings; Redis is single-threaded for commands, supports rich data structures (Hashes, Sets, ZSETs, Streams), persistence (RDB/AOF), and native replication/clustering."
              },
              {
                question: "How does Redis approximate LRU without wasting memory on pointers?",
                answer: "Redis does not maintain a true linked list of all keys. Instead, it uses an Approximated LRU algorithm: it samples 5 random keys and evicts the oldest among that random sample, achieving 99% of true LRU efficiency with zero memory overhead."
              }
            ],
            usedInProduction: "Redis Cluster, AWS ElastiCache, Memcached, Aerospike.",
            relatedTopics: ["Consistent Hashing", "Redis Hash Slots", "LRU Cache Eviction", "Gossip Protocol Failover"]
          }
        },
        {
          id: "sd-hld-case-9",
          question: "Design a Distributed Web Crawler (Googlebot / Bingbot)",
          difficulty: "Hard",
          frequency: 4,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A distributed, polite, and scalable web crawler that downloads billions of web pages across the internet to feed downstream search indexing and AI training pipelines.",
            mentalModel: "Think of an army of librarians exploring a gigantic uncharted library: each librarian visits a shelf, reads a book, jots down all references/footnotes (URLs) to other books, checks a master visitor log to avoid re-reading books already scanned, and never pulls more than one book per minute from the same small study room so as not to disturb local patrons (politeness).",
            whatItIs: "An automated web traversal engine that systematically downloads HTML documents, extracts hyperlinks, deduplicates URLs, and respects website rate limits.",
            whyItExists: "Search engines and AI foundational models need an up-to-date, comprehensive repository of global web content to answer search queries and train language models.",
            codeDemo: {
              language: "markdown",
              code: `⏱️ 45-MINUTE SYSTEM DESIGN ROADMAP: DISTRIBUTED WEB CRAWLER

=============================================================================
Step 1: Clarify requirements (5 min)
=============================================================================
* Functional Requirements:
  1. Crawl web pages starting from seed URLs.
  2. Parse HTML, extract hyperlinks, and feed unvisited URLs into the crawl queue.
  3. Store raw HTML page content for search indexers.
  4. Adhere strictly to robots.txt rules and polite rate limits per website.
* Non-Functional Requirements:
  1. Scalability: Crawl 1 Billion pages / month.
  2. Politeness: Never overwhelm any web server with concurrent requests.
  3. Extensibility: Support HTML, PDFs, and images.
  4. Robustness: Gracefully handle spider traps, broken links, and HTTP tarpits.
* Out-of-Scope:
  - PageRank scoring algorithm, search query execution, JavaScript rendering (Puppeteer).

=============================================================================
Step 2: Estimate scale (5 min)
=============================================================================
* Scale Numbers:
  - 1 Billion pages / month ≈ 400 pages / sec.
  - Average page size = 500 KB (HTML + metadata).
  - Storage / month = 1 Billion * 500 KB = 500 Terabytes / month (6 Petabytes / year).
  - Network Ingress Bandwidth = 400 pages/s * 500 KB = 200 MB/s (1.6 Gbps).

=============================================================================
Step 3: API + data model (5 min)
=============================================================================
* Internal Data Structures:
  - Raw Page Storage: Amazon S3 / Ceph Object Store (Bucket key: hash(url)).
  - Visited URLs Filter: In-Memory Bloom Filter backed by RocksDB.
  - Host Delay Table: Redis Hash (Key: hostname -> Value: last_crawl_timestamp).

=============================================================================
Step 4: High-level design (10 min)
=============================================================================
* Architecture & URL Frontier Flow:
  [Seed URLs]
      │
      ▼
  [URL Frontier] (Politeness + Prioritization Queues)
      │
      ▼
  [Fetcher Workers (Worker Pool)]
      ├──> [DNS Resolver Cache] (Fast local IP lookups)
      ├──> [Robots.txt Cache] (Checks allow/disallow paths)
      └──> [HTTP Downloader]
              │
              ▼
  [Content Parser & Link Extractor]
      │
      ├── (Raw HTML) ──> [Object Storage (S3 / HDFS)]
      │
      └── (Extracted Links)
              │
              ▼
  [URL Deduplication (Bloom Filter)]
      ├── If Visited: Discard
      └── If New: Feed back into URL Frontier!

=============================================================================
Step 5: Deep dive on key components (15 min)
=============================================================================
* 1. Two-Stage URL Frontier (Politeness + Priority):
  - Stage 1: Priority Queues (Importance):
    URLs prioritized by PageRank / Domain Authority into K Priority Queues. High-value pages sampled more frequently.
  - Stage 2: Politeness Manager (Host Affinity):
    Maps each hostname to a dedicated FIFO queue (e.g., all 'cnn.com' URLs go to Queue 1).
    Queue Selector checks: '(current_time - last_download_time_for_host) >= 1000ms'.
    Ensures at least 1 second gap between requests to the same server!
* 2. URL Deduplication via Bloom Filter:
  - Storing 10 Billion URLs in a hash set consumes ~500 GB of RAM.
  - A Bloom filter storing 10 Billion items with 0.1% false-positive rate requires only ~18 GB of RAM!
  - If Bloom filter returns 'NO', URL is 100% unvisited -> Enqueue.

=============================================================================
Step 6: Bottlenecks, trade-offs, wrap-up (5 min)
=============================================================================
* Spider Traps & Tarpits:
  - Websites with infinite dynamic calendars or circular redirects ('/a/b/a/b/a...') crash crawlers.
  - Defense: Cap maximum URL length to 255 chars, limit directory depth to 6, and restrict max pages per domain.
* Near-Duplicate Content Detection:
  - Many URLs host identical content. Compute 64-bit SimHash (Locality-Sensitive Hashing); if Hamming distance <= 3, skip storage.`,
              explanation: "The two-stage queue architecture elegantly decouples web importance scoring from per-domain politeness throttling."
            },
            tradeoffs: "Aggressive crawling discovers fresh content faster but risks IP bans and lawsuits; strict politeness (1-2s delays) requires maintaining millions of separate domain queues in memory.",
            followUpQuestions: [
              {
                question: "How do you detect and escape Spider Traps (infinite dynamic URL generation)?",
                answer: "Enforce maximum URL length, limit directory depth (/a/b/c/d/e...), detect repetitive query parameters, and cap the maximum number of pages crawled per domain."
              },
              {
                question: "How do you avoid downloading duplicate identical pages hosted on different URLs?",
                answer: "Compute a 64-bit SimHash (Locality-Sensitive Hashing) or MinHash of the document content; if the Hamming distance between two document hashes is <= 3, they are near-duplicates and can be skipped."
              }
            ],
            usedInProduction: "Googlebot, Apache Nutch, Common Crawl, Scrapy Cluster.",
            relatedTopics: ["URL Frontier", "Bloom Filters", "SimHash Near-Duplicate Detection", "Robots.txt"]
          }
        },
        {
          id: "sd-hld-case-10",
          question: "Design a Distributed Notification Service (Apple APNS / Google FCM / Twilio / SendGrid)",
          difficulty: "Intermediate",
          frequency: 5,
          lastVerified: "2026-10-17",
          answer: {
            quickAnswer: "A high-throughput multi-channel notification engine delivering Push, SMS, and Email alerts with user preference filtering, priority queuing, and automated retries with Dead Letter Queues (DLQ).",
            mentalModel: "Think of an international postal sorting hub: packages enter marked 'Urgent Air Mail' (OTP SMS) or 'Standard Parcel' (Marketing Email). Sorters verify the recipient's delivery preferences (e.g., 'no promotional mail on weekends'), verify postal limits, and distribute parcels to specialized carrier vans (FedEx, DHL, UPS) with automated tracking.",
            whatItIs: "A centralized notification backbone decoupling microservices from third-party delivery vendors, retry logic, rate limits, and user communication preferences.",
            whyItExists: "Third-party APIs (Twilio, SendGrid, APNS) have strict rate limits, regional latency, and periodic outages. Individual microservices calling them synchronously experience cascading timeouts.",
            codeDemo: {
              language: "markdown",
              code: `⏱️ 45-MINUTE SYSTEM DESIGN ROADMAP: NOTIFICATION PLATFORM

=============================================================================
Step 1: Clarify requirements (5 min)
=============================================================================
* Functional Requirements:
  1. Multi-channel support: Mobile Push (APNS/FCM), SMS (Twilio), Email (SendGrid).
  2. Priority routing: Critical (OTP, fraud alerts) vs Non-Critical (promotions).
  3. User Preferences: Users can toggle channel settings (e.g. Email: OFF, Push: ON).
  4. Deduplication: Prevent sending duplicate alerts within a 5-minute window.
* Non-Functional Requirements:
  1. High Throughput: 50,000 notifications / second.
  2. Low Latency for OTP: SMS delivered in < 5 seconds worldwide.
  3. High Reliability: Zero message loss for transactional notifications.
* Out-of-Scope:
  - In-app notification center UI, rich media marketing campaign builder.

=============================================================================
Step 2: Estimate scale (5 min)
=============================================================================
* Scale Numbers:
  - 500 Million registered users.
  - Daily Notifications: 100 Million push alerts, 20 Million emails, 10 Million SMS.
  - Total Volume = 130 Million / day ≈ 1,500 notifications / sec.
  - Peak Burst (Flash sale / breaking news) = 50,000 notifications / sec.

=============================================================================
Step 3: API + data model (5 min)
=============================================================================
* REST API Endpoint:
  POST /api/v1/notifications
  Headers: Authorization: Bearer <token>, Idempotency-Key: <uuid>
  Request:
  {
    "recipient_id": "usr_991",
    "channel": "SMS",
    "priority": "HIGH",
    "template_id": "tpl_otp_code",
    "params": { "code": "819204" }
  }
  Response: 202 Accepted -> { "notification_id": "notif_001", "status": "QUEUED" }

* Data Schema (PostgreSQL):
  Table: user_notification_settings (user_id UUID, channel VARCHAR, is_opted_in BOOLEAN)
  Table: user_devices (user_id UUID, device_token VARCHAR, platform VARCHAR, last_seen TIMESTAMP)

=============================================================================
Step 4: High-level design (10 min)
=============================================================================
* Pipeline Architecture:
  [Client Microservices (Auth, Order, Billing)]
         │ POST /api/v1/notifications
         ▼
  [Notification Ingestion Gateway]
         │ 1. Validate Schema & Idempotency Key
         │ 2. Check Deduplication Cache (Redis SETNX: "notif:dedup:{hash}" TTL 5m)
         ▼
  [Kafka Message Bus - Partitioned by Priority & Channel]
         ├── Topic: otp-sms-high-priority (Dedicated workers, SLA < 2s)
         ├── Topic: transactional-push (Medium priority)
         └── Topic: marketing-email-bulk (Low priority, batched)

  [Worker Pool]
         │ Step 1: User Preference Filter (Checks user opt-in status)
         │ Step 2: Rate Limiter (Max 5 push alerts / user / hour)
         │ Step 3: Localized Template Formatter
         │ Step 4: Dispatcher
         ├── Push   ──> Apple APNS / Google FCM (HTTP/2 persistent socket)
         ├── SMS    ──> Twilio / MessageBird (with auto-fallback to AWS SNS)
         └── Email  ──> SendGrid / Amazon SES
         │
         ├── Success ──> Log to ClickHouse Analytics
         └── Failure (5xx) ──> Enqueue to Delayed Retry Queue -> Dead Letter Queue (DLQ)

=============================================================================
Step 5: Deep dive on key components (15 min)
=============================================================================
* 1. Priority-Partitioned Queues:
  - If a company sends 10,000,000 promotional marketing emails, single-queue architectures cause critical OTP login codes to sit in the queue for 45 minutes!
  - Isolating Kafka into dedicated high-priority OTP topics guarantees login codes skip bulk marketing traffic entirely.
* 2. Retry Logic & Dead Letter Queues (DLQ):
  - On third-party network failure: retry with Exponential Backoff + Full Jitter (1s, 5s, 30s, 5m).
  - After 4 failed attempts, push message to Dead Letter Queue (DLQ) for human SRE investigation without blocking the queue.

=============================================================================
Step 6: Bottlenecks, trade-offs, wrap-up (5 min)
=============================================================================
* Third-Party Vendor Outages:
  - If Twilio suffers an outage, implement automated Circuit Breaker pattern with multi-vendor fallback to AWS SNS.
* Quiet Hours (Do Not Disturb):
  - Inspect user's timezone; if current local time is 11 PM - 7 AM and priority is non-critical, delay enqueueing until 8:00 AM local time.`,
              explanation: "Separating Kafka topics into high-priority OTP and low-priority marketing prevents bulk promotional campaigns from delaying critical two-factor authentication codes."
            },
            tradeoffs: "Third-party vendors (Twilio/SendGrid) have strict egress rate limits and outage risks. Multi-vendor routing with automated circuit-breaker failover is required for high availability.",
            followUpQuestions: [
              {
                question: "How do you prevent sending duplicate push notifications when a worker crashes mid-delivery?",
                answer: "Maintain delivery state in Redis or database keyed by a unique notification UUID; before dispatching to APNS/Twilio, verify state != 'SENT' and record provider message ID."
              },
              {
                question: "How do you handle 'Do Not Disturb' quiet hours (e.g. 10 PM - 8 AM)?",
                answer: "Inspect the recipient's timezone from their profile. If current time is within quiet hours and priority is non-critical, delay enqueueing by setting execution time to 8:00 AM local time via a delayed task queue."
              }
            ],
            usedInProduction: "Uber Push Notification Platform, Netflix Notification Service (Zuul/Hermes), Airbnb Delivery Service.",
            relatedTopics: ["APNS / FCM HTTP/2", "Priority Queues", "Dead Letter Queues", "Idempotent Webhooks"]
          }
        }
      ]
    }
  ]
};
