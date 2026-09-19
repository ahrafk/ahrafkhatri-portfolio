import { siGithub } from "simple-icons";
import { cn } from "@/lib/cn";

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", className)} fill="currentColor" aria-hidden>
      <path d={siGithub.path} />
    </svg>
  );
}

export function LinkedInMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid size-5 place-items-center rounded-[5px] border-[1.5px] border-current font-sans text-[10px] font-bold leading-none", className)}
    >
      in
    </span>
  );
}
