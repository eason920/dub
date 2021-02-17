let rec, wave;
// ==========================================
// == browser 錄音充許開啟 v
// ==========================================
const recOpen = function(){
	rec=null;
	wave=null;
	let newRec=Recorder({
		type:"mp3", sampleRate:16000, bitRate:16
		,onProcess:function(buffers,powerLevel,bufferDuration,bufferSampleRate,newBufferIdx,asyncEnd){}
	});

	createDelayDialog(); // 防止特異 browser 設定狀況
	newRec.open(function(){
		dialogCancel();
		rec=newRec;
		wave=Recorder.FrequencyHistogramView({elem:".recwave"});
	},function(msg,isUserNotAllow){
		dialogCancel();
	});
	
	window.waitDialogClick=function(){
		dialogCancel();
	};
};

// ==========================================
// == browser 錄音充許關閉 (釋放資源) v
// ==========================================
const recClose = function(){
	if(rec){rec.close()};
};

// ==========================================
// == 開始錄音 v
// ==========================================
const recStart = function(){
	rec && Recorder.IsOpen() ? rec.start() : console.log('record err');
};

// ==========================================
// == 结束錄音，得到音頻文件 v
// ==========================================
const recStop = function(){
	if(!(rec&&Recorder.IsOpen())){
		return;
	};
	rec.stop(function(blob,duration){
		console.log(blob);
		recBlob.push(blob);
		console.log('push', recBlob);

		// CREATE AUDIO ELE v
		if(!recBlob){return;};

		// 加載 audio 物件 v
		const audio=document.createElement("audio");
		audio.controls=true;// true => 產生可操控介面
		audio.setAttribute('id', 'myAudio_' + recId);
		$('#audioBox').append(audio);

		//簡單利用URL生成播放地址，注意不用了時需要revokeObjectURL，否則霸占暫存
		audio.src=(window.URL||webkitURL).createObjectURL(recBlob[recId]);
		setTimeout(function(){
			(window.URL||webkitURL).revokeObjectURL(audio.src);
		},1000);
	});
};

// ==========================================
// == 上傳 v
// ==========================================
const uploadFile = function(){
	const roleAry = [];
	gData.forEach((item)=>{
		if(item.role === gActor) roleAry.push(item.sentenceIndex);
	});

	// --------------------------------
	let formData = new FormData();
	for ( i = 0; i < recBlob.length; i++ ){
		const p1 = roleAry[i];
		const p2 = recBlob[i];
		const p3 = dataCustomerId + '-' + dataMemberId + '-' + programNo + '-' + roleAry[i] + '.mp3';
		formData.append( p1, p2, p3 );
	};
	formData.append('member_id', dataMemberId);
	formData.append('customer_id', dataCustomerId);
	formData.append('news_id', programNo);
	
	//  上傳介面 v
	$('body').append(
		$('<div>', { class: 'lbdone-masker' }),
		$('<div>', { class: 'lbdone' }).append(
			$('<div>', { class: 'icon-congrats' }),
			$('<div>', { class: 'lbdone-text' }).text('錄音檔案上傳中...'),
			$('<div>', { class: 'lbdone-box' }).append(
				$('<div>', { class: 'lbdone-box-progress' }).css('width', '66%')
	)));
				
	const url='../newmylessonmobile/api/InteractiveVideoUpload';
	// * 必須false才會避開jQuery對 formdata 的預設處理 
	// * XMLHttpRequest會對 formdata 進行正確的處理 
	$.ajax({
		type: "POST",
		url,
		contentType: false, // 讓xhr自動處理Content-Type header，multipart/form-data需要生成隨機的boundary
		processData: false, // 不要處理data，讓xhr自動處理			
		data: formData,
		processData: false, 
		contentType: false , // 必須false才會自動加上正確的Content-Type
		xhr: function(){
			let xhr = $.ajaxSettings.xhr();
			if(onprogress && xhr.upload) {
				xhr.upload.addEventListener("progress" , onprogress, false);
				console.log(xhr);
				return xhr;
			}
		} 
	});
};

// ==========================================
// == 偵查附件上傳情況 (約 0.05-0.1 秒執行一次) v
// ==========================================
const onprogress = function(evt){
	const loaded = evt.loaded; //已經上傳大小情況 
	const tot = evt.total;     //附件總大小 
	const per = Math.floor(100*loaded/tot); //已經上傳的百分比 
	console.log('upload is ', per);
	
	$(".lbdone-box-progress").css("width" , per + "%");
	if( per >= 100){
		$('.lbdone-text').text('錄音上傳完成');
		setTimeout(function () {
			$('.lbdone-masker, .lbdone').fadeOut(300);
		}, 1000);
		setTimeout(function () {
			$('.lbdone-masker, .lbdone').remove();
			recClose();
		}, 2000);
	};
};

const showDialog = function(){
	if(!/mobile/i.test(navigator.userAgent)){return;};
	dialogCancel();
	
	let div = document.createElement("div");
	document.body.appendChild(div);
	div.innerHTML=(''
		+'<div class="waitDialog">'
			+'<div class="waitDialog-1">'
				+'<div style="flex:1;"></div>'
				+'<div class="waitDialog-2">'
					+'<div style="padding-bottom:10px;">錄音功能需要麥克風權限，請允許；如果未看到任何請求，請點擊忽略</div>'
					+'<div style="text-align:center;"><a onclick="waitDialogClick()" style="color:#0B1">忽略</a></div>'
				+'</div>'
				+'<div style="flex:1;"></div>'
			+'</div>'
		+'</div>');
};

let dialogInt;

const createDelayDialog=function(){
	dialogInt=setTimeout(function(){
		showDialog();
	},8000);
};

const dialogCancel=function(){
	clearTimeout(dialogInt);
	const elems=document.querySelectorAll(".waitDialog");
	for(let i=0;i<elems.length;i++){
		elems[i].parentNode.removeChild(elems[i]);
	};
};