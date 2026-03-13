/**
 * Design System Analyzer v6
 * 
 * Instructions:
 * 1. Open your product website in Chrome.
 * 2. Open the Browser Console (F12).
 * 3. Paste this entire script and press Enter.
 * 4. Wait for it to copy the JSON results to your clipboard.
 */

(async function() {

console.log("Design System Analyzer v6");

const data={
colors:new Set(),
backgrounds:new Set(),
fonts:new Set(),
fontSizes:new Set(),
fontWeights:new Set(),
spacing:new Set(),
radius:new Set(),
shadows:new Set(),
containers:new Set(),
gridGaps:new Set(),
cssVars:{}
};

function clean(v){
if(!v) return null;
v=String(v).trim();
if(!v) return null;
if(v==="auto") return null;
if(v==="none") return null;
return v;
}

function add(set,v){
v=clean(v);
if(v) set.add(v);
}

function parseVars(text){

const m=text.matchAll(/(--[a-zA-Z0-9-_]+)\s*:\s*([^;}\n]+)/g);

for(const r of m){

const name=r[1].trim();
const val=r[2].split("!")[0].split("/*")[0].trim();

data.cssVars[name]=val;

}

}

function scanStylesheets(){

for(const sheet of document.styleSheets){

try{

for(const rule of sheet.cssRules){

if(rule.style){

for(let i=0;i<rule.style.length;i++){

const p=rule.style[i];

if(p.startsWith("--"))
data.cssVars[p]=rule.style.getPropertyValue(p);

}

}

}

}catch(e){}

}

}

function scanDOM(){

const els=document.querySelectorAll("*");

for(const el of els){

const s=getComputedStyle(el);

add(data.colors,s.color);

if(s.backgroundColor!=="rgba(0, 0, 0, 0)")
add(data.backgrounds,s.backgroundColor);

add(data.fonts,s.fontFamily);
add(data.fontSizes,s.fontSize);
add(data.fontWeights,s.fontWeight);

if(s.borderRadius && s.borderRadius!=="0px")
add(data.radius,s.borderRadius);

if(s.boxShadow && s.boxShadow!=="none")
add(data.shadows,s.boxShadow);

const spaces=[
s.marginTop,s.marginBottom,s.marginLeft,s.marginRight,
s.paddingTop,s.paddingBottom,s.paddingLeft,s.paddingRight
];

for(const sp of spaces){

if(sp && sp!=="0px")
add(data.spacing,sp);

}

if(s.maxWidth) add(data.containers,s.maxWidth);

if(s.gap && s.gap!=="0px")
add(data.gridGaps,s.gap);

}

}

function px(v){

const m=v.match(/([0-9.]+)px/);

if(!m) return null;

return Math.round(parseFloat(m[1]));

}

function spacingScale(values){

const pxVals=[];

for(const v of values){

const n=px(v);

if(!n) continue;

if(n<=64 && n%2===0)
pxVals.push(n);

}

return [...new Set(pxVals)].sort((a,b)=>a-b);

}

function typeScale(values){

const pxVals=[];

for(const v of values){

const n=px(v);

if(!n) continue;

if(n<=100)
pxVals.push(n);

}

return [...new Set(pxVals)].sort((a,b)=>a-b);

}

function detectFramework(){

const html=document.documentElement.outerHTML;

const frameworks=[];

if(html.includes("MuiButton")||html.includes("mui"))
frameworks.push("Material UI");

if(html.includes("chakra"))
frameworks.push("Chakra UI");

if(html.includes("data-radix"))
frameworks.push("Radix UI");

if(html.includes("tailwind")||html.includes("--tw-"))
frameworks.push("Tailwind");

if(html.includes("styled-components"))
frameworks.push("styled-components");

return frameworks;

}

scanStylesheets();
scanDOM();

const result={

frameworks:detectFramework(),

designSystem:{

colors:[...data.colors],

backgrounds:[...data.backgrounds],

typography:{
families:[...data.fonts],
sizes:typeScale(data.fontSizes),
weights:[...data.fontWeights]
},

spacingScale:spacingScale(data.spacing),

radius:[...data.radius],

shadows:[...data.shadows],

grid:{
gaps:[...data.gridGaps]
},

containers:[...data.containers],

cssVariables:data.cssVars

}

};

const json=JSON.stringify(result,null,2);

async function copy(text){

try{

await navigator.clipboard.writeText(text);
console.log("Copied using clipboard API");
return;

}catch(e){}

const ta=document.createElement("textarea");
ta.value=text;

document.body.appendChild(ta);
ta.select();
document.execCommand("copy");
document.body.removeChild(ta);

console.log("Copied using fallback");

}

await copy(json);

console.log(result);

return result;

})();
