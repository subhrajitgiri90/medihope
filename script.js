const seedCampaigns=[
 {id:"CAMP-001",name:"Help Aarav's Heart Surgery",category:"Surgery",target:150000,raised:82000,location:"Bhubaneswar, Odisha",icon:"❤",desc:"Support a family with urgent medical surgery expenses."},
 {id:"CAMP-002",name:"Emergency Cancer Treatment",category:"Treatment",target:250000,raised:137500,location:"Cuttack, Odisha",icon:"✚",desc:"Fund essential treatment and hospital care."},
 {id:"CAMP-003",name:"Child Care & Recovery",category:"Child Care",target:100000,raised:46000,location:"Puri, Odisha",icon:"★",desc:"Help cover treatment, medicines and recovery support."}
];
const CFG={upi:"medihope@upi",name:"MediHope Foundation",bank:"State Bank of India",acc:"00000012345678",ifsc:"SBIN0000001",branch:"Bhubaneswar Main Branch"};
let payMethod="upi";
let qr=null;
function updateQR(){const amt=Number(document.getElementById("donAmount").value)||0,url=`upi://pay?pa=${CFG.upi}&pn=${encodeURIComponent(CFG.name)}&cu=INR${amt?"&am="+amt:""}&tn=MediHope%20Donation`,el=document.getElementById("qr");if(!el)return;if(typeof QRCode==="undefined"){el.innerHTML='<p class="small muted">QR needs internet to load.</p>';return}if(!qr)qr=new QRCode(el,{text:url,width:160,height:160,correctLevel:QRCode.CorrectLevel.M});else qr.makeCode(url)}
function setAmt(n){document.getElementById("donAmount").value=n;updateQR()}
function copyText(t){navigator.clipboard?.writeText(t);toast("Copied: "+t)}
function initPay(){upiId.textContent=CFG.upi;bkName.textContent=CFG.name;bkBank.textContent=CFG.bank;bkAcc.textContent=CFG.acc;bkIfsc.textContent=CFG.ifsc;bkBranch.textContent=CFG.branch;
 document.querySelectorAll("#payTabs button").forEach(b=>b.onclick=()=>{payMethod=b.dataset.m;document.querySelectorAll("#payTabs button").forEach(x=>x.classList.toggle("on",x===b));document.querySelectorAll(".pay").forEach(p=>p.classList.toggle("on",p.id==="pay-"+payMethod))});
 cardNum.oninput=e=>{e.target.value=e.target.value.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();pvNum.textContent=e.target.value||"•••• •••• •••• ••••"};
 cardExp.oninput=e=>{let v=e.target.value.replace(/\D/g,"").slice(0,4);if(v.length>2)v=v.slice(0,2)+"/"+v.slice(2);e.target.value=v;pvExp.textContent=v||"MM/YY"};
 cardName.oninput=e=>pvName.textContent=e.target.value||"Card Holder"}
function luhn(n){let s=0,d=false;for(let i=n.length-1;i>=0;i--){let x=+n[i];if(d){x*=2;if(x>9)x-=9}s+=x;d=!d}return s%10===0}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
/* Safe storage: works even if the browser blocks localStorage (file://, preview panes, private mode) */
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}}
function load(k,fallback){try{const v=JSON.parse(store(k)||"null");return v==null?fallback:v}catch(e){return fallback}}
let campaigns=load("mh_campaigns",null)||JSON.parse(JSON.stringify(seedCampaigns));
let transactions=load("mh_transactions",[]);

function save(){store("mh_campaigns",JSON.stringify(campaigns));store("mh_transactions",JSON.stringify(transactions))}
function money(n){return "₹"+Number(n).toLocaleString("en-IN")}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2500)}
function showPage(id){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById(id).classList.add("active");document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===id));if(id==="campaigns")renderCampaigns();if(id==="donate")populateDonationSelect();if(id==="transactions")renderTransactions();updateDashboard();window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>showPage(b.dataset.page));

function updateDashboard(){
 const raised=campaigns.reduce((a,c)=>a+c.raised,0), donors=[...new Set(transactions.map(t=>t.email))].length, successful=transactions.filter(t=>t.status==="Completed").length;
 document.getElementById("heroRaised").textContent=money(raised);document.getElementById("mRaised").textContent=money(raised);
 document.getElementById("mCampaigns").textContent=campaigns.length;document.getElementById("mDonors").textContent=donors;document.getElementById("mDonations").textContent=successful;
 const vals=[25,45,35,60,52,78,90], labels=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];document.getElementById("chart").innerHTML=vals.map((v,i)=>`<div class="bar" style="height:${v*1.65}px"><span>${labels[i]}</span></div>`).join("");
}
function renderCampaigns(){
 const q=(document.getElementById("campaignSearch")?.value||"").toLowerCase(), cat=document.getElementById("categoryFilter")?.value||"";
 const list=campaigns.filter(c=>(!q||c.name.toLowerCase().includes(q))&&(!cat||c.category===cat));
 document.getElementById("campaignGrid").innerHTML=list.map(c=>{
   const pct=Math.min(100,Math.round(c.raised/c.target*100));
   return `<div class="card campaign"><div class="cover">${c.icon}</div><div class="campaign-body"><span class="tag">${esc(c.category)}</span><h3>${esc(c.name)}</h3><p class="muted">${esc(c.desc)}</p><p class="small muted">📍 ${esc(c.location)}</p><div class="progress"><i style="width:${pct}%"></i></div><div class="amounts"><b>${money(c.raised)}</b><span class="muted">of ${money(c.target)}</span></div><button class="btn secondary" style="width:100%;margin-top:14px" onclick="startDonation('${c.id}')">Donate to this campaign</button></div></div>`
 }).join("")||`<div class="card"><p>No campaign found.</p></div>`;
}
function populateDonationSelect(){document.getElementById("donCampaign").innerHTML=campaigns.map(c=>`<option value="${c.id}">${esc(c.name)} —${money(c.raised)} raised</option>`).join("")}
function startDonation(id){showPage("donate");setTimeout(()=>document.getElementById("donCampaign").value=id,50)}
function submitDonation(){
 const form=document.getElementById("donationForm");if(!form.reportValidity())return;
 const cid=document.getElementById("donCampaign").value,c=campaigns.find(x=>x.id===cid),amount=Number(document.getElementById("donAmount").value);
 if(!c||amount<=0)return toast("Enter a valid donation amount.");
 let method="UPI / QR";
 if(payMethod==="card"){const n=cardNum.value.replace(/\s/g,""),[m,y]=cardExp.value.split("/").map(Number),now=new Date();
  if(!cardName.value.trim())return toast("Enter the name on the card.");
  if(n.length<13||!luhn(n))return toast("Card number looks invalid.");
  if(!m||m<1||m>12||!y||(2000+y)*12+m<now.getFullYear()*12+now.getMonth()+1)return toast("Card expiry is invalid or expired.");
  if(!/^\d{3,4}$/.test(cardCvv.value))return toast("Enter a valid CVV.");
  method="Card •••• "+n.slice(-4)}
 if(payMethod==="bank"){if(bankRef.value.trim().length<6)return toast("Enter the UTR / reference number.");method="Bank Transfer ("+bankRef.value.trim()+")"}
 const tx={id:"TXN-"+Date.now().toString().slice(-8),donor:document.getElementById("donorName").value.trim(),email:document.getElementById("donorEmail").value.trim(),campaign:c.name,amount,method,date:new Date().toLocaleString("en-IN"),status:"Completed"};
 c.raised+=amount;transactions.unshift(tx);save();form.reset();cardCvv.value="";pvNum.textContent="•••• •••• •••• ••••";pvName.textContent="Card Holder";pvExp.textContent="MM/YY";updateQR();updateDashboard();
 receiptBox.innerHTML=`<div style="text-align:center"><div style="font-size:54px">✅</div><h2>Thank you, ${esc(tx.donor)}!</h2><p class="muted">Your demo donation was successful.</p></div><div class="kv"><span>Transaction ID</span><b>${tx.id}</b></div><div class="kv"><span>Amount</span><b>${money(amount)}</b></div><div class="kv"><span>Campaign</span><b>${esc(c.name)}</b></div><div class="kv"><span>Method</span><b>${esc(method)}</b></div><div class="kv"><span>Status</span><b>Completed</b></div><button class="btn primary" style="width:100%;margin-top:16px" onclick="document.getElementById('receiptModal').classList.remove('show');showPage('transactions')">View Transactions</button>`;
 document.getElementById("receiptModal").classList.add("show");
}
function renderTransactions(){document.getElementById("transactionBody").innerHTML=transactions.map(t=>`<tr><td>${t.id}</td><td>${esc(t.donor)}<br><span class="small muted">${esc(t.email)}</span></td><td>${esc(t.campaign)}</td><td><b>${money(t.amount)}</b></td><td>${t.method}</td><td>${t.date}</td><td><span class="status completed">${t.status}</span></td></tr>`).join("")||`<tr><td colspan="7" class="muted">No demo transactions yet.</td></tr>`}
function openCampaignModal(){document.getElementById("campaignModal").classList.add("show")}
function closeModal(){document.getElementById("campaignModal").classList.remove("show")}
function submitCampaign(){
 const form=document.getElementById("campaignForm");if(!form.reportValidity())return;
 const c={id:"CAMP-"+String(campaigns.length+1).padStart(3,"0"),name:document.getElementById("cName").value,category:document.getElementById("cCategory").value,target:Number(document.getElementById("cTarget").value),raised:0,location:document.getElementById("cLocation").value,icon:"❤",desc:document.getElementById("cDesc").value};
 campaigns.push(c);save();form.reset();closeModal();renderCampaigns();updateDashboard();toast("Campaign created successfully.");showPage("campaigns");
}
function exportCSV(){if(!transactions.length)return toast("No transactions to export.");const rows=[["Transaction ID","Donor","Email","Campaign","Amount","Method","Date","Status"],...transactions.map(t=>[t.id,t.donor,t.email,t.campaign,t.amount,t.method,t.date,t.status])];const csv=rows.map(r=>r.map(x=>`"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="medical_fundraising_transactions.csv";a.click();URL.revokeObjectURL(a.href)}
function resetDemo(){if(confirm("Reset all demo campaigns and transactions?")){try{localStorage.clear()}catch(e){}campaigns=JSON.parse(JSON.stringify(seedCampaigns));transactions=[];save();updateDashboard();renderCampaigns();renderTransactions();toast("Demo data reset.");}}
updateDashboard();renderCampaigns();populateDonationSelect();renderTransactions();initPay();updateQR();
