# Anti-Slop Checklist

Run finished work against this list before calling it done. Each item is a specific, recognizable tell of unconsidered/AI-templated motion — not a vague aesthetic judgment.

## The tells

- [ ] **Everything fades in on load.** If every section, card, and heading uses the same `opacity: 0 → 1` on scroll or mount, it reads as a template default, not a choice. At most one entrance treatment should be the "signature" one; the rest should be quieter or instant.
- [ ] **Every card scales 1.05 on hover.** This is the single most recognizable AI-generated hover state because it requires no thought about what the card actually is. Vary the treatment by content, or use elevation/shadow instead of scale.
- [ ] **Uniform easing everywhere.** If every transition in the file uses the same `ease-in-out` (often the framework or browser default), it means easing was never actually decided — it's what was left when nobody chose. Different motion jobs need different curves (see `timing-and-easing.md`).
- [ ] **Decorative motion with no relationship to content.** Floating gradient blobs, ambient particles, animated grid backgrounds — check whether removing it changes anything about what the user understands. If not, it's filler, and filler is the fastest way to look generic, because it's the same filler on every AI-generated landing page right now.
- [ ] **Bounce/spring applied reflexively.** An elastic overshoot on a professional dashboard or B2B tool reads as a mismatch with the product's actual tone. Spring easing should be a deliberate brand choice, not the default because it's "fun."
- [ ] **Character-by-character or word-by-word hero text reveal.** This specific pattern has become extremely recognizable as an AI-generated landing page signature in 2025–2026. Use it only if you have a specific reason it serves this particular headline — not as a default hero treatment.
- [ ] **Staggered reveals with mechanically uniform delay on long lists.** 15 items each 100ms apart takes 1.5s to finish appearing — it starts to feel like the page is slow, not designed. Cap total stagger duration (see `timing-and-easing.md`).
- [ ] **Motion that fights reading.** Parallax or continuous motion behind body text, autoplaying carousels of content someone needs to read at their own pace, anything that moves while someone's eyes are trying to focus on words.
- [ ] **No reduced-motion handling.** Check for `prefers-reduced-motion` support. Its absence is itself a tell of unconsidered implementation, separate from the accessibility issue itself.
- [ ] **Motion that doesn't match the rest of the design's restraint level.** A minimal, quiet layout with one maximalist bouncy animation (or vice versa — a maximalist page with timid, barely-there motion) signals the motion was added separately from the design, not as part of it.

## The fix, in one sentence each

- Too much fade-in → pick one moment to be the signature entrance; make the rest instant or near-instant.
- Uniform hover → ask what this specific element is, and let the hover state say something about that (a play button hints at play; a link hints at destination).
- Uniform easing → assign curves by job (entrance vs exit vs feedback), not globally.
- Decorative filler → delete it and see if anything is lost; if not, leave it deleted.
- Reflexive bounce → ask what the brand would feel like as a physical object, and match the spring (or lack of one) to that.
- Character-reveal hero → default to a simpler, faster entrance unless this exact headline has a specific reason to be revealed that way.
- Long uniform stagger → cap stagger count or shrink per-item delay as list length grows.
- Motion fighting reading → move continuous/parallax motion off of anything with body text.
- Missing reduced-motion → add the guard from `patterns.md` before shipping, every time, not as a follow-up task.
- Mismatched restraint level → set the motion's energy level as part of the same design-token pass as color and type, not as an afterthought layered on top.

## A faster gut check

If you can't say *why* a specific animation is there — what it communicates, and why it needed motion instead of a static state — for every single animated element on the page, that's the diagnostic. Generic AI output tends to animate liberally because animation is cheap to generate and looks impressive in isolation; a considered design animates sparingly because each animation was a decision that had to be justified.