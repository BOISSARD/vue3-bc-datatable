import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')



// import * as utils from "./utils/object.ts"

// let base = { a: 2, b: 'yolo', c: { c1: "lol" }, d: {}, e: new Date(), f: [null, 1, "trois"] }
// base.d = { base }
// let copy = utils.cloneDeep(base)
// console.log(base, copy)
// base.a = 3
// base.c.c1 = "lolilol"
// console.log(base, copy)

// let obj1 = { a: 1, b: 'Hello', c: { d: 3, e: 4 } }
// let obj2 = { b: 'World', c: { d: 5 }, f: [1, 2, 3] }
// let obj3 = { g: 'Another property', c: { h: 6 }, f: [4, 5, 6] }
// let mergedObj = utils.merge({}, obj1, obj2, obj3);
// console.log(mergedObj);