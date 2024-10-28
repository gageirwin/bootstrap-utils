$(document).ready(function () {
    $("#input-time").DateTimeInput()
    $("#input-date").DateTimeInput()
    $("#input-datetime").DateTimeInput()


    $(`input`).on("change", function (e) {
        const $this = $(this)
        $this.siblings().closest("span").text($this.val())
    })


    //#region Form Test
    const customValidations = [
        {
            selector: "#inputEmail4",
            validation: function ($field) {
                return $field.val().endsWith("@gmail.com")
            }
        },
        {
            selector: "#inputState",
            validation: function ($field) {
                // making another field required based on this fields state
                const enable = $field.val() === "1"
                this.disableField("#inputZip", !enable)
                this.requireField("#inputZip", enable)
                if (!enable)
                    this.resetField("#inputZip")

                return $field.val()
            }
        },
        {
            selector: "#inputZip",
            validation: function ($field) {
                return $field.val() === "123"
            },
            message: `You must input "123"`,
        }
    ]

    // const form = new FormValidation("form#example-form", customValidations,
    //     function ($form) {
    //         console.log(this)
    //         console.log($form)
    //         alert("Form Submitted!")
    //     })

    const form = $("form#example-form").FormValidation(customValidations,
        function ($form) {
            console.log(this)
            console.log($form)
            alert("Form Submitted!")
        })

    console.log(form)

    $("#form-clear").on("click", function (e) {
        form.resetForm()
    })
    //#endregion Form Test
})