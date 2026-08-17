# Documentation Principles

This reference consolidates the core rules used by the `technical-documentation` skill.

---

## 1. Matt Palmer: 8 Rules for Better Docs

_Source: [Matt Palmer (2025)](https://mattpalmer.io/posts/2025/10/8-rules-for-better-docs/)_

1. **Write for humans, optimize for agents**: Keep language clear and natural for engineers, while structuring with strict markdown headers, lists, and code blocks so AI agents can parse and index accurately.
2. **Start with a funnel**: What/Why $\rightarrow$ Quickstart $\rightarrow$ Deep dive / Next steps. Readers must know what the document is for within the first 5 seconds.
3. **Use Diataxis to scaffold content**: Never mix a tutorial with an exhaustive reference guide. Pick one purpose per document.
4. **Write with AI, but structure for agents**: Use AI to draft, but maintain strict human oversight and consistent architecture.
5. **Offload routine docs operations to background agents**: Use agents for link checking, freshness audits, and cross-referencing.
6. **Automate quality with CI**: Ensure docs linting, spell checking, and broken link checks run in automated pipelines.
7. **Automate scaffolding and repetitive workflow tasks**: Standardize templates for new features, API endpoints, and architecture decision records (ADRs).
8. **Make contribution easy and visible**: Keep `CONTRIBUTING.md` clear, actionable, and welcoming.

---

## 2. OpenAI Cookbook: What Makes Documentation Good

_Source: [OpenAI Cookbook](https://cookbook.openai.com/articles/what_makes_documentation_good)_

- **Accurate & Standard Terminology**: Prefer specific, industry-standard terms over niche jargon or idiosyncratic phrasing.
- **Self-Contained Examples**: Code snippets should run out-of-the-box or have clearly declared dependencies and imports.
- **Prioritize High-Value Paths**: Focus 80% of effort on standard workflows (happy paths and primary use cases), rather than endless obscure edge cases.
- **No Unsafe Patterns**: Never teach bad practices, insecure defaults, or expose secrets/credentials in examples.
- **Immediate Reader Orientation**: Always begin with a concise summary sentence answering: _Who needs this? What problem does it solve? What is the outcome?_
- **Empathy over Rigid Dogma**: If breaking a formatting rule creates significantly clearer and more helpful documentation for the user, prioritize clarity.

---

## 3. Conflict Resolution Order

When documentation principles appear in tension:

1. **Preserve Reader Task Success First**: The reader must be able to complete their real-world task without error.
2. **Preserve Structural Clarity Second**: The document must fit logically into the overall documentation information architecture.
3. **Preserve Maintainability Third**: Avoid duplicated content that drifts out of sync.
