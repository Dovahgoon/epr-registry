import Link from "next/link";

type Props = {
  href: string;
  title: string;
  children?: React.ReactNode; // description
  className?: string;
};

export default function CardLink({ href, title, children, className }: Props) {
  return (
    <Link
      href={href}
      className={
        "group block rounded-2xl border border-white/10 bg-white/[0.02] " +
        "p-5 shadow-sm hover:shadow-lg transition " +
        "hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
        "relative overflow-hidden " + (className ?? "")
      }
    >
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-fuchsia-500 opacity-60 group-hover:opacity-100" />
      <h3
        className={[
          "text-xl md:text-2xl font-semibold mb-1",
          "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600",
          "bg-clip-text text-transparent",
          "tracking-tight"
        ].join(" ")}
      >
        {title}
      </h3>
      {children ? <p className="text-sm text-white/70">{children}</p> : null}
    </Link>
  );
}
