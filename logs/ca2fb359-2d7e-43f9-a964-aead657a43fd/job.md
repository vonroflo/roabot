Set up a daily market update cron job that runs at 6:00 AM Pacific (13:00 UTC). This will involve:

1. Adding the cron entry to operating_system/CRONS.json:
   - Name: "daily-market-update"
   - Schedule: "0 13 * * *" 
   - Type: "agent"
   - Job: "Read and execute the instructions in operating_system/FINANCIAL_ADVISOR.md. Follow all directions specified in that file for the daily market update process."
   - Enabled: true

2. Creating operating_system/FINANCIAL_ADVISOR.md with comprehensive daily market update instructions including:
   - Data sources to check
   - Analysis framework
   - Report generation process
   - Reference to the template file

3. Creating operating_system/daily_report_template.md with a structured template for consistent daily reports

The job will ensure the cron configuration is clean and maintainable, with all the detailed logic contained in the dedicated instruction files.