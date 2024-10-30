export class Clock {
  #tid = null;
  #insertTitle = false;
  constructor() {
	this.element = document.getElementById('clock')
	this.splitDate = '-';
	this.dateinits = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
	this.timeinits = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
	this.intervalSec = 1000;
	this.setLocales();
	this.date = null;
	this.element.addEventListener('click',()=>{ this.toggleRefresh(); });
  }
  setLocales(locales) {
	this.locales = locales ? locales : [];
	return;
  }
  setNoSeconds(intervalSec) {
	this.timeinits = { hour: '2-digit', minute: '2-digit' };
	this.intervalSec = (intervalSec >= 1000) ? intervalSec : 10000;
	return;
  }
  enableTitle(param) {
	this.#insertTitle = param ? true : false;
	return this.#insertTitle;
  }
  addToTitle() {
	let value;
	const title = document.querySelector('title');
	block:{
	  if (this.#insertTitle && title) {
		value = ' ['+ this.getTime() + ']'
		let prevalue = title.innerText.match(/ \[\d+:\d+\]/);
		if (prevalue && prevalue.length) {
		  prevalue = prevalue[0];
		  if (value == prevalue) break block;
		  title.innerText = title.innerText.replace(prevalue,'');
		}
		title.innerText += value;
	  }
	}
	return value;
  }
  refresh() {
	this.date = new Date();
	this.element.innerText = '';
	this.element.insertAdjacentElement('afterbegin', this.makeElement('div','tm',this.getTime()));
	this.element.insertAdjacentElement('afterbegin', this.makeElement('div','dt',this.getDate()));
	if (this.#tid && !(this.date.getMinutes() % 5)) {
	  this.stop();
	  this.start();
	}
	if (this.#insertTitle) this.addToTitle();
	return;
  }
  start() {
	if (!this.#tid) {
	  this.#tid = setInterval( ()=>this.refresh(), this.intervalSec);
	  this.element.classList.remove('stop');
	}
	return this.#tid;
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
  getTime() {
	let value = new Intl.DateTimeFormat(this.locales, this.timeinits).format(this.date);
	return value;
  }
}
