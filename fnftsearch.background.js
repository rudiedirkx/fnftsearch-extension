
chrome.contextMenus.create({
	"title": 'Search in FnfT',
	"contexts": ['selection'],
	"onclick": function(info, tab) {
// console.log(info, tab);
		const url = FNFTSEARCH_FNFT_URL + '?search=' + encodeURIComponent(info.selectionText.trim());
		chrome.tabs.create({
			url,
			active: true,
			index: tab.index + 1,
		});
	}
});
