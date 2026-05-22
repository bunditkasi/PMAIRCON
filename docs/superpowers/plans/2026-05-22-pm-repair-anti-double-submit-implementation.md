# PM and Repair Anti-Double-Submit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent duplicate PM and Repair saves by combining clearer form success states with server-side duplicate detection.

**Architecture:** Extend the PM and Repair save services so they can short-circuit on duplicate records before append. Then update the API responses and form components to expose saved vs duplicate states clearly and lock the form after a successful outcome.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Google Sheets-backed log writer

---

### Task 1: Add duplicate-aware PM and Repair service behavior
### Task 2: Return duplicate-safe API payloads for PM and Repair routes
### Task 3: Upgrade PM and Repair forms with locked success states and duplicate banners
### Task 4: Verify targeted tests, build, and type-check
