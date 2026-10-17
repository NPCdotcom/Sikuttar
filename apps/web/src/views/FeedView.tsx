import { StoryCard } from "../components/StoryCard";
import type { PublicStory, ReactionKind } from "../types";

type Props = {
  items: PublicStory[];
  recommendedTags: string[];
  selectedTag: string | null;
  reactingId: string | null;
  onFilterTag: (tag: string | null) => void;
  onReact: (storyId: string, kind: ReactionKind) => void;
  onOpenDetail: (storyId: string) => void;
};

export function FeedView({
  items,
  recommendedTags,
  selectedTag,
  reactingId,
  onFilterTag,
  onReact,
  onOpenDetail,
}: Props) {
  return (
    <section className="view feed" aria-label="失敗談フィード">
      <h2>フィード</h2>
      <div className="tag-options" role="group" aria-label="タグで絞り込み">
        <button
          type="button"
          className={selectedTag === null ? "tag selected" : "tag"}
          onClick={() => onFilterTag(null)}
          aria-pressed={selectedTag === null}
        >
          すべて
        </button>
        {recommendedTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={selectedTag === tag ? "tag selected" : "tag"}
            onClick={() => onFilterTag(tag)}
            aria-pressed={selectedTag === tag}
          >
            {tag}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="empty">
          {selectedTag
            ? `「${selectedTag}」の投稿はまだありません。`
            : "まだ投稿がありません。"}
        </p>
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
