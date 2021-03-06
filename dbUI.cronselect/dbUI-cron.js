(function ($dbUI) {
    var crons = document.getElementsByClassName("dbUI-cron");
    for (let i = 0; i < crons.length; i++) {
        const ele = crons[i];
        let old = "";
        if (ele.getAttribute("old"))
            old = ele.getAttribute("old");
        let input = ele.getElementsByClassName("cron-input")[0];
        let select = ele.getElementsByClassName("cron-select")[0];
        let clear = ele.getElementsByClassName("cron-clear")[0];
        let config = ele.getElementsByClassName("cron-config")[0];

        //制定规则
        let Rule =
            `if(target.range) {
                if(Number(target.value)<Number(target.range.split("-")[0])){
                    target.value=target.range.split("-")[0];
                }
                if(Number(target.value)>Number(target.range.split("-")[1])){
                    target.value=target.range.split("-")[1];
                }
                if(prev!="yy"){
                    for(let ikey in this){
                        if(ikey == prev) break;
                        if(target.value!=target.default&&this[ikey].value==this[ikey].default){
                            if(ikey != "MM"){
                                this[ikey].value=this[ikey].range.split("-")[0];
                            }
                        }
                        if(prev=="dd" && this["dd"].value == "?" && this["ww"].value == "?") {
                            this["ww"].value="*";
                        }
                        if(prev=="dd" && this["dd"].value != "?") {
                            this["ww"].value="?";
                        }
                        if(prev=="MM" && this["dd"].value != "?") {
                            this["ww"].value="?";
                        }
                        if(prev=="ww" && this["ww"].value != "?" && this["dd"].value != "?") {
                            this["dd"].value="?";
                        }
                        if(prev=="ww" && this["ww"].value == "?" && this["dd"].value == "?") {
                            this["dd"].value="*";
                        }
                    }
                }
            }`;

        //面板控制台
        let Class = {
            //分类
            Cron: {
                ss: {
                    title: "秒",
                    remark: "秒",
                    remark1: "秒钟",
                    value: "",
                    default: "*",
                    range: "0-59",
                    tabs: ["general", old + "range", old + "delayed", "assign"],
                    verify: Rule
                },
                mm: {
                    title: "分",
                    remark: "分",
                    remark1: "分钟",
                    value: "",
                    default: "*",
                    range: "0-59",
                    tabs: ["general", old + "range", old + "delayed", "assign"],
                    verify: Rule
                },
                hh: {
                    title: "时",
                    remark: "点",
                    remark1: "小时",
                    value: "",
                    default: "*",
                    range: "0-23",
                    tabs: ["general", old + "range", old + "delayed", "assign"],
                    verify: Rule
                },
                dd: {
                    title: "日",
                    remark: "号",
                    remark1: "天",
                    value: "",
                    default: "*",
                    range: "1-31",
                    tabs: ["general", "noassign", old + "range", old + "delayed", "nearwork", "lastday", "lastwork", "assign"],
                    verify: Rule
                },
                MM: {
                    title: "月",
                    remark: "月",
                    remark1: "月",
                    value: "",
                    default: "*",
                    range: "1-12",
                    tabs: ["general", old + "range", old + "delayed", "assign"],
                    verify: Rule
                },
                ww: {
                    title: "周",
                    remark: "星期",
                    remark1: "周",
                    value: "",
                    default: "?",
                    range: "1-7",
                    tabs: ["noassign", old + "range", old + "weekfixed", "lastweek", "assign"],
                    verify: Rule,
                    mapping: [
                        { p: 1, n: "星期日" },
                        { p: 2, n: "星期一" },
                        { p: 3, n: "星期二" },
                        { p: 4, n: "星期三" },
                        { p: 5, n: "星期四" },
                        { p: 6, n: "星期五" },
                        { p: 7, n: "星期六" },
                    ]
                },
                yy: {
                    title: "年",
                    remark: "年",
                    remark1: "年",
                    value: "",
                    default: "*",
                    range: `${new Date().getFullYear()}-${Number(new Date().getFullYear() + 20)}`,
                    // tabs: ["general", "oldrange"],
                    verify: Rule
                }
            },
            //工具箱
            Tools: {
                general: {
                    zh: "general",
                    cn: "通配符",
                    default: "*",
                    template: function (Cron, tools) {
                        $dbUI.ctElement({ p: tools, e: "label", t: `每${Cron.remark1}执行一次` });
                    }
                },
                noassign: {
                    zh: "noassign",
                    cn: "不指定",
                    default: "?",
                    template: function (Cron, tools) {
                        $dbUI.ctElement({ p: tools, e: "label", t: "日 周 只能存在一个不指定" });
                    }
                },
                range: {
                    zh: "range",
                    cn: "周期",
                    template: function (Cron, tools) {
                        let _div = $dbUI.ctElement({
                            p: tools, e: "div", c: ["explain"], ape: function () {
                                $dbUI.ctElement({
                                    p: this, e: "input", c: ["dbUI-range"],
                                    attr: [
                                        { key: "name", value: "range" },
                                        { key: "type", value: "text" },
                                        { key: "format", value: Cron.range },
                                        { key: "separator", value: "-" },
                                    ]
                                });
                                $dbUI.ctElement({ p: this, e: "label", c: ["annotation"] });
                            }
                        });
                        function rangeChange() {
                            try {
                                let label = _div.getElementsByTagName("label")[0],
                                    delayed = _div.getElementsByTagName("input")[0],
                                    value = delayed.value,
                                    start = value.split("-")[0].Trim(),
                                    end = value.split("-")[1].Trim();
                                if (Cron.mapping)
                                    label.innerHTML = `从${Cron.mapping.filter(x => x.p == Number(start))[0].n}到${Cron.mapping.filter(x => x.p == Number(end))[0].n}每${Cron.remark1}执行一次`;
                                else
                                    label.innerHTML = `从${start}${Cron.remark}到${end}${Cron.remark}每${Cron.remark1}执行一次`;
                                if (Number(start) > Number(end)) {
                                    start = end;
                                    label.innerHTML += `<div style="color:red;">第一个时间不能大于第二个时间</div>`;
                                }
                                Cron.value = `${start}-${end}`;
                            } catch {

                            }
                        }
                        $dbUI.cron();
                        _div.getElementsByTagName("input")[0].onchange = rangeChange;
                        if (Cron.value.indexOf("-") > -1)
                            _div.getElementsByTagName("input")[0].value = Cron.value;
                        rangeChange();
                    }
                },
                delayed: {
                    zh: "delayed",
                    cn: "延时",
                    template: function (Cron, tools) {
                        let _div = $dbUI.ctElement({
                            p: tools, e: "div", c: ["explain"], ape: function () {
                                $dbUI.ctElement({
                                    p: this, e: "input", c: ["dbUI-range"],
                                    attr: [
                                        { key: "name", value: "delayed" },
                                        { key: "type", value: "text" },
                                        { key: "format", value: Cron.range },
                                        { key: "separator", value: "/" },
                                    ]
                                });
                                $dbUI.ctElement({ p: this, e: "label", c: ["annotation"] });
                            }
                        });
                        function rangeChange() {
                            try {
                                let label = _div.getElementsByTagName("label")[0],
                                    delayed = _div.getElementsByTagName("input")[0],
                                    value = delayed.value,
                                    start = value.split("/")[0].Trim(),
                                    end = value.split("/")[1].Trim();
                                label.innerText = `从${start}${Cron.remark}开始,每${Number(end) == 0 ? "1" : end}${Cron.remark1}执行一次`;
                                Cron.value = `${start}/${end}`;
                            } catch {

                            }
                        }
                        $dbUI.cron();
                        _div.getElementsByTagName("input")[0].onchange = rangeChange;
                        if (Cron.value.indexOf("/") > -1)
                            _div.getElementsByTagName("input")[0].value = Cron.value;
                        rangeChange();
                    }
                },
                assign: {
                    zh: "assign",
                    cn: "指定",
                    template: function (Cron, tools) {
                        let _div = $dbUI.ctElement({
                            p: tools, e: "div", c: ["explain", "assign"], ape: function () {
                                if (Cron.range) {
                                    let start = Number(Cron.range.split("-")[0]),
                                        end = Number(Cron.range.split("-")[1]),
                                        container = this;
                                    for (let i = start; i <= end; i++) {
                                        $dbUI.ctElement({
                                            p: this, e: "div", c: ["grain"], ape: function () {
                                                $dbUI.ctElement({
                                                    p: this, e: "label", event: [
                                                        {
                                                            key: "click", action: function () {
                                                                let checkboxs = container.getElementsByTagName("input");
                                                                let res = [];
                                                                for (let t = 0; t < checkboxs.length; t++) {
                                                                    const e = checkboxs[t];
                                                                    if (e.checked)
                                                                        res.push(e.value);
                                                                }
                                                                Cron.value = res.join(",");
                                                            }
                                                        }
                                                    ], ape: function () {
                                                        $dbUI.ctElement({
                                                            p: this, e: "input", attr: [
                                                                { key: "type", value: "checkbox" },
                                                                { key: "value", value: i }
                                                            ]
                                                        });
                                                        this.innerHTML += i;
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            }
                        });
                        let val = Cron.value.split(",");
                        let inputs = _div.getElementsByTagName("input");
                        for (let i = 0; i < inputs.length; i++) {
                            if (val.indexOf(inputs[i].value) > -1)
                                inputs[i].checked = true;
                        }
                    }
                },
                weekfixed: {
                    zh: "weekfixed",
                    cn: "固定周期",
                    template: function (Cron, tools) {
                        let _div = $dbUI.ctElement({
                            p: tools, e: "div", c: ["explain"], ape: function () {
                                $dbUI.ctElement({
                                    p: this, e: "input", c: ["dbUI-range"],
                                    attr: [
                                        { key: "name", value: "delayed" },
                                        { key: "type", value: "text" },
                                        { key: "format", value: Cron.range },
                                        { key: "separator", value: "#" },
                                    ]
                                });
                                $dbUI.ctElement({ p: this, e: "label", c: ["annotation"] });
                            }
                        });
                        function rangeChange() {
                            try {
                                let label = _div.getElementsByTagName("label")[0],
                                    delayed = _div.getElementsByTagName("input")[0],
                                    value = delayed.value,
                                    start = value.split("#")[0].Trim(),
                                    end = value.split("#")[1].Trim();
                                label.innerHTML = `第${end}${Cron.remark1}的${Cron.mapping.filter(x => x.p == Number(start))[0].n}执行一次`;
                                if (Number(end) > 5) {
                                    end = "5";
                                    label.innerHTML += `<div style="color:red;">每个月最多只有${end}周</div>`;
                                }
                                Cron.value = `${start}#${end}`;
                            } catch {

                            }
                        }
                        $dbUI.cron();
                        _div.getElementsByTagName("input")[0].onchange = rangeChange;
                        if (Cron.value.indexOf("#") > -1)
                            _div.getElementsByTagName("input")[0].value = Cron.value;
                        rangeChange();
                    }
                },
                nearwork: {
                    zh: "nearwork",
                    cn: "最近工作日",
                    template: function (Cron, tools) {
                        let _div = $dbUI.ctElement({
                            p: tools, e: "div", c: ["explain"], ape: function () {
                                $dbUI.ctElement({ p: this, e: "label", t: "每月" });
                                let days = $dbUI.ctElement({
                                    p: this, e: "input", c: ["criteria"],
                                    attr: [{ key: "type", value: "text" }],
                                    event: [{ key: "change", action: nearchange }]
                                });
                                $dbUI.ctElement({ p: this, e: "label", t: `${Cron.remark}最近的那个工作日` });
                                function nearchange(e) {
                                    if (Number(this.value) < 1) {
                                        this.value = 1;
                                    }
                                    if (Number(this.value) > 31) {
                                        this.value = 31;
                                    }
                                    Cron.value = this.value + "W";
                                }
                                if (Cron.value.indexOf("W") > -1) {
                                    let val = Number(Cron.value.replace("W", ""));
                                    days.value = isNaN(val) ? "" : val;
                                }
                            }
                        });
                    }
                },
                lastwork: {
                    zh: "lastwork",
                    cn: "最后工作日",
                    default: "LW",
                    template: function (Cron, tools) {
                        $dbUI.ctElement({ p: tools, e: "label", t: `每个月最后一个工作日` });
                    }
                },
                lastday: {
                    zh: "lastday",
                    cn: "最后一天",
                    default: "L",
                    template: function (Cron, tools) {
                        $dbUI.ctElement({ p: tools, e: "label", t: `每个月最后一天` });
                    }
                },
                lastweek: {
                    zh: "lastweek",
                    cn: "最后一周",
                    template: function (Cron, tools) {
                        let _div = $dbUI.ctElement({
                            p: tools, e: "div", c: ["explain"], ape: function () {
                                $dbUI.ctElement({ p: this, e: "label", t: "每月最后一周的" });
                                let select = $dbUI.ctElement({
                                    p: this, e: "select", c: ["criterias"],
                                    event: [{ key: "change", action: lastchange }],
                                    ape: function () {
                                        $dbUI.ctElement({ p: this, e: "option", attr: [{ key: "value", value: Cron.default }], t: "不指定" });
                                        for (let t1 = 0; t1 < Cron.mapping.length; t1++) {
                                            const e = Cron.mapping[t1];
                                            $dbUI.ctElement({ p: this, e: "option", attr: [{ key: "value", value: e.p }], t: e.n });
                                        }
                                    }
                                });
                                function lastchange(e) {
                                    Cron.value = this.value + "L";
                                    if (this.value == Cron.default) Cron.value = Cron.default;
                                }
                                if (Cron.value.indexOf("L") > -1) {
                                    let val = Number(Cron.value.replace("L", ""));
                                    for (let t1 = 0; t1 < select.options.length; t1++) {
                                        const e = select.options[t1];
                                        if (e.value == val) {
                                            e.selected = true;
                                        }
                                    }
                                }
                            }
                        });
                    }
                },
                oldrange: {
                    zh: "oldrange",
                    cn: "周期",
                    template: function (Cron, tools) {
                        let _div = $dbUI.ctElement({
                            p: tools, e: "div", c: ["explain"], ape: function () {
                                $dbUI.ctElement({ p: this, e: "label", t: "从" });
                                let left = $dbUI.ctElement({
                                    p: this, e: "input", c: ["criteria"],
                                    attr: [{ key: "type", value: "text" }],
                                    event: [{ key: "change", action: oldchange }]
                                });
                                $dbUI.ctElement({ p: this, e: "label", t: `${Cron.remark}到` });
                                let right = $dbUI.ctElement({
                                    p: this, e: "input", c: ["criteria"],
                                    attr: [{ key: "type", value: "text" }],
                                    event: [{ key: "change", action: oldchange }]
                                });
                                $dbUI.ctElement({ p: this, e: "label", t: `${Cron.remark}每${Cron.remark1}执行一次` });
                                function oldchange(e) {
                                    let start = Cron.range.split("-")[0],
                                        end = Cron.range.split("-")[1];
                                    if (Number(left.value) > Number(end))
                                        left.value = end;
                                    if (Number(right.value) > Number(end))
                                        right.value = end;
                                    if (Number(left.value) < Number(start))
                                        left.value = start;
                                    if (Number(right.value) < Number(start))
                                        right.value = start;
                                    if (left.value == "" || !/^\d+$/.test(left.value))
                                        return;
                                    if (right.value == "" || !/^\d+$/.test(right.value))
                                        return;
                                    if (Number(left.value) > Number(right.value))
                                        Cron.value = `${right.value}-${right.value}`;
                                    else
                                        Cron.value = `${left.value}-${right.value}`;
                                }
                                if (Cron.value.indexOf("-") > -1) {
                                    let lval = Cron.value.split("-")[0],
                                        rval = Cron.value.split("-")[1];
                                    left.value = lval;
                                    right.value = rval;
                                }
                            }
                        });
                    }
                },
                olddelayed: {
                    zh: "olddelayed",
                    cn: "延时",
                    template: function (Cron, tools) {
                        let _div = $dbUI.ctElement({
                            p: tools, e: "div", c: ["explain"], ape: function () {
                                $dbUI.ctElement({ p: this, e: "label", t: "从" });
                                let left = $dbUI.ctElement({
                                    p: this, e: "input", c: ["criteria"],
                                    attr: [{ key: "type", value: "text" }],
                                    event: [{ key: "change", action: oldchange }]
                                });
                                $dbUI.ctElement({ p: this, e: "label", t: `${Cron.remark}开始,每` });
                                let right = $dbUI.ctElement({
                                    p: this, e: "input", c: ["criteria"],
                                    attr: [{ key: "type", value: "text" }],
                                    event: [{ key: "change", action: oldchange }]
                                });
                                $dbUI.ctElement({ p: this, e: "label", t: `${Cron.remark1}执行一次` });
                                function oldchange(e) {
                                    let start = Cron.range.split("-")[0],
                                        end = Cron.range.split("-")[1];
                                    if (Number(left.value) > Number(end))
                                        left.value = end;
                                    if (Number(right.value) > Number(end))
                                        right.value = end;
                                    if (Number(left.value) < Number(start))
                                        left.value = start;
                                    if (Number(right.value) < Number(start))
                                        right.value = start;
                                    if (left.value == "" || !/^\d+$/.test(left.value))
                                        return;
                                    if (right.value == "" || !/^\d+$/.test(right.value))
                                        return;
                                    Cron.value = `${left.value}/${right.value}`;
                                }
                                if (Cron.value.indexOf("/") > -1) {
                                    let lval = Cron.value.split("/")[0],
                                        rval = Cron.value.split("/")[1];
                                    left.value = lval;
                                    right.value = rval;
                                }
                            }
                        });
                    }
                },
                oldweekfixed: {
                    zh: "oldweekfixed",
                    cn: "固定周期",
                    template: function (Cron, tools) {
                        let _div = $dbUI.ctElement({
                            p: tools, e: "div", c: ["explain"], ape: function () {
                                $dbUI.ctElement({ p: this, e: "label", t: "第" });
                                let left = $dbUI.ctElement({
                                    p: this, e: "input", c: ["criteria"],
                                    attr: [{ key: "type", value: "text" }],
                                    event: [{ key: "change", action: oldchange }]
                                });
                                $dbUI.ctElement({ p: this, e: "label", t: `${Cron.remark1}的${Cron.remark}` });
                                let right = $dbUI.ctElement({
                                    p: this, e: "input", c: ["criteria"],
                                    attr: [{ key: "type", value: "text" }],
                                    event: [{ key: "change", action: oldchange }]
                                });
                                $dbUI.ctElement({ p: this, e: "label", t: `执行一次` });
                                function oldchange(e) {
                                    let start = Cron.range.split("-")[0],
                                        end = Cron.range.split("-")[1];
                                    if (Number(left.value) > 5)
                                        left.value = "5";
                                    if (Number(right.value) > Number(end))
                                        right.value = end;
                                    if (Number(left.value) < Number(start))
                                        left.value = start;
                                    if (Number(right.value) < Number(start))
                                        right.value = start;
                                    if (left.value == "" || !/^\d+$/.test(left.value))
                                        return;
                                    if (right.value == "" || !/^\d+$/.test(right.value))
                                        return;
                                    Cron.value = `${right.value}#${left.value}`;
                                }
                                if (Cron.value.indexOf("#") > -1) {
                                    let lval = Cron.value.split("#")[0],
                                        rval = Cron.value.split("#")[1];
                                    left.value = lval;
                                    right.value = rval;
                                }
                            }
                        });
                    }
                }
            }
        }

        //代理驱动
        $dbUI.defineProxy(Class.Cron, {
            get(target, key, prev) {
                return target[key];
            },
            set(target, key, value, prev) {
                target[key] = value;
                if (target.verify)
                    eval(target.verify);
                input.value = `${Class.Cron.ss.value} ${Class.Cron.mm.value} ${Class.Cron.hh.value} ${Class.Cron.dd.value} ${Class.Cron.MM.value} ${Class.Cron.ww.value}${Class.Cron.yy.value == "*" ? "" : " " + Class.Cron.yy.value}`;
            }
        }, true);

        classDefault();

        //整体框架
        let variety;
        let tools;
        let panel = $dbUI.ctElement({
            p: config, e: "div", c: ["panel"], ape: function () {
                variety = $dbUI.ctElement({ p: this, e: "div", c: ["variety"] });
                tools = $dbUI.ctElement({ p: this, e: "div", c: ["tools"] });
            }
        });


        {//菜单驱动
            $dbUI.ctElement({
                pa: panel, e: "ul", c: ["menu"], ape: function () {
                    let cron = Object.keys(Class.Cron);
                    for (let t = 0; t < cron.length; t++) {
                        let key = cron[t];
                        let li = $dbUI.ctElement({
                            p: this, e: "li", t: Class.Cron[key].title, event: [
                                {
                                    key: "click", action: function () {
                                        let curCron = Class.Cron[key],
                                            bors = this.parentNode.children;;
                                        menuClick(curCron);
                                        for (let i = 0; i < bors.length; i++) {
                                            if (bors[i].classList.contains("this")) {
                                                bors[i].classList.remove("this");
                                            }
                                        }
                                        this.classList.add("this");
                                    }
                                }
                            ]
                        });
                        if (key == "ss") li.click();
                    }
                }
            });

            function menuClick(Cron) {
                variety.innerHTML = "";
                for (let i = 0; i < Cron.tabs.length; i++) {
                    let tab = Class.Tools[Cron.tabs[i]];
                    let label = $dbUI.ctElement({
                        p: variety, e: "label", event: [
                            {
                                key: "click", action: function (e) {
                                    varietyClick(e, Cron, tab);
                                }
                            }
                        ], ape: function () {
                            $dbUI.ctElement({
                                p: this, e: "input", attr: [
                                    { key: "type", value: "radio" },
                                    { key: "name", value: "crontype" },
                                    { key: "data-value", value: tab.zh }
                                ]
                            }); this.innerHTML += tab.cn;
                        }
                    });
                    if (Cron.value == "*" && Cron.tabs[i] == "general") {
                        label.click();
                    }
                    else if (Cron.value == "?" && Cron.tabs[i] == "noassign") {
                        label.click();
                    }
                    else if (Cron.value.indexOf("-") > -1 && Cron.tabs[i] == "range") {
                        label.click();
                    }
                    else if (Cron.value.indexOf("/") > -1 && Cron.tabs[i] == "delayed") {
                        label.click();
                    }
                    else if (Cron.value.indexOf("#") > -1 && Cron.tabs[i] == "weekfixed") {
                        label.click();
                    }
                    else if (Cron.value.indexOf("-") > -1 && Cron.tabs[i] == "oldrange") {
                        label.click();
                    }
                    else if (Cron.value.indexOf("/") > -1 && Cron.tabs[i] == "olddelayed") {
                        label.click();
                    }
                    else if (Cron.value.indexOf("#") > -1 && Cron.tabs[i] == "oldweekfixed") {
                        label.click();
                    }
                    else if (Cron.value == "LW" && Cron.tabs[i] == "lastwork") {
                        label.click();
                    }
                    else if (Cron.value == "L" && Cron.tabs[i] == "lastday") {
                        label.click();
                    }
                    else if (Cron.value.indexOf("W") > -1 && Cron.tabs[i] == "nearwork") {
                        label.click();
                    }
                    else if (Cron.value.indexOf("L") > -1 && Cron.tabs[i] == "lastweek") {
                        label.click();
                    }
                    else if ((Cron.value.indexOf(",") > -1 || /^\d+$/.test(Cron.value)) && Cron.tabs[i] == "assign") {
                        label.click();
                    }
                }
            }

            function varietyClick(e, Cron, Tool) {
                tools.innerHTML = "";
                if (Tool.default)
                    Cron.value = Tool.default;
                if (Tool.template)
                    Tool.template(Cron, tools);
            }
        }

        //修改Cron栏 同步响应到实体
        input.addEventListener("change", function () {
            InitCronModule();
        }, false);

        //初始化Cron栏中的Cron到实体
        function InitCronModule() {
            let fields = input.value.split(" "),
                second = fields[0],
                minute = fields[1],
                hours = fields[2],
                day = fields[3],
                month = fields[4],
                week = fields[5],
                year = fields[6];
            if (Class.Cron.ss.value != second)
                Class.Cron.ss.value = second;
            if (Class.Cron.mm.value != minute)
                Class.Cron.mm.value = minute;
            if (Class.Cron.hh.value != hours)
                Class.Cron.hh.value = hours;
            if (Class.Cron.dd.value != day)
                Class.Cron.dd.value = day;
            if (Class.Cron.MM.value != month)
                Class.Cron.MM.value = month;
            if (Class.Cron.ww.value != week)
                Class.Cron.ww.value = week;
            if (year && Class.Cron.yy.value != year)
                Class.Cron.yy.value = year;
        }

        //面板开关
        select.addEventListener("click", function () {
            //隐藏配置栏
            if (config.classList.contains("show")) {
                config.classList.remove("show");
            }
            else {
                config.classList.add("show");
            }
        }, false);

        //重置按钮
        clear.addEventListener("click", function () {
            classDefault();
        }, false);

        //充值
        function classDefault() {
            Class.Cron.ss.value = Class.Cron.ss.default;
            Class.Cron.mm.value = Class.Cron.mm.default;
            Class.Cron.hh.value = Class.Cron.hh.default;
            Class.Cron.dd.value = Class.Cron.dd.default;
            Class.Cron.MM.value = Class.Cron.MM.default;
            Class.Cron.ww.value = Class.Cron.ww.default;
            Class.Cron.yy.value = Class.Cron.yy.default;
        }
    }
}($dbUI));

/**
 * 范围选择框
 */
(function ($dbUI) {
    function cron() {
        let range = document.getElementsByClassName("dbUI-range");
        for (let i = 0; i < range.length; i++) {
            const ele = range[i],
                select = { left: "", right: "" };
            let parent = ele.parentNode;
            if (ele.tagName === "INPUT") {
                $dbUI.ctElement({
                    pa: ele, e: "div", c: ["dbUI-range"], attr: [
                        { key: "style", value: ele.getAttribute("style") }
                    ], ape: function () {
                        let format = ele.getAttribute("format"),
                            separator = ele.getAttribute("separator"),
                            input = $dbUI.ctElement({
                                p: this, e: "input", attr: [
                                    { key: "id", value: ele.getAttribute("id") },
                                    { key: "name", value: ele.getAttribute("name") },
                                    { key: "type", value: "text" },
                                    { key: "readonly", value: "" },
                                    { key: "format", value: format },
                                    { key: "separator", value: separator }
                                ],
                                event: [
                                    { key: "click", action: selectClick },
                                    { key: "mousedown", action: noselect }
                                ]
                            }),
                            prevBtn = [
                                $dbUI.ctElement({
                                    e: "li", t: "▲", event: [
                                        { key: "mousedown", action: Prev },
                                        { key: "mouseup", action: Close },
                                    ]
                                }),
                                $dbUI.ctElement({
                                    e: "li", t: "▲", event: [
                                        { key: "mousedown", action: Prev },
                                        { key: "mouseup", action: Close },
                                    ]
                                })
                            ],
                            nextBtn = [
                                $dbUI.ctElement({
                                    e: "li", t: "▼", event: [
                                        { key: "mousedown", action: Next },
                                        { key: "mouseup", action: Close },
                                    ]
                                }),
                                $dbUI.ctElement({
                                    e: "li", t: "▼", event: [
                                        { key: "mousedown", action: Next },
                                        { key: "mouseup", action: Close },
                                    ]
                                })
                            ];

                        function noselect(e) { e.preventDefault(); }

                        let meter = $dbUI.ctElement({
                            p: this, e: "div", c: ["meter"], ape: function () {
                                $dbUI.ctElement({ p: this, e: "ul", attr: [{ key: "data-align", value: "left" }] });
                                $dbUI.ctElement({ p: this, e: "ul", attr: [{ key: "data-align", value: "right" }] });
                            }
                        });

                        var prevArr = [];
                        var Render = null;
                        $dbUI.defineProp(select, "left", null, function () {
                            let val = input.value,
                                vals = val.split(separator),
                                format = input.getAttribute("format"),//格式参数
                                range = format.split("-"),//范围
                                start = Number(range[0]),//范围开始
                                init = val == "";
                            if (!init) input.value = [this.left, vals[1].Trim()].join(`${separator}`);
                            else input.value = [this.left, start].join(`${separator}`);
                            input.onchange();
                            Render(0);
                        });
                        $dbUI.defineProp(select, "right", null, function (newValue) {
                            let val = input.value,
                                vals = val.split(separator),
                                format = input.getAttribute("format"),//格式参数
                                range = format.split("-"),//范围
                                start = Number(range[0]),//范围开始
                                init = val == "";
                            if (!init) input.value = [vals[0].Trim(), this.right].join(`${separator}`);
                            else input.value = [start, this.right].join(`${separator}`);
                            input.onchange();
                            Render(1);
                        });

                        function selectClick() {
                            let meter = this.nextElementSibling,//选择框
                                input = this,//点击弹出框时的值
                                value = input.value,
                                format = input.getAttribute("format"),//格式参数
                                range = format.split("-"),//范围
                                start = Number(range[0]),//范围开始
                                end = Number(range[1]),//范围结束
                                rangeArr = [],
                                meterList = meter.classList;//范围数组

                            //两个滚动选择条
                            let uls = meter.getElementsByTagName("ul");

                            //打开选择面板
                            if (meterList.contains("show")) {
                                meterList.remove("show");
                                document.removeEventListener("click", globel, false);
                            }
                            else {
                                meterList.add("show");
                                document.addEventListener("click", globel, false);
                            }

                            //注入范围数组
                            for (let i = start; i <= end; i++)
                                rangeArr.push(i);

                            //首先判断Input是否有初始值
                            let init = value == "",
                                lpoint = start,
                                rpoint = start,
                                vals = !init ? value.split(separator) : [];
                            //如果有值则赋值
                            if (!init) {
                                lpoint = Number(vals[0]);
                                rpoint = Number(vals[1]);
                            }

                            //渲染
                            Render = function (index) {
                                const item = uls[index],
                                    value = input.value;
                                //获取渲染前的内存
                                prevArr = Array.from(item.parentNode.getElementsByTagName("*"));
                                prevArr.push(input);
                                //每次点击都清空
                                item.innerHTML = "";
                                //首先判断Input是否有初始值
                                let init = value == "",
                                    point = start,
                                    vals = !init ? value.split(separator) : [];
                                //如果有值则赋值
                                if (!init) point = Number(vals[index]);

                                //上一个
                                item.appendChild(prevBtn[index]);

                                for (let i = 0; i < 5; i++) {
                                    //获取数组值的点位
                                    let index = rangeArr.indexOf(point),
                                        //计算5个值的位置
                                        sign = -2 + i,
                                        //范围数组最大长度
                                        arrLen = rangeArr.length,
                                        //点位是否超出
                                        overstep = index + sign,
                                        //头部超出接尾
                                        prev = arrLen + overstep,
                                        //尾部超出接头
                                        next = 0 + (overstep - arrLen),
                                        //超出指针末尾值
                                        pos = overstep >= arrLen ? next : prev,
                                        //标志位
                                        curindex = overstep < 0 || overstep >= arrLen
                                            ? pos : overstep,
                                        //实际值
                                        rangeText = rangeArr[curindex].toString();

                                    $dbUI.ctElement({
                                        p: item, e: "li", c: [!init && rangeText == point ? "this" : ""], t: rangeText,
                                        event: [{ key: "click", action: SureClick }]
                                    });
                                }

                                //下一个
                                item.appendChild(nextBtn[index]);
                            }

                            select.left = lpoint.toString();
                            select.right = rpoint.toString();
                        }

                        function SureClick() {
                            let val = input.value,
                                vals = val.split(separator),
                                text = this.innerText,
                                init = val == "",
                                ul = this.parentNode,
                                attr = ul.getAttribute("data-align"),
                                format = input.getAttribute("format"),//格式参数
                                range = format.split("-"),//范围
                                start = Number(range[0]);
                            switch (attr) {
                                case "left":
                                    select.left = text;
                                    break;
                                case "right":
                                    select.right = text;
                                    break;
                            }
                        }

                        var prevtime;
                        var nexttime;
                        //轮询点击上一个
                        function Prev() {
                            let part = this.parentNode,
                                allele = part.children;
                            prevtime = setInterval(function () {
                                allele[2].click();
                            }, 60);
                        }
                        //轮询点击下一个
                        function Next() {
                            let part = this.parentNode,
                                allele = part.children;
                            nexttime = setInterval(function () {
                                allele[4].click();
                            }, 60);
                        }
                        //取消轮询
                        function Close() {
                            if (prevtime != null) clearInterval(prevtime);
                            if (nexttime != null) clearInterval(nexttime);
                            prevtime = null;
                            nexttime = null;
                        }
                        //点击无关元素就隐藏
                        function globel(e) {
                            let arr = Array.from(meter.getElementsByTagName("*"));
                            if (prevArr.indexOf(e.target) == -1) {
                                if (meter.classList.contains("show")) {
                                    meter.classList.remove("show");
                                    document.removeEventListener("click", globel, false);
                                }
                            }
                        }
                    }
                });

                parent.removeChild(ele);
            }
        }
    } cron();
    $dbUI.cron = cron;
}($dbUI));