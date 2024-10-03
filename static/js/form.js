
const conditions = [
    {
        id: "inputEmail4",
        isValid: emailValidate
    },
    {
        id: "inputState",
        isValid: function ($element) {

            const enable = $element.val() === "1"
            $("#inputZip")
                .prop("disabled", !enable)
                .prop("required", enable)
            if (!enable)
                $("#inputZip").val("")
            this.setRequiredFieldEvents()

            return true // default form validation is used
        }
    },
    {
        value: 123,
        id: "inputZip",
        isValid: function ($element) {
            console.log(this)
            return $element.val() === "123"
        },
        validFeedback: "Good Job!",
        invalidFeedback: "You must input 123",
    }
]

function emailValidate($element) {
    return $element.val().endsWith("@gmail.com")
}


$(document).ready(function () {

    const form = new FormValidation("example-form", function ($form) {
        alert("Form Submitted!")
    }, conditions)
    $("button.btn-danger").on("click", function (e) {
        form.reset()
    })

})