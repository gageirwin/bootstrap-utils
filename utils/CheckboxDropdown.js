/**
 * CheckboxDropdown class allows you to create a Bootstrap dropdown with selectable checkboxes.
 * It includes an optional "Select All" functionality and dynamic option management.
 * 
 * Usage:
 * 1. Instantiate a CheckboxDropdown by passing the button element ID and optional configuration.
 *    - `elementID`: The ID of the button element that triggers the dropdown.
 *    - `options`: Configuration options for the dropdown, which may include:
 *      - `selectAll`: Boolean to include a "Select All" checkbox (default: false).
 *      - `maxHeight`: Max height for the dropdown menu (default: "250px").
 *      - `options`: An array of options to populate the dropdown. Each option can be:
 *          - A string or number (used as both label and value).
 *          - An object with `label`, `value`, and `checked` (default is checked).
 * 
 * Example:
 * 
 * const dropdown = new CheckboxDropdown('myDropdownButton', {
 *     selectAll: true,
 *     maxHeight: "300px",
 *     options: [
 *         { label: 'Option 1', value: 'opt1', checked: true },
 *         { label: 'Option 2', value: 'opt2', checked: false },
 *         'Option 3'
 *     ]
 * });
 * 
 * Methods:
 * - `getCheckedOptions()`: Returns an array of the currently checked options, excluding "Select All".
 * - `clearOptions()`: Clears all options from the dropdown.
 * 
 * Events:
 * - `cbdd-selectAll`: Triggered when the "Select All" checkbox is toggled.
 * - `cbdd-optionSelected`: Triggered when an individual option is selected or deselected.
 * 
 * Notes:
 * - Each instance is tied to a unique button element via its ID.
 * - If an instance already exists for the button, the existing one is returned.
 */


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

/**
 * jQuery plugin to initialize the CheckboxDropdown class on a button element.
 * 
 * Usage:
 * 1. Call the plugin on a button element using jQuery and pass optional configuration.
 * 
 * Example:
 * 
 * $('#myDropdownButton').CheckboxDropdown({
 *     selectAll: true,
 *     maxHeight: "300px",
 *     options: [
 *         { label: 'Option 1', value: 'opt1', checked: true },
 *         { label: 'Option 2', value: 'opt2', checked: false },
 *         'Option 3'
 *     ]
 * });
 * 
 * Parameters:
 * - `options`: An object of configuration settings for the CheckboxDropdown (optional).
 *    - `selectAll`: Boolean to include a "Select All" checkbox (default: false).
 *    - `maxHeight`: Max height for the dropdown menu (default: "250px").
 *    - `options`: Array of options to populate the dropdown.
 * 
 * Notes:
 * - The plugin can only be initialized on a single element at a time.
 * - The initialized instance is stored as jQuery data under the `checkboxDropdown` key.
 * - If the plugin is called on multiple elements, an error will be thrown.
 * 
 * Returns:
 * - A reference to the initialized CheckboxDropdown instance.
 */


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