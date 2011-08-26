/* Author: Gar_onn

add Localstorage support
add Db support





*/


function spotonTasks(){
return {
'tasks': {"n":"My Tasklist","id":0,"s":100,"g":55.51028636264,"c":[{"n":"1 coding","g":60,"s":41,"c":[{"g":95,"n":"1.1 PHP","s":30,"id":2,"p":1},{"g":45,"n":"1.2 JS","s":70,"id":3,"p":1}],"id":1,"p":0},{"n":"2 rulling the world","g":"25","s":19,"id":4,"p":0},{"n":"3 Design","s":30,"g":79.8676212088,"c":[{"g":"100","n":"3.1 functional","s":50,"id":6,"p":5},{"g":"58","n":"3.2 haha","s":31.251,"id":7,"p":5},{"g":62.62087999999999,"n":"3.3 sander suckt","s":18.751,"c":[{"g":"34","n":"3.3.1 algem","s":47,"id":9,"p":8},{"g":"88","n":"3.3.2 de rest","s":53.001,"id":10,"p":8}],"id":8,"p":5}],"id":5,"p":0},{"g":"22","n":"4 lorem","s":10,"id":11,"p":0}],"display":{"size":6.283185307179586}},


'data' : {
			'blankTask' : {'n':'New subtask','g':0,'s':0},
			'maxId':0,
			'curTask' : 0,
			'tasksById' : new Array(),
			'changesMade': [],
			'screenD':{
						'sizeMiddle': 50,
						'sizeA':50,
						'maxA':3,
						'sizeB':10,
					},
		
			'screen':{
						'centerX': 200,
						'centerY' : 200,
						'sizeMiddle': 30,
						'canvasX': 400,
						'canvasY': 400,
						'sizeA':50,
						'maxA':3,
						'sizeB':45,
						'offset' : 30
					},
			'colorScheme' : {
					'hover' : 	['#4375B0','#AEC5E0'],
					'normal': 	['#0F4688','#479AEB'],
					'normal_selected':	['#E0CB48','#F6F0CB'],
					'hover_selected': ['#FFAE56','#FFF8F0']
					}
		},

'mouse':{x:0,y:0,hover:0,lastClicked:0},

/*
 * init (constructor function)
 * 
 * function
 *   bind functions, map Id, ...
 *
 * args:
 *   canvasIdentifier : jQuery selector for the canvas
 *
 */
'init':function(canvasIdentifier){
	this.$canvas = 	$(canvasIdentifier);
	this.ctx = 		this.$canvas[0].getContext('2d');

	if(Modernizr.localstorage == true 
			&& typeof(localStorage.getItem('spotonTasks')) == 'string'
			&& localStorage.getItem('spotonTasks').length > 10){
	this.tasks =localStorage.getObject('spotonTasks');			
	log('local',this.tasks)
	}

	//enable resizer
	this.resize();
	$(window).resize({o:this},function(e){e.data.o.resize()});
	$(document.documentElement).keyup({o:this},function(e){
			if(e.target.nodeName.toLowerCase() != 'input'){
				
				switch((e.shiftKey? "+":"-") + e.keyCode){
					case '-46':
					case '+46':
						e.data.o.remove()
					break;
					case '-45':
						e.data.o.add('neighbour');
					break;
					case '+45':
						e.data.o.add('child');
					break;
				}

			}
		});

	this.$canvas
		// handel mousemoves
		.mousemove({o:this},function(e){
			var screen = e.data.o.data.screen;
			e.data.o.mouse.x=e.clientX - e.data.o.ctx.canvas.getBoundingClientRect().left;
			e.data.o.mouse.y=e.clientY - e.data.o.ctx.canvas.getBoundingClientRect().top;
			e.data.o.mouse.r=Math.sqrt(
								Math.pow((screen.centerX-e.pageX),2) 
							  + Math.pow((screen.centerY-e.pageY),2));
							
			})
		//handle clicks
		.click({o:this},function(e){
			e.data.o.mouse.lastClicked = e.data.o.mouse.hover;
			e.data.o.fillSidebar(e.data.o.mouse.lastClicked);
			}); 
		
		//handle updates
		$('#n,#s,#g').change({o:this},function(e){
				e.data.o.updateValue($(this).val(),$(this).attr('id'))
			});
	
		//handel edits
		$('#removeTask').click({o:this},function(e){
				e.data.o.remove()
			});
		$('#addNeighbour').click({o:this},function(e){
				e.data.o.add("neighbour")
			});
		$('#addChild').click({o:this},function(e){
				e.data.o.add("child")
			});

	// set base task to zero
	this.data.tasksById[0] = this.tasks;
	this.inTasksId(this.tasks);
	this.fillSidebar(0);
	this.draw();
	return this;
},

/*
 * inTasksId
 *
 * function
 *   fill this.data.tasksById for quiker acces
 *   to the tasks and get the highest Id and store it in
 *   this.data.maxId
 * args
 *   data	-	a task to map
 */

'inTasksId': function(data){
	var i;
	for(i in data.c){
		tasks = data.c[i];
		if(this.data.tasksById[tasks.id] == undefined){
			this.data.tasksById[tasks.id] = tasks;
			this.data.maxId=Math.max(this.data.maxId,tasks.id);
		}
		// repeat for childs
		this.inTasksId(tasks)	
	}
		
},

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                           *
 *                     start of task changing methods                        *
 *                                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
 








/* updateValue (setter)
 *
 * function
 *   set values
 *        > localStorage
 *        > to DB
 *
 * args
 *   value - the new value
 *   id    - the attribute to chaneg
 *               > n (name)
 *               > s (size)
 *               > g (gain/progress)
 *
 */
'updateValue' : function(value,id){
		switch(id){
			case 'n':
				var task = this.data.tasksById[this.data.curTask];
				task.n = value;
			break;
			case 's':
				this.updateS(this.data.curTask,value);
			break;
			case 'g':
				this.updateG(this.data.curTask,value);
			break;
		}	
this.store()
},

/* Updaters 
 * 
 * change the value of a task and sync the other tasks
 *     > change DB
 *     > change localStorage
 * 
 * args
 *    taskId	-	id of the task
 *    newVal	-	new value
 *
 * */
'updateS': function(taskId,newVal){
	var i,	
		task = this.data.tasksById[taskId];

	if(typeof this.data.tasksById[task.p] == "undefined"){
		log("ERR: can't find tasks neighbours");
		//TODO: alert user
		return;
	}
		
		group = this.data.tasksById[task.p].c,
		otherTot =0,
		notLocked = [];
	
	// find neighbour tasks to fill the gap
	for(i in group){
		if(group[i].l != 1 && group[i].id != taskId){
			notLocked.push(group[i]);
			otherTot+=group[i].s
		}
	}
			
	if(notLocked.length == 0){
		log("ERR: no neighbours to modify");
		return; // no neigbours to modify
		//TODO: alert user
	}
	

	// update task
	task.s = newVal*1;
	
	var curTot = newVal*1 + otherTot,
		change = (100 - curTot);

	for(i in notLocked){
		var t = notLocked[i];
		t.s += (t.s / otherTot) * change  ;
		t.s = Math.round(1000 * t.s) /1000;

	}

	// update gain/progress of parrent task since this will be modified
	// do this by (re)updateing the gain to current value, so parrent will 
	// recalculate
	this.updateG(taskId,task.g);
},

'updateG' : function(taskId,newVal){
	var i,	
		task = this.data.tasksById[taskId];	
		task.g = newVal;
		pTask = this.data.tasksById[task.p];

	//recalculate parent if there is a one
	if(typeof pTask != 'undefined'){
		var gain = 0;
		for(i in pTask.c){
			gain += (pTask.c[i].g * (pTask.c[i].s / 100));
		}
		
		this.updateG(task.p,gain);
	}
},

/*end of updaters*/

/* add
 *
 * function
 *   add a new task based on the default task (data.blankTask)
 *
 * args
 *   type	-	"child" or "neighbour"
 *   			where to append new task
 */
'add': function(type){
		var parent = this.data.tasksById[this.data.curTask];		
		
		if(type == 'neighbour'){
			parent = this.data.tasksById[parent.p];		
		}
	
		var blankTask = $.extend(true,{},this.data.blankTask);
		this.data.maxId += 1;
		blankTask.id = this.data.maxId;
		blankTask.p = parent.id;
		blankTask.g = parent.g; 
		this.data.tasksById[blankTask.id] = blankTask;
		if(typeof parent.c == 'undefined' || parent.c.length == 0){
			// subtask of 100%	
			blankTask.s = 100;
			parent.c = [blankTask];		
		}else{
			//extra task, resize
	//		parent.c = 
			parent.c.push(blankTask);
			this.updateS(blankTask.id,50);
		}
		
		this.mouse.lastClicked = blankTask.id;
		this.fillSidebar(blankTask.id);
		this.store();
	},

/* remove
 *
 * function
 *   - remove the current selected task afterconfirming
 *   - remove task based on its id (no confirmation)
 *
 * args
 * [id]		-	Id of the task that should be deleted
 * 				id none given, current selected task will be removed
 *
 */
'remove' : function(id){
	if(typeof id == 'undefined'){
		var task = this.data.tasksById[this.data.curTask];
		if(confirm("delete? are you shure?\n"+task.n)){
			this.remove(task.id);	
		}
	}else{
		var task = this.data.tasksById[this.data.curTask],
			parent = this.data.tasksById[task.p],
			i;
		
		if(typeof parent == 'undefined'){
			log('ERR: could not remove , because base task');
			//TODO alert user
			return;		
		}

		for(i in parent.c){
			if(parent.c[i]==task){
				this.updateS(task.id,0);
				parent.c.splice(i,1);
				break;
			}	
		}

	}
	this.store();
},


'store':function(){
	localStorage.setObject('spotonTasks',this.tasks);	
	log('saved',this.tasks);
	},

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                           *
 *                      end of task changing methods                         *
 *                                                                           *
 *                     start of HTML edits (sidebar)                         *
 *                                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* fillSidebar
 *
 * function
 *   set the ranges an the inputs of the sidebar
 *
 * args
 *   taskId	-	task to edit
 */

'fillSidebar': function(taskId){
			this.data.curTask = taskId;
			var task = this.data.tasksById[taskId];
			$('#n').val(task.n);	
			$('#s').val(Math.round(task.s)).attr('value',Math.round(task.s));
			$('#g').val(Math.round(task.g)).attr('value',Math.round(task.g));

			// you can't change the gain of a task that has childs
			if(typeof task.c == 'undefined' || task.c.length == 0){
				$("#g").removeAttr('disabled');	
			}else{
				$("#g").attr('disabled','disabled');
			}

	},

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                           *
 *                       end of HTML edits (sidebar)                         *
 *                                                                           *
 *                       start of drawing on canvas                          *
 *                                                                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/*
 * drawPart (helper method)
 *
 * function
 *   the method that actualy draws th tasks on the canvas
 *
 *   args
 *     R	-	The maximum radius
 *     prevR-	The radius of the previous circle
 *     startP-	Degree to start drawing
 *     endP	-	Degree to stop drawing
 *     task	-	the task object that will be drawn
 */
'drawPart' : function(R,prevR,startP,endP,task){
	
			var screen = this.data.screen;
			
			this.ctx.beginPath();
			this.ctx.moveTo(screen.centerX,screen.centerY);
			this.ctx.arc(screen.centerX,screen.centerY,R,startP,endP,false);
		
			if(this.mouse.r > prevR && this.ctx.isPointInPath(this.mouse.x,this.mouse.y)  ){
				var fillStyle=  'hover';
				this.mouse.hover = task.id;
				this.mouse.isHovering = true;
			}else{
				var fillStyle = 'normal';
			}
			
			if(this.mouse.lastClicked == task.id){
				fillStyle += '_selected';
			}
		
			this.ctx.fillStyle = this.generateGradient(prevR,R,task.g,fillStyle,screen);
			this.ctx.closePath();
			this.ctx.fill();	
			this.ctx.stroke();
		},
/*
 * generateGradient (helper method)
 *
 * function
 *   return a gradient that fills a certain task for x%
 *	 with a color depending on the state
 *
 * args
 *  rMin	-	pervious radius
 *  rMax	-	max radius
 *  gain	-	the gain of the taskt where the gradient is for
 *  state	-	hover|normal|normal_selected|hover_selected
 *
 * return
 *  a radialGradient
 */
'generateGradient': function(rMin,rMax,gain,state,screen){
			var radgrad = this.ctx.createRadialGradient(
									screen.centerX,screen.centerY,rMin,
									screen.centerX,screen.centerY,rMax);
				gain = (gain < 100 ? gain:100);
				// add a color stop at 'gain%'
				radgrad.addColorStop(gain/100, this.data.colorScheme[state][0]);
				radgrad.addColorStop(gain/100, this.data.colorScheme[state][1]);
			return radgrad;
		},


/*
 * drawCalc (helper Method
 *
 * function
 *   calculate parameters for drawing the right size at the right spot
 *
 * args
 *   data	-	the task object
 *   startDeg	-	the start degree of the parts
 *   endDed		-	the endo of the parts
 *   subLvl		-	current depth
 *   screen		-	the this.data.screen obj
 * 
 */ 
'drawCalc': function(data,startDeg,endDeg,subLvl,screen){
	var curStart = startDeg,
		curEnd = endDeg;

	for(i in data.c){
		var tasks = data.c[i];
		
		// TOTAL ANGLE SIZE * size%
		var angleSize = (endDeg - startDeg)*(tasks.s / 100);
		curEnd = curStart + angleSize;

		//calculate and draw childs first
		this.drawCalc(tasks,curStart,curEnd,subLvl+1,screen);

		//calculate radius
		//TODO: mutch easier method
		if(subLvl-1 >= screen.maxA){
			var prevR =((subLvl-screen.maxA)*screen.sizeB)+(screen.maxA*screen.sizeA);
		}else{
			var prevR = (subLvl) * screen.sizeA;	
		}
		if(subLvl >= screen.maxA){
			var r =prevR+screen.sizeB;
		}else{
			var r = prevR + screen.sizeA;	
		}

		r += screen.sizeMiddle;
		prevR += screen.sizeMiddle;

		this.drawPart(r,prevR,curStart,curEnd,tasks)
		
		curStart  = curEnd;				

	}

},

/*
 * draw 
 *
 * function
 *   start drawing all tasks on the canvas by caling the helper func
 *   and draw the bas task circle
 *   
 *  arg
 *   data	-	data to print out
 *   			if 'AF' or none is supplied base will be done
 */

'draw' : function(data){
	var i,	
		screen = this.data.screen;

	var data = ((arguments.length == 0 || data=="AF") ? this.tasks : data);
	var startDeg=0;
	var endDeg = this.tasks.display.size;
	var subLvl = 0;
	this.ctx.clearRect(0,0,screen.canvasX,screen.canvasY,1000)

	this.mouse.isHovering = false;

	this.drawCalc(data,startDeg,endDeg,subLvl,screen)

	// if mouse is not hovering set hover to base task
	if(this.mouse.isHovering == false){
		this.mouse.hover = 0;
	}


	//draw center Bol
	var middleStatus = (this.mouse.r < screen.sizeMiddle ? 'hover' : 'normal');
		middleStatus += (this.mouse.lastClicked == 0 ? '_selected' : '');

	this.ctx.fillStyle = this.generateGradient(
										0,
										screen.sizeMiddle,
										data.g,
										middleStatus,
										screen);

	this.ctx.beginPath();
	this.ctx.arc(screen.centerX,screen.centerY,screen.sizeMiddle,0,
									this.tasks.display.size);
	this.ctx.closePath();
	this.ctx.fill();
	this.ctx.stroke();
},

/*
 * resize (called at resize)
 *
 * function
 *   recalculate scale and possition of
 *   the circle
 *
 * TODO
 *   figure out if scale and translate is a better option
 *
 */

'resize':function(){
	this.$canvas
		.attr('width',($(window).width()-260))
		.attr('height',$(window).height()-10);	
	
	var screen = this.data.screen;
	screen.canvasX = this.$canvas.attr('width');
	screen.canvasY = this.$canvas.attr('height');
	screen.centerX = Math.floor(screen.canvasX / 2);
	screen.centerY = Math.floor(screen.canvasY / 2);
	
	var ratio = (Math.min(screen.canvasX,screen.canvasY) / 500); 
	screen.sizeA = this.data.screenD.sizeA * ratio;
	screen.sizeB = this.data.screenD.sizeB * ratio;
	screen.sizeMiddle = this.data.screenD.sizeMiddle * ratio;

	this.ctx.lineStyle = '#032349';
	this.ctx.lineWidth = 3;
	this.ctx.lineCap = 'round';
	this.ctx.lineJoin= 'round';

	this.draw();
},

/*
 * AF (animation frame function)
 *
 */ 

'AF': function(){
		window.requestAnimFrame(thing.AF,thing.ctx.canvas);
		thing.draw('AF');
}

}

}






// crossbrowser rquestAnimation frame
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/

window.requestAnimFrame = (function(){
	  return  window.requestAnimationFrame     || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
		   function(/* function */ callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 60);
			  };
	  })();


// store objects in localstorage with great ease
Storage.prototype.setObject = function(key, value) {
		    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
		    return JSON.parse(this.getItem(key));
}





var thing = spotonTasks().init('canvas');
thing.AF();

// verry bad things to get the CSS attr(value) working for the rages
$("input[type='range']").change(function(){var a= $(this).val();$(this).attr('value',a);})



