/*
 * Loonatic Studios agreements: studio settings + contract templates.
 *
 * Template text uses {{tokens}} that are filled from the form. A paragraph can be:
 *   - a string                      "Plain text with {{legalName}}."
 *   - a string with a bold lead-in  "**Credits.** Each released Master..."
 *   - a function (v) => string | array | null   (for conditional wording)
 *   - { list: [...] }               lettered list (a), (b), (c)...
 *   - { table: 'writers' }          the split-sheet writers table
 *   - { dl: [[label, text], ...] }  label/value rows (schedules)
 * Sections with `initial: true` require the signer's initials.
 *
 * Bump a template's `version` whenever its wording changes; the version is printed
 * on every signed PDF so you always know which text an artist agreed to.
 */

// ── Studio settings: edit these before sharing the app ─────────────────────────
window.STUDIO = {
    name: 'Loonatic Studios LLC',
    legalName: 'Loonatic Studios LLC',          // e.g. 'Loonatic Studios LLC' if incorporated
    address: 'Minneapolis, Minnesota',
    email: 'raj.d.maitra@gmail.com',         // TODO: where artists email signed PDFs
    signatory: '',                          // e.g. 'Jane Doe, Owner' (printed under the studio signature line)
    state: 'Minnesota',
    county: 'Hennepin County',
    fileRetentionYears: 3,
};

const FEE_TEXT = {
    standard: "Artist will pay Studio's standard session rates, as quoted in writing before each session. The co-ownership in this Agreement is in addition to those rates.",
    reduced: "In consideration of Studio's co-ownership of the Masters, Studio will charge Artist reduced session rates of {{rateNote}}.",
    waived: "In consideration of Studio's co-ownership of the Masters, Studio waives its session fees for the Project. Artist is still responsible for approved third-party costs (for example, outside musicians or equipment rentals Artist requests).",
};

const party = (role) => [
    { id: 'legalName', label: 'Full legal name', type: 'text', required: true, group: 'party', autocomplete: 'name' },
    { id: 'stageName', label: `Stage / professional name`, type: 'text', group: 'party', hint: 'Leave blank if you use your legal name.' },
    { id: 'email', label: 'Email', type: 'email', required: true, group: 'party', autocomplete: 'email' },
    { id: 'phone', label: 'Phone', type: 'tel', group: 'party', autocomplete: 'tel' },
    { id: 'address', label: 'Mailing address', type: 'text', required: true, group: 'party', autocomplete: 'street-address', wide: true },
    { id: 'dob', label: 'Date of birth', type: 'date', required: true, group: 'party', hint: `If the ${role.toLowerCase()} is under 18, a parent or guardian must also sign.` },
];

const GENERAL_ESIGN = "**Electronic signatures.** The parties agree to sign this Agreement electronically. Electronic signatures and records have the same legal effect as handwritten signatures and paper originals under the federal Electronic Signatures in Global and National Commerce Act (E-SIGN) and the Uniform Electronic Transactions Act as adopted in {{studio.state}}. A PDF copy of this signed Agreement is as effective as an original.";
const GENERAL_LAW = "**Governing law.** This Agreement is governed by the laws of the State of {{studio.state}}, without regard to its conflict-of-law rules.";
const GENERAL_ADVICE = "**Independent advice.** {{signerRole}} confirms having read this entire Agreement, having had the opportunity to consult a lawyer of {{signerRole}}'s own choosing before signing, and signing voluntarily.";

window.CONTRACTS = [
    // ────────────────────────────────────────────────────────────────────────────
    {
        id: 'master',
        version: '2026.1',
        title: 'Master Recording Co-Ownership Agreement',
        short: 'Master Co-Ownership',
        blurb: 'Recordings made at the studio are owned 50/50 by the artist and Loonatic Studios. The songs stay with the artist.',
        signer: 'Artist',
        fields: [
            ...party('Artist'),
            { id: 'projectTitle', label: 'Project / release title', type: 'text', required: true, group: 'terms', hint: 'Working title is fine.' },
            { id: 'tracks', label: 'Anticipated songs (one per line)', type: 'textarea', group: 'terms', wide: true, hint: 'Optional. Every recording made at the studio is covered, listed or not.' },
            { id: 'startDate', label: 'First session date', type: 'date', group: 'terms' },
            {
                id: 'feeMode', label: 'Session fees', type: 'select', group: 'terms', required: true, default: 'standard',
                options: [['standard', 'Standard rates apply'], ['reduced', 'Reduced rates'], ['waived', 'Session fees waived']],
            },
            { id: 'rateNote', label: 'Reduced rate', type: 'text', group: 'terms', showIf: (v) => v.feeMode === 'reduced', required: true, hint: 'e.g. "$40 per hour"' },
            {
                id: 'administrator', label: 'Administrator (handles distribution & payouts)', type: 'select', group: 'terms', required: true, default: 'studio',
                options: [['studio', 'Loonatic Studios'], ['artist', 'Artist']],
            },
            { id: 'buyout', label: 'Artist buyout price per Master (USD)', type: 'number', group: 'terms', hint: 'Optional. Blank = negotiated / fair market value.' },
        ],
        derive: (v, S) => ({
            feeText: FEE_TEXT[v.feeMode] || FEE_TEXT.standard,
            adminName: v.administrator === 'artist' ? 'Artist' : 'Studio',
            otherName: v.administrator === 'artist' ? 'Studio' : 'Artist',
            buyoutText: v.buyout
                ? `a price of $${Number(v.buyout).toLocaleString('en-US')} per Master, paid in full`
                : 'a price the Parties agree in good faith or, if they cannot agree within 30 days, the fair market value of that interest as determined by an independent music-industry appraiser chosen by both Parties, whose fee the Parties will split equally',
            trackList: (v.tracks || '').split('\n').map((t) => t.trim()).filter(Boolean).join('; ') || 'To be determined',
            adminLabel: v.administrator === 'artist' ? 'Artist' : S.name,
        }),
        sections: [
            {
                h: 'Parties and Purpose',
                p: [
                    'This Master Recording Co-Ownership Agreement (the "Agreement") is made on {{effectiveDate}} (the "Effective Date") between {{studio.legalName}}, of {{studio.address}} ("Studio"), and {{legalName}}, professionally known as {{stageName}}, of {{address}} ("Artist"). Studio and Artist are each a "Party" and together the "Parties."',
                    'Studio provides recording, engineering, production, mixing and related services. Before any recording begins, the Parties want to be clear about who owns the recordings made at Studio and how decisions and income from those recordings are shared. The Parties therefore agree as follows.',
                ],
            },
            {
                h: 'Definitions',
                p: [
                    '**"Master"** means any sound recording made in whole or in part at Studio\'s facilities, or by Studio\'s personnel or equipment at any other location, during the Term, at any stage of completion. This includes multitrack session files, stems, individual tracks, takes, outtakes, rough mixes, alternate versions, final mixes and mastered versions, together with all copies and derivatives of them, in any format now known or later developed.',
                    '**"Composition"** means the underlying musical work embodied in a Master: the melody, harmony, lyrics and arrangement as written.',
                    '**"Exploit"** means to sell, distribute, stream, download, license, publicly perform, broadcast, synchronize or otherwise use commercially.',
                    '**"Project"** means the recordings described in Schedule A. This Agreement covers every Master made during the Term, whether or not it is listed in Schedule A.',
                ],
            },
            {
                h: 'What This Agreement Covers, and What It Does Not',
                initial: true,
                p: [
                    '**The recordings are covered.** This Agreement governs ownership, control and income of the Masters.',
                    '**The songs are not covered.** Artist and any co-writers keep all rights in the Compositions, including copyright, publishing, songwriter and publisher royalties, public performance royalties and mechanical royalties. Nothing in this Agreement transfers any interest in any Composition to Studio. If any Studio personnel contribute to writing a Composition, their share will be recorded separately in a signed split sheet.',
                    '**Pre-existing material.** Recordings made elsewhere and brought to Studio (for example beats, stems or samples) remain owned by their existing owners. To the extent Artist controls that material, Artist grants the Parties a non-exclusive, perpetual license to use it as embodied in the Masters. Studio\'s and Artist\'s co-ownership applies to everything recorded, produced, edited, mixed or mastered at Studio.',
                    '**Mix-only and master-only work.** A recording made entirely elsewhere that Studio only mixes or masters is not a Master under this Agreement unless the Parties agree otherwise in writing.',
                ],
            },
            {
                h: 'Equal Co-Ownership',
                initial: true,
                p: [
                    'Each Party owns an undivided fifty percent (50%) interest in all right, title and interest, including the copyright, in and to each Master, throughout the world, for the full term of copyright and any renewals and extensions, starting from the moment the Master is created.',
                    'To the extent either Party would otherwise own more than fifty percent (50%) of any Master, that Party hereby assigns to the other Party the interest needed to make their ownership equal.',
                    'Either Party may register the copyright in a Master with the U.S. Copyright Office naming both Parties as copyright claimants, and the other Party will cooperate. The sound recording notice on each Master will read: "(P) [year] {{stageName}} and {{studio.name}}."',
                ],
            },
            {
                h: 'Joint Control and Creative Approval',
                initial: true,
                p: [
                    '**Mutual approval.** Because the Parties own the Masters equally, neither Party may do any of the following without the other Party\'s written approval (email is sufficient):',
                    {
                        list: [
                            'release, distribute or make any Master available to the public;',
                            'approve a final mix or master as ready for release;',
                            'license a Master for film, television, advertising, video games or any other synchronization, or for sampling or interpolation by others;',
                            'grant any exclusive license, or sell, assign, pledge or otherwise transfer or encumber any interest in a Master, except as allowed in Section 10;',
                            'create or authorize remixes, edits or alternate versions of a Master for release; or',
                            'enter into any distribution, label or licensing agreement covering a Master.',
                        ],
                    },
                    'This mutual-approval requirement replaces any right either Party might otherwise have under copyright law to license or Exploit the Masters on its own.',
                    '**Creative decisions.** Creative decisions about any Master intended for release, including take selection, production, arrangement changes made in the studio, mixing and mastering, will be made jointly. Studio will give good-faith weight to Artist\'s artistic vision, and Artist will give good-faith weight to Studio\'s professional judgment on production and sound quality. No Master will be released until both Parties approve its final version.',
                    '**Timely responses.** Approvals will not be unreasonably withheld, conditioned or delayed. If a Party does not respond to a written request within ten (10) business days, the requesting Party may send a second written notice. If there is still no response within five (5) business days after the second notice, the request is treated as approved.',
                    '**Permitted private and portfolio use.** Without further approval: (a) either Party may use any Master privately and non-publicly, for reference or to pitch to prospective labels, managers, publishers or collaborators, under a duty of confidentiality; and (b) Studio may use excerpts of up to sixty (60) seconds of any released Master, and play released Masters in full at its facility, to promote Studio\'s services. Unreleased Masters will not be shared publicly by either Party.',
                ],
            },
            {
                h: 'Administration',
                p: [
                    '{{adminName}} will act as the "Administrator." The Administrator will set up and manage distribution of approved releases (for example through a digital distributor), obtain ISRC codes, register the Masters with SoundExchange and similar organizations, collect income from the Masters and pay {{otherName}} its share under Section 7.',
                    'The Administrator acts on behalf of both Parties and only within the approvals given under Section 5. The Administrator will not charge any administration fee. {{otherName}} may request read-only access to, or reports from, any distribution account holding the Masters at any time. Where a distributor offers automatic royalty splits, the Administrator will use them to pay {{otherName}}\'s share directly.',
                ],
            },
            {
                h: 'Income Split',
                initial: true,
                p: [
                    '**Split.** The Parties will share Net Master Receipts equally: fifty percent (50%) to Artist and fifty percent (50%) to Studio.',
                    '**"Gross Master Receipts"** means all money actually received from Exploiting the Masters, including streaming and download royalties, physical sales, master-use and synchronization fees, the sound-recording-owner share of digital performance and neighboring rights royalties, sample licenses, and proceeds from any approved sale of the Masters.',
                    '**"Approved Costs"** means distributor fees and commissions, plus third-party costs both Parties approved in advance in writing (for example outside mastering, sample clearance, manufacturing, paid marketing and copyright registration fees).',
                    '**"Net Master Receipts"** means Gross Master Receipts minus Approved Costs.',
                    '**Not shared.** The following are not Gross Master Receipts and belong entirely to the Party entitled to them: (a) all income from the Compositions; (b) the featured-artist share of SoundExchange and similar statutory royalties, which is paid directly to the featured artist, and the non-featured performer shares paid to the AFM & SAG-AFTRA Intellectual Property Rights Distribution Fund; (c) Artist\'s income from live performance, merchandise, endorsements and personal appearances; and (d) Studio\'s session fees.',
                    '**Session fees.** {{feeText}} No session fees, studio costs or production costs will be deducted from Artist\'s share of Net Master Receipts unless both Parties agree in writing.',
                ],
            },
            {
                h: 'Accounting and Audit',
                p: [
                    'Within forty-five (45) days after the end of each calendar quarter in which any Gross Master Receipts are received, the Administrator will send {{otherName}} a statement showing Gross Master Receipts and Approved Costs by Master and by source, together with payment of {{otherName}}\'s share. Amounts under $25 may be carried forward to the next quarter.',
                    'Once per calendar year, on thirty (30) days\' written notice, {{otherName}} or its accountant may inspect the Administrator\'s records relating to the Masters. If the inspection reveals an underpayment of more than ten percent (10%) for the period reviewed, the Administrator will pay the shortfall and the reasonable cost of the inspection. A statement becomes binding unless objected to in writing within three (3) years after it is sent.',
                ],
            },
            {
                h: 'Credits, Names and Likeness',
                p: [
                    '**Credits.** Each released Master will credit "Recorded at {{studio.name}}" and will credit Studio\'s producers and engineers as appropriate, in metadata and anywhere credits customarily appear. Artist will be credited as the featured artist as Artist directs. An accidental failure to give credit is not a breach, but the responsible Party will correct it going forward once notified.',
                    '**Names and likeness.** Each Party may use the other Party\'s name, approved likeness, approved biography and logos only in connection with Exploiting and promoting approved Masters. Studio may also list Artist as a client of Studio.',
                ],
            },
            {
                h: 'Transfers, Buyout and Label Deals',
                initial: true,
                p: [
                    '**Right of first refusal.** If either Party wants to sell or transfer its interest in any Master to a third party, it must first offer that interest to the other Party on the same terms. The other Party has thirty (30) days to accept. Any permitted transferee takes subject to this Agreement.',
                    '**Artist buyout.** At any time, Artist may purchase Studio\'s entire interest in any Master for {{buyoutText}}. On payment, Studio will sign an assignment of its interest in that Master to Artist. Studio keeps its credit under Section 9 and its portfolio rights under Section 5.',
                    '**Label and distribution deals.** If Artist is offered a recording or distribution agreement that requires ownership or exclusive control of a Master, the Parties will negotiate in good faith, considering options such as a buyout, a license to the label, or Studio keeping a royalty in place of ownership. Studio will not unreasonably block a genuine offer that pays Studio fair value for its interest.',
                    '**Successors.** Each Party\'s interest in the Masters passes to its heirs, successors and permitted assigns, who are bound by this Agreement.',
                ],
            },
            {
                h: 'Session Files and Storage',
                p: [
                    'Studio will keep the session files for the Masters for at least {{studio.fileRetentionYears}} years after the last session and will notify Artist before deleting them. Either Party may request copies of final mixes, masters and stems at the cost of media and transfer. Studio may hold delivery of files from a session until the fees for that session are paid. Neither Party will destroy the only remaining copy of any Master without thirty (30) days\' written notice to the other.',
                ],
            },
            {
                h: 'Guest Performers, Samples and Clearances',
                p: [
                    'Before any Master is released, Artist will make sure every person who performs on it (other than Studio personnel) has signed Studio\'s Guest Performer Release or an equivalent written release. Studio is responsible for releases from its own personnel.',
                    'Artist will tell Studio about any samples or interpolations of third-party recordings or compositions. No Master containing an uncleared sample or interpolation will be released. Clearance costs are Approved Costs only if both Parties approve them.',
                ],
            },
            {
                h: 'Composition Licenses',
                p: [
                    'So that approved Masters can be Exploited, Artist will license the Compositions Artist controls (and will ask any co-writers and publishers to do the same) for audio-only reproduction and distribution of the Masters at the prevailing statutory mechanical rate. This gives Studio no ownership of any Composition. Synchronization and other licenses of the Compositions remain the decision of Artist and the co-writers.',
                ],
            },
            {
                h: 'Term and Termination',
                p: [
                    'The Term starts on the Effective Date and continues until either Party ends it by written notice (email is sufficient), effective thirty (30) days after the notice is sent.',
                    'Ending the Term only affects recordings made afterwards. Every Master created before the Term ends remains co-owned under this Agreement for the full term of copyright, and Sections 3 through 13 and 15 through 17 survive.',
                ],
            },
            {
                h: 'Promises Each Party Makes',
                p: [
                    'Each Party has the right and authority to sign and perform this Agreement, and doing so does not violate any other agreement it is bound by.',
                    'Artist is at least eighteen (18) years old, or Artist\'s parent or legal guardian has signed below. Artist is not bound by any exclusive recording, production, label or similar agreement that gives anyone else rights in recordings of Artist\'s performances, except as Artist has disclosed to Studio in writing before signing. Material Artist brings to Studio is original to Artist or properly cleared.',
                    'Studio will perform its services in a professional manner, and the equipment and software Studio uses are lawfully licensed.',
                    'Each Party will defend and indemnify the other against third-party claims arising from its own breach of these promises.',
                ],
            },
            {
                h: 'Disputes',
                p: [
                    'If a dispute arises, the Parties will first try in good faith to resolve it by talking directly for at least thirty (30) days. If that fails, they will try mediation in {{studio.county}}, {{studio.state}}, splitting the mediator\'s fee equally, before starting any lawsuit. Either Party may still go to small claims court, or ask a court for an order to stop an unapproved release of a Master.',
                    GENERAL_LAW,
                ],
            },
            {
                h: 'General',
                p: [
                    '**Entire agreement.** This Agreement, including Schedule A, is the complete agreement about ownership of the Masters and replaces any earlier understanding on that subject. Any change must be in writing and signed by both Parties.',
                    '**Relationship.** The Parties are independent co-owners. Nothing in this Agreement makes either Party the employee, partner, joint venturer or agent of the other.',
                    '**Severability and waiver.** If any part of this Agreement is found unenforceable, the rest stays in effect and the unenforceable part will be enforced to the maximum extent allowed. A Party\'s failure to enforce a term is not a waiver of it.',
                    '**Notices.** Notices may be sent by email to the addresses on the signature page, or to any updated address a Party provides in writing.',
                    GENERAL_ESIGN,
                    GENERAL_ADVICE,
                ],
            },
            {
                h: 'Schedule A: Project Details',
                schedule: true,
                p: [
                    {
                        dl: [
                            ['Project title', '{{projectTitle}}'],
                            ['Anticipated songs', '{{trackList}}'],
                            ['First session date', '{{startDateText}}'],
                            ['Session fees', (v) => ({ standard: 'Standard rates', reduced: 'Reduced: {{rateNote}}', waived: 'Waived' })[v.feeMode] || ''],
                            ['Administrator', '{{adminLabel}}'],
                            ['Artist buyout price', (v) => v.buyout ? `$${Number(v.buyout).toLocaleString('en-US')} per Master` : 'Negotiated / fair market value (Section 10)'],
                        ],
                    },
                ],
            },
        ],
    },

    // ────────────────────────────────────────────────────────────────────────────
    {
        id: 'guest',
        version: '2026.1',
        title: 'Guest Performer Release',
        short: 'Guest Performer',
        blurb: 'For featured and session musicians on a co-owned record. Clears their performance so the master can be released.',
        signer: 'Performer',
        fields: [
            ...party('Performer'),
            { id: 'mainArtist', label: 'Main artist', type: 'text', required: true, group: 'terms' },
            { id: 'projectTitle', label: 'Project / release title', type: 'text', required: true, group: 'terms' },
            { id: 'tracks', label: 'Songs performed on (one per line)', type: 'textarea', group: 'terms', wide: true },
            { id: 'role', label: 'Instrument(s) / vocal role', type: 'text', required: true, group: 'terms', hint: 'e.g. "Background vocals, tenor sax"' },
            { id: 'fee', label: 'Fee (USD)', type: 'number', group: 'terms', hint: 'Leave blank or 0 if unpaid.' },
            { id: 'credit', label: 'Credit as', type: 'text', group: 'terms', hint: 'e.g. "Saxophone: Jane Doe". Blank = name and instrument.' },
        ],
        derive: (v) => ({
            trackList: (v.tracks || '').split('\n').map((t) => t.trim()).filter(Boolean).join('; ') || 'all recordings made for the Project',
            feeLine: Number(v.fee) > 0
                ? `Performer will be paid a one-time fee of $${Number(v.fee).toLocaleString('en-US')} within thirty (30) days after the session, as full payment for the Performances and the rights granted in this Release.`
                : 'Performer is contributing the Performances without a fee, in exchange for credit and the opportunity to appear on the recordings, and agrees that no fee is owed.',
            creditLine: v.credit || `${v.stageName || v.legalName || '[name]'}, ${v.role || '[instrument]'}`,
        }),
        sections: [
            {
                h: 'Parties',
                p: [
                    'This Guest Performer Release (the "Release") is made on {{effectiveDate}} by {{legalName}}, professionally known as {{stageName}}, of {{address}} ("Performer"), in favor of {{studio.legalName}} ("Studio") and {{mainArtist}} ("Artist"), who co-own the recordings described below.',
                ],
            },
            {
                h: 'The Performances',
                p: [
                    'Performer has performed, or will perform, {{role}} (the "Performances") on recordings for the project "{{projectTitle}}", specifically: {{trackList}}. The recordings were or will be made at or by Studio (the "Masters").',
                ],
            },
            {
                h: 'Ownership of the Recordings',
                initial: true,
                p: [
                    'Performer agrees that the Masters, including the recordings of the Performances, are owned by Studio and Artist. To the extent Performer has any copyright or other interest in the recordings of the Performances, Performer hereby assigns that interest to Studio and Artist in equal shares.',
                    'Performer is not a co-owner of the Masters and is not entitled to any master royalties or other payments from them, except the fee (if any) in Section 4 and any payments made to performers directly by law, such as distributions from the AFM & SAG-AFTRA Intellectual Property Rights Distribution Fund.',
                    '**Songwriting is separate.** This Release does not affect any songwriting credit or share Performer may have in the underlying Compositions. Any writing contribution will be recorded in a separate signed split sheet.',
                ],
            },
            {
                h: 'Compensation',
                p: ['{{feeLine}}'],
            },
            {
                h: 'Consent to Use',
                initial: true,
                p: [
                    'Performer consents to the recording, editing, mixing, mastering and Exploitation of the Performances as embodied in the Masters, in any media now known or later developed, throughout the world, forever.',
                    'Performer grants Studio and Artist the right to use Performer\'s name, approved likeness and approved biography in credits, metadata, packaging and promotion of the Masters. Performer will be credited as: "{{creditLine}}." An accidental failure to credit is not a breach but will be corrected going forward once Studio or Artist is notified.',
                ],
            },
            {
                h: 'Promises',
                p: [
                    'Performer is free to sign this Release and is not bound by any exclusive agreement that would prevent it. If Performer is a member of a union such as the AFM or SAG-AFTRA, Performer has told Studio before the session. Performer is at least eighteen (18) years old, or Performer\'s parent or legal guardian has signed below.',
                ],
            },
            {
                h: 'General',
                p: [GENERAL_LAW, GENERAL_ESIGN, GENERAL_ADVICE],
            },
        ],
    },

    // ────────────────────────────────────────────────────────────────────────────
    {
        id: 'split',
        version: '2026.1',
        title: 'Songwriter Split Sheet',
        short: 'Split Sheet',
        blurb: 'Records who wrote the song and each writer\'s percentage. Keeps the song clearly separate from the recording.',
        signer: 'Writer',
        fields: [
            ...party('Writer'),
            { id: 'songTitle', label: 'Song title', type: 'text', required: true, group: 'terms' },
            { id: 'altTitles', label: 'Alternate titles', type: 'text', group: 'terms' },
            { id: 'writtenDate', label: 'Date written', type: 'date', group: 'terms' },
            { id: 'writers', label: 'Writers and shares', type: 'writers', required: true, group: 'terms', wide: true },
            { id: 'samples', label: 'Samples or interpolations used', type: 'textarea', group: 'terms', wide: true, hint: 'Leave blank if none.' },
        ],
        derive: (v) => ({
            altTitlesText: v.altTitles ? ` (also known as "${v.altTitles}")` : '',
            samplesText: (v.samples || '').trim() || 'None.',
            writtenText: v.writtenDate ? `, written on or about ${fmtDate(v.writtenDate)}` : '',
        }),
        sections: [
            {
                h: 'Purpose',
                p: [
                    'This Split Sheet records who wrote the musical composition titled "{{songTitle}}"{{altTitlesText}}{{writtenText}} (the "Composition"), and each writer\'s ownership share.',
                    '**Song, not recording.** This Split Sheet concerns only the Composition: the music and lyrics. It does not concern any sound recording. Ownership of recordings made at {{studio.name}} is covered by a separate Master Recording Co-Ownership Agreement.',
                ],
            },
            {
                h: 'Writers and Shares',
                initial: true,
                p: [
                    'The writers of the Composition and their ownership shares are:',
                    { table: 'writers' },
                    'Unless a publisher is listed, each writer\'s share includes both the writer\'s share and the publisher\'s share of that writer\'s interest. The shares total one hundred percent (100%).',
                ],
            },
            {
                h: 'Samples and Interpolations',
                p: ['The writers disclose the following samples or interpolations of other works: {{samplesText}}'],
            },
            {
                h: 'Registration and Cooperation',
                p: [
                    'Each writer is responsible for registering the Composition and their share with their own performing rights organization (such as ASCAP, BMI or SESAC), with The MLC, and with any other collection society, using the shares above. The writers will cooperate with each other to complete registrations and will not register shares that differ from this Split Sheet.',
                ],
            },
            {
                h: 'Signature',
                p: [
                    'Each writer signs a separate copy of this Split Sheet. By signing, {{legalName}} confirms that the writers and shares listed above are correct. All signed copies together make up one agreement.',
                    GENERAL_ESIGN,
                ],
            },
        ],
    },

    // ────────────────────────────────────────────────────────────────────────────
    {
        id: 'services',
        version: '2026.1',
        title: 'Studio Services and Booking Agreement',
        short: 'Studio Services',
        blurb: 'Rates, deposits, cancellations, file delivery, conduct and liability for studio sessions.',
        signer: 'Client',
        fields: [
            ...party('Client'),
            { id: 'rate', label: 'Session rate', type: 'text', required: true, group: 'terms', hint: 'e.g. "$60 per hour, 3-hour minimum"' },
            { id: 'deposit', label: 'Deposit', type: 'text', required: true, group: 'terms', hint: 'e.g. "50% of the first session" or "$100"' },
            { id: 'cancelHours', label: 'Cancellation notice (hours)', type: 'number', required: true, group: 'terms', default: '48' },
            { id: 'maxGuests', label: 'Maximum guests in the studio', type: 'number', required: true, group: 'terms', default: '3' },
            { id: 'sessionDates', label: 'Booked session dates', type: 'text', group: 'terms', wide: true, hint: 'Optional.' },
        ],
        derive: (v) => ({ sessionDatesText: v.sessionDates || 'as scheduled in writing between the parties' }),
        sections: [
            {
                h: 'Parties',
                p: ['This Studio Services and Booking Agreement (the "Agreement") is made on {{effectiveDate}} between {{studio.legalName}} ("Studio") and {{legalName}}, professionally known as {{stageName}}, of {{address}} ("Client").'],
            },
            {
                h: 'Services and Sessions',
                p: ['Studio will provide recording studio time, equipment and engineering services ("Sessions") on these dates: {{sessionDatesText}}. Additional Sessions may be booked by email and are covered by this Agreement.'],
            },
            {
                h: 'Rates, Deposits and Payment',
                initial: true,
                p: [
                    'Client will pay {{rate}}. A deposit of {{deposit}} is due to confirm each booking and is applied to that booking\'s final invoice. The balance for each Session is due at the end of that Session. Time runs from the scheduled start, including setup, breaks and time spent waiting for Client or Client\'s guests. Overtime is billed in thirty (30) minute increments, subject to availability.',
                    'Invoices unpaid for more than thirty (30) days may incur a late fee of 1.5% per month (or the maximum allowed by law, if lower), and Studio may pause further Sessions until the balance is paid.',
                ],
            },
            {
                h: 'Cancellations and Lateness',
                initial: true,
                p: [
                    'Client may cancel or reschedule a Session with at least {{cancelHours}} hours\' notice and have the deposit applied to a rescheduled Session. With less notice, the deposit is forfeited. If Studio must cancel, Client may reschedule or receive a full refund of the deposit. If Client is more than one (1) hour late without notice, the Session may be treated as a late cancellation.',
                ],
            },
            {
                h: 'Recordings and Files',
                initial: true,
                p: [
                    '**Ownership.** Ownership of the recordings made during Sessions is governed by the Master Recording Co-Ownership Agreement between Client and Studio. Client will sign that agreement before the first Session, and Studio may decline to start a Session until it is signed.',
                    '**Delivery.** Studio will deliver bounces, mixes, stems or session files as agreed once the Sessions they come from are paid in full.',
                    '**Backups.** Studio keeps session files for at least {{studio.fileRetentionYears}} years and uses reasonable care to back them up, but Client should keep its own copies of delivered files. Studio is not responsible for data lost through equipment failure or events beyond its reasonable control.',
                ],
            },
            {
                h: 'Conduct and Safety',
                p: [
                    'Client may bring up to {{maxGuests}} guests unless Studio agrees otherwise, and is responsible for their behavior. No smoking or vaping indoors, no weapons, and no illegal substances. Food and drinks are kept away from equipment. Studio may end a Session, without refund, if Client or a guest is abusive, unsafe or damaging property.',
                    'Client will pay the reasonable cost of repairing or replacing Studio property damaged by Client or Client\'s guests, beyond normal wear and tear.',
                ],
            },
            {
                h: 'Liability',
                p: [
                    'Personal instruments, equipment and belongings brought to Studio are at Client\'s own risk. Except for its own gross negligence or willful misconduct, Studio\'s total liability arising out of any Session is limited to the fees Client paid for that Session.',
                ],
            },
            {
                h: 'General',
                p: [
                    'This Agreement, together with the Master Recording Co-Ownership Agreement, is the complete agreement about Sessions. Changes must be in writing. If any part is unenforceable, the rest stays in effect.',
                    GENERAL_LAW, GENERAL_ESIGN,
                ],
            },
        ],
    },

    // ────────────────────────────────────────────────────────────────────────────
    {
        id: 'media',
        version: '2026.1',
        title: 'Content and Likeness Release',
        short: 'Content Release',
        blurb: 'Lets the studio post behind-the-scenes photos and video, with limits on unreleased music.',
        signer: 'Artist',
        fields: [
            ...party('Artist'),
            {
                id: 'approval', label: 'Approval before posting', type: 'select', required: true, group: 'terms', default: 'each',
                options: [['each', 'Artist approves each item before it is posted'], ['none', 'Studio may post without prior approval']],
            },
        ],
        derive: (v) => ({
            approvalText: v.approval === 'none'
                ? 'Studio may publish Content without asking Artist first. Artist may ask Studio to remove any specific item, and Studio will do so within fourteen (14) days where reasonably possible.'
                : 'Studio will send Artist each item of Content featuring Artist before publishing it and will publish it only with Artist\'s approval (email or text message is sufficient). Approval will not be unreasonably withheld.',
        }),
        sections: [
            {
                h: 'Parties',
                p: ['This Content and Likeness Release (the "Release") is made on {{effectiveDate}} by {{legalName}}, professionally known as {{stageName}} ("Artist"), in favor of {{studio.legalName}} ("Studio").'],
            },
            {
                h: 'Permission',
                initial: true,
                p: [
                    'Artist allows Studio to photograph, film and record behind-the-scenes audio of Artist at Studio and during Studio sessions (the "Content"), and to use the Content, along with Artist\'s name and stage name, on Studio\'s website, social media, portfolio and advertising for Studio\'s services.',
                    'The Content will not be used to suggest that Artist endorses any product or brand other than Studio, and will not be sold or licensed to third parties.',
                ],
            },
            {
                h: 'Approval',
                p: ['{{approvalText}}'],
            },
            {
                h: 'Music in Content',
                initial: true,
                p: [
                    'Studio will not include any unreleased music in public Content without Artist\'s specific approval. Content may include excerpts of up to sixty (60) seconds of released recordings Artist and Studio co-own.',
                ],
            },
            {
                h: 'Ownership, Sharing and Revocation',
                p: [
                    'Studio owns the Content. Artist may reshare Studio\'s posts and may request copies of Content featuring Artist for Artist\'s own promotion, with credit to Studio.',
                    'Artist may withdraw this permission for future Content at any time by written notice. Studio will stop publishing new Content and remove existing posts within fourteen (14) days where reasonably possible, but cannot recall copies others have already shared.',
                    'No payment is owed for the Content.',
                ],
            },
            {
                h: 'General',
                p: [GENERAL_LAW, GENERAL_ESIGN],
            },
        ],
    },
];

function fmtDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
