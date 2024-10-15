
// #region DoubleTableSelector

let options = {
    leftTable: {
        id: "",
        className: "",
        DtOptions: {

        }
    },
    rightTable: {
        id: "",
        className: "",
        DtOptions: {

        }
    },
    buttons: {
        moveRight: {
            icon: "",
            className: "",
            enabled: true
        },
        moveLeft: {
            icon: "",
            className: "",
            enabled: true
        },
        moveAllRight: {
            icon: "",
            className: "",
            enabled: true
        },
        moveAllLeft: {
            icon: "",
            className: "",
            enabled: true
        }
    }
}
/*
ISSUES:

    - [ ] when scroller is applied to datatables the layout gets messed up!
    - [ ] dynamic width adjusting
    - [ ] table sizes staying consistent with different amount of entries

TODO:

    - [ ] add button tooltips
    - [ ] add options for button tooltips

*/
class DoubleTableSelector {
    static instances = {}

    constructor(elementID, options = {}) {

        const existingInstance = DoubleTableSelector.instances[elementID]
        if (existingInstance) {
            return existingInstance
        }

        const element = document.getElementById(elementID)

        const wrapper = document.createElement("div")
        wrapper.setAttribute("id", `${elementID}_wrapper`)
        wrapper.style.display = "grid"
        wrapper.style.gridTemplateColumns = "1fr auto 1fr"
        wrapper.style.gridTemplateAreas = `"leftTable buttons rightTable"`
        wrapper.style.alignItems = "center"
        wrapper.style.gap = "10px"

        // Set defaults
        options.leftTable = {
            id: `${elementID}_leftTable`,
            className: "",
            ...options.leftTable
        }
        options.rightTable = {
            id: `${elementID}_rightTable`,
            className: "",
            ...options.rightTable
        }
        options.buttons = {
            moveRight: {
                icon: `<i class="bi bi-chevron-right"></i>`,
                className: "",
                enabled: true,
                ...options.buttons?.moveRight
            },
            moveLeft: {
                icon: `<i class="bi bi-chevron-left"></i>`,
                className: "",
                enabled: true,
                ...options.buttons?.moveLeft
            },
            moveAllRight: {
                icon: `<i class="bi bi-chevron-double-right"></i>`,
                className: "",
                enabled: true,
                ...options.buttons?.moveAllRight
            },
            moveAllLeft: {
                icon: `<i class="bi bi-chevron-double-left"></i>`,
                className: "",
                enabled: true,
                ...options.buttons?.moveAllLeft
            },
            ...options.buttons
        }

        this.elementID = elementID
        this.options = options
        this.wrapper = wrapper

        this.initTables()
        this.initButtons()

        element.appendChild(this.wrapper)

        this.initDataTables()
        this.initButtonEventHandlers()

        DoubleTableSelector.instances[elementID] = this
    }

    initTables() {
        const leftTable = this.initTable(this.options.leftTable)
        const rightTable = this.initTable(this.options.rightTable)
        leftTable.style.gridArea = "leftTable"
        rightTable.style.gridArea = "rightTable"
        this.wrapper.appendChild(leftTable)
        this.wrapper.appendChild(rightTable)
    }

    initTable(options) {
        const table = document.createElement('table')
        table.setAttribute('id', options.id)
        table.setAttribute('class', 'table table-striped cell-border hover' + options.className)
        table.setAttribute('style', 'width:100%')
        return table
    }

    initButtons() {
        const buttonWrapper = document.createElement("div")
        buttonWrapper.style.gridArea = "buttons"
        buttonWrapper.style.display = "flex"
        buttonWrapper.style.flexDirection = "column"
        buttonWrapper.style.gap = "10px"
        this.createButton(buttonWrapper, this.options.buttons.moveRight, "moveRight")
        this.createButton(buttonWrapper, this.options.buttons.moveLeft, "moveLeft")
        this.createButton(buttonWrapper, this.options.buttons.moveAllRight, "moveAllRight")
        this.createButton(buttonWrapper, this.options.buttons.moveAllLeft, "moveAllLeft")
        this.wrapper.appendChild(buttonWrapper)
    }

    createButton(wrapper, option, type) {
        if (option.enabled != true)
            return
        const button = document.createElement('button')
        button.setAttribute('id', `${this.elementID}_${type}`)
        button.setAttribute('class', 'btn btn-primary ' + option.className)
        button.innerHTML = option.icon
        if (type == "moveRight" || type == "moveLeft")
            button.disabled = true
        wrapper.appendChild(button)
    }

    initButtonEventHandlers() {
        this.createButtonEventHandler(this.options.buttons.moveRight, "moveRight")
        this.createButtonEventHandler(this.options.buttons.moveLeft, "moveLeft")
        this.createButtonEventHandler(this.options.buttons.moveAllRight, "moveAllRight")
        this.createButtonEventHandler(this.options.buttons.moveAllLeft, "moveAllLeft")
    }

    createButtonEventHandler(option, type) {
        if (option.enabled != true)
            return
        const button = document.getElementById(`${this.elementID}_${type}`)

        button.addEventListener("click", (e) => {
            if (type == "moveRight") {
                this.moveRowsLeft2Right()
                button.disabled = true
            }
            else if (type == "moveLeft") {
                this.moveRowsRight2Left()
                button.disabled = true
            }
            else if (type == "moveAllRight")
                this.moveRowsLeft2Right({ search: 'applied' })
            else if (type == "moveAllLeft")
                this.moveRowsRight2Left({ search: 'applied' })

            button.dispatchEvent(new CustomEvent(`dts-${type}`))
        })
    }

    moveRowsRight2Left(rowSelector = { selected: true }) {
        const rightTableData = this.rightTable.rows(rowSelector).data().toArray()
        this.leftTable.rows.add(rightTableData).draw()
        this.rightTable.rows(rowSelector).remove().draw()
    }

    moveRowsLeft2Right(rowSelector = { selected: true }) {
        const leftTableData = this.leftTable.rows(rowSelector).data().toArray()
        this.rightTable.rows.add(leftTableData).draw()
        this.leftTable.rows(rowSelector).remove().draw()
    }

    initDataTables() {
        this.leftTable = this.initDataTable(this.options.leftTable, 'moveRight')
        this.rightTable = this.initDataTable(this.options.rightTable, 'moveLeft')
    }

    initDataTable(options, buttonType) {
        options.DtOptions = {
            data: [{}],
            select: true,
            scrollY: "50vh",
            scroller: true,
            ...options.DtOptions
        }
        const table = new DataTable(`#${options.id}`, options.DtOptions)

        const buttonID = `${this.elementID}_${buttonType}`

        table
            .on('select', function (e, dt, type, indexes) {
                const button = document.getElementById(buttonID)
                button.disabled = false
            })
            .on('deselect', function (e, dt, type, indexes) {
                const button = document.getElementById(buttonID)
                button.disabled = true
            })

        return table
    }
}

(function ($) {
    $.fn.DoubleTableSelector = function (options) {
        if (this.length !== 1) {
            throw new Error("DoubleTableSelector: Plugin can only be initialized on a single element.")
        }

        const element = this.first()

        const instance = new DoubleTableSelector(element.attr('id'), options)

        element.data('doubleTableSelector', instance)

        return instance
    }
}(jQuery))
// #endregion

// #region BetterBSSelect
class BetterBSSelect {

    static instances = {} // Static property to store instances

    constructor(elementID, options = {}) {
        // Check if an instance already exists for this ID
        const existingInstance = BetterBSSelect.instances[elementID]
        if (existingInstance) {
            // Return the existing instance if found
            return existingInstance
        }

        // Set default options
        this.options = Object.assign({
            searchable: false,
            caseSensitive: false,
            maxHeight: "250px",
            options: []
        }, options)

        this.elementID = elementID
        this.options = options
        const button = document.getElementById(elementID)

        // Error handling
        if (!button) {
            throw new Error(`Element with ID ${elementID} not found.`)
        }
        if (button.tagName !== "BUTTON") {
            throw new Error(`Element with ID ${elementID} is not a button.`)
        }

        // Ensure the element has the correct class
        if (!button.classList.contains("form-select")) {
            button.classList.add("form-select")
        }
        Object.assign(button.style, {
            whiteSpace: 'nowrap',          // Prevent text from wrapping to the next line
            overflow: 'hidden',            // Hide overflowing text
            textOverflow: 'ellipsis',      // Display ellipsis (...) for overflowed text
            textAlign: 'left'
        })

        // Initialize the dropdown
        this.initDropdown(button)

        // Add options to the dropdown
        this.addOptions(this.options.options)

        // Add event listener for searching, if enabled
        const search = document.getElementById(`${elementID}_search`)
        if (search) {
            this.debounce(search.addEventListener("keyup", (e) => {
                this.filterOptions(e.target.value, this.options.caseSensitive)

                // Trigger 'bbss-searchInput' event
                const searchEvent = new CustomEvent('bbss-searchInput', {
                    detail: { query: e.target.value }
                })
                button.dispatchEvent(searchEvent)
            }), 300)
        }

        // Store the instance
        BetterBSSelect.instances[elementID] = this
    }

    // Initialize the dropdown structure
    initDropdown(button) {
        button.setAttribute("data-bs-toggle", "dropdown")
        button.setAttribute("aria-expanded", "false")

        const ul = document.createElement("ul")
        ul.className = "dropdown-menu"
        ul.id = `${this.elementID}_options`
        ul.setAttribute("aria-labelledby", this.elementID)
        Object.assign(ul.style, {
            overflowY: 'auto',
            maxHeight: this.options.maxHeight
        })

        if (this.options.searchable) {
            ul.innerHTML = `
                <li class="dropdown-item-text">
                    <input type="text" class="form-control form-control-sm" id="${this.elementID}_search" placeholder="Search...">
                </li>
                <li class="dropdown-divider">
                    <hr>
                </li>
                <li class="dropdown-item-text fw-light fst-italic no-results-message" style="display:none">No Results Found</li>
            `
        }
        button.after(ul)
    }

    // Add multiple options
    addOptions(options) {
        options.forEach(option => this.addOption(option))
    }

    // Add individual option
    addOption(option) {
        const ul = document.getElementById(`${this.elementID}_options`)
        let text, value

        if (typeof option === "object") {
            text = option.text
            value = option.value
        } else if (typeof option === "string" || typeof option === "number") {
            text = option
            value = option
        }

        const li = document.createElement("li")
        li.innerHTML = `<a class="dropdown-item" href="#" value="${value}">${text}</a>`

        const button = document.getElementById(this.elementID)
        li.addEventListener("click", (e) => {
            const a = e.target
            button.textContent = a.textContent
            button.setAttribute("value", a.getAttribute("value"))

            // Trigger 'bbss-optionSelected' event
            const selectEvent = new CustomEvent('bbss-optionSelected', {
                detail: { text: a.textContent, value: a.getAttribute("value") }
            })
            button.dispatchEvent(selectEvent)
        })

        ul.appendChild(li)
    }

    // Filter options based on search input
    filterOptions(string, caseSensitive = false) {
        let noResults = true
        const ul = document.getElementById(`${this.elementID}_options`)

        // Filter each dropdown item
        ul.querySelectorAll("a.dropdown-item").forEach((node) => {
            const text = caseSensitive ? node.textContent : node.textContent.toUpperCase()
            const search = caseSensitive ? string : string.toUpperCase()
            const match = text.includes(search)

            node.parentElement.style.display = match ? "block" : "none"
            if (match) noResults = false
        })

        // Show 'No Results Found' message if no match
        const noResultsElem = ul.querySelector(".no-results-message")
        noResultsElem.style.display = noResults ? "block" : "none"
    }

    // Debounce utility to limit the rate of function execution
    debounce(func, wait) {
        let timeout
        return function (...args) {
            const later = () => {
                clearTimeout(timeout)
                func.apply(this, args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }

    // Remove all options text/value
    clearOptions() {
        const ul = document.getElementById(`${this.elementID}_options`)
        if (ul) {
            // Find and remove only option <li> elements, preserving other content like search bar
            ul.querySelectorAll("li > a.dropdown-item").forEach(li => li.remove())
        }
    }
}

(function ($) {
    $.fn.BetterBSSelect = function (options) {
        // Ensure only one element is selected
        if (this.length !== 1) {
            throw new Error("BetterBSSelect: Plugin can only be initialized on a single element.")
        }

        // Default options
        const defaults = {
            searchable: false,
            caseSensitive: false,
            maxHeight: "250px",
            options: []
        }

        // Merge user options with default options
        options = $.extend({}, defaults, options)

        // Get the single element
        const element = this.first()
        const elementID = element.attr('id')

        // Check if the element has an ID
        if (!elementID) {
            throw new Error("BetterBSSelect: Element must have a valid ID.")
        }

        // Ensure the element is a button
        if (element.prop('tagName') !== "BUTTON") {
            throw new Error("BetterBSSelect: Element must be a button.")
        }

        // Initialize the BetterBSSelect class
        const instance = new BetterBSSelect(elementID, options)

        // Store the instance in the data attribute for later access
        element.data('betterBSSelect', instance)

        // Return the BetterBSSelect instance
        return instance
    }
}(jQuery))

// #endregion

// #region CheckboxDropdown
class CheckboxDropdown {
    static instances = {}

    constructor(elementID, options = {}) {
        const existingInstance = CheckboxDropdown.instances[elementID]
        if (existingInstance) {
            return existingInstance
        }

        this.options = Object.assign({
            selectAll: false,
            maxHeight: "250px",
            options: []
        }, options)

        this.elementID = elementID
        const button = document.getElementById(elementID)

        if (!button) {
            throw new Error(`Element with ID ${elementID} not found.`)
        }
        if (button.tagName !== "BUTTON") {
            throw new Error(`Element with ID ${elementID} is not a button.`)
        }

        this.initDropdown(button)
        this.addOptions(this.options.options)

        if (this.options.selectAll) {
            this.initSelectAllHandler(button)
        }

        CheckboxDropdown.instances[elementID] = this
    }

    initDropdown(button) {
        button.setAttribute("data-bs-toggle", "dropdown")
        button.setAttribute("aria-expanded", "false")

        const ul = document.createElement("ul")
        ul.className = "dropdown-menu"
        ul.id = `${this.elementID}_options`
        ul.setAttribute("aria-labelledby", this.elementID)
        Object.assign(ul.style, {
            overflowY: 'auto',
            maxHeight: this.options.maxHeight
        })

        if (this.options.selectAll) {
            ul.innerHTML = `
                <li>
                    <a class="dropdown-item" href="#" id="${this.elementID}_selectAll">
                        <input type="checkbox">
                        Select All
                    </a>
                </li>
                <li class="dropdown-divider">
                    <hr>
                </li>`
        }

        button.after(ul)
    }

    initSelectAllHandler(button) {
        const selectAll = document.getElementById(`${this.elementID}_selectAll`)
        if (selectAll) {
            selectAll.addEventListener("click", (e) => {
                e.stopPropagation()
                const input = selectAll.querySelector("input")
                input.checked = !input.checked

                this.toggleSelectAll(input.checked)

                const selectAllEvent = new CustomEvent('cbdd-selectAll', {
                    detail: { checked: input.checked }
                })
                button.dispatchEvent(selectAllEvent)
            })
        }
    }

    addOptions(options) {
        options.forEach(option => this.addOption(option))
    }

    addOption(option) {
        const ul = document.getElementById(`${this.elementID}_options`)
        const { label, value, checked } = this.parseOption(option)

        const li = document.createElement("li")
        li.innerHTML = `
            <a class="dropdown-item" href="#">
                <input type="checkbox" value="${value}" ${checked ? "checked" : ""}>
                ${label}
            </a>`

        this.addOptionEventListener(li)
        ul.appendChild(li)

        this.updateSelectAllState()
    }

    parseOption(option) {
        if (typeof option === "object") {
            return {
                label: option.label || "",
                value: option.value || "",
                checked: option.checked !== undefined ? option.checked : true
            }
        } else if (typeof option === "string" || typeof option === "number") {
            return {
                label: option,
                value: option,
                checked: true
            }
        }
        return { label: "", value: "", checked: false }
    }

    addOptionEventListener(li) {
        const button = document.getElementById(this.elementID)
        li.addEventListener("click", (e) => {
            e.stopPropagation()
            const input = li.querySelector("input")
            input.checked = !input.checked

            const selectEvent = new CustomEvent('cbdd-optionSelected', {
                detail: { label: input.nextSibling.textContent.trim(), value: input.value.trim(), checked: input.checked }
            })
            button.dispatchEvent(selectEvent)

            this.updateSelectAllState()
        })
    }

    toggleSelectAll(checked) {
        const ul = document.getElementById(`${this.elementID}_options`)
        ul.querySelectorAll("li > a.dropdown-item input[type='checkbox']").forEach(checkbox => {
            checkbox.checked = checked
        })
    }

    updateSelectAllState() {
        const selectAll = document.getElementById(`${this.elementID}_selectAll`)
        if (!selectAll) return

        const allCheckboxes = document.querySelectorAll(`#${this.elementID}_options li > a.dropdown-item:not(#${this.elementID}_selectAll) input[type='checkbox']`)
        const allChecked = Array.from(allCheckboxes).every(checkbox => checkbox.checked)

        selectAll.querySelector("input").checked = allChecked
    }

    getCheckedOptions() {
        const checkboxes = document.querySelectorAll(`#${this.elementID}_options li > a.dropdown-item input[type='checkbox']`)

        const checkedOptions = Array.from(checkboxes).filter(checkbox => {
            const isSelectAll = checkbox.closest('a').id === `${this.elementID}_selectAll`
            return checkbox.checked && !isSelectAll
        })

        return checkedOptions.map(checkbox => ({
            value: checkbox.value.trim(),
            label: checkbox.nextSibling.textContent.trim()
        }))
    }

    clearOptions() {
        const ul = document.getElementById(`${this.elementID}_options`)
        if (ul) {
            ul.querySelectorAll("li > a.dropdown-item").forEach(li => li.remove())
        }
    }
}


(function ($) {
    $.fn.CheckboxDropdown = function (options) {
        if (this.length !== 1) {
            throw new Error("CheckboxDropdown: Plugin can only be initialized on a single element.")
        }

        const element = this.first()
        const elementID = element.attr('id')

        const instance = new CheckboxDropdown(elementID, options)

        element.data('checkboxDropdown', instance)

        return instance
    }
}(jQuery))
// #endregion

// #region DateTimeInput


// #endregion

// #region FormValidation
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
// #endregion