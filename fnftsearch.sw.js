importScripts('fnftsearch.env.js');

chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		"title": 'Search in FnfT',
		"id": 'fnftsearch',
		"contexts": ['selection'],
	});
	console.log(1, chrome.runtime.lastError);
});
console.log(2, chrome.runtime.lastError);

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	const url = FNFTSEARCH_FNFT_URL + '?search=' + encodeURIComponent(info.selectionText.trim());
	chrome.tabs.create({
		url,
		active: true,
		index: tab.index + 1,
	});
	console.log(3, chrome.runtime.lastError);
});
console.log(4, chrome.runtime.lastError);
