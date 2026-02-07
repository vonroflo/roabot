Add a new cron job to operating_system/CRONS.json that pings google.com every midnight.

The cron job should:
1. Have the name "ping_google"
2. Run at midnight every day (schedule: "0 0 * * *")
3. Use type "command" (since this is a simple shell command, not requiring the full LLM agent)
4. Execute the command: "ping -c 1 google.com"
5. Be enabled by default

Add this entry to the existing CRONS.json file while preserving any existing cron jobs.