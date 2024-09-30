$.extend(true, $.fn.dataTable.defaults, {
    language: {
        search: "",
        searchPlaceholder: "Search..."
    },
    oClasses: {
        search: {
            input: "form-control"
        }
    }
})



$(document).ready(function () {
    new DateTimeInput("#test_time-time", {
        type: "time",
        initHours: 11,
        initMinutes: 30,
        initPeriod: "AM"
    })
    new DateTimeInput("#test_time-text", { type: "time", hour12: false })

    new DateTimeInput("#test_date-text", { type: "date" })
    new DateTimeInput("#test_date-date", { type: "date" })
    new DateTimeInput("#datetime-datetime", { hour12: false })
    new DateTimeInput("#datetime-text", { type: "datetime" })


    const select = $("#better-select").BetterBSSelect({
        searchable: true,
        caseSensitive: true,
        options: [
            4,
            "two",
            "three",
            {
                text: "four",
                value: "4"
            },
            "sixxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            "9",
            12,
            10,
            9
        ]
    })


    $("#BetterDropdown").CheckboxDropdown({
        selectAll: true,
        options: [
            4,
            "two",
            "three",
            {
                label: "four",
                value: "4",
                checked: false
            },
            "sixxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            "9",
            12,
            10,
            9
        ]
    })

    $("#BetterDropdown").on("cbdd-optionSelected", (e) => {
        console.log(e.originalEvent.detail)
    })

    $("#BetterDropdown").on("cbdd-selectAll", (e) => {
        console.log(e.originalEvent.detail)
    })


    let data = [
        {
            col1: "ff",
            col2: "sdfsf",
            col3: "fsdfsdf",
        },
        {
            col1: "sfsfs",
            col2: "dfsfsdf",
            col3: "fsdfsfsdf",
        },
        {
            col1: "sdfsdfsdf",
            col2: "sdfsdfsf",
            col3: "sfsdfsf",
        },
        {
            col1: "ff",
            col2: "sdfsf",
            col3: "fsdfsdf",
        },
        {
            col1: "sfsfs",
            col2: "dfsfsdf",
            col3: "fsdfsfsdf",
        },
        {
            col1: "sdfsdfsdf",
            col2: "sdfsdfsf",
            col3: "sfsdfsf",
        },
        {
            col1: "ff",
            col2: "sdfsf",
            col3: "fsdfsdf",
        },
        {
            col1: "sfsfs",
            col2: "dfsfsdf",
            col3: "fsdfsfsdf",
        },
        {
            col1: "sdfsdfsdf",
            col2: "sdfsdfsf",
            col3: "sfsdfsf",
        },
        {
            col1: "ff",
            col2: "sdfsf",
            col3: "fsdfsdf",
        },
        {
            col1: "sfsfs",
            col2: "dfsfsdf",
            col3: "fsdfsfsdf",
        },
        {
            col1: "sdfsdfsdf",
            col2: "sdfsdfsf",
            col3: "sfsdfsf",
        },
        {
            col1: "ff",
            col2: "sdfsf",
            col3: "fsdfsdf",
        },
        {
            col1: "sfsfs",
            col2: "dfsfsdf",
            col3: "fsdfsfsdf",
        },
        {
            col1: "sdfsdfsdf",
            col2: "sdfsdfsf",
            col3: "sfsdfsf",
        }
    ]

    let options = {
        leftTable: {
            DtOptions: {
                data: data,
                columns: [
                    { data: "col1", title: "col1" },
                    { data: "col2", title: "col2" },
                    { data: "col3", title: "col3" }
                ]
            }
        },
        rightTable: {
            DtOptions: {
                data: data,
                columns: [
                    { data: "col1", title: "col1" },
                    { data: "col2", title: "col2" },
                    { data: "col3", title: "col3" }
                ]
            }
        }
    }

    // new DoubleTableSelector("doubletable-example", options)
    $("#doubletable-example").DoubleTableSelector(options)

})