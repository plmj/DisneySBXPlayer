<?php

//Operating Mode
$operational_mode = 'SBX';

if ($operational_mode == 'SBX') {
	//SBX
	define("CreateSessionEndpoint", "https://services.sbx1.cdops.net/Subscriber/CreateSession");
	define("CatalogEndpoint","https://services.sbx1.cdops.net/Catalog/");
	define("CreateMediaEndpoint","https://services.sbx1.cdops.net/Catalog/CreateMedia");
	define("UpdateMediaEndpoint","https://services.sbx1.cdops.net/Catalog/UpdateMedia");
	define("CreateProductEndpoint","https://services.sbx1.cdops.net/Catalog/CreateProduct");
	define("UpdateProductEndpoint","https://services.sbx1.cdops.net/Catalog/UpdateProduct");
	define("SystemID", "02c62e64-6528-49e1-8800-8b52a97274a6");
	define("ChannelID", "e777708b-f758-4d91-aaec-170755b9ed7e");
	define("User", "horizon.catalog@disney.com");
	define("Password", "H0rizon!");
	define("SaltValue", "DisneyHorizonSBX2014");
}


?>