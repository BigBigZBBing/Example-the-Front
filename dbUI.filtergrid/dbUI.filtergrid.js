(function ($dbUI) {
    $dbUI.filtergrid = function (ele, config) {
        let source = config.data || [];
        let cache = source;
        let columns = config.cols;
        let colcache = columns;
        let filtercolumns = [];
        let filterObj = {};
        let pageIndex = config.pageIndex || 1;
        let pageSize = config.pageSize || 10;
        let pageTotal = config.pageTotal || 0;
        let pageList = config.pageList || [10, 15, 20, 30, 50];
        let postPacket = {};
        let thead = $dbUI.ctElement({ p: ele, e: "thead" });
        let tabTh = $dbUI.ctElement({ p: thead, e: "tr", c: ["dbUI-filtergrid-head-tab-row"], attr: [{ key: "align", value: "right" }] });
        let colTh = $dbUI.ctElement({ p: thead, e: "tr", c: ["dbUI-filtergrid-head-name-row"] });
        let filterTh = $dbUI.ctElement({ p: thead, e: "tr", c: ["dbUI-filtergrid-head-filter-row"] });
        let tbody = $dbUI.ctElement({ p: ele, e: "tbody" });
        let tfoot = $dbUI.ctElement({ p: ele, e: "tfoot" });
        let tabfTh = $dbUI.ctElement({ p: tfoot, e: "tr", c: ["dbUI-filtergrid-foot-row"] });
        if (config.tabs && config.tabs.length > 0) {
            $dbUI.ctElement({
                p: tabTh, e: "th",
                attr: [
                    { key: "colspan", value: colcache.length }
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
                                                Array.from(colcache).forEach(col => {
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

        RefreshThead();
        RequestData();
        RefreshTbody();

        function RefreshThead() {
            colTh.innerHTML = "";
            filterTh.innerHTML = "";
            Array.from(colcache).forEach(col => {
                $dbUI.ctElement({
                    p: colTh, e: "th", c: ["dbUI-filtergrid-head-cell"],
                    attr: [
                        { key: "align", value: "center" },
                        { key: "width", value: col.width },
                        { key: "rowspan", value: col.filter ? 1 : 2 }
                    ],
                    ape: function () {
                        $dbUI.ctElement({
                            p: this, e: "div", c: ["title"], t: col.title,
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
                                                postPacket["sort"] = this.getAttribute("filtercol");
                                                postPacket["order"] = "asc";
                                                RequestData();
                                                RefreshTbody();
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
                                                postPacket["sort"] = this.getAttribute("filtercol");
                                                postPacket["order"] = "desc";
                                                RequestData();
                                                RefreshTbody();
                                            }
                                        }
                                    ],
                                });
                            }
                        });
                    }
                });

                if (col.filter) {
                    var filterColumn = $dbUI.ctElement({ p: filterTh, e: "th", c: ["dbUI-filtergrid-head-filter-cell"] });
                    let tool = filtercolumns.FirstOrDefault(x => x.key == col.field);
                    if (tool && filterObj.hasOwnProperty(col.field)) {
                        filterColumn.appendChild(tool.html);
                        return;
                    }
                    filterObj[col.field] = "";
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
                        filterTool = $dbUI.initdatepicker(filterTool);
                        let dateinput = filterColumn.querySelector(".dbUI-date-input");
                        dateinput.Bind("change", filterChange);
                    }
                    if (col.select) {
                        Array.from(col.select).forEach(sel => {
                            $dbUI.ctElement({ p: filterTool, e: "option", t: sel.key, attr: [{ key: "value", value: sel.value }] });
                        });
                    }
                    if (tool) tool.html = filterTool;
                    else
                        filtercolumns.push({ key: col.field, html: filterTool });
                }
            });
        }
        function RefreshTbody() {
            tbody.innerHTML = "";
            let temp = cache;
            if (config.pager && !config.url) {
                temp = Array.from(cache).slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
                pageTotal = cache.length;
            }
            Array.from(temp).forEach(row => {
                let tr = $dbUI.ctElement({ p: tbody, e: "tr", c: ["dbUI-filtergrid-body-row"] });
                if (config.rowIndex) {
                    $dbUI.ctElement({ p: tr, e: "td", c: ["dbUI-filtergrid-head-cell"] });
                }
                Array.from(colcache).forEach(col => {
                    let value = "";
                    if (row[col.field]) {
                        value = row[col.field];
                    }
                    $dbUI.ctElement({ p: tr, e: "td", c: ["dbUI-filtergrid-body-cell"], t: col.templet ? col.templet(row) : value });
                });
            });
            RefreshPager();
        }
        function RefreshPager() {
            tabfTh.innerHTML = "";
            if (config.pager) {
                $dbUI.ctElement({
                    p: tabfTh, e: "td", c: ["dbUI-filtergrid-foot-cell"],
                    attr: [
                        { key: "colspan", value: colcache.length }
                    ],
                    ape: function () {
                        let maxIndex = Math.ceil(pageTotal / pageSize);
                        let pagermain = $dbUI.ctElement({ p: this, e: "div", c: ["dbUI-filtergrid-pager"] });
                        $dbUI.ctElement({ p: pagermain, e: "label", t: "To" });
                        $dbUI.ctElement({
                            p: pagermain, e: "select", c: ["dbUI-filtergrid-pagerlist"],
                            event: [{ key: "change", action: selectPageList }],
                            ape: function () {
                                Array.from(pageList).forEach(sel => {
                                    $dbUI.ctElement({
                                        p: this, e: "option", t: sel, attr: [
                                            { key: "value", value: sel },
                                            pageSize == sel ? { key: "selected", value: "" } : null,
                                        ]
                                    });
                                });
                            }
                        });
                        $dbUI.ctElement({ p: pagermain, e: "label", t: "items" });
                        $dbUI.ctElement({ p: pagermain, e: "div", c: ["dbUI-filtergrid-pager-segment"] });
                        $dbUI.ctElement({
                            p: pagermain, e: "label", c: ["dbUI-filtergrid-pager-page"], t: "Page",
                            attr: [pageIndex == 1 ? { key: "style", value: "pointer-events:none;" } : null],
                            event: [
                                {
                                    key: "click", action: function () {
                                        pageIndex = 1;
                                        RequestData();
                                        RefreshTbody();
                                    }
                                }
                            ]
                        });
                        $dbUI.ctElement({
                            p: pagermain, e: "label", c: ["dbUI-fonts-left1", "dbUI-filtergrid-pager-prev"],
                            attr: [pageIndex == 1 ? { key: "style", value: "pointer-events:none;" } : null],
                            event: [
                                {
                                    key: "click", action: function () {
                                        pageIndex = pageIndex - 1 > 0 ? pageIndex - 1 : 1;
                                        RequestData();
                                        RefreshTbody();
                                    }
                                }
                            ]
                        });
                        $dbUI.ctElement({
                            p: pagermain, e: "input", c: ["dbUI-filtergrid-pager-index"],
                            attr: [{ key: "value", value: pageIndex }],
                            event: [
                                {
                                    key: "change", action: function () {
                                        pageIndex = Number(this.value) > maxIndex ? maxIndex : Number(this.value);
                                        RequestData();
                                        RefreshTbody();
                                    }
                                }
                            ]
                        });
                        $dbUI.ctElement({
                            p: pagermain, e: "label", c: ["dbUI-fonts-right1", "dbUI-filtergrid-pager-next"],
                            attr: [maxIndex == pageIndex ? { key: "style", value: "pointer-events:none;" } : null],
                            event: [
                                {
                                    key: "click", action: function () {
                                        pageIndex = pageIndex + 1;
                                        RequestData();
                                        RefreshTbody();
                                    }
                                }
                            ]
                        });
                        $dbUI.ctElement({
                            p: pagermain, e: "label", c: ["dbUI-filtergrid-pager-end"], t: "End",
                            attr: [maxIndex == pageIndex ? { key: "style", value: "pointer-events:none;" } : null],
                            event: [
                                {
                                    key: "click", action: function () {
                                        pageIndex = maxIndex;
                                        RequestData();
                                        RefreshTbody();
                                    }
                                }
                            ]
                        });
                        $dbUI.ctElement({ p: pagermain, e: "div", c: ["dbUI-filtergrid-pager-segment"] });
                        $dbUI.ctElement({ p: pagermain, e: "span", t: "Total" });
                        $dbUI.ctElement({ p: pagermain, e: "span", t: pageTotal.toString() });
                        $dbUI.ctElement({ p: pagermain, e: "span", t: "items" });
                    }
                });
            }
        }
        function filterChange() {
            let filterfield = this.getAttribute("filtercol");
            if (filterfield) {
                filterObj[filterfield] = this.value;
                cache = source;
                filterProcess();
                RequestData();
                if (config.pager && !config.url)
                    RefreshTbody();
            }
        }
        function filterProcess() {
            for (const key in filterObj) {
                if (filterObj.hasOwnProperty(key)) {
                    const obj = filterObj[key];
                    postPacket[key] = obj && obj.length > 0 ? obj : "";
                    cache = cache.filter(x => x[key].indexOf(obj) > -1);
                }
            }
        }
        function selectPageList(e) {
            pageSize = this.value;
            filterProcess();
            RequestData();
            if (config.pager && !config.url)
                RefreshTbody();
        }
        function RequestData() {
            if (config.url) {
                postPacket.pageIndex = pageIndex;
                postPacket.pageSize = pageSize;
                $dbUI.Post(config.url, postPacket, function (response) {
                    let jsonObj = JSON.parse(response);
                    pageTotal = jsonObj["total"] || 0;
                    cache = jsonObj["data"] || [];
                    RefreshTbody();
                });
            }
        }

        return {
            get cols() {
                return cols;
            },
            set cols(newValue) {
                colcache = newValue;
                cols = newValue;
            },
            RefreshFilter: function () {
                cache = source;
                let fields = cols.Select(x => x.field);
                for (const key in filterObj) {
                    if (fields.indexOf(key) == -1) {
                        delete filterObj[key];
                    }
                }
                RefreshThead();
                RequestData();
                filterProcess();
                RefreshTbody();
            },
            Refresh: function () {
                cache = source;
                filterObj = {};
                RefreshThead();
                RequestData();
                filterProcess();
                RefreshTbody();
            }
        }
    }
}($dbUI))