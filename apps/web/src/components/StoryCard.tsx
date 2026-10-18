import { formatHashtag } from "../formatTag";
import type { PublicStory, ReactionKind } from "../types";

type Props = {
  story: PublicStory;
  clamp?: boolean;
  reacting?: boolean;
  showDetailLink?: boolean;
  onReact?: (kind: ReactionKind) => void;
  onOpenDetail?: () => void;
  /** Twitter-like: open search / hashtag results (not an in-feed chip bar). */
  onHashtag?: (tag: string) => void;
  bookmarked?: boolean;
  onBookmark?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
};

export function StoryCard({
  story,
  clamp = false,
  reacting = false,
  showDetailLink = false,
  onReact,
  onOpenDetail,
  onHashtag,
  bookmarked = false,
  onBookmark,
  onDelete,
  deleting = false,
}: Props) {
  return (
    <article className="story-card">
      <p className={clamp ? "story-body clamp" : "story-body"}>{story.body}</p>
      {story.situation ? <p className="meta">状況: {story.situation}</p> : null}
      {story.cause ? <p className="meta">原因: {story.cause}</p> : null}
      {story.tags.length > 0 ? (
        <ul className="story-tags" aria-label="ハッシュタグ">
          {story.tags.map((tag) => (
            <li key={tag}>
              {onHashtag ? (
                <button
                  type="button"
                  className="tag tag-display tag-chip"
                  onClick={() => onHashtag(tag)}
                >
                  {formatHashtag(tag)}
                </button>
              ) : (
                <span className="tag tag-display">{formatHashtag(tag)}</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      <time dateTime={story.createdAt}>
        {new Date(story.createdAt).toLocaleString("ja-JP")}
      </time>
      {showDetailLink && onOpenDetail ? (
        <button
          type="button"
          className="detail-link story-card-detail"
          onClick={onOpenDetail}
        >
          詳細を見る
        </button>
      ) : null}
      {onBookmark || onReact || onDelete ? (
        <div className="card-actions">
          {onBookmark ? (
            <button
              type="button"
              className="detail-link"
              onClick={onBookmark}
              aria-pressed={bookmarked}
            >
              {bookmarked ? "保存済み" : "保存"}
            </button>
          ) : null}
          {onReact ? (
            <div className="reactions" aria-label="限定リアクション">
              <button
                type="button"
                disabled={reacting}
                onClick={() => onReact("wakaru")}
              >
                わかる · {story.counts.wakaru}
              </button>
              <button
                type="button"
                disabled={reacting}
                onClick={() => onReact("reference")}
              >
                参考になる · {story.counts.reference}
              </button>
            </div>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              className="danger-link"
              disabled={deleting}
              onClick={onDelete}
            >
              {deleting ? "削除中…" : "削除"}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
