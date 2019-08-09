
export var version = 2;

export default class {
    constructor() {
        var existsData = false;
        for (var i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key === "MATH_TRI_VER") {
                const value = localStorage.getItem(key);
                if (value == String(version)) {
                    existsData = true;
                }
            }
        }
        if (!existsData) {
            localStorage.setItem('triBottom', '1');
            localStorage.setItem('triRight', '1');
            localStorage.setItem('subLength', '0');
            localStorage.setItem('MATH_TRI_VER', String(version));
        }
    }
    reset(){
        localStorage.removeItem('triBottom');
        localStorage.removeItem('triRight');
        localStorage.removeItem('subLength');
        localStorage.removeItem('MATH_TRI_VER');
    }
    setTriBottom(val: number){
        localStorage.setItem('triBottom', String(val));
    }
    getTriBottom(){
        return parseFloat(localStorage.getItem('triBottom')||'0');
    }
    setTriRight(val: number){
        localStorage.setItem('triRight', String(val));
    }
    getTriRight(){
        return parseFloat(localStorage.getItem('triRight')||'0');
    }
    setSubLength(val: number){
        localStorage.setItem('subLength', String(val));
    }
    getSubLength(){
        return parseFloat(localStorage.getItem('subLength')||'0');
    }
};
