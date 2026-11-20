const $ = (id) => document.getElementById(id);
const starterProjects = [
  {id:"p1",name:"Website Development",desc:"Build and polish the new website"},
  {id:"p2",name:"Internship Portfolio",desc:"Organize learning and deliverables"},
  {id:"p3",name:"Personal Growth",desc:"Learning goals and weekly plans"}
];
const starterTasks = [
  {id:"t1",title:"Plan website structure",project:"p1",date:"",priority:"High",status:"done"},
  {id:"t2",title:"Create responsive homepage",project:"p1",date:"",priority:"High",status:"progress"},
  {id:"t3",title:"Prepare project documentation",project:"p2",date:"",priority:"Medium",status:"todo"},
  {id:"t4",title:"Review weekly learning goals",project:"p3",date:"",priority:"Low",status:"todo"}
];
let projects = JSON.parse(localStorage.getItem("tf_projects") || "null") || starterProjects;
let tasks = JSON.parse(localStorage.getItem("tf_tasks") || "null") || starterTasks;
let editingId = null, currentView = "overview";
const save = () => { localStorage.setItem("tf_projects",JSON.stringify(projects)); localStorage.setItem("tf_tasks",JSON.stringify(tasks)); };
const projectName = id => projects.find(p=>p.id===id)?.name || "Unassigned";
const statusName = s => ({todo:"To do",progress:"In progress",done:"Completed"}[s]);
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function render(){
  const done=tasks.filter(t=>t.status==="done").length, progress=tasks.filter(t=>t.status==="progress").length;
  $("totalCount").textContent=tasks.length;$("progressCount").textContent=progress;$("doneCount").textContent=done;$("rateCount").textContent=(tasks.length?Math.round(done/tasks.length*100):0)+"%";
  const q=$("searchInput").value.toLowerCase(), f=$("statusFilter").value;
  let visible=tasks.filter(t=>(currentView!=="tasks"||true)&&t.title.toLowerCase().includes(q)&&(f==="all"||t.status===f));
  if(currentView==="projects") visible=[];
  if(currentView==="overview") visible=visible.slice(0,5);
  $("taskList").innerHTML=visible.length?visible.map(t=>`<div class="task-row"><button class="check-btn ${t.status==="done"?"checked":""}" data-toggle="${t.id}" title="Mark complete">${t.status==="done"?"✓":""}</button><div><div class="task-name">${escapeHtml(t.title)}</div><div class="task-meta">${escapeHtml(projectName(t.project))}${t.date?" · Due "+escapeHtml(t.date):""}</div></div><div class="task-right"><span class="status ${t.status}">${statusName(t.status)}</span><span class="priority">${t.priority}</span><div class="task-actions"><button class="mini-btn" data-edit="${t.id}" title="Edit">✎</button><button class="mini-btn" data-delete="${t.id}" title="Delete">×</button></div></div></div>`).join(""):`<div class="empty">${currentView==="projects"?"Your projects are listed on the right.":"No tasks found. Add a task to get started."}</div>`;
  $("projectList").innerHTML=projects.map(p=>{let all=tasks.filter(t=>t.project===p.id),d=all.filter(t=>t.status==="done").length,rate=all.length?Math.round(d/all.length*100):0;return `<div><div class="project-top"><span>${escapeHtml(p.name)}</span><span>${rate}%</span></div><div class="project-desc">${escapeHtml(p.desc||"Your project workspace")}</div><div class="progress-track"><div class="progress-fill" style="width:${rate}%"></div></div></div>`}).join("")||'<div class="empty">No projects yet.</div>';
  $("taskProject").innerHTML=projects.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
  $("viewAll").style.display=currentView==="tasks"?"none":"inline";
  $("pageTitle").innerHTML=currentView==="projects"?"Your projects <span>✦</span>":currentView==="tasks"?"Your tasks <span>✦</span>":"Good morning, Gohar <span>✦</span>";
  $("pageCrumb").textContent=currentView[0].toUpperCase()+currentView.slice(1);
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===currentView));
  save();
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openTask(t=null){editingId=t?.id||null;$("modalTitle").textContent=t?"Edit task":"Create a task";$("taskTitle").value=t?.title||"";$("taskProject").value=t?.project||projects[0]?.id||"";$("taskDate").value=t?.date||"";$("taskPriority").value=t?.priority||"Medium";$("taskStatus").value=t?.status||"todo";$("taskModal").classList.add("open");$("taskModal").setAttribute("aria-hidden","false");$("taskTitle").focus()}
function closeModal(id){$(id).classList.remove("open");$(id).setAttribute("aria-hidden","true")}
$("addTaskTop").onclick=()=>openTask();$("viewAll").onclick=()=>setView("tasks");$("addProject").onclick=()=>{$("projectModal").classList.add("open");$("projectName").focus()};
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
document.querySelectorAll(".modal-backdrop").forEach(b=>b.addEventListener("click",e=>{if(e.target===b)closeModal(b.id)}));
$("taskForm").onsubmit=e=>{e.preventDefault();let obj={id:editingId||"t"+Date.now(),title:$("taskTitle").value.trim(),project:$("taskProject").value,date:$("taskDate").value,priority:$("taskPriority").value,status:$("taskStatus").value};if(!obj.title)return;if(editingId)tasks=tasks.map(t=>t.id===editingId?obj:t);else tasks.unshift(obj);closeModal("taskModal");render();toast(editingId?"Task updated":"Task added");};
$("projectForm").onsubmit=e=>{e.preventDefault();let name=$("projectName").value.trim();if(!name)return;projects.push({id:"p"+Date.now(),name,desc:$("projectDesc").value.trim()});$("projectForm").reset();closeModal("projectModal");render();toast("Project created");};
$("taskList").addEventListener("click",e=>{let toggle=e.target.closest("[data-toggle]"),edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");if(toggle){let t=tasks.find(x=>x.id===toggle.dataset.toggle);t.status=t.status==="done"?"todo":"done";render();toast("Task status updated")}if(edit){let t=tasks.find(x=>x.id===edit.dataset.edit);openTask(t)}if(del){tasks=tasks.filter(t=>t.id!==del.dataset.delete);render();toast("Task deleted")}});
$("searchInput").oninput=render;$("statusFilter").onchange=render;
function setView(v){currentView=v;render();$("sidebar").classList.remove("open")}
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>setView(b.dataset.view));
$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");
$("todayLabel").textContent=new Intl.DateTimeFormat("en",{weekday:"short",month:"short",day:"numeric"}).format(new Date());
render();
