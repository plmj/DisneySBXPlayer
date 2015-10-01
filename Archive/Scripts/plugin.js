var StorefrontScriptAPI, xmlHttp;

if (typeof window['ContentDirect'] == 'undefined') {
    ContentDirect = {};
    ContentDirect.UI = {};
}
ContentDirect.UI.Storefront = function (targetId, extensionType) {
    this._REQUEST_FORMAT = 'StorefrontHttpPostService.aspx?method=createInteraction&systemId={0}&interactionTypeCode={1}&country=USA&contextId=42&description={2}&contextData={3}';
    if (null == targetId)
        this._targetContainerId = "__StorefrontContainer";
    else
        this._targetContainerId = targetId;

    this._extension = null;
    if (null == extensionType)
        extensionType = "silverlight";

    this._extensionType = extensionType.toLowerCase();
    switch (this._extensionType) {
        case "spa": //, ios
            this._extension = new ContentDirect.UI.Storefront.IOS();
            break;
        case "sdlm": //, "silverlight download manager":
            this._extension = new ContentDirect.UI.Storefront.Silverlight.DLM();
            break;
        case "sps": //, "silverlight":
            this._extension = new ContentDirect.UI.Storefront.Silverlight.Player();
            break;
        case "spf": //, "flash":
            this._extension = new ContentDirect.UI.Storefront.Flash();
            break;
        case "spt": //, "Samsung TV":
            this._extension = new ContentDirect.UI.Storefront.Samsung();
            break;
        case "spl": //, "LG Netcast":        	
            this._extension = new ContentDirect.UI.Storefront.LG();
            break;
        case "spfs": //, "flashsilverlight":
            var browserInfo = $.cd.get_browserInfo();
            if (browserInfo.hasFlash)
                this._extension = new ContentDirect.UI.Storefront.Flash();
            else
                this._extension = new ContentDirect.UI.Storefront.Silverlight.Player();
            break;
        case "sph": //, "HTML5":
            this._extension = new ContentDirect.UI.Storefront.HTML();
            break;
        case "spsf": //, "silverlightflash":
        default:
            var browserInfo = $.cd.get_browserInfo();
            if (browserInfo.hasSilverlight)
                this._extension = new ContentDirect.UI.Storefront.Silverlight.Player();
            else
                this._extension = new ContentDirect.UI.Storefront.Flash();
            break;
    }

    this._contentContainer = null;
    this._rawInitParams = null;
    this._initParams = null;
    this._browserType = null;
    this._apiStub = null;
    this._isInitialized = false;
    this._delayInitialize = false;

    this._endSessionEventHandler = null;
    this._playingProductId = null;
    this._playingPricingId = null;
    this._contentProgress = 0;
    this._referenceId = null;
    this._trackCalled = false;
    this._readyCallBackFired = false;
    this._skipEventHandle = false;
    this._isLiveContent = false;
    this._pingTimer = null,
	this._captionsShowing = false,
    this._captionData = null;
    this.Tools = new ContentDirect.UI.Storefront.Tools();
    this._JS_BRIDGE = null;
};

ContentDirect.UI.Storefront.prototype = {
    get_captionsShowing: function () {
        return this._captionsShowing;
    },
    set_captionsShowing: function (value) {
        this._captionsShowing = value;
    },
    get_captionData: function () {
        return this._captionData;
    },
    set_captionData: function (value) {
        this._captionData = value;
    },
    get_extension: function () {
        return this._extension;
    },
	get_extensionType: function() {
		return this._extensionType;
	},
    set_delayInitialize: function (value) {
        this._delayInitialize = value;
    },
    get_isInitialized: function () {
        return this._isInitialized;
    },
    set_isInitialized: function (value) {
        this._isInitialized = value;
    },
    set_endSessionEventHandler: function (value) {
        this._endSessionEventHandler = value;
    },
    setSessionID: function (s) {
        this._initParams['SessionID'] = s;
    },
    get_isLiveContent: function () {
        return typeof this._initParams['IsLiveContent'] != 'undefined' ? this._initParams['IsLiveContent'].toBoolean() : false;
    },
    loadTrack: function (trackText) {
        trackText = $(trackText).filter("tt");
        var
        i = 0,
        container = trackText.children("div").eq(0),
        lines = container.find("p"),
        styleNode = trackText.find("#" + container.attr("style")),
        styles,
        begin,
        end,
        text,
        entries = { text: [], times: [] };


        if (styleNode.length) {
            var attributes = styleNode.removeAttr("id").get(0).attributes;
            if (attributes.length) {
                styles = {};
                for (i = 0; i < attributes.length; i++) {
                    styles[attributes[i].name.split(":")[1]] = attributes[i].value;
                }
            }
        }

        for (i = 0; i < lines.length; i++) {
            var style;
            var _temp_times = {
                start: null,
                stop: null,
                style: null
            };
            if (lines.eq(i).attr("begin")) _temp_times.start = mejs.Utility.convertSMPTEtoSeconds(lines.eq(i).attr("begin"));
            if (!_temp_times.start && lines.eq(i - 1).attr("end")) _temp_times.start = mejs.Utility.convertSMPTEtoSeconds(lines.eq(i - 1).attr("end"));
            if (lines.eq(i).attr("end")) _temp_times.stop = mejs.Utility.convertSMPTEtoSeconds(lines.eq(i).attr("end"));
            if (!_temp_times.stop && lines.eq(i + 1).attr("begin")) _temp_times.stop = mejs.Utility.convertSMPTEtoSeconds(lines.eq(i + 1).attr("begin"));
            if (styles) {
                style = "";
                for (var _style in styles) {
                    style += _style + ":" + styles[_style] + ";";
                }
            }
            if (style) _temp_times.style = style;
            if (_temp_times.start == 0) _temp_times.start = 0.200;
            entries.times.push(_temp_times);
            text = $.trim(lines.eq(i).html()).replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>");
            entries.text.push(text);
            if (entries.times.start == 0) entries.times.start = 2;
        }
        return entries;
    },
    loadSubtitle: function (fileString) {
        // parse the loaded file
        if (typeof fileString == "string" && (/<tt\s+xml/ig).exec(fileString)) {
            StorefrontInternalAPI.set_captionData(StorefrontInternalAPI.loadTrack(fileString));
            $.cd.log("DFXP FILE PARSED SUCCESSFULLY");
            // Show the closed captions button within the player
            $('#closedCaptionsButton').show();
        }        
    },
    initialize: function (skipEventHandle) {
        _skipEventHandle = skipEventHandle || false;
        if (!StorefrontInternalAPI._readyCallBackFired && typeof $ != 'undefined' && typeof $.cd != 'undefined' && null != $.cd.get_playerReady()) {
            $.cd.get_playerReady().call();
            StorefrontInternalAPI._readyCallBackFired = true;
        }

        if (!StorefrontInternalAPI._delayInitialize) {
            if (!StorefrontInternalAPI.checkRequirements()) {
                return;
            }
            if (!_skipEventHandle)
                StorefrontInternalAPI.setupWindowEvents();

            StorefrontInternalAPI._trackCalled = false;
            StorefrontInternalAPI.updateEmbedTag();

            StorefrontInternalAPI.start();
            StorefrontInternalAPI.set_isInitialized(true);
        }
        else
            StorefrontInternalAPI._delayInitialize = false;
    },
    setupWindowEvents: function () {
        if (null != navigator.vendor) {
            var oldonUnload = window.logoutSubscriber;
            var exitFunc = StorefrontInternalAPI.logoutSubscriber;
            if (typeof window.onbeforeunload != 'function') {
                window.onbeforeunload = exitFunc;
            } else {
                window.onbeforeunload = function (e) {
                    if (oldonUnload) {
                        oldonUnload();
                    }

                    exitFunc();
                }
            }
        }
        else {
            window.onbeforeunload = StorefrontInternalAPI.logoutSubscriber;
        }
        //Use this iframe to make all the http service calls (no response needed)
        var e = window.document.createElement('iframe');
        e.setAttribute('width', '0px');
        e.setAttribute('height', '0px');
        e.setAttribute('style', 'display:none;');
        e.setAttribute('id', '__CDHTTPPOST__');
        window.document.body.appendChild(e);
    },
    end: function () {
        this._contentContainer.innerHTML = "";
        this._contentContainer = null;
        this.set_isInitialized(false);
    },
    updateEmbedTag: function () {
        try {
            if (null != window.parent && window.parent.window['BuildEmbedMode'] !== undefined) {
                var parentPath = window.parent.location.href.split('PreviewPlayer.html')[0];
                var functionToRun = 'window.parent.BuildEmbedMode("' + this._rawInitParams + '","' + parentPath + '")';
                eval(functionToRun);
            };
        }
        catch (e) {
        }
    },
    checkRequirements: function () {
        //check if container exist with id '__StorefrontContainer'
        result = false;
        this._contentContainer = document.getElementById(this._targetContainerId);
        containerExist = (null != this._contentContainer);
        if (containerExist) {
            paramAttribute = null != this._contentContainer.attributes['initParams'] ? this._contentContainer.attributes['initParams'] : this._contentContainer.attributes['initparams'];
            paramsExist = (null != paramAttribute);
            var rawParams = '';
            if (!paramsExist)
                rawParams = this._extension.createParams();
            else
                rawParams = paramAttribute.value;

            this._rawInitParams = this.overrideSystemParams(rawParams);
            this._initParams = this.stripParams(this._rawInitParams, ',');
            result = true;
        }
        else
            result = false;

        return result;
    },
    getParam: function (key) {
        return this._initParams[key];
    },
    stripParams: function (params, separator) {
        strippedParams = String(params).split(separator);
        paramList = new Array();
        for (var i = 0; i < strippedParams.length; i++) {
            param = strippedParams[i];
            paramList[String(param).split('=')[0]] = String(param).split('=')[1];
        }

        return paramList;
    },
    getSystemParams: function () {
        var systemParams = '';
        if (null != this._rawInitParams)
            systemParams = this._rawInitParams;
        else
            systemParams = document.getElementById('SystemParams').value;

        return systemParams;
    },
    overrideSystemParams: function (initParams) {
        params = initParams;
        try {
            var targetWindow = null;
            try {
                targetWindow = window.parent;
            }
            catch (e) {
                targetWindow = window;
            }

            if (null != targetWindow && null != targetWindow.document.location.href) {
                var queryString = targetWindow.document.location.href.split('?')[1];
                if (queryString) {
                    var qsList = String(queryString).split('&');
                    var counter = 0;
                    while (counter < qsList.length) {
                        var p = qsList[counter];
                        if (p) {
                            var pId = p.split('=')[0];
                            var pValue = p.split('=')[1];
                            var pIdPosition = String(params.toLowerCase()).search(pId.toLowerCase());
                            if (pIdPosition == 0
                                || String(params).substring(pIdPosition - 1, pIdPosition) == ',') {
                                var searchString = String(params).substring(pIdPosition, params.length);
                                var seachEnd = searchString.search(',');

                                sourceString = String(searchString.substring(0, seachEnd));
                                if (String(sourceString.split('=')[0]).toLowerCase() == pId) {
                                    valueString = sourceString.split('=')[1];
                                    targetString = String(sourceString).replace(valueString, pValue);
                                    params = String(params).replace(sourceString, targetString);
                                }
                            }
                            else {
                                params = params + ',' + p;
                            }
                        }
                        counter++;
                    }
                }
            }
        }
        catch (e) {
            params = initParams;
        }
        return params;
    },
    getQuerystring: function (key, default_) {
        if (default_ == null) default_ = "";
        key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
        var qs = regex.exec(window.location.href);
        if (qs == null)
            return default_;
        else
            return qs[1];
    },
    start: function () {
        var isSyndicateMode = this.getQuerystring('DelayLoadPlayer', '0') == '1' || this.getParam('DelayLoadPlayer') == '1';
        var isSyndicateNoClickMode = this.getQuerystring('DelayLoadPlayer', '0') == '2' || this.getParam('DelayLoadPlayer') == '2';
        this._contentContainer.style.position = "relative";
        this._contentContainer.style.heighth = this.getWidth();
        this._contentContainer.style.height = this.getHeight();
        //$.cd.log("start height: " + this._contentContainer.style.height + " start width: " + this._contentContainer.style.height);
        if (!isSyndicateMode) {
            if (!isSyndicateNoClickMode) {                
                this._extension.embedApplication();
            }
            else
                this.startSyndicateNoClickMode();
        }
        else
            this.startSyndicateMode();
    },
    attachPingSessionEvent: function () {
    	this._pingTimer = setInterval(function (e) {
    		$.cd.log("PingSession called.");
    		ContentDirectAPI.knownRequest(ContentDirect.UI.Command.KnownRequest, "", ContentDirect.UI.Request.PingSession,    		
				function (data) {
					//do nothing since it's good
					$.cd.log("PingSession Successful!");
				},
				function (error) {
					StorefrontInternalAPI.get_extension().handleStopAction();
					StorefrontScriptAPI.EventOccured("Error", "Session", error.data.Message);
				}
			)
    	}, 300000);
    },
    removePingSessionEvent: function() {
    	clearInterval(this._pingTimer);
    	this._pingTimer = null;
    },
    attachUpdateContentProgressEvent: function (config) {
        var self = this;
        this._updateProgressTimer = setInterval(function (e) {
            var video = config.element;
            if (video && $(video).is(':visible') && video.currentTime > 0) {
                var mediaConsideredEnd = (video.currentTime / video.duration) > 0.95;
                var data = {
                    productId: config.productId,
                    pricingId: config.pricingId,
                    referenceId: config.referenceId,
                    progress: video.currentTime,
                    isCompleted: mediaConsideredEnd,
                    isStreamingCompleted: mediaConsideredEnd || config.stopped === true
                };

                contentdirect.updateContentProgress(data);
                $.cd.log("UpdateContentProgress called.");
            } else {
                self.removeUpdateContentProgressEvent();
            }
        }, 150000);
    },
    removeUpdateContentProgressEvent: function () {
        clearInterval(this._updateProgressTimer);
        this._updateProgressTimer = null;
    },
    startSyndicateNoClickMode: function () {
        var syndicatedImage = this.getParam('DelayLoadPlayerImageUrl') == undefined ? this.getQuerystring('DelayLoadPlayerImageUrl', null) : this.getParam('DelayLoadPlayerImageUrl');
        var baseImage = new Image();
        baseImage.src = syndicatedImage;

        baseImage.style.cursor = 'default';

        var baseE = window.document.createElement('div');
        if (String(this.getBrowserType()).toLowerCase().search('firefox') == -1) {
            baseE.style.width = "100%";
            baseE.style.height = "100%";
        }
        baseE.style.position = "absolute";
        baseE.style.width = "100%";
        baseE.style.textAlign = "center";
        baseE.style.left = "0px";
        baseE.style.top = "0px";
        baseE.style.zIndex = "0";
        baseE.appendChild(baseImage);
        StorefrontInternalAPI._contentContainer.appendChild(baseE);
    },
    startSyndicateMode: function () {
        var syndicatedImage = this.getParam('DelayLoadPlayerImageUrl') == undefined ? this.getQuerystring('DelayLoadPlayerImageUrl', null) : this.getParam('DelayLoadPlayerImageUrl');
        var baseImage = new Image();
        baseImage.src = syndicatedImage;
        //this was not working in chrome...updated onclick below
        //baseImage.onclick = StorefrontInternalAPI.loadStorefront();
        baseImage.style.cursor = 'hand';
        baseImage.style.cursor = 'pointer';

        var baseE = window.document.createElement('div');
        if (String(this.getBrowserType()).toLowerCase().search('firefox') == -1) {
            baseE.style.width = "100%";
            baseE.style.height = "100%";
        }
        baseE.style.width = "100%";
        baseE.style.textAlign = "center";
        baseE.style.position = "absolute";
        baseE.style.left = "0px";
        baseE.style.top = "0px";
        baseE.style.zIndex = "0";
        baseE.id = "syndicatedImage";
        baseE.appendChild(baseImage);
        StorefrontInternalAPI._contentContainer.appendChild(baseE);
        document.getElementById("syndicatedImage").onclick = function () { StorefrontInternalAPI._extension.embedApplication(); }
    },
    getHeight: function () {
        var result = StorefrontInternalAPI.getParam('Height');
        if (result == '0')
            result = '100%';
        else
            result = result + 'px';

        return result;
    },
    getWidth: function () {
        var result = StorefrontInternalAPI.getParam('Width');
        if (result == '0')
            result = '100%';
        else
            result = result + 'px';
        return result;
    },
    getRequestURL: function (code, description) {

        var domain = this._extension.getHostServerLocation();

        requestFormat = String(this._REQUEST_FORMAT).replace('{0}', this.getParam('SystemId'));
        requestFormat = String(requestFormat).replace('{1}', code);
        requestFormat = String(requestFormat).replace('{2}', description);
        requestFormat = String(requestFormat).replace('{3}', this.getBrowserType());

        return domain + requestFormat;
    },
    loadXMLDoc: function (url) {
        xmlHttp = null;
        StorefrontInternalAPI.createXMLHttp();
        if (xmlHttp != null) {
            xmlHttp.open('GET', url, true);
            xmlHttp.send(null);
        }
    },
    loadUrl: function (url) {
        window.document.getElementById('__CDHTTPPOST__').setAttribute('src', url);
    },
    createXMLHttp: function () {
        if (window.XMLHttpRequest) {
            xmlHttp = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) {
            try {
                xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');
            }
            catch (e) {
                try {
                    xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
                }
                catch (e) {
                    xmlHttp = null;
                }
            }
        }

        if (!xmlHttp && typeof XMLHttpRequest != 'undefined') {
            xmlHttp = new XMLHttpRequest();
        }
    },
    getBrowserType: function () {
        if (null != this.browserType) return this._browserType;

        var browser = "";
        if (navigator.userAgent.indexOf("MSIE ") > -1) {
            browser = this.getBrowserTypeEx(navigator.userAgent.indexOf("MSIE "), 5);
            browser = browser.replace(";", "");
        }
        else if (navigator.userAgent.indexOf("Firefox") > -1) {
            browser = this.getBrowserTypeEx(navigator.userAgent.indexOf("Firefox"), 0);
        }
        else if (navigator.userAgent.indexOf("Safari") > -1) {
            browser = this.getBrowserTypeEx(navigator.userAgent.indexOf("Safari"), 0);
        }
        else if (navigator.userAgent.indexOf("Opera") > -1) {
            browser = this.getBrowserTypeEx(navigator.userAgent.indexOf("Opera"), 0);
        }
        else if (navigator.userAgent.indexOf("Chrome") > -1) {
            browser = this.getBrowserTypeEx(navigator.userAgent.indexOf("Chrome"), 0);
        }
        else {
            browser = navigator.userAgent;
        }
        if (browser != null) {
            browser = browser.replace("/", " ");
        }

        this._browserType = browser;

        return browser;
    },
    getBrowserTypeEx: function (startIdx, offset) {
        if (navigator.userAgent.indexOf(" ", startIdx + offset) > -1) {
            return navigator.userAgent.substr(startIdx, navigator.userAgent.indexOf(" ", startIdx + offset) - startIdx);
        }
        else {
            return navigator.userAgent.substr(startIdx);
        }
    },
    getDRMChallenge: function () {
        try {
            var netobj = new ActiveXObject('DRM.GetLicense.1');
            var challenge = netobj.GetSystemInfo();
            return (challenge);
        }
        catch (e) {
            return e;
        }
    },
    installDRMLicense: function (license) {
        try {
            var netobj = new ActiveXObject('DRM.GetLicense.1');
            netobj.StoreLicense(license);
            return true;
        }
        catch (e) {
            return e;
        }
    },
    endSession: function (sessionId, runLogout, isCompleted, isStreamingComplete, showAlert, alertMessage, isPause) {
        if (_skipEventHandle)
            return;

        sessionId = sessionId || (StorefrontInternalAPI._initParams['SessionID'] || StorefrontInternalAPI._initParams['SessionId']);
        isCompleted = isCompleted || false;
        isStreamingComplete = isStreamingComplete || false;
        isPause = isPause || true;
        runLogout = runLogout || false;

        if (null != StorefrontInternalAPI._playingPricingId && "" != StorefrontInternalAPI._playingPricingId) {
            pId = StorefrontInternalAPI._playingProductId;
            ppId = StorefrontInternalAPI._playingPricingId;
            progress = StorefrontInternalAPI._contentProgress;
            referenceId = null != StorefrontInternalAPI._referenceId ? StorefrontInternalAPI._referenceId : "";
            systemId = StorefrontInternalAPI._initParams['SystemId'];

            if (null == sessionId || null == pId)
                return;
            var query = "systemId=" + systemId + "&sessionId=" + sessionId + "&pId=" + pId + "&ppId=" + ppId + "&runLogout=" + runLogout + "&progress=" + progress + "&referenceId=" + referenceId + "&isCompleted=" + isCompleted + "&isStreamingComplete=" + isStreamingComplete;
            var domain = this._extension.getHostServerLocation();
            var url = domain + 'StorefrontHttpPostService.aspx?method=endSession&' + query;

            StorefrontInternalAPI.loadUrl(url);
            if (!isPause)
                $('#' + StorefrontInternalAPI._targetContainerId).empty();

            if (null != showAlert && showAlert == true)
                $.cd.log(alertMessage);
        }
    },
    logoutSubscriber: function (e, sessionId) {
        if (StorefrontInternalAPI != null && StorefrontInternalAPI._endSessionEventHandler != null) {
            if (StorefrontInternalAPI._trackCalled == false) {
                StorefrontInternalAPI._endSessionEventHandler.call();
                StorefrontInternalAPI._trackCalled = true;
            }
        }
    },
    loadXMLDoc_stateChange: function () {
    },
    setPlayerReady: function (isReady) {
        this._extension.setPlayerReady(isReady);
    },
    raiseClientEvent: function (type, target, keyword) {
        //ActionType { Popup, Search, Play, Track, Stop, End ,Change, Purchase, Ad, Error}
        //ActionTarget { Product, Person, Category, Session, Authentication, Page, Ad, All }
        $.cd.log("RAISE CLIENT EVENT FROM PLAYER: " + type);
        switch (type) {
            case "Track":
                if (window["jQuery"] != undefined) {
                    if (keyword === Object)
                        keyword = jQuery.parseJSON(keyword);
                    this._extension.set_contentProgress(keyword);
                }
                break;
            case "Pause":
                break;
            case "Stop":
                this.endSession(null, false, false, true);
                if (keyword == "_TrackOnly")
                    return false;
                break;
            case "Error":
                StorefrontInternalAPI._playingProductId = StorefrontInternalAPI._initParams.ProductIdToPlay;
                StorefrontInternalAPI._playingPricingId = StorefrontInternalAPI._initParams.PricingPlanIdToPlay;
                break;
            case "End":
                this.endSession(null, false, true);
                break;
            case "Play":
                if (!StorefrontInternalAPI._endSessionEventHandler) {
                    StorefrontInternalAPI.set_endSessionEventHandler(
                        function () {
                            StorefrontInternalAPI.endSession(null, false);
                        }
				    );
                }
                break;
            default:
                break;
        };

        if (null != this.Tools)
            StorefrontScriptAPI.EventOccured(type, target, keyword);
    }
};

ContentDirect.UI.Storefront.Tools = function () { }
ContentDirect.UI.Storefront.Tools.prototype = {
    copyToClipboard: function (s) {
        if (window.clipboardData && clipboardData.setData) {
            clipboardData.setData("Text", s);
        }
        else {
            // You have to sign the code to enable this or allow the action in about:config by changing
            //user_pref("signed.applets.codebase_principal_support", true);
            try {
                netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            } catch (e) {
                $.cd.log("Permission to read file was denied.");
            }

            var clip = Components.classes['@mozilla.org/widget/clipboard;[[[[1]]]]'].createInstance(Components.interfaces.nsIClipboard);
            if (!clip) return;

            // create a transferable
            var trans = Components.classes['@mozilla.org/widget/transferable;[[[[1]]]]'].createInstance(Components.interfaces.nsITransferable);
            if (!trans) return;

            // specify the data we wish to handle. Plaintext in this case.
            trans.addDataFlavor('text/unicode');

            // To get the data from the transferable we need two new objects
            var str = new Object();
            var len = new Object();

            str = Components.classes["@mozilla.org/supports-string;[[[[1]]]]"].createInstance(Components.interfaces.nsISupportsString);

            var copytext = meintext;

            str.data = copytext;

            trans.setTransferData("text/unicode", str, copytext.length * [[[[2]]]]);

            var clipid = Components.interfaces.nsIClipboard;

            if (!clip) return false;

            clip.setData(trans, null, clipid.kGlobalClipboard);
        }
    },
    getValueFromDict: function (key, dictionary) {
        for (var v in dictionary) {
            if (dictionary[v].Key == key) {
                return dictionary[v].Value;
                break;
            }
        };
        return null;
    },
    loadResource: function loadResource(sScriptSrc, oCallback) {
        var oHead = document.getElementsByTagName('head')[0];
        var oScript = document.createElement('script');
        oScript.type = 'text/javascript';
        oScript.src = sScriptSrc;
        // most browsers
        oScript.onload = oCallback;
        // IE 6 & 7
        oScript.onreadystatechange = function () {
            if (this.readyState == 'complete' || this.readyState == 4 || this.readyState == "loaded") {
                oCallback();
            };
        }
        oHead.appendChild(oScript);
    }
}

ActionType = function () {
    this.Popup = 0;
};

//Client API
ContentDirect.UI.Storefront.ClientAPI = function () {
    this._isReady = false;
    this._pointer = null;
    this._actionCallBack = this._actionCallBack;
};
ContentDirect.UI.Storefront.ClientAPI.prototype = {
    get_IsReady: function () {
        return this._isReady;
    },
    initialize: function (pointer) {
        this._isReady = true;
        this._pointer = pointer;
    },
    popupProduct: function (id) {
        this.Popup('product', id);
    },
    popupPerson: function (name) {
        this.Popup('person', name);
    },
    popupCategoryBrowse: function (category) {
        this.Popup('category', category);
    },
    Play: function (target, keyword) {
        try {
            if (this._isReady)
                this._pointer.Trigger('play', target, keyword)
            else
                $.cd.log('Player is not ready to process your action');
        }
        catch (e) {
            $.cd.log('Cannot process your request');
        }
    },
    Popup: function (target, keyword) {
        try {
            if (this._isReady)
                this._pointer.Trigger('popup', target, keyword)
            else
                $.cd.log('Player is not ready to process your action');
        }
        catch (e) {
            $.cd.log('Cannot process your request');
        }
    },
    Search: function (keyword) {
        try {
            if (this._isReady)
                this._pointer.Trigger('search', 'all', keyword)
            else
                $.cd.log('Player is not ready to process your action');
        }
        catch (e) {
            $.cd.log('Cannot process your request');
        }
    },
    RegisterEventCallback: function (func) {
        try {
            if (null != func)
                this._actionCallBack = func;
        }
        catch (e) {
        }
    },
    EventOccured: function (type, target, keyword) {
        try {
            if (typeof this._actionCallBack != 'string' && null != this._actionCallBack) {
                keyword = null != keyword ? keyword.replace(/'/g, "") : null;
                this._actionCallBack.apply(this, [type, target, keyword]);
            }
            else {
                eval(this._actionCallBack + "('" + type + "','" + target + "','" + keyword + "')");
            }

            if (window['StorefrontEventListner'] != undefined)
                eval("StorefrontEventListner('" + type + "','" + target + "','" + keyword + "')");
        }
        catch (e) {
        }
    },
    LoadStorefront: function () {
        try {
            if (this._isReady)
                this._pointer.Trigger('loadStorefront');
            else
                $.cd.log('Player is not ready to process your action');
        }
        catch (e) {
        }
    },
    QueueForDownload: function (productid, planid, desc, dcId) {
        try {
            if (this._isReady)
                this._pointer.QueueForDownload(productid, planid, desc, dcId);
            else
                EventOccured("Error", "QueueForDownload", "Not Initialized");
        }
        catch (e) {
        }
    },
    QueueJsonForDownload: function (json) {
        try {
            if (this._isReady)
                this._pointer.QueueJsonForDownload(json);
            else
                EventOccured("Error", "QueueForDownload", "Not Initialized");
        }
        catch (e) {
        }
    },
    SetDeviceNickname: function (name) {
        this.SetInitParameter("devicenickname", name);
    },
    SetInitParameter: function (key, name) {
        try {
            if (this._isReady)
                this._pointer.SetInitParameter(key, name);
            else
                EventOccured("Error", key, "Not Initialized");
        }
        catch (e) {
        }
    }
};

//---------------------------------------------------------------------------------------------
//Silverlight Extension
//Used to embed the Standalone player in client HTML pages.
//---------------------------------------------------------------------------------------------
ContentDirect.UI.Storefront.Silverlight = {};
ContentDirect.UI.Storefront.Silverlight.Player = function () {
    this.Type = "SilverlightSP";
    this._TARGET_VERSION = '5.1.30514.0';
    this._MIN_VERSION = '1.0';
    this._RESOURCE_SL_SYNDICATED_ALT = 'Please click this image to go to the store.';
    this._RESOURCE_SL_INSTALL_ALT = 'Please install Silverlight Framework.';
    this._RESOURCE_SL_GET_ALT = 'Get Microsoft Silverlight';
    this._PARAM_FORMAT = '{0},NonSilverlightImageURL={1},WindowlessMode={2},Language={3},CustomResourcesXapLocation={4}';
};
ContentDirect.UI.Storefront.Silverlight.Player.prototype = {
    embedApplication: function (s) {
        if (null != Silverlight && Silverlight.isInstalled(this._MIN_VERSION)) {
            xapfile = __CD_SP_CONFIG__.xapLocation;
            getSilverlightMethodCall = 'Silverlight.getSilverlight("' + this._TARGET_VERSION + '");';
            useWindowless = StorefrontInternalAPI.getParam('WindowlessMode') != "" ? 'true' : 'false';
            language = StorefrontInternalAPI.getParam('Language');
            parameters = StorefrontInternalAPI.getSystemParams();

            Silverlight.createObjectEx({
                source: xapfile,
                parentElement: StorefrontInternalAPI._contentContainer,
                id: 'silverlightMain',
                properties: params = {
                    height: StorefrontInternalAPI.getHeight(),
                    width: StorefrontInternalAPI.getWidth(),
                    background: 'Black',
                    alt: 'PluginImage',
                    autoUpgrade: 'true',
                    minRuntimeVersion: this._TARGET_VERSION,
                    windowless: useWindowless,
                    version: this._MIN_VERSION,
                    enableGPUAcceleration: 'true',
                    enableHTMLAccess: 'true'
                },
                events: { onLoad: StorefrontInternalAPI._extension.plugin_loaded },
                initParams: parameters,
                context: "Being loaded"
            });
        }
        else
            this.loadSilverlightInstallation();
    },
    createParams: function () {
        return "";
    },
    setPlayerReady: function (isReady) {
        if (isReady && StorefrontScriptAPI) {
            try {
                //this call has caused error in IE in certain environments, 
                //we need to figure out why the Content is not always available.
                //For now I am trapping this exception so that the player loads w/o the JS bridge functionality.
                this._apiStub = document.getElementById('silverlightMain').Content.Page.GetScriptStub();
                StorefrontScriptAPI.initialize(this._apiStub);
            }
            catch (e)
            { }
        }
    },
    set_contentProgress: function (value) {
        if (null != value) {
            progressObj = jQuery.parseJSON(value);
            StorefrontInternalAPI.setSessionID(StorefrontInternalAPI.Tools.getValueFromDict("sessionId", progressObj));
            StorefrontInternalAPI._playingProductId = StorefrontInternalAPI.Tools.getValueFromDict("pId", progressObj);
            StorefrontInternalAPI._playingPricingId = StorefrontInternalAPI.Tools.getValueFromDict("ppId", progressObj);
            StorefrontInternalAPI._contentProgress = parseInt(StorefrontInternalAPI.Tools.getValueFromDict("progress", progressObj));
            StorefrontInternalAPI._referenceId = StorefrontInternalAPI.Tools.getValueFromDict("referenceId", progressObj);
        }
    },
    getHostServerLocation: function () {
        //For SL the Init.xap is always hosted on our Content Direct servers,
        //so we can use the initial xap location
        var hostServerLocation = '';
        if (null != document.getElementById('XapLocation')) {
            hostServerLocation = document.getElementById('XapLocation').value;
        }
        else if (StorefrontInternalAPI.getParam('ServerLocation') != null) {
            hostServerLocation = StorefrontInternalAPI.getParam('ServerLocation');
        }
        else {
            hostServerLocation = StorefrontInternalAPI.getParam('XapLocation');
        }

        return hostServerLocation.replace('ClientBin', '');
    },
    loadSilverlightInstallation: function () {
        var baseImage = new Image();
        baseImage.alt = this._RESOURCE_SL_INSTALL_ALT;

        var source = null;
        //Fullplayer = 3, SurfacePlayer = 4
        if (StorefrontInternalAPI.getParam('NonSilverlightImageURL'))
            source = StorefrontInternalAPI.getParam('NonSilverlightImageURL');
        else {
            source = '3' == StorefrontInternalAPI.getParam('PlayerLayoutTypeCode') || '4' == StorefrontInternalAPI.getParam('PlayerLayoutTypeCode')
				    ? 'http://hwcdn.net/n8v4q7r8/cds/Player/LargePlayerNonSilverlight.jpg'
				    : 'http://hwcdn.net/n8v4q7r8/cds/Player/NonSilverlight.jpg';
        }
        baseImage.src = source;

        var baseE = window.document.createElement('div');
        if (String(StorefrontInternalAPI.getBrowserType()).toLowerCase().search('firefox') == -1) {
            baseE.style.width = "100%";
            baseE.style.height = "100%";
        }
        baseE.style.position = "absolute";
        baseE.style.left = "0px";
        baseE.style.top = "0px";
        baseE.style.zIndex = "0";
        baseE.style.maxHeight = "428px";
        baseE.appendChild(baseImage);
        StorefrontInternalAPI._contentContainer.innerHTML = "";
        StorefrontInternalAPI._contentContainer.appendChild(baseE);

        //Create plugin image
        var pluginImage = new Image();
        pluginImage.alt = this._RESOURCE_SL_GET_ALT;
        pluginImage.src = 'http://go.microsoft.com/fwlink/?LinkId=108181';
        pluginImage.style.marginTop = '30px';
        pluginImage.style.marginRight = '30px';
        pluginImage.style.cursor = 'pointer';
        pluginImage.onload = this.plugin_load;
        pluginImage.onclick = this.plugin_click;

        var e = window.document.createElement('div');
        e.style.styleFloat = 'right';
        e.style.cssFloat = 'right';
        e.style.position = 'relative';
        e.style.zIndex = '1';

        e.appendChild(pluginImage);
        StorefrontInternalAPI._contentContainer.appendChild(e);
    },
    plugin_click: function (e) {
        //StorefrontInternalAPI.loadUrl(StorefrontInternalAPI.getRequestURL('502', 'Silverlight+Installed'));
        Silverlight.getSilverlight();
    },
    plugin_load: function (e) {
        if (!Silverlight.isInstalled(this._TARGET_VERSION)) {
            //StorefrontInternalAPI.loadUrl(StorefrontInternalAPI.getRequestURL('501', 'Install+SL+Prompt'));
        }
    },
    plugin_loaded: function (sender, args) {
    	slCtl = sender;
    	StorefrontInternalAPI._JS_BRIDGE = slCtl.Content.JsBridge;
    },
		rewind_click: function () {
       StorefrontInternalAPI._JS_BRIDGE.Restart();
   	},
   	go_compact: function(){
   		StorefrontInternalAPI._JS_BRIDGE.GoCompact();
   	},
	exit_fullscreen: function(){
		console.log(StorefrontInternalAPI._JS_BRIDGE);
	}
 
};
//---------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------
//Silverlight Extension
//Used to embed the Download Manager in client HTML pages.
//---------------------------------------------------------------------------------------------
ContentDirect.UI.Storefront.Silverlight.DLM = function () {
    this.Type = "SilverlightDLM";
    this._TARGET_VERSION = '5.1.30514.0';
    this._MIN_VERSION = '1.0';
};
ContentDirect.UI.Storefront.Silverlight.DLM.prototype = {
    embedApplication: function (s) {
        if (null != Silverlight && Silverlight.isInstalled(this._MIN_VERSION)) {
            xapfile = StorefrontInternalAPI._initParams.XapUrl;
            parameters = StorefrontInternalAPI.getSystemParams();

            Silverlight.createObjectEx({
                source: xapfile,
                parentElement: StorefrontInternalAPI._contentContainer,
                id: 'silverlightMain',
                properties: params = {
                    height: StorefrontInternalAPI.getHeight(),
                    width: StorefrontInternalAPI.getWidth(),
                    background: 'Transparent',
                    alt: 'PluginImage',
                    autoUpgrade: 'true',
                    minRuntimeVersion: this._TARGET_VERSION,
                    windowless: 'true',
                    version: this._MIN_VERSION,
                    enableHtmlAccess: 'true',
                    enableGPUAcceleration: 'false'
                },
                events: {},
                initParams: parameters,
                context: "Being loaded"
            });
        }
    },
    set_contentProgress: function (value) {
    },
    createParams: function () {
        return "";
    },
    setPlayerReady: function (isReady) {
        if (isReady && StorefrontScriptAPI) {
            try {
                //this call has caused error in IE in certain environments, 
                //we need to figure out why the Content is not always available.
                //For now I am trapping this exception so that the player loads w/o the JS bridge functionality.
                this._apiStub = document.getElementById('silverlightMain').Content.Page.GetScriptStub();
                StorefrontScriptAPI.initialize(this._apiStub);
            }
            catch (e)
            { }
        }
    },
    getHostServerLocation: function () {
        return "";
    }
};
//---------------------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------
//Flash Extension
//Used to embed the Surface and Standalone player in html pages.
//---------------------------------------------------------------------------------------------
ContentDirect.UI.Storefront.Flash = function () {
    this.Type = "Flash";
    this._TARGET_VERSION = '10.2.0';
    this._SWF_CHILD_CONTAINER = "__SWF__StorefrontContainer";
    this._PARAM_FORMAT = '{0},NonFlashImageURL={1},WindowlessMode={2},Language={3},CustomResourcesBinLocation={4}';
}
ContentDirect.UI.Storefront.Flash.prototype = {
    embedApplication: function (s) {
        var playerType = StorefrontInternalAPI._initParams.PlayerLayoutTypeCode;
        if (playerType == "1" || playerType == "5") {
            this.embedStandaloneApplication();
        }
        else if (!playerType || playerType == "undefined") {
            this.embedStandaloneApplication();
        }
    },
    embedStandaloneApplication: function (s) {
        var lastCharSwfBase = __CD_SWF_LOC__.substring(__CD_SWF_LOC__.length, __CD_SWF_LOC__.length - 1);
        if (lastCharSwfBase != "/") {
            __CD_SWF_LOC__ += "/";
        }

        var ServerLoc = StorefrontInternalAPI._initParams.ServerLocation;
        var lastCharConfig = ServerLoc.substring(ServerLoc.length, ServerLoc.length - 1);
        if (lastCharConfig != "/") {
            ServerLoc += "/";
        }

        var flashvars = {
            SystemId: StorefrontInternalAPI._initParams.SystemId,
            ChannelId: StorefrontInternalAPI._initParams.ChannelId,
            SWFBasePath: __CD_SWF_LOC__,
            ConfigPath: ServerLoc + "config.xml",
            DelayLoadPlayer: StorefrontInternalAPI._initParams.DelayLoadPlayer,
            DelayLoadPlayerImageUrl: StorefrontInternalAPI._initParams.DelayLoadPlayerImageUrl || "",
            FeaturedProductImageUrl: StorefrontInternalAPI._initParams.FeaturedProductImageUrl || "",
            PreloadBackgroundImageURL: StorefrontInternalAPI._initParams.PreloadBackgroundImageURL || "",
            NonFlashImageURL: StorefrontInternalAPI._initParams.NonFlashImageURL || "",
            MainAccentColor: StorefrontInternalAPI._initParams.MainAccentColor || "0x999999",
            LiveButtonAccentColor: StorefrontInternalAPI._initParams.LiveButtonAccentColor || "0x999999",
            DeviceType: StorefrontInternalAPI._initParams.DeviceType,
            ProductName: StorefrontInternalAPI._initParams.ProductName,
            ConvivaCustomerId: StorefrontInternalAPI._initParams.ConvivaCustomerId,
            SiteName: StorefrontInternalAPI._initParams.SiteName || "HTML",
            InitialBufferTime: StorefrontInternalAPI._initParams.InitialBufferTime || "1",
            ExpandedBufferTime: StorefrontInternalAPI._initParams.ExpandedBufferTime || "10",
            LiveBufferTime: StorefrontInternalAPI._initParams.LiveBufferTime || "0",
            WindowlessMode: StorefrontInternalAPI._initParams.WindowlessMode,
            PlayerLayoutTypeCode: StorefrontInternalAPI._initParams.PlayerLayoutTypeCode,
            Language: StorefrontInternalAPI._initParams.Language
        }

        if (StorefrontInternalAPI._initParams.IsAnonymousSession)
            flashvars.IsAnonymousSession = StorefrontInternalAPI._initParams.IsAnonymousSession;
        if (StorefrontInternalAPI._initParams.ProductIdToPlay)
            flashvars.ProductIdToPlay = StorefrontInternalAPI._initParams.ProductIdToPlay;
        if (StorefrontInternalAPI._initParams.PricingPlanIdToPlay)
            flashvars.PricingPlanIdToPlay = StorefrontInternalAPI._initParams.PricingPlanIdToPlay;
        if (StorefrontInternalAPI._initParams.viewproductcontentjson)
            flashvars.viewproductcontentjson = StorefrontInternalAPI._initParams.viewproductcontentjson;
        if (StorefrontInternalAPI._initParams.PrerollUrl)
            flashvars.PrerollUrl = StorefrontInternalAPI._initParams.PrerollUrl;
        if (StorefrontInternalAPI._initParams.AutoPlay)
            flashvars.AutoPlay = true;
        if (StorefrontInternalAPI._initParams.AutoDowngradeOutputProtectionFailure)
            flashvars.AutoDowngradeOutputProtectionFailure = true;
        if (StorefrontInternalAPI._initParams.HDCPCheckURL)
            flashvars.HDCPCheckURL = StorefrontInternalAPI._initParams.HDCPCheckURL;
        if (StorefrontInternalAPI._initParams.SourceUrl)
            flashvars.SourceURL = StorefrontInternalAPI._initParams.SourceUrl;
        if (StorefrontInternalAPI._initParams.ProductExternalReferenceTypeCode)
            flashvars.ProductExternalReferenceTypeCode = StorefrontInternalAPI._initParams.ProductExternalReferenceTypeCode;
        if (StorefrontInternalAPI._initParams.ProductExternalReferenceValue)
            flashvars.ProductExternalReferenceValue = StorefrontInternalAPI._initParams.ProductExternalReferenceValue;
        if (StorefrontInternalAPI._initParams.PricingPlanExternalReferenceTypeCode)
            flashvars.PricingPlanExternalReferenceTypeCode = StorefrontInternalAPI._initParams.PricingPlanExternalReferenceTypeCode;
        if (StorefrontInternalAPI._initParams.PricingPlanExternalReferenceValue)
            flashvars.PricingPlanExternalReferenceValue = StorefrontInternalAPI._initParams.PricingPlanExternalReferenceValue;
        if (StorefrontInternalAPI._initParams.AkamaiPluginActive)
            flashvars.AkamaiPluginActive = true;
        if (StorefrontInternalAPI._initParams.Login && StorefrontInternalAPI._initParams.Login != '')
            flashvars.Login = StorefrontInternalAPI._initParams.Login;
        if (StorefrontInternalAPI._initParams.SsoToken && StorefrontInternalAPI._initParams.SsoToken != '')
            flashvars.SsoToken = StorefrontInternalAPI._initParams.SsoToken;
        if (StorefrontInternalAPI._initParams.SessionId && StorefrontInternalAPI._initParams.SessionId != '')
            flashvars.SessionId = StorefrontInternalAPI._initParams.SessionId;
        if (StorefrontInternalAPI._initParams.playerContextId && StorefrontInternalAPI._initParams.playerContextId != '')
            flashvars.playerContextId = StorefrontInternalAPI._initParams.playerContextId;
        if (StorefrontInternalAPI._initParams.FirstName && StorefrontInternalAPI._initParams.FirstName != '')
            flashvars.FirstName = StorefrontInternalAPI._initParams.FirstName;
        if (StorefrontInternalAPI._initParams.LastName && StorefrontInternalAPI._initParams.LastName != '')
            flashvars.LastName = StorefrontInternalAPI._initParams.LastName;
        if (StorefrontInternalAPI._initParams.Email && StorefrontInternalAPI._initParams.Email != '')
            flashvars.Email = StorefrontInternalAPI._initParams.Email;

        var params = {
            bgcolor: "#000000",
            wmode: StorefrontInternalAPI._initParams.WindowlessMode,
            quality: "high",
            allowscriptaccess: "always",
            allowfullscreen: "true",
            menu: "false"
        };

        var attributes = {
            id: "StandalonePlayer",
            name: "StandalonePlayer"
        };

        if (!StorefrontInternalAPI._initParams.Width || StorefrontInternalAPI._initParams.Width == 0)
            StorefrontInternalAPI._initParams.Width = "100%";
        if (!StorefrontInternalAPI._initParams.Height || StorefrontInternalAPI._initParams.Height == 0)
            StorefrontInternalAPI._initParams.Height = "100%";

        StorefrontInternalAPI._contentContainer.innerHTML = "";
        var childContainer = document.getElementById(this._SWF_CHILD_CONTAINER);
        if (!childContainer) {
            childContainer = window.document.createElement('div');
            childContainer.setAttribute('id', this._SWF_CHILD_CONTAINER);
            if (StorefrontInternalAPI._initParams.NonFlashImageURL && StorefrontInternalAPI._initParams.NonFlashImageURL.length > 0)
                childContainer.innerHTML = "<img src='" + decodeURIComponent(StorefrontInternalAPI._initParams.NonFlashImageURL) + "'/>";
        }
        StorefrontInternalAPI._contentContainer.appendChild(childContainer);

        swfobject.embedSWF(__CD_SWF_LOC__ + "CSGStandalonePlayer.swf", this._SWF_CHILD_CONTAINER, StorefrontInternalAPI._initParams.Width, StorefrontInternalAPI._initParams.Height, this._TARGET_VERSION, __CD_SWF_LOC__ + "assets/expressInstall.swf", flashvars, params, attributes);
    },
    createParams: function () {
        var systemParams = StorefrontInternalAPI.getSystemParams();

        formattedParams = String(this._PARAM_FORMAT).replace('{0}', systemParams);
        formattedParams = String(formattedParams).replace('{1}', null == document.getElementById('NonFlashImageURL') ? '' : document.getElementById('NonFlashImageURL').value);
        formattedParams = String(formattedParams).replace('{2}', null == document.getElementById('WindowlessMode') ? '' : document.getElementById('WindowlessMode').value);
        formattedParams = String(formattedParams).replace('{3}', null == document.getElementById('Language') ? '' : document.getElementById('Language').value);
        formattedParams = String(formattedParams).replace('{4}', null == document.getElementById('CustomResourcesBinLocation') ? '' : document.getElementById('CustomResourcesBinLocation').value);

        return formattedParams;
    },
    setPlayerReady: function (isReady) {

    },
    set_contentProgress: function (value) {
        if (null != value) {
            progressObj = jQuery.parseJSON(value);
            if (progressObj["sessionId"])
                StorefrontInternalAPI.setSessionID(progressObj["sessionId"]);
            if (progressObj["pId"])
                StorefrontInternalAPI._playingProductId = progressObj["pId"];
            if (progressObj["ppId"])
                StorefrontInternalAPI._playingPricingId = progressObj["ppId"];
            if (progressObj["progress"])
                StorefrontInternalAPI._contentProgress = parseInt(progressObj["progress"]);
            if (progressObj["referenceId"])
                StorefrontInternalAPI._referenceId = progressObj["referenceId"];
        }
    },
    getHostServerLocation: function () {
        //For Flash the SWF file is not located on our main servers,
        //so we need to use the serverLocation variable defined in the Flash.config.js

        //remove everything after and including ClientBin...
        var trimmedDomain = StorefrontInternalAPI._initParams.ServerLocation.slice(0, StorefrontInternalAPI._initParams.ServerLocation.search("ClientBin"));

        return trimmedDomain;
    }
};
//---------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------
//IOS Extension
//Used to embed the Surface and Standalone player in html pages.
//---------------------------------------------------------------------------------------------
ContentDirect.UI.Storefront.IOS = function () {
    this.Type = "IOS";
};
ContentDirect.UI.Storefront.IOS.prototype = {
    embedApplication: function (s) {
        if (null != StorefrontInternalAPI._initParams.SourceUrl && StorefrontInternalAPI._initParams.SourceUrl.length > 0) {
            var data = { ContentURL: StorefrontInternalAPI._initParams.SourceUrl };
            this.appendPlayer(data);
        }
        else if (null != StorefrontInternalAPI._initParams.viewproductcontentjson && StorefrontInternalAPI._initParams.viewproductcontentjson.length > 0) {
            var data = JSON.parse(decodeURIComponent(StorefrontInternalAPI._initParams.viewproductcontentjson));
            this.appendPlayer(data);
        }
        else {
            $.cd.knownRequest(ContentDirect.UI.Request.ViewProductContent, "productId=" + StorefrontInternalAPI._initParams.ProductIdToPlay
																	   + "&pripId=" + StorefrontInternalAPI._initParams.PricingPlanIdToPlay
                                                                       + "&ssoToken=" + StorefrontInternalAPI._initParams.SsoToken + "&log=" + StorefrontInternalAPI._initParams.Login,
				$('#' + StorefrontInternalAPI._targetContainerId).attr("initParams"),
				function (data) {
				    StorefrontInternalAPI._extension.appendPlayer(data);
				},
				function (error) {
				    StorefrontScriptAPI.EventOccured("Error", "IOS", error.data.Message);
				}
			);
        };
    },
    appendPlayer: function (data) {
        var _width = StorefrontInternalAPI._initParams.Width == 0 ? "100%" : StorefrontInternalAPI._initParams.Width + "px";
        var _height = StorefrontInternalAPI._initParams.Height == 0 ? "100%" : StorefrontInternalAPI._initParams.Height + "px";
        var videoTag = "<video id='videoPlayer' autoplay='autoplay' width='" + _width + "' height='" + _height + "' controls='controls'><source src='" + data.ContentURL + "'/></video>";
        $('#' + StorefrontInternalAPI._targetContainerId).empty();
        $('#' + StorefrontInternalAPI._targetContainerId).append(videoTag);
        var videoPlayer = $('#videoPlayer')[0];

        videoPlayer.addEventListener('ended', function (e) {
            StorefrontScriptAPI.EventOccured("End", this, "Ended");
        }, false);
    },
    set_contentProgress: function (value) {
    },
    createParams: function () {
        return "";
    },
    setPlayerReady: function (isReady) {

    },
    getHostServerLocation: function () {
        return "";
    }
};
//---------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------
//HTML5 Extension
//Used to embed the HTML player in html pages.
//---------------------------------------------------------------------------------------------
ContentDirect.UI.Storefront.HTML = function () {
    this.Type = "HTML";
};
ContentDirect.UI.Storefront.HTML.prototype = {
    embedApplication: function (s) {
        var self = this;
        if (null != StorefrontInternalAPI._initParams.SourceUrl && StorefrontInternalAPI._initParams.SourceUrl.length > 0) {
            var data = { ContentURL: StorefrontInternalAPI._initParams.SourceUrl };
            this.appendPlayer(data);
        }
        else if (null != StorefrontInternalAPI._initParams.viewproductcontentjson && StorefrontInternalAPI._initParams.viewproductcontentjson.length > 0) {
            var data = JSON.parse(decodeURIComponent(StorefrontInternalAPI._initParams.viewproductcontentjson));

            // Get content metadata
            $.cd.getMediaInfo(data.ContentItemId, function (mediaItem) {
                self.appendPlayer(data, mediaItem);
            });
        }
        else {
            this.appendPlayer(null, null, true);
        }
    },
    appendPlayer: function (data, mediaItem, performHDCPCheck) {
        var pluginUrl = $.cd.getPlayerUrl($.cd.get_browserInfo().getPlayerLocation("sph"));
        performHDCPCheck = performHDCPCheck || false;
        jQuery.ajax({
            dataType: "script",
            cache: true,
            url: pluginUrl
        }).done(function () {
            var widevineSettings = $.cd.getCDFullSettingValue("widevine"),
                token = data !== null ? data.LicenseRequestToken : null,
                contentUrl = data !== null ? data.ContentURL : null,
                progressSeconds = data !== null ? data.ProgressSeconds : null,
                licenseServerUrl = null != widevineSettings ? $.cd.get_publicServiceLocation() + widevineSettings.licenseServerPath : "",
                wvProvider = null != widevineSettings ? widevineSettings.provider : "",
                nativePlayback = !token && /mp4|MP4$/.test(contentUrl),
                _width = StorefrontInternalAPI._initParams.Width == 0 ? "100%" : StorefrontInternalAPI._initParams.Width + "px",
                _height = StorefrontInternalAPI._initParams.Height == 0 ? "100%" : StorefrontInternalAPI._initParams.Height + "px",
                $video = $("<video id='videoPlayer' width='" + _width + "' height='" + _height + "' controls></video>");
            $('#' + StorefrontInternalAPI._targetContainerId).empty();
            $('#' + StorefrontInternalAPI._targetContainerId).append($video);

            var video = $video[0];

            if (nativePlayback) {
                $video.append("<source src=" + contentUrl + " type='video/mp4'>");
                video.play();
                if (progressSeconds > 0) {
                    video.currentTime = progressSeconds;
                }
                //Kiran : Ensure the default player controls are visible.
                //Also, close the fancybox on content end.
                if (!$("#showDefaultControls", $("head")).length) {
                    $("<style id='showDefaultControls' type='text/css'> #videoPlayer::-webkit-media-controls-enclosure{ visibility:visible;} </style>").appendTo("head");
                }
                $video.unbind("ended").bind("ended", function () {
                    $.fancybox.close();
                });
            } else {
                $("#showDefaultControls", $("head")).remove();
                var sideLoadedCaptions = [],
                    playerSettings = $.cd.getCDFullSettingValue('htmlplayer') || {
                        hideControls: false,
                        defaultVolume: 50,
                        templateUrl: '',
                        defaultCaptionLanguage: 'eng',
                        defaultAudioLanguage: 'eng'
                    },
                    uiController = null,
                    mediaPlayerController = null;

                // Set up UpdateContentProgress timer
                StorefrontInternalAPI.attachUpdateContentProgressEvent({
                    productId: StorefrontInternalAPI._initParams.ProductIdToPlay,
                    pricingId: StorefrontInternalAPI._initParams.PricingPlanIdToPlay,
                    element: video
                });

                // Handle reaching the end of the content
                video.addEventListener('ended', function (e) {
                    $("#playerContainer").off("hidingContent");
                    StorefrontScriptAPI.EventOccured("End", this, "Ended");
                    StorefrontInternalAPI.removeUpdateContentProgressEvent();
                    ascendon.htmlplayer.uiController.unload();
                    delete ascendon.htmlplayer.uiController;
                }, false);

                // Initialize the player and UI controls
                if (!ContentDirectAPI.get_isPerformingHDCPcheck()) {
                    $.cd.showBlocker();
                }

                var htmlPlayerVersion = $.cd.get_htmlPlayerVersion() || 'current';
                var legacyHtmlPlayer = htmlPlayerVersion.indexOf('15.2') >= 0;

                if (legacyHtmlPlayer) {  // player version is 15.2.HTPL
                    // Check for side-loaded captions from closed captions first, then from markers
                    if (mediaItem) {
                        if (mediaItem.ClosedCaptions && mediaItem.ClosedCaptions.ClosedCaptionSettings && mediaItem.ClosedCaptions.ClosedCaptionSettings.length > 0) {
                            for (var caption in mediaItem.ClosedCaptions.ClosedCaptionSettings) {
                                sideLoadedCaptions.push({
                                    lang: mediaItem.ClosedCaptions.ClosedCaptionSettings[caption].Language,
                                    url: mediaItem.ClosedCaptions.ClosedCaptionSettings[caption].Url,
                                    label: mediaItem.ClosedCaptions.ClosedCaptionSettings[caption].Language
                                });
                            }
                        } else if (mediaItem.Markers && mediaItem.Markers.length > 0) { // check markers
                            for (var i = 0; i < mediaItem.Markers.length; i += 1) {
                                var externalConfiguration = mediaItem.Markers[i].ExternalConfiguration;
                                if (externalConfiguration && externalConfiguration.ExternalTypeCode === 4) {
                                    for (var fi in externalConfiguration.Fields) {
                                        var field = externalConfiguration.Fields[fi];
                                        if (field.ExternalTypeFieldCode === 21) {
                                            sideLoadedCaptions.push({
                                                lang: 'unknown_' + String(i + 1),
                                                url: field.FieldValue,
                                                label: 'Unknown_' + String(i + 1)
                                            });
                                        }

                                    }
                                }
                            }
                        }
                    }
                    mediaPlayerController = new ascendon.MediaPlayerController(video, playerSettings);
                    mediaPlayerController.initialize(licenseServerUrl, wvProvider);
                    // Should only be performed once during the user's auth/unauth session unless cache is cleared
                    if (performHDCPCheck) {
                        try {
                            var htmlPlayerSettings = $.cd.getCDFullSettingValue("htmlplayer");
                            if (null !== htmlPlayerSettings) {
                                mediaPlayerController.checkHDCP(htmlPlayerSettings.hdcpTestFile, function (hdcpResult) {
                                    ContentDirectAPI.set_isPerformingHDCPcheck(false);
                                    $.cd.get_loginInfo().set_outputProtectionSupported(hdcpResult ? 1 : 2);
                                });
                            } else {
                                $.cd.log('No html player settings found in cdfull');
                                $.cd.get_loginInfo().set_outputProtectionSupported(2);
                            }
                        } catch (err) {
                            $.cd.log("Exception occurred performing HDCP check: " + err);
                            $.cd.get_loginInfo().set_outputProtectionSupported(2);
                        }
                    }
                    mediaPlayerController.setAutoPlay(true);
                    mediaPlayerController.load(contentUrl, token, playerSettings.defaultCaptionLanguage, playerSettings.defaultAudioLanguage, sideLoadedCaptions);

                    uiController = new ascendon.UIController(mediaPlayerController, {
                        ProductId: StorefrontInternalAPI._initParams.ProductIdToPlay,
                        PricingId: StorefrontInternalAPI._initParams.PricingPlanIdToPlay,
                        ProgressSeconds: progressSeconds
                    });

                    uiController.initialize();
                    ascendon.htmlplayer.mediaPlayerController = mediaPlayerController;

                    mediaPlayerController.addEventListener('playererror', function (e, dataObj) {
                        $.cd.hideBlocker();
                        $.cd.log('HTML player error: playererror - ' + JSON.stringify(dataObj || 'no message available'));
                    });

                    mediaPlayerController.addEventListener('failedloadingcontrols', function (e, dataObj) {
                        $.cd.hideBlocker();
                        $.cd.log('HTML player error: failedloadingcontrols - ' + JSON.stringify(dataObj || 'no message available'));
                    });

                    // Handle closing the player
                    $("#playerContainer").on('hidingContent', function () {
                        StorefrontInternalAPI._contentProgress = mediaPlayerController ? mediaPlayerController.getProgressSeconds() : 0;
                        StorefrontScriptAPI.EventOccured("Stop", this, "Stopped");
                        StorefrontInternalAPI.removeUpdateContentProgressEvent();
                        ascendon.htmlplayer.uiController.unload();
                        delete ascendon.htmlplayer.uiController;
                    });


                }
                else {

                    // Check for side-loaded captions from closed captions first, then from markers
                    if (mediaItem) {
                        if (mediaItem.ClosedCaptions && mediaItem.ClosedCaptions.ClosedCaptionSettings && mediaItem.ClosedCaptions.ClosedCaptionSettings.length > 0) {
                            for (var caption in mediaItem.ClosedCaptions.ClosedCaptionSettings) {
                            		mediaItem.ClosedCaptions.ClosedCaptionSettings[caption].Url = mediaItem.ClosedCaptions.ClosedCaptionSettings[caption].Url.replace("http", "https");
                                sideLoadedCaptions.push({
                                    language: mediaItem.ClosedCaptions.ClosedCaptionSettings[caption].Language,
                                    url: mediaItem.ClosedCaptions.ClosedCaptionSettings[caption].Url
                                });
                            }
                        } else if (mediaItem.Markers && mediaItem.Markers.length > 0) { // check markers
                            for (var i = 0; i < mediaItem.Markers.length; i += 1) {
                                var externalConfiguration = mediaItem.Markers[i].ExternalConfiguration;
                                if (externalConfiguration && externalConfiguration.ExternalTypeCode === 4) {
                                    for (var fi in externalConfiguration.Fields) {
                                        var field = externalConfiguration.Fields[fi];
                                        if (field.ExternalTypeFieldCode === 21) {
                                            sideLoadedCaptions.push({
                                                language: 'unknown_' + String(i + 1),
                                                url: field.FieldValue
                                            });
                                        }

                                    }
                                }
                            }
                        }
                    }

                    uiController = new ascendon.UIController({
                        userSettings: playerSettings,
                        videoElement: document.getElementById('videoPlayer'),
                        laUrl: licenseServerUrl,
                        widevineProvider: wvProvider,
                        hdcpCheck: performHDCPCheck,
                        hdcpContentUrl: $.cd.getCDFullSettingValue("htmlplayer").hdcpTestFile,
                        productId: StorefrontInternalAPI._initParams.ProductIdToPlay,
                        pricingId: StorefrontInternalAPI._initParams.PricingPlanIdToPlay,
                        sessionId: StorefrontInternalAPI._initParams['SessionId'],
                        progressSeconds: progressSeconds,
                        language: $.cd.getCDFullSettingValue('language')
                    });

                    ascendon.htmlplayer.uiController = uiController;

                    uiController.initialize().then(function () {                        
                        mediaPlayerController = uiController.getPlayer();
                        uiController.setCaptionStyles(uiController.getCaptionStyles());
                        if (performHDCPCheck) {
                            uiController.checkHDCP($.cd.getCDFullSettingValue("htmlplayer").hdcpTestFile, function (hdcpResult) {
                                ContentDirectAPI.set_isPerformingHDCPcheck(false);
                                $.cd.get_loginInfo().set_outputProtectionSupported(hdcpResult ? 1 : 2);
                                mediaPlayerController.setAutoPlay(true);
                                mediaPlayerController.load(contentUrl, token, playerSettings.defaultCaptionLanguage, playerSettings.defaultAudioLanguage, sideLoadedCaptions);
                            });
                        } else {
                            mediaPlayerController.load(contentUrl, token, playerSettings.defaultCaptionLanguage, playerSettings.defaultAudioLanguage, sideLoadedCaptions);
                        }

                        mediaPlayerController.addEventListener('playererror', function (e, dataObj) {
                            $.cd.hideBlocker();
                            $.cd.log('HTML player error: playererror - ' + JSON.stringify(dataObj || 'no message available'));
                        });

                        mediaPlayerController.addEventListener('failedloadingcontrols', function (e, dataObj) {
                            $.cd.hideBlocker();
                            $.cd.log('HTML player error: failedloadingcontrols - ' + JSON.stringify(dataObj || 'no message available'));
                        });

                        // Handle closing the player
                        $("#playerContainer").on('hidingContent', function () {
                            StorefrontInternalAPI._contentProgress = mediaPlayerController ? mediaPlayerController.getProgressSeconds() : 0;
                            StorefrontScriptAPI.EventOccured("Stop", this, "Stopped");
                            StorefrontInternalAPI.removeUpdateContentProgressEvent();
                            ascendon.htmlplayer.uiController.unload();
                            delete ascendon.htmlplayer.uiController;
                        });
                    }, function (error) {
                        ascendon.htmlplayer.uiController.unload();
                        delete ascendon.htmlplayer.uiController;
                        var errorMessage = $.cd.getCDResource("failed_initializing_html_player", "An error occurred while initializing the player. Please try again later.");
                        StorefrontScriptAPI.EventOccured("Error", "FailedInitializingHtmlPlayer", errorMessage);                        
                    });
                }

                ascendon.htmlplayer.events.on('htmlplayer.readytoplaycompleted', function () {
                    ContentDirectAPI.updateCDResources(); // Update cdresources for audio/text track labels
                    $.cd.hideBlocker();
                });

                ascendon.htmlplayer.events.on('htmlplayer.stopped', function () {
                    $("#playerContainer").trigger("hidingContent");
                    $("#playerContainer").off("hidingContent");
                });

                ascendon.htmlplayer.events.on('htmlplayer.messageboxbeforeshow', function () {
                    $('.asc-player-html5-player').remove();
                    ContentDirectAPI.updateCDResources();
                });
                ascendon.htmlplayer.events.on('htmlplayer.messageboxaftershow', function () {
                    $.cd.hideBlocker();
                });

                // If an unsupported audio codec is found, stop playback
                ascendon.htmlplayer.events.on('htmlplayer.unsupportedaudiocodecfound', function (e, dataObj) {
                    $.cd.log('HTML player error: unsupportedaudiocodecfound - ' + JSON.stringify(dataObj || 'no message available'));
                    mediaPlayerController.stop();
                    $('.asc-player-htmlplayer').css('visibility', 'hidden');
                    if (!playerSettings.showMessages) {
                        var errorMessage = $.cd.getCDResource("unsupported_audio_codec_found", "The content you are attempting to stream is not currently supported in this browser.  Please use a different browser to view this content.");
                        StorefrontScriptAPI.EventOccured("Error", "UnsupportedAudioCodecFound", errorMessage);
                    }
                });
                ascendon.htmlplayer.events.on('htmlplayer.unsupportedaudiocodecfoundokclicked', function () {
                    $("#playerContainer").trigger("hidingContent");
                    $("#playerContainer").off("hidingContent");
                });
            }
        }).fail(function (error) {
            console.log('Failed loading the HTML player - ' + JSON.stringify(error));
        });
    },
    set_contentProgress: function (value) {

    },
    createParams: function () {
        return "";
    },
    setPlayerReady: function (isReady) {

    },
    getHostServerLocation: function () {
        return "";
    }
};
//---------------------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------
//Samsung SmartTV Player Extension
//---------------------------------------------------------------------------------------------
ContentDirect.UI.Storefront.Samsung = function () {
    this.Type = "Samsung";
    this._plugin = null;
    this._playReadyPlugin = null;
    this._licenseServerUrl = "";
    this._fullscreenMode = false;
    this._clearTimerVar = null;
    this._playSpeed = 1;
	this._isControllerShown = false;

};
ContentDirect.UI.Storefront.Samsung.prototype = {
    embedApplication: function (s) {
        if (null != StorefrontInternalAPI._initParams.SourceUrl && StorefrontInternalAPI._initParams.SourceUrl.length > 0) {
            var videoData = JSON.parse(decodeURIComponent(StorefrontInternalAPI._initParams.viewproductcontentjson));
            var data = { ContentURL: StorefrontInternalAPI._initParams.SourceUrl, ProgressSeconds: videoData.ProgressSeconds };
            var subtitleFile = StorefrontInternalAPI._initParams.SubtitleFile;
            if (subtitleFile != null && subtitleFile != "") {
                subtitleFile = decodeURIComponent(subtitleFile);
                StorefrontInternalAPI.loadSubtitle(subtitleFile);
            }
            this.initPlayer(data);
        }
        else if (null != StorefrontInternalAPI._initParams.viewproductcontentjson && StorefrontInternalAPI._initParams.viewproductcontentjson.length > 0) {
            $.cd.log("LICENSE SERVER URL: " + StorefrontInternalAPI._initParams.LicenseServerUrl);
            this._licenseServerUrl = StorefrontInternalAPI._initParams.LicenseServerUrl || null;
            if (null != this._licenseServerUrl) {
                this._licenseServerUrl += "/PlayReadyRightsManager.asmx";
            }
            var data = JSON.parse(decodeURIComponent(StorefrontInternalAPI._initParams.viewproductcontentjson));
            var subtitleFile = StorefrontInternalAPI._initParams.SubtitleFile;
            if (subtitleFile != null && subtitleFile != "") {
                $.cd.log("Try to parse the subtitle file sent back");
                subtitleFile = decodeURIComponent(subtitleFile);
                StorefrontInternalAPI.loadSubtitle(subtitleFile);
            }
            this.initPlayer(data);
        }
        else {
            $.cd.knownRequest(ContentDirect.UI.Request.ViewProductContent, "productId=" + StorefrontInternalAPI._initParams.ProductIdToPlay
																	   + "&pripId=" + StorefrontInternalAPI._initParams.PricingPlanIdToPlay
                                                                       + "&ssoToken=" + StorefrontInternalAPI._initParams.SsoToken + "&log=" + StorefrontInternalAPI._initParams.Login,
				$('#' + StorefrontInternalAPI._targetContainerId).attr("initParams"),
				function (data) {
				    this.initPlayer(data);
				},
				function (error) {
				    StorefrontScriptAPI.EventOccured("Error", "Samsung", error.data.Message);
				}
			);
        };
    },
    set_plugin: function (value) {
        this._plugin = value;
    },
    get_plugin: function () {
        return this._plugin;
    },
    set_playReadyPlugin: function () {
        return this._playReadyPlugin;
    },
    get_playReadyPlugin: function () {
        return this._playReadyPlugin;
    },
    get_fullscreenMode: function () {
        return this._fullscreenMode;
    },
    get_licenseServerUrl: function () {
        return this._licenseServerUrl;
    },
    set_licenseServerUrl: function (value) {
        this._licenseServerUrl = value;
    },
    get_clearTimerVar: function () {
        return this._clearTimerVar;
    },
    set_clearTimerVar: function (value) {
        this._clearTimerVar = value;
    },
	get_isControllerShown: function () {
		return this._isControllerShown;
	},
	set_isControllerShown: function (value) {
		this._isControllerShown = value;
	},
	handlePlayAction: function () {
	    $('#playButton').hide();
	    var pauseButton = $('#pauseButton');
	    pauseButton.show();
	    ContentDirect.UI.KeyboardFramework.set_focusedElement(pauseButton);
		StorefrontInternalAPI.get_extension().showPlayerStatusWindowOnTimer();
		StorefrontInternalAPI.get_extension().get_plugin().Resume();
	},
    handlePauseAction: function () {
        var extension = StorefrontInternalAPI.get_extension();
        $('#pauseButton').hide();
		var playButton = $('#playButton');
		playButton.show();
		ContentDirect.UI.KeyboardFramework.set_focusedElement(playButton);
		extension.showPlayerStatusWindowOnTimer();
		extension.get_plugin().Pause();
	},
    handleStopAction: function () {
        var extension = StorefrontInternalAPI.get_extension();
        $('#captionText').html('').hide();
        extension.get_plugin().Stop();
        extension.hidePlayerStatusWindow();
        $('#currentPlayTime').html('');        
        $('#videoDuration').html('');
        ContentDirectAPI._isModalClosed = true;
        $.cd.hideModal();
        StorefrontInternalAPI.removePingSessionEvent();
        // Should not have to do this, but for some reason it is jumping out of fancy box
        $('#__cdPlayer').remove();
        $('#pluginPlayer').width('0px');
        $('#pluginPlayer').height('0px');
        $('.main-container').show();
        // Enable the screen saver again
        g_SamsungPluginAPI.setOnScreenSaver();
        $.cd.log("WATCH COMPLETED THRESHOLD: " + $.cd.getResourceValue('viewing_completed_threshold_tv', "90"));
        var percentWatched = parseInt(document.getElementById("progressBar").style.width.replace('%', ''));
        if (percentWatched >= parseInt($.cd.getResourceValue('viewing_completed_threshold_tv', "90"))) {
            ContentDirectAPI._playerModalClosed(true, true);
        } else {
            ContentDirectAPI._playerModalClosed(false, true);
        }
        document.getElementById("progressBar").style.width = '0%';
        ContentDirect.UI.KeyboardFramework.set_selectorZone('#contentWrapper');
        ContentDirectAPI.findElementToFocusOn();
    },
    handleClosedCaptionAction: function () {
        StorefrontInternalAPI.get_extension().showPlayerStatusWindowOnTimer();
        var ccButton = $('#closedCaptionsButton');
        // Verify cc button is displayed
        if (ccButton.css('display') != 'none') {            
            ContentDirect.UI.KeyboardFramework.set_focusedElement(ccButton);
            if (StorefrontInternalAPI.get_captionsShowing()) {
                $('#captionText').html('').hide();
                StorefrontInternalAPI.set_captionsShowing(false);
                $('[cdid=playstatus]').html($.cd.getResourceValue('subtitles_off_message', 'Subtitles Off')).show();
            } else {
                StorefrontInternalAPI.set_captionsShowing(true);
                $('[cdid=playstatus]').html($.cd.getResourceValue('subtitles_on_message', 'Subtitles On')).show();
            }
        }
    },
    handleSkipBackwardAction: function () {
        var extension = StorefrontInternalAPI.get_extension();        
        this.showPlayerStatusWindowOnTimer();
        ContentDirect.UI.KeyboardFramework.set_focusedElement($('#skipBackwardButton'));
        extension.get_plugin().JumpBackward(parseInt($.cd.getResourceValue('skip_backward_increment', '300')));
    },
    handleRewindAction: function () {
        var extension = StorefrontInternalAPI.get_extension();
        $.cd.log("handleRewindAction!!!");        
        this.showPlayerStatusWindowOnTimer();
        ContentDirect.UI.KeyboardFramework.set_focusedElement($('#rewindButton'));
        extension.get_plugin().JumpBackward(parseInt($.cd.getResourceValue('rewind_increment', '10')));
    },
    handleSkipForwardAction: function () {
        var extension = StorefrontInternalAPI.get_extension();
        this.showPlayerStatusWindowOnTimer();
        ContentDirect.UI.KeyboardFramework.set_focusedElement($('#skipForwardButton'));        
        extension.get_plugin().JumpForward(parseInt($.cd.getResourceValue('skip_forward_increment', '300')));
    },
    handleFastForwardAction: function () {
        var extension = StorefrontInternalAPI.get_extension();
        this.showPlayerStatusWindowOnTimer();
        ContentDirect.UI.KeyboardFramework.set_focusedElement($('#forwardButton'));        
        extension.get_plugin().JumpForward(parseInt($.cd.getResourceValue('fast_forward_increment', '10')));
    },

    set_fullscreenMode: function (value) {
        this._fullscreenMode = value;
    },
    showPlayerStatusWindowOnTimer: function () {
        var extension = StorefrontInternalAPI.get_extension();
        clearInterval(extension.get_clearTimerVar());
		if (!extension.get_isControllerShown()) {
			extension.showPlayerStatusWindow();
		}
		// show for 5 seconds and then hide
		var timerInt = setTimeout(function () {
			extension.hidePlayerStatusWindow();
		}, 5000);
		extension.set_clearTimerVar(timerInt);
	},
	showPlayerStatusWindow: function () {
		StorefrontInternalAPI.get_extension().set_isControllerShown(true);
		// clear timer just in case
		clearInterval(StorefrontInternalAPI.get_extension().clearTimerVar);
		$('#playerStatusBar').show();
		$('#playerTitleBar').show();

		if ($('#playButton').is(':visible')) {
		    ContentDirect.UI.KeyboardFramework.set_focusedElement($('#playButton'));
		} else {
		    ContentDirect.UI.KeyboardFramework.set_focusedElement($('#pauseButton'));
		}			
	},
	hidePlayerStatusWindow: function () {
		StorefrontInternalAPI.get_extension().set_isControllerShown(false);
		// clear timer just in case
		clearInterval(StorefrontInternalAPI.get_extension().clearTimerVar);
		$('#playerStatusBar').hide();
		$('#playerTitleBar').hide();
	},
	initPlayer: function (data) {
		var extension = StorefrontInternalAPI.get_extension();
		// Samsung
		$('.main-container').hide();
		$.cd.log("initPlayer with content url:" + data.ContentURL + ", licenseServerUrl: " + extension.get_licenseServerUrl() + " ProgressSeconds: " + data.ProgressSeconds);
		var videoTag = "<object id='pluginPlayer' style='width:1280px;height:720px;' border=0 classid='clsid:SAMSUNG-INFOLINK-PLAYER'></object>";
		var playerContainerSelector = '#' + StorefrontInternalAPI._targetContainerId;
		$(playerContainerSelector).empty();
		$(playerContainerSelector).append(videoTag);

        if (null != data.LicenseRequestToken && data.LicenseRequestToken.length > 0) {
            $(playerContainerSelector).append('<object id="pluginObjectSef" style="width:1280px;height:720px;" border=0 classid="clsid:SAMSUNG-INFOLINK-SEF"></object>');
            this._playReadyPlugin = document.getElementById('pluginObjectSef');
        }
        this.showPlayerStatusWindow();
        extension.set_plugin(document.getElementById('pluginPlayer'));
        ContentDirect.UI.KeyboardFramework.set_selectorZone('#playerStatusBar');
        ContentDirect.UI.KeyboardFramework.enableKeyHandlerCallback();       
        this.setFullscreen();
        this.setPlayerEvents();
        this.playVideo(data);
	    // Disable the screen saver while playing content
        g_SamsungPluginAPI.setOffScreenSaver();
        $('#pluginPlayer').width('100%');
        $('#pluginPlayer').height('100%');
        $('#fancybox-content').css('height', '720px');
        $('#fancybox-content div').css('height', '720px');


    },
    setPlayerEvents: function () {
        var plugin = StorefrontInternalAPI.get_extension().get_plugin();
        plugin.OnCurrentPlayTime = 'StorefrontInternalAPI._extension.onCurrentPlayTime';
        plugin.OnStreamInfoReady = 'StorefrontInternalAPI._extension.onStreamInfoReady';
        plugin.OnBufferingStart = 'StorefrontInternalAPI._extension.onBufferingStart';
        plugin.OnBufferingProgress = 'StorefrontInternalAPI._extension.onBufferingProgress';
        plugin.OnBufferingComplete = 'StorefrontInternalAPI._extension.onBufferingComplete';
        plugin.OnConnectionFailed = 'StorefrontInternalAPI._extension.onConnectionFailed';
        plugin.OnNetworkDisconnected = 'StorefrontInternalAPI._extension.onNetworkDisconnected';
        plugin.OnRenderError = 'StorefrontInternalAPI._extension.onRenderError';
        plugin.OnRenderingComplete = 'StorefrontInternalAPI._extension.onRenderingComplete';
        plugin.OnStreamNotFound = 'StorefrontInternalAPI._extension.onStreamNotFound';
        plugin.OnSubtitle = 'StorefrontInternalAPI._extension.onSubtitle';
        plugin.OnEvent = 'StorefrontInternalAPI._extension.onEvent';
    },
    onEvent: function (event, param) {
        alert("onEvent");
        alert("event " + event);
    },
    changeScreenMode: function () {
        if (!StorefrontInternalAPI.get_extension().get_fullscreenMode()) {
            this.setFullscreen();
        }
        else {
            this.setNormalScreen();
        }
    },
    setFullscreen: function () {
        StorefrontInternalAPI.get_extension().get_plugin().SetDisplayArea(0, 0, 960, 540);
        $.cd.log("Full screen mode");
    },
    setNormalScreen: function () {
        var x = StorefrontInternalAPI._initParams.Left || 0;
        var y = StorefrontInternalAPI._initParams.Top || 0;
        var width = StorefrontInternalAPI._initParams.Width == 0 ? "800" : StorefrontInternalAPI._initParams.Width;
        var height = StorefrontInternalAPI._initParams.Height == 0 ? "450" : StorefrontInternalAPI._initParams.Height;
        $.cd.log("Normal screen mode: x=" + x + ", y=" + y + ", width=" + width + ", height= " + height);
        StorefrontInternalAPI.get_extension().get_plugin().SetDisplayArea(x, y, width, height);
        StorefrontInternalAPI.get_extension().set_fullscreenMode(false);
    },
    playVideo: function (viewProductContentData) {
        var extension = StorefrontInternalAPI.get_extension();
        var plugin = extension.get_plugin();
        if (typeof this._playReadyPlugin !== 'undefined') {
            $.cd.log("playready: " + viewProductContentData.ContentURL);
            
            plugin.InitPlayer(viewProductContentData.ContentURL + '|STARTBITRATE=CHECK'); //'http://cdfulltv.cdtv.lab/Argentina.mp4');//
            var customData = viewProductContentData.LicenseRequestToken;
            if (customData != null) {
                plugin.SetPlayerProperty(3, customData, customData.length);
            }
            var licenseServerUrl = extension.get_licenseServerUrl();
            if (licenseServerUrl != null) {
                plugin.SetPlayerProperty(4, licenseServerUrl, licenseServerUrl.length);
            }
            $.cd.log("customData: " + customData + ", License Server Url: " + licenseServerUrl);
        }
        else {
            $.cd.log("not playready!");
            plugin.InitPlayer(viewProductContentData.ContentURL);
        }
        StorefrontInternalAPI.attachPingSessionEvent();
        if (viewProductContentData.ProgressSeconds != null && viewProductContentData.ProgressSeconds != 0) {
            $.cd.log("Resume Play: " + viewProductContentData.ProgressSeconds);
            plugin.ResumePlay(viewProductContentData.ContentURL, viewProductContentData.ProgressSeconds);
        } else {
            plugin.StartPlayback();
        }
    },
    onSubtitle: function (text) {
        $.cd.log("Subtitle===============================: " + text);
        $('#videoDuration').html(text);
    },
    // Global functions called directly by the player when corresponding events are triggered
    onCurrentPlayTime: function (time) {
        var extension = StorefrontInternalAPI.get_extension();
        $.cd.log("In onCurrentPlayTime..." + time);
        var timePercent = (100 * time) / extension.get_plugin().GetDuration();
        $('#currentPlayTime').html(extension.formatTimeString(time))
        document.getElementById("progressBar").style.width = timePercent + "%";
        var precisionSecondsTime;
        if (time != 0) {
            var secondsTime = Math.floor(time / 1000);
            $.cd.log("Current time seconds: " + secondsTime);
            StorefrontInternalAPI._contentProgress = secondsTime;

            precisionSecondsTime = time / 1000
            $.cd.log("PRECISE TIME IN SECONDS: " + precisionSecondsTime);
        }
        $.cd.log("CAPTIONS CURRENTLY: " + StorefrontInternalAPI.get_captionsShowing().toString());
        // Only display captions if currently set by user
        if (StorefrontInternalAPI.get_captionsShowing()) {
            var captionData = StorefrontInternalAPI.get_captionData();
            if (captionData != null && precisionSecondsTime != null) {
                for (i = 0; i < captionData.times.length; i++) {

                    if (precisionSecondsTime >= captionData.times[i].start && precisionSecondsTime <= captionData.times[i].stop) {
                        $.cd.log("start: " + captionData.times[i].start + " end: " + captionData.times[i].stop);
                        $('#captionText').html(captionData.text[i]).show();
                        return;
                    }
                }
                $('#captionText').hide();
            } else {
                $('#captionText').hide();
            }
        }
    },
    onStreamInfoReady: function () {
        $.cd.log("In onStreamInfoReady...");
        var extension = StorefrontInternalAPI.get_extension();
        $('#videoDuration').html(extension.formatTimeString(extension.get_plugin().GetDuration()));
        $.cd.log("Out onStreamInfoReady...");
    },
    formatTimeString: function (millis) {
        var extension = StorefrontInternalAPI.get_extension();
        var hours = Math.floor(millis / 36e5),
        mins = Math.floor((millis % 36e5) / 6e4),
        secs = Math.floor((millis % 6e4) / 1000);
        return this.getTimeString(hours) + ":" + this.getTimeString(mins) + ":" + this.getTimeString(secs);
    },
    getTimeString: function (numValue) {
        var strVal = numValue.toString();
        if (strVal.length == 0) {
            return "00";
        } else if (strVal.length == 1) {
            return "0" + strVal;
        } else {
            return strVal;
        }
    },
    onBufferingStart: function () {
        $.cd.log("In Buffering starttttt...");
        //Show Loading Bar
        $.fancybox.showActivity();
        this.showPlayerStatusWindow();        
        $('[cdid=playstatus]').html($.cd.getCDResource("buffering")).show();
        $.cd.log("Out Buffering start...");
    },
    onBufferingProgress: function (percent) {
        $.cd.log("In Buffering:" + percent + "%");
        $.cd.log("Out Buffering:" + percent + "%");
    },
    onBufferingComplete: function () {
        $.cd.log("In Buffering Complete");
        $.fancybox.hideActivity();
        this.showPlayerStatusWindowOnTimer();
        $('[cdid=playstatus]').hide();
        $.cd.log("Out Buffering Complete");
    },
    onConnectionFailed: function () {
        $.cd.log("In onConnectionFailed...");
        $.cd.showModalMessageTV($.cd.getResourceValue('player_connection_failed', 'Failed to connect to server.  Please try again later'));
        this.handleStopAction();        
    },
    onNetworkDisconnected: function () {
        $.cd.log("In onNetworkDisconnected...");        
        $.cd.showModalMessageTV($.cd.getResourceValue('no_network_connection', 'There seems to be an issue with your internet connection.  Please address it and try again.'));
        this.handleStopAction();
        $.cd.log("Out onNetworkDisconnected...");
    },
    onRenderError: function (num) {
        $.cd.log("In onRenderError type : " + num);
        $.cd.showModalMessageTV($.cd.getResourceValue('player_render_error', 'Error rendering the file.  Please try again later.'));
        this.handleStopAction();        
        $.cd.log("Out onRenderError type : " + num);
    },
    onRenderingComplete: function () {
        this.handleStopAction();
        $.cd.log("Out onRenderingComplete");
    },
    onStreamNotFound: function () {
        $.cd.log("In Stream Not Found");
        $.cd.showModalMessageTV($.cd.getResourceValue('player_stream_not_found', 'The requested stream was not found.'));
        this.handleStopAction();        
        $.cd.log("Out Stream Not Found");
    }
};
//---------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------
//LG Netcast Player Extension
//---------------------------------------------------------------------------------------------
ContentDirect.UI.Storefront.LG = function () {
	this.Type = "LG";
	this._plugin = null;
	this._url = null;
	this._licenseRequestToken = null;
	this._playReadyPlugin = null;
	this._playTimer = null;
	this._licenseServerUrl = "";
	this._fullscreenMode = false;
	this._jsonData = null;
	this.TOTAL_BUFFER_SIZE_IN_BYTES = 50 * 1024 * 1024;
	this.INITIAL_BUFFERPER_CENT = 40;
	this.PENDING_BUFFER_PERCENT = 35;
	this.clearTimerVar = null;
	this._mouseEventTimerId = null;
	this._resumePlayback = false;
	this._progressSeconds = 0;
	this._playSpeed = 1;
	this._isControllerShown = false;
	this._subtitleUrl = "";
	this._playerState = null;
};

ContentDirect.UI.Storefront.LG.prototype = {
	embedApplication: function (s) {
		if (null != StorefrontInternalAPI._initParams.SourceUrl && StorefrontInternalAPI._initParams.SourceUrl.length > 0) {
			var videoData = JSON.parse(decodeURIComponent(StorefrontInternalAPI._initParams.viewproductcontentjson));
			var data = { ContentURL: StorefrontInternalAPI._initParams.SourceUrl, ProgressSeconds: videoData.ProgressSeconds };
			this.initPlayer(data);
		}
		else if (null != StorefrontInternalAPI._initParams.viewproductcontentjson && StorefrontInternalAPI._initParams.viewproductcontentjson.length > 0) {
			$.cd.log(StorefrontInternalAPI._initParams.LicenseServerUrl);
			this._licenseServerUrl = StorefrontInternalAPI._initParams.LicenseServerUrl || null;
			if (null !== this._licenseServerUrl) {
				this._licenseServerUrl += "/PlayReadyRightsManager.asmx";
			}

			var data = JSON.parse(decodeURIComponent(StorefrontInternalAPI._initParams.viewproductcontentjson));
			this.initPlayer(data);
		}
		else {
			$.cd.knownRequest(ContentDirect.UI.Request.ViewProductContent, "productId=" + StorefrontInternalAPI._initParams.ProductIdToPlay
																		 + "&pripId=" + StorefrontInternalAPI._initParams.PricingPlanIdToPlay
																	   + "&ssoToken=" + StorefrontInternalAPI._initParams.SsoToken + "&log=" + StorefrontInternalAPI._initParams.Login,
				  $('#' + StorefrontInternalAPI._targetContainerId).attr("initParams"),
				  function (data) {
				  	this.initPlayer(data);
				  },
				  function (error) {
				  	StorefrontScriptAPI.EventOccured("Error", "LG", error.data.Message);
				  }
			  );
		};
	},
	get_jsonData: function () {
		return this._jsonData;
	},
	set_playTimer: function (value) {
		if (null != this._playTimer) {
			clearInterval(this._playTimer);
			this._playTimer = null;
		}
		this._playTimer = value;
	},
	get_mouseEventTimerId: function () {
		return this._mouseEventTimerId;
	},
	set_mouseEventTimerId: function (value) {
		this._mouseEventTimerId = value;
	},
	get_isControllerShown: function () {
		return this._isControllerShown;
	},
	set_isControllerShown: function (value) {
		this._isControllerShown = value;
	},
	get_playSpeed: function () {
		return this._playSpeed;
	},
	set_playSpeed: function (value) {
		this._playSpeed = value;
	},
	get_playTimer: function () {
		return this._playTimer;
	},
	get_plugin: function () {
		return this._plugin;
	},
	get_fullscreenMode: function () {
		return this._fullscreenMode;
	},
	get_ResumePlayback: function () {
		return this._resumePlayback;
	},
	set_ResumePlayback: function (value) {
		this._resumePlayback = value;
	},
	get_ProgressSeconds: function () {
		return this._progressSeconds;
	},
	set_ProgressSeconds: function (value) {
		this._progressSeconds = value;
	},
	get_SubtitleUrl: function () {
		return this._subtitleUrl;
	},
	set_SubtitleUrl: function (value) {
		this._subtitleUrl = value;
	},
	set_fullscreenMode: function (value) {
		this._fullscreenMode = value;
	},
	get_clearTimerVar: function () {
		return this._clearTimerVar;
	},
	set_clearTimerVar: function (value) {
		this._clearTimerVar = value;
	},
	showPlayerStatusWindow: function () {
		// clear timer just in case
		clearInterval(clearTimerVar);
		$('#playerStatusBar').show();
		$('#playerTitleBar').show();
	},
	hidePlayerStatusWindow: function () {
		// clear timer just in case
		clearInterval(clearTimerVar);
		$('#playerStatusBar').hide();
		$('#playerTitleBar').hide();
	},
	initPlayer: function (data) {
		this._jsonData = data;
		var substitlesUrl = null;
		if (data.Markers != null && data.Markers.length > 0 && data.Markers[0].ExternalConfiguration != null && data.Markers[0].ExternalConfiguration.Fields != null &&
            data.Markers[0].ExternalConfiguration.Fields.length > 0) {
		    substitlesUrl = data.Markers[0].ExternalConfiguration.Fields[0].FieldValue;
			$('#closedCaptionsButton').show();
		}
		$.cd.log("initPlayer with content url:" + data.ContentURL + ", licenseServerUrl: " + this._licenseServerUrl + " ProgressSeconds: " + data.ProgressSeconds + " Subtitles file: " + substitlesUrl);
		//var videoTag = '<object type="application/vnd.ms-sstr+xml"  width="100%" height="100%" id="pluginPlayer"></object>';
		var playerContainerSelector = '#' + StorefrontInternalAPI._targetContainerId;
		$(playerContainerSelector).empty();
		//$(playerContainerSelector).append($('#pluginPlayer'));
		if (typeof data.LicenseRequestToken !== 'undefined' && null != data.LicenseRequestToken && data.LicenseRequestToken.length > 0) {
			//$(playerContainerSelector).append('<object type="application/oipfDrmAgent" id="drmAgent" width="0" height="0"></object>');
			this._playReadyPlugin = document.getElementById('drmAgent');
		}
		this._plugin = document.getElementById('pluginPlayer');
		if (substitlesUrl != null) {
		    this._plugin.subtitle = substitlesUrl;
		    this.set_SubtitleUrl(substitlesUrl);
		}
		this._plugin.subtitleOn = false;
		ContentDirect.UI.KeyboardFramework.enableKeyHandlerCallback();
		ContentDirect.UI.KeyboardFramework.set_selectorZone('#playerStatusBar');
		ContentDirect.UI.KeyboardFramework.set_focusedElement($('#pauseButton'));

		this.setPlayerEvents();
		this.playVideo(data);
		this.showPlayerStatusWindowOnTimer();
		$('#playerContainer').show();

		$('#pluginPlayer').show();

		$('#playerContainer').css('width', '1280px');
		$('#playerContainer').css('height', '720px');

		$('#fancybox-content').css('width', '1280px');
		$('#fancybox-content div').css('width', '1280px');
		$('#fancybox-content').css('height', '720px');
		$('#fancybox-content div').css('height', '720px');
	},
	showPlayerStatusWindowOnTimer: function () {		
		var extension = StorefrontInternalAPI.get_extension();
		clearInterval(extension.get_clearTimerVar());
		if (!extension.get_isControllerShown()) {
			extension.showPlayerStatusWindow();
		}
		// show for 5 seconds and then hide
		var timerInt = setTimeout(function () {
			extension.hidePlayerStatusWindow();
		}, 5000);
		extension.set_clearTimerVar(timerInt);
	},
	showPlayerStatusWindow: function () {
		$.cd.log("SHOW CONTROLLER");
		StorefrontInternalAPI.get_extension().set_isControllerShown(true);
		// clear timer just in case
		clearInterval(StorefrontInternalAPI.get_extension().clearTimerVar);
		$('#playerStatusBar').show();
		$('#playerTitleBar').show();		
	},
	hidePlayerStatusWindow: function () {
		$.cd.log("HIDE CONTROLLER");
		StorefrontInternalAPI.get_extension().set_isControllerShown(false);
		// clear timer just in case
		clearInterval(StorefrontInternalAPI.get_extension().clearTimerVar);
		$('#playerStatusBar').hide();
		$('#playerTitleBar').hide();
	},
	onMouseMoved: function (evt) {
		window.clearInterval(StorefrontInternalAPI.get_extension().get_mouseEventTimerId());
		StorefrontInternalAPI.get_extension().showPlayerStatusWindowOnTimer();
	},
	addMouseMoveEvent: function () {
		$(document).bind("mousemove", StorefrontInternalAPI.get_extension().onMouseMoved);
	},
	removeMouseMoveEvent: function () {
		$(document).unbind("mousemove", StorefrontInternalAPI.get_extension().onMouseMoved);
	},
	setPlayerEvents: function () {
		var extension = StorefrontInternalAPI.get_extension();
		this._plugin.onPlayStateChange = extension.onPlayStateChange;
		this._plugin.onBuffering = extension.onBufferingStateChange;
		this._plugin.onReadyStateChange = extension.onReadyStateChange;
		this._plugin.onError = extension.onError;
		extension.addMouseMoveEvent();
	},
	changeScreenMode: function () {
		if (!StorefrontInternalAPI.get_extension().get_fullscreenMode()) {
			StorefrontInternalAPI.get_extension().setFullscreen();
		}
		else {
			StorefrontInternalAPI.get_extension().setNormalScreen();
		}
	},
	setFullscreen: function () {
		StorefrontInternalAPI.get_extension().get_plugin().SetDisplayArea(0, 0, 960, 540);
		StorefrontInternalAPI.get_extension().set_fullscreenMode(true);
		$.cd.log("Full screen mode");
	},
	setNormalScreen: function () {
		var x = StorefrontInternalAPI._initParams.Left || 0;
		var y = StorefrontInternalAPI._initParams.Top || 0;
		var width = StorefrontInternalAPI._initParams.Width == 0 ? "800" : StorefrontInternalAPI._initParams.Width;
		var height = StorefrontInternalAPI._initParams.Height == 0 ? "450" : StorefrontInternalAPI._initParams.Height;
		$.cd.log("Normal screen mode: x=" + x + ", y=" + y + ", width=" + width + ", height= " + height);
		StorefrontInternalAPI.get_extension().get_plugin().SetDisplayArea(x, y, width, height);
		StorefrontInternalAPI.get_extension().set_fullscreenMode(false);
	},
	setVolume: function (delta) {
		var currentVolume = StorefrontInternalAPI.get_extension().get_plugin().GetVolume();
		StorefrontInternalAPI.get_extension().get_plugin().SetVolumeWithKey(currentVolume + delta);
		$.cd.log("New Volume: " + currentVolume + delta);
	},
	playVideo: function (viewProductContentData) {
		this._url = viewProductContentData.ContentURL;
		var progressSeconds = null != viewProductContentData.ProgressSeconds ? viewProductContentData.ProgressSeconds : 0;
		if (progressSeconds > 0) {
			// Save the number in milliseconds
			this.set_ProgressSeconds(progressSeconds * 1000);
			$.cd.log("Progress seconds set: " + this.get_ProgressSeconds());
			this.set_ResumePlayback(true);
		} else {
			this.set_ProgressSeconds(0);
			this.set_ResumePlayback(false);
		}
		if (viewProductContentData.LicenseRequestToken !== 'undefined' 
            && null != viewProductContentData.LicenseRequestToken 
            && viewProductContentData.LicenseRequestToken.length > 0) {
		    var msgType = "application/vnd.ms-playready.initiator+xml";
		    this._licenseRequestToken = viewProductContentData.LicenseRequestToken;
			var xmlLicenceAcquisition =
				  '<?xml version="1.0" encoding="utf-8"?>' +
				  '<PlayReadyInitiator xmlns="http://schemas.microsoft.com/DRM/2007/03/protocols/">' +
					'<LicenseServerUriOverride>' +
					  '<LA_URL>' + this._licenseServerUrl + '</LA_URL>' +
					'</LicenseServerUriOverride>' +
					'<SetCustomData>' +
					  '<CustomData>' + viewProductContentData.LicenseRequestToken + '</CustomData>' +
					'</SetCustomData>' +
				  '</PlayReadyInitiator>';
			var DRMSysID = "urn:dvb:casystemid:19219";
			this._playReadyPlugin.onDRMMessageResult = StorefrontInternalAPI.get_extension().handleOnDRMMessageResult;
			this._playReadyPlugin.onDRMRightsError = StorefrontInternalAPI.get_extension().handleOnDRMRightsError;
			$.cd.log('before send drm');
		    try {		     
		        this._playReadyPlugin.sendDRMMessage(msgType, xmlLicenceAcquisition, DRMSysID);
		    } catch (err) {
		        // Retry again
		        //this._playReadyPlugin.sendDRMMessage(msgType, xmlLicenceAcquisition, DRMSysID);
		        $.cd.log(err.message);
		    }
			$.cd.log("customData: " + viewProductContentData.LicenseRequestToken + ", License Server Url: " + this._licenseServerUrl);
		}
		else {
		    this._plugin['data'] = this._url;
		    $('#playButton').hide();
		    $('#pauseButton').show();
			this._plugin.play(1);
			this.set_playSpeed(1);
			StorefrontInternalAPI.attachPingSessionEvent();
			var extension = StorefrontInternalAPI.get_extension();
			this.getVideoPlayInfo();
		}
	},

	handleOnDRMMessageResult: function (msgId, resultMsg, resultCode) {
	    $.cd.log("handleOnDRMMessageResult= msgId: " + msgId + " resultMsg: " + resultMsg + " resultCode: " + resultCode);
		var extension = StorefrontInternalAPI.get_extension();
		if (resultCode == 0) {
		    $('#playButton').hide();
		    $('#pauseButton').show();
			extension.get_plugin().data = StorefrontInternalAPI.get_extension()._url;
			extension.get_plugin().play(1);
			StorefrontInternalAPI.attachPingSessionEvent();
			this.set_playSpeed(1);
		}
		else {
			$.cd.log("Download failed. Error:" + resultCode);
		}
	},
	handleOnDRMRightsError: function (errorState, contentID, DRMSystemID, rightsIssuerURL) {
	    alert(errorState);
		if (errorState == 0) {
			$.cd.log('no license');
		}
		else if (errorState == 1) {
			$.cd.log('invalid license');
		}
		$.cd.log("HandleOnDRMRightsError errorState:" + errorState + "contentID:" + contentID + " DRMSystemID: " + DRMSystemID +
		" rightsIssuerURL: " + rightsIssuerURL);
		this.handleStopAction();
	},
	onError: function (errorState) {	    
	    this.handleStopAction();
	},
	handlePlayAction: function () {
		// If video is already showing		
	    StorefrontInternalAPI.get_extension().showPlayerStatusWindowOnTimer();
	    ContentDirect.UI.KeyboardFramework.set_focusedElement($('#pauseButton'));
		StorefrontInternalAPI.get_extension().get_plugin().play(1);
	},
	handlePauseAction: function () {		
	    StorefrontInternalAPI.get_extension().showPlayerStatusWindowOnTimer();
	    $('#pauseButton').hide();
	    $('#playButton').show();
	    ContentDirect.UI.KeyboardFramework.set_focusedElement($('#playButton'));
		StorefrontInternalAPI.get_extension().get_plugin().play(0);
	},
	handleStopAction: function () {
	    $.cd.log("STOP Requested");
	    //alert('stop requested');
	    var plugin = StorefrontInternalAPI.get_extension().get_plugin();
	   // alert('remove mouse event');
	    StorefrontInternalAPI.get_extension().removeMouseMoveEvent();
	    //alert('hide player status window');
		StorefrontInternalAPI.get_extension().hidePlayerStatusWindow();
		if (plugin != null && typeof plugin.play === 'function') {
		    try {
		        //alert('attempt to stop plugin');
		        plugin.play(0);
		        StorefrontInternalAPI.get_extension().onStopState();
		    } catch (err) {
		        alert(err.message);
		    }
		}
		StorefrontInternalAPI.removePingSessionEvent();
		ContentDirect.UI.KeyboardFramework.set_selectorZone('#contentWrapper');
		ContentDirectAPI.findElementToFocusOn();        
	},
	handleClosedCaptionAction: function () {
	    var extension = StorefrontInternalAPI.get_extension();
	    extension.showPlayerStatusWindowOnTimer();
	    setTimeout(function () {
	        ContentDirect.UI.KeyboardFramework.set_focusedElement($('#closedCaptionsButton'));
	    }, 50);
		if (extension.get_plugin().subtitleOn) {
			extension.get_plugin().subtitleOn = false;
			$('[cdid=playstatus]').html($.cd.getResourceValue('subtitles_off_message', 'Subtitles Off')).show();
		} else {
			extension.get_plugin().subtitle = extension.get_SubtitleUrl();
			extension.get_plugin().subtitleOn = true;
			$('[cdid=playstatus]').html($.cd.getResourceValue('subtitles_on_message', 'Subtitles On')).show();
		}
	},
	handlePlaybackChange: function (action) {
		$.cd.log("handlePlaybackChange: " + action);
		var playSpeed = this.get_playSpeed();
		var playbackText = "";
		var extension = StorefrontInternalAPI.get_extension();
		if (action == 'rewind') {
			switch (playSpeed) {
				// Normal Play
				case 1:
					extension.set_playSpeed(-2);
					playbackText = $.cd.getCDResource('playback_rw_2x', '2X');
					break;
				case 2:
					extension.set_playSpeed(1);
					extension.showPlayerStatusWindowOnTimer();
					break;
				case 4:
					extension.set_playSpeed(2);
					playbackText = $.cd.getCDResource('playback_ff_2x', '2X');
					break;
				case 8:
					extension.set_playSpeed(4);
					playbackText = $.cd.getCDResource('playback_ff_4x', '4X');
					break;
				case -2:
					extension.set_playSpeed(-4);
					playbackText = $.cd.getCDResource('playback_rw_4x', '4X');
					break;
				case -4:
					extension.set_playSpeed(-8);
					playbackText = $.cd.getCDResource('playback_rw_8x', '8X');
					break;
				case -8:
					extension.set_playSpeed(1);
					extension.showPlayerStatusWindowOnTimer();
					break;
			}
		} else {
			switch (playSpeed) {
				// Normal Play
				case 1:
					extension.set_playSpeed(2);
					playbackText = $.cd.getCDResource('playback_ff_2x', '2X');
					break;
				case 2:
					extension.set_playSpeed(4);
					playbackText = $.cd.getCDResource('playback_ff_4x', '4X');
					break;
				case 4:
					extension.set_playSpeed(8);
					playbackText = $.cd.getCDResource('playback_ff_8x', '8X');
					break;
				case 8:
					extension.set_playSpeed(1);
					extension.showPlayerStatusWindowOnTimer();
					break;
				case -2:
					extension.set_playSpeed(1);
					extension.showPlayerStatusWindowOnTimer();
					break;
				case -4:
					extension.set_playSpeed(-2);
					playbackText = $.cd.getCDResource('playback_rw_2x', '2X');
					break;
				case -8:
					extension.set_playSpeed(-4);
					playbackText = $.cd.getCDResource('playback_rw_4x', '4X');
					break;
			}
		}
		$.cd.log("setting playback speed: " + extension.get_playSpeed() + " text: " + playbackText);
		$('[cdid=playbackspeed]').html(playbackText).show();
		var plugIn = extension.get_plugin();
		plugIn.play(extension.get_playSpeed());
	},
	handleSkipBackwardAction: function() {
	    $.cd.log("Skip backward Requested");	    
	    StorefrontInternalAPI.get_extension().showPlayerStatusWindow();
	    setTimeout(function () {
	        ContentDirect.UI.KeyboardFramework.set_focusedElement($('#skipBackwardButton'));
	    }, 100);
	    var plugIn = StorefrontInternalAPI.get_extension().get_plugin();
	    var playInfo = plugIn.mediaPlayInfo();
	    var rewindTime = parseInt($.cd.getResourceValue('skip_backward_increment', '300000'));
	    var time = playInfo.currentPosition > rewindTime ? playInfo.currentPosition - rewindTime : 0;
	    plugIn.seek(time);
	    //StorefrontInternalAPI.get_extension().get_plugin().play(0);
	}, 
	handleRewindAction: function () {
		$.cd.log("REWIND Requested");		
		StorefrontInternalAPI.get_extension().showPlayerStatusWindow();
		setTimeout(function () {
		    ContentDirect.UI.KeyboardFramework.set_focusedElement($('#rewindButton'));
		}, 100);
		var plugIn = StorefrontInternalAPI.get_extension().get_plugin();
		var playInfo = plugIn.mediaPlayInfo();
		var rewindTime = parseInt($.cd.getResourceValue('rewind_increment', '10000'));
		var time = playInfo.currentPosition > rewindTime ? playInfo.currentPosition - rewindTime : 0;
		plugIn.seek(time);
		//StorefrontInternalAPI.get_extension().get_plugin().play(0);
	},
	handleSkipForwardAction: function () {
	    $.cd.log("Skip forward Requested");	    
	    StorefrontInternalAPI.get_extension().showPlayerStatusWindow();
	    setTimeout(function () {
	        ContentDirect.UI.KeyboardFramework.set_focusedElement($('#skipForwardButton'));
	    }, 100);
	    var plugIn = StorefrontInternalAPI.get_extension().get_plugin();
	    var playInfo = plugIn.mediaPlayInfo();
	    var time = playInfo.currentPosition + parseInt($.cd.getResourceValue('skip_forward_increment', '300000'));
	    plugIn.seek(time);
	    //StorefrontInternalAPI.get_extension().get_plugin().play(0);
    },
	handleFastForwardAction: function () {
		$.cd.log("FAST FORWARD Requested");		
		StorefrontInternalAPI.get_extension().showPlayerStatusWindow();
		setTimeout(function () {
		    ContentDirect.UI.KeyboardFramework.set_focusedElement($('#forwardButton'));
		}, 100);
		var plugIn = StorefrontInternalAPI.get_extension().get_plugin();
		var playInfo = plugIn.mediaPlayInfo();
		var time = playInfo.currentPosition + parseInt($.cd.getResourceValue('fast_forward_increment', '10000'));
		plugIn.seek(time);
		//StorefrontInternalAPI.get_extension().get_plugin().play(0);
	},
	formatTimeString: function (millis) {
		var hours = Math.floor(millis / 36e5),
        mins = Math.floor((millis % 36e5) / 6e4),
        secs = Math.floor((millis % 6e4) / 1000);
		return StorefrontInternalAPI.get_extension().getTimeString(hours) + ":" + StorefrontInternalAPI.get_extension().getTimeString(mins) + ":" + StorefrontInternalAPI.get_extension().getTimeString(secs);
	},
	getTimeString: function (numValue) {
		var strVal = numValue.toString();
		if (strVal.length == 0) {
			return "00";
		} else if (strVal.length == 1) {
			return "0" + strVal;
		} else {
			return strVal;
		}
	},
	onReadyStateChange: function () {
		var plugIn = StorefrontInternalAPI.get_extension().get_plugin();
		$.cd.log("ReadyState Changed: " + plugIn.readyState);
	},
	onPlayStateChange: function () {
		var extension = StorefrontInternalAPI.get_extension();
		var plugIn = extension.get_plugin();
		var mediaInfo = plugIn.mediaPlayInfo();
		if (null == plugIn) {
			$.cd.log("PlayState Changed To State: No more stream");
			clearInterval(extension.get_playTimer());
		}

		$.cd.log("PlayState Changed To State: " + plugIn.playState);
		$('[cdid=playbackspeed]').html('');
		$('[cdid=playstatus]').hide();
		switch (plugIn.playState) {
			case 0://Stop	
				extension.onStopState();
				break;
		    case 1://Playing
		        // Hide spinner
		        $.fancybox.hideActivity();
		        extension.showPlayerStatusWindowOnTimer();
		        $('#playButton').hide();
		        $('#pauseButton').show();
		        setTimeout(function () {
		            ContentDirect.UI.KeyboardFramework.set_focusedElement($('#pauseButton'));
		        }, 100);
				$.cd.log("get_ResumePlayback(): " + extension.get_ResumePlayback());
				var progressSeconds = extension.get_ProgressSeconds();
				if (extension.get_ResumePlayback() && progressSeconds > 0) {
					$.cd.log("resume seconds: " + progressSeconds);
					plugIn.seek(progressSeconds);
					extension.set_ResumePlayback(false);
					extension.set_ProgressSeconds(0);
				}
				if (extension.get_playTimer() == null) {
					var timerId = setInterval(extension.onCurrentPlayTime, 1000);
					extension.set_playTimer(timerId);
				}
				break;
			case 2://Paused
			    			
				break;
			case 3://Connecting
			case 4://Buffering
			    extension.onBufferingState(mediaInfo.currentPosition);
				break;
			case 5://Finished	
				extension.onStopState();
				break;
			case 6://Error				
			    extension.onStopState();
				break;
		}    
	},
	onBufferingState: function (time) {
		var isStillLoading = time < 5000;
		var statusResource = !isStillLoading ? $.cd.getCDResource("buffering") : $.cd.getCDResource("loading");
		StorefrontInternalAPI.get_extension().showPlayerStatusWindowOnTimer();
	    //Show spinner
		$.fancybox.showActivity();
		StorefrontInternalAPI.get_extension().showPlayerStatusWindow();
		$('[cdid=playstatus]').html(statusResource).show();
	},
	onStopState: function () {
		StorefrontInternalAPI.removePingSessionEvent();
		var extension = StorefrontInternalAPI.get_extension();
		var plugIn = extension.get_plugin();
		extension.removeMouseMoveEvent();

		clearInterval(StorefrontInternalAPI.get_extension().get_playTimer());
		var percentWatched = parseInt(document.getElementById("progressBar").style.width.replace('%', ''));
		if (percentWatched >= parseInt($.cd.getResourceValue('viewing_completed_threshold_tv', "90"))) {
			$.cd.log('playerModalClosed completed');
			ContentDirectAPI._playerModalClosed(true, true);
		} else {
			$.cd.log('playerModalClosed not completed');
			ContentDirectAPI._playerModalClosed(false, true);
		}
		$('#currentPlayTime').html('');
		$("#progressBar").css("width", "0%");
		$('#videoDuration').html('');
		ContentDirectAPI._isModalClosed = true;
		$('#pluginPlayer').hide();
		$.cd.hideModal();
	},
	onCurrentPlayTime: function () {
		var extension = StorefrontInternalAPI.get_extension();
		var playInfo = extension.get_plugin().mediaPlayInfo();
		$('#currentPlayTime').html(extension.formatTimeString(playInfo.currentPosition));
		$('#videoDuration').html(extension.formatTimeString(playInfo.duration));
		var timePercent = (100 * playInfo.currentPosition) / playInfo.duration;
		$("#progressBar").css("width", timePercent + "%");
		StorefrontInternalAPI._contentProgress = Math.floor(playInfo.currentPosition / 1000);
	},
	onBufferingStateChange: function (isStarted) {
	}
};
//---------------------------------------------------------------------------------------------


function getElementWithAttribute(attribute, optionalMatchingValue) {
	var matchingElements = [];
	var allElements = document.getElementsByTagName('*');
	for (var i = 0; i < allElements.length; i++) {
		var foundAttrValue = allElements[i].getAttribute(attribute);
		if (!foundAttrValue)
			foundAttrValue = allElements[i].getAttribute(attribute.toLowerCase());

		if (foundAttrValue) {
			// Element exists with attribute. Add to array.
			if (typeof optionalMatchingValue != 'undefined' && null != optionalMatchingValue) {
				if (foundAttrValue == optionalMatchingValue) {
					matchingElements.push(allElements[i]);
					return matchingElements;
				}
			}
			else
				matchingElements.push(allElements[i]);
		}
	}
	return matchingElements;
}

$(document).ready(function () {
	var type, containerId;
	if (typeof $ != 'undefined' && typeof $.cd != 'undefined') {
		var cdInfo = $.cd.get_containerInfo();
		var dlmElement = getElementWithAttribute("cdType", "sdlm");
		if ((cdInfo.type == 'sp' || cdInfo.type.toLowerCase().search('sp') == 0) && dlmElement.length == 0) {
			type = cdInfo.type;
			containerId = cdInfo.containerId;
			StorefrontInternalAPI = new ContentDirect.UI.Storefront(containerId, type);
			StorefrontScriptAPI = new ContentDirect.UI.Storefront.ClientAPI();
			StorefrontInternalAPI.initialize();
		}
	}
	else {
		var cdContainer = getElementWithAttribute("cdType", "sp");
		if (cdContainer.length == 0)
			cdContainer = document.getElementById("__StorefrontContainer");
		if (!cdContainer) {
			$.cd.log("There must be at least one CD container");
			return;
		}
		else {
			type = null != cdContainer[0].getAttribute("player") ? cdContainer[0].getAttribute("player") : "sps";
			containerId = cdContainer[0].getAttribute("id");
		}
		StorefrontInternalAPI = new ContentDirect.UI.Storefront(containerId, type);
		StorefrontScriptAPI = new ContentDirect.UI.Storefront.ClientAPI();
		StorefrontInternalAPI.initialize();
	}

});