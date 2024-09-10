
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
            paging: false,
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