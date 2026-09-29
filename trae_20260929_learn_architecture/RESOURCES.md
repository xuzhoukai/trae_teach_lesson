# 后端分布式架构设计 Resources

所有课程的「知识」必须来自下面的一手来源，不靠模型记忆下结论。链接均在 2026-09-29 核实可访问。

## Knowledge（一手来源）

### 架构方法与质量属性（本课程主线）

- [SEI: Reasoning About Software Quality Attributes（质量属性场景 / 通用场景）](https://insights.sei.cmu.edu/library/reasoning-about-software-quality-attributes/)
  卡内基梅隆软件工程研究所（SEI）。质量属性场景的六要素定义、以及性能/可用性/可修改性/安全/易用性的「通用场景」模板。**第 1 课及其后续所有场景化表述都以它为准。**
- [SEI: Architecture Tradeoff Analysis Method (ATAM) Collection](https://insights.sei.cmu.edu/library/architecture-tradeoff-analysis-method-collection/)
  ATAM 的九步流程与产出物（效用树、风险、非风险、敏感点、权衡点）。用于：怎么组织一场架构评审、怎么发现取舍。
- [SEI: The Architecture Tradeoff Analysis Method（1998 原始技术报告 PDF，CMU/SEI-98-TR-008）](https://insights.sei.cmu.edu/documents/1186/1998_005_001_16646.pdf)
  ATAM 的原始论文。用于：追溯概念出处，写方案时引用「为什么这么说」。
- [Michael Nygard: Documenting Architecture Decisions（ADR 原始文章，2011）](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
  ADR 的五个部分（标题/上下文/决策/状态/后果）与「为什么要写」的原始论证。用于：每个设计练习的决策记录格式。
- [ISO/IEC 25010:2023 — 产品质量模型（九个质量特性）](https://www.iso.org/obp/ui/en/#iso:std:iso-iec:25010:ed-2:v1:en)
  国际标准层面的质量特性清单（含 2023 版新增的 Safety，并把 Usability/Portability 改为 Interaction capability/Flexibility）。用于：避免自己的质量属性词汇表跑偏。

### 分布式与微服务

- [Martin Fowler & James Lewis: Microservices](https://martinfowler.com/articles/microservices.html)
  微服务九大特征的原始定义（含 Design for failure、Decentralized Data Management）。用于：判断「要不要拆」「拆的代价是什么」。
- [microservices.io: A pattern language for microservices（Chris Richardson）](https://microservices.io/patterns/index.html)
  拆分、协作、数据一致性、部署、可观测性等模式的索引；**有官方中文版：[中文翻译](https://microservices.io/patterns/cn/index.html)**。用于：写方案时找模式名与权衡。
- [Designing Data-Intensive Applications（DDIA）官方网站](https://dataintensive.net/)
  Martin Kleppmann。可靠、可扩展、可维护三要素，以及一致性/共识/复制/分区的取舍。用于：存储与数据一致性决策。中文版《数据密集型应用系统设计》。

### 容错与降级（第 4 课主线）

- [AWS Builders' Library: Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
  Marc Brooker（AWS 资深首席工程师）。**第 4 课主读。**超时必须有且如何取值（按误超时率 0.1% 取下游 p99.9）、重试是「自私的」、逐层重试的相乘放大（5 层 × 3 次 ≈ 243 倍）、只在栈的单一位置重试、退避与抖动、以及熔断的局限（模态行为难测、可能延长恢复）。用于：容错四工具的取值与取舍。
- [AWS Builders' Library: Avoiding fallback in distributed systems](https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/)
  为什么 AWS「几乎不做回退」：回退难测试、自身会失败、常把局部故障放大为全局故障（2001 年缓存回退直连数据库拖垮全站的真实事故）、潜伏缺陷；替代主张是「把主路径做可靠 + 让调用方重试 + 提前推数据」。用于：第 4 课「降级 vs 硬失败」一节的判据。
- [AWS Architecture Blog: Exponential Backoff And Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
  Marc Brooker。退避与抖动的模拟数据，对比 Full / Equal / Decorrelated 三种抖动实现，说明「只退避不加抖动仍会撞车」。用于：抖动算法的细节。
- [Azure Architecture Center: Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry)
  重试的三种策略（取消 / 立即重试 / 延迟重试）；问题清单（性能影响、幂等、异常类型、事务一致性）与「下层 fail fast、只在理解完整上下文处重试」。用于：重试的落地检查表。
- [Azure Architecture Center: Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)
  闭合 / 断开 / 半开三态状态机、半开如何避免恢复期被洪峰打垮、与重试的组合方式、误用场景。用于：熔断的落地与取舍。
- [Azure Architecture Center: Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead)
  按依赖/消费者切分资源池（含单元化架构 cell-based）、连接池隔离、与重试/熔断/限流的组合、Resilience4j 与 Polly。用于：舱壁的落地。

### 云架构最佳实践（作为可引用的检查表）

- [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
  六大支柱（卓越运营、安全、可靠性、性能效率、成本优化、可持续性）的官方文档。用于：给自己方案做一轮检查。
- [Microsoft Azure Architecture Center: Design principles](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/)
  自愈设计、冗余、最小化协调、向外扩展、围绕限制分区等原则，并给出失败模式分析（FMA）入口。用于：容错与扩展设计的对照清单。

## Wisdom（社区）

- [r/softwarearchitecture（Reddit）](https://www.reddit.com/r/softwarearchitecture/)
  架构设计讨论与方案互评，含大量真实生产案例复盘。用于：拿自己的设计去被质疑。
- [Software Engineering Stack Exchange](https://softwareengineering.stackexchange.com/)
  有严格质量门槛的问答社区，适合问「这个取舍为什么这么定」这类问题。用于：具体决策的第二意见。
- [InfoQ 架构师专区](https://www.infoq.cn/topic/architecture)
  中文技术会议演讲与案例复盘（含国内外大型系统架构演进）。用于：中文语境下的落地经验。

## Gaps（待补）

- 尚未找到**中文、系统化、且免费可读**的架构设计教材（李运华《从0开始学架构》等在付费平台，未核实可引用性）——后续课程先以 SEI + 官方文档 + 英文书籍为主。
- 分布式一致性专项（CAP/PACELC、共识算法）的一手论文链接尚未核实，等排到相关课程时再补。
- 尚未为「架构评审实战」找到可参与的线上活动（如架构师训练营、开源项目的设计 RFC 讨论）。