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
//
 
var spec = document.createElement("div");
spec.id = "spec";

var input = document.createElement("input");
input.type = "text";
input.setAttribute("name", "new_checkbox")

var next_input = document.createElement("input");
next_input.type = "text";
next_input.className = "disable";
next_input.onclick = function() {
	this.className = "";
	var p = document.createElement("p");
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
var next_p = document.createElement("p");

p.appendChild(input);
next_p.appendChild(next_input);

spec.appendChild(p);
spec.appendChild(next_p);

var spec_checkbox = spec;


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
		
		
		var input = document.createElement("input");
		input.type = "text";
		input.name = "question_text";
		
		var link_p = document.createElement("p");
		var a = document.createElement("a");
		a.href = "#";
		a.setAttribute("onclick", "create_question(); delete_question(this.parentNode.parentNode); return false;");
		a.appendChild(document.createTextNode("Färdig"));
		link_p.appendChild(a);
		
		p.appendChild(document.createTextNode("Frågetext: "));
		var input = p.appendChild(input);
		p.appendChild(document.createElement("br"));
		
		
		form.appendChild(p);
		
		var form = div_question.appendChild(form);
		
		form.appendChild(spec_checkbox);

		form.appendChild(link_p);
		
		var addQuestion = document.getElementById("addQuestion");
		
		addQuestion.parentNode.insertBefore(div_question, addQuestion);
		
		input.focus();
		createQuestion_on = true;
		
	}
	else {
		// hämtar allt från createQuestion's formulär och skickar vidare det till create_question(...)
		// nollställer creaceQuestion's formulär.
		create_question();
	}
}

function create_question() {
	var form = document.getElementById("createQuestion").getElementsByTagName("form")[0];
	
	if (form.question_text.value != null && form.question_text.value != "") {
		var div_question = new Element('div', { 'class': 'question clearfix' });
	
		var addQuestion = document.getElementById("createQuestion");
		var previous_element = $(addQuestion).getPrevious();
		//for (var i=0; !previous_element.className.match(/(question|group)/) && i<10 ;i++) previous_element = addQuestion.getPrevious();
		
		if (previous_element.hasClass("group")) {
			var is_odd = previous_element.getLast("div.question").hasClass("odd");
			if (!is_odd) { div_question.addClass("odd"); }
		}
		else {
			if(previous_element.hasClass("question")) {
				if(!previous_element.hasClass("odd")) { div_question.addClass("odd"); }
			}
		}		
				
		var h5 = document.createElement("h5");
		
		var number = document.createElement("span");
		number.className = "number";
		
		var qtxt = document.createElement("span");
		qtxt.className = "qtxt";
		qtxt.appendChild(document.createTextNode(form.question_text.value));
		
		h5.appendChild(number);
		h5.appendChild(qtxt);
		
		div_question.appendChild(h5);
		
		
		/**** CHECKBOX ****/
		
		var ul = document.createElement("ul");
		var fetch = true;
		var item_count = 0;
		var checkboxes = document.createForm.new_checkbox;
		while (fetch == true) {
			if(checkboxes.item(item_count) != null) {
				var li = document.createElement("li");
				var label = document.createElement("label");
				var checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				
				label.appendChild(checkbox);
				label.appendChild(document.createTextNode(checkboxes.item(item_count).value));
				li.appendChild(label);
				ul.appendChild(li);
				
				item_count++;
			} else {
				fetch = false;
			}
		}
		
		div_question.appendChild(ul);
		
		/**********/
		
		
		addQuestion.parentNode.insertBefore(div_question, addQuestion);
		form.question_text.focus();
		
		
		// nollställer formuläret
		form.question_text.value = "";
	}
	
}

function delete_question(question) {
	var parent = question.parentNode;
	var oldParent = parent.parentNode;
	
	if (parent.id == "createQuestion") { createQuestion_on = false; } // Skapa-rutan är borta, dvs. den är inte på.
	oldParent.removeChild(parent); 
}
