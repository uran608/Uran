(() => {
  const configured = () => window.SU_SUPABASE_CONFIG && /^https:\/\//.test(window.SU_SUPABASE_CONFIG.url || "") && window.SU_SUPABASE_CONFIG.anonKey && !window.SU_SUPABASE_CONFIG.url.includes("YOUR_") && !window.SU_SUPABASE_CONFIG.anonKey.includes("YOUR_");
  async function load() {
    const fallback = window.SU_DATA;
    if (!configured() || !window.supabase?.createClient) return fallback;
    try {
      const client = window.supabase.createClient(window.SU_SUPABASE_CONFIG.url, window.SU_SUPABASE_CONFIG.anonKey);
      const { data: rows, error } = await client.from("site_content").select("*").eq("published", true).order("updated_at", { ascending: false });
      if (error || !rows) { console.warn("Students Uran live content unavailable; showing built-in content.", error); return fallback; }
      const mapped = { universities: [], scholarships: [], updates: [], guides: { ...fallback.guides } };
      for (const r of rows) {
        if (r.section === "universities") mapped.universities.push({ name:r.title, city:r.city||"Pakistan", type:r.institution_type||"University", symbol:(r.title||"SU").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase(), areas:Array.isArray(r.tags)?r.tags:[], description:r.body||"", url:r.url||"https://www.hec.gov.pk/" });
        if (r.section === "scholarships") mapped.scholarships.push({ name:r.title, provider:r.subtitle||"See official provider", level:r.study_level||"Undergraduate", funding:r.funding_type||"Check details", summary:r.body||"", tags:Array.isArray(r.tags)?r.tags:[], url:r.url||"https://www.hec.gov.pk/" });
        if (r.section === "updates") mapped.updates.push({ label:r.subtitle||"ADMISSION UPDATE", title:r.title, summary:r.body||"", url:r.url||"https://www.hec.gov.pk/" });
        if (r.section === "guides") mapped.guides[r.slug||r.id] = { title:r.title, intro:r.subtitle||"", steps:Array.isArray(r.tags)?r.tags:((r.body||"").split("\n").filter(Boolean)) };
      }
      // Use each live section only when it contains published records; preserve the starter section otherwise.
      return { universities:mapped.universities.length?mapped.universities:fallback.universities, scholarships:mapped.scholarships.length?mapped.scholarships:fallback.scholarships, updates:mapped.updates.length?mapped.updates:fallback.updates, guides:Object.keys(mapped.guides).length?mapped.guides:fallback.guides };
    } catch (e) { console.warn("Students Uran live content unavailable; showing built-in content.", e); return fallback; }
  }
  window.SU_LIVE = { load };
})();
