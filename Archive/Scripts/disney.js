// System specific values
var ENV_SBX = {
    SystemId: "02c62e64-6528-49e1-8800-8b52a97274a6",
    ChannelId: "e777708b-f758-4d91-aaec-170755b9ed7e",
    MetadataURL: "http://metadata.sbx1.cdops.net",
    MetadataURLHTTPS: "https://metadata.sbx1.cdops.net",
    ServiceURL: "https://services.sbx1.cdops.net",
    PlayerVersion: "v6.0.DSP.1",
    PlayerServer: "https://app.contentdirect.tv/Storefront/",
    cdServer: "https://disney.sbx1.cdops.net"
    //PlayerServer: "https://cdn.contentdirect.tv/Dev/"
};

var env = ENV_SBX;

$.cd.beforeInitialize(function () {	
	//Define HTML Player Version
   //$.cd.set_htmlPlayerVersion("v15.3.1.4");
   $.cd.set_htmlPlayerVersion("v15.3.1.4");
   //$.cd.set_htmlPlayerVersion("2.1.1");
   //Define Player CDN Location
   $.cd.set_htmlPlayerServer(env.PlayerServer);
   //Define Silverlight Player Version
   $.cd.set_playerVersion(env.PlayerVersion); 
   
  // Set resources to HTTPS
  // Host Storefront.SP.config.js and plugin.js locally
	ContentDirect.UI.Resources.SPS.production[0].fileUrl = "https://" + clientUrl + "Scripts/Storefront.SP.config.js";
	ContentDirect.UI.Resources.SPS.debug[0].fileUrl = "https://" + clientUrl + "Scripts/Storefront.SP.config.js";
	ContentDirect.UI.Resources.SPS.production[1].fileUrl = "https://disney.sbx1.cdops.net/sl/player/" + env.PlayerVersion + "/Scripts/Silverlight.js";
	ContentDirect.UI.Resources.SPS.debug[1].fileUrl = "https://disney.sbx1.cdops.net/sl/player/" + env.PlayerVersion + "/Scripts/Silverlight.debug.js";
	ContentDirect.UI.Resources.SPS.debug[2].fileUrl = "https://" + clientUrl + "Scripts/plugin.js";
	ContentDirect.UI.Resources.SPS.production[2].fileUrl = "https://" + clientUrl + "Scripts/plugin.js";
	
	
});

$.cd.flexUIReady(function(){
	//ContentDirectAPI._PLAYER_PARAM = "LicenseServerUrl={serverUrl},subscriberid={subId},viewproductcontentjson={initJson},SourceUrl={sourceUrl},SessionId={sessionId},SystemId={systemId},WindowlessMode={windowlessMode},ChannelId={channelId},DeviceType={deviceType},ProductName={productName},LogoImageURL={logoImageUrl},ServerLocation=https://disney.sbx1.cdops.net/sl/player/v6.0.DSP.1/,StorefrontLocation=https://disney.sbx1.cdops.net/,PlayerLayoutTypeCode=5,Width=0,Height=0,PlayerSkinTypeCode=1,Language={language},DelayLoadPlayer={delayLoad},PreloadBackgroundImageURL={preloadBackgroundImageURL},DelayLoadPlayerImageUrl={delayLoadPlayerImageUrl},XapLocation=https://app.contentdirect.tv/Storefront/SL/SP/v6.0.DSP.1/ContentDirect.UI.Storefront.Player.xap,ProductIdToPlay={productIdToPlay},PricingPlanIdToPlay={pricingPlanIdToPlay},AutoPlay={autoPlay},Login={login},ConvivaCustomerId={convivaId},AutoDowngradeOutputProtectionFailure={autoDowngrade},LeaveControllerVisible=1,DeliveryCapabilityId={deliveryCapabilityId},PrerollUrl={prerollUrl},PrerollMax={prerollMax},NonSilverlightImageURL={NonSilverlightImageURL},IsRelatedContent={IsRelatedContent},IsLiveContent={IsLiveContent},SubtitleFile={SubtitleFile},IsCompactMode=false,jsonserviceurl=https://services.sbx1.cdops.net/Subscriber,metadataserviceurl=https://metadata.sxb1.cdops.net";
	ContentDirectAPI.createPlayerParams = function (initJson, sourceUrl, sessionId, productId, pricingPlanId, productName, isSecure, deliveryCapabilityId, imageUrl, prerollUrl, prerollMax, isContent, isLive, playerLocation, subId, licenseServerUrl, subtitleFile) {
		if (typeof playerLocation === 'undefined') {
			var playerInfo = $.cd.get_browserInfo().getPlayerInfoBasedOnContentUrl("");
			playerLocation = playerInfo.location;
		}
		var initParams = String(this._PLAYER_PARAM).replace('{sessionId}', sessionId || "");
		initParams = initParams.replace('{initJson}', initJson || "");
		initParams = initParams.replace('{sourceUrl}', sourceUrl || "");
		initParams = initParams.replace('{systemId}', this._initParams.SystemId);
		initParams = initParams.replace("{channelId}", this._initParams.ChannelId);
		initParams = initParams.replace('{deviceType}', $.cd.get_browserInfo().type);
		initParams = initParams.replace("{logoImageUrl}", this._initParams.LogoImageUrl || "");
		initParams = initParams.replace("{storefrontLocation}", !isSecure ? this._storefrontLocation.replace("https", "http") : this._storefrontLocation);
		initParams = initParams.replace("{language}", this._initParams.Language);
		initParams = initParams.replace("{delayLoad}", this._initParams.delayLoad || 0);
		initParams = initParams.replace("{windowlessMode}", $.cd.get_browserInfo().browser == "Firefox" ? "" : 'transparent');
		initParams = initParams.replace("{preloadBackgroundImageURL}", null != imageUrl ? imageUrl.replace("https", "http") || "" : "");
		initParams = initParams.replace("{delayLoadPlayerImageUrl}", this._initParams.delayLoadPlayerImageUrl || "");
		initParams = initParams.replace("{xapLocation}", typeof playerLocation !== 'undefined' ? $.cd.getPlayerUrl(playerLocation, false) : "");
		initParams = initParams.replace("{serverLocation}", typeof playerLocation !== 'undefined' ? $.cd.getPlayerUrl(playerLocation, false) + "/" : "/");
		initParams = initParams.replace("{productIdToPlay}", productId || "");
		initParams = initParams.replace("{pricingPlanIdToPlay}", pricingPlanId || "");
		initParams = initParams.replace("{autoPlay}", this._initParams.autoPlay || 1);
		initParams = initParams.replace("{login}", this.get_loginInfo().userName || "aaaaaa8");
		initParams = initParams.replace("{convivaId}", this._initParams.ConvivaCustomerId || "");
		initParams = initParams.replace("{productName}", productName || "");
		initParams = initParams.replace("{autoDowngrade}", this._initParams.AutoDowngradeOutputProtectionFailure || "true");
		initParams = initParams.replace("{deliveryCapabilityId}", deliveryCapabilityId || "");
		initParams = initParams.replace("{prerollUrl}", prerollUrl || "");
		initParams = initParams.replace("{prerollMax}", prerollMax || "");
		initParams = initParams.replace("{NonSilverlightImageURL}", this._initParams.NonSilverlightImageURL || "");
		initParams = initParams.replace("{IsRelatedContent}", isContent || false);
		initParams = initParams.replace("{subId}", subId || "");
		initParams = initParams.replace("{serverUrl}", licenseServerUrl || "");
		initParams = initParams.replace("{IsLiveContent}", isLive || false);
		initParams = initParams.replace("{SubtitleFile}", subtitleFile || "");
		if (pricingPlanId)
			initParams = initParams + ",isAnonymousSession=false";
		if (imageUrl)
			initParams = initParams + ",IsAudio=1";

		if (this._initParams.AkamaiPluginActive)
			initParams = initParams + ",AkamaiPluginActive=true";
		
		initParams = initParams.replace(/http:/g,'https:');
		return initParams;
	};
	$.cd.getPlayerUrl = function (target, isSecure) {
		var _cdHtmlPlayerServer = env.PlayerServer;
		var _cdServer = env.cdServer;
		var version = this.get_playerVersion();
		if (null == isSecure) isSecure = true;
		var serverUrl = "";
		if (target.search("%playerversion%") >= 0)
		    serverUrl = _cdServer + target.replace("%playerversion%", version);
		else if (target.search("%htmlplayerversion%") >= 0) {
		    if (_cdHtmlPlayerServer != null && _cdHtmlPlayerServer !== undefined) {
		        serverUrl = _cdHtmlPlayerServer + target.replace("%htmlplayerversion%", this.get_htmlPlayerVersion());
		    } else {
		        serverUrl = _cdServer + target.replace("%htmlplayerversion%", this.get_htmlPlayerVersion());
		    }
		}
		else
			serverUrl = _cdServer + target;

		if (!isSecure)
			serverUrl = serverUrl.replace("https", "http");

		return serverUrl;
	};
});

/*
    Settings
*/
var fullPathName = window.location.pathname;  
var pathNames = window.location.pathname.split('/');  
if( pathNames[pathNames.length-1] != '' )  
	pathNames[pathNames.length-1] = '';  
var clientUrl = window.location.host+pathNames.join('/'); 

var defaultsettings = {	
	systemId: env.SystemId,
	channelId: env.ChannelId,
	language: "en-US",
	clientUrl: clientUrl,	
	customCssUrl: "https://" + clientUrl + "Content/StyleSheets/iframe.css", // custom css for styling iframe
	resourceUrl: "https://" + clientUrl + "/Scripts/resources.js", // js resource file for replacing strings in iframe
	crossDomainStoragePageUrl: "https://" + clientUrl + "/crossdomainstorage.html",
	convivaId: null,
	useShoppingCart: false,
	enableJoinExistingSession: true,	
	//Set the Disable HTML5 Player Parameter
	disableHtml5Player: false,
	//Define Widevine Settings
	widevine: {
	     provider: 'csgi',
	     licenseServerPath: 'WidevineRightsManager.aspx'
	},
	htmlplayer: {
      hideControls: false,
      defaultVolume: 50,
      templateUrl: "https://" + clientUrl + "Content/templates/htmlplayerui.html",
      pluginUrl: 'HTPL/HTMLPlayer/%htmlplayerversion%/js/ascendon.htmlplayer-2.1.2.min.js',
      //customResourcesUrl: 'https://' + clientUrl + "Scripts/resources.json",
      defaultCaptionLanguage: 'eng',
      defaultAudioLanguage: 'eng',
      hdcpTestFile: 'https://smoothhd.contentdirect.tv/ondemand/HDCP/CDHD.ism/Manifest',
      showMessages: true, 
      unsupportedAudioCodecs: ['mp4a.40.0'],
      showInternalSpinner: false,
      callUpdateContentProgressOnTimer: true
  },
	detail: {
		browser: {
			minimumIEVersion: 8,
			popupWidth: '800px',
			popupHeight: '600px'
		},
		commonCommandCallBack: onCommandExecuted,
		error: {
			overrideWholeErrorHandling: true,
			onErrorOccured: onErrorCallBack,
			pagesToReloadWhenSessionExpired: []
		},
		pagelist: [                                                         	                   
      {
      	name: "product",                    	
      	handlePlay: true,
      	pathName: "/disney_player.html",
      	overrideCommands: [
					{
						name: 'BeforeLongInitialize',
						method: function (result) {
						}
					},
					{
						name: 'AfterInitialized',
						onBeforeMethod: function (result) {
							//Checking HDCP
							//ContentDirectAPI._checkHDCPFly();
							// Login Binding
							$(document).on('click','.initiatePlay',function(){
								$.when(service.createSession('aaaaaa8', 'michael.jan@csgi.com')).then(function(createSessionOutput) {
									result = JSON.parse(createSessionOutput);
									ContentDirectAPI.updateSubscriberInfo(
										result.SessionSummary.SubscriberId,
										result.SessionSummary.Login,
										result.SessionSummary.FirstName,
										result.SessionSummary.LastName,
										false,
										function (dataObj) {
											ContentDirectAPI.get_loginInfo().update(result.SessionSummary.Login, result.SessionSummary.FirstName, true, true, result.SessionSummary.SubscriberId, ContentDirect.UI.AuthenticateMode.Authenticated);
										},
										null,
										null,
										result.SessionId
									);							
									var productId = $('#productId').val();
									var pricingPlanId = $('#pricingPlanId').val();						
									play(productId,pricingPlanId);	
									//play(188267,22447);
								});
							});
						}
					},
					{
						name: 'Play',//PlayRequestedOverride
						method: function (result) {									
							var _createPlayerInitParams = function (dataObj) {
								// Update resources to https
								dataObj.data.initJson = dataObj.data.initJson.replace(/http:/g,'https:');
								var sessionId = dataObj.data.sessionId || "";
								var productId = dataObj.data.productId;
								var pricingId = dataObj.data.pricingId || "";
								var productName = dataObj.data.productName || "";										
								var productImage = dataObj.data.imageUrl || "";
								var deliveryCapabilityId = dataObj.data.deliveryCapabilityId || "";										
								var subscriberId = ContentDirectAPI.get_loginInfo().subId;
								var isContent = dataObj.data.isContent || false;
								var isOutputProtectionSupported = $.cd.get_browserInfo().OS != "iPhone/iPod" && $.cd.get_browserInfo().OS != "iPad"
									? $.cd.get_loginInfo().get_outputProtectionSupported() : 1;										
								var initJson = null;
								if (null != dataObj.data.initJson) {
									var tempJson = $.parseJSON(dataObj.data.initJson);
									if (tempJson.ClosedCaptions.ClosedCaptionSettings == null){
										tempJson.ClosedCaptions = $.parseJSON('{"ClosedCaptionSettings":[]}');
									}
									
									delete tempJson.ContentItemType;
									delete tempJson.ContentItemSubtype;
									initJson = encodeURIComponent(JSON.stringify(tempJson));
								}
								else {
									initJson = encodeURIComponent(dataObj.data.initJson || "");
								}
								var subtitleFile = encodeURIComponent(dataObj.data.subtitleFile || "");
								var sourceUrl = dataObj.data.sourceUrl;
								var licenseServerUrl = dataObj.data.licenseServerUrl || "";
								var contentUrl = sourceUrl || null;
								if (null === contentUrl) {
									var parsedJson = $.parseJSON(dataObj.data.initJson);
									contentUrl = parsedJson.ContentURL || parsedJson.ContentUrl;
								}
								var playerInfo = $.cd.get_browserInfo().getPlayerInfoBasedOnContentUrl(contentUrl);
								// If we pass in initTime via productImage we update initJson on the fly otherwise skip
								if(productImage != ""){
									var tempJson = JSON.parse(decodeURIComponent(initJson));
									var initTime = parseInt(productImage);
									tempJson.ProgressSeconds = initTime;
									initJson = encodeURIComponent(JSON.stringify(tempJson));
								}
								var initParams = ContentDirectAPI.createPlayerParams(
									initJson,
									sourceUrl,
									sessionId,
									productId,
									pricingId,
									productName,
									true,
									deliveryCapabilityId,
									productImage,
									'null',
									'null',
									false,
									false,
									playerInfo.location,
									subscriberId,
									null,
									subtitleFile);									
								$(".playerControl").attr("initParams", initParams);
							};
							_createPlayerInitParams(result);
							$.cd.loadSystemDependencies(ContentDirect.UI.Resources.SPS.debug, function () {
								if($.cd.get_browserInfo().browser == "Chrome"){
									StorefrontInternalAPI = new ContentDirect.UI.Storefront("player", "SPH");
								}
								else {
									StorefrontInternalAPI = new ContentDirect.UI.Storefront("player", "SPS");
								}							
								StorefrontScriptAPI = new ContentDirect.UI.Storefront.ClientAPI();								
								
								//Attaches event handlers for player events
								StorefrontScriptAPI.RegisterEventCallback(handlePlayerEvents);				
								StorefrontInternalAPI.initialize(true);
							});
						}
					}
					/*{
						name: 'Play',//PlayRequestedOverride
						method: function (result) {									
							var _createPlayerInitParams = function (dataObj) {
								// Update resources to https
								dataObj.data.initJson = dataObj.data.initJson.replace(/http:/g,'https:');
								var sessionId = dataObj.data.sessionId || "";
								var productId = dataObj.data.productId;
								var pricingId = dataObj.data.pricingId || "";
								var productName = dataObj.data.productName || "";										
								var productImage = dataObj.data.imageUrl || "";
								var deliveryCapabilityId = dataObj.data.deliveryCapabilityId || "";										
								var subscriberId = ContentDirectAPI.get_loginInfo().subId;
								var isContent = dataObj.data.isContent || false;
								var isOutputProtectionSupported = $.cd.get_browserInfo().OS != "iPhone/iPod" && $.cd.get_browserInfo().OS != "iPad"
									? $.cd.get_loginInfo().get_outputProtectionSupported() : 1;										
								var initJson = null;
								if (null != dataObj.data.initJson) {
									var tempJson = $.parseJSON(dataObj.data.initJson);
									if (tempJson.ClosedCaptions.ClosedCaptionSettings == null){
										tempJson.ClosedCaptions = $.parseJSON('{"ClosedCaptionSettings":[]}');
									}
									
									delete tempJson.ContentItemType;
									delete tempJson.ContentItemSubtype;
									initJson = encodeURIComponent(JSON.stringify(tempJson));
								}
								else {
									initJson = encodeURIComponent(dataObj.data.initJson || "");
								}
								var subtitleFile = encodeURIComponent(dataObj.data.subtitleFile || "");
								var sourceUrl = dataObj.data.sourceUrl;
								var licenseServerUrl = dataObj.data.licenseServerUrl || "";
								var contentUrl = sourceUrl || null;
								if (null === contentUrl) {
									var parsedJson = $.parseJSON(dataObj.data.initJson);
									contentUrl = parsedJson.ContentURL || parsedJson.ContentUrl;
								}
								var playerInfo = $.cd.get_browserInfo().getPlayerInfoBasedOnContentUrl(contentUrl);
								// If we pass in initTime via productImage we update initJson on the fly otherwise skip
								if(productImage != ""){
									var tempJson = JSON.parse(decodeURIComponent(initJson));
									var initTime = parseInt(productImage);
									tempJson.ProgressSeconds = initTime;
									initJson = encodeURIComponent(JSON.stringify(tempJson));
								}
								var initParams = ContentDirectAPI.createPlayerParams(
									initJson,
									sourceUrl,
									sessionId,
									productId,
									pricingId,
									productName,
									false,
									deliveryCapabilityId,
									productImage,
									'null',
									'null',
									false,
									false,
									playerInfo.location,
									subscriberId,
									null,
									subtitleFile);									
								$(".playerControl").attr("initParams", initParams);
							};
							_createPlayerInitParams(result);
							$.cd.loadSystemDependencies(ContentDirect.UI.Resources.SPS.debug, function () {
								if($.cd.get_browserInfo().browser == "Chrome"){
									StorefrontInternalAPI = new ContentDirect.UI.Storefront("player", "SPH");
								}
								else {
									StorefrontInternalAPI = new ContentDirect.UI.Storefront("player", "SPS");
								}							
								StorefrontScriptAPI = new ContentDirect.UI.Storefront.ClientAPI();								
								
								//Attaches event handlers for player events
								StorefrontScriptAPI.RegisterEventCallback(handlePlayerEvents);								
								StorefrontInternalAPI.initialize(true);
							});
						}
					}*/
      	]
      }                  
		],
		selectors: [
			{ name: "accountMenu", selectorName: "" },
			{ name: "subnav", selectorName: "" },
			{ name: "topnav", selectorName: "" },
			{ name: "subhover", selectorName: "" },
      { name: "topTrigger", selectorName: "" },
      { name: "cdPageMenu", selectorName: "" },
      { name: "pageHeader", selectorName: "" },
			{ name: "footer", selectorName: "" }
		]
	}
};
function logCode(text){
}


function handlePlayerEvents(type, target, keyword) {
	switch (type) {
		case "Stop":		
			//Stop event. This will always update content progress in Invision.
			window.location.reload();
			//Following is needed to handle to close stream properly.
			ContentDirectAPI._playerModalClosed(false, true);
		break;
		case "End":
			//Following is needed to handle to close stream properly.
			ContentDirectAPI._playerModalClosed(true, true);
		break;
		case "Error":
			//Following is needed to handle to close stream properly.
			ContentDirectAPI._playerModalClosed(false, true);
		break;
		case "Change":
		break;
		case "Track":
			// You can track play time from this block.
		break;
		case "Play":
			// Event 
		break;
	  case "Restore":
	  	// Event triggered when player exits compact mode
	  break;
		default:
		break;
	}
}

function onCommandExecuted(result) {
	// Log all results
}


function onErrorCallBack(error) {
	// Log all errors
}

/*
    Initialize page
*/
$.cd.ready(function () {	
	contentdirect.initialize(defaultsettings);
}, defaultsettings);

function play(productId, pricingPlan, init){
	ContentDirectAPI.playProduct(productId, pricingPlan);
}

var service = new function () {
	var subscriberEndpoint = 'https://services.sbx1.cdops.net/Subscriber/',
	metadataEndpoint = 'https://metadata.sbx1.cdops.net/',
	systemId = '02c62e64-6528-49e1-8800-8b52a97274a6',
	channelId = 'e777708b-f758-4d91-aaec-170755b9ed7e',
	createSession = function(swid, email) {
		jsonRequest = '';
		return $.ajax({ url: "PHP/functions.php",
		data: {action: 'createSession', swid: swid, email: email, login: swid, fName: swid, lName: swid, device: 4},
		type: 'post',
		success: function(output) {
		},
		error: function(output) {
		}
		});
	};
	return {
		createSession: createSession
	};
}();

//Support function to check if User has Silverlight Plugin Enabled
hasSilverlightInstalled = function() {
  try {
    temp = new ActiveXObject('AgControl.AgControl');
    delete temp;
    return true;
  } catch (e) {
    if (navigator.plugins["Silverlight Plug-In"])
      return true;
    else
      return false;
  }    
};
var hasSilverlightInstalled = hasSilverlightInstalled();

// Go to compact mode: StorefrontInternalAPI._external.go_compact();

