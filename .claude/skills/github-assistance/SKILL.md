---
name: github-assistance
description: Onboard a new developer to this dashboard repo — sync with main, create a personal working branch named after their GitHub username, open a review PR from that branch, and keep all their future local work scoped to that branch only (never main). Use when a new contributor joins, asks to "get set up", "start contributing", or wants help pushing work for review.
---

# GitHub Assistance

Sets up a new developer with an isolated branch for their local work, and keeps
every future push scoped to that branch — main is never touched directly by a
contributor using this skill.

## When to use

- A new developer says they want to start contributing, get set up locally, or
  "onboard" to this repo.
- An already-onboarded developer (has a `dev/<github-username>` branch) asks
  for help continuing development or pushing their work for review.

## Step 1 — Identify the developer

Ask (if not already known) for their **GitHub username**. This is used as the
branch name suffix. Do not guess it or reuse the repo owner's identity.

## Step 2 — Sync local folder with main

Run in the developer's local clone:

```bash
git fetch origin
git checkout main
git pull origin main
```

If there are uncommitted local changes in the way, stop and ask the developer
what to do with them (stash, commit, or discard) — never discard silently.

## Step 3 — Create their personal branch

Branch name convention: `dev/<github-username>` (lowercase, hyphens for
spaces). Example: `dev/jsmith`.

```bash
git checkout -b dev/<github-username>
git push -u origin dev/<github-username>
```

If the branch already exists remotely, check it out and pull instead of
creating a new one:

```bash
git fetch origin
git checkout dev/<github-username>
git pull origin dev/<github-username>
```

## Step 4 — Open a review PR for that branch

Open a PR from `dev/<github-username>` targeting `main`, so the team can
review incrementally as the developer pushes commits. This PR stays open as a
running review surface — it is not merged until a maintainer approves it.

```bash
gh pr create \
  --base main \
  --head dev/<github-username> \
  --title "WIP: <github-username> contributions" \
  --body "Ongoing work branch for @<github-username>. Do not merge without review."
```

If a PR for this branch already exists, skip creation and just report its URL
(`gh pr view dev/<github-username>`).

**Confirm with the developer before running `gh pr create`** — opening a PR is
a visible, shared-state action.

## Step 5 — Ongoing local development rules

Once the branch and PR exist, help the developer with their actual feature
work in this repo (see "Continuing development" below). While doing so,
follow these hard rules:

- **All commits go on `dev/<github-username>` only.** Never commit to or
  checkout `main` for edits.
- **All pushes go to `origin dev/<github-username>` only.**
  `git push origin main` is forbidden for this workflow — refuse it even if
  asked, and explain the branch-only policy instead.
- Before pushing, always confirm the current branch:
  ```bash
  git branch --show-current
  ```
  If it is not `dev/<github-username>`, stop and fix the branch before
  committing or pushing.
- Pushing to the personal branch for review does not require asking each
  time once the developer has confirmed this is their standing workflow — but
  merging the PR, force-pushing, or touching `main` always requires explicit
  confirmation in chat.
- Never rewrite history (`push --force`) on the personal branch without the
  developer's explicit go-ahead, since reviewers may already be looking at it.

## Continuing development on a section

When the developer wants to keep working on a feature/section:

1. Confirm they're on `dev/<github-username>` (Step 5 check above).
2. Ask which part of the dashboard they're picking up (e.g. nurse station,
   ward view, data store) if not already clear from context.
3. Read the relevant existing code under `src/components/` before editing, to
   match existing patterns (see recent commit history for this repo's style,
   e.g. `feat(nurse-station): ...`, `fix(nurse-station): ...`).
4. Make edits, then commit with a conventional message
   (`feat(scope): ...` / `fix(scope): ...` / `style(scope): ...`).
5. Push to `origin dev/<github-username>` so the open PR reflects the new
   commits for review.
