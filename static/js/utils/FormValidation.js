class FormValidation {
    static instances = {}

    static create(selector, customValidations, callback) {
        return new FormValidation(selector, customValidations, callback)
    }

    static getInstance(selector) {
        this.$form = (selector instanceof jQuery) ? selector : $(selector)
        return FormValidation.instances[this.$form.attr("id")]
    }

    constructor(selector, customValidations, callback) {
        this.$form = (selector instanceof jQuery) ? selector : $(selector)

        const existingInstance = FormValidation.getInstance(selector)
        if (existingInstance) {
            return existingInstance
        }

        this.callback = callback
        this.customValidations = customValidations
        this.validated = false

        this._addOrUpdateFeedback()
        this._setFieldEventListeners()

        this.$form.on("submit", (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (this.validateForm() && this.callback)
                this.callback.call(this, this.$form)
        })

        FormValidation.instances[this.$form.attr("id")] = this
    }

    addCustomValidations(customValidations) {
        this.customValidations = [...this.customValidations, ...customValidations]
        this._addOrUpdateFeedback()
        this._setFieldEventListeners()
        return this
    }

    addCustomValidation(customValidation) {
        this.customValidations = [...this.customValidations, customValidation]
        this._addOrUpdateFeedback()
        this._setFieldEventListeners()
        return this
    }

    _validateField($field, validation) {
        let isValid = false
        if (typeof validation === "function") {
            isValid = validation.call(this, $field)
        } else {
            isValid = validation
        }
        $field.toggleClass("is-invalid", !isValid)
        return isValid
    }

    _setFieldEventListeners() {
        this.$form.find(`input, textarea, select`).each((_, field) => {
            const $field = $(field)
            $field.off("change").on("change", () => {
                const isValid = $field.prop("validity").valid
                if (this.validated)
                    $field.toggleClass("is-invalid", !isValid)
            })
        })
        this.customValidations.forEach((customValidation) => {
            const $field = this.$form.find(customValidation.selector)
            $field.off("change").on("change", (e) => {
                this._validateField($(e.target), customValidation.validation)
            })
        })
    }

    _addOrUpdateFeedback() {
        this.customValidations.forEach((customValidation) => {
            const $field = this.$form.find(customValidation.selector)
            if (customValidation.message) {
                const $feedbackElement = $field.siblings(`.invalid-feedback`)
                if ($feedbackElement.length) {
                    $feedbackElement.text(customValidation.message)
                } else {
                    $field.after(`<div class="invalid-feedback">${customValidation.message}</div>`)
                }
            }
        })
    }

    validateForm() {
        let isFormValid = true
        this.$form.find(`input, textarea, select`).each((_, field) => {
            const $field = $(field)
            const isValid = $field.prop("validity").valid
            $field.toggleClass("is-invalid", !isValid)
            isFormValid = isFormValid && isValid
        })
        this.customValidations.forEach((customValidation) => {
            const $field = this.$form.find(customValidation.selector)
            if (!$field.prop("disabled")) {
                const isValid = this._validateField($field, customValidation.validation)
                isFormValid = isFormValid && isValid
            }
        })
        this.validated = true
        return isFormValid
    }

    resetValidation() {
        this.$form.find(`input, textarea, select`).each((_, field) => {
            const $field = $(field)
            $field.removeClass("is-invalid")
        })
        this.customValidations.forEach((customValidation) => {
            const $field = this.$form.find(customValidation.selector)
            $field.removeClass("is-invalid")
        })
        this.validated = false
        return this
    }

    resetForm() {
        this.resetValidation()
        this.$form.trigger("reset")
        return this
    }

    disableField(selector, boolean = true) {
        $(selector).prop("disabled", boolean)
        return this
    }

    requireField(selector, boolean = true) {
        $(selector).prop("required", boolean)
        return this
    }

    resetField(selector) {
        $(selector).removeClass("is-invalid")
        $(selector).val("")
        return this
    }

    destroy() {
        delete FormValidation.instances[this.$form.attr("id")]
        this.$form.off("submit").find('*').off()
        this.$form = null
        this.callback = null
        this.customValidations = null
    }
}

(function ($) {
    $.fn.FormValidation = function (customValidations, callback) {
        if (this.length === 1)
            return new FormValidation(this, customValidations, callback)
        return this.each(function () {
            new FormValidation(this, customValidations, callback)
        })
    }
}(jQuery))