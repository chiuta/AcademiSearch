# Jurnal de modificări — AcademiSearch

Format: [SemVer](https://semver.org/lang/ro/) (MAJOR.MINOR.PATCH). Istoricul complet al versiunilor anterioare este în secțiunea „Istoric / Changelog” din [README.ro.md](README.ro.md).

## 5.1.2 — 2026-10-31

Doar interfață (accesibilitate pe telefon, 360×740): casetele de bifare mai mici de 24 px → 24 px (WCAG 2.5.8). Fără alte schimbări de comportament.

## 5.1.1 — 2026-10-27

Anterior: v5.1.0. Doar documentație; logica aplicației nu s-a schimbat.

- „Trimiterea directă către Zotero” era marcată „planificat”. Se documentează acum ca **neimplementată și neplanificată**: conectorul local Zotero (`127.0.0.1:23119`) este interzis de CSP (`connect-src` limitat la gazdele API); CSP nu a fost relaxat. Alternativele existente: descărcarea RIS și metadatele COinS pentru Zotero Connector.
- Nu mai rămâne nimic „planificat” care să se poată implementa onest în această aplicație (BibTeX există deja în biblioteca locală; deduplicarea după DOI și Unpaywall pe card, din 5.0.0).

## 5.1.0 — 2026-10-27

### Adăugat
- Export Zotero (RIS) din rezultate și din biblioteca locală; metadate COinS (`Z3988`) invizibile pe cardurile de rezultate, recunoscute de Zotero Connector.
- Buton „PDF-uri libere (Unpaywall)”: căutare în bloc, la cerere, pentru maximum 25 de rezultate filtrate cu DOI și fără PDF; se păstrează doar `url_for_pdf` real (http/https).
- Chei de interfață noi în toate cele 8 limbi (traducerile fr/it/es/pt/de/hu sunt automate, neverificate de vorbitori nativi).
- Test nou `tests/zotero-oa.test.mjs`.

### Nu s-a implementat
- Trimiterea directă către un Zotero pornit (conector local): necesită testare cu un Zotero real; documentat ca „planificat”.

### Observație
- Deduplicarea după DOI și butonul Unpaywall pe card existau deja din 5.0.0.

## 5.0.0 — 2026-10-26

Versiunea anterioară; vezi README.ro.md.
