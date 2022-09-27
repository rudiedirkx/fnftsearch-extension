"use strict";

(async function() {

	const $ = sel => document.querySelector(sel);
	const $$ = sel => Array.from(document.querySelectorAll(sel));

	const rwebGetId = url => parseInt((url.match(/\/threads\/[^\/]+\.(\d+)\//) || '00')[1]);

	const config = await chrome.storage.local.get('config');
	const FNFTSEARCH_FNFT_URL = config.config && config.config.fnftUrl;
	if (!FNFTSEARCH_FNFT_URL) return;

	/* favorites */
	(async function() {
		if (location.pathname != '/account/bookmarks') return;

		const rsp = await fetch(FNFTSEARCH_FNFT_URL + '/api-ids.php').then(x => x.json());
		console.log('ids', rsp.ids);

		const els = $$('.contentRow-main > .contentRow-title > a');
		els.forEach(a => {
			const id = rwebGetId(a.href);
			const el = document.createElement('a');
			el.href = `${FNFTSEARCH_FNFT_URL}/?search=id=${id}`;
			el.target = '_blank';
			el.classList.add('rweb-in-fnft');
			el.classList.toggle('rweb-exists', rsp.ids.includes(id));
			a.parentNode.append(' ');
			a.parentNode.append(el);
		});
	})();

	/* scraper */
	const MAX_DELAY = 5; // sec

	(function() {
		const httpError = document.body.textContent.includes('F95Zone Connection Error');
		const loggedIn = !$('a[href="/login/"]');
		if (httpError || !loggedIn) return;

		if (location.pathname == '/account/') {
			const btn = document.createElement('button');
			btn.className = 'rweb-fetcher';
			btn.textContent = 'START FETCHING';
			btn.onclick = e => {
				const unload = e => {
					e.preventDefault();
					e.returnValue = 'Noooo';
				};
				window.addEventListener('beforeunload', unload);

				const title = document.title;
				start(state => {
					state.txt || btn.classList.add('error');
					btn.textContent = `Fetching... (${state.done} / ${state.total})`;
					document.title = `${title} (${state.done} / ${state.total})`;
					if (state.done >= state.total) {
						window.removeEventListener('beforeunload', unload);
						open(FNFTSEARCH_FNFT_URL);
					}
				});
			};
			document.body.append(btn);

			setInterval(function() {
				const d = new Date;
				if (d.getMinutes() == 59) {
					if (localStorage.lastReloadHour != String(d.getHours())) {
						localStorage.lastReloadHour = d.getHours();
						location.reload();
					}
				}
			}, 55000);
console.log('Start auto fetcher interval');
			const t = setInterval(function() {
console.log('Auto fetcher iteration');
				const d = new Date;
				if (d.getHours() == 0 && [1, 2, 3].includes(d.getMinutes())) {
					clearInterval(t);
console.log('Start auto fetcher');
					$('.rweb-fetcher').click();
				}
			}, 25000);

			console.log(new Date(performance.timing.domComplete));
		}

		const id = rwebGetId(location.href);
		if (id) {
			const fetchOne = () => scrape(location.href, ['f95_id', id]).then(txt => {
				console.log(txt);
				try {
					txt = JSON.stringify(JSON.parse(txt), null, '  ');
				}
				catch (ex) {}
				alert(txt);
				return txt;
			});

			const btn = document.createElement('button');
			btn.className = 'rweb-fetcher';
			btn.textContent = 'SCRAPE ONE';
			btn.onclick = fetchOne;
			document.body.append(btn);

			if (location.hash === '#fnft') {
				setTimeout(() => {
					fetchOne().then(txt => location.hash = '');
				}, 100);
			}
		}
	})();

	function scrape(url, [idKey, idValue]) {
		return fetch(url).then(async (rsp) => {
			const html = await rsp.text();
			if (rsp.status != 200) {
				return null;
			}

			const fd = new FormData();
			fd.append(idKey, idValue);
			fd.append('url', rsp.url);
			fd.append('html', new Blob([html], {type: 'text/html'}));

			return fetch(new Request(FNFTSEARCH_FNFT_URL + '/scraper-save.php', {
				method: 'POST',
				body: fd,
			})).then(rsp => rsp.text());
		}, () => {
console.warn('Uncatchable fetch error!?');
			return null;
		});
	}

	function start(callback) {
		fetch(FNFTSEARCH_FNFT_URL + '/scraper-start.php').then(rsp => rsp.json()).then(rsp => {
			console.log(rsp);
			const todo = rsp.urls.map(([id, url]) => ([id, url, 3]));
			const total = todo.length;
			console.log(`FETCHING ${total} SOURCES...`);
			const next = () => {
				let [id, url, attempt] = todo.pop();
				console.log(id, url);

				/**
				console.log(`${total - todo.length} / ${total}`);
				callback({total, done: total - todo.length});
				todo.length && setTimeout(next, Math.random() * 500);
				return;
				/**/

				scrape(url, ['id', id]).then(txt => {
					console.log(`${total - todo.length} / ${total}`);
					var wait = 1000 + Math.random() * 1000 * (MAX_DELAY - 1)
					if (txt) {
						console.log(txt);
					}
					else {
						console.warn("Couldn't load ", id, url);
						wait += MAX_DELAY * 1000;
						if (attempt > 0) {
							todo.unshift([id, url, --attempt]);
						}
					}

					callback({txt, total, done: total - todo.length});
					todo.length && setTimeout(next, wait);
				});
			};
			todo.length && next();
		});
	}

})();
