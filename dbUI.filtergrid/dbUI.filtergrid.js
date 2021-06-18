(function ($dbUI) {
    $dbUI.filtergrid = function (ele, config) {
        if (config.data) {
            let source = config.data;
            let cache = source;
            let filterObj = {};
            let thead = $dbUI.ctElement({ p: ele, e: "thead" });
            let tabTh = $dbUI.ctElement({ p: thead, e: "tr", attr: [{ key: "align", value: "right" }] });
            if (config.tabs && config.tabs.length > 0) {
                $dbUI.ctElement({
                    p: tabTh, e: "th",
                    attr: [
                        { key: "colspan", value: config.cols.length }
                    ],
                    ape: function () {
                        if (config.tabs.indexOf("filter") > -1) {
                            $dbUI.ctElement({
                                p: this, e: "div", c: ["cnf-filter"], t: "✐",
                                event: [
                                    {
                                        key: "click", action: function (e) {
                                            $dbUI.ctElement({
                                                p: document.body, e: "div", c: ["dbUI-filter-console"], ape: function () {
                                                    Array.from(config.cols).forEach(col => {
                                                        $dbUI.ctElement({
                                                            p: this, e: "div", c: ["dbUI-filter-console-col"],
                                                            ape: function () {
                                                                $dbUI.ctElement({ p: this, e: "" });
                                                            }
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                    }
                                ]
                            });
                        }
                    }
                });
            }
            let colTh = $dbUI.ctElement({ p: thead, e: "tr" });
            let filterTh = $dbUI.ctElement({ p: thead, e: "tr" });
            let tbody = $dbUI.ctElement({ p: ele, e: "tbody" });
            Array.from(config.cols).forEach(col => {
                $dbUI.ctElement({
                    p: colTh, e: "th",
                    attr: [
                        { key: "align", value: "center" },
                        { key: "width", value: col.width },
                        { key: "rowspan", value: col.filter ? 1 : 2 }
                    ],
                    ape: function () {
                        $dbUI.ctElement({
                            p: this, e: "label", c: ["title"], t: col.name,
                            ape: function () {
                                $dbUI.ctElement({
                                    p: this, e: "div", c: ["asc"], t: "▲",
                                    attr: [
                                        { key: "filtercol", value: col.field }
                                    ],
                                    event: [
                                        {
                                            key: "click", action: function (e) {
                                                cache = cache.OrderBy(x => x[this.getAttribute("filtercol")]);
                                                let all = colTh.getElementsByClassName("this");
                                                Array.from(all).forEach(ele => {
                                                    ele.RemoveClass("this");
                                                });
                                                this.AddClass("this");
                                                RefrshTbody();
                                            }
                                        }
                                    ],
                                });
                                $dbUI.ctElement({
                                    p: this, e: "div", c: ["desc"], t: "▼",
                                    attr: [
                                        { key: "filtercol", value: col.field }
                                    ],
                                    event: [
                                        {
                                            key: "click", action: function (e) {
                                                cache = cache.OrderByDescending(x => x[this.getAttribute("filtercol")]);
                                                let all = colTh.getElementsByClassName("this");
                                                Array.from(all).forEach(ele => {
                                                    ele.RemoveClass("this");
                                                });
                                                this.AddClass("this");
                                                RefrshTbody();
                                            }
                                        }
                                    ],
                                })
                            }
                        });
                    }
                });
                if (col.filter) {
                    filterObj[col.field] = "";
                    var filterColumn = $dbUI.ctElement({ p: filterTh, e: "th" });
                    var filterTool = $dbUI.ctElement({
                        p: filterColumn, e: col.select ? "select" : "input",
                        c: [!col.date || "dbUI-date"],
                        attr: [
                            { key: "filtercol", value: col.field },
                            { key: "type", value: "text" },
                            !col.date || { key: "format", value: "datetime" },
                            !col.date || { key: "readonly", value: "" }
                        ],
                        event: [
                            {
                                key: "change", action: filterChange
                            }
                        ]
                    });
                    if (col.date) {
                        $dbUI.initdatepicker();
                        let dateinput = filterColumn.querySelector(".dbUI-date-input");
                        dateinput.Bind("change", filterChange);
                    }
                    if (col.select) {
                        Array.from(col.select).forEach(sel => {
                            $dbUI.ctElement({ p: filterTool, e: "option", t: sel.key, attr: [{ key: "value", value: sel.value }] });
                        });
                    }
                    function filterChange(e) {
                        let filterfield = this.getAttribute("filtercol");
                        if (filterfield) {
                            filterObj[filterfield] = this.value;
                            cache = source;
                            filterProcess();
                            RefrshTbody();
                        }
                    }
                    function filterProcess() {
                        for (const key in filterObj) {
                            if (Object.hasOwnProperty.call(filterObj, key)) {
                                const obj = filterObj[key];
                                cache = cache.filter(x => x[key].indexOf(obj) > -1);
                            }
                        }
                    }
                }
            });
            function RefrshTbody() {
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
            RefrshTbody();
        }
    }
}($dbUI))