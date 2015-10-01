<?php
	require_once('config.php');

	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
	header('Access-Control-Max-Age: 1000');
	header('Access-Control-Allow-Headers: Content-Type');
	if(isset($_POST['action']) && !empty($_POST['action'])) {
		$action = $_POST['action'];
		if(isset($_POST['swid'])){
			 $swid = $_POST['swid'];
		}
		if(isset($_POST['email'])){
			 $email = $_POST['email'];
		}
		if(isset($_POST['login'])){
			 $login = $_POST['login'];
		}
		if(isset($_POST['fName'])){
			 $fName = $_POST['fName'];
		}
		if(isset($_POST['lName'])){
			 $lName = $_POST['lName'];
		}
		if(isset($_POST['birthDate'])){
			 $birthDate = $_POST['birthDate'];
		}
		if(isset($_POST['gender'])){
			 $gender = $_POST['gender'];
		}
		if(isset($_POST['device'])){
			 $device = $_POST['device'];
		}
		if(isset($_POST['contentItemName'])){
			 $contentItemName = $_POST['contentItemName'];
		}
		if(isset($_POST['contentItemDescription'])){
			 $contentItemDescription = $_POST['contentItemDescription'];
		}
		if(isset($_POST['contentItemExternalReference'])){
			 $contentItemExternalReference = $_POST['contentItemExternalReference'];
		}
		if(isset($_POST['contentItemUrl'])){
			 $contentItemUrl = $_POST['contentItemUrl'];
		}
		if(isset($_POST['productName'])){
			 $productName = $_POST['productName'];
		}
		if(isset($_POST['productDescription'])){
			 $productDescription = $_POST['productDescription'];
		}
		if(isset($_POST['productExternalReference'])){
			 $productExternalReference = $_POST['productExternalReference'];
		}
		if(isset($_POST['CID'])){
			 $CID = $_POST['CID'];
		}
		if(isset($_POST['englishCID'])){
			 $englishCID = $_POST['englishCID'];
		}
		if(isset($_POST['frenchCID'])){
			 $frenchCID = $_POST['frenchCID'];
		}
		if(isset($_POST['italianCID'])){
			 $italianCID = $_POST['italianCID'];
		}
		if(isset($_POST['germanCID'])){
			 $germanCID = $_POST['germanCID'];
		}
		if(isset($_POST['spanishCID'])){
			 $spanishCID = $_POST['spanishCID'];
		}
		if(isset($_POST['drmKeyId'])){
			 $drmKeyId = $_POST['drmKeyId'];
		}
		if(isset($_POST['drmKeySeed'])){
			 $drmKeySeed = $_POST['drmKeySeed'];
		}
		if(isset($_POST['scrubberURL'])){
			 $scrubberURL = $_POST['scrubberURL'];
		}
		if(isset($_POST['englishCaption'])){
			 $englishCaption = $_POST['englishCaption'];
		}
		if(isset($_POST['frenchCaption'])){
			 $frenchCaption = $_POST['frenchCaption'];
		}
		if(isset($_POST['italianCaption'])){
			 $italianCaption = $_POST['italianCaption'];
		}
		if(isset($_POST['germanCaption'])){
			 $germanCaption = $_POST['germanCaption'];
		}
		if(isset($_POST['spanishCaption'])){
			 $spanishCaption = $_POST['spanishCaption'];
		}
		if(isset($_POST['contentItemId'])){
			 $contentItemId = $_POST['contentItemId'];
		}
		if(isset($_POST['requestJSON'])){
			 $requestJSON = $_POST['requestJSON'];
		}
		//Triage the request based on ACTION
		switch($action) {
			// Function to either create a user or create a session if exists
			
			case 'createSession': 
				createSession($swid, $email, $login, $fName, $lName, $device);
			break;
			case 'createMedia': 
				createMedia($contentItemName,$contentItemDescription,$contentItemExternalReference,$contentItemUrl,$drmKeyId,$drmKeySeed);
			break;
			case 'createSimpleMedia':
				createSimpleMedia($contentItemName,$contentItemDescription,$contentItemExternalReference,$contentItemUrl);
			break; 
			case 'updateMedia': 
				updateMedia($contentItemName,$contentItemDescription,$contentItemExternalReference,$contentItemUrl,$drmKeyId,$drmKeySeed,$scrubberURL,$englishCaption,$frenchCaption,$italianCaption,$germanCaption,$spanishCaption);
			break;
			case 'simpleUpdateMedia': 
				simpleUpdateMedia($contentItemName,$contentItemDescription,$contentItemExternalReference,$contentItemUrl,$drmKeyId,$drmKeySeed);
			break;
			case 'createProduct': 
				createProduct($productName,$productExternalReference,$englishCID,$frenchCID,$italianCID,$germanCID,$spanishCID);
			break;
			case 'createStandardProduct': 
				createStandardProduct($productName,$productExternalReference,$CID);
			break;
			case 'retrieveMedia': 
				retrieveMedia($contentItemExternalReference);
			break;
			case 'JSONUpdateMedia':
				JSONUpdateMedia($requestJSON);
			break;
			case 'JSONCreateMedia':
				JSONCreateMedia($requestJSON);
			break;
			case 'retrieveProduct': 
				retrieveProduct($productExternalReference);
			break;
			case 'JSONUpdateProduct':
				JSONUpdateProduct($requestJSON);
			break;
			case 'JSONCreateProduct':
				JSONCreateProduct($requestJSON);
			break;
		}
	}
	function createSession($swid, $email, $login, $fName, $lName, $device){
		$url = CreateSessionEndpoint; 
		$ssoToken = generateSsoToken($swid);
		$SSORequest = array(   
			"JoinExistingSession" => True,
			"Login" => $login, 
			"SsoCredentials" => array(
				"Subscriber" => array(
					"Email" => $email,
					"ExternalReferenceId" => $swid,
					"FirstName" => $fName,
					"LastName" => $lName
					//"BirthDate" => $birthDate //UTC date formatted as 'Y-m-d H:i:s\Z'
					),
				"Token" => $ssoToken
				)
		);
		//$updateRatingsRequest = '{"HouseholdMembersToUpdate" : [{"Privileges" :{"CreatePaymentInstrumentEnabled" : true, "EnforceAccessPrivileges" : true, "EnforceUsagePrivileges" : true, "MemberManagementEnabled" : true,"RatingPrivileges" : [1,10],},"SubscriberId" : 118535 }],"Id" : 550}';
		$content = json_encode($SSORequest);
		//var_dump($content);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-DeviceType:'.$device,
      'CD-SubscriberExternalReference:'.$login
    ));
        
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
	function generateSsoToken($ssoLogin, $ssoNonce = null){
		if ($ssoLogin == ''){
    	$ssoLogin = ''; 
  	}
		if ($ssoNonce == '') {
			$ssoNonce = '';
		}
    $currDate = gmdate("Y-m-d H:i:s\Z");
	  // create the sso token hash
	  $ssoToken = $ssoNonce . ";" . $currDate . ";" . sha1(SaltValue . ";" . SystemID . ";" . $ssoLogin . ";" . $ssoNonce . ";" . $currDate . ";" . SaltValue);  
	  return $ssoToken; 
  }
	function createMedia($contentItemName,$contentItemDescription,$contentItemExternalReference,$contentItemUrl,$drmKeyId,$drmKeySeed){
		$url = CreateMediaEndpoint; 
		$createMediaRequest = array(   
			"Media" => array(
				"Language" => "en-US",
				"Name" => $contentItemName,
				"DisplayName" => $contentItemName,
				"Description" => $contentItemDescription,
				"Status" => 1,
				"Type" => 2,
				"DrmConfigured" => true,
				"DrmKeyId" => $drmKeyId,
				"DrmKeySeed" => $drmKeySeed,
				"DrmType" => 1,
				"DrmOutputProtection" => 1,
				"Url" => $contentItemUrl,
				"References" => array(
					array(
						"Type" => "DisneyMediaID",
						"Value" => $contentItemExternalReference
					)			
				)
			)
		);
		
		$content = json_encode($createMediaRequest);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
function createSimpleMedia($contentItemName,$contentItemDescription,$contentItemExternalReference,$contentItemUrl){
		$url = CreateMediaEndpoint; 
		$updateMediaRequest = array(   
			"Media" => array(
				"Language" => "en-US",
				"Name" => $contentItemName,
				"DisplayName" => $contentItemName,
				"Description" => $contentItemDescription,
				"Status" => 1,
				"Type" => 2,
				"Url" => $contentItemUrl,
				"References" => array(
					array(
						"Type" => "DisneyMediaID",
						"Value" => $contentItemExternalReference
					)			
				)
			)
		);
		$content = json_encode($updateMediaRequest);
		//var_dump($content);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
function updateMedia($contentItemName,$contentItemDescription,$contentItemExternalReference,$contentItemUrl,$drmKeyId,$drmKeySeed,$scrubberURL,$englishCaption,$frenchCaption,$italianCaption,$germanCaption,$spanishCaption){
		$url = UpdateMediaEndpoint; 
		$updateMediaRequest = array(   
			"Media" => array(
				"Language" => "en-US",
				"Name" => $contentItemName,
				"DisplayName" => $contentItemName,
				"Id" => array(
					"Type" => "DisneyMediaID",
					"Value" => $contentItemExternalReference
				),
				"Description" => $contentItemDescription,
				"Status" => 1,
				"Type" => 2,
				"ClosedCaptions" => array(
					"ClosedCaptionSettings" => array(					
						array(
							"ClosedCaptionSettingTypeId" => 1,
							"Language" => "fr-FR",
							"Url" => $frenchCaption
						),
						array(
							"ClosedCaptionSettingTypeId" => 1,
							"Language" => "it-IT",
							"Url" => $italianCaption
						),
						array(
							"ClosedCaptionSettingTypeId" => 1,
							"Language" => "en-GB",
							"Url" => $englishCaption
						),
						array(
							"ClosedCaptionSettingTypeId" => 1,
							"Language" => "es-ES",
							"Url" => $spanishCaption
						),
						array(
							"ClosedCaptionSettingTypeId" => 1,
							"Language" => "de-DE",
							"Url" => $germanCaption
						)
					),
					"HasInstream" => false
				),
				"DrmConfigured" => true,
				"DrmKeyId" => $drmKeyId,
				"DrmKeySeed" => $drmKeySeed,
				"DrmType" => 1,
				"DrmOutputProtection" => 1,
				"DrmOutputProtectionAnalog" => 1,
				"DrmOutputProtectionDigital" => 1,
				"Url" => $contentItemUrl,
				"ScrubberVideoUrl" => $scrubberURL,
				"References" => array(
					array(
						"Type" => "DisneyMediaID",
						"Value" => $contentItemExternalReference
					)			
				)
			)
		);
		if ($germanCaption == ''){
			unset($updateMediaRequest["Media"]["ClosedCaptions"]["ClosedCaptionSettings"][4]);
		}
		else if ($spanishCaption == ''){
			unset($updateMediaRequest["Media"]["ClosedCaptions"]["ClosedCaptionSettings"][3]);
		}
		else if($englishCaption == ''){
			unset($updateMediaRequest["Media"]["ClosedCaptions"]["ClosedCaptionSettings"][2]);
		}
		else if ($italianCaption == ''){
			unset($updateMediaRequest["Media"]["ClosedCaptions"]["ClosedCaptionSettings"][1]);
		} 
		else if ($frenchCaption == ''){
			unset($updateMediaRequest["Media"]["ClosedCaptions"]["ClosedCaptionSettings"][0]);
		}

		$content = json_encode($updateMediaRequest);
		//var_dump($updateMediaRequest);
		//$content = $updateMediaRequest;
		//var_dump($content);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
function simpleUpdateMedia($contentItemName,$contentItemDescription,$contentItemExternalReference,$contentItemUrl,$drmKeyId,$drmKeySeed){
		$url = UpdateMediaEndpoint; 
		$updateMediaRequest = array(   
			"Media" => array(
				"Language" => "en-US",
				"Name" => $contentItemName,
				"DisplayName" => $contentItemName,
				"Description" => $contentItemDescription,
				"Status" => 1,
				"Type" => 2,
				"Url" => $contentItemUrl,
				"Id" => array(
					"Type" => "DisneyMediaID",
					"Value" => $contentItemExternalReference
				),
				"References" => array(
					array(
						"Type" => "DisneyMediaID",
						"Value" => $contentItemExternalReference
					)			
				),
				"DrmConfigured" => true,
				"DrmKeyId" => $drmKeyId,
				"DrmKeySeed" => $drmKeySeed,
				"DrmType" => 1,
				"DrmOutputProtection" => 1,
				"DrmOutputProtectionAnalog" => 1,
				"DrmOutputProtectionDigital" => 1
			)
		);
		$content = json_encode($updateMediaRequest);
		//var_dump($content);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
function createProduct($productName,$productExternalReference,$englishCID,$frenchCID,$italianCID,$germanCID,$spanishCID){
		$url = CreateProductEndpoint; 
		$createProductRequest = array(   
			"Product" => array(
				"AllowMultiplePurchases" => true,
				"Categories" => array (
					array(
						"Value" => 7853
					)
				),
				"GuidanceRatings" => array (
					array(
						"Value" => 10076
					)
				),
				"IndexName" => $productName,
				"Language" => "en-US",
				"LineOfBusiness" => 2,
				"Name" => $productName,
				//"ReferenceDate" =>  date("Y-m-d H:i:s"),
				"ReferenceDate" => "2014-12-23T17:07:15.998Z",
				"PricingPlanAssociations" => array(
					array(
						//,239,238,237,236,235,234,233,232,213,212,211,210
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							)						
						),
						"PricingPlanId" => array (
							"Value" => "22447"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(									
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							)
						),
						"PricingPlanId" => array (
							"Value" => "24614"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							)
						),
						"PricingPlanId" => array (
							"Value" => "24645"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(								
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									)
								)
							)
						),
						"PricingPlanId" => array (
							"Value" => "24647"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(					
									array(
										"Type" => "DisneyMediaID",
										"Value" => $spanishCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $englishCID									
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $frenchCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $italianCID
									),
									array(
										"Type" => "DisneyMediaID",
										"Value" => $germanCID
									)
								)
							)
						),
						"PricingPlanId" => array (
							"Value" => "24648"
						)
					)
				),
				"References" => array(
					array(
						"Type" => "DisneyCoreID",
						"Value" => $productExternalReference
					)			
				),
				"Status" => 1,
				"StructureType" => 1,
				"Weight" => 0,
				"EnabledLanguages" => array(
					"en-GB",
					"fr-FR",
					"it-IT",
					"de-DE",
					"es-ES"
				)
			)
		);
		$content = json_encode($createProductRequest);
		//var_dump($content);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
function createStandardProduct($productName,$productExternalReference,$CID){
		$url = CreateProductEndpoint; 
		$createProductRequest = array(   
			"Product" => array(
				"AllowMultiplePurchases" => true,
				"Categories" => array (
					array(
						"Value" => 7853
					)
				),
				"GuidanceRatings" => array (
					array(
						"Value" => 10076
					)
				),
				"IndexName" => $productName,
				"Language" => "en-US",
				"LineOfBusiness" => 2,
				"Name" => $productName,
				//"ReferenceDate" =>  date("Y-m-d H:i:s"),
				"ReferenceDate" => "2014-12-23T17:07:15.998Z",
				"PricingPlanAssociations" => array(
					array(
						//,239,238,237,236,235,234,233,232,213,212,211,210
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							)						
						),
						"PricingPlanId" => array (
							"Value" => "22447"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							)						
						),
						"PricingPlanId" => array (
							"Value" => "24614"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							)						
						),
						"PricingPlanId" => array (
							"Value" => "24645"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							)						
						),
						"PricingPlanId" => array (
							"Value" => "24647"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(
									array(
										"Type" => "DisneyMediaID",
										"Value" => $CID									
									)
								)
							)						
						),
						"PricingPlanId" => array (
							"Value" => "24648"
						)
					)
				),
				"References" => array(
					array(
						"Type" => "DisneyCoreID",
						"Value" => $productExternalReference
					)			
				),
				"Status" => 1,
				"StructureType" => 1,
				"Weight" => 0,
				"EnabledLanguages" => array(
					"en-GB",
					"fr-FR",
					"it-IT",
					"de-DE",
					"es-ES"
				)
			)
		);
		$content = json_encode($createProductRequest);
		//var_dump($content);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
	/*function createProduct($productName,$productExternalReference,$englishCID,$frenchCID,$italianCID,$germanCID,$spanishCID){
		$url = CreateProductEndpoint; 
		$createProductRequest = array(   
			"Product" => array(
				"AllowMultiplePurchases" => true,
				"Categories" => array (
					array(
						"Value" => 7853
					)
				),
				"GuidanceRatings" => array (
					array(
						"Value" => 10076
					)
				),
				"IndexName" => $productName,
				"Language" => "en-US",
				"LineOfBusiness" => 2,
				"Name" => $productName,
				//"ReferenceDate" =>  date("Y-m-d H:i:s"),
				"ReferenceDate" => "2014-12-23T17:07:15.998Z",
				"PricingPlanAssociations" => array(
					array(
						//,239,238,237,236,235,234,233,232,213,212,211,210
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							)						
						),
						"PricingPlanId" => array (
							"Value" => "22447"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(									
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							)
						),
						"PricingPlanId" => array (
							"Value" => "24614"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(								
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							)
						),
						"PricingPlanId" => array (
							"Value" => "24645"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(								
									array(
										"Value" => $germanCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $spanishCID
									)
								)
							)
						),
						"PricingPlanId" => array (
							"Value" => "24647"
						)
					),
					array(
						"DeliveryCapabilityToMedia" => array(
							array(
								"Key" => 210,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 211,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 212,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 213,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 232,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 233,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 234,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 235,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 236,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 237,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 238,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							),
							array(
								"Key" => 239,
								"Value" => array(					
									array(
										"Value" => $spanishCID
									),
									array(
										"Value" => $englishCID									
									),
									array(
										"Value" => $frenchCID
									),
									array(
										"Value" => $italianCID
									),
									array(
										"Value" => $germanCID
									)
								)
							)
						),
						"PricingPlanId" => array (
							"Value" => "24648"
						)
					)
				),
				"References" => array(
					array(
						"Type" => "DisneyCoreID",
						"Value" => $productExternalReference
					)			
				),
				"Status" => 1,
				"StructureType" => 1,
				"Weight" => 0,
				"EnabledLanguages" => array(
					"en-GB",
					"fr-FR",
					"it-IT",
					"de-DE",
					"es-ES"
				)
			)
		);
		$content = json_encode($createProductRequest);
		//var_dump($content);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}*/
	
	// MASTER JSON CALLS
	function retrieveMedia($contentItemExternalReference){
		$url = CatalogEndpoint. "RetrieveMedia"; 
		$retrieveMediaRequest = array(   
			"Id" => array(
				"Type" => "DisneyMediaID",
				"Value" => $contentItemExternalReference
			)
		);
		$content = json_encode($retrieveMediaRequest);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
	function JSONUpdateMedia($requestJSON){
		$url = UpdateMediaEndpoint; 
		$updateMediaRequest = $requestJSON;
		$content = $updateMediaRequest;
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
	function JSONCreateMedia($requestJSON){
		$url = CreateMediaEndpoint; 
		$createMediaRequest = $requestJSON;
		$content = $createMediaRequest;
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
	function retrieveProduct($productExternalReference){
		$url = CatalogEndpoint. "RetrieveProduct"; 
		$retrieveProductRequest = array(   
			"Id" => array(
				"Type" => "DisneyCoreID",
				"Value" => $productExternalReference
			)
		);
		$content = json_encode($retrieveProductRequest);
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
	function JSONUpdateProduct($requestJSON){
		$url = UpdateProductEndpoint; 
		$updateProductRequest = $requestJSON;
		$content = $updateProductRequest;
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
	function JSONCreateProduct($requestJSON){
		$url = CreateProductEndpoint; 
		$createProductRequest = $requestJSON;
		$content = $createProductRequest;
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST,"0");
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER,"0");
    curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER,"true");
		curl_setopt($curl, CURLOPT_ENCODING,"gzip,deflate");
		curl_setopt($curl, CURLOPT_POSTFIELDS,$content);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array(
      'CD-SystemID:'.SystemID,
      'CD-DistributionChannel:'.ChannelID,
      'CD-User:'.User,
      'CD-Password:'.Password
    ));       
		$json_response = curl_exec($curl);		
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);
		$response = json_decode($json_response, true);
	}
?>