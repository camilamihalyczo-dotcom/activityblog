// CSS de las presentaciones. Todo va bajo `.dk` para no chocar con el resto
// del sitio. Cada slide mide exactamente una hoja A4 (horizontal para las
// clases, vertical para los glosarios) a 96 dpi, así lo que se ve en
// pantalla es lo mismo que sale al imprimir / guardar como PDF.
export const DECK_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@1,700;1,900&family=Space+Mono:wght@400;700&family=Work+Sans:wght@400;500;600;700&family=Inter:wght@600;700;800&family=Poppins:wght@400;500;600;700&display=swap'

export const DECK_CSS = `
.dk{--w:1123px;--h:794px;color:var(--ink);font-family:var(--f-body);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.dk.dk--portrait{--w:794px;--h:1123px}
.dk *{box-sizing:border-box}
.dk-slide{position:relative;width:var(--w);height:var(--h);overflow:hidden;background:var(--bg);display:flex;flex-direction:column;padding:56px 64px 40px}
.dk--portrait .dk-slide{padding:52px 56px 36px}
.dk-slide + .dk-slide{margin-top:28px}
.dk-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding-bottom:14px;border-bottom:var(--head-rule);margin-bottom:22px;flex-shrink:0}
.dk-kicker{font:700 12px/1.4 var(--f-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
.dk-title{font-family:var(--f-display);font-weight:var(--display-weight);text-transform:uppercase;letter-spacing:var(--display-track);font-size:var(--title-size);line-height:1;margin:0;color:var(--ink)}
.dk-title em{font-family:var(--f-accent);font-style:var(--accent-style);text-transform:none;color:var(--accent);letter-spacing:0;font-weight:var(--accent-weight)}
.dk-tag{flex-shrink:0;font:700 10.5px/1 var(--f-mono);letter-spacing:.12em;text-transform:uppercase;padding:7px 11px;border:var(--tag-border);border-radius:var(--r-pill);color:var(--ink);background:var(--paper)}
.dk-body{flex:1;min-height:0;display:flex;flex-direction:column;gap:16px;justify-content:var(--body-justify);overflow:hidden}
.dk-foot{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:12px;margin-top:14px;border-top:1px solid var(--line);font:400 10.5px/1.4 var(--f-mono);color:var(--muted);letter-spacing:.04em}
.dk-foot b{color:var(--accent)}
.dk-foot .dk-brand{display:flex;align-items:center;gap:8px}
.dk-foot svg{width:18px;height:18px}
.dk p{margin:0}
.dk-rt{font-size:15px;line-height:1.6;color:var(--ink-soft)}
.dk-rt p + p,.dk-rt p + ul,.dk-rt ul + p{margin-top:8px}
.dk-rt ul{margin:0;padding-left:20px;list-style:disc}
.dk-rt li + li{margin-top:3px}
.dk-rt strong{color:var(--ink);font-weight:700}
.dk-rt em{font-style:italic}
.dk-h{display:flex;align-items:center;gap:10px;font:700 12.5px/1.3 var(--f-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-top:2px}
.dk-h::before{content:'';width:9px;height:9px;border-radius:50%;background:var(--accent);flex-shrink:0}
.dk-grid{display:grid;gap:14px}
.dk-grid.c1{grid-template-columns:1fr}.dk-grid.c2{grid-template-columns:repeat(2,1fr)}.dk-grid.c3{grid-template-columns:repeat(3,1fr)}.dk-grid.c4{grid-template-columns:repeat(4,1fr)}
.dk-card{background:var(--paper);border:var(--card-border);border-top:var(--card-top);border-radius:var(--r-card);box-shadow:var(--card-shadow);padding:16px 18px;min-width:0}
.dk-pill{display:inline-block;font:700 10px/1 var(--f-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--accent);background:var(--accent-soft);padding:5px 8px;border-radius:var(--r-pill);margin-bottom:9px}
.dk-card-title{font-family:var(--f-card);font-weight:var(--card-weight);font-size:var(--card-title-size);line-height:1.15;color:var(--ink);margin-bottom:5px;letter-spacing:var(--card-track);text-transform:var(--card-case)}
.dk-card .dk-rt{font-size:13px;line-height:1.5}
.dk-road{display:flex;flex-direction:column;gap:9px}
.dk-road-row{display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:14px;background:var(--paper);border:var(--card-border);border-radius:var(--r-card);box-shadow:var(--card-shadow-sm);padding:12px 16px}
.dk-road-n{font:700 15px/1 var(--f-mono);color:var(--accent)}
.dk-road-t{font-weight:700;font-size:15px;color:var(--ink)}
.dk-road-d{font-size:12.5px;color:var(--muted);margin-top:2px}
.dk-cmp{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.dk-cmp-box{border-radius:var(--r-card);padding:16px 18px;border-left:5px solid}
.dk-cmp-box.bad{background:#FDECEC;border-color:#C0392B}
.dk-cmp-box.good{background:#E7F6EC;border-color:#1E8449}
.dk-cmp-label{font:700 10.5px/1.3 var(--f-mono);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
.dk-cmp-box.bad .dk-cmp-label{color:#A93226}.dk-cmp-box.good .dk-cmp-label{color:#1E8449}
.dk-cmp-quote{font-style:italic;font-size:16px;line-height:1.5;color:var(--ink)}
.dk-cmp-note{margin-top:10px;padding-top:10px;border-top:1px solid rgba(0,0,0,.1);font-size:12.5px;line-height:1.5;color:var(--ink-soft)}
.dk-call{background:var(--accent-soft);border:var(--call-border);border-radius:var(--r-card);padding:16px 20px}
.dk-call-label{font:700 11px/1.3 var(--f-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
.dk-call .dk-rt{font-size:15.5px;color:var(--ink)}
.dk-vocab{display:grid;gap:12px}
.dk-vocab.c2{grid-template-columns:repeat(2,1fr)}.dk-vocab.c3{grid-template-columns:repeat(3,1fr)}
.dk-word-top{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 8px;margin-bottom:3px}
.dk-word{font-family:var(--f-card);font-weight:var(--card-weight);font-size:var(--word-size);color:var(--ink);letter-spacing:var(--card-track);text-transform:var(--card-case);line-height:1.1}
.dk-phon{font:400 11px/1 var(--f-mono);color:var(--accent);background:var(--accent-soft);padding:4px 6px;border-radius:4px;white-space:nowrap}
.dk-trans{font:700 10.5px/1.35 var(--f-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--accent);margin-bottom:5px}
.dk-def{font-size:12.5px;line-height:1.45;color:var(--ink-soft)}
.dk-ex{margin-top:8px;padding:7px 10px;border-left:3px solid var(--accent);background:var(--bg);font-style:italic;font-size:12px;line-height:1.45;color:var(--ink)}
.dk-table{width:100%;border-collapse:separate;border-spacing:0;font-size:13.5px;background:var(--paper);border:var(--card-border);border-radius:var(--r-card);overflow:hidden}
.dk-table th{font:700 10.5px/1.3 var(--f-mono);letter-spacing:.1em;text-transform:uppercase;text-align:left;color:var(--paper);background:var(--table-head);padding:10px 14px}
.dk-table td{padding:10px 14px;border-top:1px solid var(--line);vertical-align:top;color:var(--ink-soft);line-height:1.45}
.dk-table td:first-child{font-weight:700;color:var(--ink)}
.dk-media{display:flex;flex-direction:column;align-items:center;gap:8px;min-height:0}
.dk-media img{max-width:100%;max-height:380px;object-fit:contain;border-radius:var(--r-card);border:var(--card-border)}
.dk--portrait .dk-media img{max-height:300px}
.dk-cap{font:400 11px/1.4 var(--f-mono);color:var(--muted);text-align:center}
.dk-video{position:relative;width:100%;max-width:640px;aspect-ratio:16/9;border-radius:var(--r-card);overflow:hidden;border:var(--card-border);background:#000}
.dk-video iframe{width:100%;height:100%;border:0}
.dk-video-print{display:none}
.dk-video-print img{width:100%;height:100%;object-fit:cover;opacity:.85}
.dk-video-print span{position:absolute;left:12px;bottom:10px;right:12px;color:#fff;font:700 11px/1.4 var(--f-mono);text-shadow:0 1px 3px rgba(0,0,0,.6);word-break:break-all}
.dk-empty{border:2px dashed var(--line);border-radius:var(--r-card);padding:24px;text-align:center;font:400 12px var(--f-mono);color:var(--muted)}
.dk-cover .dk-body{justify-content:center}
.dk-cover-kicker{font:700 13px/1.4 var(--f-mono);letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
.dk-cover-title{font-family:var(--f-display);font-weight:var(--display-weight);text-transform:uppercase;letter-spacing:var(--display-track);font-size:var(--cover-size);line-height:.95;margin:0 0 18px;color:var(--ink);max-width:880px}
.dk-cover-title em{font-family:var(--f-accent);font-style:var(--accent-style);text-transform:none;color:var(--accent);letter-spacing:0;font-weight:var(--accent-weight)}
.dk-cover-sub{font-size:17px;line-height:1.55;color:var(--ink-soft);max-width:760px;margin-bottom:18px}
.dk-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px}
.dk-meta span{font:700 10.5px/1 var(--f-mono);letter-spacing:.08em;text-transform:uppercase;padding:7px 10px;border:var(--tag-border);border-radius:var(--r-pill);background:var(--paper);color:var(--ink)}
.dk-logo{position:absolute;top:44px;right:56px;width:46px;height:46px}
.dk-overflow{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:5;background:#C0392B;color:#fff;font:700 11px/1 var(--f-mono);padding:6px 10px;border-radius:999px;letter-spacing:.06em}

.dk-er{display:flex;flex-direction:column;gap:10px}
.dk-er-row{background:var(--paper);border:var(--card-border);border-left:5px solid var(--er-c,var(--accent));border-radius:var(--r-card);box-shadow:var(--card-shadow-sm);padding:12px 16px}
.dk-er-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:4px}
.dk-er-rule{font:700 12.5px/1.3 var(--f-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--er-c,var(--accent))}
.dk-er-ok{font-size:15px;font-weight:700;line-height:1.45;color:var(--ink)}
.dk-er-ok strong{color:var(--er-c,var(--accent))}
.dk-er-bad{font-size:12.5px;line-height:1.45;color:#A93226;margin-top:4px}
.dk-er-bad i{font-style:italic}
.dk-er--say .dk-er-row{background:#EEF8F1;border-left-color:#1E8449}
.dk-er--say .dk-er-rule{color:#1E8449}
.dk-img-s img{max-height:200px}.dk-img-m img{max-height:320px}.dk-img-l img{max-height:440px}
.dk--portrait .dk-img-l img{max-height:520px}
.dk-it{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:24px;align-items:center}
.dk-it.right{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}
.dk-it.right .dk-media{order:2}
.dk-it .dk-media img{max-height:360px;width:100%;object-fit:cover}
.dk-gal{display:grid;gap:14px}
.dk-gal.c2{grid-template-columns:repeat(2,1fr)}.dk-gal.c3{grid-template-columns:repeat(3,1fr)}.dk-gal.c4{grid-template-columns:repeat(4,1fr)}
.dk-gal figure{margin:0;display:flex;flex-direction:column;gap:6px;min-width:0}
.dk-gal img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--r-card);border:var(--card-border)}
.dk--ekc .dk-gal img,.dk--ekc .dk-it img{border:none;box-shadow:0 6px 18px rgba(46,42,74,.08)}
.dk-gal .dk-cap{font-size:12px;color:var(--ink);font-weight:600}
.dk-chart{background:var(--paper);border:var(--card-border);border-radius:var(--r-card);box-shadow:var(--card-shadow-sm);padding:16px 18px}
.dk--ekc .dk-chart{border:none}
.dk-chart-title{font:700 11.5px/1.3 var(--f-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--ink);margin-bottom:10px}
.dk-chart svg{display:block;width:100%;height:auto;overflow:visible}
.dk-chart .lbl{font:500 13px var(--f-body);fill:var(--ink)}
.dk-chart .val{font:700 12px var(--f-mono);fill:var(--ink)}
.dk-chart .grid{stroke:var(--line);stroke-width:1}
.dk-chart .base{stroke:var(--muted);stroke-width:1}
.dk-proc{display:flex;align-items:stretch;gap:0}
.dk-proc-step{flex:1;min-width:0;background:var(--paper);border:var(--card-border);border-top:var(--card-top);border-radius:var(--r-card);box-shadow:var(--card-shadow-sm);padding:14px 16px}
.dk-proc-n{font:700 11px/1 var(--f-mono);color:var(--accent);letter-spacing:.1em;margin-bottom:6px}
.dk-proc-arrow{flex:0 0 34px;display:flex;align-items:center;justify-content:center;color:var(--accent);font:700 22px/1 var(--f-mono)}

/* ── Track English Studio (Adultos) ── */
.dk--tes{--bg:#FBF9F4;--paper:#FFFFFF;--ink:#121212;--ink-soft:#2E2E2E;--muted:#6A6A6A;--line:#D8D2C4;
  --f-display:'Bebas Neue',Impact,'Arial Narrow',sans-serif;--f-accent:'Playfair Display',Georgia,serif;--f-mono:'Space Mono','Courier New',monospace;--f-body:'Work Sans',system-ui,sans-serif;--f-card:'Work Sans',system-ui,sans-serif;
  --display-weight:400;--display-track:.01em;--accent-style:italic;--accent-weight:900;--title-size:46px;--cover-size:96px;
  --card-weight:700;--card-title-size:16px;--card-track:0;--card-case:none;--word-size:18px;
  --head-rule:2px solid #121212;--tag-border:1.5px solid #121212;--r-pill:999px;--r-card:0px;
  --card-border:2px solid #121212;--card-top:2px solid #121212;--card-shadow:4px 4px 0 var(--accent);--card-shadow-sm:3px 3px 0 var(--accent);
  --call-border:2px solid var(--accent);--table-head:#121212;--body-justify:safe center}
.dk--tes .dk-slide{background-color:var(--bg);background-image:radial-gradient(#E4DED0 1px,transparent 1px);background-size:20px 20px}
.dk--tes.dk--portrait{--title-size:38px;--cover-size:64px}
.dk--tes.dk--portrait .dk-body{--body-justify:flex-start}

/* ── English Kids Club (Infancias) ── */
.dk--ekc{--bg:#FFFBF2;--paper:#FFFFFF;--ink:#2E2A4A;--ink-soft:#4A4666;--muted:#7A7690;--line:rgba(46,42,74,.12);
  --f-display:'Inter',system-ui,sans-serif;--f-accent:'Inter',system-ui,sans-serif;--f-mono:'Poppins',system-ui,sans-serif;--f-body:'Poppins',system-ui,sans-serif;--f-card:'Inter',system-ui,sans-serif;
  --display-weight:800;--display-track:.01em;--accent-style:normal;--accent-weight:800;--title-size:38px;--cover-size:72px;
  --card-weight:800;--card-title-size:17px;--card-track:0;--card-case:none;--word-size:19px;
  --head-rule:none;--tag-border:none;--r-pill:999px;--r-card:22px;
  --card-border:none;--card-top:6px solid var(--accent-light);--card-shadow:0 6px 18px rgba(46,42,74,.08);--card-shadow-sm:0 4px 12px rgba(46,42,74,.07);
  --call-border:none;--table-head:var(--ink);--body-justify:safe center}
.dk--ekc .dk-title em,.dk--ekc .dk-cover-title em{color:var(--ink);background:linear-gradient(transparent 60%,color-mix(in srgb,var(--accent-light) 60%,white) 60%);padding:0 4px}
.dk--ekc .dk-tag,.dk--ekc .dk-meta span{background:color-mix(in srgb,var(--accent-light) 55%,white);color:var(--ink);font-weight:600;letter-spacing:.04em}
.dk--ekc .dk-kicker,.dk--ekc .dk-cover-kicker,.dk--ekc .dk-pill,.dk--ekc .dk-h,.dk--ekc .dk-call-label,.dk--ekc .dk-cmp-label,.dk--ekc .dk-trans{font-weight:700;letter-spacing:.06em}
.dk--ekc .dk-head{padding-bottom:4px}
/* El amarillo/verde de marca no se lee como texto sobre fondo claro: para
   letras se usa la versión oscura (--mark); el color claro queda para
   fondos, bordes y el resaltador. */
.dk--ekc .dk-kicker,.dk--ekc .dk-cover-kicker,.dk--ekc .dk-pill,.dk--ekc .dk-h,.dk--ekc .dk-call-label,.dk--ekc .dk-trans,.dk--ekc .dk-road-n,.dk--ekc .dk-proc-n,.dk--ekc .dk-phon,.dk--ekc .dk-foot b,.dk--ekc .dk-proc-arrow{color:var(--mark)}
.dk--ekc .dk-h::before{background:var(--mark)}
.dk--ekc .dk-ex{border-left-color:var(--accent-light)}
.dk--ekc .dk-road-row{border:none}
.dk--ekc .dk-media img,.dk--ekc .dk-video,.dk--ekc .dk-table{border:none;box-shadow:0 6px 18px rgba(46,42,74,.08)}
.dk--ekc .dk-blob{position:absolute;border-radius:50%;opacity:.45;pointer-events:none;z-index:0}
.dk-slide > :not(.dk-blob){position:relative;z-index:1}
.dk-slide > .dk-logo,.dk-slide > .dk-overflow{position:absolute}
.dk--ekc.dk--portrait{--title-size:32px;--cover-size:52px}
.dk--ekc.dk--portrait .dk-body{--body-justify:flex-start}

@media print{
  .dk-noprint{display:none!important}
  .dk-slide + .dk-slide{margin-top:0}
  .dk-slide{break-inside:avoid;box-shadow:none!important}
  .dk-slide + .dk-slide{break-before:page;page-break-before:always}
  .dk-video iframe{display:none}
  .dk-video-print{display:block;position:absolute;inset:0}
}
`
