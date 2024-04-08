# Description

**This is a tool to automate TimeTac actions**

Right now, the only function it has is to approve your timesheet. It will approve up to the current day. 

Run this in a task scheduler or cron to automate it

# Usage

```bash
node approve.js
```

In order for this to work you need two things:
- A password enabled account. If you use SSO just go to you account settings and change the password (SSO will work still).
- A `.env` file with the following information:

```javascript
module.exports = {
    "account": "<company name>",
    "userName": "<Your email>",
    "userPass": "<Your timetac password>"
}
```

