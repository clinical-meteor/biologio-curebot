const reSentenceBreak = /\(?[^\.\?\!]+[\.!\?]\)?/g;
// const reWord = /(?:\W|^)(\Q$word\E)(?:\W|$)/i/g;
const reStopWords = /\b(of|the|on|a|an|before|after|this|that|about|under)\b/i;
const reAliases = /\(([\w\-]{3,20})\)/g;
const rePunct = /^(\W+)$/;

const letters = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '1234567890';
const charset = letters + letters.toUpperCase() + numbers;



class Util {
    static isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    static isString(val) {
        if (typeof val === 'string' || val instanceof String) return true;
        return false;
    }

    static strToId(raw) {
        return raw.replace(/[^\w\s]|_/g, "").replace(/\s+/g, "-");
    }

    /**
     * Set a value within a object tree
     * @param object
     * @param path
     * @param value
     */
    static setValuePath(object, path, value) {
        var a = path.split('.');
        var o = object;
        for (var i = 0; i < a.length - 1; i++) {
            var n = a[i];
            if (n in o) {
                o = o[n];
            } else {
                o[n] = {};
                o = o[n];
            }
        }
        o[a[a.length - 1]] = value;
    }

    static removeValuePath(object, path) {
        var a = path.split('.');
        var o = object;
        for (var i = 0; i < a.length - 1; i++) {
            var n = a[i];
            if (n in o) {
                o = o[n];
            } else {
                o[n] = {};
                o = o[n];
            }
        }
        delete o[a[a.length - 1]];
    }

    /**
     * Geta  value from within an object's tree
     * @param object
     * @param path
     * @returns {*}
     */
    static getValuePath(object, path) {
        var o = object; // o is undefined here, pls fix
        path = path.replace(/\[(\w+)\]/g, '.$1');
        path = path.replace(/^\./, '');
        var a = path.split('.');
        while (a.length) {
            var n = a.shift();
            if (n in o) {
                o = o[n];
            } else {
                return;
            }
        }
        return o;
    }

    static yyyymmdd(date) {
        if (!date) return;
        if (! date instanceof Date) {
            date = new Date(date);
        }
        if (! date instanceof Date) {
            return;
        }
        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
        var dd  = date.getDate().toString();
        return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
    }

    static yyyy_mm_dd(date) {
        if (!date) return;
        if (! date instanceof Date) {
            date = new Date(date);
        }
        if (! date instanceof Date) {
            return;
        }
        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
        var dd  = date.getDate().toString();
        return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding
    }

    static guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }



    static slugify(text) {
        if (!text) return "";
        return text.toString().toLowerCase()
          .replace(/\s+/g, '-')           // Replace spaces with -
          .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
          .replace(/\-\-+/g, '-')         // Replace multiple - with single -
          .replace(/^-+/, '')             // Trim - from start of text
          .replace(/-+$/, '');            // Trim - from end of text
      }
    
      /** create a safe name, usable as json property name */
      static safify(text) {
        if (!text) return "";
        let slug = this.slugify(text);
        return slug.replace(/\-/g, '_');
      }
    
      // public static parse(text:string) {
      //   if (!text) return null;
      //   var tree = new English().parse(text);
      //   return tree;
      // }
    
    
    
    
    
    
    
      static randomElement(array) {
        return array[Math.floor(Math.random()*array.length)];
      }
    
      static randomString(length) {
          var R = '';
          for(var i=0; i<length; i++)
              R += Util.randomElement(charset);
          return R;
      }

}

module.exports = Util;