# FanFlow — Evaluation Targets

Based on prior submission scoring, these are our targets per category. Every agent must be aware of the gaps and build accordingly.

---

## Scoring Rubric & Targets

| Category | Prior Score | Target | Gap | Owner Agents |
|---|---|---|---|---|
| Problem Statement Alignment | 96.5% | 98%+ | Small | All agents |
| Code Quality | 90% | 95%+ | Small | All agents |
| Efficiency | 100% | 100% | None | Agent 01 |
| Testing | 80% | 90%+ | Medium | Agent 08 |
| Security | 80% | 90%+ | Medium | Agent 01, 02 |
| **Google Services** | **25%** | **85%+** | **🚨 Critical** | Agent 01, 03, 05, 06 |
| **Accessibility** | **20%** | **85%+** | **🚨 Critical** | Agent 07 (all) |

---

## Google Services Checklist
Every Google service below must be actively used, not just imported:

- [ ] Firebase Authentication — Google Sign-in working
- [ ] Firebase Realtime Database — live listeners active
- [ ] Cloud Firestore — orders collection reading and writing
- [ ] Google Maps JavaScript API — map rendering with markers
- [ ] Maps Visualization Library — heatmap layer active
- [ ] Google Maps Directions API — route displayed for exit planner
- [ ] Google Cloud Run — app deployed and accessible via URL

**Minimum 6 of 7 must be actively demonstrable.**

---

## Accessibility Checklist
Every page must pass before Agent 07 marks complete:

- [ ] ARIA labels on all interactive elements
- [ ] `aria-live="polite"` on all real-time updating regions
- [ ] Keyboard navigable (Tab, Enter, Escape, Arrow keys)
- [ ] Color contrast ratio 4.5:1 minimum for normal text
- [ ] Visible focus indicators on all interactive elements
- [ ] Skip navigation link present
- [ ] Correct heading hierarchy per page
- [ ] All icons either aria-hidden or aria-label'd
- [ ] Modals and panels trap focus correctly

---

## Security Checklist
- [ ] No API keys in source code
- [ ] All secrets in `.env` excluded from git
- [ ] Firebase security rules restrict read/write to authenticated users
- [ ] User input sanitized before Firestore writes
- [ ] No sensitive data in console.log statements

---

## Code Quality Checklist
- [ ] No unused imports or variables
- [ ] Components under 200 lines each
- [ ] Clear, consistent naming conventions
- [ ] Error boundaries on all async operations
- [ ] Loading and error states on all data-fetching components

---

## Agent 08 — Final Scoring Template
```
Problem Statement Alignment: ___%
Code Quality:                ___%
Efficiency:                  ___%
Testing:                     ___%
Security:                    ___%
Google Services:             ___%
Accessibility:               ___%

Estimated Overall:           ___%
```
