importScripts('fnftsearch.env.js');

chrome.contextMenus.create({
	"title": 'Search in FnfT',
	"id": 'search',
	"contexts": ['selection'],
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	const url = FNFTSEARCH_FNFT_URL + '?search=' + encodeURIComponent(info.selectionText.trim());
	chrome.tabs.create({
		url,
		active: true,
		index: tab.index + 1,
	});
});
