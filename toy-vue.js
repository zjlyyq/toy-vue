export class ToyVue {
    constructor(config) {
        this.template = document.querySelector(config.el);
        console.log(this.template)
        console.log(config.data)
        this.data = reactive(config.data);
        console.log(effects)
        this.traversal(this.template);
    }

    traversal(node) {
        console.log(node);
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.trim().match(/^{{([\s\S]+)}}$/)) {
                let name = RegExp.$1;
                console.log(name, node.textContent);
                effect(() => node.textContent = this.data[name])
            }
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            let attrs = node.attributes;
            for(let attr of attrs) {
                if (attr.name === 'v-model') {
                    let prop = attr.value;
                    effect(() => {node.value = this.data[prop]})
                    node.addEventListener('input',event => this.data[prop] = node.value)
                }
            }
        }
        if (node.childNodes && node.childNodes.length) {
            for (let child of node.childNodes) {
                this.traversal(child);
            }
        }
    }
}

let effects = new Map();
let currentEffect = null;

function effect(fn) {
    currentEffect = fn;
    fn();
    currentEffect = null;
}

function reactive(object) {
    let observed = new Proxy(object, {
        get: function(obj, prop) {
            if (currentEffect) {
                if (!effects.has(obj)) {
                    effects.set(obj, new Map());
                }
                if (!effects.get(obj).has(prop)) {
                    effects.get(obj).set(prop, new Array())
                }
                effects.get(obj).get(prop).push(currentEffect);
            }
            return obj[prop];
        },

        set: function(obj, prop, value) {
            obj[prop] = value;
            effects.get(obj).get(prop);
            if (effects.has(object) && effects.get(object).has(prop)) {
                for (let effect of effects.get(object).get(prop)) {
                    effect();
                }
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
