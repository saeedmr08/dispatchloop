# DispatchLoop

Complete field-service board: create jobs, assign/start/block/finish, watch SLA risk, persist the board.

## Complete product flows

1. Create a job with an SLA (minutes).
2. Advance queued → assigned → in progress. Optionally **Block**, then resume.
3. Restart the app — columns and SLA risk remain in `data/jobs.json`.

Illegal jumps (queued → done) are rejected by the API.

```bash
npm install
npm test
npm run dev
```
