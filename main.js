////////////////////////////////////////////
// Editer basic operation //
////////////////////////////////////////////

var table = $('#editer')[0];
var currentIndex = 0;

$('#add-row-up-btn')[0].addEventListener('click', function () {
    if (currentIndex == 0) {
        return;
    }
    insertTableRow(currentIndex);
});

$('#add-row-dn-btn')[0].addEventListener('click', function () {
    if (currentIndex == 0) {
        return;
    }
    insertTableRow(currentIndex + 1);
});

function insertTableRow(index) {
    var tr = table.insertRow(index);
    for (var i = 0; i < 3; ++i) {
        var td = document.createElement('td');
        var input = document.createElement('input');
        input.type = 'text';
        switch (i) {
            case 0: input.className = 'strtime'; break;
            case 1: input.className = 'endtime'; break;
            case 2: input.className = 'content'; break;
        }
        td.appendChild(input);
        tr.appendChild(td);
    }
}

$('#rmv-row-btn')[0].addEventListener('click', function () {
    if (currentIndex == 0 || table.rows.length <= 2) {
        return;
    }
    table.deleteRow(currentIndex);
    currentIndex = 0;
});

// Get row index when row's <input> focused 
$(document).on('focus', '#editer input', function () {
    var index = (this.parentElement).parentElement.rowIndex;
    currentIndex = index;
});

$(document).click(function (event) {
    var tagName = event.target.tagName;
    if ((tagName != 'BUTTON') && (tagName != 'INPUT')) {
        currentIndex = 0;
    }
});

$('#set-strtime-btn')[0].addEventListener('click', function () {
    if (currentIndex == 0) {
        return;
    }
    $('.strtime', table.rows[currentIndex])[0].value = formatSRTTimer(videoTime);
});

$('#set-endtime-btn')[0].addEventListener('click', function () {
    if (currentIndex == 0) {
        return;
    }
    $('.endtime', table.rows[currentIndex])[0].value = formatSRTTimer(videoTime);
});

////////////////////////////////////////////
// Video //
////////////////////////////////////////////

var youtubeIFrameApi = document.createElement('script');
youtubeIFrameApi.src = 'https://www.youtube.com/iframe_api';

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(youtubeIFrameApi, firstScriptTag);

// This function creates an <iframe> (and YouTube player) after the API code downloads.
var player;
var videoTime = 0;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        events: {
            'onReady': onPlayerReady,
        }
    });
}

function loadVideo() {
    var videoUrl = $('#video-url')[0].value;
    var videoId = getVideoId(videoUrl);
    if (videoId) {
        player.loadVideoById(videoId);
        $('#player').show();
        $('#video-info').show();
    }
}

function getVideoId(videoUrl) {
    var videoId = '';
    if (videoUrl && (videoUrl.search('youtube.com') > 0)) {
        var strIndex = videoUrl.search('v=') + 2;
        var divideIndex = videoUrl.substring(strIndex).search('&');
        if (divideIndex > 0) {
            var endIndex = strIndex + divideIndex;
            videoId = videoUrl.substring(strIndex, endIndex);
        } else {
            videoId = videoUrl.substring(strIndex);
        }
    }
    return videoId;
}

// This function will be called when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
    document.getElementById('video-title').innerHTML = player.getVideoData()['title'];
    function updateTime() {
        if (player && player.getCurrentTime) {
            videoTime = player.getCurrentTime();
            document.getElementById('time').innerHTML = formatSRTTimer(videoTime);
        }
    }
    timeupdater = setInterval(updateTime, 100);
}

// Format time float to string 'hh:mm:ss,sss'
function formatSRTTimer(time) {
    var hh = ~~(time / 3600);
    var mm = ~~((time % 3600) / 60);
    var ss = (time % 60).toFixed(3);
    var timeStr = padZero(hh.toString(), 2) + ':' + padZero(mm.toString(), 2) + ':' + padZero(ss.toString().replace('.', ','), 6);
    return timeStr;
}

function padZero(str, size) {
    var s = str;
    while (s.length < size) {
        s = '0' + s;
    }
    return s;
}


////////////////////////////////////////////
// Download //
////////////////////////////////////////////

$('#download-as-srt-btn')[0].addEventListener('click', function () {
    var context = composeAsSRTFileContext();
    if (isBlank(context)) {
        return;
    }
    download(context, generateFileName(), 'text/plain;charset=utf-8');
});

function composeAsSRTFileContext() {
    var context = '';
    var size = table.rows.length;
    for (var index = 1; index < size; ++index) {
        var strtime = $('.strtime', table.rows[index])[0].value;
        var endtime = $('.endtime', table.rows[index])[0].value;
        var content = $('.content', table.rows[index])[0].value;
        context += (index + '\n');
        context += (strtime + ' --> ' + endtime + '\n');
        context += (content + '\n');
        context += '\n';
    }
    return context;
}

function generateFileName() {
    var videoId = player.getVideoData()['video_id'];
    if (isBlank(videoId)) {
        videoId = 'unknownvideoid';
    }
    var timestamp = (new Date()).toISOString().replace(/[-:.]/g, '');
    return 'ytsub-' + videoId + '-' + timestamp + '.srt';
}

function isBlank(value) {
    if (value) {
        var str = (typeof value === 'string') ? value : value.toString();
        if (/^\s*$/.test(str)) {
            return true;
        }
        return false;
    }
    return true;
}

function download(data, fileName, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, fileName);
    } else {
        var a = document.createElement('a');
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = fileName;
        document.body.append(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

