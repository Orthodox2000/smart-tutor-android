(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,65241,e=>{"use strict";var t=e.i(43476),a=e.i(18566),s=e.i(11241);e.s(["default",0,function(){let e=(0,a.useRouter)();return(0,t.jsx)("button",{onClick:()=>e.back(),className:"w-10 h-10 -ml-2 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-95 transition-all","aria-label":"Go back",children:(0,t.jsx)(s.ArrowLeft,{size:22,className:"text-slate-700"})})}])},77071,e=>{"use strict";let t=(0,e.i(56420).default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",0,t],77071)},74544,e=>{"use strict";let t=(0,e.i(56420).default)("clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]);e.s(["Clock",0,t],74544)},99847,e=>{"use strict";let t=(0,e.i(56420).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);e.s(["AlertCircle",0,t],99847)},48161,e=>{"use strict";let t=(0,e.i(56420).default)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);e.s(["CheckCircle",0,t],48161)},74337,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(46932),i=e.i(88653),l=e.i(43119),n=e.i(48161),d=e.i(74544),r=e.i(99847),o=e.i(77071),c=e.i(63676),p=e.i(62368),x=e.i(56420);let m=(0,x.default)("receipt-text",[["path",{d:"M13 16H8",key:"wsln4y"}],["path",{d:"M14 8H8",key:"1l3xfs"}],["path",{d:"M16 12H8",key:"1fr5h0"}],["path",{d:"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z",key:"ycz6yz"}]]),h=(0,x.default)("chevron-down",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]),u=(0,x.default)("chevron-up",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);var f=e.i(57951),g=e.i(9165),b=e.i(65241);function y(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function v(e){return`\u20B9${e.toLocaleString("en-IN",{minimumFractionDigits:0,maximumFractionDigits:0})}`}function w(e){return e?new Date(e).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"}e.s(["default",0,function(){let{profile:e}=(0,f.useAuth)(),[x,j]=(0,a.useState)([]),[N,k]=(0,a.useState)(!0),[$,z]=(0,a.useState)(!1),[D,C]=(0,a.useState)(null),[P,S]=(0,a.useState)({title:"",amount:"",dueDate:"",studentId:"",studentName:"",particulars:""});(0,a.useEffect)(()=>{A()},[]);let A=async()=>{k(!0);try{let e=await (0,g.apiFetch)("/invoices");j(e.feeInvoices||e.invoices||[])}catch(e){}finally{k(!1)}},M=async e=>{e.preventDefault();try{await (0,g.apiFetch)("/invoices",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...P,amount:parseFloat(P.amount)})})&&(z(!1),S({title:"",amount:"",dueDate:"",studentId:"",studentName:"",particulars:""}),A())}catch(e){}},T=(0,a.useMemo)(()=>x.reduce((e,t)=>e+t.amount,0),[x]),I=(0,a.useMemo)(()=>x.reduce((e,t)=>e+(t.paidAmount??0),0),[x]),F=Math.max(T-I,0);return(0,t.jsxs)("div",{className:"space-y-6 pb-20",children:[(0,t.jsxs)("header",{className:"flex items-center gap-2",children:[(0,t.jsx)(b.default,{}),(0,t.jsx)("div",{className:"flex-1",children:(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1",children:"Financial Overview"}),(0,t.jsx)("h1",{className:"text-2xl font-bold text-slate-900 tracking-tight",children:"Fees & Invoices"})]}),e?.role==="admin"&&(0,t.jsx)("button",{onClick:()=>z(!0),className:"w-10 h-10 bg-academy-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-academy-orange-100",children:(0,t.jsx)(o.Plus,{size:24})})]})})]}),(0,t.jsxs)("div",{className:"grid grid-cols-3 gap-3",children:[(0,t.jsx)("div",{className:"bg-white rounded-2xl border border-slate-100 p-4 min-w-0",children:(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("div",{className:"w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0",children:(0,t.jsx)(l.Coins,{size:16,className:"text-blue-500"})}),(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[8px] font-bold text-slate-400 uppercase tracking-wider",children:"Total"}),(0,t.jsx)("p",{className:"text-sm font-black text-slate-800 truncate",children:v(T)})]})]})}),(0,t.jsx)("div",{className:"bg-white rounded-2xl border border-slate-100 p-4 min-w-0",children:(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("div",{className:"w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0",children:(0,t.jsx)(n.CheckCircle,{size:16,className:"text-emerald-500"})}),(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[8px] font-bold text-slate-400 uppercase tracking-wider",children:"Paid"}),(0,t.jsx)("p",{className:"text-sm font-black text-emerald-600 truncate",children:v(I)})]})]})}),(0,t.jsx)("div",{className:"bg-white rounded-2xl border border-slate-100 p-4 min-w-0",children:(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsx)("div",{className:`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${F>0?"bg-red-50":"bg-emerald-50"}`,children:(0,t.jsx)(r.AlertCircle,{size:16,className:F>0?"text-red-500":"text-emerald-500"})}),(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("p",{className:"text-[8px] font-bold text-slate-400 uppercase tracking-wider",children:"Due"}),(0,t.jsx)("p",{className:`text-sm font-black truncate ${F>0?"text-red-600":"text-emerald-600"}`,children:v(F)})]})]})})]}),(0,t.jsx)(i.AnimatePresence,{children:$&&(0,t.jsxs)(s.motion.div,{initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.95},className:"bg-white p-6 rounded-2xl border border-academy-orange-100 shadow-sm",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between mb-4",children:[(0,t.jsx)("h3",{className:"font-bold text-slate-800",children:"Create Invoice"}),(0,t.jsx)("button",{onClick:()=>z(!1),className:"p-2 text-slate-400",children:(0,t.jsx)(c.X,{size:18})})]}),(0,t.jsxs)("form",{onSubmit:M,className:"space-y-4",children:[(0,t.jsx)("input",{placeholder:"Invoice Title",required:!0,value:P.title,onChange:e=>S({...P,title:e.target.value}),className:"w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"}),(0,t.jsx)("input",{placeholder:"Amount (Rs.)",type:"number",required:!0,value:P.amount,onChange:e=>S({...P,amount:e.target.value}),className:"w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"}),(0,t.jsx)("input",{placeholder:"Due Date",type:"date",value:P.dueDate,onChange:e=>S({...P,dueDate:e.target.value}),className:"w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"}),(0,t.jsx)("input",{placeholder:"Student ID",value:P.studentId,onChange:e=>S({...P,studentId:e.target.value}),className:"w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"}),(0,t.jsx)("input",{placeholder:"Student Name",value:P.studentName,onChange:e=>S({...P,studentName:e.target.value}),className:"w-full bg-slate-50 border-transparent focus:ring-2 focus:ring-academy-orange-600 rounded-2xl p-4 text-sm font-medium"}),(0,t.jsx)("button",{type:"submit",className:"w-full bg-academy-orange-600 text-white py-4 rounded-2xl font-bold text-sm",children:"Create Invoice"})]})]})}),(0,t.jsx)("div",{className:"space-y-3",children:N?(0,t.jsx)("div",{className:"text-center py-20 opacity-40",children:(0,t.jsx)("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mx-auto"})}):x.length>0?x.map((e,a)=>{var l,o;let c=e.paidAmount??0,x=Math.max(e.amount-c,0),f=D===e.id;return(0,t.jsxs)(s.motion.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.05*a},className:"bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden",children:[(0,t.jsxs)("div",{className:"p-4 flex items-start gap-3 cursor-pointer",onClick:()=>C(f?null:e.id),children:[(0,t.jsx)("div",{className:"w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 mt-0.5",children:(0,t.jsx)(m,{size:16,className:"text-slate-400"})}),(0,t.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,t.jsx)("h3",{className:"font-bold text-slate-900 text-sm leading-tight",children:e.title}),(0,t.jsx)("p",{className:"text-[10px] text-slate-400 font-bold mt-0.5 truncate",children:e.receiptNo?e.receiptNo:w(e.dueDate)}),(0,t.jsxs)("div",{className:"flex items-center gap-1 mt-1",children:[(e=>{switch(e){case"paid":return(0,t.jsx)(n.CheckCircle,{size:14,className:"text-emerald-500"});case"overdue":return(0,t.jsx)(r.AlertCircle,{size:14,className:"text-red-500"});default:return(0,t.jsx)(d.Clock,{size:14,className:"text-amber-500"})}})(e.status),(0,t.jsx)("span",{className:`text-[9px] font-black uppercase tracking-wider ${"paid"===(l=e.status)?"bg-emerald-50 text-emerald-700":"partial"===l?"bg-amber-50 text-amber-700":"overdue"===l?"bg-red-50 text-red-700":"bg-slate-50 text-slate-600"}`,children:"paid"===(o=e.status)?"Paid":"partial"===o?"Partial":"overdue"===o?"Overdue":"Unpaid"})]})]}),(0,t.jsx)("div",{className:"text-right shrink-0 pl-2",children:(0,t.jsx)("p",{className:"font-black text-slate-900 text-sm whitespace-nowrap",children:v(e.amount)})}),(0,t.jsx)("div",{className:"text-slate-300 shrink-0",children:f?(0,t.jsx)(u,{size:14}):(0,t.jsx)(h,{size:14})})]}),(0,t.jsx)(i.AnimatePresence,{children:f&&(0,t.jsx)(s.motion.div,{initial:{height:0,opacity:0},animate:{height:"auto",opacity:1},exit:{height:0,opacity:0},className:"overflow-hidden",children:(0,t.jsxs)("div",{className:"px-4 pb-4 border-t border-slate-50",children:[(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-x-3 gap-y-2 mt-3 text-[11px]",children:[e.receiptNo&&(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Receipt: "}),(0,t.jsx)("span",{className:"text-slate-700 break-all",children:e.receiptNo})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Due: "}),(0,t.jsx)("span",{className:"text-slate-700",children:w(e.dueDate)})]}),e.studentName&&(0,t.jsxs)("div",{className:"min-w-0",children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Student: "}),(0,t.jsx)("span",{className:"text-slate-700 truncate inline-block max-w-[140px] align-bottom",children:e.studentName})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Paid: "}),(0,t.jsx)("span",{className:"text-emerald-600 font-bold whitespace-nowrap",children:v(c)})]}),e.month&&(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Month: "}),(0,t.jsx)("span",{className:"text-slate-700",children:e.month})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Balance: "}),(0,t.jsx)("span",{className:`font-bold whitespace-nowrap ${x>0?"text-red-600":"text-emerald-600"}`,children:v(x)})]}),e.particulars&&(0,t.jsxs)("div",{className:"col-span-2 min-w-0",children:[(0,t.jsx)("span",{className:"text-slate-400 font-bold",children:"Particulars: "}),(0,t.jsx)("span",{className:"text-slate-700 break-words",children:e.particulars})]})]}),e.transactions&&e.transactions.length>0&&(0,t.jsxs)("div",{className:"mt-3",children:[(0,t.jsx)("p",{className:"text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5",children:"Payment History"}),(0,t.jsx)("div",{className:"flex flex-wrap gap-x-4 gap-y-1",children:e.transactions.map((e,a)=>(0,t.jsxs)("span",{className:"inline-flex items-center gap-1 text-[11px] text-slate-600",children:[(0,t.jsx)("span",{className:"w-1.5 h-1.5 rounded-full bg-emerald-500"}),v(e.paidAmount)," via ",e.paymentMode," on ",w(e.paidDate)]},a))})]}),("paid"===e.status||"partial"===e.status)&&(0,t.jsxs)("button",{onClick:t=>{t.stopPropagation(),function(e){let t=window.open("","_blank","width=900,height=800,scrollbars=yes");if(!t)return;let a=e.paidAmount??0,s=Math.max(e.amount-a,0),i=e.receiptNo||e.id,l=`${window.location.origin}/stpl.jpeg`,n=`${window.location.origin}/founder-sign.png`,d=e.transactions??[],r=new Date,o=r.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})+", "+r.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),c=function(e){if(0===e)return"Zero Rupees Only";let t=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],a=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];function s(e){let s="";return e>=100&&(s+=t[Math.floor(e/100)]+" Hundred ",e%=100),e>=20&&(s+=a[Math.floor(e/10)]+" ",e%=10),e>0&&(s+=t[e]+" "),s.trim()}let i=Math.floor(e/1e7),l=Math.floor((e%=1e7)/1e5),n=Math.floor((e%=1e5)/1e3);e%=1e3;let d="";return i&&(d+=s(i)+" Crore "),l&&(d+=s(l)+" Lakh "),n&&(d+=s(n)+" Thousand "),e>0&&(d+=s(e)+" "),d.trim()+" Rupees Only"}(e.amount),p={paid:"background:#d1fae5;color:#065f46;border:1px solid #a7f3d0;",partial:"background:#dbeafe;color:#1e40af;border:1px solid #93c5fd;",unpaid:"background:#fef3c7;color:#92400e;border:1px solid #fcd34d;",overdue:"background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;"},x=p[e.status]??p.unpaid,m={paid:"PAID",partial:"PAID (Partially)",unpaid:"UNPAID",overdue:"OVERDUE"}[e.status]??"UNPAID",h="#0f1f45",u=`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fee Receipt - ${y(i)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; overflow-x: hidden; }
    body { padding: 16px; background: #e5e7eb; color: #111827; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .receipt-wrap { max-width: 850px; width: 100%; margin: 0 auto; background: #fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .receipt-box { border: 1.5px solid ${h}; margin: 8px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; overflow: hidden; }
    .sec-head { background: ${h} !important; color: #fff !important; padding: 6px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; white-space: nowrap; }
    .detail-cell { flex: 1; display: flex; padding: 6px 10px; align-items: center; min-width: 0; overflow: hidden; }
    .detail-cell:first-child { border-right: 1px solid #d1d5db; }
    .detail-lbl { width: 100px; font-weight: 700; color: #374151; white-space: nowrap; flex-shrink: 0; font-size: 11px; }
    .detail-sep { margin: 0 4px; color: #9ca3af; flex-shrink: 0; }
    .detail-val { color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; }
    .fee-th { border: 1px solid #d1d5db; padding: 6px 8px; background: ${h} !important; color: #fff !important; font-weight: 600; text-align: center; font-size: 11px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; white-space: nowrap; }
    .fee-td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: center; font-size: 12px; word-break: break-word; }
    .hist-th { padding: 6px 8px; border: 1px solid #d1d5db; background: #f1f5f9 !important; font-size: 11px; text-align: center; font-weight: 700; color: #334155; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; white-space: nowrap; }
    .hist-td { padding: 6px 8px; border: 1px solid #d1d5db; text-align: center; font-size: 12px; word-break: break-word; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; white-space: nowrap; }
    .print-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; background: ${h} !important; color: #fff !important; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; margin-bottom: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .fee-table-wrap { overflow-x: auto; width: 100%; }
    @media print {
      html, body { width: 100%; overflow: visible; padding: 0; background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .print-btn { display: none !important; }
      .receipt-wrap { margin: 0; border: none; max-width: none; width: 100%; }
      .receipt-box { margin: 0; border: none; }
      .receipt-box img { width: 100% !important; height: auto !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .detail-val, .fee-td, .hist-td { white-space: normal !important; word-break: break-word !important; overflow: visible !important; }
    }
  </style>
</head>
<body>
  <div style="max-width:850px;width:100%;margin:0 auto;">
    <button class="print-btn" onclick="window.print();">Print Receipt</button>
  </div>
  <div class="receipt-wrap">
    <div class="receipt-box">
      <div style="width:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
        <img src="${y(l)}" alt="Smart Tutors" style="width:100%;display:block;height:auto;" />
      </div>
      <div style="padding:16px 20px;">
        <div style="text-align:center;font-size:20px;font-weight:900;color:${h};margin:10px 0 12px;letter-spacing:0.08em;">FEE RECEIPT</div>
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#1e293b;margin-bottom:12px;flex-wrap:wrap;gap:4px;">
          <div><span>Receipt No.</span><span style="margin:0 6px;">:</span><span style="font-weight:500;color:#475569;">${y(i)}</span></div>
          <div><span>Receipt Date</span><span style="margin:0 6px;">:</span><span style="font-weight:500;color:#475569;">${y(w(e.createdAt||e.dueDate))}</span></div>
        </div>
        <div class="sec-head">Student Details</div>
        <div style="border:1px solid #d1d5db;font-size:12px;margin-bottom:14px;">
          <div style="display:flex;border-bottom:1px solid #d1d5db;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Student Name</span><span class="detail-sep">:</span><span class="detail-val">${y(e.studentName||"—")}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Parent Name</span><span class="detail-sep">:</span><span class="detail-val">${y(e.parentName||"—")}</span></div>
          </div>
          <div style="display:flex;border-bottom:1px solid #d1d5db;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Class / Board</span><span class="detail-sep">:</span><span class="detail-val">${y(e.classCourse||"—")}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Enrollment No.</span><span class="detail-sep">:</span><span class="detail-val">${y((e.studentId||"—").replace("-","").substring(0,8).toUpperCase())}</span></div>
          </div>
          <div style="display:flex;border-bottom:1px solid #d1d5db;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Academic Year</span><span class="detail-sep">:</span><span class="detail-val">${y(e.academicYear||"—")}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Payment Mode</span><span class="detail-sep">:</span><span class="detail-val">${y(e.paymentMode||"—")}</span></div>
          </div>
          <div style="display:flex;">
            <div class="detail-cell" style="border-right:1px solid #d1d5db;"><span class="detail-lbl">Mobile No.</span><span class="detail-sep">:</span><span class="detail-val">${y(e.mobileNo||"—")}</span></div>
            <div class="detail-cell"><span class="detail-lbl">Invoice ID</span><span class="detail-sep">:</span><span class="detail-val">${y(e.id||"—")}</span></div>
          </div>
        </div>
        <div class="sec-head">Fee Details</div>
        <div class="fee-table-wrap">
          <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #d1d5db;table-layout:fixed;">
            <thead>
              <tr>
                <th class="fee-th" style="width:36px;">#</th>
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
                <td class="fee-td" style="text-align:left;font-weight:600;">${y(e.title||"Fee")}${e.particulars?" — "+y(e.particulars):""}</td>
                <td class="fee-td">${y(e.month||"—")}</td>
                <td class="fee-td">${y(w(e.dueDate))}</td>
                <td class="fee-td" style="text-align:right;font-weight:700;">${y(v(e.amount))}</td>
                <td class="fee-td" style="text-align:right;font-weight:700;">${y(v(a))}</td>
                <td class="fee-td" style="text-align:right;font-weight:700;color:${s>0?"#dc2626":"#16a34a"};">${y(v(s))}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;padding:8px 10px;background:#f8fafc !important;border:1px solid #d1d5db;border-top:none;margin-bottom:14px;-webkit-print-color-adjust:exact;print-color-adjust:exact;flex-wrap:wrap;">
          <span style="color:#374151;white-space:nowrap;">Amount in Words :</span>
          <span style="color:#475569;font-weight:500;word-break:break-word;">${y(c)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;color:#1e293b;padding:8px 2px;border-top:2px solid ${h};margin-bottom:4px;flex-wrap:wrap;gap:6px;">
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="color:#64748b;">Status</span><span style="color:#9ca3af;margin:0 2px;">:</span>
            <span class="badge" style="${x}">${y(m)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="color:#64748b;">Paid</span><span style="color:#9ca3af;margin:0 2px;">:</span>
            <span style="font-weight:800;color:#16a34a;">${y(v(a))}</span>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="color:#64748b;">Balance</span><span style="color:#9ca3af;margin:0 2px;">:</span>
            <span style="font-weight:800;color:${s>0?"#dc2626":"#16a34a"};">${y(v(s))}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;font-size:11px;font-weight:700;color:#1e293b;padding:4px 2px 12px;border-bottom:1px solid #e5e7eb;margin-bottom:16px;flex-wrap:wrap;">
          <div><span style="color:#64748b;">Due</span><span style="color:#d1d5db;margin:0 4px;">:</span><span>${y(w(e.dueDate))}</span></div>
          <span style="color:#d1d5db;">|</span>
          <div><span style="color:#64748b;">Printed</span><span style="color:#d1d5db;margin:0 4px;">:</span><span>${y(o)}</span></div>
        </div>
        ${function(){if(!d.length)return"";let e=d.map((e,t)=>`
      <tr>
        <td class="hist-td">${t+1}</td>
        <td class="hist-td">${y(w(e.paidDate))}</td>
        <td class="hist-td" style="text-align:right;font-weight:700;">${y(v(e.paidAmount))}</td>
        <td class="hist-td">${y(e.paymentMode)}</td>
        <td class="hist-td">${y(e.transactionId||e.chequeNumber||"-")}</td>
        <td class="hist-td">${y(e.bankName||"-")}</td>
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
      <div style="display:flex;justify-content:space-between;align-items:flex-end;padding:14px 20px 0;border-top:2px solid ${h};margin-top:12px;min-height:100px;flex-wrap:wrap;gap:16px;">
        <div style="max-width:50%;font-size:10px;font-weight:600;color:#64748b;min-width:200px;">
          <p style="margin:2px 0;">This is a computer-generated receipt and does not require a physical signature.</p>
          <p style="margin:2px 0;font-weight:800;color:#1e293b;font-size:11px;">FEES ONCE PAID ARE NON-REFUNDABLE UNDER ANY CIRCUMSTANCES.</p>
          <p style="margin:6px 2px 2px;">Thank you for choosing Smart Tutors Pvt. Ltd.</p>
          <p style="margin:2px 0;">We appreciate your trust.</p>
        </div>
        <div style="text-align:center;width:180px;">
          <img src="${y(n)}" alt="Founder Signature" style="display:block;width:160px;height:56px;margin:0 auto 6px;object-fit:contain;" />
          <div style="border-top:1.5px solid #334155;margin-top:4px;padding-top:4px;">
            <div style="font-size:12px;font-weight:800;color:#1e293b;">Mr. Ravi Rana</div>
            <div style="font-size:10px;color:#64748b;margin-top:1px;">Director &amp; Founder</div>
            <div style="font-size:10px;color:#64748b;margin-top:1px;">Smart Tutors Pvt. Ltd.</div>
          </div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:#94a3b8;padding:8px 20px 10px;flex-wrap:wrap;gap:4px;">
        <span>Smart Tutors Pvt. Ltd. | CIN: U80100MH2019PTC321658</span>
        <span>www.smarttutors.co.in</span>
      </div>
    </div>
  </div>
</body>
</html>`;t.document.write(u),t.document.close()}(e)},className:"mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold",children:[(0,t.jsx)(p.Download,{size:16}),"View & Print Receipt"]})]})})})]},e.id||a)}):(0,t.jsxs)("div",{className:"text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed",children:[(0,t.jsx)(l.Coins,{size:48,className:"mx-auto text-slate-200 mb-4"}),(0,t.jsx)("p",{className:"text-slate-400 text-xs font-bold uppercase tracking-widest",children:"No invoices found"})]})})]})}],74337)}]);