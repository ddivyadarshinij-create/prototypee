// Shared data and helper code for all Unified Health ID pages.
// Keep this file in the same folder as the .html files.

const STORAGE_KEY = "unifiedHealthPrototype_v1";
const DEMO_VERSION = 2;
const DOCTOR_REG_NO = "MED-DOC-001";

function loadDB(){
  try{
    const db = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(db && db.patients && typeof db.patients === "object") return db;
  }catch(error){}
  return {patients:{}};
}

function saveDB(db){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function escapeHTML(value){
  return String(value ?? "").replace(/[&<>"']/g, function(char){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
  });
}

function clone(obj){
  return JSON.parse(JSON.stringify(obj));
}

// ---------- Frequency options used in the doctor's form ----------
const F = {
  M:"Morning (1-0-0)",
  A:"Afternoon (0-1-0)",
  N:"Night (0-0-1)",
  MN:"Morning & Night (1-0-1)",
  T:"Three times a day (1-1-1)",
  W:"Once a week",
  S:"As needed (SOS)"
};
const FREQUENCY_OPTIONS = [F.M, F.A, F.N, F.MN, F.T, F.W, F.S];

// Plain-text version of the medicine table (kept for older code/records).
function itemsToText(items){
  return items.map(function(m){
    const left = [m.name, m.dose].filter(Boolean).join(" ");
    const right = [m.frequency, m.duration, m.notes].filter(Boolean).join(", ");
    return right ? left + " - " + right : left;
  }).join("\n");
}

function med(name, dose, frequency, duration, notes){
  return {name:name, dose:dose, frequency:frequency, duration:duration, notes:notes};
}

function rxRecord(date, diagnosis, items, advice){
  return {
    date:date,
    diagnosis:diagnosis,
    items:items,
    medicines:itemsToText(items),
    advice:advice
  };
}

// ---------- Sample patients ----------
const DEMO_PATIENTS = [
  {
    id:"10001", fullName:"Aarav Kumar", age:35, gender:"Male",
    bloodGroup:"O+", contact:"9000000001", address:"Chennai",
    emergency:"9000000002", allergies:"None", reports:[],
    prescriptions:[
      rxRecord("05/08/2026", "Seasonal viral fever", [
        med("Paracetamol", "500 mg", F.T, "3 days", "After food"),
        med("Cetirizine", "10 mg", F.N, "5 days", "After food")
      ], "Take rest and drink plenty of fluids. Review if the fever lasts more than 3 days."),
      rxRecord("18/09/2026", "Acid reflux (gastritis)", [
        med("Pantoprazole", "40 mg", F.M, "14 days", "Before breakfast"),
        med("Antacid syrup", "10 ml", F.S, "As needed", "After meals")
      ], "Avoid spicy and oily food. Do not skip meals.")
    ]
  },
  {
    id:"10002", fullName:"Meera Devi", age:42, gender:"Female",
    bloodGroup:"B+", contact:"9000000003", address:"Puducherry",
    emergency:"9000000004", allergies:"None", reports:[],
    prescriptions:[
      rxRecord("12/07/2026", "Type 2 diabetes - routine follow-up", [
        med("Metformin", "500 mg", F.MN, "30 days", "After meals")
      ], "Follow a low-sugar diet and walk for 30 minutes daily. Repeat fasting blood sugar test after one month."),
      rxRecord("29/09/2026", "Vitamin D deficiency", [
        med("Vitamin D3", "60,000 IU", F.W, "8 weeks", "After food"),
        med("Calcium", "500 mg", F.A, "60 days", "After lunch")
      ], "Get morning sunlight for 15 minutes every day.")
    ]
  },
  {
    id:"10003", fullName:"Rohan Sharma", age:28, gender:"Male",
    bloodGroup:"A+", contact:"9000000005", address:"Coimbatore",
    emergency:"9000000006", allergies:"Penicillin", reports:[],
    prescriptions:[
      rxRecord("20/08/2026", "Throat infection", [
        med("Azithromycin", "500 mg", F.M, "3 days", "After food"),
        med("Paracetamol", "500 mg", F.S, "As needed", "For pain, maximum 3 tablets a day")
      ], "Gargle with warm salt water three times a day. Avoid cold drinks."),
      rxRecord("10/10/2026", "Lower back pain", [
        med("Diclofenac", "50 mg", F.MN, "5 days", "After food"),
        med("Pain relief ointment", "Apply locally", F.MN, "5 days", "Apply on the affected area")
      ], "Avoid lifting heavy weights. Gentle stretching exercises are recommended.")
    ]
  },
  {
    id:"10004", fullName:"Lakshmi Narayanan", age:56, gender:"Female",
    bloodGroup:"AB+", contact:"9000000007", address:"Madurai",
    emergency:"9000000008", allergies:"None", reports:[],
    prescriptions:[
      rxRecord("03/08/2026", "Hypertension - follow-up", [
        med("Amlodipine", "5 mg", F.M, "30 days", "Take at the same time every day")
      ], "Reduce salt intake. Check blood pressure weekly and bring the readings to the next visit."),
      rxRecord("21/10/2026", "Knee joint pain (osteoarthritis)", [
        med("Paracetamol", "650 mg", F.MN, "7 days", "After food"),
        med("Pain relief gel", "Apply locally", F.MN, "7 days", "Apply on both knees")
      ], "Do light exercise and avoid sitting in one position for long periods.")
    ]
  },
  {
    id:"10005", fullName:"Ananya Iyer", age:8, gender:"Female",
    bloodGroup:"O-", contact:"9000000009", address:"Chennai",
    emergency:"9000000010", allergies:"Dust", reports:[],
    prescriptions:[
      rxRecord("14/09/2026", "Dust allergy with cold", [
        med("Cetirizine syrup", "As per weight", F.N, "5 days", "Before sleep"),
        med("Saline nasal drops", "2 drops each nostril", F.T, "5 days", "For nasal use only")
      ], "Keep the child away from dust. Give plenty of warm fluids."),
      rxRecord("02/10/2026", "Mild fever", [
        med("Paracetamol syrup", "As per weight", F.S, "Only if fever persists", "Dose as advised by the doctor"),
        med("Oral rehydration solution", "As per sachet", F.S, "Until recovered", "Small sips through the day")
      ], "Light diet and rest. Visit the doctor if the fever continues for more than 2 days.")
    ]
  }
];

// Adds the sample patients once. Replaces older plain-text sample
// prescriptions with the new table format. Doctor-added ones are kept.
function seedDemoPatients(){
  const db = loadDB();
  if(db.demoVersion === DEMO_VERSION) return;

  DEMO_PATIENTS.forEach(function(demo){
    const existing = db.patients[demo.id];

    if(!existing){
      db.patients[demo.id] = clone(demo);
      return;
    }
    if(existing.fullName !== demo.fullName) return;

    const keys = demo.prescriptions.map(function(p){
      return p.date + "|" + p.diagnosis;
    });
    const kept = (existing.prescriptions || []).filter(function(p){
      return keys.indexOf(p.date + "|" + p.diagnosis) === -1;
    });
    existing.prescriptions = clone(demo.prescriptions).concat(kept);
  });

  db.demoVersion = DEMO_VERSION;
  db.demoSeeded = true;
  saveDB(db);
}

// ---------- Paper-style prescription ----------
function prescriptionHTML(p, patient, index){
  let table;

  if(Array.isArray(p.items) && p.items.length){
    table =
      '<div class="rx-table-wrap"><table class="rx-table"><thead><tr>' +
      '<th>#</th><th>Medicine</th><th>Dose</th><th>Frequency</th>' +
      '<th>Duration</th><th>Instructions</th></tr></thead><tbody>' +
      p.items.map(function(m, i){
        return '<tr><td>' + (i + 1) + '</td>' +
          '<td><strong>' + escapeHTML(m.name) + '</strong></td>' +
          '<td>' + escapeHTML(m.dose || "-") + '</td>' +
          '<td>' + escapeHTML(m.frequency || "-") + '</td>' +
          '<td>' + escapeHTML(m.duration || "-") + '</td>' +
          '<td>' + escapeHTML(m.notes || "-") + '</td></tr>';
      }).join("") +
      '</tbody></table></div>';
  }else{
    // Older records saved as plain text lines.
    const lines = String(p.medicines || "").split("\n").filter(function(l){
      return l.trim() !== "";
    });
    table =
      '<div class="rx-table-wrap"><table class="rx-table"><thead><tr>' +
      '<th>#</th><th>Medicine</th><th>Directions</th></tr></thead><tbody>' +
      (lines.length ? lines.map(function(line, i){
        const cut = line.indexOf(" - ");
        const name = cut > -1 ? line.slice(0, cut) : line;
        const details = cut > -1 ? line.slice(cut + 3) : "-";
        return '<tr><td>' + (i + 1) + '</td>' +
          '<td><strong>' + escapeHTML(name.trim()) + '</strong></td>' +
          '<td>' + escapeHTML(details.trim()) + '</td></tr>';
      }).join("") : '<tr><td colspan="3">No medicines listed.</td></tr>') +
      '</tbody></table></div>';
  }

  return '<div class="rx-paper">' +
    '<div class="rx-head">' +
      '<div><div class="rx-clinic">Unified Health ID</div>' +
      '<div class="rx-sub">Digital Prescription</div></div>' +
      '<div class="rx-symbol">&#8478;</div>' +
    '</div>' +
    '<div class="rx-meta">' +
      '<div><span>Patient:</span> ' + escapeHTML(patient.fullName) + '</div>' +
      '<div><span>Patient ID:</span> ' + escapeHTML(patient.id) + '</div>' +
      '<div><span>Age / Gender:</span> ' + escapeHTML(patient.age) + ' / ' + escapeHTML(patient.gender) + '</div>' +
      '<div><span>Date:</span> ' + escapeHTML(p.date || "-") + '</div>' +
      '<div><span>Blood Group:</span> ' + escapeHTML(patient.bloodGroup) + '</div>' +
      '<div><span>Rx No:</span> ' + (index + 1) + '</div>' +
    '</div>' +
    '<div class="rx-diag"><span>Diagnosis:</span> ' + escapeHTML(p.diagnosis || "Not provided") + '</div>' +
    table +
    '<div class="rx-advice"><span>Doctor\'s Advice:</span> ' +
      escapeHTML(p.advice || "None").replace(/\n/g, "<br>") + '</div>' +
    '<div class="rx-foot"><div class="rx-sign"><div class="rx-line"></div>' +
      'Doctor\'s Signature<br>Reg. No: ' + escapeHTML(DOCTOR_REG_NO) + '</div></div>' +
  '</div>';
}

// ---------- Styles for the prescription paper and the add-form table ----------
(function(){
  const css =
    '.rx-paper{background:#fffef8;border:1px solid #d8d2b8;border-radius:6px;padding:22px;margin-top:16px;box-shadow:0 3px 12px #00000012;color:#203a40;text-align:left}' +
    '.rx-head{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #147d78;padding-bottom:10px;margin-bottom:12px}' +
    '.rx-clinic{font-size:20px;font-weight:bold;color:#147d78}' +
    '.rx-sub{font-size:12px;color:#63787b;letter-spacing:1px;text-transform:uppercase;margin-top:3px}' +
    '.rx-symbol{font-size:40px;color:#147d78;font-family:Georgia,serif;font-weight:bold;line-height:1}' +
    '.rx-meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;font-size:14px;margin-bottom:12px;line-height:1.5}' +
    '.rx-meta span,.rx-diag span,.rx-advice span{color:#63787b;font-weight:bold}' +
    '.rx-diag{font-size:14px;margin-bottom:12px;padding:8px 10px;background:#f3f8f6;border-left:3px solid #147d78;line-height:1.5}' +
    '.rx-table-wrap{overflow-x:auto}' +
    '.rx-table{width:100%;border-collapse:collapse;font-size:14px;min-width:520px}' +
    '.rx-table th{background:#eaf6f3;text-align:left;padding:8px;border:1px solid #cfe2dd;font-size:13px;color:#203a40}' +
    '.rx-table td{padding:8px;border:1px solid #dce9e7;vertical-align:top;color:#203a40;line-height:1.5}' +
    '.rx-advice{margin-top:14px;font-size:14px;line-height:1.6}' +
    '.rx-foot{display:flex;justify-content:flex-end;margin-top:28px}' +
    '.rx-sign{text-align:center;font-size:12px;color:#63787b;min-width:180px;line-height:1.6}' +
    '.rx-line{border-top:1px solid #203a40;margin-bottom:5px}' +
    '.rx-edit{min-width:780px}' +
    '.rx-edit td{padding:6px}' +
    '.rx-edit input,.rx-edit select{width:100%;padding:8px;font-size:14px;border:1px solid #cbdcda;border-radius:6px;background:#fff}' +
    '.rx-edit .rx-no{text-align:center;width:34px}' +
    '.rx-add{background:#fff;color:#147d78;border:1px solid #147d78}' +
    '.rx-add:hover{background:#eaf6f3}' +
    '.remove-row{margin-top:0;padding:7px 10px;background:#b8504d}' +
    '.remove-row:hover{background:#963f3c}' +
    '@media(max-width:600px){.rx-paper{padding:14px}.rx-meta{grid-template-columns:1fr}}';

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
})();

seedDemoPatients();