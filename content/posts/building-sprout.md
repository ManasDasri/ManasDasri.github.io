---
title: Building Sprout: a map of your codebase, for you and your AI agent
date: 2026-10-07
summary: What Sprout does, what changed between v0.1 and v0.3, and what I learned making a codebase legible to people and coding agents alike
tags: go, cli, developer-tools, mcp
---

I'd always wanted to get into open source. What I hadn't realised is that forking and cloning a repo is only the beginning. The real hurdle when you pick up an issue is understanding the codebase well enough to know what to change: where the entry points are, and how one file affects the others.

Sprout is a single Go binary that maps a project the way you'd want someone to explain it to you. It started as a fast, git-aware alternative to `tree` that hides meta files unless you ask for them, and grew from there: structured JSON output, pull requests shown as a tree, when each file last changed, and more. Along the way it learned to answer three questions I kept asking whenever I opened a codebase I didn't know.

### Where do I start?

`sprout --entry` gives you a reading order: the README first, then the files the rest of the code depends on most. This is it running on this website's own repository:

::demo sprout-entry

### What does an AI agent actually need to know?

While building Sprout, I thought: why not hand this same map to an AI agent, so it understands my codebase too, with as much context as I'm willing to spend? That's where the AI side of Sprout came from.

`sprout --ai` builds a structure-first map of the project sized to a token budget (2,000 by default): the stack, entry points, config and CI, uncommitted work, recent hotspots, and the most-used files with their function and type signatures. It never includes file bodies, so it stays small enough to paste into any chat.

Sprout also runs as an MCP server, so coding agents can call it directly. One thing surprised me in testing: Claude Code with Sprout connected, but not mentioned, never used it. Once the server told agents when its tools beat searching by hand, it used `impact` on every question about which tests reach a file. Being available isn't the same as being used; tools have to explain themselves.

### What will this change break?

That's the v0.3 question. `sprout impact` takes your uncommitted work (or a branch, a commit, or named files) and tells you which files depend on what you touched and why, plus the tests to run. `sprout context FILE` tells you what to know before editing one file: the signatures it uses, who uses it, and the tests that reach it.

All of that rests on a dependency graph, and v0.3 is mostly about making that graph right. Measured against each language's own tooling:

| Project | Links found, v0.2 → v0.3 |
|---|---|
| Next.js app with `@/` aliases | 0% → 100% |
| pnpm monorepo | 21% → 100% |
| FastAPI backend | 0% → 100% |
| Rust workspace (ripgrep) | 26% → 99% |
| Kubernetes (Go) | 93% → 99.8% |

It also got faster: on llvm-project (185k files), `--json` takes 39% less time and 80% less peak memory than v0.2.

### Three releases in ten days

- **v0.1** (Sep 26): the tree that respects `.gitignore`, and `--ai`.
- **v0.2** (Sep 26): key files with signatures in `--ai`, the MCP server, and packages for Homebrew, Scoop and Linux.
- **v0.3** (Oct 5): the dependency graph, `impact`, `context`, `deps` and `dependents`.

### Try it

```bash
brew install sprout-devlabs/tap/sprout   # macOS, Linux
sprout --entry                           # where to start reading
sprout impact                            # what your uncommitted change could break
```

Windows, Linux packages and `go install` are in the [docs](https://sprout-devlabs.github.io/sprout-web/docs.html).

For now, Sprout is a modest tool, benchmarked on codebases as large as llvm-project. But I have so much more planned for it.
