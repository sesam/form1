/* FETCH DATA: 								Beskrivning:
 * -----------------------------------------------------------------------------------------
 * questionType : 	radio					vilken typ av fråga det är.
 *					radio_line
 *					checkbox
 *					checkbox_line
 *					text
 *					textarea
 *
 * label: 									vad som står i labeln.
 *
 * value: 									om det ska stå något i text/textarea fältet
 */


var Answer = function() {
	var questionType = null;
	var label = null;
	var value = null;
}

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
		
		
		var select_values = new Array("typ", "checkbox", "textfield", "textarea", "radio", "scale");
		for (var i=0; i < select_values.length; i++) {
			option = document.createElement("option");
			option.value = select_values[i];
		
			if (i == 0) {
				option.style.color = "#666";
			} else {
				option.style.color = "#000";
			}
			
			//option.setAttribute("onclick", "show_spec('"+select_values[i]+"');");
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
		//a.setAttribute("onclick", "create_question(); delete_question(this.parentNode.parentNode); return false;");
		$(a).addEvent('click', function() {
			//create_question();
			alert($(this).getParent(".question"));
			question("create", document.getElementById('createQuestion'));
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
		//create_question();
		question("create", null)
	}
}

/* Gräver sig ner i question-div:en för att leta rätt på inputs-fält och textareas. Den använder både för att hämta inputs från formuläret
 	men även inputs från editboxen/skapa-nya-frågor-boxen  

TODO: Just nu är det något fel när man försöker hämta inputs från editboxen */
function fetch(question, getClass) {
	if (!getClass) { getClass = ""; }
	var parent_classname = question.parentNode.className;
	
	console.info("fetching");
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
						
						if (parent_classname == "column-group") { label = label.getElementsByTagName('span')[0]; }
						
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
						
						if (answer.questionType == "checkbox_line" || answer.questionType == "radio_line" || answer.questionType == "textline") { answer.value = input.value; }
						
						console.info(": ", answer.questionType);
						console.info(": ", answer.label);
						console.info(": ", answer.value);
						
						if ( (!answer.value && getClass.toLowerCase() == "edit")) { alert("ooboy");/* ingenting */ }
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
					
					console.info(answer.questionType);
					console.info(answer.label);
					console.info(answer.value);
					break;
			}
		}
	}
	
	return answers;
}


/* SKAPA OCH REDIGERA/UPPDATERA EN FRÅGA.
 *
 * @param action - edit/create.
 * @param question - frågan som ska redigeras/uppdaters. Obligatorisk vid redigering/uppdatering.
 *
 * exempel: question("edit", this); question("create", this);
 */
function question(action, question) {
	var oddIratior = false;
		
	/* Kontrollerar att 'action' parametern är rätt */
	if (action.toLowerCase() != "create" && action.toLowerCase() != "edit") {
		alert("[question(action, question)]: kan inte utföra '" + action + "', du kanske menade 'create' eller 'edit'?");
	}
		
	/*	Loopar igenom formuläret för att leta efter ett fält med class="question_text".
	 *	For-loopen kan fyllas på om fler fält ska hittas.
	 */
	var answers;
	if (action.toLowerCase() == "edit") { answers = fetch(question, "." + action); }
	else { answers = fetch(question); }
	
	if (answers == null) { console.error("Misslyckades att hämta svarsalternativen från frågan"); }	
	console.info("Hittade totalt " + answers.length + " st input-element (svarsalternativ).");
	
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
				label.appendChild(document.createTextNode(answer.label));
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
		console.info("[action == create]");
		
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
		console.group("Edit " + question.id);
		console.info("Redigerade: ", question);
		console.groupEnd();
		var old_answer = $(question).getElement(".answer");	
		question.removeChild(old_answer);
		//question.getElementsByTagName('h5')[0].appendChild(answer_div);
		insertAfter(answer_div, question.getElementsByTagName('h5')[0]);
		
		if (need_to_prepare_form) { prepareForm(); }
		FancyForm.start(0, { onSelect: fapp.onSelect } );	
	}
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
	var answers = new List();
	for (var count = 0; count < form.elements.length; count++) {
		if (form.elements[count].name == "question_text") {
			question_text = form.elements[count];
		}
		else if (form.elements[count].name == "new_checkbox" || form.elements[count].name == "new_radio" || form.elements[count].name == "new_scale_radio" || form.elements[count].questionType == "radio" || form.elements[count].questionType == "checkbox" || form.elements[count].questionType == "checkbox_line" || form.elements[count].questionType == "radio_line") {
			/* Vi vill bara ha fälten som innehåller någonting. */
			if (form.elements[count].value != "") {
				answers.add(form.elements[count]);
				console.info("Hittade ett " + form.elements[count].questionType + ": ", form.elements[count]);
				
			}
		}
		else if (form.elements[count].name == "textfield" || form.elements[count].name == "textarea" || form.elements[count].questionType == "text" || form.elements[count].questionType == "textarea") {
			/* Textfält och textarea får vara tomma */
			answers.add(form.elements[count]);
			console.info("Hittade ett " + form.elements[count].questionType + ": ", form.elements[count]);
		}
	}	
	
	console.info("Hittade totalt " + answers.length + " st input-element (svarsalternativ).");
	
	var need_to_prepare_form = false;	//Om prepareForm() måste köras
	var active_ul = null;
	var answer_div = document.createElement("div");
	answer_div.className = "answer";
	
	/* Förbereder div:en 'answer' som frågan kommer innehålla. */
	for (var i = 0; i < answers.length; i++) {
		var element = answers.get(i);
		console.info(element);
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
				
				label.appendChild(document.createTextNode(answers.get(i).value));
				label.appendChild(input);
				li.appendChild(label);
				
				need_to_prepare_form = true;
			} else {
				input.type = element.questionType;
				label.appendChild(input);
				label.appendChild(document.createTextNode(answers.get(i).value));
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
	}
	
	
	if (action.toLowerCase() == "create" && question_text != null && question_text.value != "") {
		console.info("[action == create]");
		
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
		console.group("Edit " + question.id);
		console.info("Redigerade: ", question);
		console.groupEnd();
		var old_answer = $(question).getElement(".answer");	
		question.removeChild(old_answer);
		//question.getElementsByTagName('h5')[0].appendChild(answer_div);
		insertAfter(answer_div, question.getElementsByTagName('h5')[0]);
		
		if (need_to_prepare_form) { prepareForm(); }
		FancyForm.start(0, { onSelect: fapp.onSelect } );	
	}
}



/* TAR BORT EN FRÅGA
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
		}
	}
}

/*
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


function showEditBox(_question) {	
	var edit_div = $(_question).getElement('.edit');
	if (!edit_div) {
		var answers = fetch(_question);
		if (!answers) { console.error("Hittade inga svarsalternativ"); return false; }
		
		if(answers != null) {	
			var edit_event = function(){ question.getElement(".qtext").inlineEdit(); };
			_question.getElement(".qtext").addEvent('click',edit_event );
			
			var edit_div = new Element('div', {'class': 'edit'});
			var edit_form = new Element('form');
			
			var ul = document.createElement("ul");
	
			for (var i=0; i < answers.length; i++) {
				var answer = answers[i];
				
				var li = document.createElement("li");
				var inputfield = document.createElement("input");
				inputfield.type = "text";
				inputfield.value = answer.label;
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
			close_link.onclick = function(){closeEditBox(_question, edit_event); return false; };
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
}



function closeEditBox(element,edit_event) {
	var edit_div = $(element).getElement('.edit');
	if (edit_div) {
		element.removeChild(edit_div);
		element.getElement(".qtext").removeEvent( 'click', edit_event );
	}
}