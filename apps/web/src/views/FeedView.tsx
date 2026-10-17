import { StoryCard } from "../components/StoryCard";
import type { PublicStory, ReactionKind } from "../types";

type Props = {
  items: PublicStory[];
  reactingId: string | null;
  onReact: (storyId: string, kind: ReactionKind) => void;
  onOpenDetail: (storyId: string) => void;
};

export function FeedView({ items, reactingId, onReact, onOpenDetail }: Props) {
  return (
    <section className="view feed" aria-label="失敗談フィード">
      <h2>フィード</h2>
      {items.length === 0 ? (
        <p className="empty">まだ投稿がありません。</p>
      ) : (
        <ul className="card-list">
          {items.map((item) => (
            <li key={item.id}>
              <StoryCard
                story={item}
                clamp
                reacting={reactingId !== null}
                showDetailLink
                onReact={(kind) => onReact(item.id, kind)}
                onOpenDetail={() => onOpenDetail(item.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
