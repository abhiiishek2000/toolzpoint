"use client";
import { useEffect } from "react";
import { useLocalList } from "@/lib/useLocalList";
import { writeList, readList } from "@/lib/storage";
import { track } from "@/lib/analytics";
import { Icon } from "./Icon";
export function markUsed(slug: string) {
  writeList(
    "recents",
    [slug, ...readList("recents").filter((s) => s !== slug)].slice(0, 20),
  );
  track("tool_run_success", { toolSlug: slug });
}
export function UtilityFrame({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const favorite = useLocalList("favorites").includes(slug);
  useEffect(() => {
    track("tool_view", { toolSlug: slug });
  }, [slug]);
  return (
    <section
      className="workspace creative-workspace"
      aria-label="Tool workspace"
    >
      <div className="workspace-top">
        <span>
          <Icon name="ShieldCheck" size={16} />
          On your device. Off the cloud.
        </span>
        <button
          className={`text-button save-button ${favorite ? "saved" : ""}`}
          aria-pressed={favorite}
          onClick={() =>
            writeList(
              "favorites",
              favorite
                ? readList("favorites").filter((s) => s !== slug)
                : [...readList("favorites"), slug],
            )
          }
        >
          <Icon name="Star" size={17} />
          {favorite ? "Saved" : "Save tool"}
        </button>
      </div>
      {children}
      <div className="workspace-bottom">
        <Icon name="ShieldCheck" size={16} />
        Files and results stay in your browser. No uploads or account.
      </div>
    </section>
  );
}
