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

function addLoadEvent(func) {
	var oldonload = window.onload;
	if(typeof window.onload != 'function') {
		window.onload = func;
	} else {
		window.onload = function() {
			oldonload();
			func();
		}
	}
}

function hasClassName(tempClassNames, wantedClassName) {
	var classNames = tempClassNames.split(" ");
	for (var i=0; i < classNames.length; i++) {
		if( classNames[i] == wantedClassName) {
			return true;
		}
	}
	return false;
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

/*
* FancyForm 0.91
* By Vacuous Virtuoso, lipidity.com
* ---
* Checkbox and radio input replacement script.
* Toggles defined class when input is selected.
*/

var FancyForm = {
	start: function(elements, options){
		FancyForm.runningInit = 1;
		if($type(elements)!='array') elements = $$('input');
		if(!options) options = [];
		FancyForm.onclasses = ($type(options['onClasses']) == 'object') ? options['onClasses'] : {
			checkbox: 'checked',
			radio: 'selected'
		}
		FancyForm.offclasses = ($type(options['offClasses']) == 'object') ? options['offClasses'] : {
			checkbox: 'unchecked',
			radio: 'unselected'
		}
		if($type(options['extraClasses']) == 'object'){
			FancyForm.extra = options['extraClasses'];
		} else if(options['extraClasses']){
			FancyForm.extra = {
				checkbox: 'f_checkbox',
				radio: 'f_radio',
				on: 'f_on',
				off: 'f_off',
				all: 'fancy'
			}
		} else {
			FancyForm.extra = {};
		}
		FancyForm.onSelect = $pick(options['onSelect'], function(el){});
		FancyForm.onDeselect = $pick(options['onDeselect'], function(el){});
		var keeps = [];
		FancyForm.chks = elements.filter(function(chk){
			if( $type(chk) != 'element' ) return false;
			if( chk.getTag() == 'input' && (FancyForm.onclasses[chk.getProperty('type')]) ){
				var el = chk.getParent();
				if(el.getElement('input')==chk){
					el.type = chk.getProperty('type');
					el.inputElement = chk;
					this.push(el);
				} else {
					chk.addEvent('click',function(ev){ev.stopPropagation();})
				//	el = (new Element('div',{class:'hi'}).adopt(chk)).injectInside(el);
				}
			} else if( (chk.inputElement = chk.getElement('input')) && (FancyForm.onclasses[(chk.type = chk.inputElement.getProperty('type'))]) ){
				return true;
			}
			return false;
		}.bind(keeps));
		FancyForm.chks = FancyForm.chks.merge(keeps);
		keeps = null;
		FancyForm.chks.each(function(chk){
			chk.inputElement.setStyle('position', 'absolute');
			chk.inputElement.setStyle('left', '-9999px');
			chk.addEvent('selectStart', function(){})
			chk.name = chk.inputElement.getProperty('name');
			if(chk.inputElement.checked) FancyForm.select(chk);
			else FancyForm.deselect(chk);
			chk.addEvent('click', function(e){
				var e = new Event(e);
				if(chk.inputElement.getProperty('disabled')) return;
				if ($type(e.preventDefault) == 'function')
					e.preventDefault(true);
				else if ($type(e.returnValue) == 'function')
					e.returnValue(true);
				if (!chk.hasClass(FancyForm.onclasses[chk.type]))
						FancyForm.select(chk);
				else /* if(chk.type != 'radio')     - Kommenterars bort för att göra radioknappar urkryssbara. */
					FancyForm.deselect(chk);
				FancyForm.focusing = 1;
				chk.inputElement.focus();
				FancyForm.focusing = 0;
			});
			chk.addEvent('mousedown', function(e){
				if ($type(e.preventDefault) == 'function')
					e.preventDefault(true);
				else if ($type(e.returnValue) == 'function')
					e.returnValue(true);
			});
			chk.inputElement.addEvent('focus', function(e){
				if(!FancyForm.focusing) chk.setStyle('outline', '1px dotted');
			});
			chk.inputElement.addEvent('blur', function(e){chk.setStyle('outline', '0')});
			if(extraclass = FancyForm.extra[chk.type])
				chk.addClass(extraclass);
			if(extraclass = FancyForm.extra['all'])
				chk.addClass(extraclass);
		});
		FancyForm.runningInit = 0;
	},
	select: function(chk){
		chk.inputElement.checked = 'checked';
		chk.removeClass(FancyForm.offclasses[chk.type]);
		chk.addClass(FancyForm.onclasses[chk.type]);
		if (chk.type == 'radio'){
			FancyForm.chks.each(function(other){
				if (other.name != chk.name || other == chk) return;
				FancyForm.deselect(other);
			});
		}
		if(extraclass = FancyForm.extra['on'])
			chk.addClass(extraclass);
		if(extraclass = FancyForm.extra['off'])
			chk.removeClass(extraclass);
		if(!FancyForm.runningInit)
			FancyForm.onSelect(chk);
	},
	deselect: function(chk){
		chk.inputElement.checked = false;
		chk.removeClass(FancyForm.onclasses[chk.type]);
		chk.addClass(FancyForm.offclasses[chk.type]);
		if(extraclass = FancyForm.extra['off'])
			chk.addClass(extraclass);
		if(extraclass = FancyForm.extra['on'])
			chk.removeClass(extraclass);
		if(!FancyForm.runningInit)
			FancyForm.onDeselect(chk);
	},
	all: function(){
		FancyForm.chks.each(function(chk){
			FancyForm.select(chk);
		});
	},
	none: function(){
		FancyForm.chks.each(function(chk){
			FancyForm.deselect(chk);
		});
	}
};

addLoadEvent(FancyForm.start);
addLoadEvent(init);