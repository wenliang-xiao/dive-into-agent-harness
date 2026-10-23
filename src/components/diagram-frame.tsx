export function DiagramFrame({ src, title }: { src: string; title: string }) {
  return (
    <div className="my-6">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="h-[520px] w-full rounded-lg border border-line bg-paper"
      />
      <div className="mt-2 text-center text-sm text-muted">{title}</div>
    </div>
  );
}
