(function ($dbUI) {
    //内部文件容器
    let continers = new Array();
    //发送的表单
    let SendFormData = undefined;
    //配置对象
    let _config = {
        //是否支持多文件
        multiple: undefined,
        //发送按钮
        send: undefined,
        //发送地址
        url: undefined,
        //嵌入外部文件流
        externalFile: undefined,
        //多通道回调done函数
        multipath: undefined,
        //是否同步发送
        async: undefined,
        //拖拽或者点击选择文件后回调此函数
        done: undefined,
        //发生错误时回调
        error: undefined,
        //发送成功后回调此函数
        success: undefined
    };

    //判断未定义或者为NULL
    function IsUnDefinedOrNull(value) {
        if (value === undefined) {
            return true;
        }
        else if (value === null) {
            return true;
        }
        return false;
    }

    //查看容器中是否存在同样的文件名的文件流
    function FileExists(file) {
        for (let index = 0; index < continers.length; index++)
            if (file.name == continers[index].name)
                return false;
        return true;
    }

    //初始化发送事件
    function InitSendEvent() {
        //必填push的按钮对象和push的地址
        if (!IsUnDefinedOrNull(_config.send) && !IsUnDefinedOrNull(_config.url)) {
            _config.send.addEventListener("click", SendEvent);
        }
    }

    //发送事件
    function SendEvent(event) {
        InitExternal();
        InitContainerForm();
        if (!CheckFormData()) return;
        PushRequest();
    }

    //外部嵌入文件流加入到表单中
    function InitExternal() {
        try {
            if (!IsUnDefinedOrNull(_config.externalFile) && _config.externalFile instanceof Function) {
                let externalFile = _config.externalFile();
                for (let index = 0; index < externalFile.length; index++) {
                    const element = externalFile[index];
                    if (element instanceof File)
                        SendFormData.append(element.name, element.file);
                    else SendFormData.append("external" + index, element);
                }
            }
        } catch {
            _config.error({ status: 0, msg: error });
        }
    }

    //拖拽容器加入到表单中
    function InitContainerForm() {
        try {
            if (!IsUnDefinedOrNull(continers) && continers.length > 0) {
                for (let index = 0; index < continers.length; index++) {
                    const element = continers[index];
                    SendFormData.append("drop" + index, element);
                }
            }
        } catch (error) {
            _config.error({ status: 0, msg: error });
        }
    }

    //检查游览器是否支持FormData
    function CheckFormData() {
        try {
            if (window.FormData) {
                if (IsUnDefinedOrNull(SendFormData)) {
                    SendFormData = new FormData();
                    return true;
                }
                else {
                    if (SendFormData.keys().length > 0) {
                        _config.error({ status: 0, msg: "没有可发送的文件!" });
                        return false;
                    }
                }
            }
            return true;
        } catch (error) {
            _config.error({ status: 0, msg: error });
        }
        return false;
    }

    //浅拷贝配置对象
    function CopyConfig(config) {
        for (const key in _config) {
            if (Object.hasOwnProperty.call(config, key)) {
                _config[key] = config[key];
            }
        }
    }

    //载入容器
    function PushContainers(obj) {
        if (!IsUnDefinedOrNull(_config.multiple)) {
            continers.push(obj);
        }
        else {
            continers[0] = obj;
        }
    }

    //推出请求
    function PushRequest() {
        var httpReq = new XMLHttpRequest();
        if (_config.async == null) _config.async = true;
        httpReq.open("post", _config.url, _config.async);
        httpReq.onreadystatechange = function () {
            if (httpReq.readyState == 4) {
                if (httpReq.status == 200) {
                    _config.success(JSON.stringify(eval('(' + httpReq.responseText + ')')));
                }
                else {
                    _config.error({
                        status: httpReq.status,
                        msg: httpReq.responseText
                    });
                }
            }
        }
        httpReq.send(SendFormData);
    }

    //初始化拖拽组件的事件
    function InitDropEvent(element) {
        element.addEventListener("click", function (e) {
            let inputFile = document.createElement('input');
            inputFile.setAttribute('type', 'file');
            inputFile.setAttribute("style", 'visibility:hidden;');
            if (_config.multiple)
                inputFile.setAttribute("multiple", 'multiple');
            inputFile.addEventListener("change", function (e) {
                for (let i = 0; i < this.files.length; i++) {
                    const file = this.files[i];
                    if (FileExists(file)) {
                        PushContainers(file);
                    }
                }
                if (continers.length > 0)
                    _config.done(continers);
                this.remove();
            }, false);
            document.body.appendChild(inputFile);
            inputFile.click();
        }, false);
        element.addEventListener("dragenter", function (e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);
        element.addEventListener("dragover", function (e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);
        element.addEventListener("dragleave", function (e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);
        element.addEventListener("drop", function (e) {
            e.preventDefault();
            e.stopPropagation();
            try {
                //传输的数据
                let Stream = e.dataTransfer;
                //接收的文件数量
                let DealFileCount = 0;
                //数据中所有文件的数量
                let FilesLength = Stream.files.length;
                //数据中的项目
                let Items = Stream.items;
                //确认接收完成
                function CheckDropFinish() {
                    if (DealFileCount === FilesLength - 1) {
                        getDropFileCallBack(continers);
                    }
                    DealFileCount++;
                }
                //WebKit内核游览器
                if (Items !== undefined) {
                    for (let i = 0; i < Items.length; i++) {
                        const item = Items[i];
                        if (item.kind === "file" && item.webkitGetAsEntry().isFile) {
                            let file = item.getAsFile();
                            if (FileExists(file)) PushContainers(file);
                            else _config.error({ status: 0, msg: "已存在该文件" + file.name });
                        }
                    }
                }
                //IE游览器
                else {
                    for (let i = 0; i < FilesLength; i++) {
                        const file = Items[i];
                        if (FileExists(file)) {
                            if (file.type) {
                                PushContainers(file);
                                CheckDropFinish();
                            } else {
                                try {
                                    var fileReader = new FileReader();
                                    //写入数据地址
                                    fileReader.readAsDataURL(file.slice(0, 3));
                                    //监听读取
                                    fileReader.addEventListener('load', function (e) {
                                        PushContainers(file);
                                        CheckDropFinish();
                                    }, false);
                                    //监听读取失败
                                    fileReader.addEventListener('error', function (error) {
                                        _config.error({ status: 0, msg: error });
                                        CheckDropFinish();
                                    }, false);
                                } catch (error) {
                                    _config.error({ status: 0, msg: error });
                                    CheckDropFinish();
                                }
                            }
                        }
                        else _config.error({ status: 0, msg: "已存在该文件" + file.name });
                    }
                }
            } catch (error) {
                _config.error({ status: 0, msg: error });
            }
            _config.done(continers);
        }, false);
    }

    var _dropComponent = function (element, config) {
        if (!CheckFormData()) return;
        CopyConfig(config);
        InitDropEvent(element);
        InitSendEvent();
    };

    $dbUI.drop = _dropComponent;
}($dbUI));