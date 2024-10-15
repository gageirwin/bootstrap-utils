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
    [id*="dti-calender-days-menu"],
    [id*="dti-calender-months-menu"],
    [id*="dti-calender-years-menu"]{
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
    static id = 0

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

        this.id = DateTimeInput.id
        DateTimeInput.id++

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
        this.updateCalenderDaysMenu().updateClock()
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
                        <input type="text" id="hour-${this.id}" class="dti-time-item">
                        <div class="dti-time-sep">:</div>
                        <input type="text" id="minute-${this.id}" class="dti-time-item">
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
            <div id="dti-date-menu-${this.id}" class="row">

                <div class="d-flex justify-content-between align-items-center mb-1">
                    <div data-dti-clickable="month-menu" id="dti-calender-month-${this.id}" class="px-2 py-1"></div>
                    <div data-dti-clickable="year-menu" id="dti-calender-year-${this.id}" class="px-2 py-1"></div>
                    <div data-dti-clickable="prev-month" class="dti-calender-item ms-auto"><i class="bi bi-caret-left-fill"></i></div>
                    <div data-dti-clickable="next-month" class="dti-calender-item"><i class="bi bi-caret-right-fill"></i></div>
                </div>
                
                <div id="dti-calender-days-menu-${this.id}">
                    <div id="dti-calender-days-${this.id}" class="d-flex justify-content-center flex-wrap"></div>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <div data-dti-clickable="clear-calender" class="px-2 py-1">Clear</div>
                        <div data-dti-clickable="today-calender" class="px-2 py-1">Today</div>
                    </div>
                </div>

                <div id="dti-calender-months-menu-${this.id}" style="display:none;">
                    <div id="dti-calender-months-${this.id}" class="d-flex justify-content-center flex-wrap"></div>
                    <div class="d-flex justify-content-center align-items-center mt-2">
                        <div data-dti-clickable="cancel-month-selection" class="px-2 py-1">Cancel</div>
                    </div>
                </div>

                <div id="dti-calender-years-menu-${this.id}" style="display:none;">
                    <div id="dti-calender-years-${this.id}" class="d-flex justify-content-center flex-wrap"></div>
                    <div class="d-flex justify-content-center align-items-center mt-2">
                        <div data-dti-clickable="cancel-year-selection" class="px-2 py-1">Cancel</div>
                    </div>
                </div>

            </div>`
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
                    this.updateCalenderMonthMenu()
                    this.showMonthsMenu()
                    break
                case "select-month":
                    this.setCalender(this.calender.getFullYear(), $target.attr("value")).updateCalenderDaysMenu()
                    this.showDaysMenu()
                    break
                case "year-menu":
                    this.updateCalenderYearMenu()
                    this.showYearsMenu()
                    break
                case "select-year":
                    this.setCalender($target.attr("value"), this.calender.getMonth()).updateCalenderDaysMenu()
                    this.showDaysMenu()
                    break
                case "cancel-year-selection":
                case "cancel-month-selection":
                    this.showDaysMenu()
                    break
            }
        })
    }

    showDaysMenu() {
        this.$menu.find(`#dti-calender-months-menu-${this.id}, #dti-calender-years-menu-${this.id}`).hide()
        this.$menu.find(`#dti-calender-days-menu-${this.id}`).show()
    }

    showMonthsMenu() {
        this.$menu.find(`#dti-calender-days-menu-${this.id}, #dti-calender-years-menu-${this.id}`).hide()
        this.$menu.find(`#dti-calender-months-menu-${this.id}`).show()
    }

    showYearsMenu() {
        this.$menu.find(`#dti-calender-months-menu-${this.id}, #dti-calender-days-menu-${this.id}`).hide()
        this.$menu.find(`#dti-calender-years-menu-${this.id}`).show()
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

        this.$menu.find(`#hour-${this.id}`).val(hour)
        this.$menu.find(`#minute-${this.id}`).val(String(minute).padStart(2, "0"))
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

        this.$menu.find(`#dti-calender-month-${this.id}`).text(this.calender.toLocaleString('default', { month: 'long' }))
        this.$menu.find(`#dti-calender-year-${this.id}`).text(cal_year)

        let firstDayOfMonth = new Date(cal_year, cal_month, 1).getDay()
        let lastDateOfMonth = new Date(cal_year, cal_month + 1, 0).getDate()
        let lastDayOfMonth = new Date(cal_year, cal_month, lastDateOfMonth).getDay()
        let lastDateOfLastMonth = new Date(cal_year, cal_month, 0).getDate()

        const date_header = [
            `<div class="dti-calender-item fw-bold">Su</div>`,
            `<div class="dti-calender-item fw-bold">Mo</div>`,
            `<div class="dti-calender-item fw-bold">Tu</div>`,
            `<div class="dti-calender-item fw-bold">We</div>`,
            `<div class="dti-calender-item fw-bold">Th</div>`,
            `<div class="dti-calender-item fw-bold">Fr</div>`,
            `<div class="dti-calender-item fw-bold">Sa</div>`,
        ]

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

        this.$menu.find(`#dti-calender-days-${this.id}`).empty()
            .append(date_header.join("\n"))
            .append(date_divs.join("\n"))

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
        this.$menu.find(`#dti-calender-months-${this.id}`).empty()
            .append(month_divs.join("\n"))

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
        this.$menu.find(`#dti-calender-years-${this.id}`).empty()
            .append(year_divs.join("\n"))

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