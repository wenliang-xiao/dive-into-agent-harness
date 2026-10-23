import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  wrapper: ({ children }) => (
    <article className="prose-chapter min-w-0">{children}</article>
  ),
  a: ({ href = "", children, ...props }) => (
    <a href={href} target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
  pre: ({ children }) => (
    <pre className="max-w-full overflow-x-auto">{children}</pre>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
