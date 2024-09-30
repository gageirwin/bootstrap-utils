$('<style>').prop('type', 'text/css').html(`
    .dti-calender-month-control {
        width: 3ch;
        text-align: center;
    }

    .dti-calender-item-week {
        width: 3ch;
        text-align: center;
        font-weight: bold;
    }

    .dti-calender-day {
        width: 3.2ch;
        text-align: center;
        color: inherit;
        text-decoration: none;
    }

    .dti-calender-day:hover {
        background: #e4e1e1;
    }

    .dti-calender-day-today{
        color: blue;
        font-weight: bold;
        width: 3ch;
    }

    .dti-calender-day-disabled{
        color: #aaa
    }

    .dti-time-display {
        width: 2ch; 
        text-align: center;
    }
`).appendTo('head')

class DateTimeInput {

    static instances = {}
    static validInputTypes = ["time", "text", "date", "datetime-local"]

    static getInstance(selector, options) {
        return DateTimeInput.instances[selector] || new DateTimeInput(selector, options)
    }

    constructor(selector, options = {}) {

        const $input = $(selector)
        if ($input.prop("tagName") !== "INPUT" || !DateTimeInput.validInputTypes.includes($input.prop("type"))) {
            throw Error("Invalid input type or element.")
        }
        if (DateTimeInput.instances[selector]) return DateTimeInput.instances[selector]

        this.$input = $input
        this.validateOptions(options)
        this.loadOptions(options)

        this.$input.attr("data-bs-toggle", "dropdown").off("click").on("click", (e) => e.preventDefault())

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

        DateTimeInput.instances[selector] = this
    }

    initTimeMenu() {
        const menu = this.getTimeMenu()
        this.$menu = $(`<div class="dropdown-menu p-2" style="width: min-content;min-width: auto;">${menu}</div>`)
        this.$input.after(this.$menu)
        this.updateClock()
        this.setTimeEventHandlers()
    }

    initDateMenu() {
        const menu = this.getDateMenu()
        this.$menu = $(`<div class="dropdown-menu p-2" style="width: min-content;min-width: auto;">${menu}</div>`)
        this.$input.after(this.$menu)
        this.setDate().updateCalender()
        this.setDateEventHandlers()
    }

    initDateTimeMenu() {
        const menuTime = this.getTimeMenu()
        const menuDate = this.getDateMenu()
        this.$menu = $(`
                <div class="dropdown-menu p-2" style="width: min-content;min-width: auto;">
                    <div class="d-flex">
                        ${menuDate}
                        ${menuTime}
                    </div>
                </div>`)
        this.$input.after(this.$menu)
        this.setDate().updateCalender()
        this.updateClock()
        this.setTimeEventHandlers()
        this.setDateEventHandlers()
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
            let {
                initHours = now.getHours(),
                initMinutes = now.getMinutes(),
                initPeriod
            } = options

            if (this.hour12) {
                initHours = initHours % 12 || 12
                initHours += initPeriod === "PM" ? 12 : 0
            }

            this.hour = initHours
            this.minute = initMinutes
        }
        if (isDateOrDatetime) {
            this.dateFormat = {
                method: "toDateString",
                params: null
            }

            this.calender = {
                month: now.getMonth(),
                monthStr: now.toLocaleString('default', { month: 'long' }),
                selectedDay: now.getDate(),
                year: now.getFullYear()
            }
        }
    }

    getTimeMenu() {
        return `
            <div class="d-flex justify-content-center align-items-center">
                <div>
                    <div class="d-flex justify-content-center mb-2">
                        <a id="increment-hour" href="#" class="mx-2">
                            <i class="bi bi-caret-up-fill dti-time-display"></i>
                        </a>
                        <div class="mx-1"></div>
                        <a id="increment-minute" href="#" class="mx-2">
                            <i class="bi bi-caret-up-fill dti-time-display"></i>
                        </a>
                    </div>

                    <div class="d-flex justify-content-center align-items-center mb-2">
                        <div id="hour" class="dti-time-display mx-2">0</div>
                        <div class="mx-1">:</div>
                        <div id="minute" class="dti-time-display mx-2">00</div>
                    </div>

                    <div class="d-flex justify-content-center">
                        <a id="decrement-hour" href="#" class="mx-2">
                            <i class="bi bi-caret-down-fill dti-time-display"></i>
                        </a>
                        <div class="mx-1"></div>
                        <a id="decrement-minute" href="#" class="mx-2">
                            <i class="bi bi-caret-down-fill dti-time-display"></i>
                        </a>
                    </div>
                </div>
                ${this.hour12 ? `
                <div class="ms-2">
                    <button type="button" id="period" class="btn btn-primary" style="width: 6ch;"></button>
                </div>
                ` : ""}
            </div>`
    }

    getDateMenu() {
        return `
            <div class="row">

                <div class="d-flex justify-content-between align-items-center">
                    <div id="calender-month-year" class="flex-fill"></div>
                    <a href="calender-month-prev" class="dti-calender-month-control"><i class="bi bi-caret-left-fill"></i></a>
                    <a href="calender-month-next" class="dti-calender-month-control"><i class="bi bi-caret-right-fill"></i></a>
                </div>

                <div class="d-flex justify-content-between align-items-center">
                    <div class="dti-calender-item-week">Su</div>
                    <div class="dti-calender-item-week">Mo</div>
                    <div class="dti-calender-item-week">Tu</div>
                    <div class="dti-calender-item-week">We</div>
                    <div class="dti-calender-item-week">Th</div>
                    <div class="dti-calender-item-week">Fr</div>
                    <div class="dti-calender-item-week">Sa</div>
                </div>

                <div class="col-12"></div>

                <div id="dti-calender-days" class="d-flex justify-content-center align-items-center flex-wrap"></div>

                <div class="col-12"></div>

                <div class="d-flex justify-content-between align-items-center">
                    <a href="calender-clear" style="text-decoration: none;">Clear</a>
                    <a href="calender-today" style="text-decoration: none;">Today</a>
                </div>

            </div>`
    }

    setTimeEventHandlers() {
        const $period = this.$menu.find("button#period")

        this.$menu.off("click").on("click", (e) => { e.stopPropagation() })

        this.$menu.find("a#increment-hour").off("click").on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.addHour(1).updateClock().setInput()
        })

        this.$menu.find("a#decrement-hour").off("click").on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.addHour(-1).updateClock().setInput()
        })

        this.$menu.find("a#increment-minute").off("click").on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.addMinute(1).updateClock().setInput()
        })

        this.$menu.find("a#decrement-minute").off("click").on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.addMinute(-1).updateClock().setInput()
        })

        if (this.hour12) {
            $period.off("click").on("click", (e) => {
                e.preventDefault()
                e.stopPropagation()
                this.addHour($period.text() === "AM" ? 12 : -12).updateClock().setInput()
            })
        }
    }

    setDateEventHandlers() {
        this.$menu.off("click").on("click", (e) => { e.stopPropagation() })

        this.$menu.find(`a[href="dti-calender-day"]`).off("click").on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.setDate(parseInt($(e.target).text())).updateCalender().setInput()
        })

        this.$menu.find(`a[href="dti-calender-day-lastMonth"]`).off("click").on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.addCalenderMonth(-1)
            this.setDate(parseInt($(e.target).text())).updateCalender().setInput()
        })

        this.$menu.find(`a[href="dti-calender-day-nextMonth"]`).off("click").on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.addCalenderMonth(1)
            this.setDate(parseInt($(e.target).text())).updateCalender().setInput()
        })

        this.$menu.find(`a[href="calender-month-next"]`).off("click").on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.addCalenderMonth(1).updateCalender()
        })

        this.$menu.find(`a[href="calender-month-prev"]`).off("click").on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.addCalenderMonth(-1).updateCalender()
        })

        this.$menu.find(`a[href="calender-clear"]`).off("click").on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            this.clearInput()
        })

        this.$menu.find(`a[href="calender-today"]`).off("click").on("click", (e) => {
            e.preventDefault()
            e.stopPropagation()
            const now = new Date()

            this.calender = {
                month: now.getMonth(),
                monthStr: now.toLocaleString('default', { month: 'long' }),
                selectedDay: now.getDate(),
                year: now.getFullYear()
            }

            this.setDate().updateCalender().setInput()
        })
    }

    getTime(hour12 = this.hour12) {
        let hour = this.hour
        let period = null
        if (hour12) {
            period = this.hour >= 12 ? "PM" : "AM"
            hour = this.hour % 12
            hour = hour === 0 ? 12 : hour
        }
        return [hour, this.minute, period]
    }

    addHour(h) {
        this.hour += h
        this.hour = this.hour === 24 ? 0 : this.hour
        this.hour = this.hour === -1 ? 23 : this.hour
        return this
    }

    addMinute(m) {
        this.minute += m
        if (this.minute === 60) {
            this.minute = 0
            this.addHour(1)
        }
        else if (this.minute === -1) {
            this.minute = 59
            this.addHour(-1)
        }
        return this
    }

    addCalenderYear(y) {
        this.calender.year += y
        return this
    }

    addCalenderMonth(m) {
        this.calender.month += m
        if (this.calender.month === 13) {
            this.calender.month = 1
            this.addCalenderYear(1)
        }
        else if (this.calender.month === 0) {
            this.calender.month = 12
            this.addCalenderYear(-1)
        }
        const date = new Date()
        date.setMonth(this.calender.month)
        this.calender.monthStr = date.toLocaleString('default', { month: 'long' })
        return this
    }

    setHour(h) {
        this.hour = h
    }

    setMinute(m) {
        this.minute = m
    }

    setDate(day = this.calender.selectedDay, month = this.calender.month, year = this.calender.year) {
        this.day = day
        this.month = month
        this.year = year
        this.date = new Date(this.year, this.month, this.day)
        return this
    }

    updateClock() {
        const [hour, minute, period] = this.getTime()
        this.$menu.find("#hour").text(hour)
        this.$menu.find("#minute").text(String(minute).padStart(2, "0"))
        if (period !== undefined)
            this.$menu.find("button#period").text(period)
        return this
    }

    updateCalender() {
        this.$menu.find("#calender-month-year").text(`${this.calender.monthStr} ${this.calender.year}`)
        this.$menu.find("#dti-calender-days").empty()

        let firstDayOfMonth = new Date(this.calender.year, this.calender.month, 1).getDay()
        let lastDateOfMonth = new Date(this.calender.year, this.calender.month + 1, 0).getDate()
        let lastDayOfMonth = new Date(this.calender.year, this.calender.month, lastDateOfMonth).getDay()
        let lastDateOfLastMonth = new Date(this.calender.year, this.calender.month, 0).getDate()

        let dates = []

        for (let i = firstDayOfMonth; i > 0; i--) {
            dates.push(`<a href="dti-calender-day-lastMonth" class="dti-calender-day dti-calender-day-disabled">${lastDateOfLastMonth - i + 1}</a>`)
        }

        for (let i = 1; i <= lastDateOfMonth; i++) {
            const today = (i === this.day && this.month === this.calender.month && this.year === this.calender.year)
            dates.push(`<a href="dti-calender-day" class="dti-calender-day ${today ? "dti-calender-day-today" : ""}">${i}</a>`)
        }

        const remainder = (7 * 6) - dates.length + lastDayOfMonth
        for (let i = lastDayOfMonth; i < remainder; i++) {
            dates.push(`<a href="dti-calender-day-nextMonth" class="dti-calender-day dti-calender-day-disabled">${i - lastDayOfMonth + 1}</a>`)
        }

        this.$menu.find("#dti-calender-days").append(dates.join("\n"))
        this.setDateEventHandlers()
        return this
    }

    setInput() {

        let value
        if (this.type === "time" && this.$input.prop("type") === "time") {
            //"HH:mm"
            value = `${String(this.hour).padStart(2, "0")}:${String(this.minute).padStart(2, "0")}`
        }
        else if (this.type === "time" && this.$input.prop("type") === "text") {
            const [hour, minute, period] = this.getTime()
            value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}${period ? " " + period : ""}`
        }
        else if (this.type === "date" && this.$input.prop("type") === "date") {
            //"yyyy-MM-dd"
            value = this.date.toISOString().split('T')[0]
        }
        else if (this.type === "date" && this.$input.prop("type") === "text") {
            value = this.dateFormat.params !== undefined ?
                this.date[this.dateFormat.method](this.dateFormat.params) :
                this.date[this.dateFormat.method]()
        }
        else if (this.type === "datetime" && this.$input.prop("type") === "datetime-local") {
            //"yyyy-MM-ddTHH:mm"
            value = `${this.year}-${String(this.month).padStart(2, "0")}-${String(this.day).padStart(2, "0")}T${String(this.hour).padStart(2, "0")}:${String(this.minute).padStart(2, "0")}`
        }
        else if (this.type === "datetime" && this.$input.prop("type") === "text") {
            value = `${this.year}-${String(this.month).padStart(2, "0")}-${String(this.day).padStart(2, "0")}T${String(this.hour).padStart(2, "0")}:${String(this.minute).padStart(2, "0")}`
        }
        this.$input.val(value)
        return this
    }

    clearInput() {
        this.$input.val("")
        return this
    }
}