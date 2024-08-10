"use strict";

function openOptionsPage() {
	chrome.tabs.create({
		url: chrome.runtime.getURL('options/options.html'),
		active: true,
	});
}

chrome.runtime.onInstalled.addListener(function(info) {
	chrome.contextMenus.create({
		"title": 'Search in FnfT',
		"id": 'fnftsearch',
		"contexts": ['selection'],
	});

	if (info.reason === chrome.runtime.OnInstalledReason.INSTALL) {
		openOptionsPage();
	}
});

chrome.contextMenus.onClicked.addListener(async function(info, tab) {
	const config = await chrome.storage.local.get('config');
	const FNFTSEARCH_FNFT_URL = config.config && config.config.fnftUrl;
	if (!FNFTSEARCH_FNFT_URL) return openOptionsPage();

	const url = FNFTSEARCH_FNFT_URL + '/?search=' + encodeURIComponent(info.selectionText.trim());
	chrome.tabs.create({
		url,
		active: true,
		index: tab.index + 1,
	});
});



// chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(function(info) {
// 	console.log(info.request, info.rule);
// });
