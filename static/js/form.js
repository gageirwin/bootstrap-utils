
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


class FormValidation {
    static instances = {}

    static getInstance(formId, success, customValidations = []) {
        if (!FormValidation.instances[formId]) {
            FormValidation.instances[formId] = new FormValidation(formId, success, customValidations)
        }
        return FormValidation.instances[formId]
    }

    constructor(formId, success, customValidations = []) {
        const existingInstance = FormValidation.instances[formId]
        if (existingInstance) {
            return existingInstance
        }

        this.formId = formId
        this.successCallback = success
        this.customValidations = customValidations
        this.$form = $(`form#${this.formId}`)
        this.customValidationIds = this.customValidations.map(v => v.id)

        this.$form.on("submit", (e) => {
            e.preventDefault()
            e.stopPropagation()
            const isFormValid = this.validateForm()
            if (isFormValid && this.successCallback)
                this.successCallback.bind(this)(this.$form)
        })
        this.setRequiredFieldEvents()

    }

    setRequiredFieldEvents() {
        this.$form.find(`input, textarea, select`).each((_, element) => {
            const index = this.customValidationIds.indexOf($(element).attr("id"))
            if (index === -1) return
            const fieldOptions = this.customValidations[index]
            this.addOrUpdateFeedback($(element), fieldOptions.validFeedback, fieldOptions.invalidFeedback)
            $(element).off("change").on("change", () => {
                this.customValidateField($(element), fieldOptions.isValid)
            })

        })
    }

    customValidateField($element, isValid) {
        if (typeof isValid !== "function")
            return
        const valid = isValid.bind(this)($element)
        $element.get(0).setCustomValidity(valid ? '' : 'invalid')
    }

    addOrUpdateFeedback($element, validFeedback, invalidFeedback) {
        const feedbackTypes = [
            { feedback: validFeedback, className: "valid-feedback" },
            { feedback: invalidFeedback, className: "invalid-feedback" }
        ]

        feedbackTypes.forEach(({ feedback, className }) => {
            if (feedback) {
                const $feedbackElement = $element.siblings(`.${className}`)
                if ($feedbackElement.length) {
                    $feedbackElement.text(feedback)
                } else {
                    $element.after(`<div class="${className}">${feedback}</div>`)
                }
            }
        })
    }

    validateForm() {
        this.$form.find(`input, textarea, select`).each((_, element) => {
            const index = this.customValidationIds.indexOf($(element).attr("id"))
            if (index === -1) return
            this.customValidateField($(element), this.customValidations[index].isValid)
        })
        this.$form.addClass("was-validated")
        return this.$form.find(`input, textarea, select`).toArray().every(element => $(element).get(0).checkValidity())
    }

    resetValidation() {
        this.$form.find(`input, textarea, select`).each((_, element) => {
            $(element).get(0).setCustomValidity('')
        })
        this.$form.removeClass("was-validated")
    }

    reset() {
        this.resetValidation()
        this.$form.trigger("reset")
    }

    destroy() {
        this.$form.off("submit")
        this.$form.find(`input, textarea, select`).each((_, element) => {
            $(element).off("change")
        })

        delete FormValidation.instances[this.formId]
        this.formId = null
        this.successCallback = null
        this.customValidations = null
        this.$form = null
        this.$required = null
        this.customValidationIds = null
    }
}