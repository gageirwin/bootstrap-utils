



$(document).ready(function () {

    initThingTable()
    initEntriesTable()

})

function initThingTable() {
    const table = $("#topOptions").DataTable({
        data: tableOneData,
        select: true,
        scroller: true,
        columns: [
            { data: "1", title: "Column 1" },
            { data: "2", title: "Column 2" },
            { data: "3", title: "Column 3" }
        ],
        layout: {
            topStart: {
                buttons: [
                    {
                        text: 'Add',
                        name: "addButton",
                        action: function (e, dt, node, config) {
                            alert('Button activated')
                        }
                    },
                    {
                        text: 'Edit',
                        name: "editButton",
                        action: function (e, dt, node, config) {
                            alert('Button activated')
                        },
                        enabled: false
                    },
                    {
                        text: 'View',
                        name: "viewButton",
                        action: function (e, dt, node, config) {
                            viewItem(dt.row({ selected: true }).data())
                        },
                        enabled: false
                    },
                    {
                        text: 'Compare',
                        name: "compareButton",
                        action: function (e, dt, node, config) {
                            compareItems(table.rows({ selected: true }).data().toArray())
                        },
                        enabled: false
                    },
                    {
                        text: 'Delete',
                        name: "deleteButton",
                        action: function (e, dt, node, config) {
                            alert('Button activated')
                        },
                        enabled: false
                    },
                ]
            }
        }
    })

    table.off("select deselect").on("select deselect", function (e, dt, type, indexes) {
        const selectedRows = table.rows({ selected: true }).count()
        table.button('viewButton:name').enable(selectedRows === 1)
        table.button('editButton:name').enable(selectedRows === 1)
        table.button('deleteButton:name').enable(selectedRows === 1)
        table.button('compareButton:name').enable(selectedRows >= 1)
    })

    $('#topOptions tbody').on('dblclick', 'tr', function () {
        table.row(this).select()
        viewItem(table.row({ selected: true }).data())
    })
}

function initEntriesTable() {
    const table = $("#entriesTable").DataTable({
        select: true,
        scroller: true,
        columns: [
            { data: "1", title: "Column 1" },
            { data: "2", title: "Column 2" },
            { data: "3", title: "Column 3" }
        ],
        layout: {
            topStart: {
                buttons: [
                    {
                        text: 'Add',
                        name: "addButton",
                        action: function (e, dt, node, config) {
                            alert('Button activated')
                        }
                    },
                    {
                        text: 'Edit',
                        name: "editButton",
                        action: function (e, dt, node, config) {
                            alert('Button activated')
                        },
                        enabled: false
                    },
                    {
                        text: 'Delete',
                        name: "deleteButton",
                        action: function (e, dt, node, config) {
                            alert('Button activated')
                        },
                        enabled: false
                    },
                ]
            }
        }
    })

    table.off("select deselect").on("select deselect", function (e, dt, type, indexes) {
        const selectedRows = table.rows({ selected: true }).count()
        table.button('editButton:name').enable(selectedRows === 1)
        table.button('deleteButton:name').enable(selectedRows === 1)
    })

    $('#entriesTable tbody').on('dblclick', 'tr', function () {
        table.row(this).select()
        alert("Edit this row")
    })
}

function viewItem(rowData) {
    console.log(rowData)
    $("#defaultView").hide()
    $("#compareItems").hide()
    $("#viewItem").show()

    $("div.card-header h4").text(`Viewing ${rowData["1"]}`)

    setupOverview()
    setupEntries(tableTwoData[rowData.id])

}



function setupEntries(data) {
    const table = $("#entriesTable").DataTable()
    table.rows().remove()
    console.log(data)
    table.rows.add(data).draw()
}

function setupOverview() {

    $('#chartsContainer div canvas').each(function () {
        const chart = Chart.getChart($(this).attr("id"))
        chart.destroy()
        $(this).parent("div").remove()
    })

    const chartData = [
        { labels: ['Red', 'Blue', 'Yellow'], data: [30, 50, 20] },
        { labels: ['Green', 'Purple', 'Orange'], data: [40, 30, 30] },
        { labels: ['Pink', 'Teal', 'Lime'], data: [20, 40, 40] }
    ]

    chartData.forEach((dataSet, index) => {
        // Create a unique ID for each canvas
        const canvasId = 'PieChart' + index

        // Append canvas element to the container
        $('#chartsContainer').append(`<div class="chart-container"><canvas id="${canvasId}"></canvas></div>`)

        // Initialize Chart.js for the new canvas
        new Chart($(`#${canvasId}`), {
            type: 'pie',
            data: {
                labels: dataSet.labels,
                datasets: [{
                    label: 'My Dataset',
                    data: dataSet.data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        })
    })
}

function compareItems(rowsData) {
    console.log(rowsData)
    $("#defaultView").hide()
    $("#viewItem").hide()
    $("#compareItems").show()

    $("div.card-header h4").text(`Comparing ${rowsData.length} Things`)
}






// TEMP DATA
const tableOneData = [
    {
        1: "Title One",
        2: "Thing",
        3: "Another Thing",
        id: "1"
    },
    {
        1: "Title Two",
        2: "Thing",
        3: "Another Thing",
        id: "2"
    },
    {
        1: "Title Three",
        2: "Thing",
        3: "Another Thing",
        id: "3"
    },
    {
        1: "Title Four",
        2: "Thing",
        3: "Another Thing",
        id: "4"
    },
]

const tableTwoData =
{
    "1": [
        {
            1: "Title One",
            2: "Thing",
            3: "Another Thing 6456",
        },
        {
            1: "Title Two",
            2: "Thing",
            3: "Another Thing 1489",
        },
    ],
    "2": [
        {
            1: "Title One",
            2: "Thing",
            3: "Another Thing 3649",
        },
        {
            1: "Title Two",
            2: "Thing",
            3: "Another Thing 87346",
        },
    ],
    "3": [
        {
            1: "Title One",
            2: "Thing",
            3: "Another Thing 24368",
        },
        {
            1: "Title Two",
            2: "Thing",
            3: "Another Thing 84635",
        },
    ],
    "4": [
        {
            1: "Title One",
            2: "Thing",
            3: "Another Thing 9999",
        },
        {
            1: "Title Two",
            2: "Thing",
            3: "Another Thing 7777",
        },
    ]
}



