$(document).ready(function () {
    $("#input-time").DateTimeInput()
    $("#input-date").DateTimeInput()
    $("#input-datetime").DateTimeInput()


    $(`input`).on("change", function (e) {
        const $this = $(this)
        $this.siblings().closest("span").text($this.val())
    })

})