import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  wrapper: ({ children }) => (
    <article className="prose-chapter">{children}</article>
  ),
  a: ({ href = "", children, ...props }) => (
    <a href={href} target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
