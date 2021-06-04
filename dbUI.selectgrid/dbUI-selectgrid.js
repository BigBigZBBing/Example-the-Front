(function ($dbUI) {
    function selectgrid(cols, data, callback) {
        var tempData = data;
        var nFocus = false;
        var selectS = document.querySelectorAll(".dbUI-select");
        Array.from(selectS).forEach(item => {
            let mainWidth = item.getAttribute("width") || "180";
            let mainHeight = item.getAttribute("height") || "25";
            let inputWidth = (Number(mainWidth) - 35) + "";
            let viewContent = "";
            let cursorContent = {};
            item.style = `width:${mainWidth}px;height:${mainHeight}px;`;
            let input = document.createElement("input");
            input.className = "dbUI-select-input",
                input.type = "text",
                input.readOnly = true,
                input.style = `width:${inputWidth}px;`;
            item.appendChild(input);
            let font = document.createElement("div");
            font.className = "dbUI-select-font";
            item.appendChild(font);
            let icon = document.createElement("div");
            icon.className = "dbUI-select-btn", icon.innerText = "▾";
            item.appendChild(icon);
            let container = document.createElement("div");
            container.className = "dbUI-select-container";
            item.appendChild(container);
            icon.addEventListener("click", function (e) {
                if (container.classList.contains("show")) {
                    container.classList.remove("show");
                }
                else container.classList.add("show");
                input.click();
                input.focus();
            });
            let tableHead = document.createElement("div");
            tableHead.className = "dbUI-select-container-content-thead";
            container.appendChild(tableHead);
            let content = document.createElement("div");
            content.className = "dbUI-select-container-content";
            content.style = `min-width:${mainWidth}px;`;
            container.appendChild(content);
            let help = document.createElement("div");
            help.className = "dbUI-select-container-help";
            container.appendChild(help);
            let helpinput = document.createElement("input");
            helpinput.type = "button", helpinput.value = "x";
            help.appendChild(helpinput);
            let helpdiv = document.createElement("div");
            helpdiv.innerText = "⊿";
            help.appendChild(helpdiv);
            let containerDrop = false;
            let currX = 0;
            let currY = 0;
            let currW = 0;
            let currH = 0;
            helpdiv.addEventListener("mousedown", function (e) {
                containerDrop = true;
                currX = e.clientX;
                currY = e.clientY;
                currW = content.clientWidth;
                currH = content.clientHeight;
            }, true);
            document.addEventListener("mousemove", function (e) {
                if (containerDrop) {
                    let diffX = e.clientX - currX;
                    let diffY = e.clientY - currY;
                    container.style = "";
                    content.setAttribute("style", `width:${(currW + diffX)}px;height:${(currH + diffY)}px;min-width:${mainWidth}px;`);
                }
            }, true);
            document.addEventListener("mouseup", function (e) {
                containerDrop = false;
            }, true);
            helpinput.addEventListener("click", function (e) {
                if (container.classList.contains("show")) {
                    container.classList.remove("show");
                }
                else container.classList.add("show");
            });
            let table = document.createElement("table");
            table.setAttribute("cellspacing", "0"), table.setAttribute("cellpadding", "0");
            content.appendChild(table);
            let thead = document.createElement("thead");
            table.appendChild(thead);
            let tbody = document.createElement("tbody");
            table.appendChild(tbody);
            refreshGrid();
            var loadFilter = "";
            item.addEventListener("click", function (e) { nFocus = true; }, true);
            document.addEventListener("mousedown", function (e) {
                if (!e.target.offsetParent
                    || !e.target.offsetParent == item
                    || !e.target.offsetParent == container) {
                    nFocus = false;
                    font.innerHTML = viewContent;
                    loadFilter = "";
                    if (container.classList.contains("show")) {
                        container.classList.remove("show");
                    }
                }
            }, true);
            input.addEventListener("keydown", function (e) {
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
            });
            document.addEventListener("keydown", function (e) {
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
            }, true);
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
                        if (!container.classList.contains("show"))
                            container.classList.add("show");
                    }
                }
            }
            function refreshGrid() {
                thead.innerHTML = "";
                tbody.innerHTML = "";
                tableHead.innerHTML = "";
                Array.from(cols).forEach(col => {
                    let th = document.createElement("th");
                    th.setAttribute("width", col.width);
                    thead.appendChild(th);
                    let colDiv = document.createElement("div");
                    colDiv.className = "col", colDiv.innerText = col.name;
                    colDiv.style = col.width ? `flex-basis:${(col.width - 1)}px;` : "flex-grow:1;";
                    tableHead.appendChild(colDiv);
                });
                let first = true;
                Array.from(tempData).forEach(dta => {
                    let tr = document.createElement("tr");
                    if (first) {
                        tr.classList.add("show");
                        first = false;
                        cursorContent = tr;
                    }
                    tbody.appendChild(tr);
                    tr.addEventListener("mouseenter", function (e) {
                        refreshCursor(this);
                    }, true);
                    tr.addEventListener("click", function (e) {
                        let target = this.querySelector("td[c-key]");
                        if (target) {
                            filterFont(target.innerText);
                            nFocus = false;
                            font.innerHTML = viewContent;
                            loadFilter = "";
                        }
                        if (container.classList.contains("show")) {
                            container.classList.remove("show");
                        }
                    });
                    Array.from(cols).forEach(col => {
                        let key = col.field;
                        let isKey = col.key || false;
                        let td = document.createElement("td");
                        td.innerText = dta[key];
                        tr.appendChild(td);
                        if (isKey) td.setAttribute("c-key", col.field);
                    });
                });
            }
            function refreshCursor(tr) {
                Array.from(tr.parentNode.childNodes).forEach(x => {
                    if (x.classList.contains("show")) {
                        x.classList.remove("show");
                    }
                });
                tr.classList.add("show");
                cursorContent = tr;
            }
        });
    }
    $dbUI.selectgrid = selectgrid;
}($dbUI));