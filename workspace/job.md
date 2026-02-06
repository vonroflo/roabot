Update the cron job configuration in operating_system/CRONS.json to add or modify a cron job that runs a ping on google.com every midnight (00:00).

Specific requirements:
1. Open operating_system/CRONS.json
2. Add or update a cron job with these specifications:
   - name: "midnight-ping" (or similar descriptive name)
   - schedule: "0 0 * * *" (runs at midnight every day)
   - type: "command"
   - command: "ping -c 1 google.com"
   - enabled: true
3. Ensure the JSON is properly formatted
4. Save the changes

The ping command should run just once (-c 1 flag) to test connectivity rather than running continuously.