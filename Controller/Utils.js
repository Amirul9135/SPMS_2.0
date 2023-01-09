module.exports = class Utils {
    static getDateNow() {
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        return year + "-" + month + "-" + date;
    }

    static getDateTimeNow() {
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hour = date_ob.getHours()
        let minute = date_ob.getMinutes();
        let sec = date_ob.getSeconds()
        return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + sec;
    }
    static getDateTimeAfterMinute(min) {
        let date_ob = new Date();
        date_ob.setMinutes(date_ob.getMinutes() + min)
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hour = date_ob.getHours()
        let minute = date_ob.getMinutes();
        let sec = date_ob.getSeconds()
        return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + sec;
    }


    static dateToSQldate(strDate) { //dd/mm/yyyy to sql yyyy-mm-dd
        var part = strDate.split("/");
        console.log(part)
        if (part.length < 3) {
            console.log("invalid date format")
            return strDate;
        }
        else {
            return part[2] + "-" + part[1] + "-" + part[0];
            //console.log(part[2] + "-" + part[1] + "-" + part[0])
        }
    }

    static localeToSqlDateTime(strDate) {//'03/01/2023, 12:13:45 am' locale string 
        var part = strDate.split(', ')
        var dpart = part[0].split('/')
        var isPm = (strDate.includes('pm') || strDate.includes('PM'))
        var tpart = part[1].replace('am', '').replace('pm', '').replace('AM', '').replace('PM', '').trim().split(':')
        var hour = parseInt(tpart[0])
        if (isPm) {
            if (hour != 12) {
                hour = hour + 12;
            }
        }
        if (!isPm) {
            if (hour == 12) {
                hour = 0;
            }
        }
        return dpart[2] + "-" + dpart[1] + "-" + dpart[0] + " " + hour + ":" + tpart[1] + ":" + tpart[2];
    }

    static nthKeyValOf(obj, n) {
        return obj[Object.keys(obj)[n]]
    }

}