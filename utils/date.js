/**
 * 格式化输出时间（参考新浪微博）
 * e.g.
 * * 刚刚
 * * 10秒前
 * * 20秒前
 * * ...
 * * 1分钟前
 * * 2分钟前
 * * ...
 * * 60分钟前
 * * ...
 * * 今天09:02
 * * ...
 * * 9月10日 07:50
 * @param time time can be a number, date, or string
 */
function simpletop_timestamps(time) {
    var iTrueTime = null,
        dNow = new Date(),
        iNow = dNow.getTime(),
        dTrueTime = null,
        ret = "";

    var ONE_SECOND = 1000,
        ONE_MINUTE = ONE_SECOND * 60,
        ONE_HOUR = ONE_MINUTE * 60,
        ONE_DAY = ONE_HOUR * 24;

    if (typeof time == 'string') {
        iTrueTime = parseInt(time);
    }

    if (typeof time == 'number') {
        iTrueTime = time;
    } else if (typeof time == 'object') {
        if (time.getTime) {// an object of Date
            iTrueTime = time.getTime();
        }
    }

    if (iTrueTime != NaN) {
        dTrueTime = new Date();
        dTrueTime.setTime(iTrueTime);
    }

    if (iTrueTime == NaN) {
        ret = "-";
    } else if (iTrueTime > iNow) {
        ret = "您穿越了";
    } else if (iTrueTime > iNow - ONE_SECOND * 10) {
        ret = "刚刚";
    } else if (iTrueTime > iNow - ONE_MINUTE) {
        // e.g. 10秒前
        ret = parseInt((iNow - iTrueTime) / ONE_SECOND / 10).toString() + "0秒之前";
    } else if (iTrueTime > iNow - ONE_HOUR) {
        // e.g. 3分钟前
        ret = parseInt((iNow - iTrueTime) / ONE_MINUTE) + "分钟之前";
    } else if (iTrueTime > iNow - ONE_DAY) {
        // e.g. 3小时前
        ret = parseInt((iNow - iTrueTime) / ONE_HOUR) + "小时之前";
    } else {
        ret = parseInt((iNow - iTrueTime) / ONE_DAY) + "天之前";
    }
    return ret;
}

function simpletop_time(sDate1, sDate2) {

    var aDate, oDate1, oDate2, iDays
    aDate = sDate1.split("-")
    oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]) 
    aDate = sDate2.split("-")
    oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])
    iDays = parseInt((oDate1 - oDate2) / 1000 / 60 / 60 / 24)    //把相差的毫秒数转换为天数  
    switch (iDays) {
        case 0:
            return '今天';
        case 1:
            return '昨天';
        case -1:
            return '明天';
    }
    return sDate2;
}

function formatTime(time) {
    if (typeof time !== 'number' || time < 0) {
        return time
    }

    var hour = parseInt(time / 3600)
    time = time % 3600
    var minute = parseInt(time / 60)
    time = time % 60
    var second = time

    return ([hour, minute, second]).map(function (n) {
        n = n.toString()
        return n[1] ? n : '0' + n
    }).join(':')
}



module.exports = {
    formatTime: formatTime,
    simpletop_time: simpletop_time,
    simpletop_timestamps: simpletop_timestamps
}