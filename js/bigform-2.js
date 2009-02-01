var fapp = { onSelect: function(){} };
var pageNav;
var orginal_html = document.getElementById("form_").innerHTML;

if (!window.console || !console.firebug)
{
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}


// Get a nicely caching mootools-version via google!   --- http://code.google.com/apis/ajax/documentation/
// Though it seems they are missing a way to populate cache without evalig the contents of the .js file.

//depends on mootools Element.Form, Remote.Ajax, Plugins.Hash

function init() {
	if (!document.getElementById) { return false; }
	if (!document.getElementsByTagName) { return false; }
	
	prepareForm();
	

	fapp = new formApplication();
	pageNav = fapp; // tas bort först efter att alla gamla form*.html - filer har makulerats
	FancyForm.onSelect = fapp.onSelect; //whee hoo!! monkeypatching ?	

	if (!location.search.match(/print/)) {
		fapp.loader();
	} else {
		fapp.setPageClass('print');		
	}

	if (form_edit_init) form_edit_init();
}

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

/*
 * Hämtar första textNoden den hittar i ett element.
 * @param - Elementet som ska sökas igenom.
 */
function getFirstTextNode(x) {
	var children = x.childNodes;
	for (i=0;i<children.length;i++) { 
		if (children[i].nodeType==3) return children[i].data;
	}
}

/*
 * Placerar ett element efter ett element i DOM-trädet.
 * @param new_element - Det nya elementet.
 * @param target_element - Elementet i DOM-trädet som det nya elementet ska placeras under/efter.
 */
function insertAfter(new_element, target_element) {
	var parent = target_element.parentNode;
	if (parent.lastChild == target_element) {
		parent.appendChild(new_element);
	} else {
		parent.insertBefore(new_element, target_element.nextSibling);
	}
}

/**
 * Anpassar storleken på textarea-element efter innehållet.
 * @param ta - Textarea
 */
function resize_HTMLTextArea(ta) {
		var t=ta.value.replace(/\r\n/g, '\n').split('\n'), sum=0;
		for (var i=0;i<t.length;i++) if (t[i].length > ta.cols) sum++;
		ta.rows=sum + t.length + 1;
		if(ta.value == null || ta.value == "" || ta.rows < 4) ta.rows = 4;
}


/**
 * Används för att få "annat"-svar att seut som kryssruta med ett textfält.
 */
function prepareForm(){
	var elements = document.getElements('LI.checkedtextfield');
	var elements_radio = document.getElements('LI.radiotextfield');
	
	elements.each(
	function(listItem) {
			var textField = listItem.getElementsByTagName("input")[0];
			var CHECK = "checked";
			var UNCHECK = "unchecked";
			listItem.checkedtextfield = true;
			
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
	);
	
	elements_radio.each(
	function(listItem) {
			var textField = listItem.getElementsByTagName("input")[0];
			var CHECK = "selected";
			var UNCHECK = "unselected";
			listItem.radiotextfield = true;
			
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
	);
}
var formform;

/* Samlar ihop svar och skickar till servern. */
function saveForm() {
	try {
	formform = $('form_').send({
		onComplete: function() {
			var saved = document.getElementById("saved");
			var date = new Date();
			//fapp.logga($('form_').toQueryString());
			saved.innerHTML = " Sparades kl " + (date.getHours()<10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes()<10 ? "0" : "") + date.getMinutes();
		}
	});	
	} catch(NS_ERROR_FILE_NOT_FOUND) {
	
	}
} 

var autoSave_ = null;

/*
 * Spara automatiskt formuläret var 3:e minut 
 * @param run - true aktiverar sparning i tidsintervall
 */
function autoSave(run) {
	//console.info("autosaveing");
	//if (run == true) { autoSave_ = setInterval("saveForm()", 60 * 1000); }
	//else if (run == false) { clearInterval(autoSave_); }

	if (null!=autoSave_) clearInterval(autoSave_);
	if (run) autoSave_ = setInterval("saveForm()", 60 * 3 * 1000);
}

/**
 * Hanterar sökväg till filer beroende på vart man surfar in ifrån
 * @param filename - filnamnet.
 * @return String med sökvägen till filen.
 */
function path(filename) {	
	var path = "";
	
	if (location.href.match(/zondera.com/)) {
		/* användaren kommer från zondera.com/ */
		path = filename;
	} else {
		/* kommer troligen in från Hamachi-adress(IP) */
		path = "http://5.28.219.86/gecko/asp/" + filename;
	}
	
	return path;
	
}


/*
 * Klass. 
 */
var formApplication = function() {
	this.onpage = 1;
	this.currentPageDiv = document.getElementById('page-1');
	this.maxPages = 15;
	this.data = document.location.search;
	this.hasAddedHighlights = Array();
	this.missedQuestions = new Hash();
	this.exit = 'exit';
	this.tack = 'tack';
	this.logout_close = 'logout_close.asp';
	this.yellow = 'yellow';
	this.blue = 'blue';
	
	//if (!this.data) data = '?tx1=asdf&v1=4&v2=2&v3=1';
	if ('welcome'== document.location.search) document.location.search='';
	
	this.logga = function(x) {
		/*if (this.ta) this.ta.value += x + '\n';*/ /*console.info(x);*/
		try{console.info(x);}
		catch(e){}
	}

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
			 		//this.logga('not handled: '+o.type);
					break;
			}
		}
 		
		frm.disabled = false;
		elt.style.display = 'none';
	}

	this.loader = function() {
		fapp.lang = document.getElementsByTagName('html')[0].lang;
		if ('sv'==fapp.lang) {
			fapp.obl_text = "Det finns obligatoriska frågor som ej besvarats.";
			fapp.obl_text2= " Var god besvara ";
			fapp.obl_text3= "fråga";
			fapp.unanswered_text= "Obesvarade frågor har markerats med gul bakgrund."
		} else {
			//english and default is the same, and only needed for foreign languages since 'sv' is the master translation.
			fapp.obl_text = fapp.messageStore_default['obl_text'] = "There are some obligatory questions still unanswered.";
			fapp.obl_text2= fapp.messageStore_default['obl_text2']= " Please address ";
			fapp.obl_text3= fapp.messageStore_default['obl_text3']= "question";
			fapp.unanswered_text= fapp.messageStore_default['unanswered_text'] = "Unanswered questions are marked with a yellow background."

			var o=document.createNode('script');
			o.src='js/translations.js';
			document.getElementById('form').appendNode(o);
		}
		
  		var o=document.forms[0].elements.js;
  		if (o && o.value) o.value='1';
		//js=1 indikerar for "nasta instans" att js finns&funkar.

  		if ('welcome'==document.location.search) document.location.search='';
  		else { 
			var self = this;
			var _this_showanswers = function() {self.showanswers()};
			setTimeout(_this_showanswers, 900); //lite delay sa man hinner se att ngt hander.
		}
		
		if (!location.search.match(/edit/) && !location.hash.match(/edit/)) FancyForm.start(0, { onSelect: fapp.onSelect } );
		this.showPage(1);
		
	}

	/* 
	 * Jump relative to current page
	 * @diff -1 means back one page, 1 means forward one page
	 */
	this.jumpPages = function(diff) {
		if (diff==-1 && 1==this.onpage) return; //inget finns fore sida 1
		var ny=diff+this.onpage, to=document.getElementById('page-' + ny);
		if (!to && 1==diff) this.showPage(0); //efter sista sida kommer "Spara"-sidan
		else this.showPage(ny);
  	}
	
	this.showPage = function(n) {
		if (this.notFirstLoad) { //don't highlight on first visit
			var first = !this.hasAddedHighlights[fapp.onpage];
			var c = this.addHighlights();
			if (c!=0 && first) {
				fapp.message_print();
				return false;
			}
		}
		this.notFirstLoad = true;

 		this.logga('till sida ' + n);
		var to=document.getElementById('page-' + n);
		if (!to) n=1; //page not found -- so show page 1
		for (var i=0; i <= this.maxPages; i++) {
	  		var o=document.getElementById('page-' + i);			
			if (o && o.style) o.style.display = (i==n) ? 'block':'none';
			//if (!o) break;
  		}
				
		this.onpage = n;
		this.setPageClass('on-page-'+n);
		this.currentPageDiv = document.getElementById('page-' + n);
		
				
		if (fapp.mark_unanswered) fapp.message_print();
	}
	
	/*
	 * sets a page class, needed by css rules for marking current page in the page navigator
	 */
	this.setPageClass = function(name) {
		var body = document.getElementsByTagName('body')[0];
		if (!body) return;
		if (!body.className) body.className='on-page-1';
		var class_name = body.className;
		var new_class_name = class_name.replace(/on-page-\w+/, '') + name;
		body.className = new_class_name;
	}
	
	/*
	 * @return the aritmetic sum of all values in arr
	 */
	this.arraySum = function(arr) {
		var sum=0;
		for (var i=0; i<arr.length; i++) {
			sum += arr[i];
		}
		return sum;
	}
	
	/*
	 * Kollar om frågan är besvarad
	 * @param question_div - Frågan som ska kontrolleras
	 * @return 
	 */
	this.isUnanswered = function(question_div) {
		var inputs = question_div.getElements("INPUT");
		return !inputs.some( function(elt) {
			if (!elt || !elt.getValue) return false;
			return elt.getValue();
		} );
	}
	
	/*
	 * Markerar en fråga som obesvarad, om frågan är obligatorisk skrivs frågenumret ut i meddelande-raden.
	 * @param question_div - Frågan som ska markeras
	 * @param isObligatory - Om det är en obligatorisk fråga.
	 */
	this.addHighlight = function(question_div, isObligatory) {
		question_div.addClass("highlight");
		if (isObligatory) fapp.message_add( question_div );
		this.hasAddedHighlights[this.onpage] = true;  //TODO fapp eller this ?
	}
	
	/*
	 * Kollar om en fråga ska bli markerad som obesvarad.
	 * @param question_div - Frågon som ska kontrolleras.
	 * @return om frågan har blivit markerad som obesvarad
	 */
	this.possiblyAddHighlight = function(question_div) {
		var isObligatory = question_div.className.match(/obligatory/);
		if (isObligatory || (fapp.mark_unanswered && 0==fapp.missedQuestions.length)) {
			fapp.addHighlight(question_div, isObligatory);
		}
		return (isObligatory ? 1 : 0);
	}
	
	/*
	 * 
	 */
	this.addHighlights = function() {
		if (window.ie) $(fapp.currentPageDiv.id); //denna rad ska troligen raderas

		var question_divs = $(fapp.currentPageDiv).getElements('DIV.question');
		var all_unanswered = question_divs.filter( fapp.isUnanswered );
		fapp.mark_unanswered = (all_unanswered.length / question_divs.length < 0.3);
		if (0==all_unanswered.length) fapp.mark_unanswered = false;
		
		//alert("this page: " + fapp.mark_unanswered);
		var arr = all_unanswered.map(fapp.possiblyAddHighlight); //depends on fapp.mark_unanswered
		return fapp.arraySum(arr);
	}
	
	/*
	 * Används av funktionerna: findQuestionDiv och findElementDiv.
	 * Används för att hitta ett elementets närmaste DIV-element.
	 * @param elt - Elementet som vi ska hitta DIV-elementet åt.
	 * @param klass - vilken klass DIV:en ska ha, tex. "question" eller "element"
	 * @return DIV:en om den hittar någon annars NULL
	 */
	this.findMyDiv = function(elt,klass) {
		try {
			var re = new RegExp(klass);
		 	for (var i=0; i<9; i++) {
		 		if (elt.className && elt.className.match(re)) return elt;
		  		elt = elt.parentNode;
		 	}
		} catch(NS_ERROR_UNEXPECTED) { console.info("test catch"); return null; }
	}

	/*
	 * Hittar letar efter ett elements parentNode som är en DIV med klassen "Question".
	 * @param elt - Elementet som vi ska försöka hitta en question-div till.
	 * @return en question-div om den hittar någon annars NULL
	 */
	this.findQuestionDiv = function(elt) {
		return fapp.findMyDiv(elt, 'question');
	}
	
	/*
	 * Hittar letar efter ett elements parentNode som är en DIV med klassen "Element".
	 * @param elt - Elementet som vi ska försöka hitta en element-div till.
	 * @return en element-div om den hittar någon annars NULL
	 */
	this.findElementDiv = function(elt) {
		return fapp.findMyDiv(elt, 'element');
	}
	
	/*
	 * 
	 */
	this.onSelect = function(event_elt) {
		if (!fapp.hasAddedHighlights[fapp.onpage]) {
			if(!edit_mode) { autoSave(true); }
			return;
		}
		var elt = fapp.findQuestionDiv(event_elt);
		elt.removeClass("highlight");
		if (fapp.missedQuestions.hasKey(elt.id)) {
			fapp.missedQuestions.remove(elt.id);
		}
		fapp.message_print();
	}

	/*
	 *	Funktionen används för att lägga till missade obligatoriska frågor till #message
	 *	@param 
	 *	@return true om den lyckades
	 */
	this.message_add = function(elt) {
		if (fapp.missedQuestions.hasKey(elt.id)) return true;
		fapp.missedQuestions.set(elt.id, fapp.message_link( elt.id, elt.getElements('span.number')[0].innerHTML, this.onpage ));
		return false;
	}

	
	this.messageStore_default = { }
	
	/*
	 * Översätter textmeddelanden.
	 */
	this.tran = function(which) {
		fapp.messageStore = (msgStore && msgStore[fapp.lang]) ? msgStore[fapp.lang] : fapp.messageStore_default; //caching
		var txt = fapp.store[which] || fapp.messageStore_default[which]; //if untranslated, falls back to default translations 
		fapp[which] = txt; //caching
		return txt;
	}

	/*
	 *	Skriver ut ett meddelande ifall man missat:  obligatoriska frågor, fåtal vanliga frågor
	 */
	this.message_print = function() {
		var messageBox = document.getElementById("message");
		if (!messageBox) return;

		var numMissed = fapp.missedQuestions.length;
		var messageString = "&nbsp;";
		if (numMissed > 0) {
			messageString = fapp.obl_text || fapp.tran('obl_text');
			var obl_text3 = fapp.obl_text3 || fapp.tran('obl_text3');
			var links = fapp.missedQuestions.values();
			var dots = "";
			if (links.length>3) { links.length=3; dots=".."; }
			var txt = links.join(", ") + dots;
			messageString += fapp.obl_text2 || fapp.tran('obl_text2');
			messageString += txt + '.';
		} else if (fapp.mark_unanswered && (0<fapp.currentPageDiv.getElements('DIV.highlight').length)) {
			messageString = fapp.unanswered_text || fapp.tran('unanswered_text');
		}
		//if (!fapp.mark_unanswered) alert('not mark_unanswered');
		messageBox.innerHTML = messageString;
		messageBox.style.visibility = (messageString!="&nbsp;") ? "visible" : "hidden";
	}
	/*
	this.message_link = function(id, number) {	
		var page_number = this.find_question(id);
		var link = '<a';
		if(page_number != false) { link += ' href="#' + id + '" onclick="' + fapp.showPage(page_number) + '; false;"'; }
		link += '>' + this.obl_text3 + ' ' + number + '</a>';
		
		return link;
		// return '<a href="#' + id + '">' + this.obl_text3 + " " + number + '</a>';
	}*/
	
	/*
	 * Bygger ihop en html-länk.
	 * @param id - frågans ID
	 * @param number - frågans nummer
	 * @param page - vilken sida frågan ligger på
	 */
	this.message_link = function(id, number, page) {
	return '<a href="#' + id + '" onclick="fapp.showPage(' + page + ')">' + this.obl_text3 + " " + number + '</a>';
	}
	
	/* Anropas vid aktivering av redigeringsläge */
	this.pause = function() {
		autoSave(false); FancyForm.initing=1;
	}

	/* Anropas vid deaktivering av redigeringsläge */
	this.resume = function() {
	/* TODO Senare(tm) */
	}
}



//code for version 0.94 ? :-)

//FancyForm depends on mootools Element.Event

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
		if (!location.search.match(/edit/))
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
	addLoadEvent(function() {init();});
	addLoadEvent(function() {
		var textarea = document.getElementsByTagName("textarea");
		for(var i = 0; i < textarea.length; i++) {
			resize_HTMLTextArea(textarea[i]);
			textarea[i].onchange = function() { resize_HTMLTextArea(this); };
		}
	});	
}

