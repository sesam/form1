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
var createQuestion_on = false;
function new_question() {
	/*var div_question = document.createElement("div");
	div_question = Element(div_question);
	div_question.addClass("question");
	div_question.innerHTML = what;
	*/
	
	if (!createQuestion_on) {
		var div_question = new Element('div', {
		    'id': 'createQuestion'
		});

		div_question.innerHTML = '<form><p>Frågetext: <input type="text" name="question_text"><br><a href="#" onclick="create_question(); delete_question(this.parentNode.parentNode); return false;">Färdig</a></p></form>';
	
		var addQuestion = document.getElementById("addQuestion");
		
		addQuestion.parentNode.insertBefore(div_question, addQuestion);
		
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
		var div_question = new Element('div', {
		    'class': 'question'
		});
	
		var addQuestion = document.getElementById("createQuestion");
		var previous_element = $(addQuestion).getPrevious();
		//for (var i=0; !previous_element.className.match(/(question|group)/) && i<10 ;i++) previous_element = addQuestion.getPrevious();
		
		if (previous_element.hasClass("group")) {
			var is_odd = previous_element.getLast("div.question").hasClass("odd");
			if (!is_odd) {
				div_question.addClass("odd");
			}
		}
		else {
			if(previous_element.hasClass("question")) {
				if(!previous_element.hasClass("odd")) {
					div_question.addClass("odd");
				}
			}
		}
		
		
		div_question.innerHTML = '<h5><span class="number"></span><span class="qtxt">'+form.question_text.value+'</span></h5>';
		
		addQuestion.parentNode.insertBefore(div_question, addQuestion);
		
		// nollställer formuläret
		form.question_text.value = "";
		form.question_text.focus();
	}
	
}

function delete_question(question) {
	var parent = question.parentNode;
	var oldParent = parent.parentNode;
	
	if (parent.id == "createQuestion") { createQuestion_on = false; } // Skapa-rutan är borta, dvs. den är inte på.
	oldParent.removeChild(parent); 
}
