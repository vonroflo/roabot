Add a new cron job to the operating_system/CRONS.json file that pings google.com every midnight. The job should:

1. Be named "ping-google" 
2. Use the schedule "0 0 * * *" (midnight every day)
3. Be type "command" 
4. Use the command "ping -c 1 google.com"
5. Be enabled by default

The job should be added to the existing CRONS.json array while preserving any existing cron jobs.