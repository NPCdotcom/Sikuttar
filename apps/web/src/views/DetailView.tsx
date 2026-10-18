import { StoryCard } from "../components/StoryCard";
import type { PublicStory, ReactionKind } from "../types";

type Props = {
  story: PublicStory;
  related: PublicStory[] | null;
  relatedLoading: boolean;
  reacting: boolean;
  bookmarked: boolean;
  onBack: () => void;
  onReact: (kind: ReactionKind) => void;
  onBookmark: () => void;
  onOpenRelated: (storyId: string) => void;
  onAskSecretary: () => void;
  onHashtag: (tag: string) => void;
  onDelete?: () => void;
  deleting?: boolean;
};

export function DetailView({
  story,
  related,
  relatedLoading,
  reacting,
  bookmarked,
  onBack,
  onReact,
  onBookmark,
  onOpenRelated,
  onAskSecretary,
  onHashtag,
  onDelete,
  deleting = false,
}: Props) {
  return (
    <section className="view detail" aria-label="失敗談の詳細">
      <button type="button" className="back-link" onClick={onBack}>
        一覧へ戻る
      </button>
      <h2>詳細</h2>
      <StoryCard
        story={story}
        reacting={reacting}
        bookmarked={bookmarked}
        onReact={onReact}
        onBookmark={onBookmark}
        onHashtag={onHashtag}
        onDelete={onDelete}
        deleting={deleting}
      />

      <p className="detail-actions">
        <button type="button" className="secondary-btn" onClick={onAskSecretary}>
          質問する
        </button>
      </p>

      <div className="related-block">
        <h3>関連する失敗談</h3>
        {relatedLoading ? <p className="empty">関連を取得中…</p> : null}
        {!relatedLoading && related && related.length === 0 ? (
          <p className="empty">関連する投稿は見つかりませんでした。</p>
        ) : null}
        {!relatedLoading && related && related.length > 0 ? (
          <ul className="card-list related-list">
            {related.map((item) => (
              <li key={item.id}>
                <StoryCard
                  story={item}
                  clamp
                  showDetailLink
                  onOpenDetail={() => onOpenRelated(item.id)}
                  onHashtag={onHashtag}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
