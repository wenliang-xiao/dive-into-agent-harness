# mini-harness

《动手学智能体框架》配套的**从零实现**代码库。每章对应一个 `step-XX`，从零构建一个 agent harness 的某个机制。**零依赖**（只用 Node 原生 `fetch` 和原生 TypeScript 支持），你能看清每一行。

## 为什么要有它

这是对标 D2L「从零实现」的那条腿——**读者跟着写、能跑起来、能改**。另一条腿是「简洁实现」（真实 harness 源码精读，见每章「源码层」）。

## 环境要求

- Node.js ≥ 22（原生支持直接运行 TypeScript）

## 快速开始

```bash
cd mini-harness
cp .env.example .env   # 填入你的 API key
npm run step-01        # 跑第一章：核心循环
```

任何 OpenAI 兼容接口都能用（改 `OPENAI_BASE_URL` / `OPENAI_MODEL` 即可）。

## 目录

```
src/
  step-01-loop/   # 第 1 章 核心循环：一个 LLM + 一个 while 循环
  step-02-tools/  # 第 2 章 工具调用（待写）
  ...             # 每章一个 step
```

## 设计原则

1. **零依赖**：不引任何 LLM SDK，`fetch` 直接调 API，你看到的是完整协议。
2. **每章只加一个能力**：step-01 只有循环，step-02 才加工具声明/校验，层层递进。
3. **可实验**：改参数（模型、工具、系统提示）观察 agent 行为变化，这就是每章「实验」小节的基础。
