/* FETCH DATA: 								Beskrivning:
 * -----------------------------------------------------------------------------------------
 * questionType : 	radio					Vilken typ av fråga det är.
 *					radio_line
 *					checkbox
 *					checkbox_line
 *					text
 *					textarea
 *
 * label: 									Vad som står i labeln.
 *
 * value: 									Om det ska stå något i text/textarea fältet.
 *
 * name:									Namnet på inputfältet.
 */


document.onkeypress = keyHandler;
document.onmousedown = mouseHandler;

/* Aktivera inlineEdit2 via klick i #header */
var statusbar = $('statusbar');
var edit_link = document.createElement('div');
edit_link.id = "editlink";
edit_link.className = "deactive";

//var h = $('header');
//h.addEvent('click', function(a) { 
$(edit_link).addEvent('click', function(a) {
	toggleEditMode();
});
statusbar.appendChild(edit_link);

function toggleEditMode() {
	if(edit_link.className == "deactive") { // Knappen var "av", så knappen slås på.
		edit_mode = true;
		fapp.showEditLink();
		edit_link.className = "active";			
		var f = $('form_');	
		f.getElements('label').each( function(elt) {elt.addEvent('click',function(){if(edit_mode) elt.inlineEdit()}); } );
		f.getElements('h4').each( function(elt) {elt.addEvent('click',function(){ if(edit_mode) elt.inlineEdit()}); } );
		f.getElements('h3').each( function(elt) {elt.addEvent('click',function(){ if(edit_mode) elt.inlineEdit()}); } );
		//f.getElements('p').each( function(elt) { if(elt.id != "addQuestion") { elt.addEvent('click',function(){ if(edit_mode) elt.inlineEdit() }); } } );
		f.getElements('.question').each(function(elt) {elt.addEvent('click',function(){ if(edit_mode) showEditBox(this);});});
		f.getElements('.text').each(function(elt) {elt.addEvent('click',function(){ if(edit_mode) edit_text(this);});});
		f.getElements('.scale-group .headline').each( function(elt) {elt.addEvent('click',function(){ if(edit_mode) showGroupEditBox(this.parentNode);}); } );
		f.getElements('.scale-group .question h5 .qtext').each( function(elt) {elt.addEvent('click',function(){if(edit_mode) elt.inlineEdit()}); } );
		f.getElements('.scale-group .question h5 .number').each( function(elt) {elt.addEvent('click',function(){ if(edit_mode) elt.inlineEdit()}); } );
	
		//f.getElements('.scale-group .priority .question h5 span').each( function(elt) {elt.addEvent('click',function(){elt.inlineEdit()}); } );
	} else {
		edit_mode = false;
		edit_link.className = "deactive";
		fapp.removeEditLink();
	
		var edit_boxes = document.getElements('.edit');
		edit_boxes.each(function(elt) { elt.parentNode.removeChild(elt); });
	
		// Här måste alla inlineEdit tas bort från click-event
	}
	window.location.hash="edit";
}


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
 * 
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
 * Visar formuläret för att skapa nya frågor.
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
		
		
		var select_values = new Array("typ", "checkbox", "textfield", "textarea", "radio", "scale", "text");
		for (var i=0; i < select_values.length; i++) {
			option = document.createElement("option");
			option.value = select_values[i];
		
			if (i == 0) {
				option.style.color = "#666";
			} else {
				option.style.color = "#000";
			}
			
			option.appendChild(document.createTextNode(select_values[i]));
			select.appendChild(option);
		}
		
		select.onchange = function() {
			var options = select.getElementsByTagName("option");
			for (var i=0; i < options.length; i++) {
				if(options[i].selected) { show_spec(options[i].innerHTML); }
			}
		}
		
		var link_p = document.createElement("p");
		var a = document.createElement("a");
		a.href = "#";
		$(a).addEvent('click', function() {
			alert("a:click" + $(this).getParent(".question"));
			//question("create", document.getElementById('createQuestion'));
			old_question("create", document.getElementById('createQuestion'));
			
			delete_question(this.parentNode.parentNode);
			return false;
		});
		a.appendChild(document.createTextNode("Färdig"));
		link_p.appendChild(a);
		
		var select = p.appendChild(select);
		p.appendChild(document.createElement("br"));
		
		
		
		form.appendChild(p);
		
		var form = div_question.appendChild(form);
		
		var spec = document.createElement("div");
		spec.id = "spec";
		
		form.appendChild(spec);
		//form.appendChild(spec_checkbox);
		
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
 *
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
		
		var close_li = document.createElement("li");
		var close_a = document.createElement("a");
		close_a.appendChild(document.createTextNode("Stäng"));
		close_li.appendChild(close_a);
		menu.appendChild(close_li);
		close_a.onclick = function() { closeEditBox(group, null); return false; };
		close_a.href = "#";
		
		var save_li = document.createElement("li");
		var save_a = document.createElement("a");
		save_a.appendChild(document.createTextNode("Spara"));
		save_li.appendChild(save_a);
		menu.appendChild(save_li);
		save_a.onclick = function() { _group("edit", this.parentNode.parentNode.parentNode.parentNode.parentNode); return false; };
		save_a.href = "#";
		
		var remove_li = document.createElement("li");
		var remove_a = document.createElement("a");
		remove_a.appendChild(document.createTextNode("Ta bort grupp"));
		remove_li.appendChild(remove_a);
		menu.appendChild(remove_li);
		remove_a.onclick = function() { delete_question(this.parentNode.parentNode.parentNode.parentNode.parentNode); return false; };
		remove_a.href = "#";
		
		var input = document.createElement("input");
		input.type = "text";
		input.name = "headline";
		var input_label = document.createTextNode("Rubrik ");
		var headline = group.getElement(".headline h4");
		if(headline && headline.parentNode.className != "grade") { input.value = headline.innerHTML; }

		
		var scale = document.createElement("select");
		scale.name = "scale";

		var likert4 = document.createElement("option");
		var likert5 = document.createElement("option");
		
		likert4.value = "likert4";
		likert5.value = "likert5";
		
		likert4.appendChild(document.createTextNode("1-4"));
		likert5.appendChild(document.createTextNode("1-5"));
		
		scale.appendChild(likert4);
		scale.appendChild(likert5);

		
		if(group.className.match("likert4")) { likert4.selected = "selected" }
		else if (group.className.match("likert5")) { likert5.selected = "selected" }
		
		var v = document.createElement("input");
		v.type = "checkbox";
		v.name = "vetej";
		var label_v = document.createElement("label");
		label_v.innerHTML = "Visa <strong>Vet ej</strong>";
		if(group.className.match("v")) { v.checked = "checked"; }
		
		var p = document.createElement("input");
		p.type = "checkbox";
		p.name = "prio";
		var label_p = document.createElement("label");
		label_p.innerHTML = "Visa <strong>Prioritet</strong>";
		if(group.className.match("priority")) {p.checked = "checked"; }
		/*
		edit_div.appendChild(menu_div);
		edit_div.appendChild(input_label);
		edit_div.appendChild(input);
		edit_div.appendChild(scale);
		edit_div.appendChild(v);
		edit_div.appendChild(label_v);
		edit_div.appendChild(p);
		edit_div.appendChild(label_p);
		*/
		
		form.appendChild(menu_div);
		form.appendChild(input_label);
		form.appendChild(input);
		form.appendChild(scale);
		form.appendChild(v);
		form.appendChild(label_v);
		form.appendChild(p);
		form.appendChild(label_p);
		
		
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
			questions_ul.appendChild(questions_li);
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
		questions_ul.appendChild(next_li);
		
		//edit_div.appendChild(questions_ul);
		form.appendChild(questions_ul);
		edit_div.appendChild(form);
		
		group.appendChild(edit_div);
	}
}
/*
 * Liknar question(action, question), fast används vid scale-group.
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
	
	console.info("Headline: ", _headline);
	console.info("Scale: ", _scale);
	console.info("vetej: ", _vetej);
	console.info("prio: ", _prio);
	console.info("answers.length: ", _answers.length);
	
	var scale_group = $(group).getParent();

	if(_vetej) {
		if(!scale_group.hasClass("v")) { scale_group.addClass("v"); }
	}
	else { scale_group.removeClass("v"); }
	
	if(_prio) {
		if(!scale_group.hasClass("priority")) { scale_group.addClass("priority"); }
	}
	else { scale_group.removeClass("priority"); }
	
	var headline_div = $(scale_group).getElement(".headline");

	//alert(headline_div.childNodes[0].nodeName);
	console.info(headline_div.childNodes[0], headline_div.childNodes[0].nodeType);
	
	var childNode = headline_div.childNodes[0]
	if(childNode.nodeType == 3) { childNode = headline_div.childNodes[1]; }
	if( (childNode.nodeName.toLowerCase() == "h4" && (_headline == "" || _headline == null)) ) {
		// finns en rubrik och _headline innehåller inget.
		// ta bort h4 elementet
		childNode.parentNode.removeChild(childNode);
		//alert("tarbort");
	}
	else if ( (childNode.nodeName.toLowerCase() != "h4" && (_headline != "" || _headline != null)) ) {
		// finns ingen rubrik men _headline innehåller något. Vi behöver en h4!
		// skapa ett h4 element med _headlines innehåll
		var h4 = document.createElement("h4");
		h4.innerHTML = _headline;
		headline_div.insertBefore(h4, childNode);
		h4.onclick = function() { this.inlineEdit(); }
		
		//alert("lägger till");
	}
	else if( (childNode.nodeName.toLowerCase() == "h4" && (_headline != "" || _headline != null)) ) {
		// det finns en rubrik och _headline innehåller något. Förnya rubrikens innehåll
		childNode.innerHTML = _headline; 
		//alert("uppdaterar");
	}
	console.info("har den blivit true? ", _prio);
	uppdate_scale_answer(group.parentNode, _scale.replace(/likert/, ''), _prio, _vetej);
	
	FancyForm.start(0, { onSelect: fapp.onSelect } );	
}

function uppdate_scale_answer(group, scale, add_prio, add_vetej) {
	/* ändrar likert-gruppens huvudskala */
	var headline = $(group).getElement(".headline .answer");
	headline.innerHTML = create_scale_answer(null, scale, null, null, add_vetej, false, true).innerHTML;
	
	
	/* ändrar varje likertfrågas skala */
	var questions = $(group).getElements(".question");
	for (var i=0; i < questions.length; i++) {
		var answer = questions[i].getElement(".answer");
		console.info("Ska inte vara true: ", add_prio);
		answer.innerHTML = create_scale_answer(questions[i].id.replace(/q/, ''), scale, add_prio, null, add_vetej, false, false).innerHTML;
	}
}


/**
 * Funktionen används för att ändra likertfrågornas skala. Funktionen skapar en ny div class="answer" med den nya skalan.
 * Funktionen går också att använda under skapande processen av en likert fråga (inte bara vid redigering).
 *
 * @param question_number - frågans nummer. Används för till namnen på inputfälten
 * @param scale - skalan som ska användas.
 * @param add_prio - om prioritet ska finnas.
 * @param headline - rubriken till svarsalternativen? headline i typ='grade' döljs.
 * @param answers - array med alla svarsalternativ.
 *
 * @return en ny och fin div class="answer"
 */
function create_scale_answer(question_number, scale, add_prio, headline, vetej, prio_run, is_scale_headline) {
	var loop_count = 5;
	if(scale) { loop_count = scale; }
	
	console.info("add_prio: ", add_prio);
	
	var answer_div = document.createElement("div");
	answer_div.className = "answer";
	var div = document.createElement("div");
	if (prio_run) { div.className = "priority"; }
	else { div.className = "grade"; }
	
	var h4 = document.createElement("h4");
	if(headline) { h4.appendChild(document.createTextNode(headline)); }
	else { h4.appendChild(document.createTextNode("Betyg")); }
	div.appendChild(h4);
	
	
	var ul = document.createElement("ul");
	if (is_scale_headline) {
		for (var i=0; i < loop_count; i++) {
			var li = document.createElement("li");
			li.appendChild(document.createTextNode(i+1));
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
			input.id = prefix + question_number + "_" + i+1;
			input.type = "radio";
			var span = document.createElement("span");
			span.appendChild(document.createTextNode(i+1));
		
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
			input.id = prefix + question_number + "_" + loop_count+1;
			input.type = "radio";
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
 *
 * @param question - Frågan som form-fält ska hämtas ifrån.
 * @param getClass - Används om man vill hämta form-fält från ett annat klassnamn i frågan, som standard hämtas fälten från '.answer'.
 * @return en array som innehåller svarsobject (answer).
 */
function fetch(question, getClass) {
	if (!getClass) { getClass = ""; }
	var parent_classname = question.parentNode.className;
	
	//console.info("fetching", question.id);
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

						if ((parent_classname == "column-group" || $(question).hasClass("big-text")) && !getClass) { label = label.getElementsByTagName('span')[0]; }
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

						//console.info("QuestionType: ", answer.questionType,", Label: ",answer.label, ", Value: ", answer.value);
						
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
					
					//console.info("QuestionType: ", answer.questionType, "Label: ",answer.label, "Value: ", answer.value);

					break;
			}
		}
	}
	
	return answers;
}


/** SKAPA OCH REDIGERA/UPPDATERA EN FRÅGA.
 *
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
			switch(answer.questionType) {
				case "radio": input.className = "r"; break;
				case "checkbox": input.className = "cb"; break;
				default: input.className = answer.questionType;
			}
						
			/* Omvandlar alla checkbox_line svarsalternativ till input-typen: 'text'. */
			if(answer.questionType == "checkbox_line") {
				input.type = "text";
				input.className = "textline";
				li.className = "checkedtextfield";
				label.className = "textfield";
				
				label.appendChild(document.createTextNode(answer.label));
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
				// Stoppar li-elementet i det aktiva ul-elementet
				active_ul.appendChild(li);
			} else {
				// Skapar ett ul-element och sätter den som active_ul
				active_ul = document.createElement("ul");
				active_ul.appendChild(li);
				answer_div.appendChild(active_ul);
			}
		}
		else if (answer.questionType == "text") {
			var input = document.createElement("input");
			input.type = answer.questionType
			answer_div.appendChild(input);
			active_ul = null;
		}
		else if (answer.questionType == "textarea") {
			var input = document.createElement("textarea");
			answer_div.appendChild(input);
			active_ul = null;
		}
	}
	
	
	if (action.toLowerCase() == "create" && question_text != null && question_text.value != "") {
		//console.info("[action == create]");
		
		var div_question = new Element('div', { 'class': 'question clearfix' });
	
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
		//question.getElementsByTagName('h5')[0].appendChild(answer_div);
		insertAfter(answer_div, question.getElementsByTagName('h5')[0]);
		
		if (need_to_prepare_form) { prepareForm(); }
		FancyForm.start(0, { onSelect: fapp.onSelect } );	
	}
	
	//console.groupEnd();
}

function old_question(action, question) {
	var oddIratior = false;
	var form = null;
	
	
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
	
	//console.info("Hittade totalt " + answers.length + " st input-element (svarsalternativ).");
	
	var need_to_prepare_form = false;	//Om prepareForm() måste köras
	var active_ul = null;
	var answer_div = document.createElement("div");
	answer_div.className = "answer";
	
	/* Förbereder div:en 'answer' som frågan kommer innehålla. */
	for (var i = 0; i < answers.length; i++) {
		var element = answers[i];
		alert("questionType: " + element.questionType);
		if( element.questionType == "radio" || element.questionType == "checkbox" || element.questionType == "checkbox_line" || element.questionType == "radio_line" ) {
			var li = document.createElement("li");
			var label = document.createElement("label");
			var input = document.createElement("input");
			switch(element.questionType) {
				case "radio": input.className = "r"; break;
				case "checkbox": input.className = "cb"; break;
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
			answer_div.appendChild(input);
			active_ul = null;
		}
		else if (element.questionType == "textarea") {			
			var input = document.createElement("textarea");
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
	
	
	if (action.toLowerCase() == "create" && question_text != null && question_text.value != "") {
		//console.info("[action == create]");
		
		var div_question = new Element('div', { 'class': 'question clearfix' });
	
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
				
		if (answer_div.className == "text") {
			// Lite småful kod här, men är en lösning för att få upp betan lite snabbare.
			div_question.className = "text";
			div_question.innerHTML = answer_div.innerHTML;
			div_question.onclick = function() { edit_text(this); }
		} else {
			div_question.appendChild(h5);
			div_question.appendChild(answer_div);
		}
		
		fapp.currentPageDiv.appendChild(div_question);
	}
	else if (action.toLowerCase() == "edit") {
		//console.group("Edit " + question.id);
		//console.info("Redigerade: ", question);
		//console.groupEnd();
		var old_answer = $(question).getElement(".answer");	
		question.removeChild(old_answer);
		//question.getElementsByTagName('h5')[0].appendChild(answer_div);
		insertAfter(answer_div, question.getElementsByTagName('h5')[0]);
		
		if (need_to_prepare_form) { prepareForm(); }
		FancyForm.start(0, { onSelect: fapp.onSelect } );	
	}
}

function edit_text(div) {
	if(div.childNodes[0].nodeName.toLowerCase() != "textarea") {
		var textarea = document.createElement("textarea");
		textarea.setAttribute("rows", 20);
		textarea.setAttribute("cols", 130);
		//textarea.style.width = "100%";
		//textarea.style.height = "auto";
		textarea.value = div.innerHTML;
		
		textarea.onblur = function() {
			var parent_div = this.parentNode;
			var txtarea = parent_div.childNodes[0];
			if(txtarea.value != null && txtarea.value != "") {
				parent_div.innerHTML = txtarea.value;
			} else {
				parent_div.parentNode.removeChild(parent_div);
			}
			
		}
		
		div.empty();
		div.appendChild(textarea);
		textarea.focus();		
	}
}




/** TAR BORT EN FRÅGA
 *
 * @param question - frågan som ska tas bort.
 */
function delete_question(question) {
	var parent = question.parentNode;
	var oldParent = parent.parentNode;
	if (parent.id == "createQuestion") { createQuestion_on = false; } // Skapa-rutan är borta, dvs. den är inte på.
	oldParent.removeChild(parent); 
	FancyForm.start(0, { onSelect: fapp.onSelect } );
}


/**
 * Visar formulärfält för den valda frågetypen
 *
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
				// input_q.style.color = "#666";
				
				setDefaultInputEvents(input_q, "Frågetext", "#666");
				var p_q = document.createElement("p");
				p_q.appendChild(input_q);
				spec.appendChild(p_q);
				
				//spec_container.appendChild(spec_checkbox);
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
					p.className = "checkbox"; //
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

				var next_input = document.createElement("input");
				next_input.type = "text";
				next_input.className = "disable";
				next_input.onclick = function() {
					this.className = "";
					var p = document.createElement("p");
					p.className = "radio";
					var new_input = document.createElement("input");
					new_input.type = "text";
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

				var next_input = document.createElement("input");
				next_input.type = "text";
				next_input.className = "disable";
				next_input.onclick = function() {
					this.className = "";
					var p = document.createElement("p");
					var new_input = document.createElement("input");
					new_input.type = "text";
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
				
				textarea.questionType = "_text";
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
 *
 * @param _question - frågan som ska redigeras.
 */
function showEditBox(_question) {	
	//console.group("ShowEdit: ", _question.id);
	if ($(_question).getParent().hasClass("scale-group")) return false;
	var edit_div = $(_question).getElement('.edit');
	if (!edit_div) {
		var answers = fetch(_question);
		if (!answers) { /*console.error("Hittade inga svarsalternativ");*/ return false; }
		
		if(answers != null) {	
			var edit_event = function(){ _question.getElement(".qtext").inlineEdit(); };
			_question.getElement(".qtext").addEvent('click',edit_event );
			
			var edit_div = new Element('div', {'class': 'edit'});
			var edit_form = new Element('form');
			
			var ul = document.createElement("ul");
	
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
			next_li.className = "checkbox";
			var next_input = document.createElement("input");
			next_input.type = "text";
			next_input.className = "disable";
			next_input.onclick = function() {
				this.className = "";
				var li = document.createElement("li");
				li.className = "checkbox";
				var new_input = document.createElement("input");
				new_input.type = "text";
				this.questionType = "checkbox";
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
			delete_link.appendChild(document.createTextNode("Ta bort frågan"));
			edit_form.appendChild(delete_link);
			edit_form.appendChild(document.createElement("br"));
		
			var close_link = document.createElement("a");
			//close_link.onclick = function(){closeEditBox(_question, edit_event); return false; };
			//close_link.addEventListener('click',function(){closeEditBox(_question, edit_event); return false; },true);
			
			$(close_link).addEvent('click', function(e) {
				e = new Event(e).stop();
				closeEditBox(_question, edit_event);
				return false;
			});
			
			close_link.setAttribute("href","#");
			close_link.appendChild(document.createTextNode("Stäng"));
			edit_form.appendChild(close_link);
			edit_form.appendChild(document.createElement("br"));
						
			var save_link = document.createElement("a");
			save_link.onclick = function(){ question("edit", this.parentNode.parentNode.parentNode); return false; };
			save_link.setAttribute("href","#");
			save_link.appendChild(document.createTextNode("Spara"));
			edit_form.appendChild(save_link);
			
			
			edit_div.appendChild(edit_form);
			_question.appendChild(edit_div);
		}
	}
	//console.groupEnd();
}

/**
 * Stänger redigeringsrutan.
 */
function closeEditBox(element,edit_event) {
	var edit_div = $(element).getElement('.edit');
	if (edit_div) {
		element.removeChild(edit_div);
		if(edit_event) { element.getElement(".qtext").removeEvent( 'click', edit_event ); }
	}
}

/**
 * Hanterar tangentbordstryckningar.
 */
function keyHandler(e) {
	var code;
	var targ;
	if (!e) var e = window.event;
	
	if (e.keyCode) code = e.keyCode;
	else if (e.which) code = e.which;
	
	if (e.target) targ = e.target;
	else if (e.srcElement) targ = e.srcElement;
	
	if (targ.nodeType == 3) { // defeat Safari bug
		targ = targ.parentNode;
	}
	//var character = String.fromCharCode(code);
	
	if(code == 13) { // ENTER
		if(targ.nodeName.toLowerCase() == "input" && targ.className != "textline" && targ.name != "textfield" && targ.name != "question_text") { // TODO: ge editboxfälten en viss class som då går att filtrera bort i keyHandler.
			var div = document.createElement("div");
			div.onclick = function() { $(this).inlineEdit(); };
			insertAfter(div, targ.parentNode);
			$(div).inlineEdit();
		}
		if(targ.nodeName.toLowerCase() == "textarea") { return true; }
		return false
	}
	
	if(e.shiftKey && e.ctrlKey && code == 83) { alert("sparar"); return false; } // SHIFT + CTRL + S
	if(e.shiftKey && e.ctrlKey && code == 82) { toggleEditMode(); return false; } // SHIFT + CTRL + R
}

function mouseHandler(e) {
	var rightclick;
	var targ = null;
	if (!e) { var e = window.event; }
	if (e.target) { targ = e.target; }
	else if (e.srcElement) { targ = e.srcElement; }
	if (targ.nodeType == 3) {// defeat Safari bug
		targ = targ.parentNode;
	}
	
	//if (e.which) rightclick = (e.which == 3);
	else if (e.button) rightclick = (e.button == 2);
	if(rightclick) {
		console.info(targ);
		console.info(targ.className);
		if (((targ.nodeName == "H5") && targ.parentNode.hasClass("question")) || ((targ.nodeName == "SPAN") && targ.parentNode.parentNode.hasClass("question")) || targ.hasClass("question")) { console.info("question!!!"); }
		 return false;}
}