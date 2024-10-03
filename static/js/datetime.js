$(document).ready(function () {
    $("#test_time-time, #test_time-text").DateTimeInput({ type: "time" })
    $("#test_date-text, #test_date-date").DateTimeInput({ type: "date" })
    const test1 = $("#datetime-text").DateTimeInput({ type: "datetime" })
    const test2 = $("#datetime-datetime").DateTimeInput({ type: "datetime" })
    console.log(test1)
    console.log(test2)
})