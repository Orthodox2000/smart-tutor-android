(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,77071,e=>{"use strict";let t=(0,e.i(56420).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,t],77071)},74544,e=>{"use strict";let t=(0,e.i(56420).default)("clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]);e.s(["Clock",0,t],74544)},99847,e=>{"use strict";let t=(0,e.i(56420).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);e.s(["AlertCircle",0,t],99847)},48161,e=>{"use strict";let t=(0,e.i(56420).default)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);e.s(["CheckCircle",0,t],48161)},62368,e=>{"use strict";let t=(0,e.i(56420).default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);e.s(["Download",0,t],62368)},74337,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(46932),i=e.i(88653),l=e.i(43119),n=e.i(48161),d=e.i(74544),r=e.i(99847),o=e.i(77071),c=e.i(63676),p=e.i(62368),x=e.i(56420);let m=(0,x.default)("receipt-text",[["path",{d:"M13 16H8",key:"wsln4y"}],["path",{d:"M14 8H8",key:"1l3xfs"}],["path",{d:"M16 12H8",key:"1fr5h0"}],["path",{d:"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z",key:"ycz6yz"}]]),h=(0,x.default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]),u=(0,x.default)("chevron-up",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);var g=e.i(57951),b=e.i(9165);function f(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function y(e){return`\u20B9${e.toLocaleString("en-IN",{minimumFractionDigits:0,maximumFractionDigits:0})}`}function v(e){return e?new Date(e).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"}e.s(["default",0,function(){let{profile:e}=(0,g.useAuth)(),[x,w]=(0,a.useState)([]),[j,N]=(0,a.useState)(!0),[k,$]=(0,a.useState)(!1),[D,z]=(0,a.useState)(null),[C,P]=(0,a.useState)({title:"",amount:"",dueDate:"",studentId:"",studentName:"",particulars:""});(0,a.useEffect)(()=>{S()},[]);let S=async()=>{N(!0);try{let e=await (0,b.apiFetch)("/invoices");w(e.feeInvoices||e.invoices||[])}catch(e){}finally{N(!1)}},A=async e=>{e.preventDefault();try{await (0,b.apiFetch)("/invoices",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...C,amount:parseFloat(C.amount)})})&&($(!1),P({title:"",amount:"",dueDate:"",studentId:"",studentName:"",particulars:""}),S())}catch(e){}},M=(0,a.useMemo)(()=>x.reduce((e,t)=>e+t.amount,0),[x]),T=(0,a.useMemo)(()=>x.reduce((e,t)=>e+(t.paidAmount??0),0),[x]),I=Math.max(M-T,0);return(0,t.jsxs)("div",{className:"space-y-6 pb-20",children:[(0,t.jsxs)("header",{className:"flex items-center justify-between",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1",children:"Financial Overview"}),(0,t.jsx)("h1",{className:"text-2xl font-bold text-slate-900 tracking-tight",children:"Fees & Invoices"})]}),e?.role==="admin"&&(0,t.jsx)("button",{onClick:()=>$(!0),className:"w-10 h-10 bg-academy-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-academy-orange-100",children:(0,t.jsx)(o.Plus,{size:24})})]}),(0,t.jsxs)("div",{className:"grid grid-cols-3 gap-3",children:[(0,t.jsx)("div",{className:"bg-white rounded-2xl border border-slate-100 p-4 min-w-0",children:(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("div",{className:"w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0",children:(0,t.jsx)(l.Coins,{size:16,className:"text-blue-500"})}),(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[8px] font-bold text-slate-400 uppercase tracking-wider",children:"Total"}),(0,t.jsx)("p",{className:"text-sm font-black text-slate-800 truncate",children:y(M)})]})]})}),(0,t.jsx)("div",{className:"bg-white rounded-2xl border border-slate-100 p-4 min-w-0",children:(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("div",{className:"w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0",children:(0,t.jsx)(n.CheckCircle,{size:16,className:"text-emerald-500"})}),(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[8px] font-bold text-slate-400 uppercase tracking-wider",children:"Paid"}),(0,t.jsx)("p",{className:"text-sm font-black text-emerald-600 truncate",children:y(T)})]})]})}),(0,t.jsx)("div",{className:"bg-white rounded-2xl border border-slate-100 p-4 min-w-0",children:(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("div",{className:`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${I>0?"bg-red-50":"bg-emerald-50"}`,children:(0,t.jsx)(r.AlertCircle,{size:16,className:I>0?"text-red-500":"text-emerald-500"})}),(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[8px] font-bold text-slate-400 uppercase tracking-wider",children:"Due"}),(0,t.jsx)("p",{className:`text-sm font-black truncate ${I>0?"text-red-600":"text-emerald-600"}`,children:y(I)})]})]})})]}),(0,t.jsx)(i.AnimatePresence,{children:k&&(0,t.jsxs)(s.motion.div,{initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.95},className:"bg-white p-6 rounded-2xl border border-academy-orange-100 shadow-sm",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between mb-4",children:[(0,t.jsx)("h3",{className:"font-bold text-slate-800",children:"Create Invoice"}),(0,t.jsx)("button",{onClick:()=>$(!1),className:"p-2 text-slate-400",children:(0,t.jsx)(c.X,{size:18})})]}),(0,t.jsxs)("form",{onSubmit:A,className:"space-y-4",children:[(0,t.jsx)("input",{placeholder:"Invoice Title",required:!0,value:C.title,onChange:e=>P({...C,title:e.target.value}),className:"w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"}),(0,t.jsx)("input",{placeholder:"Amount (Rs.)",type:"number",required:!0,value:C.amount,onChange:e=>P({...C,amount:e.target.value}),className:"w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"}),(0,t.jsx)("input",{placeholder:"Due Date",type:"date",value:C.dueDate,onChange:e=>P({...C,dueDate:e.target.value}),className:"w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"}),(0,t.jsx)("input",{placeholder:"Student ID",value:C.studentId,onChange:e=>P({...C,studentId:e.target.value}),className:"w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"}),(0,t.jsx)("input",{placeholder:"Student Name",value:C.studentName,onChange:e=>P({...C,studentName:e.target.value}),className:"w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"}),(0,t.jsx)("button",{type:"submit",className:"w-full bg-academy-orange-600 text-white py-4 rounded-2xl font-bold text-sm",children:"Create Invoice"})]})]})}),(0,t.jsx)("div",{className:"space-y-3",children:j?(0,t.jsx)("div",{className:"text-center py-20 opacity-40",children:(0,t.jsx)("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"})}):x.length>0?x.map((e,a)=>{var l,o;let c=e.paidAmount??0,x=Math.max(e.amount-c,0),g=D===e.id;return(0,t.jsxs)(s.motion.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.05*a},className:"bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden",children:[(0,t.jsxs)("div",{className:"p-4 flex items-start gap-3 cursor-pointer",onClick:()=>z(g?null:e.id),children:[(0,t.jsx)("div",{className:"w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 mt-0.5",children:(0,t.jsx)(m,{size:16,className:"text-slate-400"})}),(0,t.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,t.jsx)("h3",{className:"font-bold text-slate-900 text-sm leading-tight",children:e.title}),(0,t.jsx)("p",{className:"text-[10px] text-slate-400 font-bold mt-0.5 truncate",children:e.receiptNo?e.receiptNo:v(e.dueDate)}),(0,t.jsxs)("div",{className:"flex items-center gap-1 mt-1",children:[(e=>{switch(e){case"paid":return(0,t.jsx)(n.CheckCircle,{size:14,className:"text-emerald-500"});case"overdue":return(0,t.jsx)(r.AlertCircle,{size:14,className:"text-red-500"});default:return(0,t.jsx)(d.Clock,{size:14,className:"text-amber-500"})}})(e.status),(0,t.jsx)("span",{className:`text-[9px] font-black uppercase tracking-wider ${"paid"===(l=e.status)?"bg-emerald-50 text-emerald-700":"partial"===l?"bg-amber-50 text-amber-700":"overdue"===l?"bg-red-50 text-red-700":"bg-slate-50 text-slate-600"}`,children:"paid"===(o=e.status)?"Paid":"partial"===o?"Partial":"overdue"===o?"Overdue":"Unpaid"})]})]}),(0,t.jsx)("div",{className:"text-right shrink-0 pl-2",children:(0,t.jsx)("p",{className:"font-black text-slate-900 text-sm whitespace-nowrap",children:y(e.amount)})}),(0,t.jsx)("div",{className:"text-slate-300 shrink-0",children:g?(0,t.jsx)(u,{size:14}):(0,t.jsx)(h,{size:14})})]}),(0,t.jsx)(i.AnimatePresence,{children:g&&(0,t.jsx)(s.motion.div,{initial:{height:0,opacity:0},animate:{height:"auto",opacity:1},exit:{height:0,opacity:0},className:"overflow-hidden",children:(0,t.jsxs)("div",{className:"px-4 pb-4 border-t border-slate-50",children:[(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-x-3 gap-y-2 mt-3 text-[11px]",children:[e.receiptNo&&(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Receipt: "}),(0,t.jsx)("span",{className:"text-slate-700 break-all",children:e.receiptNo})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Due: "}),(0,t.jsx)("span",{className:"text-slate-700",children:v(e.dueDate)})]}),e.studentName&&(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Student: "}),(0,t.jsx)("span",{className:"text-slate-700 truncate inline-block max-w-[140px] align-bottom",children:e.studentName})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Paid: "}),(0,t.jsx)("span",{className:"text-emerald-600 font-bold whitespace-nowrap",children:y(c)})]}),e.month&&(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Month: "}),(0,t.jsx)("span",{className:"text-slate-700",children:e.month})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Balance: "}),(0,t.jsx)("span",{className:`font-bold whitespace-nowrap ${x>0?"text-red-600":"text-emerald-600"}`,children:y(x)})]}),e.particulars&&(0,t.jsxs)("div",{className:"col-span-2 min-w-0",children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Particulars: "}),(0,t.jsx)("span",{className:"text-slate-700 break-words",children:e.particulars})]})]}),e.transactions&&e.transactions.length>0&&(0,t.jsxs)("div",{className:"mt-3",children:[(0,t.jsx)("p",{className:"text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5",children:"Payment History"}),(0,t.jsx)("div",{className:"flex flex-wrap gap-x-4 gap-y-1",children:e.transactions.map((e,a)=>(0,t.jsxs)("span",{className:"inline-flex items-center gap-1 text-[11px] text-slate-600",children:[(0,t.jsx)("span",{className:"w-1.5 h-1.5 rounded-full bg-emerald-500"}),y(e.paidAmount)," via ",e.paymentMode," on ",v(e.paidDate)]},a))})]}),("paid"===e.status||"partial"===e.status)&&(0,t.jsxs)("button",{onClick:t=>{t.stopPropagation(),function(e){let t=window.open("","_blank","width=1280,height=900");if(!t)return;let a=e.paidAmount??0,s=Math.max(e.amount-a,0),i=e.receiptNo||e.id,l=`${window.location.origin}/stpl.jpeg`,n=`${window.location.origin}/founder-sign.png`,d=e.transactions??[],r=new Date,o=r.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})+", "+r.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),c=function(e){if(0===e)return"Zero Rupees Only";let t=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],a=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];function s(e){let s="";return e>=100&&(s+=t[Math.floor(e/100)]+" Hundred ",e%=100),e>=20&&(s+=a[Math.floor(e/10)]+" ",e%=10),e>0&&(s+=t[e]+" "),s.trim()}let i=Math.floor(e/1e7),l=Math.floor((e%=1e7)/1e5),n=Math.floor((e%=1e5)/1e3);e%=1e3;let d="";return i&&(d+=s(i)+" Crore "),l&&(d+=s(l)+" Lakh "),n&&(d+=s(n)+" Thousand "),e>0&&(d+=s(e)+" "),d.trim()+" Rupees Only"}(e.amount),p={paid:"background:#d1fae5;color:#065f46;border:1px solid #a7f3d0;",partial:"background:#dbeafe;color:#1e40af;border:1px solid #93c5fd;",unpaid:"background:#fef3c7;color:#92400e;border:1px solid #fcd34d;",overdue:"background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;"},x=p[e.status]??p.unpaid,m={paid:"PAID",partial:"PAID (Partially)",unpaid:"UNPAID",overdue:"OVERDUE"}[e.status]??"UNPAID",h="#0f1f45",u=`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Fee Receipt - ${f(i)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { padding: 24px; background: #e5e7eb; color: #111827; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .receipt-wrap { max-width: 850px; margin: 0 auto; background: #fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .receipt-box { border: 1.5px solid ${h}; margin: 8px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .sec-head { background: ${h} !important; color: #fff !important; padding: 6px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .detail-cell { flex: 1; display: flex; padding: 7px 12px; align-items: center; }
    .detail-cell:first-child { border-right: 1px solid #d1d5db; }
    .detail-lbl { width: 120px; font-weight: 700; color: #374151; white-space: nowrap; }
    .detail-sep { margin: 0 6px; color: #9ca3af; }
    .detail-val { color: #475569; }
    .fee-th { border: 1px solid #d1d5db; padding: 8px 10px; background: ${h} !important; color: #fff !important; font-weight: 600; text-align: center; font-size: 12px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .fee-td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: center; font-size: 13px; }
    .hist-th { padding: 8px 10px; border: 1px solid #d1d5db; background: #f1f5f9 !important; font-size: 12px; text-align: center; font-weight: 700; color: #334155; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .hist-td { padding: 8px 10px; border: 1px solid #d1d5db; text-align: center; font-size: 13px; }
    .badge { display: inline-block; padding: 3px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .print-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; background: ${h} !important; color: #fff !important; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; margin-bottom: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @media print {
      body { padding: 0; background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .print-btn { display: none !important; }
      .receipt-wrap { margin: 0; border: none; }
      .receipt-box { margin: 0; border: none; }
      .receipt-box img { width: 100% !important; height: auto !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div style="max-width:850px;margin:0 auto;">
    <button class="print-btn" onclick="window.print();">Print Receipt</button>
  </div>
  <div class="receipt-wrap">
    <div class="receipt-box">
      <div style="width:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
        <img src="${f(l)}" alt="Smart Tutors" style="width:100%;display:block;height:auto;" />
      </div>
      <div style="padding:20px 24px;">
        <div style="text-align:center;font-size:22px;font-weight:900;color:${h};margin:12px 0 14px;letter-spacing:0.08em;">FEE RECEIPT</div>
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#1e293b;margin-bottom:14px;">
          <div><span>Receipt No.</span><span style="margin:0 8px;">:</span><span style="font-weight:500;color:#475569;">${f(i)}</span></div>
          <div><span>Receipt Date</span><span style="margin:0 8px;">:</span><span style="font-weight:500;color:#475569;">${f(v(e.createdAt||e.dueDate))}</span></div>
        </div>
        <div class="sec-head">Student Details</div>
        <div style="border:1px solid #d1d5db;font-size:13px;margin-bottom:16px;">
          <div style="display:flex;border-bottom:1px solid #d1d5db;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Student Name</span><span class="detail-sep">:</span><span class="detail-val">${f(e.studentName||"—")}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Parent Name</span><span class="detail-sep">:</span><span class="detail-val">${f(e.parentName||"—")}</span></div>
          </div>
          <div style="display:flex;border-bottom:1px solid #d1d5db;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Class / Board</span><span class="detail-sep">:</span><span class="detail-val">${f(e.classCourse||"—")}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Enrollment No.</span><span class="detail-sep">:</span><span class="detail-val">${f((e.studentId||"—").replace("-","").substring(0,8).toUpperCase())}</span></div>
          </div>
          <div style="display:flex;border-bottom:1px solid #d1d5db;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Academic Year</span><span class="detail-sep">:</span><span class="detail-val">${f(e.academicYear||"—")}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Payment Mode</span><span class="detail-sep">:</span><span class="detail-val">${f(e.paymentMode||"—")}</span></div>
          </div>
          <div style="display:flex;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Mobile No.</span><span class="detail-sep">:</span><span class="detail-val">${f(e.mobileNo||"—")}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Invoice ID</span><span class="detail-sep">:</span><span class="detail-val">${f(e.id||"—")}</span></div>
          </div>
        </div>
        <div class="sec-head">Fee Details</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #d1d5db;">
          <thead>
            <tr>
              <th class="fee-th" style="width:50px;">Sr No.</th>
              <th class="fee-th" style="text-align:left;">Particulars</th>
              <th class="fee-th">Month</th>
              <th class="fee-th">Due Date</th>
              <th class="fee-th" style="text-align:right;">Amount</th>
              <th class="fee-th" style="text-align:right;">Paid</th>
              <th class="fee-th" style="text-align:right;">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="fee-td">1</td>
              <td class="fee-td" style="text-align:left;font-weight:600;">${f(e.title||"Fee")}${e.particulars?" — "+f(e.particulars):""}</td>
              <td class="fee-td">${f(e.month||"—")}</td>
              <td class="fee-td">${f(v(e.dueDate))}</td>
              <td class="fee-td" style="text-align:right;font-weight:700;">${f(y(e.amount))}</td>
              <td class="fee-td" style="text-align:right;font-weight:700;">${f(y(a))}</td>
              <td class="fee-td" style="text-align:right;font-weight:700;color:${s>0?"#dc2626":"#16a34a"};">${f(y(s))}</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;padding:8px 12px;background:#f8fafc !important;border:1px solid #d1d5db;border-top:none;margin-bottom:16px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
          <span style="color:#374151;white-space:nowrap;">Amount in Words :</span>
          <span style="color:#475569;font-weight:500;">${f(c)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:700;color:#1e293b;padding:10px 2px;border-top:2px solid ${h};margin-bottom:4px;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="color:#64748b;">Payment Status</span><span style="color:#9ca3af;margin:0 2px;">:</span>
            <span class="badge" style="${x}">${f(m)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="color:#64748b;">Total Paid</span><span style="color:#9ca3af;margin:0 2px;">:</span>
            <span style="font-weight:800;color:#16a34a;">${f(y(a))}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="color:#64748b;">Balance Due</span><span style="color:#9ca3af;margin:0 2px;">:</span>
            <span style="font-weight:800;color:${s>0?"#dc2626":"#16a34a"};">${f(y(s))}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:16px;font-size:13px;font-weight:700;color:#1e293b;padding:4px 2px 16px;border-bottom:1px solid #e5e7eb;margin-bottom:20px;">
          <div><span style="color:#64748b;">Due Date</span><span style="color:#d1d5db;margin:0 4px;">:</span><span>${f(v(e.dueDate))}</span></div>
          <span style="color:#d1d5db;">|</span>
          <div><span style="color:#64748b;">Print Date</span><span style="color:#d1d5db;margin:0 4px;">:</span><span>${f(o)}</span></div>
        </div>
        ${function(){if(!d.length)return"";let e=d.map((e,t)=>`
      <tr>
        <td class="hist-td">${t+1}</td>
        <td class="hist-td">${f(v(e.paidDate))}</td>
        <td class="hist-td" style="text-align:right;font-weight:700;">${f(y(e.paidAmount))}</td>
        <td class="hist-td">${f(e.paymentMode)}</td>
        <td class="hist-td">${f(e.transactionId||e.chequeNumber||"-")}</td>
        <td class="hist-td">${f(e.bankName||"-")}</td>
      </tr>`).join("");return`
      <div style="margin-top:20px;">
        <div class="sec-head">Payment History</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #d1d5db;">
          <thead><tr>
            <th class="hist-th" style="width:40px;">#</th>
            <th class="hist-th">Date</th>
            <th class="hist-th" style="text-align:right;">Amount</th>
            <th class="hist-th">Mode</th>
            <th class="hist-th">Transaction Ref</th>
            <th class="hist-th">Bank</th>
          </tr></thead>
          <tbody>${e}</tbody>
        </table>
      </div>`}()}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;padding:16px 24px 0;border-top:2px solid ${h};margin-top:16px;min-height:120px;">
        <div style="max-width:50%;font-size:11px;font-weight:600;color:#64748b;">
          <p style="margin:3px 0;">This is a computer-generated receipt and does not require a physical signature.</p>
          <p style="margin:3px 0;font-weight:800;color:#1e293b;font-size:12px;">FEES ONCE PAID ARE NON-REFUNDABLE UNDER ANY CIRCUMSTANCES.</p>
          <p style="margin:8px 3px 3px;">Thank you for choosing Smart Tutors Pvt. Ltd.</p>
          <p style="margin:3px 0;">We appreciate your trust.</p>
        </div>
        <div style="text-align:center;width:220px;">
          <img src="${f(n)}" alt="Founder Signature" style="display:block;width:180px;height:64px;margin:0 auto 6px;object-fit:contain;" />
          <div style="border-top:1.5px solid #334155;margin-top:4px;padding-top:6px;">
            <div style="font-size:13px;font-weight:800;color:#1e293b;">Mr. Ravi Rana</div>
            <div style="font-size:11px;color:#64748b;margin-top:1px;">Director &amp; Founder</div>
            <div style="font-size:11px;color:#64748b;margin-top:1px;">Smart Tutors Pvt. Ltd.</div>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;padding:10px 24px 14px;">
        <span>Smart Tutors Pvt. Ltd. | CIN: U80100MH2019PTC321658</span>
        <span>www.smarttutors.co.in</span>
      </div>
    </div>
  </div>
</body>
</html>`;t.document.write(u),t.document.close()}(e)},className:"mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold",children:[(0,t.jsx)(p.Download,{size:16}),"View & Print Receipt"]})]})})})]},e.id||a)}):(0,t.jsxs)("div",{className:"text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed",children:[(0,t.jsx)(l.Coins,{size:48,className:"mx-auto text-slate-200 mb-4"}),(0,t.jsx)("p",{className:"text-slate-400 text-xs font-bold uppercase tracking-widest",children:"No invoices found"})]})})]})}],74337)}]);