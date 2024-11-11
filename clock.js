export class Clock {
  #tid = null;
  #insertTitle = false;
  #dateBottom = false;
  #noSecond = false;
  constructor() {
	this.element = document.getElementById('clock');
	this.splitDate = '-';
	this.dateinits = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
	this.timeinits = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
	this.intervalSec = 1000;
	this.setLocales();
	this.date = null;
	this.toggleRefresh = this.toggleRefresh.bind(this);
	this.element.addEventListener('click',this.toggleRefresh);
	this.menuBtn = false;
  }
  setLocales(locales) {
	this.locales = locales ? locales : [];
	return;
  }
  setNoSeconds(intervalSec) {
	if (60 % parseInt(intervalSec/1000)) intervalSec = 60/Math.ceil(60/(parseInt(intervalSec/1000)))*1000;
	this.#noSecond = intervalSec ? true : false;
	if (this.#noSecond) {
	  this.timeinits = { hour: '2-digit', minute: '2-digit' };
	  this.intervalSec = (intervalSec >= 1000) ? intervalSec : 60000;
	}
	return this.#noSecond;
  }
  getNoSeconds() {
	return this.#noSecond;
  }
  enableTitle(param) {
	this.#insertTitle = param ? true : false;
	return this.#insertTitle;
  }
  getEnableTitle() {
	return this.#insertTitle;
  }
  setBottomDate(param) {
	this.#dateBottom = param ? true : false;
	return this.#dateBottom;
  }
  getBottomDate() {
	return this.#dateBottom;
  }
  addToTitle() {
	let value;
	const title = document.querySelector('title');
	block:{
	  if (title) {
		value = ' ['+ this.getTime() + ']';
		let prevalue = title.innerText.match(/ \[\d+:\d+\]/);
		if (prevalue && prevalue.length) {
		  prevalue = prevalue[0];
		  if (this.#insertTitle && value == prevalue) break block;
		  title.innerText = title.innerText.replace(prevalue,'');
		}
		if (this.#insertTitle) { title.innerText += value; }
	  }
	}
	return value;
  }
  setWithUTC(param) {
	this.withUTC = param ? true : false;
	return this.withUTC;
  }
  refresh() {
	this.date = new Date();
	/* console.log(this.date); */
	this.element.innerText = '';
	this.element.insertAdjacentElement('afterbegin', this.makeElement('div','tm',this.getTime()));
	this.element.insertAdjacentElement('afterbegin', this.makeElement('div','dt',this.getDate()));
	if (this.#noSecond) {
	  this.element.querySelector('div.tm').classList.add('nosec');
	}
	if (this.withUTC) {
	  const utcTime = this.getTime();
	  this.element.querySelector('div.tm').insertAdjacentElement('beforeend', this.makeElement('div','subtime',this.getUTCTime()));
	}
	if (this.#dateBottom) {
	  this.element.querySelector('div.dt').classList.add('bottom');
	}
	if (this.#tid && !(this.date.getMinutes() % 5)) {
	  this.stop();
	  this.start();
	}
	if (this.#insertTitle) this.addToTitle();
	return;
  }

  #waitUntilNextSecond(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
  }
  #checkEverySecondUntilZero() {
	return new Promise(resolve => {
      this.#tid = setInterval(() => {
		this.element.classList.remove('stop');
		this.refresh();
		if ((this.date.getSeconds()*1000) % this.intervalSec === 0) {
          clearInterval(this.#tid);
          resolve();
		}
      }, 1000);
	});
  }
  start() {
	if (!this.#tid) {
	  (async () => {
		const now = new Date();
		const ms = 1000 - now.getMilliseconds();
		const p1 = this.#waitUntilNextSecond(ms);
		const p2 = this.#checkEverySecondUntilZero();
		await Promise.all([p1, p2]);
		this.element.classList.remove('stop');
		this.#tid = setInterval( ()=>this.refresh(), this.intervalSec);
		return this.#tid;
	  })();
	}
  }
  stop() {
	if (this.#tid) {
	  clearInterval(this.#tid);
	  this.#tid = null;
	  this.element.classList.add('stop');
	}
	return this.#tid;
  }
  toggleRefresh() {
	switch (this.#tid) {
	case null:
	  this.refresh();
	  this.start();
	  break;
	default:
	  this.stop();
	}
	return this.#tid;
  }
  makeElement(tagName, className, text) {
	tagName = tagName ? tagName : 'div';
	const elem = document.createElement(tagName);
	if (className) elem.classList.add(className);
	elem.innerText = text;
	return elem;
  }
  getDate() {
	let value = new Intl.DateTimeFormat(this.locales, this.dateinits).format(this.date);
	if (this.splitDate != '/') value = value.replace(/\//g,this.splitDate);
	return value;
  }
  getTime(tz) {
	if (tz) this.timeinits.timeZone = tz;
	let value = new Intl.DateTimeFormat(this.locales, this.timeinits).format(this.date);
	if (tz)	delete this.timeinits.timeZone;
	return value;
  }
  getUTCTime() {
	return this.getTime('UTC');
  }

  /* popup menu */
  addPopupMenu(elem) {
	if (!elem) return;
	const menu = document.querySelector('dialog#popupmenu');
	if (!menu) return;

	elem.style.display = 'unset';
	
	if (this.menuBtn) {
	  this.menuBtn.removeEventListener('click',this.popupMenu);
	  menu.removeEventListener('close',this.execPopupMenu);
	  this.menuBtn = false;
	}

	this.menuBtn = elem;
	if (this.menuBtn) {
	  this.popupMenu = this.popupMenu.bind(this);
	  this.menuBtn.addEventListener('click',this.popupMenu);
	  this.execPopupMenu = this.execPopupMenu.bind(this);
	  menu.addEventListener('close',this.execPopupMenu);
	}
	return this.menuBtn;
  } 

  popupMenu() {
	/* post menu button press processing , user-defined by extend-class */
	const menu = document.querySelector('dialog#popupmenu');
	if (menu) {
	  menu.showModal();
	  let tgt;
	  if (tgt = menu.querySelector('button:last-of-type')) tgt.focus();
	}
	return menu;
   }
  execPopupMenu(e) {
	/* post popup closure processing , user-defined by extend-class `formdata = super.execPopupMenu(e);` */
	const formdata = new FormData(e.target.querySelector('form'));
	return formdata;
  }
}
