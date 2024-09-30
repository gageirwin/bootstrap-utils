$(document).ready(function () {
    new DateTimeInput("#test_time-time", {
        initHours: 11,
        initMinutes: 30,
        initPeriod: "AM"
    })
    new DateTimeInput("#test_time-text", { type: "time", hour12: false })

    new DateTimeInput("#test_date-text", { type: "date" })
    new DateTimeInput("#test_date-date")

    new DateTimeInput("#datetime-datetime", { hour12: false })
    new DateTimeInput("#datetime-text", { type: "datetime" })
})