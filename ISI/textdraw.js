// textDraw.js - Fungsi utilitas untuk membuat text box
const escape = (s) => String(s ?? "");

function makeTextDraw(title, items = [], opts = {}) {
    const padding = typeof opts.padding === "number" ? opts.padding : 1;
    const maxWidth = typeof opts.maxWidth === "number" ? opts.maxWidth : 80;

    const lines = items.map((it, i) => {
        if (typeof it === "string") return `${i + 1}. ${it}`;
        const label = escape(it.label ?? `Item ${i+1}`);
        const note = escape(it.note ?? "");
        return note ? `${i + 1}. ${label} - ${note}` : `${i + 1}. ${label}`;
    });

    const contentCandidates = [title, ...lines];
    let innerWidth = contentCandidates.reduce((w, s) => Math.max(w, [...String(s)].length), 0);
    innerWidth += padding * 2;
    if (innerWidth > maxWidth) innerWidth = maxWidth;

    const hLine = (n) => "─".repeat(n);

    const padLine = (s = "") => {
        let str = String(s);
        if ([...str].length > innerWidth - padding * 2) {
            str = [...str].slice(0, innerWidth - padding * 2 - 1).join("") + "…";
        }
        const leftPad = " ".repeat(padding);
        const rightPad = " ".repeat(Math.max(0, innerWidth - padding * 2 - [...str].length));
        return leftPad + str + rightPad + leftPad;
    };

    const top = `┌${hLine(innerWidth)}┐`;
    const titleLine = `│${padLine(title)}│`;
    const sep = `├${hLine(innerWidth)}┤`;
    const contentLines = lines.map(l => `│${padLine(l)}│`).join("\n");
    const bottom = `└${hLine(innerWidth)}┘`;

    return [top, titleLine, sep, contentLines, bottom].join("\n");
}

module.exports = { makeTextDraw };