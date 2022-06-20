//node MongoToBigQueryFormatter.js

const fs = require("fs");
const { resolve } = require("path");
const jsonTojsonl = require("json-to-jsonl");
const lineReader = require("line-reader");
const Promise = require("bluebird");
var fileSize = 90 //in MB

fs.open("./generatedFiles/generatedJSON_part0.json", "w", (err, file) => {
  if (err) {
    throw err;
  }
  // console.log("File is created.");
});
fs.writeFileSync("./generatedFiles/generatedJSON_part0.json", "[", {
  flag: "a+",
});
var eachLine = Promise.promisify(lineReader.eachLine);
var fileNumber = 0;
(async () => {
  await eachLine(
    resolve("./out-mongo.json"),
    { bufferSize: 100000 },
    function (line, last) {
      let jsonLine = line;
      // console.log(line);
      jsonLine = JSON.parse(jsonLine)
      jsonLine.output.stepsFormatted = [];

      for (let step in jsonLine.output.steps) {
        // console.log("step", step)
        // console.log("stepObject", data[i].output.steps[step]);
        jsonLine.output.stepsFormatted.push(jsonLine.output.steps[step]);
      }
      delete jsonLine.output.steps;
      jsonLine = filter(jsonLine);


      jsonLine = JSON.stringify(jsonLine);
      fs.writeFileSync(
        "./generatedFiles/generatedJSON_part" + fileNumber + ".json",
        jsonLine + "\n",
        {
          flag: "a+",
        }
      );
      if (last) {
        fs.writeFileSync(
          "./generatedFiles/generatedJSON_part" + fileNumber + ".json",
          "]",
          {
            flag: "a+",
          }
        );
        // cb();
        return false; // stop reading
      } else {
        if (
          (stats =
            fs.statSync(
              "./generatedFiles/generatedJSON_part" + fileNumber + ".json"
            ).size /
              (1024 * 1024) >
              fileSize)
        ) {
          fileNumber += 1;
          fs.open(
            "./generatedFiles/generatedJSON_part" + fileNumber + ".json",
            "w",
            (err, file) => {
              if (err) {
                throw err;
              }
              // console.log("File is created.");
            }
          );
          fs.writeFileSync(
            "./generatedFiles/generatedJSON_part" + (fileNumber - 1) + ".json",
            "]",
            {
              flag: "a+",
            }
          );
          fs.writeFileSync(
            "./generatedFiles/generatedJSON_part" + fileNumber + ".json",
            "[",
            {
              flag: "a+",
            }
          );
        } else {
          fs.writeFileSync(
            "./generatedFiles/generatedJSON_part" + fileNumber + ".json",
            ",",
            {
              flag: "a+",
            }
          );
        }
      }
    }
  );
  for (let i = 0; i < fileNumber + 1; i++) {
    jsonTojsonl(resolve("./generatedFiles/generatedJSON_part" + i + ".json"));
  }
  console.log("success");
})();

function filter(obj) {
  Object.keys(obj).forEach(function (key, value) {
    if (key == "$date") {
      obj.date = obj[key];
      delete obj.$date;
      // console.log(key)
    }
    // if (key == "3-2-2") {
    //   console.log(key, obj[key], Object.keys(obj[key]) , (Object.prototype.toString.call(obj[key]) === "[object Object]")," generic");
    // }
    // if (key == "code" && obj[key] == '3-2-2') {
    //   console.log("DETECTED");
    // }
    // console.log(key, obj[key]);
    if (key == "code" && Number.isInteger(obj[key])) {
      obj.code = obj[key].toString();
      // console.log(key)
    }
    if (!isNaN(parseInt(key[0]))) {
      // obj._0 = obj[key];
      obj["_" + key] = obj[key];
      delete obj[key];
      // console.log(key)
    }

    if (obj[key] === "" || obj[key] === null) {
      delete obj[key];
    } else if (Object.prototype.toString.call(obj[key]) === "[object Object]") {
      if (key == "screenshots" && !Object.keys(obj[key]).some(isNaN)) {
        // delete obj.screenshots;
        obj[key] = Object.values(obj[key]);
      } else if (key == "actionshots" && !Object.keys(obj[key]).some(isNaN)) {
        // && !Object.keys(obj[key]).some(isNaN)
        // console.log("RECURSIVE : ")
        // console.log(obj[key])
        obj[key] = Object.values(obj[key]);

        // console.log(key)
      } else {
        filter(obj[key]);
      }
    } else if (Array.isArray(obj[key])) {
      // console.log(key, obj[key], typeof obj[key])
      // if (key == "actionshots") {
      //   console.log(key, obj[key], " array")
      // }
      if (obj[key].length == 0) {
        delete obj[key];
      } else {
        obj[key].forEach((v) => filter(v));
      }
    }
    // console.log("titi = ", key, value)
  });
  return obj;
}
