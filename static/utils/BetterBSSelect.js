
/**
 * Class: BetterBSSelect
 * 
 * A custom Bootstrap-based select dropdown with optional search functionality. This class enhances a button element
 * to behave like a select dropdown, allowing for searchable and customizable options.
 * 
 * @property {Object} instances - Static property to store instances of BetterBSSelect, keyed by element ID.
 * @property {Object} options - Configuration options for each instance.
 * @property {string} elementID - The ID of the button element being enhanced.
 * 
 * Options:
 * - `searchable` (boolean): Enable or disable a search input inside the dropdown.
 * - `caseSensitive` (boolean): Whether the search should be case-sensitive.
 * - `maxHeight` (string): Maximum height of the dropdown list (default "250px").
 * - `options` (array): List of options to be displayed in the dropdown. Can be strings, numbers, or objects { text, value }.
 * 
 * Usage:
 * 
 * 1. Initialize a new instance:
 * 
 *    const select = new BetterBSSelect('buttonID', { 
 *      searchable: true, 
 *      caseSensitive: false, 
 *      options: ['Option 1', 'Option 2'] 
 *    });
 * 
 * 2. Add more options after initialization:
 * 
 *    select.addOptions([{ text: 'New Option', value: 'new_option' }]);
 * 
 * 3. Clear all existing options:
 * 
 *    select.clearOptions();
 * 
 * 4. Filtering options using the built-in search input:
 * 
 *    The search input is automatically created when `searchable` is set to true. The user can filter options by typing.
 * 
 * 5. Event listeners:
 * 
 * - 'bbss-searchInput': Triggered when the user types into the search box, with the search query in the event detail.
 * - 'bbss-optionSelected': Triggered when the user selects an option, providing the selected option's text and value in the event detail.
 * 
 * Example HTML structure:
 * 
 * <button id="buttonID" class="btn btn-primary">Select an option</button>
 */


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

/**
 * jQuery Plugin: BetterBSSelect
 * 
 * A jQuery plugin wrapper for the BetterBSSelect class, allowing you to easily instantiate and manage BetterBSSelect instances
 * on button elements within the jQuery framework.
 * 
 * Usage:
 * 
 * 1. Initialize BetterBSSelect on a button element:
 * 
 *    $('#buttonID').BetterBSSelect({
 *      searchable: true,
 *      caseSensitive: false,
 *      options: ['Option 1', 'Option 2']
 *    });
 * 
 *    - The button element must have a valid ID, and the plugin can only be applied to a single button element at a time.
 *    - The plugin will instantiate the BetterBSSelect class for the selected button element and store the instance in the element's data attribute.
 * 
 * 2. Access the BetterBSSelect instance:
 * 
 *    var instance = $('#buttonID').data('betterBSSelect');
 * 
 *    - This allows access to the BetterBSSelect instance, where you can call methods like `addOptions()` or `clearOptions()` on the instance.
 * 
 * 3. Example Options:
 * 
 *    The plugin accepts the following options:
 *    - `searchable` (boolean): Enable or disable search functionality in the dropdown.
 *    - `caseSensitive` (boolean): Set case sensitivity for search input.
 *    - `maxHeight` (string): The maximum height for the dropdown list (default "250px").
 *    - `options` (array): Array of options to populate the dropdown. Options can be strings, numbers, or objects { text, value }.
 * 
 * Example HTML structure:
 * 
 * <button id="buttonID" class="btn btn-primary">Select an option</button>
 * 
 * Notes:
 * - This plugin is a jQuery wrapper around the BetterBSSelect class.
 * - The button must have an ID, and the plugin can only be initialized on button elements.
 * - The plugin will throw an error if more than one element is selected.
 */


// jQuery Plugin for BetterBSSelect
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
