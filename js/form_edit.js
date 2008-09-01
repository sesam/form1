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
			question("create", null);
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


/* SKAPA OCH REDIGERA/UPPDATERA EN FRÅGA.
 *
 * @param action - edit/create.
 * @param question - frågan som ska redigeras/uppdaters. Obligatorisk vid redigering/uppdatering.
 *
 * exempel: question("edit", this); question("create", this);
 */
function question(action, question) {
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
			input.className = element.questionType;
			
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
		else if (element.questionType == "text" || element.questionType == "textarea") {
			var input = document.createElement("input");
			input.type = element.questionType
			answer_div.appendChild(input);
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

function old_backup_create_question() {
	var oddIratior = false;
	var form = document.getElementById("createQuestion").getElementsByTagName("form")[0];
	var question_text = form.elements[1];

	if (question_text.value != null && question_text.value != "") {
		var div_question = new Element('div', { 'class': 'question clearfix' });
	
		var addQuestion = document.getElementById("createQuestion");
		var previous_element = $(addQuestion).getPrevious();
		
		if (previous_element.hasClass("group") /*|| previous_element.hasClass("scale-group")*/) {
			var is_odd = previous_element.getLast("div.question").hasClass("odd");
			if (!is_odd) { div_question.addClass("odd"); oddIratior = true; }
		}
		else {
			if(previous_element.hasClass("question")) {
				if(!previous_element.hasClass("odd")) { div_question.addClass("odd"); oddIratior = true; }
			}
		}		
		
		if (createQuestion_type != "scale") {
				
			var h5 = document.createElement("h5");
		
			var number = document.createElement("span");
			number.className = "number";
		
			var qtxt = document.createElement("span");
			qtxt.className = "qtxt";
			qtxt.appendChild(document.createTextNode(question_text.value)); //form.question_text.value
		
			h5.appendChild(number);
			h5.appendChild(qtxt);
		
			div_question.appendChild(h5);
		

			var ul = document.createElement("ul");
		
			switch(createQuestion_type) {
				case "checkbox":
					var fetch = true;
					var item_count = 0;
					var checkboxes = $(document).getElements('input[name=new_checkbox]');
					while (fetch == true) {
						if(checkboxes != null && checkboxes[item_count] != null) {
							var li = document.createElement("li");
							var label = document.createElement("label");
							var checkbox = document.createElement("input");
							checkbox.type = "checkbox";
				
							label.appendChild(checkbox);
							label.appendChild(document.createTextNode(checkboxes[item_count].value)); //checkboxes.item(item_count).value));
							li.appendChild(label);
							li.appendChild(label);
							ul.appendChild(li);
				
							item_count++;
						} else {
							fetch = false;
						}
					}
					break;
				
				case "textfield":
					var textfield = $(document).getElement('input[name=textfield]');
					if (textfield != null) {
						var li = document.createElement("li");
						var label = document.createElement("label");
						var text = document.createElement("input");
						text.type = "text";
						text.value = textfield.value;
					
					
						label.appendChild(text);
						li.appendChild(label);
						ul.appendChild(li);
					}
					break;
			
				case "textarea":
					var textarea = $(document).getElement('textarea[name=textarea]');
					if (textarea != null) {
						var li = document.createElement("li");
						var label = document.createElement("label");
						var text = document.createElement("textarea");
						text.value = textarea.value;
					
					
						label.appendChild(text);
						li.appendChild(label);
						ul.appendChild(li);
					}
					break;
			
				case "radio":
					var fetch = true;
					var item_count = 0;
					var radios = $(document).getElements('input[name=new_radio]');
					while (fetch == true) {
						if(radios != null && radios[item_count] != null) {
							var li = document.createElement("li");
							var label = document.createElement("label");
							var radio = document.createElement("input");
							radio.type = "radio";
				
							label.appendChild(radio);
							label.appendChild(document.createTextNode(radios[item_count].value));
							li.appendChild(label);
							ul.appendChild(li);
				
							item_count++;
						} else {
							fetch = false;
						}
					}
					break;
			}
		
			div_question.appendChild(ul);
				
		
			addQuestion.parentNode.insertBefore(div_question, addQuestion);
			question_text.focus();
		
		
			// nollställer formuläret
			question_text.value = "";
		} else {
			// En Scale-group skapas.
			
			var scale_group = document.createElement("div");
			scale_group.className="scale-group";
			
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
			h4_betyg.appendChild(document.createTextNode("Betyg"));
			
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
			span = document.createElement("span").appendChild(document.createTextNode("Vet ej"));
			li.className = "v";
			li.appendChild(span);
			ul.appendChild(li);
			
			headline.appendChild(h4);
			gr.appendChild(h4_betyg);
			gr.appendChild(ul)
			an.appendChild(gr);
			headline.appendChild(an);
			
			scale_group.appendChild(headline);
			
			// slut på headline
			
			var fetch = true;
			var item_count = 0;
			var radios = $(document).getElements('input[name=new_scale_radio]');
			//var radios = document.createForm.new_scale_radio;
			while (fetch == true) {
				//if(radios != null && radios.item(item_count) != null) {
				if(radios != null && radios[item_count] != null) {
					var question = new Element('div', { 'class': 'question' });
					
					if(oddIratior) {
						question.addClass("odd");
						oddIratior = false;
					}
					else {
						oddIratior = true;
					}
					
					if(item_count == 0) { question.addClass("first"); }
					if(radios[item_count + 1] == null) { question.addClass("last"); }
					
					var h5 = document.createElement("h5");

					var number = document.createElement("span");
					number.className = "number";
					
					number.appendChild(document.createTextNode("0")); // Temporär.
					
					var qtxt = document.createElement("span");
					qtxt.className = "qtxt";
					qtxt.appendChild( document.createTextNode(radios[item_count].value) ); //radios.item(item_count).value
					h5.appendChild(number);
					
					h5.appendChild(qtxt);

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
						var span = document.createElement("span");
						if (i == 5) { // 6:e
							li.className = "v";
							span.appendChild(document.createTextNode("Kan ej ta ställning") );
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
				
				addQuestion.parentNode.insertBefore(scale_group, addQuestion);
				question_text.focus(); //form.question_text.focus();


				// nollställer formuläret
				question_text.value = "";
		}
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

function showEditBox(element, inputs) {
	var edit_div = $(element).getElement('.edit');
	if (edit_div) {
		
	} else {
		if(inputs != null) {	
			var edit_event = function(){ element.getElement(".qtext").inlineEdit(); };
			element.getElement(".qtext").addEvent('click',edit_event );
			
			var edit_div = new Element('div', {'class': 'edit'});
			var edit_form = new Element('form');
			
			if(inputs.questionType != "group-priority")
			{
				var ul = document.createElement("ul");
			
				for (var i=0; i < inputs.length; i++) {
					var clone = $(inputs[i]);
					var label = clone.getElementsByTagName('label')[0];
				
					if (inputs.questionType == "group") {
						label = label.getElementsByTagName('span')[0];
					}
				
					var li = document.createElement("li");
					//clone.style = "";
					var inputfield = document.createElement("input");
					inputfield.type = "text";
					inputfield.value = getFirstTextNode(label);
					
					var item = clone.getElementsByTagName('input')[0];
					switch (item.className) {
						case "r": inputfield.questionType = "radio"; break;
						case "cb": inputfield.questionType = "checkbox"; break;
						case "textline":
							/* Kollar vad fältets list-element har för klassnamn, för att avgöra om textfältet är av typ checkbox/radio. */
							if (item.parentNode.parentNode.className == "checked" || item.parentNode.parentNode.className == "unchecked") {
								inputfield.questionType = "checkbox_line";
							}
							else if (item.parentNode.parentNode.className == "selected" || item.parentNode.parentNode.className == "unselected") {
								inputfield.questionType = "radio_line";
							}
							break;
						default : inputfield.questionType = item.className;
					}

					li.setAttribute("class", inputfield.questionType);
					
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
					li.className = "checkbox"; //
					var new_input = document.createElement("input");
					new_input.type = "text";
					this.setAttribute("name", "new_checkbox");
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
			} else {
				var grade = document.createElement("ul");
				
				for (var i=0; i < inputs["grade"].length; i++) {
					var clone = $(inputs["grade"][i]);
					var label = clone.getElementsByTagName('label')[0].getElementsByTagName('span')[0];
				
					var li = document.createElement("li");
					var inputfield = document.createElement("input");
					inputfield.type = "text";
					inputfield.value = getFirstTextNode(label);
					inputfield.questionType = clone.getElementsByTagName('input')[0].className;
					li.appendChild(inputfield);
				
					var removeField = document.createElement("a");
					removeField.setAttribute("href", "#");
					removeField.onclick = function() {
						var input = this.parentNode;
						input.parentNode.removeChild(input);
						return false;
					};
					removeField.appendChild(document.createTextNode("X"));
					li.appendChild(removeField);
					grade.appendChild(li);
				}
				//edit_div.appendChild(grade);
				edit_form.appendChild(grade);
				
				var priority = document.createElement("ul");
				for (var i=0; i < inputs["priority"].length; i++) {
					var clone = $(inputs["priority"][i]);
					var label = clone.getElementsByTagName('label')[0].getElementsByTagName('span')[0];
				
					var li = document.createElement("li");
					var inputfield = document.createElement("input");
					inputfield.type = "text";
					inputfield.value = getFirstTextNode(label);
					inputfield.questionType = clone.getElementsByTagName('input')[0].className;
					li.appendChild(inputfield);
				
					var removeField = document.createElement("a");
					removeField.setAttribute("href", "#");
					removeField.onclick = function() {
						var input = this.parentNode;
						input.parentNode.removeChild(input);
						return false;
					};
					removeField.appendChild(document.createTextNode("X"));
					li.appendChild(removeField);
					priority.appendChild(li);
				}
				//edit_div.appendChild(priority);
				edit_form.appendChild(priority);
				
				
			}
			
			var delete_link = document.createElement("a");
			delete_link.setAttribute("href", "#");
			delete_link.onclick = function() { delete_question(this.parentNode.parentNode); return false; };
			delete_link.appendChild(document.createTextNode("Ta bort frågan"));
			edit_form.appendChild(delete_link);
			edit_form.appendChild(document.createElement("br"));
		
			var close_link = document.createElement("a");
			close_link.onclick = function(){closeEditBox(element, edit_event); return false; };
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
			element.appendChild(edit_div);
		}
		else {
			var edit_event = function(){ alert("click"); element.getElement(".qtext").inlineEdit(); }
			element.getElement(".qtext").addEvent('click',edit_event );
			alert("click");
			var edit_div = new Element('div', {'class': 'edit'});
		
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
				option.appendChild(document.createTextNode(select_values[i]));
				select.appendChild(option);
			}
		
			select.onchange = function() {
				var options = select.getElementsByTagName("option");
				for (var i=0; i < options.length; i++) {
					if(options[i].selected) { show_settings(element, options[i].innerHTML); }
				}
			}
		
			var link_p = document.createElement("p");
			var a = document.createElement("a");
			a.href = "#";
			$(a).addEvent('click', function() {
				create_question();
				delete_question(this.parentNode.parentNode);
				return false;
			});
			a.appendChild(document.createTextNode("Färdig"));
			link_p.appendChild(a);
		
			var select = p.appendChild(select);
			p.appendChild(document.createElement("br"));
		
		
		
			form.appendChild(p);
		
			var form = edit_div.appendChild(form);
		
			var settings = document.createElement("div");
			settings.className = "settings";
		
			form.appendChild(settings);
		
			form.appendChild(link_p);
		
			var delete_link = document.createElement("a");
			delete_link.setAttribute("href", "#");
			delete_link.onclick = function() { delete_question(this.parentNode); return false; };
			delete_link.appendChild(document.createTextNode("Ta bort frågan"));
			edit_div.appendChild(delete_link);
			edit_div.appendChild(document.createElement("br"));
		
			var close_link = document.createElement("a");
			close_link.onclick = function(){closeEditBox(element, edit_event); return false; };
			close_link.setAttribute("href","#");
			close_link.appendChild(document.createTextNode("Stäng"));
			edit_div.appendChild(close_link);
		
			element.appendChild(edit_div);
			//addQuestion.parentNode.insertBefore(edit_div, addQuestion);
		
			select.focus();		
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