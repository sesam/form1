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

		//div_question.innerHTML = '<form><p>Frågetext: <input type="text" name="question_text"><br><a href="#" onclick="create_question(); delete_question(this.parentNode.parentNode); return false;">Färdig</a></p></form>';
		
		var form = document.createElement("form");
		form.setAttribute("name", "createForm");
		var p = document.createElement("p");
		
		var select = document.createElement("select");
		select.name = "question_type";
		
		/*
		var option = document.createElement("option");
		option.selected = "selected";
		option.appendChild(document.createTextNode("Typ"));
		select.appendChild(option);*/
		
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
			create_question();
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
		// hämtar allt från createQuestion's formulär och skickar vidare det till create_question(...)
		// nollställer creaceQuestion's formulär.
		create_question();
	}
}

function create_question() {
	var oddIratior = false;
	var form = document.getElementById("createQuestion").getElementsByTagName("form")[0];
	var question_text = form.elements[1];
	//if (form.question_text.value != null && form.question_text.value != "") {
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
					//var checkboxes = document.createForm.new_checkbox;
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
					//var textfield = document.createForm.textfield;
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
					//var textarea = document.createForm.textarea;
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
					//var radios = document.createForm.new_radio;
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
				input.setAttribute("name", "new_checkbox")

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
/* På G *
function fetchQuestion(question) {
	var type = null;
	var parent_classname = question.parentNode.className;
	if (hasClassName(parent_classname, "scale-group")) {
		type = "scale";
	} else if (hasClassName(parent_classname, "column-group")) {
		type = "column";
	} else {
		
	}
}
*/

function showEditBox(element) {
	var edit_div = $(element).getElement('.edit');
	if (edit_div) {
		
	} else {
		var edit_event = function(){ element.getElement(".qtext").inlineEdit()};
		element.getElement(".qtext").addEvent( 'click',edit_event );

		var edit_div = new Element('div', {'class': 'edit'});
		
		var form = document.createElement("form");
		form.setAttribute("name", "createForm");
		var p = document.createElement("p");
		
		var input = document.createElement("input");
		input.type = "text";
		input.name = "question_text";
		
		input.value = "Frågetext";
		input.style.color = "#666";
		input.onclick = function() {
			if (input.value == "Frågetext") {
				input.value = "";
				input.style.color = "#000";
			}
		}
		input.onblur = function() {
			if (input.value == "") { 
				input.value = "Frågetext";
				input.style.color ="#666";
			}
		}

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

function closeEditBox(element,edit_event) {
	var edit_div = $(element).getElement('.edit');
	if (edit_div) {
		element.removeChild(edit_div);
		element.getElement(".qtext").removeEvent( 'click', edit_event );
	}
}

function show_settings(element, question_type) {
		var settings = $(element).getElement(".settings");
		settings.innerHTML = "";
		
		var delete_td = document.createElement("td");
		var delete_link = document.createElement("a");
		delete_link.href="#";
		delete_link.onclick = function(){delete_table_row(this.parentNode.parentNode); return false;};
		delete_link.appendChild(document.createTextNode("X"));
		delete_td.appendChild(delete_link);
		
		var input_q = document.createElement("input");
		input_q.type = "text";
		input_q.name = "question_text";
		setDefaultInputEvents(input_q, "Frågetext", "#666");
		
		var table = document.createElement("table");
		table = settings.appendChild(table);
		
		var first_tr = document.createElement("tr");
		var first_td = document.createElement("td");
		var input = document.createElement("input");
		input.type = "text";
		input.setAttribute("name", "item");
		first_td.appendChild(input);
		first_tr.appendChild(first_td);
		
		var delete_td = document.createElement("td");
		var delete_link = document.createElement("a");
		delete_link.href="#";
		delete_link.onclick = function(){delete_table_row(this.parentNode.parentNode); return false;};
		delete_link.appendChild(document.createTextNode("X"));
		delete_td.appendChild(delete_link);
		
		first_tr.appendChild(delete_td);
		table.appendChild(first_tr);
		
		
		var next_tr = document.createElement("tr");
		var next_td = document.createElement("td");
		//återanvänder input-variabeln.
		input = document.createElement("input");
		input.type = "text";
		input.className = "disable";
		input.onclick = function() {
			this.className = "";
			var new_tr = document.createElement("tr");
			var new_td = document.createElement("td");
			var new_input = document.createElement("input");
			new_input.type = "text";
			this.setAttribute("name", "item");
			new_input.className = "disable";			
			new_input.onclick = this.onclick;
			new_input.onfocus = this.onclick;
			this.onclick = null;
			this.onfocus = null;
			new_td.appendChild(new_input);
			new_tr.appendChild(new_td);
			
			var delete_td = document.createElement("td");
			var delete_link = document.createElement("a");
			delete_link.href="#";
			delete_link.onclick = function(){delete_table_row(this.parentNode.parentNode); return false;};
			delete_link.appendChild(document.createTextNode("X"));
			delete_td.appendChild(delete_link);
			
			new_tr.appendChild(delete_td);
			insertAfter( new_tr, table.getLast("tr") );
		}
		input.onfocus = input.onclick;
		
		next_td.appendChild(input);
		next_tr.appendChild(next_td);
		
		delete_td = document.createElement("td");
		delete_link = document.createElement("a");
		delete_link.href="#";
		delete_link.onclick = function(){delete_table_row(this.parentNode.parentNode); return false;};
		delete_link.appendChild(document.createTextNode("X"));
		delete_td.appendChild(delete_link);
		
		next_tr.appendChild(delete_td);
		
		table.appendChild(next_tr);
}

function delete_table_row(table_row) {
	var table = $(table_row).getParent("table");
	table.removeChild(table_row);
} 