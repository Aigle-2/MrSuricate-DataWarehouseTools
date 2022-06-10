//node MongoToBigQueryFormatter.js

const fs = require("fs");
const { resolve } = require("path");
const jsonTojsonl = require("json-to-jsonl");

let data = fs.readFileSync("./out-mongo-small.json", {
  encoding: "utf8",
  flag: "r",
});

data = "[" + data + "]";
let accolade_count = 0
let index_array = []
for (let h = 0; h < data.length; h++) {
  // if (h%1000 == 0) {

  // }
  if (data[h] == "{") {
    accolade_count += 1
  }
  if (data[h] == "}") {
    accolade_count -= 1
    if (accolade_count == 0) {
      index_array.push(h)
    }
  }
}
let offset = 0
for (let h = 0; h < index_array.length - 1; h++) {
  data = data.slice(0, index_array[h] + 1 + offset) + "," + data.slice(index_array[h] + 1 + offset);
  offset += 1
  // console.log("replace at line ", index_array[h])
}
// console.log("#############################################################")
// let str = ""
// for (let k = 545550; k < 545570; k++) {
//   str = str + data[k]
// }
// console.log(str)
// console.log("#############################################################")
data = JSON.parse(data);

for (let i = 0; i < data.length; i++) {
  data[i].output.stepsFormatted = [];
  //For each entry
  // console.log("test");
  // for (let j = 0; j < data[i].output.steps.length; i++) {
  //   //For each step
  //   console.log("data:", data[i].output.steps);
  // }
  for (var step in data[i].output.steps) {
    // console.log("step", step)
    // console.log("stepObject", data[i].output.steps[step]);
    data[i].output.stepsFormatted.push(data[i].output.steps[step]);
  }
  delete data[i].output.steps;
}

data.forEach(obj => {
  obj = filter(obj)
})
data = JSON.stringify(data);
// let loop1 = true
// let count = 0
// while (loop1) {
//   if (data[count] == "[") {
//     data = data.slice(0, count) + data.slice(count)
//     loop1 = false
//   }
//   count += 1
// }
// loop1 = true
// count = 0
// while (loop1) {
//   if (data[data.length - count] == "]") {
//     data = data.slice(0, count) + data.slice(count)
//     loop1 = false
//   }
//   count += 1
// }
let jsonStringExport = data;
fs.writeFileSync("./generatedJSON.json", jsonStringExport);
const response1 = jsonTojsonl(resolve("./generatedJSON.json"));
console.log("success");


function filter(obj) {
  Object.keys(obj).forEach(
    function (key, value) {
      // console.log(key, obj[key])
      if (obj[key] === "" || obj[key] === null) {
        delete obj[key];
      } else if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        // console.log(key, obj[key])
        filter(obj[key]);
      } else if (Array.isArray(obj[key])) {
        // console.log(key, obj[key], typeof obj[key])
        if (obj[key].length == 0 ) {
          delete obj[key];
        } else {
          obj[key].forEach(v => filter(v));
        }
      }
      // console.log("titi = ", key, value)
    }
  )
  return obj
}