(async () => {
  const data = window.SU_LIVE ? await window.SU_LIVE.load() : window.SU_DATA;
  const $ = id => document.getElementById(id);
  const dialog = $("detailDialog");
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safeUrl = url => /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(url || "") ? url : "#";
  if ($("year")) $("year").textContent = new Date().getFullYear();
  if (dialog) {
    $("dialogClose").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", e => { if(e.target === dialog) dialog.close(); });
  }
  function openDialog(html) { if (!dialog) return; $("dialogContent").innerHTML = html; dialog.showModal(); }

  if ($("universityGrid")) {
    const uniGrid = $("universityGrid");
    [...new Set(data.universities.map(u => u.city))].sort().forEach(city => { const o=document.createElement("option");o.value=city;o.textContent=city;$("cityFilter").appendChild(o); });
    function renderUniversities() {
      const q=$("universitySearch").value.trim().toLowerCase(), city=$("cityFilter").value, type=$("typeFilter").value;
      const rows=data.universities.filter(u=>(!q||[u.name,u.city,...u.areas].join(" ").toLowerCase().includes(q))&&(!city||u.city===city)&&(!type||u.type===type));
      uniGrid.innerHTML=rows.map((u,i)=>`<article class="university-card"><div class="uni-art" style="background:linear-gradient(135deg,${["#1b466a,#7b9c85","#314d78,#b5a37b","#194d56,#92b5a2","#455477,#a6b5cb"][i%4]})"><span class="uni-symbol">${esc(u.symbol)}</span><span class="uni-type">${esc(u.type)}</span></div><div class="uni-body"><h3>${esc(u.name)}</h3><span class="uni-city">${esc(u.city)}, Pakistan</span><p>${esc(u.description)}</p><div class="tag-row">${u.areas.slice(0,3).map(a=>`<span class="tag">${esc(a)}</span>`).join("")}</div><button data-uni="${esc(u.name)}">View overview</button></div></article>`).join("");
      $("universityEmpty").classList.toggle("hidden",rows.length>0);
      uniGrid.querySelectorAll("[data-uni]").forEach(b=>b.addEventListener("click",()=>{const u=data.universities.find(x=>x.name===b.dataset.uni);openDialog(`<span class="kicker">UNIVERSITY OVERVIEW</span><h2>${esc(u.name)}</h2><div class="dialog-meta"><span class="tag">${esc(u.city)}</span><span class="tag">${esc(u.type)}</span>${u.areas.map(a=>`<span class="tag">${esc(a)}</span>`).join("")}</div><p>${esc(u.description)}</p><h3>Before applying</h3><ul><li>Confirm your intended program and campus.</li><li>Check the latest eligibility, fees, tests and deadlines.</li><li>Use the official admissions portal.</li></ul><a class="dialog-link" href="${safeUrl(u.url)}" target="_blank" rel="noopener noreferrer">Visit official website</a>`);}));
    }
    ["universitySearch","cityFilter","typeFilter"].forEach(id=>$(id).addEventListener(id==="universitySearch"?"input":"change",renderUniversities));
    renderUniversities();
  }
  if ($("scholarshipList")) {
    function renderScholarships() {
      const q=$("scholarshipSearch").value.trim().toLowerCase(),level=$("levelFilter").value,funding=$("fundingFilter").value;
      const rows=data.scholarships.filter(s=>(!q||[s.name,s.provider,s.summary,...s.tags].join(" ").toLowerCase().includes(q))&&(!level||s.level===level)&&(!funding||s.funding===funding));
      $("scholarshipList").innerHTML=rows.map(s=>`<article class="scholarship-card"><div class="scholarship-icon">SU</div><div><h3>${esc(s.name)}</h3><p>${esc(s.provider)} · ${esc(s.level)}</p><p>${esc(s.summary)}</p><div class="tag-row"><span class="tag">${esc(s.funding)}</span>${s.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div></div><button class="outline-button" data-scholarship="${esc(s.name)}">View details</button></article>`).join("");
      $("scholarshipEmpty").classList.toggle("hidden",rows.length>0);
      $("scholarshipList").querySelectorAll("[data-scholarship]").forEach(b=>b.addEventListener("click",()=>{const s=data.scholarships.find(x=>x.name===b.dataset.scholarship);openDialog(`<span class="kicker">FUNDING INFORMATION</span><h2>${esc(s.name)}</h2><div class="dialog-meta"><span class="tag">${esc(s.level)}</span><span class="tag">${esc(s.funding)}</span></div><p>${esc(s.summary)}</p><p><b>Provider:</b> ${esc(s.provider)}</p><h3>What to check</h3><ul><li>Whether a current application call is open.</li><li>Nationality, academic and degree-level eligibility.</li><li>Coverage, renewal conditions and official deadline.</li><li>Required documents and submission method.</li></ul><a class="dialog-link" href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">Check official source</a>`);}));
    }
    ["scholarshipSearch","levelFilter","fundingFilter"].forEach(id=>$(id).addEventListener(id==="scholarshipSearch"?"input":"change",renderScholarships));
    renderScholarships();
  }
  if ($("updatesGrid")) {
    $("updatesGrid").innerHTML=data.updates.map(u=>`<article class="update-card"><span class="update-date">${esc(u.label)}</span><h3>${esc(u.title)}</h3><p>${esc(u.summary)}</p><a href="${safeUrl(u.url)}" target="_blank" rel="noopener noreferrer">Check official source</a></article>`).join("");
  }
  if ($("guideGrid")) {
    const guideGrid=$("guideGrid");
    guideGrid.innerHTML=Object.entries(data.guides).map(([key,g],i)=>`<article class="guide-card"><span class="guide-number">${String(i+1).padStart(2,"0")}</span><div class="guide-icon">${String(i+1).padStart(2,"0")}</div><h3>${esc(g.title)}</h3><p>${esc(g.intro||"")}</p><button class="text-button guide-open" data-guide="${esc(key)}">Read guide</button></article>`).join("");
    guideGrid.querySelectorAll(".guide-open").forEach(b=>b.addEventListener("click",()=>{const g=data.guides[b.dataset.guide];openDialog(`<span class="kicker">STUDENTS URAN GUIDE</span><h2>${esc(g.title)}</h2><p>${esc(g.intro||"")}</p><ol>${(g.steps||[]).map(s=>`<li>${esc(s)}</li>`).join("")}</ol><p><b>Tip:</b> Follow the current official instructions for your institution or scholarship.</p>`);}));
  }
  const nav=$("mainNav"),toggle=$("menuToggle");
  if(nav&&toggle){toggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));toggle.textContent=open?"Close":"Menu";});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");toggle.setAttribute("aria-expanded","false");}));}
  // Homepage search routes to the relevant dedicated directory page.
  const searchForm=$("heroSearch");
  if(searchForm) searchForm.addEventListener("submit",e=>{e.preventDefault();const q=$("globalSearch").value.trim();if(!q)return;const target=/scholar|fund|grant|financial/i.test(q)?"scholarships.html":"universities.html";window.location.href=target+"?q="+encodeURIComponent(q);});
  const params=new URLSearchParams(window.location.search), q=params.get("q");
  if(q&&$("universitySearch")){$("universitySearch").value=q;$("universitySearch").dispatchEvent(new Event("input"));}
  if(q&&$("scholarshipSearch")){$("scholarshipSearch").value=q;$("scholarshipSearch").dispatchEvent(new Event("input"));}
})();