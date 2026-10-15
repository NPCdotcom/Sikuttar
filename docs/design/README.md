# Design

H0–H5 design docs. See [PROJECT_LIFECYCLE.md](../PROJECT_LIFECYCLE.md).

| Level | Path | Status |
|-------|------|--------|
| H0 | [product/charter.md](product/charter.md) | agreed |
| H1 overview | [elements/failure-share-h1.md](elements/failure-share-h1.md) | agreed |
| H1 S1 | [failure-story](elements/failure-story.md) · [feed](elements/feed.md) · [anonymous-display](elements/anonymous-display.md) | agreed |
| H1 S2 | [limited-reaction](elements/limited-reaction.md) · [bad-signal](elements/bad-signal.md) | agreed |
| H2 overview | [systems/failure-share-h2.md](systems/failure-share-h2.md) | agreed |
| H2 SYS1/SYS2 | [story-posting](systems/story-posting.md) · [feed-reading](systems/feed-reading.md) | agreed |
| H2 SYS3 | [reaction-signaling](systems/reaction-signaling.md) | agreed |
| H3 overview | [frameworks/failure-share-h3.md](frameworks/failure-share-h3.md) | agreed |
| H3 FW1–FW3 | [react-ui](frameworks/react-ui.md) · [hono-api](frameworks/hono-api.md) · [cloudflare-platform](frameworks/cloudflare-platform.md) | agreed |
| H4 programs | [story-posting-pipeline](programs/story-posting-pipeline.md) · [feed-reading-pipeline](programs/feed-reading-pipeline.md) · [browser-shell](programs/browser-shell.md) · [reaction-pipeline](programs/reaction-pipeline.md) | agreed |

**Constraint**: P3+ design follows charter recognition units (§8), build order, and §7 stance — stack is means, not product taxonomy.

**P4 plans**: [.agents/plans/README.md](../../.agents/plans/README.md)  
**P6 reviews**: [s1-mvp-p6](../reviews/s1-mvp-p6.md)（conditional）· [s2-reactions-p6](../reviews/s2-reactions-p6.md)（**Go**）
