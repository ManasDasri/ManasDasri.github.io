---
title: Starting AI/ML From Zero (Again)
date: 2026-08-08
summary: Why I am learning AI/ML fundamentals from scratch through a real competition instead of leaning on past project experience
tags: machine-learning, gradient-descent, kaggle
original: https://daily.dev/posts/starting-ai-ml-from-zero-again--ub2rifw2n
---

I’ve been fascinated by AI/ML for a while now. Not the hype around it, more the actual math underneath, the idea that you can teach a machine to *learn* a pattern instead of hardcoding every rule yourself. It’s always felt a little like magic to me. The problem is I never really knew where to start.

I’ve built stuff before: quant trading systems, finance terminals, risk models — so it would’ve been easy to just lean on that and bolt a pre-trained model onto some project to say I “did AI.” I decided not to do that this time. I want to actually understand what’s going on underneath, from scratch, like I know nothing. No shortcuts, no importing a library and calling it a day.

So instead of grinding through tutorials in a vacuum, I picked something real to aim at: [kaggriculture](https://www.kaggle.com/competitions/kaggriculture), a farming-simulation competition. Having an actual leaderboard and messy real data in front of you does something tutorials just can’t, you learn why your model is under-fitting because your own score is sitting near the bottom, not because a textbook mentioned it in passing.

The competition placement is really a secondary goal though. What I actually care about is getting the fundamentals right this time:

- what’s actually happening when a model “learns”: gradient descent, loss functions, the optimisation itself
- how much of your ceiling gets decided by data quality before you’ve even touched a model
- why boring stuff like train/val/test splits and avoiding data leakage matters more than picking a fancier architecture
- learning to read *why* a model fails, not just look at the final score and move on

::demo gradient-descent

It’s tempting when you already know how to build software to treat ML like just another library. But the intuition underneath it doesn’t compress that easily, and I’d rather spend a few extra weeks getting that solid now than end up shipping some “AI feature” I can’t actually explain if it breaks.

If a good leaderboard placement comes out of this, great. If not, I’ll still walk away actually understanding a field I’ve been curious about for years, which was the whole point anyway.

More on this as the leaderboard hopefully starts moving up.
