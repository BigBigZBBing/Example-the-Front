//下拉选择组件渲染
(function ($dbUI) {
    let dbUI_selects = document.getElementsByClassName('dbUI-select');
    for (var i = dbUI_selects.length - 1; i >= 0; i--) {
        let package = [];
        let select = dbUI_selects[i];
        let tagName = select.tagName;
        if (tagName == 'SELECT') {
            var currNode = select.parentNode;
            $dbUI.ctElement({
                pa: select, e: 'div', c: ['dbUI-select'], ape: function () {
                    let container;
                    $dbUI.ctElement({
                        p: this, e: 'div', c: ['dbUI-select2'], ape: function () {
                            let type = select.getAttribute('type');
                            if (!type || type == 'single') {
                                container = $dbUI.ctElement({ p: this, e: 'input', c: ['select2-input'] });
                                let attrs = select.attributes;
                                for (let t = 0; t < attrs.length; t++) {
                                    if (attrs[t].localName == 'style')
                                        container.setAttribute(attrs[t].localName, attrs[t].value);
                                    if (attrs[t].localName == 'placeholder')
                                        container.setAttribute(attrs[t].localName, attrs[t].value);
                                }
                                container.setAttribute('readonly', '');
                            }
                            else if (type == 'multiple') {
                                container = $dbUI.ctElement({ p: this, e: 'div', c: ['select2-div'] });
                                let attrs = select.attributes;
                                for (let t = 0; t < attrs.length; t++) {
                                    if (attrs[t].localName == 'style')
                                        container.setAttribute(attrs[t].localName, attrs[t].value);
                                    if (attrs[t].localName == 'placeholder')
                                        container.setAttribute(attrs[t].localName, attrs[t].value);
                                }
                            }
                        }
                    });
                    $dbUI.ctElement({ p: this, e: 'i', c: ['dbUI-select-i'] });
                    var childs = [];
                    if (select.getAttribute('url')) {
                        $dbUI.get(select.getAttribute('url'), function (res) {
                            childs = JSON.parse(res);
                            for (let t1 = 0; t1 < childs.length; t1++) {
                                childs[t1].selected = null;
                            }
                        });
                    }
                    else {
                        Array.from(select.children).forEach(e => {
                            childs.push({
                                key: e.innerText
                                , value: e.getAttribute('value')
                                , selected: e.getAttribute('selected')
                            });
                        });
                    }
                    if (childs.length > 0) {
                        let dl = $dbUI.ctElement({
                            p: this, e: 'dl', c: ['dbUI-select-dl'], ape: function () {
                                if (select.getAttribute('search') && select.getAttribute('search') == 'true') {
                                    $dbUI.ctElement({
                                        p: this, e: 'div', c: ['search'], ape: function () {
                                            $dbUI.ctElement({
                                                p: this, e: 'input', c: ['search-input'], attr: [
                                                    { key: "type", value: "text" },
                                                    { key: "placeholder", value: "快捷搜索" }
                                                ]
                                                , event: [{
                                                    key: 'input', action: function () {
                                                        Bind(childs, this.value, dl, container);
                                                    }
                                                }]
                                            });
                                        }
                                    });
                                }
                                Bind(childs, "", this, container);
                            }
                        });
                        this.Bind('click', function () {
                            var ndl = this.getElementsByClassName('dbUI-select-dl');
                            if (!ndl[0].classList.contains('show')) {
                                ndl[0].classList.add('show');
                                this.classList.add('show');
                            }
                        });
                    }
                    select.remove();
                }
            });
        }

        /**
         *
         * 单选绑定
         * @param {*} source 数据源
         * @param {*} value 选中值
         * @param {*} parent 下拉框容器
         * @param {*} container 显示选中内容容器
         */
        function Bind(source, value, parent, container) {
            parent.RemoveChilds('dd');
            let type = select.getAttribute('type');
            let temp = source;
            if (value.length > 0) {
                temp = source.filter(x => x.key.indexOf(value) > -1);
            }
            for (var t = 0; t < temp.length; t++) {
                let attr = [];
                attr.push({ key: "value", value: temp[t].value });
                if (temp[t].selected != null) {
                    attr.push({ key: 'selected', value: '' });
                }
                $dbUI.ctElement({
                    p: parent, e: 'dd', t: temp[t].key,
                    attr: attr,
                    event: [
                        {
                            key: 'click', action: function () {
                                let values = this.parentNode.Prev().Prev().children[0];
                                let childs = this.parentNode.getElementsByTagName('dd');
                                for (let t1 = 0; t1 < source.length; t1++) {
                                    source[t1].selected = null;
                                }
                                for (let t1 = 0; t1 < childs.length; t1++) {
                                    if (childs[t1] == this) {
                                        temp[t1].selected = '';
                                    }
                                    if (childs[t1].getAttribute('selected') != null) {
                                        childs[t1].removeAttribute('selected');
                                    }
                                }
                                this.setAttribute('selected', '');
                                if (!type || type == "single") {
                                    values.value = this.innerText;
                                    package = {
                                        key: this.innerText,
                                        val: this.getAttribute('value')
                                    };
                                }
                                else if (type == "multiple") {
                                    if (this.getAttribute('value') != '') {
                                        //创建多选的div
                                        $dbUI.ctElement({
                                            p: values,
                                            e: 'div',
                                            c: ['select2-value'],
                                            t: this.innerText,
                                            attr: [
                                                { key: 'value', value: this.getAttribute('value') }
                                            ],
                                            event: [{
                                                key: 'click', action: function () {
                                                    let temp = this;
                                                    //延迟50毫秒应对立刻触发出现下拉框
                                                    setTimeout(function () {
                                                        for (let i = 0; i < package.length; i++) {
                                                            const el = package[i];
                                                            if (el.key == temp.innerText) {
                                                                package.splice(i, 1);
                                                                break;
                                                            }
                                                        }
                                                        temp.remove();
                                                    }, 50);
                                                }
                                            }]
                                        });
                                        package.push({
                                            key: this.innerText,
                                            val: this.getAttribute('value')
                                        });
                                    }
                                }
                            }
                        }
                    ]
                });
                if (temp[t].selected != null) {
                    container.value = temp[t].key;
                }
            }
        }
    }
    //点击以外的dom 触发关闭下拉框
    document.body.Bind('click', function () {
        var currobj = event.target;
        var dbUI_selects = document.getElementsByClassName('dbUI-select');
        Array.from(dbUI_selects).forEach(e => {
            if (e.classList.contains('show')
                && !currobj.parentNode.classList.contains('dbUI-select2')
                && !currobj.parentNode.classList.contains('search')) {
                e.classList.remove('show');
                e.getElementsByClassName('dbUI-select-dl')[0].classList.remove('show');
            }
        });
    });
}($dbUI));

//多选块组件渲染
(function ($dbUI) {
    var dbUI_blocks = document.getElementsByClassName('dbUI-block');
    for (var i = dbUI_blocks.length - 1; i >= 0; i--) {
        var block = dbUI_blocks[i];
        var tagName = block.tagName;
        if (tagName == 'INPUT') {
            var currNode = block.parentNode;
            var div = document.createElement('div');
            div.classList.add('dbUI-block');
            currNode.insertBefore(div, block);
            var input = document.createElement('input');
            var attrs = block.attributes;
            for (var t = 0; t < attrs.length; t++) {
                if (attrs[t].localName != 'class' && attrs[t].localName != 'text') {
                    input.setAttribute(attrs[t].localName, attrs[t].value);
                }
            }
            input.setAttribute('hidden', 'hidden');
            div.appendChild(input);
            var font = document.createElement('font');
            font.innerText = block.getAttribute('text');
            div.appendChild(font);
            div.addEventListener('click', function () {
                this.children[0].click();
                switch (this.children[0].checked) {
                    case true:
                        if (!this.classList.contains('this')) {
                            this.classList.add('this');
                        }
                        break;
                    case false:
                        if (this.classList.contains('this')) {
                            this.classList.remove('this');
                        }
                        break;
                }
            });
            currNode.removeChild(block);
        }
    }
}($dbUI));

//多选框组件渲染
(function ($dbUI) {
    var dbUI_checkboxs = document.getElementsByClassName('dbUI-checkbox');
    for (var i = dbUI_checkboxs.length - 1; i >= 0; i--) {
        var checkbox = dbUI_checkboxs[i];
        var tagName = checkbox.tagName;
        if (tagName == 'INPUT') {
            var currNode = checkbox.parentNode;
            var div = document.createElement('div');
            div.classList.add('dbUI-checkbox');
            currNode.insertBefore(div, checkbox);
            var label = document.createElement('label');
            div.appendChild(label);
            var input = document.createElement('input');
            var attrs = checkbox.attributes;
            for (var t = 0; t < attrs.length; t++) {
                if (attrs[t].localName != 'class' && attrs[t].localName != 'label') {
                    input.setAttribute(attrs[t].localName, attrs[t].value);
                }
            }
            input.setAttribute('hidden', 'hidden');
            label.appendChild(input);
            var span = document.createElement('span');
            label.appendChild(span);
            var font = document.createElement('font');
            font.innerText = checkbox.getAttribute('label');
            label.appendChild(font);
            currNode.removeChild(checkbox);
        }
    }
}($dbUI));

//单选框组件渲染
(function ($dbUI) {
    var dbUI_checkboxs = document.getElementsByClassName('dbUI-radio');
    for (var i = dbUI_checkboxs.length - 1; i >= 0; i--) {
        var checkbox = dbUI_checkboxs[i];
        var tagName = checkbox.tagName;
        if (tagName == 'INPUT') {
            var currNode = checkbox.parentNode;
            var div = document.createElement('div');
            div.classList.add('dbUI-radio');
            currNode.insertBefore(div, checkbox);
            var label = document.createElement('label');
            div.appendChild(label);
            var input = document.createElement('input');
            var attrs = checkbox.attributes;
            for (var t = 0; t < attrs.length; t++) {
                if (attrs[t].localName != 'class' && attrs[t].localName != 'label') {
                    input.setAttribute(attrs[t].localName, attrs[t].value);
                }
            }
            label.appendChild(input);
            var span = document.createElement('span');
            label.appendChild(span);
            var font = document.createElement('font');
            font.innerText = checkbox.getAttribute('label');
            label.appendChild(font);
            currNode.removeChild(checkbox);
        }
    }
}($dbUI));

//滑块功能
(function ($dbUI) {
    $dbUI.initslider = function initslider() {
        var dbUI_sliders = document.getElementsByClassName('dbUI-slider');
        for (var i = 0; i < dbUI_sliders.length; i++) {
            var slider = dbUI_sliders[i];
            var tagName = slider.tagName;
            if (tagName == 'INPUT') {
                var currNode = slider.parentNode;
                var Iswitch = function () {
                    this.children[0].checked = this.children[0].checked ? false : true;
                    if (this.children[0].checked) {
                        this.children[1].classList.replace('close', 'open');
                    }
                    else {
                        this.children[1].classList.replace('open', 'close');
                    }
                };
                $dbUI.ctElement({
                    p: currNode, e: 'div', c: ['dbUI-slider'], ape: function () {
                        var attr = [];
                        Array.from(slider.attributes).forEach(e => {
                            attr.push({ key: e.localName, value: e.value });
                        });
                        var input = $dbUI.ctElement({ p: this, e: 'input', attr: attr });
                        input.RemoveClass("dbUI-slider");
                        input.setAttribute("hidden", "");
                        $dbUI.ctElement({ p: this, e: 'div', c: ['slider-switch', slider.checked ? 'open' : 'close'] });
                    }, event: [{ key: 'click', action: Iswitch }]
                });
                currNode.removeChild(slider);
            }
        }
    }; $dbUI.initslider();
}($dbUI));

//日期选择器组件渲染
(function ($dbUI) {
    $dbUI.initdatepicker = function initdatepicker(ele) {
        var dbUI_dates = ele ? [ele] : document.getElementsByClassName("dbUI-date");
        for (var i = dbUI_dates.length - 1; i >= 0; i--) {
            var date = dbUI_dates[i];
            var tagName = date.tagName;
            if (tagName == "INPUT") {
                var currNode = date.parentNode;
                let select = $dbUI.ctElement({
                    p: currNode, e: "div", c: ["dbUI-date"], ape: function () {
                        var attrs = date.attributes;
                        var attrA = [];
                        var dateObj = {
                            year: 0,
                            month: 0,
                            hour: 19,
                            minute: 44,
                            second: 0,
                            date: null,
                            format: ""
                        };
                        for (var t = 0; t < attrs.length; t++) {
                            if (attrs[t].localName != "class") {
                                attrA.push({ key: attrs[t].localName, value: attrs[t].value });
                            }
                        }
                        var dateinput = $dbUI.ctElement({ p: this, e: "input", c: ["dbUI-date-input"], attr: attrA });
                        $dbUI.ctElement({
                            p: this, e: "div", c: ["dbUI-datepicker"], ape: function () {
                                var par = this;
                                var reset = function () {
                                    par.innerHTML = "";
                                    updateCalendar(par, dateObj);
                                };
                                var changetime = function () {
                                    updateWatch(par, dateObj);
                                };
                                $dbUI.defineProp(dateObj, "year", null, reset);
                                $dbUI.defineProp(dateObj, "month", null, reset);

                                $dbUI.defineProp(dateObj, "hour", null, changetime);
                                $dbUI.defineProp(dateObj, "minute", null, changetime);
                                $dbUI.defineProp(dateObj, "second", null, changetime);

                                dateinput.addEventListener("click", function () {
                                    if (dateinput.nextSibling.classList.contains("show")) return;
                                    switch (this.getAttribute("format")) {
                                        case "date":
                                            var cur = new Date();
                                            if (this.value != "")
                                                cur = new Date(this.value);
                                            dateObj.format = "date";
                                            dateObj.date = cur;
                                            dateObj.year = cur.getFullYear();
                                            dateObj.month = cur.getMonth() + 1;
                                            break;
                                        case "time":
                                            var cur = new Date();
                                            if (this.value != "")
                                                cur = new Date("2000-01-01 " + this.value);
                                            dateObj.format = "time";
                                            dateObj.hour = cur.getHours();
                                            dateObj.minute = cur.getMinutes();
                                            dateObj.second = cur.getSeconds();
                                            break;
                                        case "datetime":
                                            var cur = new Date();
                                            if (this.value != "")
                                                cur = new Date(this.value);
                                            dateObj.format = "datetime";
                                            dateObj.date = cur;
                                            dateObj.year = cur.getFullYear();
                                            dateObj.month = cur.getMonth() + 1;
                                            dateObj.hour = cur.getHours();
                                            dateObj.minute = cur.getMinutes();
                                            dateObj.second = cur.getSeconds();
                                            break;
                                    }
                                    this.nextSibling.classList.add("show");
                                });
                            }
                        });
                        $dbUI.ctElement({ p: this, e: "i", c: ["dbUI-calendar"] });
                    }
                });
                currNode.removeChild(date);
                return select;
            }
        }
    }; $dbUI.initdatepicker();
    function updateCalendar(parent, dateObj) {
        switch (dateObj.format) {
            case "date":
                createheader(parent, dateObj);
                createbody(parent, dateObj);
                createfooter(parent, dateObj);
                break;
            case "datetime":
                createheader(parent, dateObj);
                createbody(parent, dateObj);
                createdatetime(parent, dateObj);
                createfooter(parent, dateObj);
                break;
        }
    }
    function updateWatch(parent, dateObj) {
        var time = parent.getElementsByClassName("date-time");
        if (time.length > 0) {
            var hh = time[0].getElementsByClassName("hh")[0];
            var mm = time[0].getElementsByClassName("mm")[0];
            var ss = time[0].getElementsByClassName("ss")[0];
            hh.innerText = dateObj.hour;
            mm.innerText = dateObj.minute;
            ss.innerText = dateObj.second;
        }
        switch (dateObj.format) {
            case "time":
                selecttimeblock(parent, dateObj);
                break;
        }
    }
    function createheader(parent, dateObj) {
        var onyearicon = function () {
            switch (this.className) {
                case "prev-y":
                    --dateObj.year;
                    break;
                case "next-y":
                    ++dateObj.year;
                    break;
            }
        };
        var onmonthicon = function () {
            switch (this.className) {
                case "prev-m":
                    dateObj.month = dateObj.month == 1 ? 12 : dateObj.month - 1;
                    if (dateObj.month == 12) { --dateObj.year; }
                    break;
                case "next-m":
                    dateObj.month = dateObj.month == 12 ? 1 : dateObj.month + 1;
                    if (dateObj.month == 1) { ++dateObj.year; }
                    break;
            }
        };
        var onyearhead = function () {
            var yearblock = this.offsetParent.parentNode.getElementsByClassName("calendaryear");
            var monthblock = this.offsetParent.parentNode.getElementsByClassName("calendarmonth");
            yearblock[0].setAttribute("hidden", "hidden");
            monthblock[0].setAttribute("hidden", "hidden");
            yearblock[0].removeAttribute("hidden");
        };
        var onmonthhead = function () {
            var yearblock = this.offsetParent.parentNode.getElementsByClassName("calendaryear");
            var monthblock = this.offsetParent.parentNode.getElementsByClassName("calendarmonth");
            yearblock[0].setAttribute("hidden", "hidden");
            monthblock[0].setAttribute("hidden", "hidden");
            monthblock[0].removeAttribute("hidden");
        };
        $dbUI.ctElement({
            p: parent, e: "div", c: ["date-header"], ape: function () {
                $dbUI.ctElement({ p: this, e: "i", c: ["prev-y"], event: [{ key: "click", action: onyearicon }] });
                $dbUI.ctElement({ p: this, e: "i", c: ["prev-m"], event: [{ key: "click", action: onmonthicon }] });
                $dbUI.ctElement({
                    p: this, e: "div", c: ["yymm"], ape: function () {
                        $dbUI.ctElement({ p: this, e: "div", c: ["yy"], t: dateObj.year + "年", event: [{ key: "click", action: onyearhead }] });
                        $dbUI.ctElement({ p: this, e: "div", c: ["mm"], t: dateObj.month + "月", event: [{ key: "click", action: onmonthhead }] });
                    }
                });
                $dbUI.ctElement({ p: this, e: "i", c: ["next-m"], event: [{ key: "click", action: onmonthicon }] });
                $dbUI.ctElement({ p: this, e: "i", c: ["next-y"], event: [{ key: "click", action: onyearicon }] });
            }
        });
    }
    function createbody(parent, dateObj) {
        $dbUI.ctElement({
            p: parent, e: "div", c: ["date-body"], ape: function () {
                calendarhead(this, dateObj);
                calendarbody(this, dateObj);
                calendaryear(this, dateObj);
                calendarmonth(this, dateObj);
            }
        });
    }
    function selecttimeblock(parent, dateObj) {
        var classs = [];
        classs.push("select");
        if (parent.getElementsByClassName("select").length > 0) {
            classs.push("time");
            parent.innerHTML = "";
        }
        $dbUI.ctElement({
            p: parent, e: "div", c: classs, ape: function () {
                var curtime = {
                    hour: 0,
                    minute: 0,
                    second: 0
                };

                var hourdom = null;
                var minutedom = null;
                var seconddom = null;

                var onhour = function () {
                    hourdom.innerText = curtime.hour.toString().PadLeft(2);
                };
                var onminute = function () {
                    minutedom.innerText = curtime.minute.toString().PadLeft(2);
                };
                var onsecond = function () {
                    seconddom.innerText = curtime.second.toString().PadLeft(2);
                };
                $dbUI.defineProp(curtime, "hour", null, onhour);
                $dbUI.defineProp(curtime, "minute", null, onminute);
                $dbUI.defineProp(curtime, "second", null, onsecond);

                var tid = null;
                var onprev = function () {
                    var obj = this.nextSibling;
                    var per = this.parentNode;
                    switch (per.className) {
                        case "s-hh":
                            curtime.hour = curtime.hour - 1 < 0 ? 23 : curtime.hour - 1;
                            break;
                        case "s-mm":
                            curtime.minute = curtime.minute - 1 < 0 ? 59 : curtime.minute - 1;
                            if (curtime.minute == 59)
                                curtime.hour = curtime.hour - 1 < 0 ? 23 : curtime.hour - 1;
                            break;
                        case "s-ss":
                            curtime.second = curtime.second - 1 < 0 ? 59 : curtime.second - 1;
                            if (curtime.second == 59) {
                                curtime.minute = curtime.minute - 1 < 0 ? 59 : curtime.minute - 1;
                                if (curtime.minute == 59)
                                    curtime.hour = curtime.hour - 1 < 0 ? 23 : curtime.hour - 1;
                            }
                            break;
                    }
                    tid = setInterval(function () {
                        switch (per.className) {
                            case "s-hh":
                                curtime.hour = curtime.hour - 1 < 0 ? 23 : curtime.hour - 1;
                                break;
                            case "s-mm":
                                curtime.minute = curtime.minute - 1 < 0 ? 59 : curtime.minute - 1;
                                if (curtime.minute == 59)
                                    curtime.hour = curtime.hour - 1 < 0 ? 23 : curtime.hour - 1;
                                break;
                            case "s-ss":
                                curtime.second = curtime.second - 1 < 0 ? 59 : curtime.second - 1;
                                if (curtime.second == 59) {
                                    curtime.minute = curtime.minute - 1 < 0 ? 59 : curtime.minute - 1;
                                    if (curtime.minute == 59)
                                        curtime.hour = curtime.hour - 1 < 0 ? 23 : curtime.hour - 1;
                                }
                                break;
                        }
                    }, 150);
                };
                var onnext = function () {
                    var obj = this.previousSibling;
                    var per = this.parentNode;
                    switch (per.className) {
                        case "s-hh":
                            curtime.hour = curtime.hour + 1 > 23 ? 0 : curtime.hour + 1;
                            break;
                        case "s-mm":
                            curtime.minute = curtime.minute + 1 > 59 ? 0 : curtime.minute + 1;
                            if (curtime.minute == 0)
                                curtime.hour = curtime.hour + 1 > 23 ? 0 : curtime.hour + 1;
                            break;
                        case "s-ss":
                            curtime.second = curtime.second + 1 > 59 ? 0 : curtime.second + 1;
                            if (curtime.second == 0) {
                                curtime.minute = curtime.minute + 1 > 59 ? 0 : curtime.minute + 1;
                                if (curtime.minute == 0)
                                    curtime.hour = curtime.hour + 1 > 23 ? 0 : curtime.hour + 1;
                            }
                            break;
                    }
                    tid = setInterval(function () {
                        switch (per.className) {
                            case "s-hh":
                                curtime.hour = curtime.hour + 1 > 23 ? 0 : curtime.hour + 1;
                                break;
                            case "s-mm":
                                curtime.minute = curtime.minute + 1 > 59 ? 0 : curtime.minute + 1;
                                if (curtime.minute == 0)
                                    curtime.hour = curtime.hour + 1 > 23 ? 0 : curtime.hour + 1;
                                break;
                            case "s-ss":
                                curtime.second = curtime.second + 1 > 59 ? 0 : curtime.second + 1;
                                if (curtime.second == 0) {
                                    curtime.minute = curtime.minute + 1 > 59 ? 0 : curtime.minute + 1;
                                    if (curtime.minute == 0)
                                        curtime.hour = curtime.hour + 1 > 23 ? 0 : curtime.hour + 1;
                                }
                                break;
                        }
                    }, 150);
                };
                parent.addEventListener("mouseup", function () {
                    clearInterval(tid);
                });

                $dbUI.ctElement({
                    p: this, e: "div", c: ["s-hh"], ape: function () {
                        $dbUI.ctElement({ p: this, e: "i", c: ["t-prev"], event: [{ key: "mousedown", action: onprev }] });
                        hourdom = $dbUI.ctElement({ p: this, e: "div", c: ["t-cur"], t: dateObj.hour });
                        $dbUI.ctElement({ p: this, e: "i", c: ["t-next"], event: [{ key: "mousedown", action: onnext }] });
                    }
                });
                $dbUI.ctElement({
                    p: this, e: "div", c: ["s-mm"], ape: function () {
                        $dbUI.ctElement({ p: this, e: "i", c: ["t-prev"], event: [{ key: "mousedown", action: onprev }] });
                        minutedom = $dbUI.ctElement({ p: this, e: "div", c: ["t-cur"], t: dateObj.minute });
                        $dbUI.ctElement({ p: this, e: "i", c: ["t-next"], event: [{ key: "mousedown", action: onnext }] });
                    }
                });
                $dbUI.ctElement({
                    p: this, e: "div", c: ["s-ss"], ape: function () {
                        $dbUI.ctElement({ p: this, e: "i", c: ["t-prev"], event: [{ key: "mousedown", action: onprev }] });
                        seconddom = $dbUI.ctElement({ p: this, e: "div", c: ["t-cur"], t: dateObj.second });
                        $dbUI.ctElement({ p: this, e: "i", c: ["t-next"], event: [{ key: "mousedown", action: onnext }] });
                    }
                });

                curtime.hour = dateObj.hour;
                curtime.minute = dateObj.minute;
                curtime.second = dateObj.second;

                var par = this;
                var suretime = function () {
                    if (par.classList.contains("time")) {
                        par.parentNode.previousSibling.value = [curtime.hour.toString().PadLeft(2), curtime.minute.toString().PadLeft(2), curtime.second.toString().PadLeft(2)].join(":");
                        par.parentNode.classList.remove("show");
                    }
                    dateObj.hour = curtime.hour;
                    dateObj.minute = curtime.minute;
                    dateObj.second = curtime.second;
                    par.remove();
                };
                $dbUI.ctElement({ p: this, e: "div", c: ["s-btn"], t: "确认", event: [{ key: "click", action: suretime }] });
            }
        });
    }
    function createdatetime(parent, dateObj) {
        var selecttime = function () {
            selecttimeblock(this.parentNode, dateObj);
        };
        $dbUI.ctElement({
            p: parent, e: "div", c: ["date-time"], ape: function () {
                $dbUI.ctElement({ p: this, e: "div", c: ["hh"], t: "19" });
                $dbUI.ctElement({ p: this, e: "div", c: ["mm"], t: "44" });
                $dbUI.ctElement({ p: this, e: "div", c: ["ss"], t: "00" });
                $dbUI.ctElement({ p: this, e: "div", c: ["btn"], t: "选择时间", event: [{ key: "click", action: selecttime }] });

            }
        });
    }
    function createfooter(parent, dateObj) {
        let onclear = function () {
            parent.previousSibling.value = "";
            parent.classList.remove("show");
            parent.previousSibling.Touch("change");
        };
        let ontoday = function () {
            let cur = new Date();
            let year = cur.getFullYear();
            let month = cur.getMonth() + 1;
            let day = cur.getDate();
            let hour = cur.getHours();
            let minute = cur.getMinutes();
            let second = cur.getSeconds();
            let format = [year.toString().PadLeft(4), month.toString().PadLeft(2), day.toString().PadLeft(2)].join("-");
            if (dateObj.format == "datetime")
                format += " " + [hour.toString().PadLeft(2), minute.toString().PadLeft(2), second.toString().PadLeft(2)].join(":");
            parent.previousSibling.value = format;
            parent.classList.remove("show");
            parent.previousSibling.Touch("change");
        };
        $dbUI.ctElement({
            p: parent, e: "div", c: ["date-footer"], ape: function () {
                $dbUI.ctElement({ p: this, e: "button", t: "清空", attr: [{ key: "type", value: "button" }], event: [{ key: "click", action: onclear }] });
                $dbUI.ctElement({ p: this, e: "button", t: "今天", attr: [{ key: "type", value: "button" }], event: [{ key: "click", action: ontoday }] });
            }
        });
    }
    function calendarhead(parent, dateObj) {
        $dbUI.ctElement({
            p: parent, e: "table", c: ["calendarhead"], ape: function () {
                $dbUI.ctElement({
                    p: this, e: "thead", ape: function () {
                        $dbUI.ctElement({
                            p: this, e: "tr", ape: function () {
                                $dbUI.ctElement({ p: this, e: "th", t: "一" });
                                $dbUI.ctElement({ p: this, e: "th", t: "二" });
                                $dbUI.ctElement({ p: this, e: "th", t: "三" });
                                $dbUI.ctElement({ p: this, e: "th", t: "四" });
                                $dbUI.ctElement({ p: this, e: "th", t: "五" });
                                $dbUI.ctElement({ p: this, e: "th", t: "六" });
                                $dbUI.ctElement({ p: this, e: "th", t: "日" });
                            }
                        });
                    }
                });
            }
        });
    }
    function calendarbody(parent, dateObj) {
        var dateStr = dateObj.year + "-" + dateObj.month;
        var date = new Date(dateStr);
        var weekA = [7, 1, 2, 3, 4, 5, 6];
        var onday = function () {
            var year = dateObj.year;
            var month = dateObj.month;
            var day = this.innerText;
            switch (this.className) {
                case "prev":
                    month = month == 1 ? 12 : month - 1;
                    if (month == 12) { --year; }
                    break;
                case "next":
                    month = month == 12 ? 1 : month + 1;
                    if (month == 1) { ++year; }
                    break;
            }
            var format = [year.toString().PadLeft(4), month.toString().PadLeft(2), day.toString().PadLeft(2)].join("-");
            if (dateObj.format == "datetime")
                format += " " + [dateObj.hour.toString().PadLeft(2), dateObj.minute.toString().PadLeft(2), dateObj.second.toString().PadLeft(2)].join(":");
            dateObj.date = new Date(format);
            this.offsetParent.parentNode.parentNode.previousSibling.value = format;
            this.offsetParent.parentNode.parentNode.classList.remove("show");
            this.offsetParent.parentNode.parentNode.previousSibling.Touch("change");
        };
        $dbUI.ctElement({
            p: parent, e: "table", c: ["calendarbody"], ape: function () {
                $dbUI.ctElement({
                    p: this, e: "tbody", ape: function () {
                        var count = 0;
                        for (var a = 0; a < 6; a++) {
                            var row = 7;
                            $dbUI.ctElement({
                                p: this, e: "tr", ape: function () {
                                    if (a == 0) {
                                        for (var i = 1; i < weekA[date.getDay()]; i++) {
                                            var temp = date.AddDays(i - weekA[date.getDay()]);
                                            $dbUI.ctElement({
                                                p: this
                                                , e: "td"
                                                , c: temp.getMonth() == date.getMonth() ? null : ["prev"]
                                                , t: temp.getDate()
                                                , event: [{ key: "click", action: onday }]
                                            });
                                            row--;
                                        }
                                    }
                                    while (row != 0) {
                                        var temp = date.AddDays(count);
                                        var dateEq = temp.getFullYear() == dateObj.date.getFullYear()
                                            && temp.getMonth() == dateObj.date.getMonth()
                                            && temp.getDate() == dateObj.date.getDate() ? true : false;
                                        $dbUI.ctElement({
                                            p: this
                                            , e: "td"
                                            , c: temp.getMonth() == date.getMonth() ? dateEq ? ["this"] : null : ["next"]
                                            , t: temp.getDate()
                                            , event: [{ key: "click", action: onday }]
                                        });
                                        ++count;
                                        --row;
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    }
    function calendaryear(parent, dateObj) {
        var onyearbody = function () {
            var year = this.innerText.substring(0, this.innerText.length - 1);
            dateObj.year = Number(year);
        };
        $dbUI.ctElement({
            p: parent, e: "table", c: ["calendaryear"], attr: [{ key: "hidden", value: "hidden" }], ape: function () {
                var year = dateObj.year.toString();
                var yearhead = year.substring(0, year.length - 1);
                var foo = 0;
                while (foo < 10) {
                    $dbUI.ctElement({
                        p: this, e: "tr", ape: function () {
                            for (var i = 0; i < 4; i++, foo++) {
                                if (!(foo < 10)) { break; }
                                $dbUI.ctElement({
                                    p: this,
                                    e: "td",
                                    c: Number(yearhead + foo) == dateObj.year ? ["this"] : null,
                                    t: (yearhead + foo) + "年",
                                    event: [{ key: "click", action: onyearbody }]
                                });
                            }
                        }
                    });
                }
            }
        });
    }
    function calendarmonth(parent, dateObj) {
        var onmonthbody = function () {
            var month = this.innerText.substring(0, this.innerText.length - 1);
            dateObj.month = Number(month);
        };
        $dbUI.ctElement({
            p: parent, e: "table", c: ["calendarmonth"], attr: [{ key: "hidden", value: "hidden" }], ape: function () {
                var foo = 0;
                while (foo < 12) {
                    $dbUI.ctElement({
                        p: this, e: "tr", ape: function () {
                            for (var i = 0; i < 4; i++, foo++) {
                                $dbUI.ctElement({
                                    p: this,
                                    e: "td",
                                    c: Number(foo + 1) == dateObj.month ? ["this"] : null,
                                    t: (foo + 1) + "月",
                                    event: [{ key: "click", action: onmonthbody }]
                                });
                            }
                        }
                    });
                }
            }
        });
    }
    document.body.Bind("click", function () {
        var currobj = event.target;
        var dbUI_dates = document.getElementsByClassName("dbUI-date");
        Array.from(dbUI_dates).forEach(e => {
            var picker = e.getElementsByClassName("dbUI-datepicker");
            var except = Array.from(document.getElementsByTagName("*"));
            var date = Array.from(e.getElementsByTagName("*"));
            var point = except.filter(item => !date.includes(item));
            if (picker[0].classList.contains("show") && point.includes(currobj) && e != currobj) {
                picker[0].classList.remove("show");
            }
        });
    });
}($dbUI));

(function ($dbUI) {
    let inputs = document.getElementsByClassName('dbUI-input');
    let eleArr = inputs;
    for (let t1 = eleArr.length - 1; t1 >= 0; t1--) {


    }
}($dbUI));

//输入框组件渲染
(function ($dbUI) {
    let inputs = document.getElementsByClassName('dbUI-input');
    let eleArr = inputs;
    let autoEvent = {};
    for (let t1 = eleArr.length - 1; t1 >= 0; t1--) {
        let arr = eleArr[t1];
        let tag = arr.tagName;
        if ("INPUT" != tag) continue;
        let currNode = arr.parentNode;

        let attrArr = arr.attributes;
        let temp = [];
        for (let t2 = 0, len = attrArr.length; t2 < len; t2++) {
            const arr1 = attrArr[t2];
            let ab = { key: arr1.localName, value: arr1.value };
            temp.push(ab);
        }
        if (!arr.type || ("text" === arr.type)) {
            $dbUI.ctElement({
                pa: arr, e: "div", c: ["dbUI-input"], ape: function () {
                    let childText = [];
                    let put = $dbUI.ctElement({
                        p: this, e: "input", attr: temp, event: [
                            {
                                key: "input", action: function () {
                                    let next = this.Next();
                                    if (next.classList.contains("show")) {
                                        next.classList.remove("show");
                                    }
                                    for (let t3 = 0; t3 < childText.length; t3++) {
                                        const e = childText[t3];
                                        if (this.value.length > 0 && e.indexOf(this.value) > -1) {
                                            $dbUI.ctElement({
                                                p: next, e: "dd", t: e, event: [{
                                                    key: "click", action: function () {
                                                        put.value = this.innerText;
                                                    }
                                                }]
                                            });
                                        }
                                    }
                                    if (next.innerHTML.length > 0) {
                                        if (!next.classList.contains("show")) {
                                            next.classList.add("show");
                                        }
                                    }
                                }
                            }
                        ]
                    });
                    if (put.classList.contains('dbUI-input'))
                        put.classList.remove('dbUI-input');
                    let attrArr = Array.from(arr.attributes);
                    let autocomplete = attrArr.filter(x => x.localName == "autocomplete");
                    if (autocomplete.length > 0) {
                        let Auto = document.getElementById(autocomplete[0].value);
                        if (Auto) {
                            $dbUI.ctElement({
                                p: this, e: "dl", c: ["dbUI-input-dl"], ape: function () {
                                    let url = Auto.getAttribute("url");
                                    if (url) {
                                        $dbUI.get(url, function (res) {
                                            let data = JSON.parse(res);
                                            for (let fo1 = 0, len = data.length; fo1 < len; fo1++) {
                                                const child = data[fo1];
                                                childText.push(child);
                                            }
                                        });
                                    }
                                    else {
                                        let childs = Auto.getElementsByTagName("child");
                                        for (let fo1 = 0, len = childs.length; fo1 < len; fo1++) {
                                            const child = childs[fo1];
                                            childText.push(child.innerText);
                                        }
                                    }
                                }
                            });
                            Auto.remove();
                        }
                    }
                    autoEvent[arr.id] = function (data) {
                        childText = data;
                    }
                }
            });

        } else if ("password" === arr.type) {
            $dbUI.ctElement({
                pa: arr, e: "div", c: ["dbUI-password"], ape: function () {
                    let put = $dbUI.ctElement({
                        p: this, e: "input", attr: temp, event: [{
                            key: "keyup", action: function () {
                                this.value = this.value.replace(/[\u4e00-\u9fa5]/ig, '');
                            }
                        }]
                    });
                    $dbUI.ctElement({
                        p: this, e: "i", c: ["dbUI-password-i"], event: [{
                            key: "click", action: function () {
                                var prev = this.Prev();
                                if (this.classList.contains('show')) {
                                    prev.setAttribute('type', 'password');
                                    this.classList.remove('show');
                                } else {
                                    prev.setAttribute('type', 'tel');
                                    this.classList.add('show');
                                }
                            }
                        }]
                    })
                    if (put.classList.contains('dbUI-input'))
                        put.classList.remove('dbUI-input');
                }
            });
        }
        arr.remove();
    }
    document.addEventListener('click', function () {
        var currobj = event.target;
        var dbUI_inputs = document.getElementsByClassName('dbUI-input');
        Array.from(dbUI_inputs).forEach(e => {
            let dl = e.getElementsByClassName('dbUI-input-dl')[0];
            if (dl != null && e != currobj.parentNode) {
                if (dl.classList.contains("show"))
                    dl.classList.remove("show");
            }
        });
    });
    $dbUI.text = {};
    $dbUI.text.autoload = function (id, data) {
        autoEvent[id](data);
    };
}($dbUI));

//滑动条组件渲染
(function ($dbUI) {
    var dbUI_slides = document.getElementsByClassName('dbUI-slide');
    for (var i = dbUI_slides.length - 1; i >= 0; i--) {
        var slide = dbUI_slides[i];
        var tagName = slide.tagName;
        if (tagName == 'DIV') {
            var attr = slide.getAttribute('init');
            var schedule = slide.children[0];
            var grip = slide.children[0].children[0];
            schedule.style = "width:" + (attr == null ? 0 : attr) + "%";
            var mousedown = function (e) {
                var nschedule = e.target.parentNode;
                var nslide = e.target.parentNode.parentNode;
                var ntooltip = e.target.getAttribute('tooltip-for');
                var mousemove = function (e) {
                    var start = nslide.getBoundingClientRect().x;
                    var compute = e.pageX - (start + document.documentElement.scrollLeft);
                    if (compute <= 0) {
                        compute = 0;
                    }
                    else if (compute >= nslide.offsetWidth) {
                        compute = nslide.offsetWidth;
                    }
                    compute = parseInt((compute / nslide.offsetWidth) * 100);
                    nschedule.style = "width:" + compute + "%";
                    if (ntooltip != "") {
                        var tooltipcontents = document.getElementsByTagName('*');
                        Array.from(tooltipcontents).forEach(e => {
                            if (e.getAttribute("tooltip-content") == ntooltip) {
                                e.innerText = compute;
                            }
                        });
                    }
                };
                var obj = this;
                var mouseup = function (e) {
                    obj.classList.remove('this');
                    document.removeEventListener('mousemove', mousemove);
                    document.removeEventListener('mouseup', mouseup);
                };
                this.classList.add('this');
                document.addEventListener('mousemove', mousemove);
                document.addEventListener('mouseup', mouseup);
            };
            grip.addEventListener('mousedown', mousedown);
        }
    }
}($dbUI));

//tooltip组件渲染
(function ($dbUI) {
    var atooltip = 0;//tooltip索引
    var stooltips = document.getElementsByTagName('*');
    for (var i = 0; i < stooltips.length; i++) {
        if (stooltips[i].getAttribute('tooltip') != null) {
            var content = null;
            if (stooltips[i].getAttribute('tooltip-for') != null) {
                Array.from(stooltips).forEach(e => {
                    if (e.getAttribute('tooltip-content') == stooltips[i].getAttribute('tooltip-for')) {
                        content = e;
                    }
                });
            }
            createtooltip(stooltips[i], content);
        }
    }
    function createtooltip(obj, content) {
        if (obj.getAttribute("db-tooltip-id") != null) { return; }

        obj.setAttribute("db-tooltip-id", "db-tooltip-" + atooltip);
        var tooltip = document.createElement('div');
        tooltip.id = "db-tooltip-" + atooltip;
        tooltip.classList.add('dbUI-tooltip-bottom');
        tooltip.innerText = obj.getAttribute('tooltip');
        document.body.appendChild(tooltip);
        if (obj.getAttribute('tooltip-for') != null) {
            var tooltipfors = document.getElementsByTagName('*');
            Array.from(tooltipfors).forEach(e => {
                if (obj.getAttribute('tooltip-for') == e.getAttribute('tooltip-content') && e.innerText != "") {
                    document.getElementById(obj.getAttribute('db-tooltip-id')).innerText = e.innerText;
                }
            });
        }
        tooltipPosCompute(tooltip, obj);
        tooltip.style.visibility = "hidden";
        var mouseenter = function (e) {
            var ntooltip = document.getElementById(this.getAttribute("db-tooltip-id"));
            tooltipPosCompute(ntooltip, this);
            ntooltip.style.visibility = "visible";
        };
        var mouseleave = function (e) {
            var ntooltip = document.getElementById(this.getAttribute("db-tooltip-id"));
            ntooltip.style.visibility = "hidden";
        };
        var textchange = function (e) {
            var ncontent = this.getAttribute('tooltip-content');
            var ntooltipfors = document.getElementsByTagName('*');
            Array.from(ntooltipfors).forEach(e => {
                if (e.getAttribute("tooltip-for") == ncontent) {
                    document.getElementById(e.getAttribute('db-tooltip-id')).innerText = this.innerText;
                }
            });
        };
        obj.addEventListener("mouseenter", mouseenter);
        obj.addEventListener("mouseleave", mouseleave);
        if (content != null)
            content.addEventListener("DOMSubtreeModified", textchange);
        Object.defineProperty(obj.parentNode, 'style', {
            set: function (nv) {
                this.setAttribute('style', nv);
                var ntooltip = document.getElementById(this.children[0].getAttribute('db-tooltip-id'));
                tooltipPosCompute(ntooltip, this.children[0]);
            }
        });
        ++atooltip;
        function tooltipPosCompute(ntooltip, obj) {
            var top = obj.getBoundingClientRect().top;
            var left = obj.getBoundingClientRect().left;
            var w = (ntooltip.clientWidth / 2) - (obj.clientWidth / 2);
            ntooltip.style.top = (top - 40) + "px";
            ntooltip.style.left = (left - w) + "px";
        }
    }
}($dbUI));