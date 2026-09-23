/* Loonatic Studios agreements: form, document rendering, e-signature and PDF. */
(() => {
    const S = window.STUDIO;
    const CONTRACTS = window.CONTRACTS;
    const $ = (id) => document.getElementById(id);
    const DRAFT_KEY = 'loonatic-agreements:';
    const GUARDIAN_IDS = ['guardianName', 'guardianRelation', 'guardianEmail'];

    const state = {
        tpl: null,
        values: {},
        initials: {},
        lockedTerms: false,   // terms came from a studio link
        lockedTemplate: false,
        signed: null,         // { at: Date, hash, sigSigner, sigGuardian, ... }
    };

    // ── Utilities ──────────────────────────────────────────────────────────────
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const store = {
        get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
        del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
    };
    const todayISO = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
    const emailOk = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '');
    function ageOn(dob) {
        if (!dob) return null;
        const [y, m, d] = dob.split('-').map(Number);
        const now = new Date();
        let a = now.getFullYear() - y;
        if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) a--;
        return a;
    }
    let toastTimer;
    function toast(msg) {
        const t = $('toast');
        t.textContent = msg; t.classList.add('show');
        clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
    }
    async function sha256(text) {
        if (!window.crypto?.subtle) return null;
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    // ── Values & tokens ────────────────────────────────────────────────────────
    const isMinor = () => { const a = ageOn(state.values.dob); return a !== null && a < 18; };
    const displayName = () => state.values.stageName || state.values.legalName || '';

    function allValues() {
        const v = { ...state.values };
        const at = state.signed ? state.signed.at : new Date();
        v.effectiveDate = at.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        v.startDateText = v.startDate ? fmtDate(v.startDate) : 'To be scheduled';
        v.stageName = v.stageName || v.legalName;
        v.signerRole = state.tpl.signer;
        Object.assign(v, state.tpl.derive ? state.tpl.derive(state.values, S) : {});
        return v;
    }

    const fieldById = (id) => state.tpl.fields.find((f) => f.id === id);

    /* Parse a template string into runs: { text, bold, kind: 'text'|'fill'|'blank' }. */
    function runs(str, v) {
        const out = [];
        const parts = String(str).split(/(\*\*[^*]+\*\*)/);
        for (const part of parts) {
            if (!part) continue;
            const bold = part.startsWith('**') && part.endsWith('**');
            const body = bold ? part.slice(2, -2) : part;
            body.split(/(\{\{[\w.]+\}\})/).forEach((seg) => {
                if (!seg) return;
                const m = seg.match(/^\{\{([\w.]+)\}\}$/);
                if (!m) { out.push({ text: seg, bold, kind: 'text' }); return; }
                const key = m[1];
                if (key.startsWith('studio.')) { out.push({ text: String(S[key.slice(7)] ?? ''), bold, kind: 'text' }); return; }
                let val = v[key];
                // Derived values can themselves contain tokens (e.g. fee text with {{rateNote}}).
                if (typeof val === 'string' && val.includes('{{') && !fieldById(key)) {
                    out.push(...runs(val, v).map((r) => ({ ...r, bold: r.bold || bold })));
                    return;
                }
                if (val === undefined || val === null || val === '') {
                    const f = fieldById(key === 'stageName' ? 'legalName' : key);
                    if (f) out.push({ text: f.label, bold, kind: 'blank' });
                    return;
                }
                if (typeof val === 'number') val = String(val);
                out.push({ text: val, bold, kind: fieldById(key) || key === 'effectiveDate' ? 'fill' : 'text' });
            });
        }
        return out;
    }

    /* Build a render-neutral model of the document; both HTML and PDF draw from it. */
    function buildDoc() {
        const v = allValues();
        let n = 0;
        const sections = state.tpl.sections.map((sec, i) => {
            const blocks = [];
            const add = (p) => {
                if (p === null || p === undefined) return;
                if (typeof p === 'function') return add(p(v));
                if (Array.isArray(p)) return p.forEach(add);
                if (typeof p === 'string') return blocks.push({ type: 'p', runs: runs(p, v) });
                if (p.list) return blocks.push({ type: 'list', items: p.list.map((s) => runs(s, v)) });
                if (p.dl) return blocks.push({ type: 'dl', rows: p.dl.map(([k, val]) => [k, runs(typeof val === 'function' ? val(v) : val, v)]) });
                if (p.table === 'writers') return blocks.push({ type: 'table', head: ['Writer', 'Contribution', 'Share', 'PRO', 'IPI / CAE #', 'Publisher'], rows: writerRows() });
            };
            sec.p.forEach(add);
            return { key: i, num: sec.schedule ? null : ++n, h: sec.h, initial: !!sec.initial, blocks };
        });
        return { title: state.tpl.title, version: state.tpl.version, sections };
    }

    function writerRows() {
        return (state.values.writers || []).filter((w) => w.name).map((w) => [
            w.name, w.role || '', `${Number(w.share || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`, w.pro || '', w.ipi || '', w.publisher || '',
        ]);
    }

    const plain = (rs) => rs.map((r) => r.text).join('');
    function docText(doc) {
        const lines = [doc.title, `Version ${doc.version}`];
        doc.sections.forEach((s) => {
            lines.push('', `${s.num ? s.num + '. ' : ''}${s.h}`);
            s.blocks.forEach((b) => {
                if (b.type === 'p') lines.push(plain(b.runs));
                if (b.type === 'list') b.items.forEach((it, i) => lines.push(`(${String.fromCharCode(97 + i)}) ${plain(it)}`));
                if (b.type === 'dl') b.rows.forEach(([k, r]) => lines.push(`${k}: ${plain(r)}`));
                if (b.type === 'table') [b.head, ...b.rows].forEach((r) => lines.push(r.join(' | ')));
            });
        });
        return lines.join('\n');
    }

    // ── HTML rendering ─────────────────────────────────────────────────────────
    function runsHTML(rs) {
        return rs.map((r) => {
            let h = esc(r.text);
            if (r.kind === 'fill') h = `<span class="fill">${h}</span>`;
            if (r.kind === 'blank') h = `<span class="blank">${h}</span>`;
            return r.bold ? `<strong>${h}</strong>` : h;
        }).join('');
    }

    function blocksHTML(blocks) {
        return blocks.map((b) => {
            if (b.type === 'p') return `<p>${runsHTML(b.runs)}</p>`;
            if (b.type === 'list') return `<ol class="al">${b.items.map((it, i) => `<li data-l="(${String.fromCharCode(97 + i)})">${runsHTML(it)}</li>`).join('')}</ol>`;
            if (b.type === 'dl') return `<dl>${b.rows.map(([k, r]) => `<dt>${esc(k)}</dt><dd>${runsHTML(r)}</dd>`).join('')}</dl>`;
            if (b.type === 'table') {
                const body = b.rows.length ? b.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')
                    : `<tr><td colspan="${b.head.length}"><span class="blank">Add writers in Step 2</span></td></tr>`;
                return `<div class="tw"><table class="wt"><thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
            }
            return '';
        }).join('');
    }

    /* The paper is built once per template so initials inputs keep focus; bodies refresh on input. */
    function buildPaper() {
        const doc = buildDoc();
        const paper = $('paper');
        paper.innerHTML = `
            <div class="kicker">${esc(S.name)}</div>
            <h1>${esc(doc.title)}</h1>
            <div class="meta">Version ${esc(doc.version)} &middot; ${esc(S.legalName)}, ${esc(S.address)}</div>
            ${doc.sections.map((s) => `
                <section id="sec-${s.key}">
                    <h3>${s.num ? `<span class="n">${s.num}.</span>` : ''}${esc(s.h)}</h3>
                    <div class="sec-body"></div>
                    ${s.initial ? `<label class="initial" data-sec="${s.key}"><span class="tick">✓</span>${esc(state.tpl.signer)} initials
                        <input type="text" maxlength="4" autocomplete="off" autocapitalize="characters" placeholder="—" data-init="${s.key}" aria-label="Your initials for section ${s.num}"></label>` : ''}
                </section>`).join('')}`;
        paper.querySelectorAll('[data-init]').forEach((inp) => {
            inp.value = state.initials[inp.dataset.init] || '';
            inp.addEventListener('input', () => {
                inp.value = inp.value.toUpperCase().replace(/[^A-Z.\-' ]/g, '');
                state.initials[inp.dataset.init] = inp.value.trim();
                saveDraft(); update();
            });
        });
        refreshPaper(doc);
    }

    function refreshPaper(doc = buildDoc()) {
        doc.sections.forEach((s) => {
            const el = document.querySelector(`#sec-${s.key} .sec-body`);
            if (el) el.innerHTML = blocksHTML(s.blocks);
        });
        document.querySelectorAll('.initial').forEach((l) => l.classList.toggle('ok', !!state.initials[l.dataset.sec]));
    }

    // ── Forms ──────────────────────────────────────────────────────────────────
    function fieldHTML(f, locked) {
        const val = state.values[f.id] ?? '';
        const req = f.required ? ' <i>*</i>' : '';
        const dis = locked ? ' disabled' : '';
        const ac = f.autocomplete ? ` autocomplete="${f.autocomplete}"` : '';
        let input;
        if (f.type === 'select') {
            input = `<select data-f="${f.id}"${dis}>${f.options.map(([k, l]) => `<option value="${esc(k)}"${k === val ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
        } else if (f.type === 'textarea') {
            input = `<textarea data-f="${f.id}"${dis}>${esc(val)}</textarea>`;
        } else if (f.type === 'writers') {
            return `<div class="f wide" data-wrap="${f.id}"><span style="display:block;font-size:13.5px;font-weight:500;margin-bottom:8px">${esc(f.label)}${req}</span>
                <div class="writers-wrap"><table class="writers"><thead><tr><th>Legal name</th><th>Contribution</th><th>Share %</th><th>PRO</th><th>IPI / CAE #</th><th>Publisher</th><th></th></tr></thead><tbody id="writerRows"></tbody></table></div>
                <div class="row" style="justify-content:space-between;margin-top:4px"><button class="btn small" type="button" id="addWriter"${dis}>+ Add writer</button><span class="total" id="writerTotal"></span></div></div>`;
        } else {
            const extra = f.type === 'number' ? ' min="0" step="any" inputmode="decimal"' : '';
            input = `<input type="${f.type}" data-f="${f.id}" value="${esc(val)}"${ac}${extra}${dis}>`;
        }
        return `<label class="f${f.wide ? ' wide' : ''}" data-wrap="${f.id}"><span>${esc(f.label)}${req}</span>${input}${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</label>`;
    }

    function renderForms() {
        const tpl = state.tpl;
        $('partyTitle').textContent = `Your details (${tpl.signer.toLowerCase()})`;
        $('partyFields').innerHTML = tpl.fields.filter((f) => f.group === 'party').map((f) => fieldHTML(f, false)).join('');
        $('termsFields').innerHTML = tpl.fields.filter((f) => f.group === 'terms').map((f) => fieldHTML(f, state.lockedTerms && f.type !== 'writers')).join('');
        $('lockBadge').hidden = !state.lockedTerms;
        $('studioTools').hidden = state.lockedTerms;
        $('termsSub').textContent = state.lockedTerms
            ? `These terms were set by ${S.name}. If anything looks wrong, contact ${S.email} before signing.`
            : 'These details are filled into the agreement below.';
        document.querySelectorAll('[data-f]').forEach((el) => {
            el.addEventListener('input', () => {
                state.values[el.dataset.f] = el.value;
                el.classList.remove('invalid');
                saveDraft(); update();
            });
        });
        if (tpl.fields.some((f) => f.type === 'writers')) renderWriters();
        $('cReadText').textContent = `I have read the entire ${tpl.title} and understand it.`;
    }

    function renderWriters() {
        const rows = state.values.writers || (state.values.writers = [{ name: state.values.legalName || '', role: 'Music & lyrics', share: '100', pro: '', ipi: '', publisher: '' }]);
        const roles = ['Music & lyrics', 'Music', 'Lyrics', 'Producer / beat'];
        const dis = '';  // writers are always entered by the signer, even on a studio link
        $('writerRows').innerHTML = rows.map((w, i) => `<tr>
            <td><input type="text" data-w="${i}:name" value="${esc(w.name)}"${dis}></td>
            <td><select data-w="${i}:role"${dis}>${roles.map((r) => `<option${r === w.role ? ' selected' : ''}>${r}</option>`).join('')}</select></td>
            <td style="width:84px"><input type="number" min="0" max="100" step="any" inputmode="decimal" data-w="${i}:share" value="${esc(w.share)}"${dis}></td>
            <td style="width:92px"><input type="text" data-w="${i}:pro" value="${esc(w.pro)}" placeholder="BMI"${dis}></td>
            <td style="width:112px"><input type="text" data-w="${i}:ipi" value="${esc(w.ipi)}"${dis}></td>
            <td><input type="text" data-w="${i}:publisher" value="${esc(w.publisher)}" placeholder="Self"${dis}></td>
            <td>${rows.length > 1 ? `<button class="x" type="button" data-rm="${i}" aria-label="Remove writer">×</button>` : ''}</td></tr>`).join('');
        $('writerRows').querySelectorAll('[data-w]').forEach((el) => el.addEventListener('input', () => {
            const [i, k] = el.dataset.w.split(':');
            rows[i][k] = el.value; saveDraft(); update();
        }));
        $('writerRows').querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => {
            rows.splice(Number(b.dataset.rm), 1); renderWriters(); saveDraft(); update();
        }));
        $('addWriter').onclick = () => { rows.push({ name: '', role: 'Music & lyrics', share: '', pro: '', ipi: '', publisher: '' }); renderWriters(); saveDraft(); update(); };
    }

    const writersTotal = () => (state.values.writers || []).reduce((s, w) => s + (Number(w.share) || 0), 0);

    // ── Signature pads ─────────────────────────────────────────────────────────
    class Pad {
        constructor(canvas, onChange) {
            this.c = canvas; this.strokes = []; this.onChange = onChange; this.enabled = true;
            this.ctx = canvas.getContext('2d');
            let cur = null;
            const pt = (e) => { const r = this.c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, e.pressure || 0.5]; };
            canvas.addEventListener('pointerdown', (e) => {
                if (!this.enabled) return;
                e.preventDefault(); canvas.setPointerCapture(e.pointerId);
                cur = [pt(e)]; this.strokes.push(cur); this.draw();
            });
            canvas.addEventListener('pointermove', (e) => {
                if (!cur) return;
                const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
                evs.forEach((ev) => cur.push(pt(ev)));
                this.draw();
            });
            const end = () => { if (cur) { cur = null; this.onChange(); } };
            canvas.addEventListener('pointerup', end);
            canvas.addEventListener('pointercancel', end);
            new ResizeObserver(() => this.resize()).observe(canvas);
        }
        resize() {
            const r = this.c.getBoundingClientRect();
            if (!r.width) return;
            const dpr = window.devicePixelRatio || 1;
            // Scale existing strokes if the pad width changes (e.g. phone rotation).
            if (this.w && this.w !== r.width) {
                const k = r.width / this.w;
                this.strokes.forEach((s) => s.forEach((p) => { p[0] *= k; p[1] *= k; }));
            }
            this.w = r.width; this.h = r.height;
            this.c.width = r.width * dpr; this.c.height = r.height * dpr;
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.draw();
        }
        draw(ctx = this.ctx, w = this.w, h = this.h) {
            ctx.clearRect(0, 0, w, h);
            ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#15131a';
            for (const s of this.strokes) {
                if (s.length === 1) { ctx.beginPath(); ctx.arc(s[0][0], s[0][1], 1.4, 0, Math.PI * 2); ctx.fillStyle = '#15131a'; ctx.fill(); continue; }
                for (let i = 1; i < s.length; i++) {
                    ctx.beginPath(); ctx.lineWidth = 1.4 + s[i][2] * 1.8;
                    ctx.moveTo(s[i - 1][0], s[i - 1][1]); ctx.lineTo(s[i][0], s[i][1]); ctx.stroke();
                }
            }
        }
        isEmpty() { return !this.strokes.some((s) => s.length > 2) && this.strokes.length < 2; }
        clear() { this.strokes = []; this.draw(); this.onChange(); }
        /* Tight-cropped PNG of the signature ink, with its aspect ratio. */
        export() {
            const pts = this.strokes.flat();
            if (!pts.length) return null;
            const pad = 6;
            const x0 = Math.max(0, Math.min(...pts.map((p) => p[0])) - pad), y0 = Math.max(0, Math.min(...pts.map((p) => p[1])) - pad);
            const x1 = Math.min(this.w, Math.max(...pts.map((p) => p[0])) + pad), y1 = Math.min(this.h, Math.max(...pts.map((p) => p[1])) + pad);
            const sc = 3, out = document.createElement('canvas');
            out.width = (x1 - x0) * sc; out.height = (y1 - y0) * sc;
            const ctx = out.getContext('2d');
            ctx.setTransform(sc, 0, 0, sc, -x0 * sc, -y0 * sc);
            this.draw(ctx, this.w, this.h);
            return { data: out.toDataURL('image/png'), ratio: (x1 - x0) / (y1 - y0) };
        }
    }

    let padSigner, padGuardian;

    // ── Progress & validation ──────────────────────────────────────────────────
    function checks() {
        const v = state.values, tpl = state.tpl;
        const shown = (f) => !f.showIf || f.showIf(v);
        const missing = [];
        const partyMissing = tpl.fields.filter((f) => f.group === 'party' && f.required && !String(v[f.id] ?? '').trim());
        partyMissing.forEach((f) => missing.push({ msg: f.label, target: `[data-wrap="${f.id}"]` }));
        if (v.email && !emailOk(v.email)) missing.push({ msg: 'A valid email address', target: '[data-wrap="email"]' });
        const age = ageOn(v.dob);
        if (v.dob && (age === null || age < 5 || age > 120)) missing.push({ msg: 'A valid date of birth', target: '[data-wrap="dob"]' });
        const partyOk = !missing.length;

        const termsStart = missing.length;
        tpl.fields.filter((f) => f.group === 'terms' && f.required && shown(f)).forEach((f) => {
            if (f.type === 'writers') {
                const ws = (v.writers || []).filter((w) => w.name.trim());
                if (!ws.length) missing.push({ msg: 'At least one writer', target: '[data-wrap="writers"]' });
                else if (Math.abs(writersTotal() - 100) > 0.01) missing.push({ msg: 'Writer shares that add up to 100%', target: '[data-wrap="writers"]' });
            } else if (!String(v[f.id] ?? '').trim()) missing.push({ msg: f.label, target: `[data-wrap="${f.id}"]` });
        });
        const termsOk = missing.length === termsStart;

        const initSecs = tpl.sections.map((s, i) => (s.initial ? i : null)).filter((i) => i !== null);
        const initDone = initSecs.filter((i) => state.initials[i]).length;
        initSecs.filter((i) => !state.initials[i]).slice(0, 1).forEach((i) => missing.push({ msg: `Your initials (${initSecs.length - initDone} section${initSecs.length - initDone > 1 ? 's' : ''} left)`, target: `#sec-${i}` }));

        const signStart = missing.length;
        const typed = $('typedName').value.trim().toLowerCase().replace(/\s+/g, ' ');
        const legal = String(v.legalName || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (!typed) missing.push({ msg: 'Your typed full legal name', target: '#typedName' });
        else if (legal && typed !== legal) missing.push({ msg: 'Typed name must match your legal name exactly', target: '#typedName' });
        if (padSigner.isEmpty()) missing.push({ msg: 'Your drawn signature', target: '#padSigner' });
        if (isMinor()) {
            GUARDIAN_IDS.forEach((id) => { if (!String(v[id] || '').trim()) missing.push({ msg: $(id).closest('label').querySelector('span').textContent.replace('*', '').trim(), target: `#${id}` }); });
            if (v.guardianEmail && !emailOk(v.guardianEmail)) missing.push({ msg: "A valid guardian's email", target: '#guardianEmail' });
            if (padGuardian.isEmpty()) missing.push({ msg: 'Parent / guardian signature', target: '#padGuardian' });
        }
        if (!$('cRead').checked) missing.push({ msg: 'Confirm you have read the agreement', target: '#cRead' });
        if (!$('cEsign').checked) missing.push({ msg: 'Agree to sign electronically', target: '#cEsign' });
        const signOk = missing.length === signStart;

        return { missing, partyOk, termsOk, initDone, initTotal: initSecs.length, signOk };
    }

    function update() {
        if (!state.tpl) return;
        refreshPaper();
        $('guardianBox').hidden = !isMinor();
        state.tpl.fields.forEach((f) => {
            const el = document.querySelector(`[data-wrap="${f.id}"]`);
            if (el && f.showIf) el.hidden = !f.showIf(state.values);
        });
        if (state.values.writers) {
            const t = writersTotal();
            $('writerTotal').textContent = `Total: ${t.toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
            $('writerTotal').classList.toggle('bad', Math.abs(t - 100) > 0.01);
        }

        const c = checks();
        const signed = !!state.signed;
        $('initialCount').textContent = c.initTotal ? `${c.initDone} of ${c.initTotal} sections initialed` : '';

        const steps = [
            { label: 'Your details', ok: c.partyOk, href: '#partyCard' },
            { label: 'Terms', ok: c.termsOk, href: '#termsCard' },
            { label: 'Read & initial', ok: c.initDone === c.initTotal, href: '#docAnchor', sub: c.initTotal ? `${c.initDone}/${c.initTotal} initialed` : 'Read through' },
            { label: 'Sign', ok: signed, href: '#signCard' },
            { label: 'Send PDF', ok: false, href: signed ? '#doneCard' : '#signCard', sub: `to ${S.email}` },
        ];
        $('railSteps').innerHTML = steps.map((s, i) => `<li class="${s.ok ? 'done' : ''}"><a href="${s.href}"><span class="dot">${s.ok ? '✓' : i + 1}</span><span>${esc(s.label)}${s.sub ? `<em>${esc(s.sub)}</em>` : ''}</span></a></li>`).join('');

        const miss = $('missing');
        const showMissing = miss.dataset.armed === '1' && c.missing.length && !signed;
        miss.hidden = !showMissing;
        if (showMissing) {
            miss.innerHTML = `<b>Still needed before you can sign:</b><ul>${c.missing.map((m, i) => `<li><a href="#" data-go="${i}">${esc(m.msg)}</a></li>`).join('')}</ul>`;
            miss.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goTo(c.missing[a.dataset.go].target); }));
        }

        // Mobile bar
        const total = 4, done = [c.partyOk, c.termsOk, c.initDone === c.initTotal, c.signOk].filter(Boolean).length;
        $('barMeter').style.width = `${signed ? 100 : (done / total) * 100}%`;
        $('bar').hidden = signed;
        $('barText').textContent = c.missing.length ? `${c.missing.length} item${c.missing.length > 1 ? 's' : ''} left` : 'Ready to sign';
        $('barNext').textContent = c.missing.length ? 'Next' : 'Sign';
        $('barNext').onclick = () => (c.missing.length ? goTo(c.missing[0].target) : goTo('#signBtn'));
    }

    function goTo(sel) {
        const el = document.querySelector(sel);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = el.matches('input,select,textarea,canvas') ? el : el.querySelector('input,select,textarea');
        if (focusable && focusable.tagName !== 'CANVAS') setTimeout(() => focusable.focus({ preventScroll: true }), 350);
    }

    // ── Signing ────────────────────────────────────────────────────────────────
    async function sign() {
        $('missing').dataset.armed = '1';
        const c = checks();
        if (c.missing.length) { update(); goTo(c.missing[0].target); return; }
        const at = new Date();
        state.signed = { at };
        const doc = buildDoc();
        const sigSigner = padSigner.export();
        const sigGuardian = isMinor() ? padGuardian.export() : null;
        const record = {
            agreement: state.tpl.id, version: state.tpl.version, text: docText(doc),
            values: state.values, initials: state.initials, typedName: $('typedName').value.trim(),
            signedAt: at.toISOString(), signature: sigSigner.data, guardianSignature: sigGuardian?.data || null,
        };
        const hash = await sha256(JSON.stringify(record));
        Object.assign(state.signed, {
            hash, sigSigner, sigGuardian, doc,
            typedName: record.typedName,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
            ua: navigator.userAgent,
        });
        setLocked(true);
        showDone();
        update();
        toast('Signed. Now download or email the PDF.');
    }

    function setLocked(on) {
        document.querySelectorAll('#partyCard input, #partyCard select, #termsCard input, #termsCard select, #termsCard textarea, #termsCard button, #paper input, #signCard input, #signCard button')
            .forEach((el) => {
                if (on) { el.dataset.wasDisabled = el.disabled ? '1' : ''; el.disabled = true; }
                else if ('wasDisabled' in el.dataset) { el.disabled = el.dataset.wasDisabled === '1'; delete el.dataset.wasDisabled; }
            });
        padSigner.enabled = padGuardian.enabled = !on;
        document.body.classList.toggle('signed-lock', on);
        $('picker').querySelectorAll('button').forEach((b) => { b.disabled = on; });
    }

    function fmtStamp(d) {
        return d.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
    }

    function showDone() {
        const s = state.signed;
        $('doneCard').hidden = false;
        $('doneSub').textContent = `${state.tpl.title}, signed by ${state.values.legalName} on ${fmtStamp(s.at)}.`;
        $('receipt').innerHTML = `<b>Document ID</b> ${esc(s.hash || 'unavailable (open over https to generate)')}<br><b>Version</b> ${esc(state.tpl.version)}`;
        $('nextSteps').innerHTML = `
            <li>Download the PDF and keep a copy for your records.</li>
            <li>Email it to <a href="mailto:${esc(S.email)}">${esc(S.email)}</a> (the <b>Email to studio</b> button opens a pre-addressed message; attach the PDF you downloaded).</li>
            <li>${esc(S.name)} will countersign and send you the fully signed copy.</li>`;
        $('shareBtn').hidden = !canShareFiles();
        $('doneCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function canShareFiles() {
        try { return !!navigator.canShare && navigator.canShare({ files: [new File([''], 'x.pdf', { type: 'application/pdf' })] }); } catch { return false; }
    }

    // ── PDF ────────────────────────────────────────────────────────────────────
    /* jsPDF's built-in fonts use Windows-1252; replace anything outside it. */
    const pdfSafe = (s) => String(s).replace(/℗/g, '(P)').replace(/[^\x00-\xFF‘’“”–—•…€™]/g, '?');

    function buildPdf() {
        const { jsPDF } = window.jspdf;
        const s = state.signed, v = allValues(), tpl = state.tpl;
        const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
        const W = 612, H = 792, M = 64, CW = W - M * 2, BOTTOM = H - 64;
        const INK = [28, 26, 32], GREY = [100, 96, 108], ACCENT = [122, 47, 192];
        let y = M;

        const font = (fam, style, size, color = INK) => { pdf.setFont(fam, style); pdf.setFontSize(size); pdf.setTextColor(...color); };
        const ensure = (h) => { if (y + h > BOTTOM) { pdf.addPage(); y = M; } };

        /* Word-wrap mixed bold/normal runs. */
        function rich(rs, { x = M, width = CW, size = 10.5, lh = 1.42, fam = 'times' } = {}) {
            const words = [];
            rs.forEach((r) => pdfSafe(r.text).split(/(\s+)/).forEach((part) => {
                if (!part) return;
                words.push(/^\s+$/.test(part) ? { space: true } : { t: part, b: r.bold });
            }));
            const lines = []; let line = [], w = 0, gap = false;
            for (const wd of words) {
                if (wd.space) { gap = line.length > 0; continue; }
                font(fam, wd.b ? 'bold' : 'normal', size);
                const ww = pdf.getTextWidth(wd.t), sw = gap ? pdf.getTextWidth(' ') : 0;
                if (w + sw + ww > width && line.length) { lines.push(line); line = []; w = 0; }
                const lead = line.length ? sw : 0;
                line.push({ ...wd, x: w + lead }); w += lead + ww; gap = false;
            }
            if (line.length) lines.push(line);
            const step = size * lh;
            lines.forEach((ln) => {
                ensure(step);
                ln.forEach((wd) => { font(fam, wd.b ? 'bold' : 'normal', size); pdf.text(wd.t, x + wd.x, y + size); });
                y += step;
            });
        }
        const text = (str, opts) => rich([{ text: str, bold: false }], opts);

        // Title block
        font('helvetica', 'bold', 8, ACCENT); pdf.setCharSpace(1.6);
        pdf.text(pdfSafe(S.name.toUpperCase()), M, y + 8); pdf.setCharSpace(0);
        y += 22;
        font('times', 'bold', 20);
        pdf.splitTextToSize(pdfSafe(tpl.title), CW).forEach((l) => { pdf.text(l, M, y + 18); y += 24; });
        font('helvetica', 'normal', 8.5, GREY);
        pdf.text(pdfSafe(`Version ${tpl.version}  |  ${S.legalName}, ${S.address}  |  Signed ${fmtStamp(s.at)}`), M, y + 8);
        y += 18;
        pdf.setDrawColor(220, 214, 204); pdf.setLineWidth(0.8); pdf.line(M, y, W - M, y);
        y += 18;

        for (const sec of s.doc.sections) {
            ensure(46);
            font('helvetica', 'bold', 10.5);
            const h = `${sec.num ? sec.num + '.  ' : ''}${sec.h}`;
            pdf.splitTextToSize(pdfSafe(h), CW).forEach((l) => { ensure(15); pdf.text(l, M, y + 10.5); y += 15; });
            y += 3;
            for (const b of sec.blocks) {
                if (b.type === 'p') { rich(b.runs); y += 5; }
                if (b.type === 'list') {
                    b.items.forEach((it, i) => {
                        ensure(15); font('times', 'normal', 10.5, GREY);
                        pdf.text(`(${String.fromCharCode(97 + i)})`, M + 6, y + 10.5);
                        rich(it, { x: M + 28, width: CW - 28 }); y += 2;
                    });
                    y += 4;
                }
                if (b.type === 'dl') {
                    b.rows.forEach(([k, r]) => {
                        ensure(15); font('helvetica', 'bold', 9, GREY);
                        pdf.text(pdfSafe(k), M, y + 10);
                        rich(r, { x: M + 140, width: CW - 140 }); y += 3;
                    });
                }
                if (b.type === 'table') {
                    const cols = [0.26, 0.16, 0.1, 0.12, 0.16, 0.2].map((f) => f * CW);
                    const row = (cells, bold) => {
                        font('helvetica', bold ? 'bold' : 'normal', 8.5);
                        const wrapped = cells.map((c, i) => pdf.splitTextToSize(pdfSafe(c), cols[i] - 6));
                        const rh = Math.max(...wrapped.map((w) => w.length)) * 11 + 6;
                        ensure(rh);
                        let x = M;
                        wrapped.forEach((w, i) => { w.forEach((l, j) => pdf.text(l, x, y + 10 + j * 11)); x += cols[i]; });
                        y += rh;
                        pdf.setDrawColor(...(bold ? INK : [220, 214, 204])); pdf.setLineWidth(bold ? 0.8 : 0.5); pdf.line(M, y - 2, W - M, y - 2);
                    };
                    row(b.head, true); b.rows.forEach((r) => row(r, false)); y += 8;
                }
            }
            if (sec.initial) {
                ensure(24);
                const ini = pdfSafe(state.initials[sec.key] || '');
                font('helvetica', 'normal', 7.5, GREY);
                const label = `${tpl.signer.toUpperCase()} INITIALS`;
                const bw = 54, bx = W - M - bw;
                pdf.text(label, bx - 8 - pdf.getTextWidth(label), y + 13);
                pdf.setDrawColor(...ACCENT); pdf.setLineWidth(0.8); pdf.rect(bx, y, bw, 19);
                font('times', 'bold', 12, ACCENT); pdf.text(ini, bx + bw / 2, y + 14, { align: 'center' });
                y += 26;
            }
            y += 8;
        }

        // Signatures
        pdf.addPage(); y = M;
        font('helvetica', 'bold', 10.5); pdf.text('SIGNATURES', M, y + 10); y += 22;
        text(`By signing, each party agrees to the ${tpl.title} above.`); y += 12;

        const sigBlock = (role, img, lines) => {
            ensure(130);
            font('helvetica', 'bold', 8, GREY); pdf.setCharSpace(1); pdf.text(role.toUpperCase(), M, y + 8); pdf.setCharSpace(0);
            y += 14;
            if (img) {
                const h = Math.min(54, 220 / img.ratio), w = h * img.ratio;
                pdf.addImage(img.data, 'PNG', M, y, w, h);
                y += h + 2;
            } else y += 50;
            pdf.setDrawColor(...INK); pdf.setLineWidth(0.6); pdf.line(M, y, M + 260, y); y += 6;
            lines.forEach(([k, val]) => {
                font('helvetica', 'normal', 8.5, GREY); pdf.text(pdfSafe(k), M, y + 9);
                font('helvetica', 'normal', 9.5, INK); pdf.text(pdfSafe(val || ''), M + 90, y + 9);
                if (!val) { pdf.setDrawColor(200, 196, 190); pdf.line(M + 90, y + 11, M + 260, y + 11); }
                y += 14;
            });
            y += 18;
        };

        const stamp = `${fmtStamp(s.at)} (electronic)`;
        sigBlock(tpl.signer, s.sigSigner, [
            ['Name', state.values.legalName],
            ['Professional name', state.values.stageName || ''],
            ['Email', state.values.email],
            ['Signed', stamp],
        ].filter(([k, val]) => k !== 'Professional name' || val));
        if (s.sigGuardian) {
            sigBlock('Parent or legal guardian', s.sigGuardian, [
                ['Name', state.values.guardianName], ['Relationship', state.values.guardianRelation],
                ['Email', state.values.guardianEmail], ['Signed', stamp],
            ]);
        }
        sigBlock(`${S.name}`, null, [['Name / title', S.signatory || ''], ['Date', '']]);

        // Electronic signature record
        ensure(150);
        const boxTop = y;
        y += 12;
        font('helvetica', 'bold', 8, ACCENT); pdf.setCharSpace(1); pdf.text('ELECTRONIC SIGNATURE RECORD', M + 12, y + 8); pdf.setCharSpace(0); y += 16;
        const rec = [
            ['Agreement', `${tpl.title}, version ${tpl.version}`],
            ['Signed by', `${state.values.legalName} <${state.values.email}>`],
            ['Typed name', s.typedName],
            ['Signed at', `${fmtStamp(s.at)}  |  ${s.at.toISOString()} UTC${s.tz ? '  |  ' + s.tz : ''}`],
            ['Consents', 'Read agreement; agreed to sign electronically; initials entered on each marked section'],
            ['Document ID', s.hash ? `SHA-256 ${s.hash}` : 'unavailable'],
            ['Browser', s.ua],
        ];
        rec.forEach(([k, val]) => {
            font('helvetica', 'normal', 7.5, GREY); pdf.text(k, M + 12, y + 8);
            font('courier', 'normal', 7.5, INK);
            pdf.splitTextToSize(pdfSafe(val), CW - 104).forEach((l, i) => { pdf.text(l, M + 92, y + 8 + i * 10); if (i) y += 10; });
            y += 12;
        });
        y += 6;
        pdf.setDrawColor(...ACCENT); pdf.setLineWidth(0.6); pdf.roundedRect(M, boxTop, CW, y - boxTop, 4, 4);

        // Footer on every page
        const n = pdf.getNumberOfPages();
        const ini = Object.values(state.initials).find(Boolean) || '';
        for (let i = 1; i <= n; i++) {
            pdf.setPage(i);
            font('helvetica', 'normal', 7.5, GREY);
            pdf.text(pdfSafe(`${tpl.short} v${tpl.version}  |  ${displayName()}  |  Doc ID ${s.hash ? s.hash.slice(0, 16) : 'n/a'}`), M, H - 36);
            pdf.text(`Page ${i} of ${n}${ini ? `   |   Initials: ${pdfSafe(ini)}` : ''}`, W - M, H - 36, { align: 'right' });
        }

        pdf.setProperties({
            title: `${tpl.title} - ${displayName()}`,
            subject: `Signed ${fmtStamp(s.at)}`,
            author: state.values.legalName,
            keywords: `loonatic, agreement, ${tpl.id}, docid:${s.hash || ''}`,
            creator: `${S.name} Agreements`,
        });
        return pdf;
    }

    function pdfName() {
        const who = displayName().replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'Artist';
        return `${S.name.replace(/\s+/g, '-')}_${state.tpl.short.replace(/\s+/g, '-')}_${who}_${todayISO()}.pdf`;
    }
    function pdfBlob() { return buildPdf().output('blob'); }
    function download(blob) {
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: pdfName() });
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
    function mailtoHref() {
        const subject = `Signed: ${state.tpl.title} - ${displayName()}`;
        const body = `Hi ${S.name},\n\nAttached is my signed ${state.tpl.title}.\n\nName: ${state.values.legalName}\nSigned: ${fmtStamp(state.signed.at)}\nDocument ID: ${state.signed.hash || 'n/a'}\n\nThanks,\n${state.values.legalName}`;
        return `mailto:${encodeURIComponent(S.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    // ── Drafts & URL ───────────────────────────────────────────────────────────
    function saveDraft() {
        if (state.signed) return;
        store.set(DRAFT_KEY + state.tpl.id, { values: state.values, initials: state.initials });
        store.set(DRAFT_KEY + 'last', state.tpl.id);
    }

    const params = new URLSearchParams(location.search);

    function loadTemplate(id) {
        const tpl = CONTRACTS.find((c) => c.id === id) || CONTRACTS[0];
        state.tpl = tpl; state.signed = null;
        const draft = store.get(DRAFT_KEY + tpl.id) || {};
        const values = {};
        tpl.fields.forEach((f) => { if (f.default !== undefined) values[f.id] = f.default; });
        // Carry personal details over from any other saved agreement, so artists don't retype them.
        CONTRACTS.forEach((c) => {
            const d = store.get(DRAFT_KEY + c.id);
            if (d?.values) ['legalName', 'stageName', 'email', 'phone', 'address', 'dob'].forEach((k) => { if (d.values[k] && !values[k]) values[k] = d.values[k]; });
        });
        Object.assign(values, draft.values || {});
        state.initials = draft.initials || {};
        // Studio links override terms.
        state.lockedTerms = false;
        if (params.get('c') === tpl.id) {
            tpl.fields.filter((f) => f.group === 'terms' && f.type !== 'writers').forEach((f) => { if (params.has(f.id)) values[f.id] = params.get(f.id); });
            state.lockedTerms = params.get('lock') === '1';
        }
        state.values = values;

        document.querySelectorAll('.pick').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === tpl.id)));
        document.title = `${tpl.short} | ${S.name}`;
        renderForms();
        buildPaper();
        $('typedName').value = '';
        $('cRead').checked = $('cEsign').checked = false;
        GUARDIAN_IDS.forEach((gid) => { $(gid).value = values[gid] || ''; });
        padSigner.clear(); padGuardian.clear();
        $('missing').dataset.armed = '';
        $('doneCard').hidden = true;
        setLocked(false);
        update();
    }

    function init() {
        $('foot').innerHTML = `${esc(S.legalName)} &middot; ${esc(S.address)} &middot; <a href="mailto:${esc(S.email)}">${esc(S.email)}</a><br>This page is a signing tool; it is not legal advice.`;
        $('picker').innerHTML = CONTRACTS.map((c) => `<button class="pick" type="button" data-id="${c.id}" aria-pressed="false"><b>${esc(c.short)}</b><span>${esc(c.blurb)}</span></button>`).join('');
        $('picker').querySelectorAll('.pick').forEach((b) => b.addEventListener('click', () => {
            if (state.lockedTemplate || b.dataset.id === state.tpl?.id) return;
            loadTemplate(b.dataset.id);
        }));

        padSigner = new Pad($('padSigner'), update);
        padGuardian = new Pad($('padGuardian'), update);
        document.querySelectorAll('[data-clear]').forEach((b) => b.addEventListener('click', () => (b.dataset.clear === 'padSigner' ? padSigner : padGuardian).clear()));

        ['typedName'].forEach((id) => $(id).addEventListener('input', update));
        GUARDIAN_IDS.forEach((id) => $(id).addEventListener('input', () => { state.values[id] = $(id).value; saveDraft(); update(); }));
        ['cRead', 'cEsign'].forEach((id) => $(id).addEventListener('change', update));
        $('signBtn').addEventListener('click', sign);

        const pdfReady = () => { if (window.jspdf) return true; toast("The PDF tool couldn't load. Check your connection and reload; your details are saved."); return false; };
        $('dlBtn').addEventListener('click', () => { if (!pdfReady()) return; download(pdfBlob()); toast('PDF downloaded.'); });
        $('mailBtn').addEventListener('click', () => {
            if (!pdfReady()) return;
            download(pdfBlob());
            toast('PDF downloaded. Attach it to the email that just opened.');
            setTimeout(() => { location.href = mailtoHref(); }, 400);
        });
        $('shareBtn').addEventListener('click', async () => {
            if (!pdfReady()) return;
            const file = new File([pdfBlob()], pdfName(), { type: 'application/pdf' });
            try {
                await navigator.share({ files: [file], title: state.tpl.title, text: `Signed ${state.tpl.title}. Please send to ${S.email}.` });
            } catch (e) { if (e.name !== 'AbortError') { download(file); toast('Sharing failed, so the PDF was downloaded instead.'); } }
        });
        $('editBtn').addEventListener('click', () => {
            state.signed = null; setLocked(false); $('doneCard').hidden = true;
            padSigner.clear(); padGuardian.clear(); $('cRead').checked = $('cEsign').checked = false;
            update(); goTo('#partyCard'); toast('Unlocked. You will need to sign again.');
        });
        $('resetBtn').addEventListener('click', () => {
            if (!confirm('Clear everything you entered for this agreement?')) return;
            store.del(DRAFT_KEY + state.tpl.id);
            CONTRACTS.forEach((c) => store.del(DRAFT_KEY + c.id));
            loadTemplate(state.tpl.id); window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        $('copyLink').addEventListener('click', async () => {
            const p = new URLSearchParams({ c: state.tpl.id, lock: '1' });
            state.tpl.fields.filter((f) => f.group === 'terms' && f.type !== 'writers').forEach((f) => { if (state.values[f.id]) p.set(f.id, state.values[f.id]); });
            const url = `${location.origin}${location.pathname}?${p}`;
            try { await navigator.clipboard.writeText(url); toast('Link copied. Send it to the artist.'); } catch { prompt('Copy this link:', url); }
        });


        const want = params.get('c') || store.get(DRAFT_KEY + 'last') || 'master';
        state.lockedTemplate = params.get('lock') === '1' && !!params.get('c');
        $('picker').classList.toggle('locked', state.lockedTemplate);
        loadTemplate(want);
        if (state.lockedTemplate) $('heroTitle').textContent = state.tpl.title;
    }

    init();
})();
