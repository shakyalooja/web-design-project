const CATEGORIES = [
    ['flight', 'Flights'],
    ['accommodation', 'Accommodation'],
    ['transport', 'Transport'],
    ['food', 'Food'],
    ['sightseeing', 'Sightseeing'],
    ['other', 'Other']
];

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function money(value) {
    return '$' + Number(value || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function categoryLabel(value) {
    const found = CATEGORIES.find(c => c[0] === value);
    return found ? found[1] : 'Other';
}

function formatDates(start, end) {
    if (!start && !end) return 'No dates set';
    return `${start || '?'} to ${end || '?'}`;
}

function postJson(url, body) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(response => response.json());
}

function showMessage(text, isError = false) {
    const el = document.getElementById('message');
    if (!el) return;
    el.textContent = text;
    el.className = isError ? 'msg-error' : 'msg-ok';
}

function renderBreakdown(listEl, byCategory, total) {
    if (!byCategory || byCategory.length === 0) {
        listEl.innerHTML = '<li class="muted">No costs yet. Add activities to see a breakdown.</li>';
        return;
    }
    listEl.innerHTML = byCategory.map(row => {
        const pct = total > 0 ? Math.round((row.total / total) * 100) : 0;
        return `
            <li>
                <span class="bd-label">${esc(categoryLabel(row.category))}</span>
                <span class="bd-bar" aria-hidden="true"><span style="width:${pct}%"></span></span>
                <span class="bd-amount">${money(row.total)} <span class="muted">(${pct}%)</span></span>
            </li>`;
    }).join('');
}

function createDialog(title) {
    const opener = document.activeElement;
    const dialog = document.createElement('dialog');
    const titleId = 'dlg-' + Math.random().toString(36).slice(2);
    dialog.className = 'modal';
    dialog.setAttribute('aria-labelledby', titleId);
    dialog.innerHTML = `<h2 id="${titleId}">${esc(title)}</h2><div class="modal-body"></div>`;
    document.body.appendChild(dialog);
    dialog.addEventListener('close', () => {
        dialog.remove();
        if (opener && opener.focus) opener.focus();
    });
    dialog.showModal();
    return { dialog, body: dialog.querySelector('.modal-body') };
}

// fields: [{ name, label, type, value, required, maxlength, min, step, options }]
function openFormDialog({ title, fields, submitLabel = 'Save', onSubmit }) {
    const { dialog, body } = createDialog(title);
    const prefix = dialog.getAttribute('aria-labelledby');

    const fieldsHtml = fields.map(f => {
        const id = `${prefix}-${f.name}`;
        const attrs = `id="${id}" name="${esc(f.name)}"` +
            (f.required ? ' required' : '') +
            (f.maxlength ? ` maxlength="${f.maxlength}"` : '') +
            (f.min !== undefined ? ` min="${f.min}"` : '') +
            (f.step ? ` step="${f.step}"` : '');
        let input;
        if (f.type === 'textarea') {
            input = `<textarea ${attrs} rows="3">${esc(f.value)}</textarea>`;
        } else if (f.type === 'select') {
            input = `<select ${attrs}>${f.options.map(([v, l]) =>
                `<option value="${esc(v)}"${v === f.value ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
        } else {
            input = `<input type="${f.type || 'text'}" ${attrs} value="${esc(f.value)}">`;
        }
        return `<label for="${id}">${esc(f.label)}</label>${input}`;
    }).join('');

    body.innerHTML = `
        <form>
            ${fieldsHtml}
            <p class="msg-error" role="alert" hidden></p>
            <div class="modal-actions">
                <button type="submit">${esc(submitLabel)}</button>
                <button type="button" class="btn-secondary" data-cancel>Cancel</button>
            </div>
        </form>`;

    const form = body.querySelector('form');
    form.elements[0].focus();
    const errorEl = form.querySelector('[role="alert"]');
    body.querySelector('[data-cancel]').addEventListener('click', () => dialog.close());

    form.addEventListener('submit', event => {
        event.preventDefault();
        const submitBtn = form.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        errorEl.hidden = true;

        Promise.resolve(onSubmit(Object.fromEntries(new FormData(form))))
            .then(data => {
                if (data.success) {
                    dialog.close();
                } else {
                    errorEl.textContent = data.error;
                    errorEl.hidden = false;
                    submitBtn.disabled = false;
                }
            })
            .catch(() => {
                errorEl.textContent = 'Something went wrong. Please try again.';
                errorEl.hidden = false;
                submitBtn.disabled = false;
            });
    });
}

function bindLogout() {
    const btn = document.getElementById('logoutBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        fetch('../backend/auth/logout.php')
            .then(response => response.json())
            .then(() => { window.location.href = 'login.html'; })
            .catch(error => console.error('Something went wrong:', error));
    });
}

bindLogout();
