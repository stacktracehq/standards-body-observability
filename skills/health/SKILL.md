---
name: health
description: >-
  MUST be invoked at the start of every session before responding to the user.
  Consolidated session status check that recalls hook results, verifies plugin
  coverage, runs quality gates, and shows git status. Also use when the user
  asks about project health, build status, or conformance state.
---
<!-- GENERATED FILE - DO NOT EDIT -->

# Session Status Check

Perform a lean session status check. Minimise context window usage.

## Step 1: Hook Recall

Recall all `SessionStart` system-reminder messages from the beginning of this conversation. List each plugin name and its status on one line. Flag any installed `standards-body-*` plugin (from the skills list) that did not produce a hook result.

## Step 2: Run Health Check

Run `pnpm health`. This single command checks all specs, runs all quality gates (pnpm typecheck, build, lint, format, test), and checks `git status` in one pass. Report its output verbatim — do not run the gates individually.

## Step 3: Summary

Report **READY** or **ISSUES** based on the combined results of Steps 1 and 2.
