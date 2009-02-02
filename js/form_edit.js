var edit_mode = false;
var active_theme;

var form_redigerades = null;
var form_sparades = null;

/* A create element helper that can add id, className and innerHTML directly.
 * @param name TagName + '#' + id + '.' + className + '.' + className ...
 * @html innerHTML to be added on the new element (or null to avoid using innerHTML)
 * @return new Element
 * Example: var link2 = dce('a#link2', 'linktext 2');
 */
function dce(name,html) {
	var arr = name.replace(/([$_.#])/g,',$1').split(/,/);
	if (!arr.length) return document.createElement(name);
	var	elt = document.createElement(arr[0]);
	for (var i=1; i<arr.length; i++) {
		var x=arr[i];
		if (x.match(/^[$#]/)) elt.id = x.substring(1,x.length);
		else if (x.match(/^[_.]/)) elt.addClass( x.substring(1,x.length) );
	}
	if (html) elt.innerHTML = html;
	return elt;
}

var edit_link;
/*
 * Anropas av init() i bigform-2.js
 */
function form_edit_init() {
	document.onkeypress = keyHandler;
	document.onmousedown = mouseHandler;

	/* Placerar länk Redigera i status-diven */
	var statusbar = $('statusbar');
	edit_link = dce("a#editlink.deactive", "Redigera");
	edit_link.title = "Öppna/stäng redigeringsläge här";
	edit_link.setAttribute("accesskey", "q");
	edit_link.onclick = function() { 
		if( location.search.match(/\&edit=1/) ) {
			if(form_redigerades > form_sparades) {
				var answer = confirm ("Är du säker på att du vill stänga av redigeringsläget?\nAlla dina ändringar kommer försvinna.");
				if (!answer) { return false; }
			}
			location.search = location.search.replace(/\&edit=1/,'');
		} else { location.search +='&edit=1'; }
	}
	statusbar.appendChild(edit_link);
	if (location.search.match(/edit/)) toggleEditMode();
}



/*
 * Slår på/av redigeringsläget
 * Vid laddning av sidan anropas denna av en onload-event (se bigform-2.js)
 * 
 */
function toggleEditMode() {
	if(edit_link.className == "deactive") { // Knappen var "av", så knappen slås på.
	
		edit_mode = true;
		showEditLink();
		edit_link.className = "active";			
		var f = $('form_');	
		f.getElements('label').each( function(elt) {elt.addEvent('click',function(){if(edit_mode) elt.inlineEdit()}); } );
		f.getElements('.question').each(function(elt) { elt.title = "Dubbelklicka för frågans inställningar"; elt.addEvent('dblclick',function(){ if(edit_mode) showEditBox(this);});});
		f.getElements('.text').each(function(elt) { elt.title = "Dubbelklicka för att redigera text"; elt.addEvent('dblclick',function(){ if(edit_mode) edit_text_2(this);});});
		f.getElements('.scale-group .headline').each( function(elt) { elt.title = "Dubbelklicka för likert-gruppens inställningar"; elt.addEvent('dblclick',function(){ if(edit_mode) showGroupEditBox(this.parentNode);}); } );
		f.getElements('.question h5 .qtext').each( function(elt) {elt.addEvent('click',function(){if(edit_mode) /*elt.inlineEdit()*/ edit_text_2(elt)}); } );
		f.getElements('.question h5 .number').each( function(elt) {elt.addEvent('click',function(){ if(edit_mode) /*elt.inlineEdit()*/ edit_text_2(elt)}); } );	
		
		var toolbar = dce("div#toolbar", "<p><strong>Redigerar…</strong></p>");
		document.getElementsByTagName("body")[0].appendChild(toolbar);
		
		var tool_p = toolbar.getElementsByTagName("p")[0];
		
		var a = dce("a", "Lägg till fråga");
		a.setAttribute("href", "#");

		a.onclick = function () { new_question(); return false; }

		var numbers = dce("a", "Ordna frågenummer");
		numbers.href = "#";
		numbers.onclick = function() { refreshNumbers(); return false; }

		var aa = dce("a", "Bygg");
		aa.setAttribute("href", "#statistik");
		aa.onclick = function() {
			var textarea_div = dce("div#statistik",null);

			var textarea_form = document.createElement("form");
			textarea_form.setAttribute("method", "post");
			textarea_form.setAttribute("action", "bygg_statistik.asp");
			var textarea = document.createElement("textarea");
			textarea.setAttribute("cols", "80%");
			textarea.setAttribute("rows", "2");
			textarea.setAttribute("name", "String");
			textarea.style.display = "none";
			var textarea_link = document.createElement("input");
			var fq = fetch_questions();
			for(var i=0; i<fq.length; i++) { textarea.value += fq[i];}
			
			textarea_link.type = "submit";
			textarea_link.value = "Spara resultattexter";
			
			textarea_form.appendChild(textarea);
			textarea_form.appendChild(textarea_link);

			textarea_div.appendChild(textarea_form);
			$("addQuestion").appendChild(textarea_div);
			
			//console.info(document.getElementsByTagName("html")[0].innerHTML);
			return false;
		}
		
		var spara = dce("a", "Spara");
		spara.setAttribute("href", "#bygg");
		spara.onclick = function() { save(true, true);return false; }
		
		var spara_no_bg = dce("a","Spara&visa");
		spara_no_bg.setAttribute("href", "#bygg2");
		spara_no_bg.onclick = function() { save(false, false); return false; }
		
		var manual = dce("a", "Om frågeredigering");
		manual.href = "#";
		manual.onclick = function() { alert("Hjälptext kommer senare...\nCTRL + q = Stäng/öppna redigeringsläge\nCTRL + u = Flytta markerat element uppåt\nCTRL + n = Flytta markerat element ner"); return false; }
		
		var toggleTheme = dce("a", "Färgtema");
		toggleTheme.href = "#";
		toggleTheme.onclick = function() {
			if(active_theme == "yellow") { switchStyleSheet(fapp.blue); active_theme="blue"; this.innerHTML = "Färgtema blå"; }
			else { switchStyleSheet(fapp.yellow); active_theme="yellow"; this.innerHTML = "Färgtema gul"; }
			return false;
		}
				
		var fast_import = dce("a", "Snabb-import");
		fast_import.href = "#";
		fast_import.onclick = function() { show_fast_import(toolbar); return false; }
		
		var zebra = dce("a", "Randa om");
		zebra.href="#toolbar";
		zebra.onclick = function() { refreshOdd(); return false; }
		
		// Omnumrera | Randa om | Färgtema ---- Ny fråga | Snabbimport --- Debug: Form-spara, resultattxt  --- Om...
		var tabb = "\u00a0\u00a0\u00a0\u00a0\u00a0";
		
		tool_p.appendChild(document.createTextNode(tabb));
		tool_p.appendChild(numbers);
		tool_p.appendChild(document.createTextNode(" | "));
		tool_p.appendChild(zebra);
		tool_p.appendChild(document.createTextNode(" | "));
		tool_p.appendChild(toggleTheme);
		tool_p.appendChild(document.createTextNode(tabb));
		
		tool_p.appendChild(a);
		tool_p.appendChild(document.createTextNode(" | "));
		tool_p.appendChild(fast_import);
		tool_p.appendChild(document.createTextNode(tabb + "Debug: "));
		tool_p.appendChild(spara);
		tool_p.appendChild(document.createTextNode(" | "));
		tool_p.appendChild(spara_no_bg);
		tool_p.appendChild(document.createTextNode(" | "));
		tool_p.appendChild(aa);
		tool_p.appendChild(document.createTextNode(tabb));
		tool_p.appendChild(manual);
			
	} else {
		if(form_redigerades > form_sparades) {
			alert("här ska det komma upp en fråga");
			var answer = confirm ("Är du säker på att du vill stänga av redigeringsläget?\nAlla dina ändringar kommer försvinna.");
			if (!answer) { return false; } 
		}	
		edit_mode = false;
		var f = $('form_');
		f.getElements('.question').each(function(elt) { elt.title = "" });
		f.getElements('.text').each(function(elt) { elt.title = "" });
		f.getElements('.scale-group .headline').each( function(elt) { elt.title = ""});
		
		
		edit_link.className = "deactive";
		removeEditLink();
		
		var edit_boxes = document.getElements('.edit');
		edit_boxes.each(function(elt) { elt.parentNode.removeChild(elt); });
		
		$('form_').getElements('DIV.selected_question').each( setSelect );
		
		var toolbar = document.getElementById("toolbar");
		toolbar.parentNode.removeChild(toolbar);
		
		// Här måste alla inlineEdit tas bort från click-event
	}
	//window.location.hash="toolbar";
}

/**
 * Visar snabb-import rutan.
 * @param where - Vart snabb-importen ska visas. I vilket DOM-element den ska placeras i
 */
function show_fast_import(where) {
	var import_box = document.getElementById("import");
	if(!import_box) {
		import_box = dce("form#import", '<p><br>Importera: <select><option>Placering</option><option>1</option><option>2</option></select> <a href="#">Infoga</a> <a href="#">Ersätt</a> <a href="#">Infoga allt</a></p><textarea style="font-size: 102%;" cols="120" rows="10"></textarea>');
		import_box.name = "import";
		where.appendChild(import_box);
	} else {
		import_box.parentNode.removeChild(import_box);
	}
}

/**
 * Visar "Lägg till fråga" länk längst ner
 * Används av toggleEditMode()
 */
function showEditLink() {
	var addQuestion = $("addQuestion");
	if (addQuestion) {
	    addQuestion = addQuestion.parentNode.removeChild(addQuestion);  //(Ta bort ifall den fanns?? Eller vad haender har?)
	}
	else addQuestion = dce("p#addQuestion"); // Skapar createQuestion p-elementet

	if (!fapp.currentPageDiv) alert('Problem med addQuestion. Orsak: toggleEditMode ska anropas EFTER onload-laddning av frageapp(fapp).');
	if (edit_mode) fapp.currentPageDiv.appendChild(addQuestion);
}

/**
 * Tar bort "Lägg till fråga" länken längst ner.
 * Används av toggleEditMode()
 */
function removeEditLink() {
	var addQuestion = document.getElementById("addQuestion");
	var createQuestion = document.getElementById("createQuestion");
	if(addQuestion) { addQuestion.parentNode.removeChild(addQuestion); }
	if(createQuestion) { createQuestion.parentNode.removeChild(createQuestion); }
}

/**
 * Anropas när formuläret har blivit redigerats.
 * @return Date-objekt
 */
function form_har_redigerats() {
	form_redigerades = new Date();
	return form_redigerades;
}

/**
 * Anropas när formuläret har sparats.
 * @return Date-objekt
 */
function form_har_sparats() {
	form_sparades = new Date();
	return form_sparades;
}

var autoEditSave_ = null;

/**
 * Sparar automatiskt formuläret varje minut om någon ändring har gjort sen den sist sparades.
 * @param run - boolean om autosparning ska ske.
 */
function autoEditSave(run) {
	console.info("AutoEditsparning: on");
	if (!run && autoEditSave_) clearInterval(autoEditSave_);
	if (run)  {
		if(form_redigerades > form_sparades) save();
		if(!autoEditSave_) autoEditSave_ = setInterval("autoEditSave(true)", 60 * 1 * 1000);
	}
}

/**
 * Sparar formuläret (källkoden)
 * @start_autosave - boolean om autosparning ska slås på.
 */
function save(start_autosave, in_background) {
	var textarea_div = document.createElement("div");
	textarea_div.id = "bygg";
	var textarea_form = document.createElement("form");
	textarea_form.setAttribute("name", "textareaForm");
	textarea_form.setAttribute("method", "post");
	textarea_form.setAttribute("action", path("form_spara.asp"));
	textarea_form.id = "textareaform";
	var textarea = document.createElement("textarea");
	textarea.setAttribute("cols", "80%");
	textarea.setAttribute("rows", "2");
	textarea.setAttribute("name", "html");
	textarea.style.display = "none";
	var textarea_link = document.createElement("input");
	
	var editlink = document.getElementById("editlink");
	var editlink_parent = editlink.parentNode;
	var addQuestion = document.getElementById("addQuestion");
	var addQuestion_parent = addQuestion.parentNode;
	editlink_parent.removeChild(editlink);
	//var toolbar = document.getElementById("toolbar");
	//if(toolbar) toolbar.parentNode.removeChild(toolbar);
	
	
	if(addQuestion) { addQuestion.parentNode.removeChild(addQuestion); }
	
	//var inner_html = document.getElementsByTagName("html")[0].innerHTML;
	//var inner_html = document.getElementById("form_").innerHTML;

	var innerClone = $("form_");
	var edit_box = innerClone.getElement(".textEdit");
	if(edit_box) reverse_edit_text(edit_box);
	
	innerClone.getElements('.question').each(function(elt) { elt.removeAttribute('title') });
	innerClone.getElements('.text').each(function(elt) { elt.removeAttribute('title') });
	innerClone.getElements('.scale-group .headline').each(function(elt) { elt.removeAttribute('title') });
	
	
	var inner_html = innerClone.innerHTML;

	var pat = /style="position: absolute; left: -9999px;" /gi;
	inner_html = inner_html.replace(/style=\"position: absolute; left: -9999px;\" /gi, "");
	//inner_html = inner_html.replace(/ style="LEFT: -9999px; POSITION: absolute"/gi, '');
	inner_html = inner_html.replace(/ style=\"LEFT: -9999px; POSITION: absolute\"/gi, '');	
	inner_html = inner_html.replace(/ class=\"unselected\"/g, "");
	inner_html = inner_html.replace(/ class=\"selected\"/g, "");
	inner_html = inner_html.replace(/ class=\"checked\"/g, "");
	inner_html = inner_html.replace(/ class=\"unchecked\"/g, "");
	inner_html = inner_html.replace(/<li><label class=\"textfield\">/g, '<li class="checkedtextfield textfield"><label class="textfield">');	
	inner_html = inner_html.replace(/<div style=\"display: block;\"/g, '<div');
	inner_html = inner_html.replace(/<div style=\"display: none;\"/g, '<div');

	inner_html= inner_html.replace(/\n[ \t]*[\r\n]+/g, '\n');
	inner_html= inner_html.replace(/^[ \t]*[\r\n]+/g, '')
	orginal_html= orginal_html.replace(/\n[ \t]*[\r\n]+/g, '\n');
	orginal_html= orginal_html.replace(/^[ \t]*[\r\n]+/g, '');
	
	inner_html = inner_html.replace(/title=\"\.*\"/gi, '');
	orginal_html = orginal_html.replace(/title=\"\.*\"/gi, '');
	
	//alert(orginal_html == inner_html);
	textarea.value = inner_html;
	
	//fapp.logga(inner_html);
	//textarea.value = orginal_html;
	
	textarea_link.type = "submit";
	textarea_link.value = "Spara";
	
	
	textarea_form.appendChild(textarea);
	textarea_form.appendChild(textarea_link);
	textarea_div.appendChild(textarea_form);
	
	editlink_parent.appendChild(editlink);
	addQuestion_parent.appendChild(addQuestion);
	
	var title = document.createElement("input");
	title.value = document.getElementsByTagName("h1")[0].innerHTML;
	title.name = "title";
	title.type = "hidden";
	
	var theme = document.createElement("input");
	theme.value = active_theme;
	theme.name = "theme";
	theme.type = "hidden";
	
	var aq = $("addQuestion");
	textarea_form.appendChild(title);
	textarea_form.appendChild(theme);
	aq.appendChild(textarea_div);
	
	var textareaForm = document.getElementById("textareaform");
	var saved = document.getElementById("saved");
	var date = new Date();
	
	if(!in_background) textareaForm.submit();
	else try {
		saved.innerHTML = " Sparar... (" + humanTime(date) + ")";
		textareaForm.send({
			onComplete: function() {
			    date = form_har_sparats();  //Gor mootools nagot skumt, eller hur kommer det sig
				saved.innerHTML = " Sparades kl " + humanTime(date); //att saved ar atkomlig fran onComplete-funktionen?
			}
		});
	} catch(e) {
		console.warn("Kunde inte spara formuläret via " + textareaForm.getAttribute("action") + " -- Feltext: " + e.description);
		saved.innerHTML = " <abbr title='" + e.description + "'>Misslyckades</abbr> med att spara formuläret, kl " + humanTime(date);
	}
	
	textarea_div.parentNode.removeChild(textarea_div);
		
	if(start_autosave) autoEditSave(true);
}

/**
 * Formaterar klockslag med 0-utfyllnad.
 * @return En textsträng
 */
function humanTime(d) {
	var h=d.getHours(),m=d.getMinutes();
	return (h<10 ? "0" : "") + h + ":" + (m<10 ? "0" : "") + m;
}

/**
 * Fångar in alla frågor. Används för att bygga resultattext tex.
 * @return En textsträng med alla frågor formaterat så att servern förstår.
 */
function fetch_questions() {
	var questions = document.getElements(".question");
	var strings = new Array();
	
	//console.group("To: bygg_statistik.asp");
	for (var i=0; i<questions.length; i++) {
		var question_text = $(questions[i]).getElement(".qtext").innerHTML;
		
		var div_text = $(questions[i]).getElements("DIV.qtext");
		for(var j = 0; j < div_text.length; j++) { question_text += '\n' + div_text[j].innerHTML; }
		
		var question_type = "-";
		var question_have_other = "";
		if(!questions[i].parentNode.hasClass("scale-group")) {
			var labels = $(questions[i]).getElements(".answer label");
			
			for (var x=0; x<labels.length;x++) {
				var children = labels[x].childNodes;
				for (var y=0; y<children.length;y++) {
					if(children[y].nodeName == "SPAN") {
						question_text += "|" + children[y].innerHTML;
					} else if (children[y].nodeType == 3 && children[y].data != " ") {
						question_text += "|" + children[y].data;
					}
				}
				if(labels[x].parentNode.checkedtextfield || labels[x].parentNode.radiotextfield) { question_have_other = "last-is-textfield"; }
			}
				
		var inputs = $(questions[i]).getElements(".answer input");
		if(inputs[0]) {
			if(inputs[0].hasClass("r")) { question_type = "-5"; }
			else if(inputs[0].hasClass("cb")) { question_type = "8"; }
		}
		if(questions[i].hasClass("big-text")) { question_type = "-1"; }
		} else { question_type = "0"; }
		
		var string = questions[i].id + "," + question_type + ",#" + question_text + "#," + questions[i].className + " " + question_have_other + "\n\n";
		//console.info(string);
		strings.push(string);
	}
	//console.groupEnd();
	return strings;
}

/**
 * Answer Klass
 * {?} Tveksam om det används 
 */
var Answer = function() {
	var questionType = null;
	var label = null;
	var value = null;
	var name = null;
}

/**
 * ÄNDRA STYLESHEET
 * 
 * @param name - namnet på css-stylesheet filen.
 */
function switchStyleSheet(name) {
	if(!window.ie) {
		var linkTag, linkTitle = "t_" + name;
		var linksArray = document.getElementsByTagName("link");

		for(var linkNum=0; linkNum<linksArray.length; linkNum++) {
			linkTag = linksArray[linkNum];
			if(linkTag.getAttribute("rel") != null) {
				if(linkTag.getAttribute("rel").match(/^sty|^alt/i)) {

					if (linkTag.getAttribute("title") == linkTitle) {
						linkTag.disabled = false;
					} else if (linkTag.getAttribute("title")) {
						linkTag.disabled = true;
					}

				}
			}
		}
	}
	else {
		var size = document.styleSheets.length;
		if (document.styleSheets[3].href != null) {
			document.styleSheets[3].href = "style/t_" + name + ".css";
		}
	}
}

/**
 * Används när man vill att ett textfält ska innehålla text som försvinner vid FOCUS.
 * @param element - textfältet.
 * @param input_value - vad som ska stå i textfältet.
 * @param font-color - textens färg när fältet inte är i focus.
 */
function setDefaultInputEvents(element, input_value, font_color) {
	if (element.nodeName.toLowerCase() == "input") {
		element.style.color = font_color;
		element.value = input_value;
		element.onclick = function() {
			if (element.value == input_value) {
				element.value = "";
				element.style.color = "";
			}
		}
		element.onblur = function() {
			if (element.value == "") { 
				element.value = input_value;
				element.style.color = font_color;
			}
		}
	} else { alert("ERROR: setDefaultInputEvents(...) -> fel nodeName. Vill inte ha ["+element.nodeName.toLowerCase()+"]"); }
}

var createQuestion_last = null;
var createQuestion_type = null;
var createQuestion_on = false; 

/**
 * Visar editbox för att skapa nya frågor.
 *
 */
function new_question() {
	if (!createQuestion_on) {
		
		var div_question = new Element('div', {
		    'id': 'createQuestion'
		});
		
		
		var form = document.createElement("form");
		form.setAttribute("name", "createForm");
		var p = document.createElement("p");
		
		var select = document.createElement("select");
		select.name = "question_type";
		
		var option;
		
		/* De olika typer av element man kan skapa i formuläret */
		var select_values = new Array(	"typ",	"checkbox",		"textfield",	"textarea", 		"radio", 		"scale", 		"text");
		var select_text = new Array(	"Typ",	"Kryssrutor",	"Textfält",		"Stort textfält", 	"Radioknappar",	"Likert-grupp",	"Fritext");
		
		for (var i=0; i < select_values.length; i++) {
			option = document.createElement("option");
			option.value = select_values[i];
		
			if (i == 0) {
				option.style.color = "#666";
			} else {
				option.style.color = "#000";
			}
			
			option.appendChild(document.createTextNode(select_text[i]));
			select.appendChild(option);
		}
		
		select.onchange = function() {
			var options = select.getElementsByTagName("option");
			for (var i=0; i < options.length; i++) {
				if(options[i].selected) { show_spec(options[i].value); }
			}
		}
		var link_p = document.createElement("p");
		var a = dce("a", "Färdig");
		a.href = "#addQuestion";
		$(a).onclick = function() {  //$() behovs for att kunna anvanda this har langre ned (korrekt uppfattat ?)
			//question("create", document.getElementById('createQuestion'));
			old_question("create", document.getElementById('createQuestion'));
			
			delete_question(this.parentNode.parentNode);
			return false;
		};
		link_p.appendChild(a);
		
		var select = p.appendChild(select);
		p.appendChild(document.createElement("br"));
		form.appendChild(p);
		
		var form = div_question.appendChild(form);  //fulhack-varning
		
		var spec = dce("div#spec",null);
		form.appendChild(spec);
		
		form.appendChild(link_p);
		
		var addQuestion = document.getElementById("addQuestion");
		addQuestion.parentNode.insertBefore(div_question, addQuestion);
		
		select.focus();
		createQuestion_on = true;
		
	}
	else {
		question("create", null)
	}
}

/**
 * Visar editbox för scale-group
 * Hämtar/kollar vilken skala scale-groupen har och hämtar frågornas rubriker.
 * @param group - en scale-group
 */
function showGroupEditBox(group) {
	var edit_div = $(group).getElement('.edit');
	if (!edit_div) {
		edit_div = document.createElement("div");
		var form = document.createElement("form");
		edit_div.className = "edit";
		var menu_div = document.createElement("div");
		menu_div.id = "menu";
		menu_div.className = "clearfix";
		var menu = document.createElement("ul");
		menu.className = "menu";
		menu_div.appendChild(menu);
		
		var save_li = document.createElement("li");
		var save_a = document.createElement("a");
		save_a.appendChild(document.createTextNode("OK"));
		save_li.appendChild(save_a);
		menu.appendChild(save_li);
		save_a.onclick = function() { _group("edit", this.parentNode.parentNode.parentNode.parentNode.parentNode); closeEditBox(group, null); return false; };
		save_a.href = "#";
		
		var close_li = document.createElement("li");
		var close_a = document.createElement("a");
		close_a.appendChild(document.createTextNode("Avbryt"));
		close_li.appendChild(close_a);
		menu.appendChild(close_li);
		close_a.onclick = function() { closeEditBox(group, null); return false; };
		close_a.href = "#";
		
		var remove_li = document.createElement("li");
		var remove_a = document.createElement("a");
		remove_a.appendChild(document.createTextNode("Ta bort"));
		remove_li.appendChild(remove_a);
		menu.appendChild(remove_li);
		remove_a.onclick = function() { delete_question(this.parentNode.parentNode.parentNode.parentNode.parentNode); return false; };
		remove_a.href = "#";
		
		var input = document.createElement("input");
		input.type = "text";
		input.name = "headline";
		input.style.width = "300px";
		var input_label = document.createTextNode("Rubrik ");
		var headline = group.getElement(".headline h4");
		if(headline && headline.parentNode.className != "grade") { input.value = headline.innerHTML; }

		
		var scale = document.createElement("select");
		scale.name = "scale";
		
		var likert4 = document.createElement("option");
		var likert5 = document.createElement("option");
		var likert4t = document.createElement("option");
		var likert5t = document.createElement("option");
		
		
		likert4.value = "likert4";
		likert5.value = "likert5";
		likert4t.value = "likert4t";
		likert5t.value = "likert5t";
		
		likert4.appendChild(document.createTextNode("1-4"));
		likert5.appendChild(document.createTextNode("1-5"));
		likert4t.appendChild(document.createTextNode("1-4 Text"));
		likert5t.appendChild(document.createTextNode("1+3+5 Text"));
		
		scale.appendChild(likert4);
		scale.appendChild(likert5);
		scale.appendChild(likert4t);
		scale.appendChild(likert5t);

		
		if(group.hasClass("likert4")) { likert4.selected = "selected" }
		else if (group.hasClass("likert5")) { likert5.selected = "selected" }
		else if (group.hasClass("likert4t")) { likert4t.selected = "selected" }
		else if (group.hasClass("likert5t")) { likert5t.selected = "selected" }
				
		
		var v = document.createElement("input");
		v.type = "checkbox";
		v.name = "vetej";
		var label_v = document.createElement("label");
		label_v.innerHTML = "<strong>Vet ej</strong> ";
		
		
		var p = document.createElement("input");
		p.type = "checkbox";
		p.name = "prio";
		var label_p = document.createElement("label");
		label_p.innerHTML = "<strong>Prioritet</strong> ";
		
		var o = document.createElement("input");
		o.type = "checkbox";
		o.name = "omvand";
		var label_o = document.createElement("label");
		label_o.innerHTML = "<strong>Omvänd</strong> ";
		
		form.appendChild(menu_div);
		form.appendChild(input_label);
		form.appendChild(input);
		form.appendChild(document.createTextNode(" Skala: "));
		form.appendChild(scale);
		form.appendChild(document.createTextNode(" Visa: "));
		form.appendChild(v);
		form.appendChild(label_v);
		form.appendChild(p);
		form.appendChild(label_p);
		form.appendChild(o);
		form.appendChild(label_o);
		
		var questions_ul = document.createElement("ul");
		questions_ul.className = "clearfix";
		var questions =  group.getElements(".question");
		for (var i=0;i<questions.length; i++) {
			var questions_li = document.createElement("li");
			var question_input = document.createElement("input");
			question_input.name = "question_text";
			
			question_input.type = "text";
			question_input.value = $(questions[i]).getElement(".qtext").innerHTML;
			
			questions_li.className = "radio";
			questions_li.appendChild(question_input);
		
			var removeField = document.createElement("div");
			removeField.className = "delete";
			removeField.onclick = function() {
				var input = this.parentNode;
				input.parentNode.removeChild(input);
				return false;
			};
			var removeField_span = document.createElement("span");
			removeField_span.appendChild(document.createTextNode("X"));
			removeField.appendChild(removeField_span);
			questions_li.appendChild(removeField);
		}

		var next_li = document.createElement("li");
		next_li.className = "radio";
		var next_input = document.createElement("input");
		next_input.type = "text";
		next_input.name = "question_text";
		next_input.className = "disable";
		next_input.onclick = function() {
			this.className = "";
			var li = document.createElement("li");
			li.className = "radio";
			var new_input = document.createElement("input");
			new_input.name = "question_text";
			new_input.type = "text";
			new_input.className = "disable";
			new_input.onclick = this.onclick;
			new_input.onfocus = this.onclick;
			this.onclick = null;
			this.onfocus = null;
		
			/* Tabort-krysset */
			var removeField = document.createElement("div");
			removeField.className = "delete";
			removeField.onclick = function() {
				var input = this.parentNode;
				input.parentNode.removeChild(input);
				return false;
			};
			var removeField_span = document.createElement("span");
			removeField_span.appendChild(document.createTextNode("X"));
			removeField.appendChild(removeField_span);
			this.parentNode.appendChild(removeField);
		
			li.appendChild(new_input);
			insertAfter(li, this.parentNode);
		}
		next_input.onfocus = next_input.onclick;
		next_li.appendChild(next_input);

		form.appendChild(questions_ul);
		edit_div.appendChild(form);
		
		group.appendChild(edit_div);
		
		if($(group).hasClass("v")) { v.checked = "checked"; }
		if($(group).hasClass("priority")) { p.checked = "checked"; }
	}
}
/*
 * Liknar question(action, question), fast används vid scale-group. Just nu sköter den bara om 'EDIT', Skapande av nya scale-group
 * skapas via old_question just nu.
 */
function _group(action, group) {
	var form = null;

	/* Kontrollerar att 'action' parametern är rätt */
	if (action.toLowerCase() != "create" && action.toLowerCase() != "edit") {
		alert("[question(action, question)]: kan inte utföra '" + action + "', du kanske menade 'create' eller 'edit'?");
	}
	
	form = group.getElementsByTagName("form")[0];

	if (!form) { alert("[_group(action, group)]: hittade inget formulär att hämta från."); }
		
	/*	Loopar igenom formuläret för att leta efter ett fält med class="question_text".
	 *	For-loopen kan fyllas på om fler fält ska hittas.
	 */
	var _headline = null;
	var _scale = null;
	var _vetej = false;
	var _prio = false;
	var _answers = new Array();
	for (var count = 0; count < form.elements.length; count++) {
		if (form.elements[count].name == "headline") {
			_headline = form.elements[count].value;
		}
		else if (form.elements[count].name == "scale") {
			var options = form.elements[count].getElementsByTagName("option");
			for (var i=0; i < options.length; i++) {
				if(options[i].selected) { _scale = options[i].value; }
			}
		}
		else if (form.elements[count].name == "vetej" && form.elements[count].checked) { _vetej = true; }
		else if (form.elements[count].name == "prio" && form.elements[count].checked) { _prio = true; }
		else if (form.elements[count].name == "question_text") {
			/* Vi vill bara ha fälten som innehåller någonting. */
			if (form.elements[count].value != "") { _answers.push(form.elements[count]); }		
		}
	}

	var scale_group = $(group).getParent();

	if(_vetej) {
		if(!scale_group.hasClass("v")) { scale_group.addClass("v"); }
	}
	else { scale_group.removeClass("v"); }
	
	if(_prio) {
		if(!scale_group.hasClass("priority")) { scale_group.addClass("priority"); }
	}
	else { scale_group.removeClass("priority"); }
	
	if(_scale) {
		scale_group.className = scale_group.className.replace(/\s*likert\w{1,}/, '');
		scale_group.addClass(_scale);
	}
	
	var headline_div = $(scale_group).getElement(".headline");
	
	var childNode = headline_div.childNodes[0]
	if(childNode.nodeType == 3) { childNode = headline_div.childNodes[1]; }
	if( (childNode.nodeName.toLowerCase() == "h4" && (_headline == "" || _headline == null)) ) {
		/*finns en rubrik och _headline innehåller inget. ta bort h4 elementet. */
		childNode.parentNode.removeChild(childNode); 
	}
	else if ( (childNode.nodeName.toLowerCase() != "h4" && (_headline != "" || _headline != null)) ) {
		/* finns ingen rubrik men _headline innehåller något. Vi behöver en h4! skapa ett h4 element med _headlines innehåll */
		var h4 = document.createElement("h4");
		h4.innerHTML = _headline;
		headline_div.insertBefore(h4, childNode);
		h4.onclick = function() { this.inlineEdit(); }
	}
	else if( (childNode.nodeName.toLowerCase() == "h4" && (_headline != "" || _headline != null)) ) {
		/* det finns en rubrik och _headline innehåller något. Förnya rubrikens innehåll */
		childNode.innerHTML = _headline; 
	}
	update_scale_answer(group.parentNode, _scale.replace(/likert/, ''), _prio, _vetej);	
	//FancyForm.start(0, { onSelect: fapp.onSelect } );	
}

/**
 * Uppdaterar Likert-gruppens skala (inkl. alla likertfrågor inne i likert-gruppen)
 * @param group - Vilken likert-grupp (scale-group) som ska uppdateras
 * @param scale - Vilken skala den ska få, antingen ett heltal eller "5t" eller "4t" för att få text istället för siffror. NULL = 5
 * @param add_prio - boolean om skalan ska ha prioritet.
 * @param add_vetej - boolean om skalan ska ha "Kan ej ta ställning"
 */
function update_scale_answer(group, scale, add_prio, add_vetej) {
	/* ändrar likert-gruppens huvudskala */
	var headline = $(group).getElement(".headline .answer");
	headline.innerHTML = create_scale_answer(null, scale, null, null, add_vetej, false, true).innerHTML;
	
	
	/* ändrar varje likertfrågas skala */
	var questions = $(group).getElements(".question");
	for (var i=0; i < questions.length; i++) {
		var answer = questions[i].getElement(".answer");
		answer.innerHTML = create_scale_answer(questions[i].id.replace(/q/, ''), scale, add_prio, null, add_vetej, false, false).innerHTML;
	}
}

/**
 * Används när man vill uppdatera en frågas svars id och namn.
 */
function update_answers_id(question) {
	var id = generate_id();
	var a = question.getElementsByTagName("a");
	for (var i=0; i < a.length; i++) { 
		if(a[i].name == question.id) a[i].name = a[i].name.replace(/\d+/, id);
	}
	question.id = question.id.replace(/\d+/, id);
	var answers = $(question).getElements("INPUT");
	for(var x=0; x < answers.length; x++) {
		//answers[x].id = answers[x].id.replace(/\d+_\d+/, id + "_" + (x + 1));
		answers[x].name = answers[x].name.replace(/\d+/, id);
	}
	
}


/**
 * Funktionen används för att ändra likertfrågornas skala. Funktionen skapar en ny div class="answer" med den nya skalan.
 * Funktionen går också att använda under skapande processen av en likert fråga (inte bara vid redigering).
 *
 * @param question_number - frågans nummer. Används för till namnen på inputfälten (question.id)
 * @param scale - skalan som ska användas.
 * @param add_prio - om prioritet ska finnas.
 * @param headline - rubriken till svarsalternativen? headline i typ='grade' döljs.
 * @param vetej - om "Kan ej ta ställning" ska vara med.
 * @param answers - array med alla svarsalternativ.
 * @param prio_run - boolean om det är prioritets svaren som körs för den frågan. (Används bara av funktionen själv),sätt till false.
 * @param is_svale_headline - boolean Om det är scale-gruppens rubrik som körs (som ska skapas). (Används bara av funktionen själv).
 * @return en ny och fin div class="answer"
 */
function create_scale_answer(question_number, scale, add_prio, headline, vetej, prio_run, is_scale_headline) {
	var loop_count = 5;
	var scale_text = new Array();
	scale_text["5t"] = new Array("Instämmer inte alls", "Instämmer till liten del", "Instämmer delvis", "Instämmer till stor del", "Instämmer helt");
	scale_text["4t"] = new Array("Instämmer inte alls", "Instämmer till liten del", "Instämmer till stor del", "Instämmer helt");
	
	if(scale) { 
		switch (scale) {
			case '4t': loop_count = 4; break;
			case '5t': loop_count = 5; break;
			default: loop_count = scale; break;
		}
	}
	
	var answer_div = document.createElement("div");
	answer_div.className = "answer";
	var div = document.createElement("div");
	if (prio_run) { div.className = "priority"; }
	else { div.className = "grade"; }
	
	var h4 = document.createElement("h4");
	if(headline) { h4.appendChild(document.createTextNode(headline)); }
	else { h4.appendChild(document.createTextNode("Bedömning")); }
	div.appendChild(h4);
	
	var ul = document.createElement("ul");
	if (is_scale_headline) {
		for (var i=0; i < loop_count; i++) {
			var li = document.createElement("li");
			if(scale == "5t") { li.appendChild(document.createTextNode(scale_text["5t"][i])); }
			else if(scale == "4t") { li.appendChild(document.createTextNode(scale_text["4t"][i])); }
			else { li.appendChild(document.createTextNode(i+1)); }
			ul.appendChild(li);
		}
		
		if(vetej) {
			var li = document.createElement("li");
			li.className = "v";
			li.appendChild(document.createTextNode("Kan ej ta ställning"));
			ul.appendChild(li);
		}
	} else {
		var prefix = "q";
		if (prio_run) { prefix = "p"; }
		
		for (var i=0; i < loop_count; i++) {
			var li = document.createElement("li");
			var label = document.createElement("label");
			var input = document.createElement("input");
			input.className = "r";
			input.name = prefix + question_number;
			//input.id = prefix + question_number + "_" + (i+1);
			input.type = "radio";
			input.value = i + 1;
			var span = document.createElement("span");
			if(scale == "5t") { span.appendChild(document.createTextNode(scale_text["5t"][i])); }
			else if(scale == "4t") { span.appendChild(document.createTextNode(scale_text["4t"][i])); }
			else { span.appendChild(document.createTextNode(i+1)); }
			//span.appendChild(document.createTextNode(i+1));
		
			label.appendChild(input);
			label.appendChild(span);
			li.appendChild(label);
			
			ul.appendChild(li);
		}
		
		if(vetej) {			
			var li = document.createElement("li");
			li.className = "v";
			var label = document.createElement("label");
			var input = document.createElement("input");
			input.className = "r";
			input.name = prefix + question_number;
			//input.id = prefix + question_number + "_" + (loop_count + 1);
			input.type = "radio";
			input.value = -110;
			var span = document.createElement("span");
			span.appendChild(document.createTextNode("Kan ej ta ställning"));
		
			label.appendChild(input);
			label.appendChild(span);
			li.appendChild(label);
		
			ul.appendChild(li);
		}
	}
	
	div.appendChild(ul);
	answer_div.appendChild(div);
	
	if((add_prio == true) && prio_run == false ) {
		answer_div.appendChild(create_scale_answer(question_number, scale, add_prio, "Prioritet", vetej, true, false).childNodes[0]);
	}
	
	
	return answer_div;
}

/**
 * HÄMTAR FORM-FÄLTEN FRÅN EN FRÅGA/EDITBOX.
 * @param question - Frågan som form-fält ska hämtas ifrån.
 * @param getClass - Används om man vill hämta form-fält från ett annat klassnamn i frågan, som standard hämtas fälten från '.answer'.
 * @return en array som innehåller svarsobject (answer).
 * Denna används av question() och showEditBox()
 */
function fetch(question, getClass) {
	if (!getClass) { getClass = ""; }
	//var parent_classname = question.parentNode.className;   Ska bort
	var parent = question.parentNode;
	
	var answers = new Array();
	var nodes;
	if (getClass) { nodes = $(question).getElement(getClass).childNodes[0].childNodes; }
	else { nodes = $(question).getElement(".answer").childNodes; }
	
	for (var i=0; i < nodes.length; i++) {
		if(nodes[i].nodeType == 1) {
			var answer;
			switch(nodes[i].nodeName) {
				case "UL": 
					var li = nodes[i].getElementsByTagName("li");
					for(var x=0; x < li.length; x++) {
						answer = new Answer();
						var label = li[x].getElementsByTagName('label')[0];
						var input = li[x].getElementsByTagName('input')[0];

						if (($(parent).hasClass("column-group") || $(question).hasClass("big-text")) && !getClass) { label = label.getElementsByTagName('span')[0]; }
						if(!input.questionType) {
							switch (input.className) {
								case "r": answer.questionType = "radio"; break;
								case "cb": answer.questionType = "checkbox"; break;
								case "textline":
									/* Kollar vad fältets list-element har för klassnamn, för att avgöra om textfältet är av typ checkbox/radio. */
									if (input.parentNode.parentNode.className == "checked" || input.parentNode.parentNode.className == "unchecked") {
										answer.questionType = "checkbox_line";
									}
									else if (input.parentNode.parentNode.className == "selected" || input.parentNode.parentNode.className == "unselected") {
										answer.questionType = "radio_line";
									}
									else { 
										answer.questionType = "textline";
									}
									break;
							}
						}

						if (label != null) { answer.label = getFirstTextNode(label); }
						if (getClass) {
							answer.label = input.value;
							answer.questionType = input.questionType;
						}
						
						if (answer.questionType == "checkbox_line" || answer.questionType == "radio_line" || answer.questionType == "textline") { answer.value = input.value; }
						
						if ( (!answer.value && getClass.toLowerCase() == "edit")) { /* ingenting */ }
						else { answers.push(answer); }
					}
					break;
					
				case "LABEL":
					if(nodes[i].hasChildNodes()) {
						answer = new Answer();
						if(nodes[i].childNodes[0].name == "question_text") {
							answer.questionType = "question_text";
						} else {
							switch(nodes[i].childNodes[0].nodName) {
								case "INPUT":
									if(nodes[i].childNodes[0].type == "text") { answer.questionType = "textline"; }									
									break;
							}
						}
						answer.label = getFirstTextNode(label);
						answer.value = nodes[i].childNodes[0].value;
						answers.push(answer);
					}
					break;
					
				case "INPUT":
					answer = new Answer();
					if(nodes[i].name == "question_text") { answer.questionType = "question_text"; }
					else { answer.questionType = "textline"; }
					answer.value = nodes[i].value;
					answers.push(answer);
					break;
					
				case "TEXTAREA":
					answer = new Answer();
					answer.questionType = "textarea";
					answer.value = nodes[i].value;
					answers.push(answer);
					
					break;
			}
		}
	}
	
	return answers;
}


/** SKAPA OCH REDIGERA/UPPDATERA EN FRÅGA.
 * @param action - edit/create.
 * @param question - frågan som ska redigeras/uppdaters. Obligatorisk vid redigering/uppdatering.
 *
 * exempel: question("edit", this); question("create", this);
 */
function question(action, question) {
	//console.group(action, question.id);
	var oddIratior = false;
		
	/* Kontrollerar att 'action' parametern är rätt */
	if (action.toLowerCase() != "create" && action.toLowerCase() != "edit") {
		alert("[question(action, question)]: kan inte utföra '" + action + "', du kanske menade 'create' eller 'edit'?");
	}
		
	/*	Loopar igenom formuläret för att leta efter ett fält med class="question_text".
	 *	For-loopen kan fyllas på om fler fält ska hittas.
	 */
	var answers;
	if (action.toLowerCase() == "edit" || action.toLowerCase() == "create") { answers = fetch(question, "." + action); }
	else { answers = fetch(question); }
	
	if (answers == null) { /*console.error("Misslyckades att hämta svarsalternativen från frågan");*/ }	
	
	
	var ID;
	if (action.toLowerCase() == "edit") {
		if (!question) { alert("Saknar parameter (question)"); }
		ID = question.id;
	} else if (action.toLowerCase() == "create") { ID = generate_id(); }
	
	var need_to_prepare_form = false;	//Om prepareForm() måste köras
	var active_ul = null;
	var answer_div = document.createElement("div");
	answer_div.className = "answer";
	
	/* Förbereder div:en 'answer' som frågan kommer innehålla. */
	for (var i = 0; i < answers.length; i++) {
		var answer = answers[i];
		if (answer.questionType == "question_text") { question_text = answers[i].value; }
		if( answer.questionType == "radio" || answer.questionType == "checkbox" || answer.questionType == "checkbox_line" || answer.questionType == "radio_line" ) {
			var li = document.createElement("li");
			var label = document.createElement("label");
			var input = document.createElement("input");
			input.name = ID;
			input.value = i + 1;
			switch(answer.questionType) {
				case "radio":
					input.className = "r";
					//input.id = ID + "_" + i;
					break;
					
				case "checkbox":
					input.className = "cb";
					input.name += "_" + (i + 1);
					//input.id = ID + "_" + i;
					break;
					
				default: input.className = answer.questionType; input.name = ID;
			}
						
			/* Omvandlar alla checkbox_line svarsalternativ till input-typen: 'text'. */
			if(answer.questionType == "checkbox_line") {
				input.type = "text";
				input.className = "textline";
				li.className = "checkedtextfield";
				label.className = "textfield";
				input.name = "t" + input.name.replace(/q/,'') + "_" + (i + 1);
				input.value = null;
				
				label.appendChild(document.createTextNode(answer.label + " "));
				label.appendChild(input);
				li.appendChild(label);
				
				need_to_prepare_form = true;
			} else if(answer.questionType == "radio_line") {
					input.type = "text";
					input.className = "textline";
					li.className = "radiotextfield";
					label.className = "textfield";
					input.name = "t" + input.name.replace(/q/,'') + "_" + (i + 1);
					input.value = null;
					
					label.appendChild(document.createTextNode(answer.label + " "));
					label.appendChild(input);
					li.appendChild(label);

					need_to_prepare_form = true;
			} else {
				input.type = answer.questionType;
				label.appendChild(input);
				if (question.parentNode.className == "column-group" || $(question).hasClass("big-text")) {
					var span = document.createElement("span");
					span.appendChild(document.createTextNode(answer.label));
					label.appendChild(span);
				} else { label.appendChild(document.createTextNode(answer.label)); }
				li.appendChild(label);
			}
						
			if (active_ul != null) {
				/* Stoppar li-elementet i det aktiva ul-elementet */
				active_ul.appendChild(li);
			} else {
				/* Skapar ett ul-element och sätter den som active_ul */
				active_ul = document.createElement("ul");
				active_ul.appendChild(li);
				answer_div.appendChild(active_ul);
			}
		}
		else if (answer.questionType == "text") {
			var input = document.createElement("input");
			input.type = answer.questionType
			input.name = "t" + ID.replace(/q/, '') + "_" + (i +1);
			answer_div.appendChild(input);
			active_ul = null;
		}
		else if (answer.questionType == "textarea") {
			var input = document.createElement("textarea");
			input.name = "t" + ID.replace(/q/, '') + "_" + (i + 1);
			input.setAttribute("cols", "70");
			input.setAttribute("rows", "4");
			answer_div.appendChild(input);
			active_ul = null;
		}
	}
	
	
	if (action.toLowerCase() == "create" && question_text != null && question_text.value != "") {
		
		var div_question = new Element('div', { 'class': 'question clearfix' });
		div_question.id = "q" + generate_id();
		
		var addQuestion = document.getElementById("createQuestion");
		var previous_element = $(addQuestion).getPrevious();
		
		if (previous_element.hasClass("group")) {
			var is_odd = previous_element.getLast("div.question").hasClass("odd");
			if (!is_odd) { div_question.addClass("odd"); oddIratior = true; }
		}
		else {
			if(previous_element.hasClass("question")) {
				if(!previous_element.hasClass("odd")) { div_question.addClass("odd"); oddIratior = true; }
			}
		}
		
		var h5 = document.createElement("h5");
		var number = document.createElement("span");
		number.className = "number";
		var qtxt = document.createElement("span");
		qtxt.className = "qtxt";
		qtxt.appendChild(document.createTextNode(question_text.value));
	
		h5.appendChild(number);
		h5.appendChild(qtxt);
	
		div_question.appendChild(h5);
		div_question.appendChild(answer_div);
		
		fapp.currentPageDiv.appendChild(div_question);
	}
	else if (action.toLowerCase() == "edit") {
		var old_answer = $(question).getElement(".answer");
		question.removeChild(old_answer);
		insertAfter(answer_div, question.getElementsByTagName('h5')[0]);
		
		if (need_to_prepare_form) { prepareForm(); }
		//FancyForm.start(0, { onSelect: fapp.onSelect } );	
	}
}

/**
 * Används för att skapa nya frågor.
 * @param action - "create" & "edit"
 * @param question - används vid action = "edit"
 * {!} Skapa funktionerna måste städas, anledningen till röran är att nya funktionen inte är färdig (en nödlösning)
 */
function old_question(action, question) {
	var oddIratior = false;
	var form = null;
	var generatedID = generate_id();

	if (!generatedID) { generatedID = generate_id(); alert("nytt_försök:" + generatedID);}

	/* Kontrollerar att 'action' parametern är rätt */
	if (action.toLowerCase() != "create" && action.toLowerCase() != "edit") {
		alert("[question(action, question)]: kan inte utföra '" + action + "', du kanske menade 'create' eller 'edit'?");
	}
		
	/* Kollar om parametern 'question' finns */
	if (question == null) { form = document.getElementById("createQuestion").getElementsByTagName("form")[0]; }
	else { form = question.getElementsByTagName('form')[0]; }
	if (!form) { alert("[question(action, question)]: hittade inget formulär att hämta från."); }
		
	/*	Loopar igenom formuläret för att leta efter ett fält med class="question_text".
	 *	For-loopen kan fyllas på om fler fält ska hittas.
	 */
	var question_text = null;
	var answers = new Array();
	for (var count = 0; count < form.elements.length; count++) {
		if (form.elements[count].name == "question_text") {
			question_text = form.elements[count];
		}
		else if (form.elements[count].name == "new_checkbox" || form.elements[count].name == "new_radio" || form.elements[count].name == "new_scale_radio" || form.elements[count].questionType == "radio" || form.elements[count].questionType == "checkbox" || form.elements[count].questionType == "checkbox_line" || form.elements[count].questionType == "radio_line") {
			/* Vi vill bara ha fälten som innehåller någonting. */
			if (form.elements[count].value != "") {
				answers.push(form.elements[count]);
				
			}
		}
		else if (form.elements[count].name == "textfield" || form.elements[count].name == "textarea" || form.elements[count].questionType == "text" || form.elements[count].questionType == "_text" || form.elements[count].questionType == "textarea") {
			/* Textfält och textarea får vara tomma */
			answers.push(form.elements[count]);			
		}
	}	
	
	var need_to_prepare_form = false;	//Om prepareForm() måste köras
	var active_ul = null;
	var answer_div = document.createElement("div");
	answer_div.className = "answer";
	
	/* Förbereder div:en 'answer' som frågan kommer innehålla. */
	for (var i = 0; i < answers.length; i++) {
		var element = answers[i];
		if( element.questionType == "radio" || element.questionType == "checkbox" || element.questionType == "checkbox_line" || element.questionType == "radio_line" ) {
			var li = document.createElement("li");
			var label = document.createElement("label");
			var input = document.createElement("input");
			input.name = "q" + generatedID;
			input.value = i +1;
			
			switch(element.questionType) {
				case "radio": input.className = "r"; break;
				case "checkbox": input.className = "cb"; input.name += "_" + (i+1); break;
				default: input.className = element.questionType;
			}
			
			/* Omvandlar alla checkbox_line svarsalternativ till input-typen: 'text'. */
			if(element.questionType == "checkbox_line") {
				input.type = "text";
				input.className = "textline";
				li.className = "checkedtextfield";
				label.className = "textfield";
				
				label.appendChild(document.createTextNode(answers[i].value));
				label.appendChild(input);
				li.appendChild(label);
				
				need_to_prepare_form = true;
			} else {
				input.type = element.questionType;
				label.appendChild(input);
				label.appendChild(document.createTextNode(answers[i].value));
				li.appendChild(label);
			}
						
			if (active_ul != null) {
				// Stoppar li-elementet i det aktiva ul-elementet
				active_ul.appendChild(li);
			} else {
				// Skapar ett ul-element och sätter den som active_ul
				active_ul = document.createElement("ul");
				active_ul.appendChild(li);
				answer_div.appendChild(active_ul);
			}
		}
		else if (element.questionType == "text") {
			var input = document.createElement("input");
			input.type = element.questionType
			input.name = "t" + generatedID + "_" + (i+1);
			//input.id = "q" + generatedID + "_" + (i+1);
			answer_div.appendChild(input);
			active_ul = null;
		}
		else if (element.questionType == "textarea") {			
			var input = document.createElement("textarea");
			input.name = "t" + generatedID + "_" + (i+1);
			input.setAttribute("cols", "70");
			input.setAttribute("rows", "4");
			//input.id = "q" + generatedID + "_" + (i+1);
			answer_div.appendChild(input);
			active_ul = null;
		}
		else if (element.questionType == "_text") {
			answer_div.className = "text";
			
			answer_div.innerHTML = element.value;
			active_ul = null;
			question_text = "notNull"; // Används inte men question_text får inte vara null om en fråga ska skapas :P
		}
	}
	
	if(action.toLowerCase() == "create" && createQuestion_type == "scale") {
		// En Scale-group skapas.
		
		var scale_group = document.createElement("div");
		scale_group.className="scale-group likert5 v element clearfix";
		
		//headline
		var headline = document.createElement("div");
		headline.className = "headline";
		
		var h4 = document.createElement("h4");
		h4.appendChild(document.createTextNode(question_text.value)); //form.question_text.value
		var an = document.createElement("div");
		an.className="answer";
		
		var gr = document.createElement("div");
		gr.className="grade";
		
		var h4_betyg = document.createElement("h4");
		h4_betyg.appendChild(document.createTextNode("Bedömning"));
		
		var ul = document.createElement("ul");
		var li = document.createElement("li");
		var span = document.createElement("span").appendChild(document.createTextNode("1"));
		li.appendChild(span);
		ul.appendChild(li);
		
		li = document.createElement("li");
		li.appendChild(document.createTextNode("2"));
		ul.appendChild(li);
		
		li = document.createElement("li");
		span = document.createElement("span").appendChild(document.createTextNode("3"));
		li.appendChild(span);
		ul.appendChild(li);
		
		li = document.createElement("li");
		li.appendChild(document.createTextNode("4"));
		ul.appendChild(li);
		
		li = document.createElement("li");
		span = document.createElement("span").appendChild(document.createTextNode("5"));
		li.appendChild(span);
		ul.appendChild(li);
		
		li = document.createElement("li");
		span = document.createElement("span").appendChild(document.createTextNode("Kan ej ta ställning"));
		li.className = "v";
		li.appendChild(span);
		ul.appendChild(li);
		
		headline.appendChild(h4);
		gr.appendChild(h4_betyg);
		gr.appendChild(ul)
		an.appendChild(gr);
		headline.appendChild(an);
		
		scale_group.appendChild(headline);
		
		h4.onclick = function() { edit_text_2(this); };
				
		// slut på headline
		
		
		var fetch = true;
		var item_count = 0;

		while (fetch == true) {
			if(answers != null && answers[item_count] != null) {
				var question = new Element('div', { 'class': 'question element' });
				question.id = "q" + generate_id();
				console.info(question.id);
				if(oddIratior) {
					question.addClass("odd");
					oddIratior = false;
				}
				else {
					oddIratior = true;
				}
				
				if(item_count == 0) { question.addClass("first"); }
				if(answers[item_count + 1] == null) { question.addClass("last"); }
				
				var h5 = document.createElement("h5");

				var number = document.createElement("span");
				number.className = "number";
				
				number.appendChild(document.createTextNode("0")); // Temporär.
				
				var qtxt = document.createElement("span");
				qtxt.className = "qtext";
				qtxt.appendChild( document.createTextNode(answers[item_count].value) ); //radios.item(item_count).value
				h5.appendChild(number);
				
				h5.appendChild(qtxt);
				
				number.onclick = function() { edit_text_2(this); };
				qtxt.onclick = function() { edit_text_2(this); };
				
				
				question.appendChild(h5);
				
				var answer = document.createElement("div");
				answer.className = "answer";

				var grade = document.createElement("ul");
				grade.className = "grade";

				for (var i=0; i < 6; i++) {
					var li = document.createElement("li");
					var label = document.createElement("label");
					var input = document.createElement("input");
					input.type = "radio";
					input.name = question.id;
					//input.id = question.id + "_" + (i + 1);
					input.value = i + 1;
					var span = document.createElement("span");
					if (i == 5) { // 6:e
						li.className = "v";
						span.appendChild(document.createTextNode("Kan ej ta ställning") );
						input.value = -110;
					} else {
						span.appendChild(document.createTextNode(i) );
					}

					label.appendChild(input);
					label.appendChild(span);
					li.appendChild(label);
					grade.appendChild(li);
				}

				answer.appendChild(grade);
				question.appendChild(answer);
				scale_group.appendChild(question);
				
				item_count++;
			} else {
				fetch = false;
			}
		}
		$("createQuestion").getPrevious().getPrevious(".group").appendChild(scale_group);
		headline.ondblclick = function() { showGroupEditBox( this.parentNode) };
	}
	else if (action.toLowerCase() == "create" && question_text != null && question_text.value != "") {
		
		var div_question = new Element('div', { 'class': 'question clearfix element' });
		div_question.id = "q" + generatedID;
		if(createQuestion_type == "textarea") { div_question.addClass("big-text"); }
		else if(createQuestion_type == "textfield") { div_question.addClass("small-text"); }
	
		var addQuestion = document.getElementById("createQuestion");
		var previous_element = $(addQuestion).getPrevious();
		
		if (previous_element.hasClass("group")) {
			var is_odd = false;
			var prevQuestion = previous_element.getLast("div.question");
			if(prevQuestion) { is_odd = prevQuestion.hasClass(".odd"); }
			if (!is_odd) { div_question.addClass("odd"); oddIratior = true; }
		}
		else {
			if(previous_element.hasClass("question")) {
				if(!previous_element.hasClass("odd")) { div_question.addClass("odd"); oddIratior = true; }
			}
		}
		
		var h5 = document.createElement("h5");
		var number = document.createElement("span");
		number.className = "number";
		number.appendChild(document.createTextNode(0));
		var qtxt = document.createElement("span");
		qtxt.className = "qtext";
		qtxt.appendChild(document.createTextNode(question_text.value));
	
		h5.appendChild(number);
		h5.appendChild(qtxt);
		
		number.onclick = function() { if(edit_mode) edit_text_2(this); }
		qtxt.onclick = function() { if(edit_mode) edit_text_2(this); }
		div_question.ondblclick = function() { if(edit_mode) showEditBox(this); }
				
		if (answer_div.className == "text") {
			// Lite småful kod här, men är en lösning för att få upp betan lite snabbare.
			div_question.className = "text element";
			div_question.id = null;
			div_question.innerHTML = answer_div.innerHTML;
			div_question.ondblclick = function() { if(edit_mode) edit_text_2(this); }
		} else {
			div_question.appendChild(h5);
			div_question.appendChild(answer_div);
		}
		
		$("createQuestion").getPrevious().getPrevious("DIV.group").appendChild(div_question);
		//$("createQuestion").getPrevious("DIV.group").insertBefore(div_question, );
	}
	else if (action.toLowerCase() == "edit") {
		var old_answer = $(question).getElement(".answer");	
		question.removeChild(old_answer);
		insertAfter(answer_div, question.getElementsByTagName('h5')[0]);
		
		if (need_to_prepare_form) { prepareForm(); }
		//FancyForm.start(0, { onSelect: fapp.onSelect } );			
	}
	
	form_har_redigerats();
}

/**
 * Används för att redigera 'innerHTML' i ett element. (Används för att redigera fritext-element)
 * @param element - ett element.
 * @param select - boolean som bestämmer om textarean/input fältet ska vara aktiv med textmarkören i sig.
 */
function edit_text_2(element, select) {
	if(element.childNodes[0].nodeName.toLowerCase() != "textarea" && element.childNodes[0].nodeName.toLowerCase() != "input"){
		if($(element).hasClass("text")) {
			/* Är ett fritext element (element text) */
			var textarea = document.createElement("textarea");
			textarea.setAttribute("rows", 20);
			textarea.setAttribute("cols", 130);
			textarea.value = element.innerHTML;
			textarea.className = "textEdit clearfix";
			
			textarea.onblur = function() { reverse_edit_text(this); }
			textarea.onchange = function() { resize_HTMLTextArea(this); }
			
			resize_HTMLTextArea(textarea);
			
			element.empty();
			element.appendChild(textarea);
			textarea.focus();
			
			refreshOdd(); // En ful lösning på ett IE7 problem. Problemmet är att IE7 får lite kram när en textarea flyttar ner
			 			 // tex. en likert grupp (rubrik och skala hänger inte med)
		}
		else if(element.hasClass("qtext") || element.hasClass("number")) {
			/* Är frågetext till en fråga */
			var input = document.createElement("input");
			input.type = "text";
			input.value = element.innerHTML;
			input.className = "textEdit";
		
			input.onblur = function() { reverse_edit_text(this); }
			
			element.empty();
			element.appendChild(input);
			input.focus();
			if(select) input.select();
		}
	
		form_har_redigerats();
	
	}
}

/**
 * Används för att ändra tillbaka en TEXTAREA till fritext-element. Används av edit_text_2
 * @param element - Det element (TEXTAREA) som ska bli ett fritext-element igen.
 */
function reverse_edit_text(element) {
	//console.info("Reverse", element, element.innerHTML);
	if(element.nodeName == "TEXTAREA") {
		var parent_div = element.parentNode;
		var txtarea = parent_div.childNodes[0];
		if(txtarea.value != null && txtarea.value != "") {
			parent_div.innerHTML = txtarea.value;
		} else {
			parent_div.parentNode.removeChild(parent_div);
		}
	}
	else if (element.nodeName == "INPUT" && element.type == "text") {
		var span = element.parentNode;
		var txtinput = element;
		if(txtinput.value != null && txtinput.value != "") {
			span.innerHTML = txtinput.value;
		} else {
			if(span.nodeName == "SPAN") {
				if(element.hasClass("qtext")) span.innerHTML = "Frågetext";
				else if(element.hasClass("number")) span.innerHTML = "0";
			}
			else { span.parentNode.removeChild(span); }
		}
	}
}

/**
 * Genererar fram ett unikt id.
 * @return id
 */
function generate_id() {
	var id = Math.random();
	id = id * 1000;
	id = Math.ceil(id);
	if(!document.getElementById("q" + id)) return id;
	else generate_id();
}



/** 
 * TAR BORT EN FRÅGA
 * @param question - frågan som ska tas bort.
 */
function delete_question(question) {
	var parent = question.parentNode;
	var oldParent = parent.parentNode;
	if (parent.id == "createQuestion") { createQuestion_on = false; } // Skapa-rutan är borta, dvs. den är inte på.
	oldParent.removeChild(parent); 
	//FancyForm.start(0, { onSelect: fapp.onSelect } );
}


/**
 * Visar formulärfält för den valda frågetypen. Används i editboxen för ny fråga.
 * @param question_type - vilken typ av fråga det är (checkbox, radio, textfield, textarea, scale);
 */
function show_spec(question_type) {
	var spec = document.getElementById("spec");
	spec.innerHTML = "";
	if (spec) {
		switch (question_type) {
			case "checkbox":
				var input_q = document.createElement("input");
				input_q.type = "text";
				input_q.name = "question_text";
				
				setDefaultInputEvents(input_q, "Frågetext", "#666");
				var p_q = document.createElement("p");
				p_q.appendChild(input_q);
				spec.appendChild(p_q);
				
				var input = document.createElement("input");
				input.type = "text";
				input.setAttribute("name", "new_checkbox");
				input.questionType = "checkbox";

				var next_input = document.createElement("input");
				next_input.type = "text";
				next_input.className = "disable";
				next_input.onclick = function() {
					this.className = "";
					var p = document.createElement("p");
					p.className = "checkbox"; 
					var new_input = document.createElement("input");
					new_input.type = "text";
					this.setAttribute("name", "new_checkbox");
					this.questionType = "checkbox";
					new_input.className = "disable";
					new_input.onclick = this.onclick;
					new_input.onfocus = this.onclick;
					this.onclick = null;
					this.onfocus = null;
					p.appendChild(new_input);
					insertAfter(p, this.parentNode);
				}
				next_input.onfocus = next_input.onclick;


				var p = document.createElement("p");
				p.className ="checkbox";
				var next_p = document.createElement("p");
				next_p.className = "checkbox";
				
				p.appendChild(input);
				next_p.appendChild(next_input);

				spec.appendChild(p);
				spec.appendChild(next_p);
				
				createQuestion_type = "checkbox";
				break;
				
			case "textfield":
				var input_q = document.createElement("input");
				input_q.type = "text";
				input_q.name = "question_text";
				
				setDefaultInputEvents(input_q, "Frågetext", "#666");
				var p_q = document.createElement("p");
				p_q.appendChild(input_q);
				spec.appendChild(p_q);
				
				var input = document.createElement("input");
				var p = document.createElement("p");
				input.type = "text";
				input.setAttribute("name", "textfield");
				input.questionType = "text";
				
				p.appendChild(input);
				spec.appendChild(p);
				
				createQuestion_type = "textfield";
				break;
			
			case "textarea":
				var input_q = document.createElement("input");
				input_q.type = "text";
				input_q.name = "question_text";
				
				setDefaultInputEvents(input_q, "Frågetext", "#666");
				var p_q = document.createElement("p");
				p_q.appendChild(input_q);
				spec.appendChild(p_q);
				
				var textarea = document.createElement("textarea");
				var p = document.createElement("p");
				textarea.setAttribute("name", "textarea");
				textarea.questionType = "textarea";
				
				p.appendChild(textarea);
				spec.appendChild(p);
				
				createQuestion_type = "textarea";
				break;
			
			case "radio":
				var input_q = document.createElement("input");
				input_q.type = "text";
				input_q.name = "question_text";
				
				setDefaultInputEvents(input_q, "Frågetext", "#666");
				var p_q = document.createElement("p");
				p_q.appendChild(input_q);
				spec.appendChild(p_q);
				
				var input = document.createElement("input");
				input.type = "text";
				input.setAttribute("name", "new_radio")
				input.questionType = "radio";

				var next_input = document.createElement("input");
				next_input.type = "text";
				next_input.className = "disable";
				next_input.questionType = "radio";
				next_input.onclick = function() {
					this.className = "";
					var p = document.createElement("p");
					p.className = "radio";
					var new_input = document.createElement("input");
					new_input.type = "text";
					new_input.questionType = "radio";
					this.setAttribute("name", "new_radio");
					new_input.className = "disable";
					new_input.onclick = this.onclick;
					new_input.onfocus = this.onclick;
					this.onclick = null;
					this.onfocus = null;
					p.appendChild(new_input);
					insertAfter(p, this.parentNode);
				}
				next_input.onfocus = next_input.onclick;

				var p = document.createElement("p");
				p.className = "radio";
				var next_p = document.createElement("p");
				next_p.className = "radio";

				p.appendChild(input);
				next_p.appendChild(next_input);

				spec.appendChild(p);
				spec.appendChild(next_p);
				
				createQuestion_type = "radio";
			 	break;
			
			case "scale":
				var input_q = document.createElement("input");
				input_q.type = "text";
				input_q.name = "question_text";
				
				setDefaultInputEvents(input_q, "Rubrik", "#666");
				var p_q = document.createElement("p");
				p_q.appendChild(input_q);
				spec.appendChild(p_q);
				
				var input = document.createElement("input");
				input.type = "text";
				input.setAttribute("name", "new_scale_radio")
				input.questionType = "scale";

				var next_input = document.createElement("input");
				next_input.type = "text";
				next_input.className = "disable";
				next_input.onclick = function() {
					this.className = "";
					var p = document.createElement("p");
					var new_input = document.createElement("input");
					new_input.type = "text";
					new_input.questionType = "scale";
					this.setAttribute("name", "new_scale_radio");
					new_input.className = "disable";
					new_input.onclick = this.onclick;
					new_input.onfocus = this.onclick;
					this.onclick = null;
					this.onfocus = null;
					p.appendChild(new_input);
					insertAfter(p, this.parentNode);
				}
				next_input.onfocus = next_input.onclick;

				var p = document.createElement("p");
				var next_p = document.createElement("p");

				p.appendChild(input);
				next_p.appendChild(next_input);

				spec.appendChild(p);
				spec.appendChild(next_p);
				
				
				createQuestion_type = "scale";
				break;
				
			case "text":
				var textarea = document.createElement("textarea");
				spec.appendChild(textarea);
				textarea.setAttribute("rows", 20);
				textarea.setAttribute("cols", 130);
				textarea.questionType = "_text";
				createQuestion_type = "_text";
				break;
		}
	}
}


/**
 * TODO: Funktionen ska ta frågan, gå igenom alla inputs, kontrollera att vissa inte är tomma.
 * Sen ska alla inputs få sin questionType-variabel och läggas i en lista som skickas vidare.
 *
 * Funktionen borde användas när man klickar på en fråga för redigering, men även när man skapar en ny fråga.
 *
 */
function fetchQuestion(question) {
	var parent_classname = question.parentNode.className;
	var _inputs = new Array();
	if (parent_classname == "column-group") {
		var inputs = question.getElementsByTagName("li");
		inputs.questionType = "group";
		showEditBox(question, inputs);
	} else if (parent_classname == "scale-group" || parent_classname == "scale-group priority") {} //ingenting
	else {
		var inputs = question.getElementsByTagName("li");
		showEditBox(question, inputs);
	}
}


/**
 * Visar redigeringsrutan för en fråga.
 * @param _question - frågan som ska redigeras.
 */
function showEditBox(_question) {	
	if($(_question.getParent()) == null) { return false; }
	if ($(_question).getParent().hasClass("scale-group")) return false;
	var edit_div = $(_question).getElement('.edit');
	if (!edit_div) {
		var answers = fetch(_question);
		if (!answers) { /*console.error("Hittade inga svarsalternativ");*/ return false; }
		
		if(answers != null) {	
			var edit_div = new Element('div', {'class': 'edit'});
			var edit_form = new Element('form');
			
			var ul = document.createElement("ul");
		
			var next_type;
			
			for (var i=0; i < answers.length; i++) {
				var answer = answers[i];
								
				var li = document.createElement("li");
				var inputfield = document.createElement("input");
				inputfield.type = "text";
				if(answer.label) { inputfield.value = answer.label; }
				inputfield.questionType = answer.questionType;
				
				li.setAttribute("class", answer.questionType);
			
				li.appendChild(inputfield);
			
				var removeField = document.createElement("div");
				removeField.className = "delete";
				removeField.onclick = function() {
					var input = this.parentNode;
					input.parentNode.removeChild(input);
					return false;
				};
				var removeField_span = document.createElement("span");
				removeField_span.appendChild(document.createTextNode("X"));
				removeField.appendChild(removeField_span);
				li.appendChild(removeField);
				ul.appendChild(li);
			}
			
			var next_li = document.createElement("li");
			if(next_type) { next_li.className = next_type; }
			else { next_li.className = "checkbox"; }
			var next_input = document.createElement("input");
			next_input.type = "text";
			next_input.className = "disable";
			next_input.onclick = function() {
				this.className = "";
				var li = document.createElement("li");
				if(next_type) { li.className = next_type; this.questionType = next_type; }
				else {li.className = "checkbox"; this.questionType = "checkbox"; }
				var new_input = document.createElement("input");
				new_input.type = "text";
				new_input.className = "disable";
				new_input.onclick = this.onclick;
				new_input.onfocus = this.onclick;
				this.onclick = null;
				this.onfocus = null;
			
				/* Tabort-krysset */
				var removeField = document.createElement("div");
				removeField.className = "delete";
				removeField.onclick = function() {
					var input = this.parentNode;
					input.parentNode.removeChild(input);
					return false;
				};
				var removeField_span = document.createElement("span");
				removeField_span.appendChild(document.createTextNode("X"));
				removeField.appendChild(removeField_span);
				this.parentNode.appendChild(removeField);
			
				li.appendChild(new_input);
				insertAfter(li, this.parentNode);
			}
			next_input.onfocus = next_input.onclick;
			next_li.appendChild(next_input);
			ul.appendChild(next_li);
		
			edit_form.appendChild(ul);
			
			var delete_link = document.createElement("a");
			delete_link.setAttribute("href", "#");
			delete_link.onclick = function() { delete_question(this.parentNode.parentNode); return false; };
			delete_link.appendChild(document.createTextNode("Ta bort"));
			
			var close_link = document.createElement("a");
			close_link.onclick = function(){closeEditBox(_question); return false; };
			$(close_link).addEvent('click', function(e) {
				e = new Event(e).stop();
				closeEditBox(_question);
				return false;
			});
			
			close_link.setAttribute("href","#");
			close_link.appendChild(document.createTextNode("Avbryt"));
				
			var save_link = document.createElement("a");
			save_link.onclick = function(){ question("edit", this.parentNode.parentNode.parentNode); closeEditBox(_question); return false; };
			save_link.setAttribute("href","#");
			save_link.appendChild(document.createTextNode("OK"));
			
			var add_other = document.createElement("a");
			add_other.onclick = function(){
				var q = fapp.findQuestionDiv(this);
				var edit = $(q).getElement(".edit");
				var lis = edit.getElementsByTagName("li");
				
				var li = document.createElement("li");
				var inputfield = document.createElement("input");
				inputfield.type = "text";
				
				if(lis[0].className == "checkbox") {
					inputfield.questionType = "checkbox_line";
					li.setAttribute("class", "checkbox_line");
				}
				else if(lis[0].className == "radio") {
					inputfield.questionType = "radio_line";
					li.setAttribute("class", "radio_line");
				}
				
			
				li.appendChild(inputfield);
			
				var removeField = document.createElement("div");
				removeField.className = "delete";
				removeField.onclick = function() {
					var input = this.parentNode;
					input.parentNode.removeChild(input);
					return false;
				};
				var removeField_span = document.createElement("span");
				removeField_span.appendChild(document.createTextNode("X"));
				removeField.appendChild(removeField_span);
				li.appendChild(removeField);
				
				lis[lis.length - 1].parentNode.insertBefore(li, lis[lis.length - 1]);
				
				return false;
			};
			add_other.setAttribute("href","#");
			add_other.appendChild(document.createTextNode("Lägg till 'annat'"));
			
			edit_form.appendChild(save_link);
			edit_form.appendChild(document.createElement("br"));
			edit_form.appendChild(delete_link);
			edit_form.appendChild(document.createElement("br"));
			edit_form.appendChild(add_other);
			edit_form.appendChild(document.createElement("br"));
			edit_form.appendChild(close_link);
			
			
			edit_div.appendChild(edit_form);
			_question.appendChild(edit_div);
		}
	}
}

/**
 * Stänger redigeringsrutan.
 */
function closeEditBox(element) {
	var edit_div = $(element).getElement('.edit');
	if (edit_div) { element.removeChild(edit_div); }
}


/**
 * Används för att rätta till .odd klassen på frågorna
 */
function refreshOdd() {
	var odd = false;
	$("form_").getElements(".question").each(function(question) {
		$(question).removeClass("odd");		
		if(odd) { $(question).addClass("odd"); odd = false; }
		else { odd = true; }
		
	});
	form_har_redigerats();
}

/**
 * Används för att ordna sifferföljden på frågorna
 */
function refreshNumbers() {
	var questions = $("form_").getElements(".question");
	for(var n = 0; n < questions.length; n++) {
		$(questions[n]).getElement(".number").innerHTML = n+1;
	}
	form_har_redigerats();
}

/**
 * Ordnar så att första frågan i en scale-group har ".first" och den sista har ".last". 
 */
function refreshScaleQuestions(scale_group) {
	var q = $(scale_group).getElements(".question");
	for(var i=0; i < q.length; i++) {
		$(q[i]).removeClass("first");
		q[i].removeClass("last");
		if(i == 0) { q[i].addClass("first"); }
		if(i == q.length - 1) { q[i].addClass("last");}
	}
}

var selected_question = null;  // Innehåller den markerade frågan.

/**
 * Markerar en fråga så man kan flytta.
 * @param question - Frågan som ska markeras.
 */ 
function setSelect(question) {
	if($(question).hasClass("element")) {
		if(selected_question) {
				var del = selected_question.getElementById("action");
				del.parentNode.removeChild(del);
			selected_question.removeClass("selected_question");
		}
		
		if(selected_question == question) {
			if($(selected_question).getParent().hasClass("scale-group")) { refreshScaleQuestions(selected_question.parentNode); }
			selected_question = null;
			
		} else {
			selected_question = question;
			selected_question.addClass("selected_question");
			
			if(question) {
				var h5 = question.getElementsByTagName("h5")[0];
				var div = document.createElement("div");
				div.id = "action";
			
				var removeField = document.createElement("div");
				removeField.className = "delete";
				removeField.className = "delete";
				removeField.title = "Ta bort frågan";
				removeField.onclick = function() {
					var selected_question_parent = selected_question.parentNode;
					
					var q;
					if($(selected_question).hasClass("text")) {
						q = fapp.findElementDiv(this);
						q.parentNode.removeChild(q);
					}
					else { 
						q = this.parentNode.parentNode.parentNode;
						q.parentNode.removeChild(q);
					}
					if(selected_question_parent.hasClass("scale-group")) { refreshScaleQuestions(selected_question_parent); }
					selected_question = null;
					
					form_har_redigerats();
					return false;
				};
				var removeField_span = document.createElement("span");
				removeField_span.appendChild(document.createTextNode("X"));
				removeField.appendChild(removeField_span);
				div.appendChild(removeField);
				
				
				/* '+' Länken för att lägga till en ny fråga under. */ 				
				var new_question = document.createElement("a");
				new_question.appendChild(document.createTextNode("+"));
				new_question.className = "add";
				new_question.title = "Kopiera frågan";
				new_question.href = "#";
				new_question.onclick = function() {
					var old_select = selected_question;
				
					setSelect(selected_question);
				
					var temp = $(old_select).clone(); // Nya frågan
					temp.injectAfter(old_select);
					temp.removeClass("selected_question");
					
					
					var set_onclick = function(qu, scalegroup) {
						var qtext = $(qu).getElement(".qtext");
						var number = $(qu).getElement(".number");
						qtext.innerHTML = "Ny fråga";
						qtext.onclick = null;
						//qtext.onclick = function() { edit_text_2(this); };
						number.innerHTML = 0;
						//number.onclick = function() { edit_text_2(this); };
						if(!scalegroup) temp.ondblclick = function() { showEditBox(this); }
					}
					
					
					if(temp.hasClass("question")) {
						update_answers_id(temp);
						set_onclick(temp);
					}
					else if(temp.hasClass("scale-group")){
						var questions = $(temp).getElements(".question");
						for(var i=0; i < questions.length; i++) {
							update_answers_id(questions[i]);
							set_onclick(questions[i], true);
						}
						
					}
					else if(temp.hasClass("text")) {
						temp.ondblclick = function() { edit_text(this); }
					}
					refreshScaleQuestions(old_select.parentNode);
					//FancyForm.start(0, { onSelect: fapp.onSelect } );
					
					form_har_redigerats();
					return false;
				};
				div.appendChild(new_question);
				
				var move_up = document.createElement("a");
				move_up.appendChild(document.createTextNode("\u2191"));
				move_up.setAttribute("accesskey", "u");
				move_up.href = "#";
				move_up.title = "Flytta upp (ALT + u)";
				move_up.onclick = function() {
					move_question("up");
					return false;
				};
				div.appendChild(move_up);
				
				var move_down = document.createElement("a");
				move_down.appendChild(document.createTextNode("\u2193"));
				move_down.setAttribute("accesskey", "n");
				move_down.href = "#";
				move_down.title = "Flytta ner (ALT + n)";
				move_down.onclick = function() {
					move_question("down");
					return false;
				};
				div.appendChild(move_down);
			
				if(question.hasClass("text")) {
					question.appendChild(div);
				} else { h5.insertBefore(div, h5.getElementsByTagName("span")[1]); }
			}
		}
	}
}

/**
 * Flyttar den markerade frågan antingen upp eller ner.
 * @param direction - "up" eller "down"
 */
function move_question(direction) {
	if($(selected_question)) {
		var question;
		if(direction == "up") {
			var prev_question = selected_question.getPrevious(".element");
			if(prev_question) {
				question = selected_question.parentNode.removeChild(selected_question);
				prev_question.parentNode.insertBefore(question, prev_question);
			} else {
				var temp = selected_question.getParent().getPrevious(".group")
				if(temp) {
					insertAfter(selected_question, temp.getLast(".element"));
				}
			}	
		} else if (direction == "down") {
			var next_question = selected_question.getNext(".element");
			if(next_question) {
				question = selected_question.parentNode.removeChild(selected_question);
				insertAfter(question, next_question);
			} else {
				var temp = selected_question.getParent().getNext(".group")
				if(temp) {
					var temp_first = temp.getFirst(".element");
					temp_first.parentNode.insertBefore(selected_question, temp_first);
				}
			}
		}
	}
}

/**
 * Hanterar tangentbordstryckningar.
 * @param e - Event
 */
function keyHandler(e) {
	var code;
	var targ;
	if (!e) var e = window.event;
	
	if (e.keyCode) code = e.keyCode;
	else if (e.which) code = e.which;
	
	if (e.target) targ = e.target;
	else if (e.srcElement) targ = e.srcElement;
	
	if (targ.nodeType == 3) { targ = targ.parentNode; } // defeat Safari bug
	
	if(code == 13) { // ENTER
		if(targ.nodeName.toLowerCase() == "input" && $(targ).getParent().hasClass("qtext") && targ.className != "textline" && targ.name != "textfield" && targ.name != "question_text") { // TODO: ge editboxfälten en viss class som då går att filtrera bort i keyHandler.
			var div = document.createElement("div");
			div.className = "qtext";
			div.innerHTML = "Frågetext";
			div.onclick = function() { /*$(this).inlineEdit();*/ edit_text_2(this) };
			insertAfter(div, targ.parentNode);
			//$(div).inlineEdit();
			edit_text_2(div, true);
		}
		if(targ.nodeName.toLowerCase() == "textarea") { return true; }
		return false
	}
	if(code == 27) { if(targ.nodeName.toLowerCase() == "input" || targ.nodeName.toLowerCase() == "textarea") { targ.blur(); } return false; } // ESC
	
	if(e.shiftKey && e.ctrlKey && code == 83) { saveForm(); return false; } // SHIFT + CTRL + S
	if(e.shiftKey && e.ctrlKey && code == 82) { toggleEditMode(); return false; } // SHIFT + CTRL + Q

	if(e.shiftKey && e.ctrlKey && code == 79) { refreshOdd(); return false; } // SHIFT + CTRL + R
	
	if(e.shiftKey && e.ctrlKey && code == 38) { move_question("up"); return false; } // SHIFT + CTRL + PIL-UP
	if(e.shiftKey && e.ctrlKey && code == 40) { move_question("down"); return false; } // SHIFT + CTRL + PIL-NER
	
	
}

/**
 * Hanterar musknapparna, just nu bara för högerklick.
 * @param e - Event
 */
function mouseHandler(e) {
        var rightclick, ev = e || window.event, targ = ev.target || ev.srcElement;
        if (!edit_mode || !ev) return;
        if (targ.nodeType == 3) targ = targ.parentNode; // defeat Safari bug

        if (ev.which) rightclick = (ev.which == 3);
        else if (ev.button) rightclick = (ev.button == 2);

        if(rightclick) {
				new Event(ev).preventDefault();
				
                var divQ = fapp.findElementDiv(targ);
                if(divQ) setSelect(divQ);
                else fapp.logga('Hogerklick utanfor - prova klicka pa en fraga istallet!');

                if ($(targ).hasClass("headline")) { fapp.logga("v\303\244lj skala!!!"); }

                if (ev.stopPropagation) ev.stopPropagation(); //ger ingen nytta i FF3
                return false;
        }
}
