# Jurnal de modificări — AcademiSearch

Format: [SemVer](https://semver.org/lang/ro/) (MAJOR.MINOR.PATCH). Istoricul complet al versiunilor anterioare este în secțiunea „Istoric / Changelog” din [README.ro.md](README.ro.md).

## 5.2.2 — 2026-11-02

### Surse actualizate (runda 2, verificat la 2026-11-02)
- Textul juridic (8 limbi): OpenAlex a înlocuit în februarie 2026 „polite pool” cu chei API gratuite și ignoră parametrul `mailto` (help.openalex.org/api/deprecations); API-ul vechi de căutare OpenAIRE era programat spre retragere la 31 mai 2026 (graph.openaire.eu). Logica de căutare nu s-a modificat.

## 5.2.1 — 2026-11-02

Actualizare surse (verificate pe web la 2026-11-02):

- EThOS (British Library): nu mai este marcat „indisponibil”; serviciul a fost repus în funcțiune pe o platformă nouă (8 iulie 2026) — metadate pentru 650.000+ teze britanice, text integral prin depozitele universităților. Linkul trimite acum la ethos.bl.uk (în loc de Discovery Edinburgh); descrierea e actualizată în toate cele 8 limbi (sursă: bl.uk/collection/ethos).
- CORE: „200M+” → „450M+” lucrări (CORE declară peste 452 M; sursă: core.ac.uk/services/api).
- Project Gutenberg: „70.000+” → „79.000+” cărți (gutenberg.org indică 79.692).
- Neschimbat, dar de reținut: OpenAlex cere acum cheie API (parametrul mailto e ignorat), iar API-ul vechi de căutare OpenAIRE a fost programat să fie retras la 31 mai 2026; logica aplicației nu a fost modificată.

## 5.2.0 — 2026-11-01

- Corectat: adaptorul «Trimite la…» nu mai aruncă eroare când kitul FFF lipsește (gardian pe fiecare bloc; găsit de testul «fără kit» din CI).

Nou: «Trimite la…» (fff-kit, modulul FFF.bridge) — după orice export de fișier (GPX, ICS, CSV, Markdown) apare butonul «Trimite la…» către aplicațiile compatibile, iar importul de fișiere al aplicației primește plicuri .fff.json trimise de ele, cu confirmare înainte de import. Fără rețea, fără telemetrie.

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
