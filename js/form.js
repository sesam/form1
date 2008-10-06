var pageNav = null;
function init() {
	if (!document.getElementById) { return false; }
	if (!document.getElementsByTagName) { return false; }
	
	
	prepareForm();
	
	pageNav = new pageNavigation();
	if (!location.search.match(/print/)) {
		pageNav.loader();
	} else {
		pageNav.setPageClass('print');		
	}
}

function prepareForm(){
	if (!document.getElementById) { return false; }
	
	var li = document.getElementsByTagName("li");
	
	for (var i=0; i < li.length; i++) {
		if ( hasClassName(li[i].className, "checkedtextfield") ) {
			var listItem = li[i];
			var textField = li[i].getElementsByTagName("input")[0];

			var CHECK = "checked";
			var UNCHECK = "unchecked";
			
			if (hasClassName(li[i].className, "ejkryss")) {
 				CHECK = "";
				UNCHECK = "";
			}
			
			listItem.className = UNCHECK;

			listItem.onclick = function() {
				if(listItem.active == true) {
					textField.blur();
					listItem.active = false;
				} else {
					textField.focus();
					listItem.active = true;
				}
			}
						
			textField.onfocus = function() {
				listItem.className = CHECK;
				listItem.active = false;
			}
			
			textField.onblur = function() {
				if ( textField.value == "") {
					listItem.className = UNCHECK;
					listItem.active = true;
				}	
			}
		}
	}
	
	li = null;
}

var pageNavigation = function() {
	this.onpage = 1;
	this.maxPages = 15;
	this.data = document.location.search;

	if (!this.data) data = '?tx1=asdf&v1=4&v2=2&v3=1';
	if ('welcome'== document.location.search) document.location.search='';
	
	// Debug - Skriver ut debug-information i <textarea>
	if (document.getElementsByTagName('textarea')) {
		this.ta=document.getElementsByTagName('textarea');
	}
	
	if (this.ta) this.ta=this.ta[0];

	this.logga = function(x) { if (this.ta) this.ta.value += x + '\n'; }

	this.showanswers = function() {
  		var frm=document.forms[0];

  		var arr=this.data.split(/[\?&]/);
  		var t='#';
  		for (var i=0; i<arr.length; i++) {
			var pair=arr[i].split(/=/), key=pair[0], val=pair[1];
			var o=frm.elements[key];
			if (!o) {
				//logga('unhandled pair: ' + arr[i]);
				continue;
			}
			switch (o.length ? 'radio' : o.type) {
				case 'text':
			 	case 'textarea': 
					if (val) o.value = unescape(val);
					break;
			 	case 'checkbox':
			 		o.checked = val;
					break;
			 	case 'radio':
					for (var j=0; j<2; j++) o[j].checked = (val==o[j].value);
					break;
			 	default:
			 		this.logga('not handled: '+o.type);
					break;
			}
		}
 		
		frm.disabled = false;
		var elt = document.getElementById('laddar');
 		elt.style.display = 'none';
	}

	//window.onload = loader;
	this.loader = function() {
  		var o=document.forms[0].elements.js;
  		if (o && o.value) o.value='1';
		//js=1 indikerar for "nasta instans" att js finns&funkar.

  		if ('welcome'==document.location.search) document.location.search='';
  		else { 
			var self = this;
			var _this_showanswers = function() {self.showanswers()};
			setTimeout(_this_showanswers, 900); //lite delay sa man hinner se att ngt hander.
		}
		
		this.showPage(1);
	}

	this.jumpPages = function(diff) {
		if (diff==-1 && 1==this.onpage) return; //inget finns fore sida 1
		var ny=diff+this.onpage, to=document.getElementById('page-' + ny);
		if (!to && 1==diff) this.showPage(0); //efter sista sida kommer "Spara"-sidan
		else this.showPage(ny);
  	}
		
	this.showPage = function(n) {
  		this.logga('till sida ' + n);
		var to=document.getElementById('page-' + n);
		if (!to) n=1; //om man knappar fel i URL så får man hamnar på förstasidan
		for (var i=0; i <= this.maxPages; i++) {
	  		var o=document.getElementById('page-' + i);
			if (o && o.style) o.style.display = (i==n) ? 'block':'none';
			if (!o) break;
  		}
		this.onpage = n;
		this.setPageClass('on-page-'+n);
	}

	this.setPageClass = function(name) {
		var x=document.getElementsByTagName('body')[0];
		if (!x) return;
		if (!x.className) x.className='on-page-1';
		//this.logga( 'fore: '+ x.className );
		var y=x.className;
		var z=y.replace(/on-page-\w+/, '') + name;
		x.className=z;
		//this.logga( 'efter: '+ x.className );
	}
}

addLoadEvent(init);