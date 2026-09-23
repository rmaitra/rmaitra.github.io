# Loonatic Studios Agreements

A static web page where artists review, initial and e-sign Loonatic Studios agreements, then
download a signed PDF and email it to the studio. There's no server and no database: everything
stays in the artist's browser until they send the PDF.

**Not legal advice.** These templates are a solid starting draft written in plain English. Have a
Minnesota entertainment attorney review them before you use them with artists.

## Setup

1. Edit the `STUDIO` block at the top of `contracts.js`. At a minimum:
   - `email`: where signed PDFs should go. It's currently the placeholder `contracts@example.com`.
   - `legalName`: the studio's exact legal entity name (for example `Loonatic Studios LLC`).
   - `signatory`: the person who countersigns, for example `Jane Doe, Owner`.
2. Deploy the folder (GitHub Pages serves it at `/music-contracts/`). The page must be served over
   https or localhost so it can compute the SHA-256 document ID.

## Workflow

1. **Studio prepares a link.** Open the page, pick an agreement, fill in *Step 2: Terms* (project
   title, fee arrangement, buyout price and so on) and click **Copy pre-filled link for artist**.
   The link locks those terms and hides the other agreements.
2. **Artist signs.** They fill in their details, read the agreement, initial each key section, type
   their legal name, draw a signature and accept the e-sign consent. If they're under 18, a
   parent or guardian block appears and must also be signed.
3. **Artist sends the PDF.** **Download PDF**, **Email to studio** (downloads the PDF and opens a
   pre-addressed email) or, on phones, **Share PDF…** (attaches it straight to Mail).
4. **Studio countersigns.** Check the PDF's terms and document ID, sign the blank Loonatic Studios
   block (in any PDF editor or on paper) and email the fully signed copy back to the artist.
   Only countersign after you've checked the terms: a locked link can still be edited by anyone
   who changes the URL.

Each PDF includes the agreement version, the artist's initials on every marked section and on
every page footer, both signatures, and an electronic signature record (signer, email, local and
UTC timestamp, time zone, browser, and a SHA-256 hash of the full signed content).

## The agreements

| Agreement | Use it when |
|---|---|
| **Master Recording Co-Ownership** | Before any artist records. 50/50 ownership of the recordings, mutual approval over releases and licensing, 50/50 net income. The songs stay with the artist. |
| **Guest Performer Release** | Anyone else plays or sings on a co-owned record. Without it, a guest could claim an interest in the master. |
| **Songwriter Split Sheet** | A song is finished. Each writer signs their own copy. This keeps "the song" clearly separate from "the recording." |
| **Studio Services & Booking** | Rates, deposit, cancellations, file delivery, conduct and damage. It requires the co-ownership agreement to be signed before the first session. |
| **Content & Likeness Release** | You want to post behind-the-scenes photos and video. It blocks unreleased music from appearing in posts without approval. |

### Decisions built into the master agreement (review these with your lawyer)

- **Mutual approval replaces the default rule.** Under U.S. copyright law, either co-owner can
  normally license a jointly owned work without the other's permission (and must share the
  profits). Section 5 overrides that, so neither side can release or license anything alone.
  A silent partner is treated as approving after 10 + 5 business days, so one party can't stall
  a release forever.
- **Administrator.** One party handles distribution and payouts, with quarterly statements and
  audit rights. The default is the studio; each link can switch it to the artist.
- **Buyout.** The artist can buy out the studio's 50% at a set price per master, or at an
  appraised fair market value. Labels usually want to own masters outright, so without this clause
  many artists (and their managers) won't sign. It also gives you a clean exit at a price you choose.
- **Consideration.** Asking for half the masters is easier to justify, and to enforce, when you
  give something in return. The *Session fees* setting records that trade: reduced or waived rates.
- **Statutory royalties aren't shared.** SoundExchange pays the featured artist's 45% share
  directly, and only the rights-owner share is split. The contract says so, so nobody expects
  money that can't be redirected.
- **Mix-only work is excluded.** Recordings made elsewhere that you only mix or master aren't
  captured, so mix clients won't be surprised.
- **Artists already under contract.** An artist signed to a label or production company usually
  can't grant you anything, because the label already owns their recordings. The artist makes
  a promise about this in Section 15, but ask before the session anyway.

## Other contracts worth adding

- **Producer Agreement:** for outside producers, or for your producers on records the artist
  owns outright (after a buyout). Covers producer points, the producer's royalty, and credit.
- **Beat / Instrumental License:** non-exclusive lease versus exclusive sale of studio-made beats,
  with stream caps, credit and publishing split.
- **Employee / Contractor Work-for-Hire:** engineers, producers and house musicians assign their
  contributions to the studio. That's what lets the studio own its 50% cleanly.
- **Mix / Master-Only Services:** a short agreement for outside recordings, with no ownership,
  just a fee and credit.
- **Band / Group Agreement:** when a group records, who inside the band holds the artist's 50%,
  and what happens when a member leaves. Otherwise each member signs the master agreement
  separately.
- **NDA:** for unreleased material and high-profile clients.
- **Sync License Request / Approval Form:** a one-page form so both co-owners approve each sync
  deal in writing (Section 5).
- **Release Approval Form:** a signed checklist per master, covering final mix approved,
  credits, split sheet on file, guest releases on file, and samples cleared.

## Files

- `index.html`: layout and styles.
- `contracts.js`: studio settings and all agreement text. Bump a template's `version` whenever its
  wording changes.
- `app.js`: form handling, live document rendering, signature pads, validation and PDF generation
  (jsPDF, loaded from cdnjs).
