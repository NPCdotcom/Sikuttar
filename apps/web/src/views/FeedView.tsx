import { useState } from "react";
import { StoryCard } from "../components/StoryCard";
import type { PublicStory, ReactionKind } from "../types";

type Props = {
  items: PublicStory[];
  reactingId: string | null;
  onReact: (storyId: string, kind: ReactionKind) => void;
  onOpenDetail: (storyId: string) => void;
};

const tags = [
  "デプロイ",
  "レビュー",
  "コミュニケーション",
  "見積もり",
  "オンボーディング",
  "インシデント",
  "テスト",
];

export function FeedView({ items, reactingId, onReact, onOpenDetail }: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const filteredItems = selectedTag
    ? items.filter((item) => item.tags?.includes(selectedTag))
    : items;
  return (
    <section className="view feed" aria-label="失敗談フィード">
      <h2>フィード</h2>
      <div className="tag-options">
        <button
          type="button"
          className={selectedTag === null ? "tag selected" : "tag"}
          onClick={() => setSelectedTag(null)}
        >
          すべて
        </button>

        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={selectedTag === tag ? "tag selected" : "tag"}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <p className="empty">まだ投稿がありません。</p>
      ) : (
        <ul className="card-list">
          {filteredItems.map((item) => (
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
