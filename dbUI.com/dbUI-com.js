(function (win) {
    win.$dbUI = {};

    /**
     * @name: 创建元素
     * @param {*} p     父级对象元素尾添加
     * @param {*} pa    父级对象元素前添加
     * @param {*} e     例:'div'
     * @param {*} c     class 例:['dbUI']
     * @param {*} t     innerText 
     * @param {*} h     innerHtml
     * @param {*} event 绑定事件 例:[{key:'click',action:function()}]
     * @param {*} attr  添加属性 例:[{key:'id',value:'test'}]
     * @param {*} ape   回调函数 this指向创建的元素
     * @returns         创建的元素
     */
    $dbUI.ctElement = function (param) {
        var ele = null;
        if (param.e != null && param.e != "") {
            var ele = document.createElement(param.e);
        }
        if (param.c != null && param.c != "" && Array.isArray(param.c) && ele != null) {
            param.c.forEach(obj => { ele.classList.add(obj); });
        }
        if (param.t != null && param.t != "" && ele != null) {
            ele.innerText = param.t;
        }
        if (param.h != null && param.h != "" && ele != null) {
            ele.innerText = param.h;
        }
        if (param.event != null && Array.isArray(param.event) && ele != null) {
            param.event.forEach(obj => { ele.Bind(obj.key, obj.action, obj.option); });
        }
        if (param.attr != null && Array.isArray(param.attr) && ele != null) {
            param.attr.forEach(obj => { ele.setAttribute(obj.key, obj.value); });
        }
        if (param.p != null && param.p != "" && ele != null) {
            param.p.appendChild(ele);
        }
        if (param.pa != null && param.pa != "" && ele != null) {
            param.pa.parentNode.insertBefore(ele, param.pa);
        }
        if (param.ape != null && param.ape != "" && ele != null) {
            param.ape.call(ele);
        }
        return ele;
    }

    /**
     * @name: 对象劫持
     * @param {*} obj   劫持对象
     * @param {*} key   对象的键
     * @param {*} getfc 取值回调
     * @param {*} setfc 赋值回调
     */
    $dbUI.defineProp = function (obj, key, getfc, setfc) {
        var t = null;
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function () { if (getfc != null) { getfc.call(this); } return t; },
            set: function (nv) { t = nv; if (setfc != null) { setfc.call(this); } }
        });
    };

    /**
     * @name: 
     * @param {*} proxyObject 代理对象
     * @param {*} callback 
     * @param {*} penetrate
     * @param {*} prevObject
     * @param {*} prevkey
     * @param {*} original
     * @return {*}
     */
    $dbUI.defineProxy = function (proxyObject, callback, penetrate, prevObject, prevkey, original) {
        if (typeof (proxyObject) != "object") return;
        if (!original) original = proxyObject;
        if (penetrate)
            for (let ikey in proxyObject)
                if (proxyObject.hasOwnProperty(ikey))
                    if (typeof (proxyObject[ikey]) == "object")
                        $dbUI.defineProxy(proxyObject[ikey], callback, penetrate, proxyObject, ikey, original);
        let obj = new Proxy(proxyObject, {
            get(target, key) {
                return callback.get.call(original, target, key, prevkey);
            },
            set(target, key, value) {
                callback.set.call(original, target, key, value, prevkey);
            }
        });
        if (prevObject) {
            prevObject[prevkey] = obj;
        }
        else {
            proxyObject = obj;
        }
    }

    /**
     * @name: 位数不够前面补0
     * @param {*} num   补充位数
     * @return {*}      结果
     */
    String.prototype.PadLeft = function (num) {
        return (Array(num).join(0) + this).slice(-num);
    }

    /**
     * @name: 去除头尾空格
     * @param {*}
     * @return {*}
     */
    String.prototype.Trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }

    /**
     * @name: 去除头部空格
     * @param {*}
     * @return {*}
     */
    String.prototype.TrimLeft = function () {
        return this.replace(/(^\s*)/g, "");
    }

    /**
     * @name: 去除尾部空格
     * @param {*}
     * @return {*}
     */
    String.prototype.TrimRight = function () {
        return this.replace(/(\s*$)/g, "");
    }

    /**
     * @name: 绑定事件
     * @param {*} event     事件类型
     * @param {*} action    触发函数
     * @param {*} recursion 逐级递归
     * @return {*}
     */
    HTMLElement.prototype.Bind = function (event, action, recursion) {
        this.addEventListener(event, action, recursion || true);
        function delHandle() {
            this.removeEventListener(event, action, recursion || true);
        }
        return { del: delHandle };
    }

    /**
     * @name: 开关指定class
     * @param {*} key
     * @return {*}
     */
    HTMLElement.prototype.Toggle = function (key) {
        if (this.classList.contains(key)) {
            this.classList.remove(key);
        }
        else this.classList.add(key);
    }

    /**
     * @name: 关闭指定class
     * @param {*} key
     * @return {*}
     */
    HTMLElement.prototype.RemoveClass = function (key) {
        if (this.classList.contains(key)) {
            this.classList.remove(key);
        }
    }

    /**
     * @name: 添加指定class
     * @param {*} key
     * @return {*}
     */
    HTMLElement.prototype.AddClass = function (key) {
        if (!this.classList.contains(key)) {
            this.classList.add(key);
        }
    }

    /**
     * @name: 仿照C#Linq的Select
     * @param {*} func
     * @return {*}
     */
    Array.prototype.Select = function (func) {
        let result = [];
        this.forEach(arr => {
            result.push(func(arr));
        });
        return result;
    }

    /**
     * @name: 仿照C#Linq的OrderBy
     * @param {*} selector
     * @param {*} comparer
     * @return {*}
     */
    Array.prototype.OrderBy = function (field) {
        let first = this.slice(0, 1);
        if (first instanceof Object) {
            return this.sort(function (obj1, obj2) {
                let val1 = field(obj1);
                let val2 = field(obj2);
                if (val1 < val2) return -1;
                else if (val1 > val2) return 1;
                else return 0;
            });
        }
        else return this.sort();
    };

    /**
     * @name: 仿照C#Linq的OrderByDescending
     * @param {*} field
     * @return {*}
     */
    Array.prototype.OrderByDescending = function (field) {
        let first = this.slice(0, 1);
        if (first instanceof Object) {
            return this.sort(function (obj1, obj2) {
                let val1 = field(obj1);
                let val2 = field(obj2);
                if (val1 < val2) return 1;
                else if (val1 > val2) return -1;
                else return 0;
            });
        }
        else return this.sort();
    };

}(window))