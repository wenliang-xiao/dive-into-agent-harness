export function DiagramFrame({ src, title }: { src: string; title: string }) {
  return (
    <figure className="my-6">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="h-[520px] w-full rounded-lg border border-line bg-paper"
      />
      <figcaption className="mt-2 text-center text-sm text-muted">
        {title}
      </figcaption>
    </figure>
  );
}
