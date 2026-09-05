export const BlockEyebrow = ({
  eyebrow,
}: Readonly<{ eyebrow?: string | null }>) => {
  if (!eyebrow) {
    return null;
  }

  return (
    <span className="border-border bg-background text-muted-foreground inline-flex w-fit items-center self-start justify-self-start border px-3 py-1.5 font-mono text-sm leading-[18px] tracking-[0.28px] uppercase">
      {eyebrow}
    </span>
  );
};
