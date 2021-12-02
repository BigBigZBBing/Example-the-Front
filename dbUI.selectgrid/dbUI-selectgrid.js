(function ($dbUI) {
    function selectgrid(cols, data, callback) {
        var selectS = document.querySelectorAll(".dbUI-select");
        Array.from(selectS).forEach(item => {
            //条件筛选出的临时数据集
            let tempData = data;
            //输入框是否获得焦点
            let nFocus = false;
            //主框根据配置适应宽度高度
            let mainWidth = item.getAttribute("width") || "180";
            let mainHeight = item.getAttribute("height") || "25";
            //输入框根据配置适应宽度
            let inputWidth = (Number(mainWidth) - 35) + "";

            let viewContent = "";
            let cursorContent = new Object();
            item.style = `width:${mainWidth}px;height:${mainHeight}px;`;
            let input = $dbUI.ctElement({
                p: item, e: "input", c: ["dbUI-select-input"],
                attr: [
                    { key: "type", value: "text" },
                    { key: "readonly", value: "" },
                    { key: "style", value: `width:${inputWidth}px;` },
                ],
                event: [
                    {
                        key: "keydown", action: function (e) {
                            if (nFocus) {
                                if (e.keyCode == 8) {
                                    let temp = loadFilter.substring(0, loadFilter.length - 1);
                                    filterFont(temp);
                                } else {
                                    let value = String.fromCharCode(e.keyCode);
                                    if (/[0-9|A-Z|a-z]/.test(value)) {
                                        let temp = loadFilter + value;
                                        filterFont(temp);
                                    }
                                }
                            }
                        }
                    }
                ]
            });
            let font = $dbUI.ctElement({ p: item, e: "div", c: ["dbUI-select-font"] });
            $dbUI.ctElement({
                p: item, e: "div", c: ["dbUI-select-btn"], t: "▾",
                event: [
                    {
                        key: "click", action: function () {
                            container.ToggleClass("show");
                            input.click(), input.focus();
                        }
                    }
                ]
            });
            let container = $dbUI.ctElement({ p: item, e: "div", c: ["dbUI-select-container"] });
            let tableHead = $dbUI.ctElement({ p: container, e: "div", c: ["dbUI-select-container-content-thead"] });
            let content = $dbUI.ctElement({
                p: container, e: "div", c: ["dbUI-select-container-content"]
                , attr: [
                    { key: "style", value: `min-width:${mainWidth}px;` },
                ]
            });
            let help = $dbUI.ctElement({ p: container, e: "div", c: ["dbUI-select-container-help"] });
            $dbUI.ctElement({
                p: help, e: "input", c: ["dbUI-select-container-help"],
                attr: [
                    { key: "type", value: "button" },
                    { key: "value", value: "x" },
                ],
                event: [
                    {
                        key: "click", action: function () {
                            container.ToggleClass("show");
                        }
                    }
                ]
            });

            let containerDrop = false;
            let currX, currY, currW, currH = 0;
            let helpdiv = $dbUI.ctElement({
                p: help, e: "div", t: "⊿",
                event: [
                    {
                        key: "mousedown", action: function (e) {
                            containerDrop = true;
                            currX = e.clientX;
                            currY = e.clientY;
                            currW = content.clientWidth;
                            currH = content.clientHeight;
                        }
                    }
                ]
            });
            document.documentElement.Bind("mousemove", function (e) {
                if (containerDrop) {
                    let diffX = e.clientX - currX;
                    let diffY = e.clientY - currY;
                    container.style = "";
                    content.setAttribute("style", `width:${(currW + diffX)}px;height:${(currH + diffY)}px;min-width:${mainWidth}px;`);
                }
            });
            document.documentElement.Bind("mouseup", function (e) {
                containerDrop = false;
            });
            let table = $dbUI.ctElement({
                p: content, e: "table",
                attr: [
                    { key: "cellspacing", value: "0" },
                    { key: "cellpadding", value: "0" },
                ]
            });
            let thead = $dbUI.ctElement({ p: table, e: "thead" });
            let tbody = $dbUI.ctElement({ p: table, e: "tbody" });
            refreshGrid();
            var loadFilter = "";
            item.Bind("click", function (e) { nFocus = true; });
            document.documentElement.Bind("mousedown", function (e) {
                if (!e.target.offsetParent
                    || !e.target.offsetParent == item
                    || !e.target.offsetParent == container) {
                    nFocus = false;
                    font.innerHTML = viewContent;
                    loadFilter = "";
                    container.RemoveClass("show");
                }
            });
            document.documentElement.Bind("keydown", function (e) {
                if (nFocus) {
                    if (e.keyCode == 13) {
                        cursorContent.click();
                    }
                    if (e.keyCode == 38) {
                        let prev = cursorContent.previousElementSibling;
                        if (prev) {
                            refreshCursor(prev);
                            let target = prev.querySelector("td[c-key]");
                            filterFont(target.innerText, loadFilter);
                        }
                    }
                    if (e.keyCode == 40) {
                        let next = cursorContent.nextElementSibling;
                        if (next) {
                            refreshCursor(next);
                            let target = next.querySelector("td[c-key]");
                            filterFont(target.innerText, loadFilter);
                        }
                    }
                }
            });
            function filterFont(temp, temp2) {
                let col = cols.filter(x => x.key);
                if (col.length > 0) {
                    eval("var filterData = data.filter(x => /^" + temp.toLowerCase() + "/.test(x.col1.toLowerCase()));")
                    if (filterData.length > 0) {
                        if (temp2 == undefined) {
                            tempData = filterData;
                            refreshGrid();
                            loadFilter = temp;
                        }
                        let showView = callback(filterData[0]);
                        viewContent = showView;
                        font.innerHTML = showView.substring(0, (temp2 || temp).length) + "<label>" + showView.substring((temp2 || temp).length) + "</label>";
                        if (temp === "") font.innerHTML = showView;
                        container.AddClass("show");
                    }
                }
            }
            function refreshGrid() {
                thead.innerHTML = "";
                tbody.innerHTML = "";
                tableHead.innerHTML = "";
                Array.from(cols).forEach(col => {
                    $dbUI.ctElement({ p: thead, e: "th", attr: [{ key: "width", value: col.width }] });
                    $dbUI.ctElement({
                        p: tableHead, e: "div", c: ["col"], t: col.name, attr: [
                            { key: "style", value: col.width ? `flex-basis:${(col.width - 1)}px;` : "flex-grow:1;" }
                        ]
                    });
                });
                let first = true;
                Array.from(tempData).forEach(dta => {
                    let tr = $dbUI.ctElement({ p: tbody, e: "tr" });
                    if (first) {
                        tr.AddClass("show");
                        first = false;
                        cursorContent = tr;
                    }
                    tr.Bind("mouseenter", function (e) {
                        refreshCursor(this);
                    });
                    tr.Bind("click", function (e) {
                        let target = this.querySelector("td[c-key]");
                        if (target) {
                            filterFont(target.innerText);
                            nFocus = false;
                            font.innerHTML = viewContent;
                            loadFilter = "";
                        }
                        container.RemoveClass("show");
                    });
                    Array.from(cols).forEach(col => {
                        let key = col.field;
                        let isKey = col.key || false;
                        let td = $dbUI.ctElement({ p: tr, e: "td", t: dta[key] });
                        if (isKey) td.setAttribute("c-key", col.field);
                    });
                });
            }
            function refreshCursor(tr) {
                Array.from(tr.parentNode.childNodes).forEach(x => {
                    x.RemoveClass("show");
                });
                tr.AddClass("show");
                cursorContent = tr;
            }
        });
    }
    $dbUI.selectgrid = selectgrid;
}($dbUI));