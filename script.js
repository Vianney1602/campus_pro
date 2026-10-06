// ---------- data ----------
var events=[
 {id:1,name:"Hack Quest 24H",venue:"Main Auditorium",date:"2026-10-18",max:6,count:5},
 {id:2,name:"Debug the Duck",venue:"Lab 3, CSE Block",date:"2026-10-22",max:8,count:2},
 {id:3,name:"UI Battle Royale",venue:"Seminar Hall B",date:"2026-10-27",max:4,count:4},
 {id:4,name:"Quiz Wizards",venue:"Library Hall",date:"2026-11-02",max:10,count:3}
];
var baseCounts=events.map(function(e){return e.count});
var selectedEvent=null, student={}, totalRegistrations=0, filterMode="all", regs=[];
var $=function(id){return document.getElementById(id)};

// ---------- storage ----------
function loadRegs(){try{regs=JSON.parse(localStorage.getItem("regs")||"[]")}catch(e){regs=[]}}
function saveRegs(){try{localStorage.setItem("regs",JSON.stringify(regs))}catch(e){}}
function syncCounts(){events.forEach(function(ev,i){ev.count=baseCounts[i]+regs.filter(function(r){return r.eventId===ev.id}).length});totalRegistrations=regs.length}

// ---------- checks ----------
function isFull(ev){return ev.count>=ev.max}
function validateForm(d){
 var er={};
 if(!d.name.trim())er.nm="Enter your name.";
 if(!d.reg.trim())er.rn="Enter your register number.";
 else if(!/^\d{8,12}$/.test(d.reg.trim()))er.rn="Register number must be 8 to 12 digits.";
 if(!d.dept.trim())er.dp="Enter your department.";
 return er;
}
function showErrors(er){
 [["nm","e1"],["rn","e2"],["dp","e3"]].forEach(function(p){
  $(p[1]).textContent=er[p[0]]||"";var i=$(p[0]);i.classList.remove("bad");
  if(er[p[0]]){void i.offsetWidth;i.classList.add("bad")}
 });
}

// ---------- display ----------
function createEventCard(ev){
 var d=document.createElement("div");d.className="ev"+(isFull(ev)?" full":"");d.id="card"+ev.id;
 var pct=Math.round(ev.count/ev.max*100),left=ev.max-ev.count;
 d.innerHTML='<span class="stamp">Registration Closed</span><h3></h3><p>📍 '+ev.venue+'</p><p>📅 '+ev.date+'</p>'
  +'<div class="bar"><i style="width:'+pct+'%"></i></div><p><b class="cnt">'+ev.count+'</b> / '+ev.max+' registered ('+left+' left)</p>';
 d.querySelector("h3").textContent=ev.name;
 var b=document.createElement("button");b.className="btn";
 if(isFull(ev)){b.disabled=true;b.textContent="Registration Closed"}else{b.textContent="Pick this event";b.onclick=function(){$("ev").value=ev.id;$("nm").focus()}}
 d.appendChild(b);return d;
}
function displayEvents(){
 var q=$("q").value.trim().toLowerCase(),box=$("events");box.innerHTML="";var n=0;
 events.forEach(function(ev){
  if(q&&ev.name.toLowerCase().indexOf(q)<0)return;
  if(filterMode==="avail"&&isFull(ev))return;
  if(filterMode==="full"&&!isFull(ev))return;
  box.appendChild(createEventCard(ev));n++;
 });
 if(!n)box.innerHTML='<div class="none">No events match. Even the coordinators checked twice. 🕵️</div>';
}
function fillSelect(){
 var s=$("ev"),v=s.value;s.innerHTML="";
 events.forEach(function(ev){var o=document.createElement("option");o.value=ev.id;o.textContent=ev.name+(isFull(ev)?" (Closed)":"");o.disabled=isFull(ev);s.appendChild(o)});
 if(v&&!s.querySelector('option[value="'+v+'"]:disabled'))s.value=v;
}
function updateRegistrationCount(){syncCounts();fillSelect();displayEvents();renderRegs()}
function renderRegs(){
 var u=$("regs");u.innerHTML="";
 if(!regs.length){u.innerHTML='<div class="none">Nothing yet. Your name is lonely. 🥲</div>';return}
 regs.forEach(function(r,i){
  var li=document.createElement("li"),t=document.createElement("div");
  var evn=events.filter(function(e){return e.id===r.eventId})[0].name;
  t.innerHTML="<b></b><small></small>";t.firstChild.textContent=r.name+" → "+evn;t.lastChild.textContent=r.reg+" · "+r.dept;
  var c=document.createElement("button");c.className="btn cancel";c.textContent="Cancel";c.onclick=function(){cancelRegistration(i)};
  li.appendChild(t);li.appendChild(c);u.appendChild(li);
 });
}

// ---------- actions ----------
function registerStudent(d){
 selectedEvent=events.filter(function(e){return e.id===+d.eventId})[0];student=d;
 if(isFull(selectedEvent)){showErrors({nm:"That event is full."});return false}
 if(regs.some(function(r){return r.reg===d.reg.trim()&&r.eventId===selectedEvent.id})){showErrors({rn:"This register number is already in this event."});return false}
 regs.push({name:d.name.trim(),reg:d.reg.trim(),dept:d.dept.trim(),eventId:selectedEvent.id});
 saveRegs();updateRegistrationCount();return true;
}
function celebrate(){
 var card=$("card"+selectedEvent.id);if(card)card.classList.add("hl");
 var ok=$("ok");ok.classList.remove("show");void ok.offsetWidth;
 ok.textContent="🎉 "+student.name.trim()+", you are in for "+selectedEvent.name+"! Seats left: "+(selectedEvent.max-selectedEvent.count);ok.classList.add("show");
 document.body.style.transition="background .5s";document.body.style.background="#1f6f58";setTimeout(function(){document.body.style.background=""},700);
 confetti();boop();
}
function cancelRegistration(i){regs.splice(i,1);saveRegs();updateRegistrationCount()}
function resetForm(){
 $("f").reset();showErrors({});$("ok").classList.remove("show");$("q").value="";filterMode="all";
 document.querySelectorAll(".chip").forEach(function(c){c.classList.toggle("on",c.dataset.f==="all")});
 selectedEvent=null;student={};fillSelect();displayEvents();
}
function confetti(){
 var em=["🎉","🎊","✨","🎓","🥳"];
 for(var i=0;i<28;i++){var s=document.createElement("span");s.className="conf";s.textContent=em[i%5];s.style.left=Math.random()*100+"vw";s.style.animationDelay=Math.random()*.6+"s";document.body.appendChild(s);setTimeout(function(x){x.remove()},3000,s)}
}
function boop(){
 document.querySelectorAll(".pol").forEach(function(p,i){
  p.querySelector(".say").textContent=p.dataset.say;
  setTimeout(function(){p.classList.remove("pop");void p.offsetWidth;p.classList.add("pop");setTimeout(function(){p.classList.remove("pop")},1800)},i*180);
 });
}

// ---------- wiring ----------
$("f").addEventListener("submit",function(e){
 e.preventDefault();
 var d={eventId:$("ev").value,name:$("nm").value,reg:$("rn").value,dept:$("dp").value},er=validateForm(d);
 showErrors(er);$("ok").classList.remove("show");
 if(Object.keys(er).length)return;
 if(registerStudent(d)){celebrate();["nm","rn","dp"].forEach(function(k){$(k).value=""})}
});
$("rs").onclick=resetForm;
$("q").addEventListener("input",displayEvents);
document.querySelectorAll(".chip").forEach(function(c){c.onclick=function(){
 filterMode=c.dataset.f;document.querySelectorAll(".chip").forEach(function(x){x.classList.toggle("on",x===c)});displayEvents()}});
var line="🎟️ Seats are limited &nbsp;•&nbsp; Free snacks are not guaranteed &nbsp;•&nbsp; Bring your register number &nbsp;•&nbsp; The coordinators are watching &nbsp;•&nbsp; ";
$("mq").innerHTML=line.repeat(4);
loadRegs();syncCounts();fillSelect();displayEvents();renderRegs();
