<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!-- #include virtual="include/dbconnection.asp"-->  
<%   
	response.Buffer = true   
	session.CodePage = 65001   
	response.Charset = "utf-8"

	sql="select count(indx) as c from member where customer_id=411"
	set rs=connection2.execute(sql)
	if not rs.eof then
		num=rs("c")
	end if
  
  if session("indx")="" then
    response.Redirect "../../../"
  end if
%>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <link href="./images/favicon.ico" rel="icon" type="image/ico"/>
    <title>電影配音挑戰</title>
    <link rel="stylesheet" href="./css/dub.css?<%=Timer()%>"/>
    <script src="./assets/plugins/jquery/jquery-1.12.4-min.js"></script>
    <script src="./assets/plugins/youtube/youtube_iframe_api.js"></script>
    <script src="./assets/plugins/jquery-circle-progress/jquery-circle-progress.js"></script>
    <script>
      let recId = 0;
      let recBlob = [];
      let videoId;
			const dataMemberId = <%=session("indx")%>;
			const dataCustomerId = <%=session("ip_indx")%>;      
    </script>
    <script src="./js/dub.js?<%=Timer()%>"></script>
    <script src="./assets/plugins/recorder/recorder.mp3.min.js"></script>
    <script src="./assets/plugins/recorder/extensions/frequency.histogram.view.js"></script>
    <script src="./assets/plugins/recorder/extensions/lib.fft.js"></script>
    <script src="./js/dub_record.js"></script>
  </head>
  <body>
    <div id="bar"><span>配音教學示範</span>
      <div id="bar-close">╳</div>
    </div>
    <div id="video">
      <div id="player"></div>
    </div>
    <div id="select" data-selected='0'>
      <div class="select-item is-a" data-role="a">
        <div class="icon-sel-a"></div>
      </div>
      <div class="select-item is-b" data-role="b"> 
        <div class="icon-sel-b"></div>
      </div>
    </div>
    <div id="step1">
      <div id="tips">觀看A、B角色錄音教學，等一下就換你摟！ </div>
      <div id="next" data-status="0" style="background-color: rgba(28,167,236,.2)">略過教學示範</div>
    </div>
    <div id="step2">
      <div id="playbox">
        <div id="playbox-box">
          <div id="playbox-box-progress"></div>
        </div>
        <div id="playbox-ing"></div>
        <div id="playbox-end"></div>
      </div>
      <div id="subtitle">
        <div class="subtitle-act"></div>
        <div class="subtitle-en">and an illusionary figure in his whole life. I need to look through</div>
        <div class="subtitle-ch">
          <div class="subtitle-ch-text">中文字幕中文字幕中文字幕中文字幕中文字幕中文字幕中文字幕中文字幕中文字幕中文字幕中文字幕中文字幕中文字幕</div>
          <div class="subtitle-ch-switch">中文翻譯
            <div class="icon-arrow"></div>
          </div>
        </div>
      </div>
      <div id="dbox">
        <div class="footer-item is-bk for-pc" title="結束配音">
          <div class="icon-footer-bk"></div>
        </div>
        <div class="dbox-item is-left" title="撥放/停止本句原音示範">
          <div class="icon-left"></div>
        </div>
        <div class="dbox-item is-middle" title="開始配音">
          <div class="icon-middle"></div>
          <div class="time-text">
             錄音倒數：<span id="timeNum"></span></div>
          <div id="timeCircle"></div>
        </div>
        <div class="dbox-item is-middle-recorded" title="撥放/停止您的配音" style="display: none">
          <div class="icon-middle"></div>
        </div>
        <div class="dbox-item is-right" title="重錄本句配音">
          <div class="icon-right"></div>
        </div>
        <div class="footer-item is-right muted for-pc" title="下一句">
          <div class="icon-footer-right"></div>
        </div>
        <div class="footer-item is-right-done muted for-pc" title="完成配音">
          <div class="icon-footer-right"></div>
        </div>
      </div>
      <div id="footer">
        <div class="footer-item is-bk">
          <div class="icon-footer-bk"></div><span class="footer-text">結束配音</span>
        </div>
        <div class="footer-item is-left">
          <div class="icon-footer-left"></div><span class="footer-text"></span>
        </div>
        <div class="footer-item is-middle">
          <div class="icon-footer-middle"></div><span class="footer-text">切換角色</span>
        </div>
        <div class="footer-item is-right muted">
          <div class="icon-footer-right"></div><span class="footer-text">下一句</span>
        </div>
        <div class="footer-item is-right-done muted">
          <div class="icon-footer-right"></div><span class="footer-text">完成</span>
        </div>
        <div class="footer-item is-right-play">
          <div class="icon-footer-right"></div><span class="footer-text">播放配音</span>
        </div>
      </div>
    </div>
    <div id="loadStartMasker"></div>
    <div id="loadErr"><span id="loadErrTxt">因網路不穩導致影片讀取失敗<br/>請點以下按鈕重整畫面</span>
      <button id="loadErrBtn">重整畫面</button>
    </div>
    <div id="loadStart">開始示範</div>
    <div id="audioBox"></div>
  </body>
</html>