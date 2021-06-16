(function ($dbUI) {
    $dbUI.filtergrid = function (ele, config) {
        if (config.data) {
            let source = config.data;
            let cache = source;
            let thead = $dbUI.ctElement({ p: ele, e: "thead" });
            let tabTh = $dbUI.ctElement({ p: thead, e: "tr" });
            if (config.tabs && config.tabs.length > 0)
                $dbUI.ctElement({ p: tabTh, e: "th", attr: [{ key: "colspan", value: config.cols.length }] });
            let colTh = $dbUI.ctElement({ p: thead, e: "tr" });
            let filterTh = $dbUI.ctElement({ p: thead, e: "tr" });
            let tbody = $dbUI.ctElement({ p: ele, e: "tbody" });
            Array.from(config.cols).forEach(col => {
                $dbUI.ctElement({
                    p: colTh, e: "th", t: col.name, attr: [
                        { key: "width", value: col.width },
                        { key: "rowspan", value: col.filter ? 1 : 2 }
                    ]
                });
                if (col.filter) {
                    var filterColumn = $dbUI.ctElement({ p: filterTh, e: "th" });
                    var filterTool = $dbUI.ctElement({
                        p: filterColumn, e: col.select ? "select" : "input",
                        attr: [
                            { key: "filtercol", value: col.field },
                            { key: "type", value: "text" }
                        ],
                        event: [
                            {
                                key: "change", action: function (e) {
                                    let filterfield = this.getAttribute("filtercol");
                                    if (filterfield) {
                                        cache = source.filter(x => x[filterfield].indexOf(this.value) > -1);
                                        RefrshTbody(tbody);
                                    }
                                }
                            }
                        ]
                    });
                    if (col.select) {
                        Array.from(col.select).forEach(sel => {
                            $dbUI.ctElement({ p: filterTool, e: "option", t: sel.key, attr: [{ key: "value", value: sel.value }] });
                        });
                    }
                }
            });
            function RefrshTbody(tbody) {
                tbody.innerHTML = "";
                Array.from(cache).forEach(row => {
                    let tr = $dbUI.ctElement({ p: tbody, e: "tr" });
                    Array.from(config.cols).forEach(col => {
                        let value = "";
                        if (row[col.field]) {
                            value = row[col.field];
                        }
                        $dbUI.ctElement({ p: tr, e: "td", t: value });
                    });
                });
            }
            RefrshTbody(tbody);
        }
    }
}($dbUI))