/* Loonatic Studios invoices: form, live preview and PDF. */
(() => {
    const S = window.STUDIO;
    const $ = (id) => document.getElementById(id);
    const DRAFT_KEY = 'loonatic-invoice:draft';
    const TERMS = { 0: 'Due on receipt', 7: 'Net 7', 14: 'Net 14', 30: 'Net 30' };

    // ── Utilities ──────────────────────────────────────────────────────────────
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const multiline = (s) => esc(s).replace(/\n/g, '<br>');
    const store = {
        get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
    };
    const toISO = (d) => new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const todayISO = () => toISO(new Date());
    const parseISO = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
    const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
    const fmtDate = (iso) => (iso ? parseISO(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '');
    const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
    const cents = (n) => Math.round(n * 100) / 100;
    const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const money = (n) => usd.format(n);
    const get = (o, path) => path.split('.').reduce((a, k) => a?.[k], o);
    const set = (o, path, v) => { const ks = path.split('.'); const last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; };
    let toastTimer;
    function toast(msg) {
        const t = $('toast');
        t.textContent = msg; t.classList.add('show');
        clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
    }

    // ── State ──────────────────────────────────────────────────────────────────
    /* LS-2026-009 -> LS-2026-010; keeps whatever numbering scheme was typed. */
    function nextNumber(n) {
        const m = /^(.*?)(\d+)$/.exec(n || '');
        if (!m) return n ? `${n}-2` : `LS-${new Date().getFullYear()}-001`;
        return m[1] + String(Number(m[2]) + 1).padStart(m[2].length, '0');
    }
    /* A new invoice keeps the studio details, terms, tax rate and notes from the last one. */
    function blank(prev) {
        const date = todayISO(), terms = prev?.terms ?? '14';
        return {
            number: nextNumber(prev?.number),
            project: '',
            date, terms,
            due: terms === 'custom' ? addDays(date, 14) : addDays(date, Number(terms)),
            from: prev?.from ?? { name: S.legalName || S.name, address: S.address, email: S.email, phone: '' },
            to: { name: '', company: '', email: '', address: '' },
            items: [{ desc: '', qty: '1', rate: '' }],
            discount: '', taxRate: prev?.taxRate ?? '', paid: '',
            payInfo: prev?.payInfo ?? '',
            notes: prev?.notes ?? 'Thank you for recording with us.',
        };
    }
    let inv = store.get(DRAFT_KEY) || blank();
    if (!Array.isArray(inv.items) || !inv.items.length) inv.items = [{ desc: '', qty: '1', rate: '' }];

    function totals() {
        const lines = inv.items
            .map((it) => ({ desc: it.desc.trim(), qty: num(it.qty), rate: num(it.rate), amount: cents(num(it.qty) * num(it.rate)) }))
            .filter((l) => l.desc || l.amount);
        const subtotal = cents(lines.reduce((a, l) => a + l.amount, 0));
        const discount = Math.min(cents(Math.max(0, num(inv.discount))), Math.max(0, subtotal));
        const tax = cents((subtotal - discount) * Math.max(0, num(inv.taxRate)) / 100);
        const total = cents(subtotal - discount + tax);
        const paid = cents(Math.max(0, num(inv.paid)));
        return { lines, subtotal, discount, tax, total, paid, balance: cents(total - paid) };
    }
    const termsLabel = () => TERMS[inv.terms] || (inv.due ? `Due ${fmtDate(inv.due)}` : '');
    const fromLines = () => [...(inv.from.address || '').split('\n'), inv.from.email, inv.from.phone].map((s) => (s || '').trim()).filter(Boolean);
    const toLines = () => [inv.to.company, ...(inv.to.address || '').split('\n'), inv.to.email].map((s) => (s || '').trim()).filter(Boolean);
    const fmtQty = (q) => String(cents(q));

    // ── Form ───────────────────────────────────────────────────────────────────
    function fillForm() {
        document.querySelectorAll('[data-k]').forEach((el) => { el.value = get(inv, el.dataset.k) ?? ''; });
        renderRows();
    }
    function renderRows() {
        $('itemRows').innerHTML = inv.items.map((it, i) => `
            <tr>
                <td><input type="text" list="itemPresets" data-i="${i}" data-f="desc" value="${esc(it.desc)}" aria-label="Description" placeholder="Description"></td>
                <td class="num"><input type="number" min="0" step="any" inputmode="decimal" data-i="${i}" data-f="qty" value="${esc(it.qty)}" aria-label="Quantity"></td>
                <td class="num"><input type="number" min="0" step="0.01" inputmode="decimal" data-i="${i}" data-f="rate" value="${esc(it.rate)}" aria-label="Rate"></td>
                <td class="amt" data-amt="${i}"></td>
                <td><button class="x" type="button" data-rm="${i}" aria-label="Remove line">×</button></td>
            </tr>`).join('');
        $('itemRows').querySelectorAll('[data-f]').forEach((el) => el.addEventListener('input', () => {
            inv.items[el.dataset.i][el.dataset.f] = el.value;
            update();
        }));
        $('itemRows').querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => {
            inv.items.splice(Number(b.dataset.rm), 1);
            if (!inv.items.length) inv.items.push({ desc: '', qty: '1', rate: '' });
            renderRows(); update();
        }));
    }
    function onField(el) {
        const k = el.dataset.k;
        set(inv, k, el.value);
        el.classList.remove('invalid');
        if ((k === 'terms' || k === 'date') && inv.terms !== 'custom' && inv.date) {
            inv.due = addDays(inv.date, Number(inv.terms));
            document.querySelector('[data-k="due"]').value = inv.due;
        }
        if (k === 'due') {
            inv.terms = 'custom';
            document.querySelector('[data-k="terms"]').value = 'custom';
        }
        update();
    }

    // ── Preview ────────────────────────────────────────────────────────────────
    function update() {
        store.set(DRAFT_KEY, inv);
        const t = totals();
        inv.items.forEach((it, i) => {
            const cell = document.querySelector(`[data-amt="${i}"]`);
            if (cell) cell.textContent = money(cents(num(it.qty) * num(it.rate)));
        });
        $('barTotal').textContent = money(t.balance);

        const rows = t.lines.length
            ? t.lines.map((l) => `<tr><td>${esc(l.desc || '—')}</td><td class="r">${fmtQty(l.qty)}</td><td class="r">${money(l.rate)}</td><td class="r">${money(l.amount)}</td></tr>`).join('')
            : '<tr><td colspan="4" class="blank">Add a line item</td></tr>';
        const meta = [['Invoice #', inv.number], ['Date', fmtDate(inv.date)], ['Due', fmtDate(inv.due)], ['Terms', TERMS[inv.terms] || '']]
            .filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('');
        const tot = [
            `<div class="muted"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>`,
            t.discount ? `<div class="muted"><span>Discount</span><span>−${money(t.discount)}</span></div>` : '',
            t.tax ? `<div class="muted"><span>Sales tax (${esc(num(inv.taxRate))}%)</span><span>${money(t.tax)}</span></div>` : '',
            (t.discount || t.tax || t.paid) ? `<div><span>Total</span><span>${money(t.total)}</span></div>` : '',
            t.paid ? `<div class="muted"><span>Paid</span><span>−${money(t.paid)}</span></div>` : '',
            `<div class="due"><span>Balance due</span><span>${money(t.balance)}</span></div>`,
        ].join('');
        const notes = [
            inv.payInfo.trim() ? `<div><div class="lbl">How to pay</div>${multiline(inv.payInfo.trim())}</div>` : '',
            inv.notes.trim() ? `<div><div class="lbl">Notes</div>${multiline(inv.notes.trim())}</div>` : '',
        ].join('');

        $('paper').innerHTML = `
            <div class="inv-top">
                <div>
                    <div class="kicker">${esc(inv.from.name || S.name)}</div>
                    <div class="muted">${fromLines().map(esc).join('<br>')}</div>
                </div>
                <div>
                    <h1>Invoice</h1>
                    <dl class="inv-meta">${meta}</dl>
                </div>
            </div>
            <div class="inv-parties">
                <div>
                    <div class="lbl">Bill to</div>
                    <div>${inv.to.name.trim() ? `<b>${esc(inv.to.name.trim())}</b>` : '<span class="blank">Client name</span>'}</div>
                    <div class="muted">${toLines().map(esc).join('<br>')}</div>
                </div>
                ${inv.project.trim() ? `<div><div class="lbl">Project</div><div>${esc(inv.project.trim())}</div></div>` : ''}
            </div>
            <div class="tw"><table class="wt">
                <thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>
            <div class="inv-totals">${tot}</div>
            ${notes ? `<div class="inv-notes">${notes}</div>` : ''}`;
    }

    // ── PDF ────────────────────────────────────────────────────────────────────
    /* jsPDF's built-in fonts use Windows-1252; replace anything outside it. */
    const pdfSafe = (s) => String(s).replace(/−/g, '-').replace(/[^\x00-\xFF‘’“”–—•…€™]/g, '?');

    function buildPdf() {
        const { jsPDF } = window.jspdf;
        const t = totals();
        const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
        const W = 612, H = 792, M = 56, CW = W - M * 2, R = W - M, BOTTOM = H - 64;
        const INK = [28, 26, 32], GREY = [100, 96, 108], ACCENT = [122, 47, 192], RULE = [222, 217, 207];
        let y = M;

        const font = (style, size, color = INK) => { pdf.setFont('helvetica', style); pdf.setFontSize(size); pdf.setTextColor(...color); };
        const ensure = (h) => { if (y + h > BOTTOM) { pdf.addPage(); y = M; } };
        const rule = (yy, color = RULE, w = 0.75) => { pdf.setDrawColor(...color); pdf.setLineWidth(w); pdf.line(M, yy, R, yy); };
        const label = (str, x, yy) => { font('bold', 7.5, GREY); pdf.setCharSpace(1); pdf.text(str.toUpperCase(), x, yy); pdf.setCharSpace(0); };
        /* Draw wrapped lines at (x, top); returns the y below the last line. */
        function block(lines, x, top, width, { style = 'normal', size = 10, color = INK, lh = 1.4 } = {}) {
            font(style, size, color);
            let yy = top;
            lines.forEach((ln) => pdf.splitTextToSize(pdfSafe(ln), width).forEach((part) => { yy += size * lh; pdf.text(part, x, yy); }));
            return yy;
        }

        // Header: studio on the left, title and invoice details on the right
        const colW = CW * 0.5;
        font('bold', 9, ACCENT); pdf.setCharSpace(1.6);
        pdf.text(pdfSafe((inv.from.name || S.name).toUpperCase()), M, y + 9); pdf.setCharSpace(0);
        const leftEnd = block(fromLines(), M, y + 12, colW, { size: 9.5, color: GREY });

        font('bold', 24); pdf.text('INVOICE', R, y + 18, { align: 'right' });
        let my = y + 40;
        [['Invoice #', inv.number], ['Date', fmtDate(inv.date)], ['Due', fmtDate(inv.due)], ['Terms', TERMS[inv.terms] || '']]
            .filter(([, v]) => v).forEach(([k, v]) => {
                font('normal', 9.5, GREY); pdf.text(k, R - 190, my);
                font('bold', 9.5); pdf.text(pdfSafe(v), R, my, { align: 'right' });
                my += 14;
            });
        y = Math.max(leftEnd, my - 14) + 18;
        rule(y); y += 24;

        // Bill to / project
        label('Bill to', M, y);
        let by = block([inv.to.name.trim()], M, y + 2, colW - 20, { style: 'bold', size: 11 });
        by = block(toLines(), M, by, colW - 20, { size: 9.5, color: GREY });
        let py = y;
        if (inv.project.trim()) {
            label('Project', M + colW, y);
            py = block([inv.project.trim()], M + colW, y + 2, colW, { size: 10.5 });
        }
        y = Math.max(by, py) + 30;

        // Line items
        const xQty = R - 170, xRate = R - 85, descW = xQty - M - 50;
        const head = () => {
            font('bold', 9);
            pdf.text('Description', M, y); pdf.text('Qty', xQty, y, { align: 'right' });
            pdf.text('Rate', xRate, y, { align: 'right' }); pdf.text('Amount', R, y, { align: 'right' });
            y += 7; rule(y, INK, 1); y += 6;
        };
        head();
        t.lines.forEach((l) => {
            font('normal', 10);
            const parts = pdf.splitTextToSize(pdfSafe(l.desc || '-'), descW);
            const h = parts.length * 14 + 10;
            if (y + h > BOTTOM) { pdf.addPage(); y = M; head(); }
            font('normal', 10);
            parts.forEach((p, i) => pdf.text(p, M, y + 12 + i * 14));
            pdf.text(fmtQty(l.qty), xQty, y + 12, { align: 'right' });
            pdf.text(money(l.rate), xRate, y + 12, { align: 'right' });
            pdf.text(money(l.amount), R, y + 12, { align: 'right' });
            y += h; rule(y);
        });

        // Totals
        const rows = [
            ['Subtotal', money(t.subtotal), GREY],
            t.discount ? ['Discount', `-${money(t.discount)}`, GREY] : null,
            t.tax ? [`Sales tax (${num(inv.taxRate)}%)`, money(t.tax), GREY] : null,
            (t.discount || t.tax || t.paid) ? ['Total', money(t.total), INK] : null,
            t.paid ? ['Paid', `-${money(t.paid)}`, GREY] : null,
        ].filter(Boolean);
        ensure(rows.length * 16 + 60);
        y += 22;
        const xLbl = R - 210;
        rows.forEach(([k, v, color]) => {
            font('normal', 10, color); pdf.text(k, xLbl, y);
            font('normal', 10); pdf.text(v, R, y, { align: 'right' });
            y += 16;
        });
        y += 2; pdf.setDrawColor(...INK); pdf.setLineWidth(1); pdf.line(xLbl, y, R, y); y += 20;
        font('bold', 13); pdf.text('Balance due', xLbl, y); pdf.text(money(t.balance), R, y, { align: 'right' });
        y += 36;

        // How to pay / notes
        [['How to pay', inv.payInfo], ['Notes', inv.notes]].forEach(([k, v]) => {
            if (!v.trim()) return;
            font('normal', 10);
            const n = v.trim().split('\n').reduce((a, ln) => a + pdf.splitTextToSize(pdfSafe(ln), CW).length, 0);
            ensure(n * 14 + 30);
            label(k, M, y);
            y = block(v.trim().split('\n'), M, y + 2, CW) + 24;
        });

        // Footer
        const pages = pdf.getNumberOfPages();
        for (let p = 1; p <= pages; p++) {
            pdf.setPage(p);
            font('normal', 8, GREY);
            pdf.text(pdfSafe(`${inv.from.name || S.name}  ·  Invoice ${inv.number}`), M, H - 36);
            if (pages > 1) pdf.text(`Page ${p} of ${pages}`, R, H - 36, { align: 'right' });
        }
        return pdf;
    }

    const slug = (s) => s.trim().replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '');
    const pdfName = () => ['Invoice', slug(inv.number), slug(inv.to.name)].filter(Boolean).join('_') + '.pdf';
    const pdfBlob = () => buildPdf().output('blob');
    function download(blob) {
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: pdfName() });
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
    function mailtoHref() {
        const t = totals();
        const subject = `Invoice ${inv.number} from ${inv.from.name || S.name}`;
        const body = `Hi ${inv.to.name.trim()},\n\nAttached is invoice ${inv.number}${inv.project.trim() ? ` for ${inv.project.trim()}` : ''}.\n\nBalance due: ${money(t.balance)}\n${inv.due ? `Due: ${fmtDate(inv.due)}\n` : ''}\nThanks,\n${inv.from.name || S.name}`;
        return `mailto:${encodeURIComponent(inv.to.email.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    /* Flags what's missing and returns false if the invoice isn't ready to send. */
    function ready() {
        const miss = [];
        const flag = (k, msg) => { const el = document.querySelector(`[data-k="${k}"]`); el.classList.add('invalid'); if (!miss.length) el.focus(); miss.push(msg); };
        if (!inv.number.trim()) flag('number', 'an invoice number');
        if (!inv.to.name.trim()) flag('to.name', 'a client name');
        if (!totals().lines.length) { if (!miss.length) document.querySelector('[data-f="desc"]').focus(); miss.push('at least one line item'); }
        if (miss.length) { toast(`Add ${miss.join(', ')} first.`); return false; }
        if (!window.jspdf) { toast('The PDF library did not load. Check your connection and reload.'); return false; }
        return true;
    }

    // ── Init ───────────────────────────────────────────────────────────────────
    function init() {
        fillForm();
        document.querySelectorAll('[data-k]').forEach((el) => el.addEventListener('input', () => onField(el)));
        $('addItem').addEventListener('click', () => {
            inv.items.push({ desc: '', qty: '1', rate: '' });
            renderRows(); update();
            $('itemRows').querySelector('tr:last-child [data-f="desc"]').focus();
        });
        const dl = () => { if (!ready()) return; download(pdfBlob()); toast('PDF downloaded.'); };
        $('dlBtn').addEventListener('click', dl);
        $('barDl').addEventListener('click', dl);
        $('mailBtn').addEventListener('click', () => {
            if (!ready()) return;
            download(pdfBlob());
            toast('PDF downloaded. Attach it to the email.');
            setTimeout(() => { location.href = mailtoHref(); }, 400);
        });
        if (navigator.canShare && navigator.canShare({ files: [new File([''], 'a.pdf', { type: 'application/pdf' })] })) {
            $('shareBtn').hidden = false;
            $('shareBtn').addEventListener('click', async () => {
                if (!ready()) return;
                const file = new File([pdfBlob()], pdfName(), { type: 'application/pdf' });
                try { await navigator.share({ files: [file], title: `Invoice ${inv.number}` }); } catch { /* cancelled */ }
            });
        }
        $('newBtn').addEventListener('click', () => {
            if (!confirm(`Start invoice ${nextNumber(inv.number)}? This clears the client and line items. Download ${inv.number} first if you still need it.`)) return;
            inv = blank(inv);
            fillForm(); update();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        update();
    }
    init();
})();
