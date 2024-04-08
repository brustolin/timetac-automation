const http = require('https');
const options = require("./.env")

function sendHttpRequest(url, formData, headers, method) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method ?? 'POST',
            headers: headers
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            const cookies = res.headers['set-cookie'];

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({ data, cookies });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(formData);
        req.end();
    });
}

function loginToTimeTac(config) {
    const url = 'https://go.timetac.com/sentry';
    const formData = `account=${encodeURIComponent(config.account)}&userName=${encodeURIComponent(config.userName)}&userPass=${encodeURIComponent(config.userPass)}&gmt_timezone=${encodeURIComponent(config.gmtTimezone ?? 0)}&submitImage=Login`;
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData)
    };

    return sendHttpRequest(url, formData, headers);
}

function getAccountInfo(cookies, userId, userGroup, HRManager) {
    const url = 'https://go.timetac.com/sentry/html/v7.83.4/response/load_all_ext_stores.php?_dc=' + Date.now();
    const formData = `task=pro&ui=${userId}&ug=${userGroup}&uh=${HRManager}`;
    const headers = {
        'Cookie': cookies,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData)
    };

    return sendHttpRequest(url, formData, headers);
}

function formatedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function approveTimeSheet(userId, accessToken, lastDate) {
    const url = "https://go.timetac.com/sentry/userapi/v4/timesheetAccountings/approve"
    const formData = `user_id=${userId}&date=${formatedDate(lastDate)}&approved_by_user=1`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData)
    };

    return sendHttpRequest(url, formData, headers, "PUT");
}

const extractValue = (script, regex) => {
    const match = script.match(regex);
    return match ? parseInt(match[1]) : null;
};

async function run() {
    options["gmtTimezone"] = 2;
    let data = await loginToTimeTac(options);

    // Regular expressions to extract the values
    let userIdRegex = /LOGGED_IN_USER_ID = (\d+);/;
    let userGroupRegex = /INTERNAL_USER_GROUP = (\d+);/;
    let hrManagerRegex = /LOGGED_IN_HR_MANAGER = (\d+);/;

    // Extract the values
    let userId = extractValue(data.data, userIdRegex);
    let userGroup = extractValue(data.data, userGroupRegex);
    let hrManager = extractValue(data.data, hrManagerRegex);

    let accountResponse = await getAccountInfo(data.cookies, userId, userGroup, hrManager);
    let accountInfo = JSON.parse(accountResponse.data);

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    var res = await approveTimeSheet(userId, accountInfo.userData.accessToken, yesterdayDate);
    console.log(res);
}

run();