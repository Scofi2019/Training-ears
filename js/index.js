//音乐
var musical = {
	//调式
	Pitch : {
		//各大调在吉他指板上的空弦音
		C : ["E","B","G","D","A","E"],
		D : ["D","A","F","C","G","D"],
        E : ["C","G","D#","A#","F","C"],
		F : ["B","F#","D","A","E","B"],
		G : ["A","E","C","G","D","A"],
		A : ["G","D","A#","F","C","G"],
		B : ["F","C","G#","D#","A#","F"]
	},
    //音阶
	Scale : {
		content : ["A0","Bb0","B0",                                                 //大字二组
				  "C1","Db1","D1","Eb1","E1","F1","Gb1","G1","Ab1","A1","Bb1","B1", //大字一组
				  "C2","Db2","D2","Eb2","E2","F2","Gb2","G2","Ab2","A2","Bb2","B2", //大字组
				  "C3","Db3","D3","Eb3","E3","F3","Gb3","G3","Ab3","A3","Bb3","B3", //小字组
				  "C4","Db4","D4","Eb4","E4","F4","Gb4","G4","Ab4","A4","Bb4","B4", //小字一组
				  "C5","Db5","D5","Eb5","E5","F5","Gb5","G5","Ab5","A5","Bb5","B5", //小字二组
				  "C6","Db6","D6","Eb6","E6","F6","Gb6","G6","Ab6","A6","Bb6","B6", //小字三组
				  "C7","Db7","D7","Eb7","E7","F7","Gb7","G7","Ab7","A7","Bb7","B7", //小字四组
				  "C8"],                                                            //小字五组
	    getRange : function(start, end, nob){
			var rangeNames = [];
			var sPoint = -1, ePoint = musical.Scale.content.length - 1;

			if(start == end) {
				rangeNames.push(start);
			}else{
				for(var i = 0; i < musical.Scale.content.length; i++){
					var audio = musical.Scale.content[i];
					if(nob && audio.indexOf("b") > 0) continue;
					if(audio == start){
						rangeNames.push(audio);
						sPoint = i;
					}else if(audio == end){
						rangeNames.push(audio);
						ePoint = i;
					}else if(sPoint >= 0 && i >= sPoint && i <= ePoint){
						rangeNames.push(audio);
					}
				}
			}

			return rangeNames;
		},
		randomScale : function(rangeNames){
			var index = Math.floor(Math.random() * rangeNames.length);
			return rangeNames[index];
		}
	},
    //音名
	Alphabet : {
		content : ["C","D","E","F","G","A","B"],
		random : function(){
			var index = Math.floor(Math.random() * this.content.length);
			return this.content[index];
		}
	},
	//音程
	Interval : {
		getNext : function(scale){
			switch(scale) {
			    case "C":
					return {scale:"D", pin:2};
				case "C#":
				    return {scale:"D", pin:1};
				case "D":
					return {scale:"E", pin:2};
				case "D#":
				    return {scale:"E", pin:1};
				case "E":
				    return {scale:"F", pin:1};
				case "F":
					return {scale:"G", pin:2};
				case "F#":
				    return {scale:"G", pin:1};
				case "G":
					return {scale:"A", pin:2};
				case "G#":
				    return {scale:"A", pin:1};
				case "A":
					return {scale:"B", pin:2};
				case "A#":
				    return {scale:"B", pin:1};
				case "B":
				    return {scale:"C", pin:1};
				default:
                    return {scale:"C", pin:2};
			} 
		}
	}
};

//界面
var ui = {
	Listen : {
		init : function(){
			ui.removeResize("listen");
			ui.addResize("listen", function(){
				$(".scaleButtons").height($(window).height() - ui.getHeight($(".header")) - 
					ui.getHeight($(".audio")) - ui.getNonHeight($(".scaleButtons")) - 15);
			});
		},
		setAudio : function(scale){
			$("#testAudio").attr("src", "piano/" + scale + ".wav");
			$("#testAudio").attr("code", scale);
			testAudio.play();
		},
		setState : function(state, text){
			if(state == 1){
				text = text ? text : "正确";
				$("#testState").attr("class", "testState right").html("<i class='fa fa-check'></i>&nbsp;"+text);
			}else if(state == 2){
				text = text ? text : "错误";
				$("#testState").attr("class", "testState wrong").html("<i class='fa fa-close'></i>&nbsp;"+text);
			}else{
				$("#testState").attr("class", "testState").html("");
			}
		},
		buildScaleButton : function(startScale, endScale, nob){
			window.ranges = musical.Scale.getRange(startScale, endScale, nob);

			if(window.ranges.length == 0){
				$(".scaleButtons").html("<label style='font-size:28px;color:red;'>音阶设置有误，请检查最低音阶和最高音阶的音高。</label>");
				return;
			}

			var htm = "";
			for(var i = 0; i < ranges.length; i++){
				htm += "<button type='button' class='btn btn-default btn-sm' code='"+ranges[i]+"' disabled>"+ranges[i]+"</button>";
			}
			$(".scaleButtons").html(htm);

			$(".scaleButtons>button").click(function(){
				var $this = $(this);
				var color = "";

				if($this.attr("code") == $("#testAudio").attr("code")){
					$("#showAnswer").removeClass("hidden");
					$("#answer").text("");

                    //回答正确，重复一遍正确的音阶
                    var scale = $("#testAudio").attr("code");
					ui.Listen.setAudio(scale);
                    
					ui.Listen.setState(1, "正确，2秒后开始下一个音阶");

					setTimeout(function(){
						ui.Listen.setState();
						ui.Listen.setAudio(musical.Scale.randomScale(ranges));
					}, 2000);
					
					color= "#2cc87e";
				}else{
					color= "#e66366";

					ui.Listen.setState(2);
				}

				$this.css({"background-color":color});
				setTimeout(function(){
					$this.css({"background-color":"#fff"});
				}, 2000);
			});
		}
	},
	Guitar : {
		buildMusicalAlphabet : function(pitch, showScale, filter){
			if(!pitch) return false;

			var html = "", style = "", leftI = 0, sTop = -1, topI = 30, data = {};
			var openStrings = musical.Pitch[pitch];

			var $this = $(this);
			$this.attr("code", pitch);
			$this.find(".musicalAlphabet").remove();

			var pinW = $this.find(".guitarRank[rank-index='1']").position().left;
			
			leftI = Math.round((pinW - 24)/2, 2);

			for(var i = 0; i < openStrings.length; i++){
				var scale = openStrings[i];
				
				if(!filter || filter(scale, i + 1)){
					style = "style='left:-32px; top:" + (sTop + topI*i) + "px;'"; 
				    html +="<div class='musicalAlphabet "+scale+"' "+style+">"+scale+"</div>";
				}

				data[i+1] = scale;

				var maxPin = 12, curPin = 0;
				var next = musical.Interval.getNext(scale);

				curPin += next.pin;
				while(curPin <= maxPin){
					if(!filter || filter(next.scale, (i + 1) + "" + curPin)){
						style = "style='left:" + (leftI + pinW*(curPin - 1)) + "px; top:" + (sTop + topI*i) + "px;'"; 
						html +="<div class='musicalAlphabet "+next.scale+"' "+style+">"+next.scale+"</div>";
					}

					data[(i+1) + "" + curPin] = next.scale;

					next = musical.Interval.getNext(next.scale);
					curPin += next.pin;
				}
			}

			if(showScale){
				$this.append(html);
			}
			
			ui.Guitar.data = data;
			ui.Guitar.data.match = function(scale, limit){
				var r = [];
				for(var i in this){
					if(limit && Number(i) < limit) continue;
					if(this[i] == scale){
						var e = {};
						e[i] = scale;
						r.push(e);
					}
				}
				return r;
			}
			$(".pitchLabel").text(pitch+"调");

			return true;
		},
		scaleSelect : {
			show : function(pos, scaleObj){
				var $scale = $(".scaleSelect");
				var left = pos.x - ui.getWidth($scale);
				$scale.css({left: left < 0 ? 0 : left, top: pos.y - $scale.height()/2});
				$scale.removeClass("hidden");
				$scale.attr("code", scaleObj.val);

                this.scaleObj = scaleObj;
				this.pos = pos;
			},
			close : function(){
				$(".scaleSelect").addClass("hidden");
			},
			check : function(scale, callback){
				callback.call(this, $(".scaleSelect").attr("code") == scale);
			}
		},
		getScaleByPosition : function(pos){
			var grank = null, gstring = null;
			var $granks = $(this).find(".guitarRank");

			for(var i = 0; i < $granks.length; i++){
				var $gi = $($granks[i]);
				if(i == 0 && pos.x < $gi.offset().left){
					grank = "null";
					break;
				}else if(i > 0){
					var $gi_1 = $($granks[i-1]);
					if(pos.x >= $gi_1.offset().left + $gi_1.width() && pos.x <= $gi.offset().left + $gi.width()){
						grank = $gi.attr("rank-index");
						break;
					}
				}
			}

			$(this).find(".guitarString").each(function(){
				var $this = $(this);
				if(pos.y >= $this.offset().top - 5 && pos.y <= $this.offset().top + $this.height() + 5){
					gstring = $this.attr("string-index");
					return;
				}
			});

			if(gstring && grank){
				grank = grank == "null" ? "" : grank;
				if(ui.Guitar.data[gstring + grank]){
					return {gstring: gstring, grank: grank, val: ui.Guitar.data[gstring + grank]};
				}else{
					return null;
				}
			}else{
				return null;
			}
		},
		setIconInPos : function(pos, error){
			var $gfp = $(".guitarFingerPlate");
			var $ess = null, clazz = "";

			if(error){
				clazz = "errorScaleSelect";
			}else{
				clazz = "rightScaleSelect";
			}

			$gfp.find("."+clazz).remove();
			$gfp.append("<div class='"+clazz+"'><i class='fa "+(error?"fa-close":"fa-check")+"'></i></div>");
			$ess = $gfp.find("."+clazz);
			$gfp.find("."+clazz).css({left:pos.x - $ess.width()/2, top:pos.y - $ess.height()/2});

			setTimeout(function(){
				$gfp.find("."+clazz).remove();
			}, 2000);
		},
	    buildSelectedScales : function(scales){
			var $ss = $(".selectedScales");
			$ss.html("");
			for(var i = 0; i < scales.length; i++){
				var s = scales[i], string = "", rank = "", scale = "";
				for(var j in s){
					string = j.substr(0,1);
					rank = j.substr(1, j.length - 1);
					scale = s[j];
				}
				$ss.append("<div class='sscale' gs='"+string+"' gr='"+rank+"' scale='"+scale+"'><i class='fa fa-check hidden'></i></div>");
			}
	    },
        checkSelectedScales : function(scaleObj){
			$(".selectedScales").find(".sscale[gs='"+scaleObj.gstring+"'][gr='"+scaleObj.grank+"'][scale='"+scaleObj.val+"']>i").removeClass("hidden");
			return $(".selectedScales>.sscale>i.hidden").length;
        }
	},
	Piano : {
	    render : {
			create : function(scales){
				$this = $(this);
				$this.html("");

				var html = "<div class='piano'>";
                
				var scale = null;
				for(var i = 0; i < scales.length; i++){
					scale = scales[i];
					if(scale.indexOf("b") > -1){
						html += "<div class='blackKey' scale='"+scale+"'><div class='musicalAlphabet "+scale.substr(0,1)+"'>"+scale+"</div></div>";
					}else{
						html += "<div class='whiteKey' scale='"+scale+"'><div class='musicalAlphabet "+scale.substr(0,1)+"'>"+scale+"</div></div>";
					}
				}

				html += "</div>";
				$this.append(html);

				$this.find(".blackKey").each(function(){
					var $this = $(this);
                    $this.css({left: $this.position().left - $this.width()/2});
				});
			}
	    }	
	},
	Staff : {
		init : function(){
			ui.removeResize("staff");
			ui.addResize("staff", function(){
				$("#staffPractice").height($(window).height() - ui.getHeight($(".header")) - 15);
			});
		},
		buildMusicNote : function(){
			var $this = $(this);

			$this.find(".musicNote").remove();

            var width = $this.width();
			var $lines = $this.find(".staffLineHigh,.staffLineCenter,.staffLineLow"), noteNum = $lines.length*2 - 1, count = 0;
            var intervalX = ((width - 120)/noteNum).toFixed(2), intervalY = 12, offsetX = 120, top = 0;
			var html = "", style = "";
			
			for(var i = 0;i < $lines.length; i++){
				var $line = $($lines[i]);
				if(i > 0){
					var $line1 = $($lines[i - 1]);
					top = (ui.pxToNumber($line1.css("margin-top")) + $line1.position().top + 
						      (ui.pxToNumber($line.css("margin-top")) + $line.position().top - 
						       ui.pxToNumber($line1.css("margin-top")) - $line1.position().top - 16
						      ) / 2
					      ).toFixed(2);
                    style = "style='left:" + (count*intervalX + offsetX).toFixed(2) + "px;top:" + top + "px'";
				    html += "<div class='musicNote' "+style+"></div>";
					count++;
				}
				top = (ui.pxToNumber($line.css("margin-top")) + $line.position().top - 16/2).toFixed(2);
				style = "style='left:" + (count*intervalX + offsetX).toFixed(2) + "px;top:" + top + "px'";
				html += "<div class='musicNote' "+style+"></div>";
				count++;
			}
			$this.append(html);

			$this.find(".highIcon").css({left:0, top:-10});
			$this.find(".lowIcon").css({left:10, top:185});
		}
	},
	pxToNumber : function(px){
		if(px && px.indexOf("px") > 0){
			return Number(px.substring(0,px.indexOf("px")));
		}
		return Number(px);
	},
	getNonHeight : function($ele){
		var h = this.pxToNumber($ele.css("padding-top")) + 
				this.pxToNumber($ele.css("padding-bottom")) + 
				this.pxToNumber($ele.css("margin-top")) + 
				this.pxToNumber($ele.css("margin-bottom")) +
				this.pxToNumber($ele.css("border-top-width")) + 
				this.pxToNumber($ele.css("border-bottom-width"));
		return h;
	},
	getHeight : function($ele){
		return $ele.height() + ui.getNonHeight($ele);
	},
	getNonWidth : function($ele){
		var h = this.pxToNumber($ele.css("padding-left")) + 
				this.pxToNumber($ele.css("padding-right")) + 
				this.pxToNumber($ele.css("margin-left")) + 
				this.pxToNumber($ele.css("margin-right")) +
				this.pxToNumber($ele.css("border-left-width")) + 
				this.pxToNumber($ele.css("border-right-width"));
		return h;
	},
	getWidth : function($ele){
		return $ele.width() + ui.getNonWidth($ele);
	},
	resize : function(){
		if(!this._resizeFuncs) return;
		for(var i in this._resizeFuncs){
			this._resizeFuncs[i]();
		}
	},
	addResize : function(key, func){
		if(!this._resizeFuncs){
			this._resizeFuncs = {};
		}
		this._resizeFuncs[key] = func;
	},
    removeResize : function(key){
		if(this._resizeFuncs && this._resizeFuncs[key]){
			delete this._resizeFuncs[key];
		}
    },
	selectTab : function(){
	    var $this = $(this);
		$(".tabHead").removeClass("actived");
		$(".tabHead>i").removeClass();
		$this.addClass("actived");
		$this.find("i:first").attr("class","fa fa-circle");

		var id = $this.attr("target");
		$(".tabBody").removeClass("actived");
		$("#"+id).addClass("actived");

		$(".tabLink").removeClass("actived");
		$("div[tab-link-id='"+id+"']").addClass("actived");	
	},
	init : function(){
		for(var i in this){
			if(this[i].init){
				this[i].init();
			}
		}

		$(window).resize(function(){
			ui.resize();
		});

		ui.resize();
	}
};

//事件
var evt = {
	//自动测试
	startTest : function($this, start, startCall, stopCall){
		var $i = $this.find("i");

		if($i.attr("class") == "fa fa-stop" || start){
			$i.attr("class", "fa fa-play");
			$this.find("span").text("开始测试");

			if(stopCall){
				stopCall();
			}
		}else {
			$i.attr("class", "fa fa-stop");
			$this.find("span").text("停止测试");

            if(startCall){
				startCall();
			}
		}
    },
    Listen : {
		init : function(){
			//听音训练-开始测试
			$("#startTest").click(function(){
				var $this = $(this);
				evt.startTest($this, false, function(){
					$("#showAnswer").removeClass("hidden");
					$("#answer").text("");

					$(".scaleButtons>button").removeAttr("disabled");

					ui.Listen.setAudio(musical.Scale.randomScale(window.ranges));
				},function(){
					$("#showAnswer").addClass("hidden");
					$("#answer").text("");

					$(".scaleButtons>button").attr("disabled","disabled");
				});
			});
			
			//帮助-显示音阶
			$("#showAnswer").click(function(){
				var $this = $(this);
				if($this.attr("class").indexOf("hidden") == -1){
					$this.addClass("hidden");
					$("#answer").text($("#testAudio").attr("code"));
				}
			});

		}
    },
	Guitar : {
		init : function(){
			//Guitar训练-手动训练-音阶选择
			$(".scaleSelect>.musicalAlphabet>a").click(function(){
				ui.Guitar.scaleSelect.check($(this).text(), function(equals){
					this.close();
					if(equals){
						ui.Guitar.setIconInPos(this.pos, false);
						if(evt.Guitar.autoTest){
							var remain = ui.Guitar.checkSelectedScales(this.scaleObj);
							if(remain == 0){
								evt.Guitar.testStart();
							}
						}
					}else{
						ui.Guitar.setIconInPos(this.pos, true);
					}
				});
			});

			//吉他指板点击事件
			$(".guitarFingerPlateWrapper").click(function(e){
				ui.Guitar.scaleSelect.close();
				var pos = {x:e.pageX, y:e.pageY};
				var scaleObj = ui.Guitar.getScaleByPosition.call($(this), pos);
				if(scaleObj){
					ui.Guitar.scaleSelect.show(pos, scaleObj);
				}
			});
	 
			//Guitar训练-自动训练-开始测试按钮
			$("#startTestForGuitar").click(function(){
				var $this = $(this);
				evt.startTest($this, false, function(){
					evt.Guitar.testStart();
				}, function(){
					evt.Guitar.testEnd();
				});
			});

            //帮助-显示音阶
			$("#showAnswerForGuitar").click(function(){
				var displayScale = function(){
					ui.Guitar.buildMusicalAlphabet.call($(".guitarFingerPlate"), setting.Guitar.pitch.value(), true, function(scale, gPos){
						return evt.Guitar.testScale == scale;
					});
				};
				displayScale();
				ui.removeResize("musicalAlphabet");
				ui.addResize("musicalAlphabet", function(){
					displayScale();
				});
			});
		},
		testStart : function(){
			var scale = musical.Alphabet.random();
			$("#answerForGuitar .musicalAlphabet.lg").addClass(scale).text(scale);
			evt.Guitar.autoTest = true;
			evt.Guitar.testScale = scale;
			ui.Guitar.buildSelectedScales(ui.Guitar.data.match(scale, 0));
		},
	    testEnd : function(){
			$("#answerForGuitar .musicalAlphabet.lg").attr("class","musicalAlphabet lg").html("&nbsp;");
			evt.Guitar.autoTest = false;
			evt.Guitar.testScale = "";
	    }
	},
	Staff : {
		init : function(){
			var range = musical.Scale.getRange("G2", "F5");

			ui.Staff.buildMusicNote.call($(".staffWrapper"));
			ui.Piano.render.create.call($(".musicalInstrumentWrapper"), range);

            ui.removeResize("staffForResize");
            ui.addResize("staffForResize", function(){
				ui.Piano.render.create.call($(".musicalInstrumentWrapper"), range);
            });
		}
	},
	init : function(){
		//标签页切换点击事件
		$(".tabHead").click(function(){
			
            ui.selectTab.call($(this));

			if($(this).attr("target") == "guitarPractice"){
				var $plate = $("#guitarPractice>.guitarFingerPlateWrapper>.guitarFingerPlate");
				var musicalAlphabet = $("input[name='musicalAlphabet']").prop("checked");
				ui.Guitar.buildMusicalAlphabet.call($plate, "C", musicalAlphabet);
			}
		});

        ui.selectTab.call($("button[target='staffPractice']"));

		for(var i in this){
			if(this[i].init){
				this[i].init();
			}
		}
	}
};

//设置
var setting = {
	Listen : {
		init : function(){
			//最高音阶和最低音阶下拉
			var $ss = $("select[name='startScale']"), sOpt = "";
			var $es = $("select[name='endScale']");

			for(var i in musical.Scale.content){
				var scale = musical.Scale.content[i];
				sOpt += "<option value='"+scale+"'>"+scale+"</option>";
			}

			$ss.append("<option value=''>最低音阶</option>" + sOpt);
			$es.append("<option value=''>最高音阶</option>" + sOpt);

			$ss.val("C4");
            $es.val("B4");

			//听音设置-应用设置
			$("#btnSave").click(function(){
				var startScale = $("select[name='startScale']").val();
				var endScale = $("select[name='endScale']").val();

				if(!startScale || !endScale) return;

				var fallingTone = $("input[name='fallingTone']").prop("checked");

				ui.Listen.buildScaleButton(startScale, endScale, fallingTone);

				$(".settingModal").addClass("hidden");

				evt.startTest($("#startTest"), true, function(){
					$("#showAnswer").removeClass("hidden");
					$("#answer").text("");

					$(".scaleButtons>button").removeAttr("disabled");

					ui.Listen.setAudio(musical.Scale.randomScale(window.ranges));
				},function(){
					$("#showAnswer").addClass("hidden");
					$("#answer").text("");

					$(".scaleButtons>button").attr("disabled","disabled");
				});

				ui.Listen.setState();
			});
		}
	},
	Guitar : {
		testWay : {
			isAuto : function(){
				return $("input[name='guitarPracMode']:checked").val() == "2";
			},
			isManual : function(){
				return $("input[name='guitarPracMode']:checked").val() == "1";
			}
		},
	    pitch : {
			value : function(pitch){
				if(pitch){
					$(".guitarFingerPlate").attr("code", pitch);
					$("#guitarPractice>.pitchLabel").text(pitch + "调");
				}
				return $(".guitarFingerPlate").attr("code");
			}
	    },
		init : function(){
			//音调下拉
			var sOpt = "";
			var $pitch = $("select[name='pitch']");
			for(var i in musical.Pitch){
				sOpt += "<option value='"+i+"'>"+i+"调</option>";
			}

			$pitch.append("<option value=''>调式</option>" + sOpt);

			//Guitar训练-应用设置
			$("#btnSaveForGuitar").click(function(){
				var pitch = $("select[name='pitch']").val();
				if(!pitch) return;

				setting.Guitar.initPitchScale(pitch, $("input[name='musicalAlphabet']").prop("checked"));

				$(".settingModal").addClass("hidden");
			});

            this.initPitchScale("C");
		},
		initPitchScale : function(pitch, musicalAlphabet){
			ui.Guitar.buildMusicalAlphabet.call($(".guitarFingerPlate"), pitch, musicalAlphabet);
			setting.Guitar.pitch.value(pitch);

            ui.removeResize("musicalAlphabet");
			if(musicalAlphabet){
				ui.addResize("musicalAlphabet", function(){
					ui.Guitar.buildMusicalAlphabet.call($(".guitarFingerPlate"), pitch, musicalAlphabet);
				});
			}
		}
	},
	Staff : {
		
	},
	init : function(){
		//设置按钮
		$("#btnSetting").click(function(){
			var $setModal = $(".settingModal");

			if($setModal.attr("class").indexOf("hidden") == -1){
				$setModal.addClass("hidden");
			}else{
				$setModal.css({left : 0, top : $(".header").height()});
				$setModal.removeClass("hidden");
			}
		})

			
		//取消设置
		$("button[name='btnCancel']").click(function(){
			$(".settingModal").addClass("hidden");
		});

		for(var i in this){
			if(this[i].init){
				this[i].init();
			}
		}
	}
}


//初始化
$(function(){
    setting.init();
	evt.init();
	ui.init();
});