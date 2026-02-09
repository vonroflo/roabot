I'll create a financial advisor agent that performs daily market research. Let me develop a comprehensive job description for this task.

## Job Description for Financial Advisor Agent Setup

I'll create a financial advisor agent with the following components:

1. **Directory Structure**: Create `operating_system/FINANCIAL_ADVISOR/` with all necessary files
2. **Agent Definition**: `FINANCIAL_ADVISOR.md` - defines the bot's daily research tasks
3. **Report Template**: `FINANCIAL_REPORT_TEMPLATE.md` - structured format for daily reports
4. **Daily Output**: `FINANCIAL_REPORT.md` - the generated daily report
5. **Cron Job**: Add a 6 AM daily market research job to `CRONS.json`
6. **Brave Search Integration**: Configure the agent to use Brave Search for web research

The agent will:
- Run daily at 6 AM before market open
- Research major market indices, economic indicators, and news
- Analyze pre-market movements and overnight developments
- Generate a structured daily financial report
- Use Brave Search API for reliable financial data and news

**Files to create/modify:**
- `operating_system/FINANCIAL_ADVISOR/FINANCIAL_ADVISOR.md`
- `operating_system/FINANCIAL_ADVISOR/FINANCIAL_REPORT_TEMPLATE.md`
- `operating_system/FINANCIAL_ADVISOR/FINANCIAL_REPORT.md` (initial template)
- Update `operating_system/CRONS.json` to add the daily 6 AM job
- Create any necessary Brave Search configuration

The job will set up the complete financial advisor system with proper scheduling, research capabilities, and report generation structure.