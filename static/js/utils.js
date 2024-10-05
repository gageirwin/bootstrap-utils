
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
$('<style>').prop('type', 'text/css').text(`
    :root{
        --dti-highlight: rgba(180, 180, 180, 0.47)
    }
    :root[data-bs-theme="dark"]{
        --dti-highlight: rgba(0, 0, 0, 0.47)
    }

    [data-dti-clickable]{
        cursor: pointer;
    }
    [data-dti-clickable]:hover{
        background: var(--dti-highlight);
    }
    .dti-dropdown-menu{
        width: min-content;
        min-width: auto;
    }

    /* Clock */
    .dti-time-item {
        display:flex;
        align-items: center;
        justify-content:center;
        width: 2rem;
        height: 2rem;
    }
    .dti-time-sep{
        display:flex;
        align-items: center;
        justify-content:center;
        width: 1rem;
        height: 2rem;
    }
    .dti-time-period{
        width: 3.1rem;
    }

    /* Calender */
    #dti-calender-days-menu, #dti-calender-month-menu, #dti-calender-year-menu{
        width: 256px;
        height: 260px;
    }
    .dti-calender-item {
        display:flex;
        align-items: center;
        justify-content:center;
        width: 2rem;
        height: 2rem;
    }
    .dti-calender-item-today{
        color: var(--bs-primary);
        font-weight: bold;
    }
    .dti-calender-item-disabled{
        color: #aaa
    }
    .dti-calender-item-month{
        display:flex;
        align-items: center;
        justify-content:center;
        width: 4.8rem;
        height: 3rem;
    }
    .dti-calender-item-year{
        display:flex;
        align-items: center;
        justify-content:center;
        width: 4.8rem;
        height: 3rem;  
    }
    .dti-calender-month-current, .dti-calender-year-current{
        color: var(--bs-primary)
    }

`).appendTo('head')

class DateTimeInput {

    static instances = {}
    static validInputTypes = ["time", "text", "date", "datetime-local"]

    static getInstance(selector, options) {
        const $input = $(selector)
        return DateTimeInput.instances[$input.attr("id")] || new DateTimeInput(selector, options)
    }

    constructor(selector, options = {}) {

        const $input = $(selector)
        if (
            $input.prop("tagName") !== "INPUT" ||
            !DateTimeInput.validInputTypes.includes($input.prop("type")) ||
            $input.length !== 1 ||
            !$input.attr("id")
        ) {
            throw Error("Invalid input type or element.")
        }
        if (DateTimeInput.instances[$input.attr("id")]) return DateTimeInput.instances[$input.attr("id")]

        this.$input = $input
        this.validateOptions(options)
        this.loadOptions(options)

        this.$input.attr("data-bs-toggle", "dropdown")

        switch (this.type) {
            case "time":
                this.initTimeMenu()
                break
            case "date":
                this.initDateMenu()
                break
            case "datetime":
                this.initDateTimeMenu()
                break
        }

        this.$menu.on("click", (e) => { e.stopPropagation() })

        this.setEventHandlers()

        DateTimeInput.instances[$input.attr("id")] = this
    }

    initTimeMenu() {
        const menu = this.getTimeMenu()
        this.$menu = $(`<div class="dropdown-menu p-2 dti-dropdown-menu">${menu}</div>`)
        this.$input.after(this.$menu)
        this.updateClock()
    }

    initDateMenu() {
        const menu = this.getDateMenu()
        this.$menu = $(`<div class="dropdown-menu p-2 dti-dropdown-menu">${menu}</div>`)
        this.$input.after(this.$menu)
        this.updateCalenderDaysMenu()

    }

    initDateTimeMenu() {
        const menuTime = this.getTimeMenu()
        const menuDate = this.getDateMenu()
        this.$menu = $(`
                <div class="dropdown-menu p-2 dti-dropdown-menu">
                    <div class="d-flex">
                        ${menuDate}
                        <div class="ms-2 me-2 vr"></div>
                        ${menuTime}
                    </div>
                </div>`)
        this.$input.after(this.$menu)
        this.updateCalenderDaysMenu()
        this.updateClock()
    }

    validateOptions(options) {
        if (options.initHours !== undefined && options.initMinutes === undefined) {
            throw new Error("'initHours' and 'initMinutes' must both be provided.")
        }

        if (options.hour12 && (options.initHours || options.initMinutes) && !["AM", "PM"].includes(options.initPeriod)) {
            throw new Error("In 12-hour format, 'initPeriod' (AM/PM) must be provided.")
        }

        if (!options.type && this.$input.prop("type") === "text") {
            throw new Error("For text inputs, 'type' must be specified.")
        }
    }

    loadOptions(options) {
        this.type = options.type ??
            (this.$input.prop("type") === "datetime-local" ? "datetime" : this.$input.prop("type"))

        const now = new Date()
        const isTimeOrDatetime = this.type === "time" || this.type === "datetime"
        const isDateOrDatetime = this.type === "date" || this.type === "datetime"

        if (isTimeOrDatetime) {
            this.hour12 = options.hour12 ?? true
            this.time = new Date(0, 0, 0, now.getHours(), now.getMinutes())
        }
        if (isDateOrDatetime) {
            this.calender = new Date(now.getFullYear(), now.getMonth())
            this.date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
    }

    getTimeMenu() {
        return `
            <div class="d-flex justify-content-center align-items-center">
                <div>
                    <div class="d-flex">
                        <div data-dti-clickable="increment-hour" class="dti-time-item"><i class="bi bi-caret-up-fill"></i></div>
                        <div class="dti-time-sep">&nbsp;</div>
                        <div data-dti-clickable="increment-minute" class="dti-time-item"><i class="bi bi-caret-up-fill"></i></div>
                    </div>

                    <div class="d-flex my-2">
                        <div id="hour" class="dti-time-item">0</div>
                        <div class="dti-time-sep">:</div>
                        <div id="minute" class="dti-time-item">00</div>
                    </div>

                    <div class="d-flex">
                        <div data-dti-clickable="decrement-hour" class="dti-time-item"><i class="bi bi-caret-down-fill"></i></div>
                        <div class="dti-time-sep">&nbsp;</div>
                        <div data-dti-clickable="decrement-minute" class="dti-time-item"><i class="bi bi-caret-down-fill"></i></div>
                    </div>
                </div>
                ${this.hour12 ? `
                <div class="mx-1">
                    <div data-dti-clickable="change-period" class="btn btn-primary dti-time-period"></div>
                </div>
                ` : ""}
            </div>`
    }

    getDateMenu() {
        return `
            <div id="dti-date-menu" class="row">

                <div class="d-flex justify-content-between align-items-center mb-1">
                    <div data-dti-clickable="month-menu" id="dti-calender-month" class="px-2 py-1"></div>
                    <div data-dti-clickable="year-menu" id="dti-calender-year" class="px-2 py-1"></div>
                    <div data-dti-clickable="prev-month" class="dti-calender-item ms-auto"><i class="bi bi-caret-left-fill"></i></div>
                    <div data-dti-clickable="next-month" class="dti-calender-item"><i class="bi bi-caret-right-fill"></i></div>
                </div>
                
                <div id="dti-calender-days-menu">
                    <div class="d-flex">
                        <div class="dti-calender-item fw-bold">Su</div>
                        <div class="dti-calender-item fw-bold">Mo</div>
                        <div class="dti-calender-item fw-bold">Tu</div>
                        <div class="dti-calender-item fw-bold">We</div>
                        <div class="dti-calender-item fw-bold">Th</div>
                        <div class="dti-calender-item fw-bold">Fr</div>
                        <div class="dti-calender-item fw-bold">Sa</div>
                    </div>
                    <div id="dti-calender-days" class="d-flex flex-wrap"></div>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <div data-dti-clickable="clear-calender" class="px-2 py-1">Clear</div>
                        <div data-dti-clickable="today-calender" class="px-2 py-1">Today</div>
                    </div>
                </div>

                <div id="dti-calender-month-menu" style="display:none;">
                    <div id="dti-calender-months" class="d-flex justify-content-center flex-wrap"></div>
                    <div class="d-flex justify-content-center align-items-center mt-2">
                        <div data-dti-clickable="cancel-month-selection" class="px-2 py-1">Cancel</div>
                    </div>
                </div>

                <div id="dti-calender-year-menu" style="display:none;">
                    <div id="dti-calender-years" class="d-flex justify-content-center flex-wrap"></div>
                    <div class="d-flex justify-content-center align-items-center mt-2">
                        <div data-dti-clickable="cancel-year-selection" class="px-2 py-1">Cancel</div>
                    </div>
                </div>

            </div>`
    }

    getYearMenu() {

    }

    setEventHandlers() {
        this.$menu.children(":first").off("click").on("click", "div[data-dti-clickable]", (e) => {
            e.preventDefault()
            e.stopPropagation()
            const $target = $(e.currentTarget)
            switch ($target.data("dti-clickable")) {
                case "increment-hour":
                    this.addHours(1).updateClock().setInputVal()
                    break
                case "decrement-hour":
                    this.addHours(-1).updateClock().setInputVal()
                    break
                case "increment-minute":
                    this.addMinutes(1).updateClock().setInputVal()
                    break
                case "decrement-minute":
                    this.addMinutes(-1).updateClock().setInputVal()
                    break
                case "change-period":
                    this.addHours($target.text() === "AM" ? 12 : -12).updateClock().setInputVal()
                    break
                case "dti-calender-day":
                    this.setDate(parseInt($target.text())).updateCalenderDaysMenu().setInputVal()
                    break
                case "last-month-date":
                    this.addCalenderMonths(-1).setDate(parseInt($target.text())).updateCalenderDaysMenu().setInputVal()
                    break
                case "next-month-date":
                    this.addCalenderMonths(1).setDate(parseInt($target.text())).updateCalenderDaysMenu().setInputVal()
                    break
                case "next-month":
                    this.addCalenderMonths(1).updateCalenderDaysMenu()
                    break
                case "prev-month":
                    this.addCalenderMonths(-1).updateCalenderDaysMenu()
                    break
                case "clear-calender":
                    this.clearInput()
                    break
                case "today-calender":
                    const now = new Date()
                    this.setDate(now.getDate(), now.getMonth(), now.getFullYear())
                        .updateCalenderDaysMenu()
                        .setInputVal()
                    break
                case "month-menu":
                    this.$menu.find("#dti-calender-days-menu").hide()
                    this.$menu.find("#dti-calender-year-menu").hide()
                    this.updateCalenderMonthMenu()
                    this.$menu.find("#dti-calender-month-menu").show()
                    break
                case "select-month":
                    this.$menu.find("#dti-calender-days-menu").show()
                    this.$menu.find("#dti-calender-month-menu").hide()
                    this.setCalender(this.calender.getFullYear(), $target.attr("value"))
                    this.updateCalenderDaysMenu()
                    break
                case "year-menu":
                    this.$menu.find("#dti-calender-days-menu").hide()
                    this.$menu.find("#dti-calender-month-menu").hide()
                    this.updateCalenderYearMenu()
                    this.$menu.find("#dti-calender-year-menu").show()
                    break
                case "select-year":
                    this.$menu.find("#dti-calender-days-menu").show()
                    this.$menu.find("#dti-calender-year-menu").hide()
                    this.setCalender($target.attr("value"), this.calender.getMonth())
                    this.updateCalenderDaysMenu()
                    break
                case "cancel-year-selection":
                case "cancel-month-selection":
                    this.$menu.find("#dti-calender-month-menu").hide()
                    this.$menu.find("#dti-calender-year-menu").hide()
                    this.$menu.find("#dti-calender-days-menu").show()
                    break
            }
        })
    }

    setDate(day, month = this.calender.getMonth(), year = this.calender.getFullYear()) {
        this.date.setFullYear(year)
        this.date.setMonth(month)
        this.date.setDate(day)
        this.setCalender(year, month)
        return this
    }

    setCalender(year, month) {
        this.calender.setFullYear(year)
        this.calender.setMonth(month)
        return this
    }

    addHours(hours) {
        this.time.setHours(this.time.getHours() + hours)
        return this
    }

    addMinutes(minutes) {
        this.time.setMinutes(this.time.getMinutes() + minutes)
        return this
    }

    addCalenderYears(years) {
        this.calender.setFullYear(this.calender.getFullYear() + years)
        return this
    }

    addCalenderMonths(months) {
        this.calender.setMonth(this.calender.getMonth() + months)
        return this

    }

    updateClock() {
        let hour = this.time.getHours()
        const minute = this.time.getMinutes()
        let period

        if (this.hour12) {
            period = hour >= 12 ? "PM" : "AM"
            hour = hour % 12
            hour = hour === 0 ? 12 : hour
        }

        this.$menu.find("#hour").text(hour)
        this.$menu.find("#minute").text(String(minute).padStart(2, "0"))
        if (period !== undefined)
            this.$menu.find(`div[data-dti-clickable="change-period"]`).text(period)
        return this
    }

    updateCalenderDaysMenu() {
        const cal_year = this.calender.getFullYear()
        const cal_month = this.calender.getMonth()

        const year = this.date.getFullYear()
        const month = this.date.getMonth()
        const day = this.date.getDate()

        this.$menu.find("#dti-calender-month").text(this.calender.toLocaleString('default', { month: 'long' }))
        this.$menu.find("#dti-calender-year").text(cal_year)

        let firstDayOfMonth = new Date(cal_year, cal_month, 1).getDay()
        let lastDateOfMonth = new Date(cal_year, cal_month + 1, 0).getDate()
        let lastDayOfMonth = new Date(cal_year, cal_month, lastDateOfMonth).getDay()
        let lastDateOfLastMonth = new Date(cal_year, cal_month, 0).getDate()

        const date_divs = []

        for (let i = firstDayOfMonth; i > 0; i--) {
            date_divs.push(`<div data-dti-clickable="last-month-date" class="dti-calender-item dti-calender-item-disabled">${lastDateOfLastMonth - i + 1}</div>`)
        }

        for (let i = 1; i <= lastDateOfMonth; i++) {
            const today = (i === day && month === cal_month && year === cal_year)
            date_divs.push(`
                <div data-dti-clickable="dti-calender-day" class="dti-calender-item ${today ? "dti-calender-item-today" : ""}">
                    <span>${i}</span>
                </div>`)
        }

        const remainder = (7 * 6) - date_divs.length + lastDayOfMonth
        for (let i = lastDayOfMonth; i < remainder; i++) {
            date_divs.push(`<div data-dti-clickable="next-month-date" class="dti-calender-item dti-calender-item-disabled">${i - lastDayOfMonth + 1}</div>`)
        }

        this.$menu.find("#dti-calender-days").empty()
        this.$menu.find("#dti-calender-days").append(date_divs.join("\n"))

        this.setEventHandlers()
        return this
    }

    updateCalenderMonthMenu() {
        const cal_month = this.calender.getMonth()
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const month_divs = []
        months.forEach((month, index) => {
            month_divs.push(`<div data-dti-clickable="select-month" class="dti-calender-item-month fw-bold ${index === cal_month ? "dti-calender-month-current" : ""}" value="${index}">${month}</div>`)
        })
        this.$menu.find("#dti-calender-months").empty()
        this.$menu.find("#dti-calender-months").append(month_divs.join("\n"))

        this.setEventHandlers()
        return this
    }

    // needs to be generalized
    updateCalenderYearMenu() {
        const cal_year = this.calender.getFullYear()

        const years = [
            cal_year - 4,
            cal_year - 3,
            cal_year - 2,
            cal_year - 1,
            cal_year,
            cal_year + 1,
            cal_year + 2,
            cal_year + 3,
            cal_year + 4,
            cal_year + 5,
            cal_year + 6,
            cal_year + 7]
        const year_divs = []
        years.forEach((year) => {
            year_divs.push(`<div data-dti-clickable="select-year" class="dti-calender-item-year fw-bold ${year === cal_year ? "dti-calender-year-current" : ""}" value="${year}">${year}</div>`)
        })
        this.$menu.find("#dti-calender-years").empty()
        this.$menu.find("#dti-calender-years").append(year_divs.join("\n"))

        this.setEventHandlers()
        return this
    }

    setInputVal() {
        let value
        if (this.type === "time") {
            value = `${String(this.time.getHours()).padStart(2, "0")}:${String(this.time.getMinutes()).padStart(2, "0")}`
        }
        else if (this.type === "date") {
            value = this.date.toISOString().split('T')[0]
        }
        else if (this.type === "datetime") {
            value = this.date.toISOString().split('T')[0] + "T" + `${String(this.time.getHours()).padStart(2, "0")}:${String(this.time.getMinutes()).padStart(2, "0")}`
        }
        this.$input.val(value).trigger("change")
        return this
    }

    clearInput() {
        this.$input.val("").trigger("change")
        return this
    }
}

(function ($) {
    $.fn.DateTimeInput = function (options) {
        if (this.length === 1)
            return new DateTimeInput(this[0], options)
        return this.each(function () {
            new DateTimeInput(this, options)
        })
    }
}(jQuery))

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