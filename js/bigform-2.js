var pageNav = { onSelect: function() { alert('denna ska ju ha bytts ut'); } };

// Get a nicely caching mootools-version via google!   --- http://code.google.com/apis/ajax/documentation/
// Though it seems they are missing a way to populate cache without evalig the contents of the .js file.

function init() {
	if (!document.getElementById) { return false; }
	if (!document.getElementsByTagName) { return false; }
	
	prepareForm();

	pageNav = new pageNavigation();
	FancyForm.onSelect = pageNav.onSelect; //whee hoo!! monkeypatching ?
	if (!location.search.match(/print/)) {
		pageNav.loader();
	} else {
		pageNav.setPageClass('print');		
	}
}
/*
function addLoadEvent(func) {
	var oldonload = window.onload;
	if (oldonload) {
		if(typeof window.onload != 'function') {
			window.onload = func;
		} else {
			window.onload = function() {
				oldonload();
				func();
			}
		}
	}
}*/

function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    };
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

function saveForm() {
	// Samlar ihop formuläret och skickar det till servern.
	formform = $('form_').send({
		onComplete: function() {
			var saved = document.getElementById("saved");
			var date = new Date();
			pageNav.logga($('form_').toQueryString());
			saved.innerHTML = date.getHours() + ":" + date.getMinutes();
			document.getElementById("savetext").style.display='inline';
		}
	});
} 

var autoSave_ = null;

/* 
 * @param run
 */
function autoSave(run) {
	if (run == true) { autoSave_ = setInterval("saveForm()", 60 * 1000); }
	else if (run == false) { clearInterval(autoSave_); }
	
}


var pageNavigation = function() {
	this.onpage = 1;
	this.currentPageDiv = document.getElementById('page-1');
	this.maxPages = 15;
	this.data = document.location.search;
	this.hasAddedEvents = Array();
	this.missedQuestions = Array();

	//if (!this.data) data = '?tx1=asdf&v1=4&v2=2&v3=1';
	if ('welcome'== document.location.search) document.location.search='';
	
	// Debug - Skriver ut debug-information i <textarea>
	if (document.getElementsByTagName('textarea')) {
		this.ta=document.getElementsByTagName('textarea');
	}
	
	if (this.ta) this.ta=this.ta[0];

	this.logga = function(x) { if (this.ta) this.ta.value += x + '\n'; }

	this.showanswers = function() {
  		var frm=document.forms[0];

		frm.disabled = true;
		var elt = document.getElementById('laddar');
 		elt.style.display = 'inline';

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
		elt.style.display = 'none';
	}

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
	
	this.firstLoad = true;
	this.showPage = function(n) {
		if (!this.firstLoad) {
			var first = !pageNav.hasAddedEvents[pageNav.onpage];
			var c = this.addHighlights();
			// alert("antal hittade obl.obesvarade: " + c);
			if (c!=0 && first) return false;
		}
		this.firstLoad = false;
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
		this.currentPageDiv = document.getElementById('page-' + n);
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
	
	this.arraySum = function(arr) {
		var sum=0;
		for (var i=0; i<arr.length; i++) {
			sum += arr[i];
		}
		return sum;
	}

	this.addHighlight = function(elt, all_inputs) {
		var div=this.findObligatoryParent(elt);
		if (!div) return 0;
		div.addClass("highlight");
		this.hasAddedEvents[this.onpage] = true;

		return 1;
	}

	this.possiblyAddHighlight = function(x) {
		var all_inputs = x.getElements("INPUT");
		var unanswered = !all_inputs.some( function(elt) {
				if (!elt || !elt.getValue) return false;
				return elt.getValue();
			} );
		if (unanswered) {
			pageNav.add_to_message( x.getElements('span.number')[0].innerHTML );
			pageNav.print_message();
			
			var x = pageNav.addHighlight(all_inputs[0], all_inputs);
			return x;
		}
		else return 0;
	}
	/*
	this.addHighlights = function() {
		var obligatories = this.currentPageDiv.getElements( ".obligatory" );
		alert(this.currentPageDiv.id);
		var arr = obligatories.map(this.possiblyAddHighlight);
		return this.arraySum(arr);
	}
	*/
	
	this.addHighlights = function() {
		var getter = (window.ie ? $(pageNav.currentPageDiv.id): pageNav.currentPageDiv).getElements;
		var obligatories = pageNav.currentPageDiv.getElements( ".obligatory" );
		var arr = obligatories.map(pageNav.possiblyAddHighlight);
		return pageNav.arraySum(arr);
	}

	
	this.removeAllHighlights = function() {
		var elements = this.currentPageDiv.getElements( ".highlight" );
		elements.map( function(elt) {
			elt.removeClass("highlight");
		});
	}
	
	this.findObligatoryParent = function(elt) {
		for (var i=0; i<9; i++) {
			if (elt.className.match(/obligatory/)) return elt;
			elt = elt.parentNode;
		}
	}

	this.onSelect = function(source_elt) {
		if (pageNav.hasAddedEvents[pageNav.onpage]) {
			var elt = pageNav.findObligatoryParent(source_elt);
			if (elt) {
				elt.removeClass("highlight");
				
				pageNav.remove_from_message(elt.getElements('span.number')[0].innerHTML);
				pageNav.print_message();
			}
			alert('denna HAR ju ha bytts ut :-9 '); 
		}
	}
	
	/*
	 *	Funktionen används för att lägga till missade obligatoriska frågor till #message
	 *	@param question_number - frågans nummer.
	 *	@return true om den lyckades
	 */
	this.add_to_message = function(question_number) {
		var foundQuestion = false;
		for (var i=0; i < this.missedQuestions.length; i++) {
						
			if (this.missedQuestions[i] == question_number) {
				foundQuestion = true;
			}
		}
		
		if (!foundQuestion) {
			this.missedQuestions[this.missedQuestions.length] = question_number;
			return true;
		}
		
		return false;
	}
	
	/*
	 *	Funcktionen används för att tabort missade frågor från #message
	 *	@param question_number - frågans nummer.
	 *	@return true om den lyckades
	 */
	this.remove_from_message = function(question_number) {
		for (var i=0; i < this.missedQuestions.length; i++) {
			if (this.missedQuestions[i] == question_number) {
				this.missedQuestions[i] = "";
				this.clean_missed_question();
			}
		}
	}
	
	/*
	 *	Städar this.missedQuestions[]
	 *	Magnus: Kanske går att lösa detta på ett snyggare sätt.
	 */
	this.clean_missed_question = function() {
		var tempArray = Array();
		var tempArrayIndex = 0;
		for (var i=0; i < this.missedQuestions.length; i++) {
			if( this.missedQuestions[i] != "" ) {
				tempArray[tempArrayIndex] = this.missedQuestions[i];
				tempArrayIndex++;
			}
		}
		this.missedQuestions = tempArray;
	}
	
	/*
	 *	Funktioner används för att skriva ut ett meddelanden med de missade frågorna
	 *	TODO: Är inte inte gjord för språkhantering just nu... fixa! /magnus
	 */
	this.print_message = function() {
		var messageString = "Det finns obligatoriska frågor som ej besvarats.";
		var messageBox = document.getElementById("message");
		if (!messageBox) { return false; }
		
		if (0 < this.missedQuestions.length) {
			messageString += " Var god besvara";
			for (var j=0; j < this.missedQuestions.length; j++) {
				if (j != 0) { messageString += ", "; }
				else { messageString += " "; }
				
				messageString += "<a onclick=''>fråga " + this.missedQuestions[j] + "</a>";
			}
		}
				
		if (this.missedQuestions.length == 0) {
			messageBox.innerHTML = "";
			messageBox.style.display = "hidden";
		}
		else {
			messageBox.innerHTML = messageString;
			messageBox.style.display = "block";
		}
	}
}



//code for version 0.94 ? :-)

//WARNING: below code has been tested by a crazy person :-)

var FancyForm = {
	start: function(elements, options){
		FancyForm.initing = 1;
		
		if($type(elements)!='array') elements = $$('input'); //start with no arguments fancifies all inputs
		FancyForm.extra = {}
		FancyForm.classes = {
			checkbox: 'checked',
			radio: 'selected',
			checkboxoff: 'unchecked',
			radiooff: 'unselected'
		}
		
		if(!options) {
			options = [];
		} else {
			/* Hypothetical & untested:
			// To accept onClasses/offClasses parameter as usual
			FancyForm.classes = {}
			['', 'off'].each( function(onoff) {
				var o = options[ (!onoff ? 'on': onoff) +'Classes']);
				if ($type(o)=='object') {
					o.each( function(input_type {
						FancyForm.classes[input_type + onoff]=o[input_type]; //maybe onoff aren't available in here...
					}
				}
			}
			*/
		
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
			}
		}

		//higher level events, at your service
		FancyForm.onSelect = $pick(options['onSelect'], function(el){});
		FancyForm.onDeselect = $pick(options['onDeselect'], function(el){});

		var keeps = [];
		FancyForm.chks = elements.filter(function(chk){
			if( $type(chk) != 'element' ) return false;
			if( chk.getTag() == 'input' && (FancyForm.classes[chk.getProperty('type')]) ){
				var el = chk.getParent();
				if(el.getElement('input')==chk){
					el.type = chk.getProperty('type');
					el.inputElement = chk;
					this.push(el);
				} else {
					chk.addEvent('click',function(ev){
				if(e.event.stopPropagation)
					e.event.stopPropagation();
});
				}
			} else if( (chk.inputElement = chk.getElement('input')) && (FancyForm.classes[(chk.type = chk.inputElement.getProperty('type'))]) ){
				return true;
			}
			return false;
		}.bind(keeps));
		FancyForm.chks = FancyForm.chks.merge(keeps);
		keeps = null;
		
		//focus on getting (big amounts of) inputs fancified
		FancyForm.chks.each(function(chk){
			var c = chk.inputElement;
			
			//hide regular form element. (Can't hide, because of IE7 preventing updates to hidden inputs.)
			c.setStyle('position', 'absolute');
			c.setStyle('left', '-9999px');
			chk.addEvent('selectStart', function(e){new Event(e).stop()}); //? is this about text inputs?
			chk.name = c.getProperty('name'); //used later to identify within a collection
			FancyForm.update(chk); //update display
		});

		//and then get them functional as well, binding the respective events together
		FancyForm.chks.each(function(chk){
			chk.addEvent('click', function(f){
				if(!FancyForm.initing && $type(chk.inputElement.onclick) == 'function')
					 chk.inputElement.onclick();
				var e = new Event(f);
				e.stop(); e.type = 'prop';
				chk.inputElement.fireEvent('click', e, 1);
			});
			chk.addEvent('mousedown', function(e){
				if($type(chk.inputElement.onmousedown) == 'function')
					chk.inputElement.onmousedown();
				new Event(e).preventDefault();
			});
			chk.addEvent('mouseup', function(e){
				if($type(chk.inputElement.onmouseup) == 'function')
					chk.inputElement.onmouseup();
			});
			chk.inputElement.addEvent('focus', function(e){
				if(FancyForm.focus)
					chk.setStyle('outline', '1px dotted');
			});
			chk.inputElement.addEvent('blur', function(e){
				chk.setStyle('outline', 0);
			});
			chk.inputElement.addEvent('click', function(e){
				if(e.event.stopPropagation)
					e.event.stopPropagation();
				if(chk.inputElement.getProperty('disabled')) // c.getStyle('position') != 'absolute'
					return;
				if (!chk.hasClass(FancyForm.classes[chk.type]))
					chk.inputElement.setProperty('checked', 'checked');
				else //if(chk.type != 'radio')
					chk.inputElement.setProperty('checked', false);
				if(e.type == 'prop')
					FancyForm.focus = 0;
				FancyForm.update(chk);
				FancyForm.focus = 1;
			});
			chk.inputElement.addEvent('mouseup', function(e){
				if(e.event.stopPropagation)
					e.event.stopPropagation();
			});
			chk.inputElement.addEvent('mousedown', function(e){
				if(e.event.stopPropagation)
					e.event.stopPropagation();
			});
			if(extraclass = FancyForm.extra[chk.type])
				chk.addClass(extraclass);
			if(extraclass = FancyForm.extra['all'])
				chk.addClass(extraclass);
		});
		FancyForm.initing = 0;
		$each($$('form'), function(x) {
			x.addEvent('reset', function(a) {
				window.setTimeout(function(){FancyForm.chks.each(function(x){FancyForm.update(x);x.inputElement.blur()})}, 200);
			});
		});
	},

	update: function(chk){
		var unchecked = !chk.inputElement.getProperty('checked');
		var toAdd    = unchecked ? 'off' : '';
		var toRemove = unchecked ? ''    : 'off';
		
		chk.removeClass(FancyForm.classes[chk.type+toRemove]); //could string concatenation slow down event handlers? reset might be the most sensitive.
		chk.addClass(FancyForm.classes[chk.type+toAdd]);

		if(!unchecked && chk.type == 'radio'){
			FancyForm.chks.each(function(other){
				if (other.name == chk.name && other != chk) {
					other.inputElement.setProperty('checked', false);
					FancyForm.update(other);
				}
			});
		}

		if(extraclass = FancyForm.extra[toAdd])
			chk.addClass(extraclass);
		if(extraclass = FancyForm.extra[toRemove])
			chk.removeClass(extraclass);
		if(!FancyForm.initing) {
			unchecked ? FancyForm.onDeselect(chk) : FancyForm.onSelect(chk); //probably not pure coding style :)
			chk.inputElement.focus();
		}
	},

	all: function(){
		FancyForm.chks.each(function(chk){
			chk.inputElement.setProperty('checked', 'checked');
			FancyForm.update(chk);
		});
	},

	none: function(){
		FancyForm.chks.each(function(chk){
			chk.inputElement.setProperty('checked', false);
			FancyForm.update(chk);
		});
	}
};

if (location.href.match(/form/)) {
	addLoadEvent(function() {FancyForm.start(0, { onSelect: pageNav.onSelect } ) } );
	addLoadEvent(function() {init();});
}