$(document).ready(function () {
    $("#theme-select").on("click", "li > button", function (e) {
        changeTheme($(e.target).text().trim().toLowerCase())
    })
})

function changeTheme(theme) {
    if (theme === "auto")
        theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"

    $("html").attr("data-bs-theme", theme)
}