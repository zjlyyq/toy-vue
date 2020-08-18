export class ToyVue {
    constructor(config) {
        this.template = document.querySelector(config.el);
        this.data = config.data;
        
    }
}

let effects = [];

function effect(fn) {
    effects.push(fn);
    fn();
}

function reactive(object) {
    let observed = new Proxy(object, {
        get: function(obj, prop) {
            console.log(obj)
            return obj[prop];
        },
        set: function(obj, prop, value) {
            obj[prop] = value;
            for(let effect of effects) {
                effect();
            }
            return value;
        }
    })
    return observed;
}
let dumy;
const counter = reactive({num: 0});
effect(() => dumy = counter.num);
console.log(dumy);
counter.num = 7;
console.log(dumy);
