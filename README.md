# Description

*This is a tool to automate TimeTac actions*

Right now the only function it have is to approve your timesheet.
It will approve up to the current day.
Add the function in a task scheduler or chron to have it automate.

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

