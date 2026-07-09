# Your HQ everywhere

HQ works fine on one machine with no remote at all. But putting it on a private GitHub repo buys three things at once: a backup, the ability to work from a second machine or your phone, and the cloud-side scheduling that [proactive.md](proactive.md) describes. This guide is the sync story end to end, written for people who don't want to learn git to get it.

## First: what GitHub is, and whether you need an account

GitHub is a website that stores copies of folders along with their full change history. Developers use it for code; you're using it as an off-site copy of your HQ that only you can see. That's the whole role it plays here: if your laptop dies, your HQ isn't gone, and any other device you own can pull the same copy.

You do **not** need a GitHub account to set up and use an HQ on one machine. You need one for everything in this guide: backup, a second machine, your phone, cloud scheduling. It's worth having.

Signing up takes about two minutes and is free:

1. Go to [github.com/signup](https://github.com/signup).
2. Enter an email, choose a password and a username (the username appears in your repo's web address; anything you like is fine).
3. Verify the email, pick the **Free** plan. Free accounts include private repositories, which is the only kind your HQ will ever use.

That's all. You never need to learn the website itself; your agent does the git work, and the one page worth knowing is your repo's page, where you'll verify the `Private` badge below.

## Setting up the private remote

Everything in your vault goes to this repo, including facts marked sensitive. It must be **private**, and it's worth thirty seconds to verify that it is.

**The easy path: let the agent do it.** In a session inside your HQ, say: "Create a private GitHub repo for my HQ and connect it." If the GitHub CLI is installed and signed in, the agent runs something like `gh repo create my-hq --private --source . --remote origin --push` itself. If it isn't, the agent will tell you and you can use the manual path instead.

**The manual path:**

1. On github.com, click **New repository**. Name it whatever you like (`hq` is fine).
2. Set visibility to **Private**. Don't add a README or anything else; the repo should start empty.
3. Copy the repository URL from the page GitHub shows you.
4. Tell your agent: "Connect my HQ to this remote and push: `<paste the URL>`."

**Verify, either way:** open the repo's page on GitHub. Next to its name you should see a `Private` badge. If it says `Public`, stop and fix it before anything else (Settings → Danger Zone → Change visibility), or just ask the agent to verify and fix visibility for you.

## The rhythm that keeps everything in sync

Two habits, both already built into your HQ, do all the work:

- **Every session starts with a pull.** The startup protocol in your operating manual does this. It means the session begins from the latest state, whichever machine wrote it.
- **Every session ends with a push.** The session-wrap skill does this. It means the state you just built is available to the next session, wherever it runs.

The failure mode to understand: if you end a session on your laptop without wrapping, then start one on another machine, that machine doesn't know what the laptop session learned. The memories haven't been lost, but they've forked. Which brings us to:

## When something goes wrong

You never need to fix git yourself. Describe the symptom in plain words and let the agent resolve it. The two situations you'll actually meet:

- **"The push was rejected."** Another session pushed first, so yours is behind. Say: "pull and rebase, then push again." (The session-wrap skill already does exactly this on its own.)
- **"There's a merge conflict."** Two sessions edited the same lines of the same file. Say: "resolve the conflict; where both sides added notes, keep both." HQ files are mostly append-style logs, so this is rare and almost always mergeable without losing anything.

If a machine sat unwrapped for days and things feel forked, the instruction is the same shape: "pull, merge whatever diverged, keep everything, then push." Git never silently destroys either side; the worst case is asking the agent to tidy up the merged result.

## From the web and your phone

Once HQ is on GitHub, you can open it with Claude Code on the web (claude.ai/code) from any browser, including the mobile app. That's the closest thing to the companion-in-your-pocket experience: same memory, same voice, from wherever you are.

Two things to know about cloud sessions:

- **They start from what was pushed.** A cloud session clones your repo fresh, so it knows exactly as much as your last push. Push discipline is what makes your phone as informed as your laptop.
- **They should wrap too.** End cloud sessions with the same "wrap up" so their work is pushed back and your laptop picks it up next pull.

Cloud access is also what makes the truly unattended morning briefing possible; see the scheduling section of [proactive.md](proactive.md).

## A note that belongs in your operating manual

Your `CLAUDE.md`/`AGENTS.md` template already carries a "syncing and concurrent sessions" section covering two agent-facing rules: if a session gets spawned into an isolated git worktree, operate against the real repo as normal; and re-read a file before editing it, because a concurrent session may have changed it. If your HQ was bootstrapped before that section existed, ask the agent to add it.
