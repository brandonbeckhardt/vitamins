#dot-module

dot-module lets you simple transform your templates directory into one CommonJS module. Best served with [modules-webmake](https://github.com/medikoo/modules-webmake).

### Installation:

```	
npm install -g dot-module
```

###Usage:  

```
dot-module -d templates/ -o ./templates.js
```

###Options:

	-d 	Target directory <path>
	-o	Output file <path>
	

###Example:
	
Create a doT.js template (templates/sample.html).  Templates must have a .html extension.

	<ul id="scores">
		{{~it.scores:score:index}}
			<li>{{=score}}</li>
		{{~}}
	</ul>

	dot-packer -d templates/ -o ./templates.js
	
Once you include the templates.js module in your webpage you can access
the template in javascript.

```
var templates = require('./templates'),
	scores = templates['scores'];
	
container.innerHTML = scores({
  scores: user.scores
});

```