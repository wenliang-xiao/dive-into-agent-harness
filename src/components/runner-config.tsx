"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type RunnerConfig = {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
};

const STORAGE_KEY = "d2a-runner-config";

function loadConfig(): RunnerConfig {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

type Ctx = {
  config: RunnerConfig;
  update: (k: keyof RunnerConfig, v: string) => void;
  configured: boolean;
};

const ConfigContext = createContext<Ctx>({
  config: {},
  update: () => {},
  configured: false,
});

/** 全局配置 Provider：API key / baseUrl / model 全站共享，存 localStorage */
export function RunnerConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<RunnerConfig>(() => loadConfig());

  const update = (k: keyof RunnerConfig, v: string) => {
    setConfig((prev) => {
      const next = { ...prev, [k]: v };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const configured = Boolean(config.apiKey);

  return (
    <ConfigContext.Provider value={{ config, update, configured }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useRunnerConfig() {
  return useContext(ConfigContext);
}

/** 全局配置对话框：从顶部导航「⚙️ API」打开 */
export function RunnerConfigButton() {
  const { config, update, configured } = useRunnerConfig();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`rounded-md border px-2.5 py-1 text-sm transition-colors ${
          configured
            ? "border-ok text-ok"
            : "border-line text-muted hover:text-ink"
        }`}
        title="配置 API（全局）"
      >
        {configured ? "✓ API" : "⚙️ API"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-line bg-paper p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">全局 API 配置</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-ink"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-xs text-muted">
              配置一次，全书所有「实验」执行器共用。只存你本地浏览器，仅用于运行实验。
            </p>

            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted">Base URL</span>
                <input
                  value={config.baseUrl ?? ""}
                  onChange={(e) => update("baseUrl", e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="rounded-md border border-line bg-bg px-2 py-1.5"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted">模型</span>
                <input
                  value={config.model ?? ""}
                  onChange={(e) => update("model", e.target.value)}
                  placeholder="gpt-4o"
                  className="rounded-md border border-line bg-bg px-2 py-1.5"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted">API Key</span>
                <input
                  type="password"
                  value={config.apiKey ?? ""}
                  onChange={(e) => update("apiKey", e.target.value)}
                  placeholder="sk-..."
                  className="rounded-md border border-line bg-bg px-2 py-1.5"
                />
              </label>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-md bg-accent px-4 py-2 text-sm text-white hover:opacity-90"
            >
              完成
            </button>
          </div>
        </div>
      )}
    </>
  );
}
