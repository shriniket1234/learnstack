const fs = require("fs");

let content = fs.readFileSync("models.json", "utf8");
if (content.charCodeAt(0) === 0xfeff) {
  content = content.slice(1);
}
const data = JSON.parse(content);

const freeModels = [];
for (const model of data.data) {
  const pricing = model.pricing;
  if (
    parseFloat(pricing.prompt) === 0 &&
    parseFloat(pricing.completion) === 0 &&
    parseFloat(pricing.request) === 0 &&
    parseFloat(pricing.image) === 0 &&
    parseFloat(pricing.web_search) === 0 &&
    parseFloat(pricing.internal_reasoning) === 0
  ) {
    freeModels.push({
      id: model.id,
      name: model.name,
    });
  }
}

console.log(JSON.stringify(freeModels, null, 2));
