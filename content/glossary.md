# 术语表（Glossary）

> 全书一词一义。新增术语先查本表，已存在则沿用；冲突立即消歧并全文统一。维护规范见 `openspec/specs/glossary/`。

| 术语 | 英文 | 定义 |
|------|------|------|
| 智能体框架 | harness | 把大模型变成 agent 的那层框架：消息循环 + 工具调用 + 上下文管理 + 沙箱 + 编排等。本义「马具/缰绳」。 |
| 智能体 | agent | 能自主执行任务的大模型系统（模型 + harness + 工具）。 |
| 大语言模型 | LLM | 只会生成文字的基础模型，本身不执行动作。 |
| 消息循环 | message loop | harness 的核心循环：调用模型 → 执行工具 → 回填结果 → 判断结束。 |
| 工具调用 | tool call / function calling | 模型发出「要调用某工具」的信号，harness 真正执行并回填结果。 |
| 上下文 | context | 喂给模型的全部内容：系统提示 + 历史消息 + 工具结果。 |
| 上下文窗口 | context window | 模型一次能处理的最大 token 数，超出需压缩。 |
| 压缩 | compaction | 上下文超出窗口时，把历史压缩成摘要以腾出空间。 |
| 沙箱 | sandbox | 隔离的执行环境，限制 agent 的破坏性操作（改文件/跑命令）。 |
| 子智能体 | subagent | 主 agent 派生出来、执行独立子任务的 agent。 |
| 上下文工程 | context engineering | 系统性地设计「往模型里塞什么、什么时候压缩」的工程方法。 |
| 上下文腐烂 | context rot | 上下文窗口塞得越满，模型准确回忆其中信息的能力越下降。 |
| 令牌 | token | 模型处理文本的最小单位，窗口大小以 token 计。 |
| 提示缓存 | prompt cache | 模型 API 对重复的消息前缀做缓存，命中后省时省钱。压缩时需「替换而非删除」以保护它。 |
| 引导消息 | steering message | 用户或系统在 agent 运行中途插入的新消息，会打断当前循环。 |
| 首令牌时间 | TTFT | Time To First Token，模型开始输出第一个 token 的延迟，影响「响应感」。 |
| 模型上下文协议 | MCP | Model Context Protocol，连接外部工具/数据源的标准协议。 |
| 链路追踪 | trace | 记录一次 agent 请求的完整调用链（循环、工具、token 用量），用于定位问题。 |
| 可观测性 | telemetry / observability | 运行时打点（耗时、token、工具调用），用于定位「哪一环慢/错」。 |
