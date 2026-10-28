# Redis Resources

所有课程的「知识」必须来自下面的一手来源，不靠模型记忆下结论。链接均在 **2026-09-29 实际抓取核实**；标注「未能核实」的条目请勿直接引用。

## Knowledge（一手来源）

### 官方文档（本课程主线）

- [Redis 官方文档总入口](https://redis.io/docs/latest/)
  唯一权威来源，命令语义一律以它为准。**注意：2026-09-29 核实，redis.io 没有官方中文版**，所有中文资料都属二手，只能当参考。
- [Redis data types 总览](https://redis.io/docs/latest/develop/data-types/)
  首句即 **"Redis is a data structure server."**；列出全部原生类型：Strings（含 Bitmaps / Bitfields）、Arrays、Geospatial indexes、Hashes、JSON、Lists、Probabilistic、Sets、Sorted sets、Streams、Time series、Vector sets。用于：选型前确认「我要的结构到底存不存在」。
- [Hashes](https://redis.io/docs/latest/develop/data-types/hashes/)
  Hash 命令总览（28 个命令）。**字段级过期自 v7.4.0 起提供**：`HEXPIRE` / `HPEXPIRE` / `HEXPIREAT` / `HEXPIRETIME` / `HTTL` / `HPERSIST`（`HSETEX` / `HGETEX` 可顺带设过期）。用于：Hash 建模与字段级 TTL。
- [Strings](https://redis.io/docs/latest/develop/data-types/strings/)
  含 Bitmap / Bitfield 子章节。用于：计数、位图、以及分布式锁里的 `SET NX`。
- [SET 命令](https://redis.io/docs/latest/commands/set/)
  语法 `SET key value [NX|XX] [GET] [EX|PX|EXAT|PXAT|KEEPTTL]`。`KEEPTTL` 官方释义：*"Retain the time to live associated with the key."*。**默认会清除该 key 原有 TTL**。用于：写值同时给 TTL，或刻意保留原 TTL。
- [EXPIRE 命令](https://redis.io/docs/latest/commands/expire/)
  **本课程所有 TTL 结论的出处。** 关键原文：*"The timeout will only be cleared by commands that delete or overwrite the contents of the key, including DEL, SET, GETSET and all the \*STORE commands. This means that all the operations that conceptually alter the value stored at the key without replacing it with a new one will leave the timeout untouched. For instance, incrementing the value of a key with INCR, pushing a new value into a list with LPUSH, or altering the field value of a hash with HSET are all operations that will leave the timeout untouched."* 另有 `NX|XX|GT|LT` 选项；非正超时直接删除 key。用于：判断一条写命令会不会毁掉 TTL。
- [TTL 命令](https://redis.io/docs/latest/commands/ttl/)
  返回剩余秒数；`-1` = 存在但无 TTL，`-2` = key 不存在。用于：排查「缓存变成了永久 key」。
- [PERSIST 命令](https://redis.io/docs/latest/commands/persist/)
  把 key 变回永不过期。用于：TTL 清除/恢复。
- [KEYS 命令](https://redis.io/docs/latest/commands/keys/)
  官方警告原文：*"Use extreme care when using this command in production environments. It may ruin performance… Don't use KEYS in your regular application code."*（O(N)，官方举例 100 万 key ≈ 40 ms，且会阻塞单线程）。用于：**反例**，说明为什么生产要改用 SCAN。
- [SCAN 命令](https://redis.io/docs/latest/commands/scan/)
  语法 `SCAN cursor [MATCH pattern] [COUNT count] [TYPE type]`。保证仅对**完整迭代**成立：**元素可能重复返回**（调用方需幂等）、单次返回数量不保证、可能返回 0 个、游标回到 0 才算结束；`COUNT` 默认 10 且只是提示。用于：遍历键空间、清理脏数据、替代 `KEYS`。
- [Key eviction（内存淘汰）](https://redis.io/docs/latest/develop/reference/eviction/)
  `maxmemory` 语义（默认 0 = 不限制；复制/AOF 缓冲区**不计入** maxmemory）、`maxmemory-policy` 全部取值：`noeviction`、`allkeys-lru`、`allkeys-lrm`（least recently **modified**，较新）、`allkeys-lfu`、`allkeys-random`、`volatile-lru` / `volatile-lrm` / `volatile-lfu` / `volatile-random` / `volatile-ttl`；`volatile-*` 在没有任何带 TTL 的 key 时退化为 `noeviction`。排查用 `INFO stats` 的 `keyspace_hits` / `keyspace_misses` / `evicted_keys` / `expired_keys`。用于：「内存撑爆」类事故与容量规划。
- [持久化 RDB / AOF](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
  `appendfsync always`（*"Very very slow, very safe"*）/ `everysec`（默认，*"you may lose 1 second of data"*）/ `no`（*"The faster and less safe method"*）。用于：回答「机器重启后数据还在不在、会丢多少」。
- [分布式锁（官方页面）](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/)
  单实例范式 `SET resource_name my_random_value NX PX 30000` + Lua 校验随机值后再 DEL；官方主张 Redlock（N=5 个独立 master，多数派成功且总耗时小于锁有效期）。**该页完全未提 Kleppmann 的争议**——必须与下一条对照阅读。
- [Martin Kleppmann: How to do distributed locking (2016)](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
  核心论点：基于超时的锁（lease）**不可靠**，因为进程暂停（GC、网络延迟）恰好常发生在「检查锁是否过期」与「写入」之间。解法是 **fencing token**——锁服务发单调递增号，存储端拒绝 token 回退的写。原文明确指出 Redlock *"fails to generate fencing tokens"*。用于：分布式锁的安全边界。

### 缓存模式与一致性（后续课程主线）

- [AWS Builders' Library: Caching challenges and strategies](https://aws.amazon.com/builders-library/caching-challenges-and-strategies/)
  「缓存成瘾」风险（缓存一失效就打爆下游）、**soft TTL + hard TTL 双层 TTL**（下游不可用时先用旧值撑到 hard TTL）、负缓存单独 TTL、出错时回退旧值。**注意：该文正文并未讲 TTL 抖动（jitter），别按记忆引用。** 用于：缓存过期策略的设计。
- [Facebook《Scaling Memcache at Facebook》(NSDI '13) 官方 PDF](https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf)
  §3.2.1 **Leases**：miss 时返回 lease-id；delete / invalidate 使该 key 的 lease 失效；持有失效 lease 的 set 会被服务器拒绝，从而避免旧值被写回。同时解决 **stale sets** 与 **thundering herds**（缓存击穿）。[配套 slides](https://atc.usenix.org/sites/default/files/conference/protected-files/nishtala_nsdi13_slides.pdf)。用于：一致性问题的工业级解法。

## Wisdom（社区）

- [Redis 官方 Discord](https://discord.gg/redis)（[说明页](https://redis.io/tutorials/community/discord/)）
  有实时 help 频道，适合贴具体命令与报错、拿到即时反馈。
- [Redis 官方论坛](https://forum.redis.io/)
  社区版与生产问题讨论；活跃度一般，更适合追问「这个设计取舍对不对」。
- [Redis 中国用户组 redis.cn](http://www.redis.cn/)
  中文资料与论坛。**内容明显偏旧**（首页仍标 6.0.6），当参考、不当权威。
- 未能核实：[r/redis](https://www.reddit.com/r/redis/) 在 2026-09-29 抓取被 Reddit 拦截，暂不推荐。

## 书（可选延伸）

- [《Redis 设计与实现》黄健宏 —— 书稿开源可免费在线读](https://github.com/huangzworks/redisbook)
  讲内部实现（SDS、跳表、事件循环、复制）。用于：原理级深入（本课程 Out of scope）。**注意：配套站 redisbook.com 已失效且被博彩站占用，不要访问。**
- 《Redis 深度历险》钱文品、《Redis in Action》Josiah L. Carlson —— 均未找到作者官方免费全文站点，2026-09-29 未核实，暂不作引用依据。

## Gaps（待补）

- **中文一手来源缺口明显**：官方无中文版，redis.cn / redisfans 等社区版内容偏旧。后续课程继续以英文官方文档为准，中文只用于表述。
- 缓存一致性的工程方案（延迟双删、订阅 binlog / canal 失效、双写顺序）目前只找到二手博客，**缺一手出处**——排到该课时专门去核实。
- 分布式锁缺 **antirez 对 Kleppmann 的回应原文**链接（文章确实存在，但 URL 未核实）。
- 尚未找到可参与的「Redis 生产事故复盘」类中文社区活动。