// ==========================================
// == FB & chrome in Apple 轉址 v
// ==========================================
const nua = navigator.userAgent;
const transUrl = '../record_err/dub.html'
if( nua.indexOf('FBAN') > -1 || nua.indexOf('FBAV') > -1 ){
	console.log('1');
	location.href = transUrl;
}else if ( nua.indexOf('iPhone') > -1 || nua.indexOf('iPad') > -1 ){
	console.log('2');
	if( /crios/i.test(nua) ){
		location.href = transUrl;
		console.log('3');
	}
}else{
	console.log('4');
}



// ==========================================
// == VARABLE v
// ==========================================
const isMobi = /android | iphone | ipad/i.test(navigator.userAgent);
let gData = [];

let $player;
let gActor='';
let gIdx = 0;
let gIdxMax;

let vStart;
let vEnd;
let vDone = false;

let sStart;
let sEnd;

let dubRun = 0;// ***** 播放中的切換角色，防前一組的 audio 仍繼續播放 *****

let current = 0;

let timeBarEnd;
let timeDuration;

let updatedYet = true;// 按返回上頁，若未上傳檔就 confirm 確認/防呆

let sentenceRun = 0// 上傳完後，播放一半按停止，句子也停止用，同 dubRun

let programNo = location.href.split('ProgramNo=');
programNo.length === 2 && programNo[1].trim() !== '' ? programNo = programNo[1] : programNo = 110;

// ==========================================
// == FUNCTION v
// ==========================================
// --------------------------------
// -- YOUTUBE v
// --------------------------------
function onYouTubeIframeAPIReady() {
	$.ajax({
		url: '../newmylessonmobile/api/InteractiveVideoJson?indx=' + programNo + '&member_id=' + dataMemberId + '&customer_id=' + dataCustomerId,
		success(data){
			console.log('first start ? ',gData.length === 0);
			if( gData.length === 0 ){
				data.data.forEach((item, i)=>{
					if( item.role !== '' ) {
						item.sentenceIndex = i;
						gData.push(item);
					}
				});

				//
				$('#subtitle').css('width', $('#player').width() );


				// 分換算作秒 v
				const count = function(i, key){
					let num = gData[i][key].replace(',', '.').split(':');
					if( key === 'starttime'){
						num = num[1] * 60 + Math.round( (Number(num[2])-0.1) * 10) / 10;//增幅時間：開始時間提前
					}else{
						num = num[1] * 60 + Math.round( (Number(num[2])+0.1) * 10) / 10;//增幅時間：結束時間延遲
					}
					
					return num;
				};
				for(i in gData){
					gData[i].starttime = count(i, 'starttime');
					gData[i].endtime = count(i, 'endtime');
					gData[i].role == 'A' ? gData[i].role = 'a' : gData[i].role = 'b';
				}
				console.log(gData);
			}

			
			// 各 key 給值 v
			videoId = data.info.urls.split('/');
			videoId = videoId[videoId.length-1];
			gIdxMax = gData.length - 1;
			vStart = gData[0].starttime;
			sStart = gIdx;

			// YT OFFICIAL SETTING v
			$player = new YT.Player('player', {
				videoId,
				playerVars: {
					autoplay: 0,
					playsinline: 1,
					loop: 1,
					rel: 0,
					overlay: 0,
					start: Math.floor(gData[0].starttime) + 1,
					controls: 0,// << 測試用，上線應改作 0
				},
				events: {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				}
			});
		}
	});
};

function onPlayerReady(event) {
		$('#loadErr').remove();
		$('#loadStart').fadeIn();
}

function onPlayerStateChange(evt) {
	if (evt.data === YT.PlayerState.ENDED) {
		evt.target.playVideo();
	}
}

// --------------------------------
// -- DUB v
// --------------------------------
const fnFirstDemo = () => {
	let aTime = 0;
	for(let i = -1; i< gData.length; i ++){
		if(i !== -1){
			aTime = aTime + ( gData[i].endtime * 10 - gData[i].starttime * 10 ) * 100;
		}else{ aTime = 0 };

		// DUB v
		const j = i + 1;
		if( j < gData.length ){
			const role = $('.select-item.is-' + gData[j].role);
			setTimeout(()=>{
				if( $('#select').attr('data-selected') < 1 ){
					fnTrackFull(role);
				};
			}, aTime);
		}else if( j === gData.length ){
			setTimeout(()=>{
				if( $('#select').attr('data-selected') < 2 ){
					console.log('is pause 1 開場演示結尾');
					$player.pauseVideo();
				};
				$('.trackbox').remove();
				if( $('#next').attr('data-status') == 0 ){
					$('#next').click();
				}
			}, aTime);
		};
		
	};
};

const fnDubPlay = ()=>{
	const thisCheck = dubRun;

	$player.unMute();
	const dubAry = [];
	gData.forEach((item, index)=>{
		if( item.role === gActor ) dubAry.push(index);
	});

	// --------------------------------
	// YT 時間歸零 v
	$player.seekTo( gData[0].starttime );
	$player.playVideo();

	//
	let preEnd, newStart, aTime;
	let current = 0;

	const playAudio = function(j, aTime){
		j ++;
		setTimeout(() => {
			if( thisCheck === dubRun ){
				$player.mute();
				const audio = document.getElementById('myAudio_' + j );
				audio.muted = false;
				audio.play();
			}
		}, aTime);
	}
	
	for (let i = -1; i < dubAry.length - 1; i++) {
		if (i != -1) {
			preEnd = gData[dubAry[i]].endtime;
			current = i + 1;
			newStart = gData[dubAry[current]].starttime;
			aTime = aTime + (newStart - preEnd) * 1000;
		}else{
			aTime = ( gData[dubAry[0]].starttime - gData[0].starttime )*1000;
		};
		
		// 逐句的「錄音的開播 & YT 靜音」時機 v
		playAudio(i, aTime);
		
		// YT 取消靜音時機 v
		//「錄音檔的停止」為時間到自動停
		aTime = aTime + (gData[dubAry[current]].endtime - gData[dubAry[current]].starttime) * 1000;
		setTimeout(() => {
			if( thisCheck === dubRun ){
				$player.unMute();
				if( i === dubAry.length - 2 ){
					console.log('is pause 2');
					$('.trackbox').remove();
					$player.pauseVideo();
					$('.footer-item.is-right-play').removeClass('active').find('.footer-text').text('播放配音');
				}
			}
		}, aTime);
	};
};

// for 開頭 & 版尾錄完後「複式聲波」角本 demo v
const fnTrackFull = function(target){
	let other;
	/is-a/.test(target.attr('class')) ? other = $('.select-item.is-b') : other = $('.select-item.is-a');
	 
	// 移除舊的 track ,延遲可使影片 & 聲波同步情形改善 v
	const time = 500;
	other.find('.trackbox').fadeOut(time);
	setTimeout(()=>{
		other.find('.trackbox').remove();
	}, time);

	// 加載動畫元件 v
	target.append(
		$('<div>', {class: 'trackbox'}).append(
			$('<div>', {class: 'trackbox-item'}),
			$('<div>', {class: 'trackbox-item'}),
			$('<div>', {class: 'trackbox-item'})
		)
	);
};

// for STEP2 「單一聲波」角本 demo v
const fnTrackSingle = ()=>{
	$('.select-item.is-' + gActor).append(
		$('<div>', {class: 'trackbox'}).append(
			$('<div>', {class: 'trackbox-item'}),
			$('<div>', {class: 'trackbox-item'}),
			$('<div>', {class: 'trackbox-item'})
		)
	);
};

const fnNextStep = function(){
	$tips = $('#tips');
	$tips.fadeOut(300);
	setTimeout(function(){
		$tips.text('選擇想要扮演的角色').fadeIn();
	}, 300);
	$('#next').text('start').attr('data-status', 1);
};

const fnSentenceText = function(start, end){
console.log(`==================================
sentence start at ${start} , end at ${end}
`);
	const ary = [];
	for(i=start; i <= end; i++){
		ary.push(i)
	}
	const length = ary.length;
	//
	const trans = 1000;
	const ct = function(n){
		$('.trackbox').remove();
		const thisSentenceChick = sentenceRun;
		const $actor = $('.subtitle-act');
		const time = Math.round((gData[ary[n]].starttime - gData[ary[0]].starttime) * 10) / 10;
		setTimeout(function () {
			if( thisSentenceChick === sentenceRun ){
				const role = gData[ary[n]].role;
				role == gActor ? $actor.addClass('active') : $actor.removeClass('active');
				$actor.text(role);
				$('.subtitle-en').text(gData[ary[n]].en_content);
				$('.subtitle-ch-text').text(gData[ary[n]].ch_content);

				// 啟動聲波動畫 v
				const target = $('.select-item.is-'+role);
				fnTrackFull( target );
			}
		}, time * trans);
	};
	ct(0);

	//
	const actMax = length - 1;
	for(i=1;i<=actMax;i++) ct(i);
}

const fnDubDemo = function(){
	const order = [];
	// 取得下一個開錄點 v
	for( i = gIdx; i <= gIdxMax; i ++ ){
		gData[i].role === gActor ? order.push(1) : order.push(0);
	};
	let next = order.findIndex((item)=> item == 1);
	next = next + gIdx;
	vEnd = gData[next].endtime;
	gIdx = next;
	sEnd = gIdx;

	// 確認是否為最後一句 & 於錄完後結束錄音 v
	const checkOrder = []
	for(i = gIdx+1; i<=gIdxMax; i++ ){
		gData[i].role == gActor ? checkOrder.push(1) : checkOrder.push(0);
	}
	const checkVDone = checkOrder.findIndex((item)=> item == 1);
	if( checkVDone < 0 || gIdx == gIdxMax ) vDone = true;

	$('#dbox').hide();

	const time = (vEnd - vStart) * 1000;
	$player.seekTo(vStart);
	$player.playVideo();
	$player.unMute();
	setTimeout(function(){
		// for step2 演示段落
		$('.trackbox').remove();
		console.log('is pause 3 所選角色開錄前段點');
		$player.pauseVideo();
		// $('.ytp-button ytp-collapse').click();
		// $('#player').css('border', 'solid 5px yellow');
		console.log( $('#player').html() );
	}, time);
	
	setTimeout(function(){
		$('#dbox').fadeIn();
	}, time);

	fnSentenceText(sStart, sEnd);
console.log(
`current play index (gIdx) is ${gIdx}, vStart is ${vStart}s, vEnd is ${vEnd}s
is this latest ? ${vDone}
`);
};

// --------------------------------
// -- 倒數 animation v
// --------------------------------
const fnTimeFormater = ( time, decimal, f1, f2 )=>{
	let m = Math.floor(time / 60);
	let s = m > 0 ? Math.floor( time - m * 60 ) : Math.floor(time);
	if( String(s).length < 2 && f2 === '' ) s = '0' + s;// f2 === 0 為「只在時間軸上補零，錄音倒數不補」意思
	let ss = time - m * 60 - s;
	ss = Math.round( ss * 10 ) / 10;
	ss = String( ss ).substr(1) || '.0';
	//
	let str = '';
	if( m > 0 ) str += m + f1;
	if( m <= 0 && f2 === '') str += '00:';// f2 === 0 為「只在時間軸上補零，錄音倒數不補」意思 
	str += s;
	if( decimal ) str += ss;
	str += f2;
	return str;
}

// --------------------------------
// -- CIRCLE PROGRESS v
// --------------------------------
const fnCircle = function(duration){
	duration = duration * 1000;
	$('#timeCircle, .time-text').show();
	$('#timeCircle').circleProgress({
		startAngle: 4.7,
		value: 1,
		fill: {color: '#4a4a4a'},
		emptyFill: '#1ca7ec',
		animation: {
			duration,
			easing: 'linear'
		},
		animationStartValue: 0.0,
		size: 69,
		thickness: '2'
	});
};

// --------------------------------
// -- FN FOR ACTIVE CIRCLE & FORMATER v
// --------------------------------
const fnCircleFormater = function(target){
	let time = Math.round( (gData[gIdx].endtime - gData[gIdx].starttime) * 10 ) / 10;
	gData[gIdx].time = time;
	
	fnCircle(time);
	recStart();

	$player.seekTo( gData[gIdx].starttime );
	$player.playVideo();
	$player.mute();

	setTimeout(()=>{
		recStop();
		console.log('is pasue 4');
		$player.pauseVideo();
		$('.trackbox').remove();
	}, time * 1000);

	// --------------------------------
	$('.time-text span').text(time);
	let sid;
	sid = setInterval(()=>{
		if( time > 0 ){
			time -= .1;
			time = Math.round(time * 10) / 10;
		}else{
			clearInterval(sid);
		}
		$('#timeNum').text( fnTimeFormater(time, true, '分', '秒') );
	},100);
	// --------------------------------
	setTimeout(()=>{
		$('.dbox-item.is-left').removeClass('muted');
		//
		$('.footer-item.is-right, .footer-item.is-bk').removeClass('muted');
		//
		target.removeClass('active').hide();
		target.siblings('.dbox-item').removeClass('muted');
		$('.is-middle-recorded').fadeIn(300);
		$('.dbox-item.is-right').fadeIn(300);
	}, time * 1000);
};

const fnRemoveMuted = function(){
	if( $('.dbox-item.is-right').is(':visible') ){
		$('.footer-item.is-right, .footer-item.is-right-done').removeClass('muted');
	}
}

const fnReRecordInit = function(other){
	dubRun ++;
	
	// ui init v
	$('#footer').removeAttr('class');
	$('.footer-item, .dbox-item.is-middle, .dbox-item.is-right, .time-text, #timeCircle').removeAttr('style');
	$('.dbox-item.is-middle-recorded').css('display', 'none');
	$('.footer-item.is-right').addClass('muted');
	//
	$('#step2').hide();
	$('#step1').show();

	// audio init v
	$('#audioBox audio').remove();

	// var init v
	gIdx = 0
	recId = 0;
	recBlob = [];
	vDone = false;
	sStart = 0;

	// 使角色可選(點了有戶動) init v
	$('#select').attr('data-selected', 0);

	// --------------------------------
	setTimeout(()=>{
		$('.footer-item.is-right-play').find('.footer-text').text('播放配音');
		$('.footer-item.is-right-play').removeClass('active');
		const thisCheck = dubRun;
		$('.select-item.is-'+other).click();
		$player.seekTo( gData[0].starttime );
		$player.playVideo();
		$player.unMute();
		setTimeout(function(){
			console.log('is pause 5');
			if(dubRun === thisCheck ) $player.pauseVideo();
		}, timeDuration * 1000);
	},100);
};

// ==========================================
// == 更新時間軸讀取條寬度 v
// ==========================================
const fnTimeUpdate = function(){
	const start = gData[0].starttime
	const per = Math.round( 100 / (timeBarEnd - start) *10 )/10;
	//
	current = $player.getCurrentTime() - start;
	// console.log(current);
	$('#playbox-ing').text( fnTimeFormater(current, false, ':', '') );
	const p = ( current ) * per + '%';
	$('#playbox-box-progress').css('width', p);
};

$(function(){
	window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

	$('#bar-close, .footer-item.is-bk').click(function(){
		let rwd = '';
		if( !isMobi ) rwd = '&rwd';
		const url = '../FunProgram/?ProgramNo='+ programNo + rwd;

		if( !updatedYet ){
			const back = confirm('確定返回嗎?\n您的錄音檔尚未上傳，若按確定將失去本次的所有錄音');
			if( back ){
				location.href = url;
			};
		}else{location.href = url};
	});

	// ==========================================
	// == STEP 1 v
	// ==========================================
	// 手動播放 , 用以準確聲波 & 影片的同步 v
	$('#loadStartMasker').show();
	setTimeout(function(){
		if( !$('#loadStart').is(':visible') ){
			$('#loadErr').css('display', 'flex');
		}
	}, 3000);
	
	// RWD css v
	let awdCss = document.createElement('link');
	let cssUTime = new Date().getTime();
	let cssHref;
	if( isMobi ){
		cssHref='./css/dub_mb.css';
	}else{
		$('body').attr('id', 'PC');
		cssHref='./css/dub_pc.css';
	};
	awdCss.setAttribute('rel', 'stylesheet');
	awdCss.setAttribute('type', 'text/css');
	awdCss.setAttribute('href', cssHref + '?' + cssUTime );
	document.getElementsByTagName('head')[0].appendChild(awdCss);

	$('body').on('click', '#loadErrBtn', function(){
		location.href = location.href;
	})

	$('#loadStart').click(function(){
		// ui remove ani v
		$('#loadStart, #loadStartMasker').fadeOut(100);
		setTimeout(()=>{
			$('#loadStart, #loadStartMasker').remove();
			$player.seekTo(gData[0].starttime);
			$player.playVideo();
			setInterval( fnTimeUpdate, 200 );
		}, 100);

		// 製造延遲，使手機版聲波演示 & YT同步 v
		let pre;
		let i = 0;
		const fn = function(){
			const current = $player.getCurrentTime();
			console.log('%c pre '+pre, 'color:yellow');
			console.log('%c cur '+current, 'color:yellow');
			console.log('%c t/f '+(pre === current), 'color:yellow');
			if( i < 5){//未定數，調整到正確時機 // pc dt mobi = 3 // mb = ?
				pre = current;
				i ++;
			}else{
				if( pre === current ){
					console.log('the same');
					pre = current;
				}else{
					console.log('start play');
					clearInterval(sid);
					fnFirstDemo();
				}
			};
			console.log('%c----------------', 'color:yellow');
		};
		const sid = setInterval(fn, 50);
	});

	// 選角色 v
	$('.select-item').click(function(){
		if( $('#select').attr('data-selected') < 2 ){
			$('#select').attr('data-selected', 1);
			$('.trackbox').remove();
			//
			$('.select-item').removeClass('active');
			$(this).addClass('active');
			//
			if( $('#next').attr('data-status') == 0 ) fnNextStep();
			$('#next').removeAttr('style');
			//
			gActor = $(this).attr('data-role');
		}
	});
	
	// 略過教學 & start v
	$('#next').click(function(){
		dubRun ++;// for 同場重錄的 pauseVideo();
		const status = $(this).attr('data-status')
		if( status == 0 ){
			fnNextStep();
		}else{
			if( !$('.select-item.is-a').hasClass('active') && !$('.select-item.is-b').hasClass('active') ){
				alert('請先選擇任一角色來扮演');
			}else{
				console.log('%cdub for ' + gActor, 'color: yellow; font-size: 20px');
				$('.trackbox').remove();
				$('.select-item').removeClass('active'); // < for 點了「錄另一角」回來者
				$('#step1').hide();
				$('#step2').show();
				$('#select').attr('data-selected', '2');
				$('#bar span').text('配音挑戰');
				vStart = gData[gIdx].starttime;
				$('.footer-item.is-left .footer-text').text('重錄角色' + gActor.toUpperCase());
				
				// 定下第一順位篇號
				const order = [];
				for(i=0;i<=gIdxMax;i++){
					gData[i].role == gActor ? order.push(1) : order.push(0);
				}
				gIdx = order.findIndex((item)=> item == 1);
				fnDubDemo();
				
				// sentence  init v
				$('.subtitle-act').text(gData[0].role);
				$('.subtitle-en_content').text(gData[0].en_content);
				$('.subtitle-ch-text').text(gData[0].ch_content);

				// 錄音 init v
				recOpen();

				// 時間軸 init v
				const timeBarMax = gData.length -1;
				timeBarEnd = gData[timeBarMax].endtime;
				timeDuration = timeBarEnd - gData[0].starttime;
				$('#playbox-end').text( fnTimeFormater(timeBarEnd, false, ':', '') );
				$('#playbox-end').text( fnTimeFormater(timeDuration, false, ':', '') );
			}
		}
	});

	// ==========================================
	// == STEP 2 v
	// ==========================================
	// --------------------------------
	// -- 中文顯示 / 隱藏 v
	// --------------------------------
	$('.subtitle-ch').click(function(){
		$('.subtitle-ch-text').slideToggle(200);
		$(this).find('.icon-arrow').toggleClass('active');
	});

	// --------------------------------
	// -- BTN ACTIVE v
	// --------------------------------
	// ALL v
	$('.dbox-item.is-left, .dbox-item.is-middle, .dbox-item.is-middle-recorded').click(function(){
		const $t = $(this);
		const $f = $('.footer-item');
		if( !$t.hasClass('active') ){
			$t.addClass('active');
			$t.siblings('.dbox-item').addClass('muted');
			$f.addClass('muted');
		}else{
			if( !$t.hasClass('is-middle') ){
				$t.removeClass('active');
				$t.siblings('.dbox-item').removeClass('muted');
			};
		};
	});

	// LEFT   v
	$('.dbox-item.is-left').click(function () {
		const $t = $(this);
		if ($t.hasClass('active')) {
			// stop to active v
			fnTrackSingle();
			$player.seekTo(gData[gIdx].starttime);
			$player.playVideo();
			$player.unMute();
			//
			const fn = function(){
				const a = Math.round((current + 0.1) * 10) / 10;
				const b = Math.floor(gData[gIdx].endtime - gData[0].starttime);
				if ( a >= b ){
					$t.removeClass('active');
					$t.siblings('.dbox-item').removeClass('muted');
					fnRemoveMuted();
					console.log('is pause 6 播原音自然');
					$player.pauseVideo();
					clearInterval(sid);
					$('.trackbox').remove();
				}
			};
			let sid = setInterval(fn, 200);
		} else {
			// active to stop v
			console.log('is pause 7 播原音手動');
			$player.pauseVideo();
			fnRemoveMuted();
			$('.trackbox').remove();
		};
	});

	// MIDDLE 錄音 v
	$('.dbox-item.is-middle').click(function(){
		updatedYet = false;
		fnTrackSingle();
		fnCircleFormater($(this));
		//
		if( vDone ){
			const $target = $('.footer-item.is-right-done');
			$('.footer-item.is-right').hide();
			$target.css('display', 'flex');
			setTimeout(function(){
				$target.removeClass('muted');
			}, ( gData[gIdxMax].endtime - gData[gIdxMax].starttime ) * 1000);
		}
	});

	// MIDDLE-錄音後 播錄音 v
	$('.dbox-item.is-middle-recorded').click(function(){
		$player.seekTo(gData[gIdx].starttime);
		$player.playVideo();
		$player.mute();

		const $t = $(this);
		const idName = 'myAudio_'+recId;
		const $audio = document.getElementById(idName);
		if( $t.hasClass('active') ){
			// stop to active v
			$audio.play();
			fnTrackSingle();
			
			const fn = function(){
				const a = Math.round((current + 0.1) * 10) / 10;
				const b = Math.floor(gData[gIdx].endtime - gData[0].starttime);
				if ( a >= b ){
					$t.removeClass('active');
					$t.siblings('.dbox-item').removeClass('muted');
					fnRemoveMuted();
					$('.trackbox').remove();
					//
					console.log('is pause 8 播錄音自然');
					$player.pauseVideo();
					$audio.pause();
					$audio.currentTime = 0;
					clearInterval(sid);
				}
			};
			let sid = setInterval(fn, 200);
		}else{
			// active to stop v
			fnRemoveMuted();
			$('.trackbox').remove();
			console.log('is pause 9 播錄音手動');
			$player.pauseVideo();
			$audio.pause();
			$audio.currentTime = 0;
		}
	});

	// RIGHT 重錄音 v
	$('.dbox-item.is-right').click(function(){
		const $t = $(this);
		const $s = $('.dbox-item.is-middle');
		$('.dbox-item.is-left').addClass('muted');
		// --------------------------------
		$t.hide();
		$('.dbox-item.is-middle-recorded').hide();
		$s.show().addClass('active');
		$('.footer-item.is-right').addClass('muted');
		// --------------------------------
		recBlob.splice(recId, 1);
		$('#myAudio_'+recId).remove();
		fnTrackSingle();
		fnCircleFormater($s);
	});

	// --------------------------------
	// --------------------------------
	// FOOTER-RIGHT 下一句 v
	$('.footer-item.is-right').click(function(){
		gIdx++
		sStart = gIdx;
		vStart = gData[gIdx].starttime;
		//
		recId ++;
		
		if( gIdx <= gIdxMax ){
			$('.dbox-item.is-middle-recorded, .dbox-item.is-right').hide();
			$('.time-text, #timeCircle').hide();
			$('.dbox-item.is-middle').show();
			$('.footer-item.is-right').addClass('muted');
			fnDubDemo();
		};
	});

	$('#upf').click(()=>{
		uploadFile();
	});
	// FOOTER-RIGHT-DONE 錄音完成 v
	$('.footer-item.is-right-done').click(function(){
		uploadFile();
		updatedYet = true;

		// UI v
		$('#dbox').hide();
		$('#footer').addClass('is-final');
		$('.footer-item').css('display', 'flex').removeClass('muted');
		$('.footer-item.is-right, .footer-item.is-right-done').hide();
	});

	// FOOER-RIGHT-PLAY-ALL v
	$('.footer-item.is-right-play').click(function(){
		if( !$(this).hasClass('active') ){
			$(this).find('.footer-text').text('停止播放');
			fnDubPlay();
			fnSentenceText(0, gData.length-1);
		}else{
			$(this).find('.footer-text').text('播放配音');
			$('.trackbox').remove();

			dubRun ++;
			sentenceRun ++;
			$player.seekTo(gData[0].starttime);
			console.log('is pause 10 版尾演示');
			$player.pauseVideo();
			const max = $('#audioBox audio').length;
			for(let i = 0; i < max; i++){
				document.getElementById('myAudio_'+i).muted = true;
			}
		}
		$(this).toggleClass('active');
	});

	// FOOTER-LEFT 重錄同一角色 v
	$('.footer-item.is-left').click(function(){
		let other = '';
		gActor === 'a' ? other = 'a' : other = 'b'; 
		fnReRecordInit(other);
	});

	// FOOTER-MIDDLE 錄另一角色 v
	$('.footer-item.is-middle').click(function(){
		let other = '';
		gActor === 'a' ? other = 'b' : other = 'a'; 
		fnReRecordInit(other);
	});
});