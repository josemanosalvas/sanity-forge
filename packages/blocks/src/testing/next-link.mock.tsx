import type { ComponentProps } from "react";

const Link = ({
  href,
  children,
  ...props
}: ComponentProps<"a"> & { href?: string }) => (
  <a href={href} {...props}>
    {children}
  </a>
);

export default Link;
