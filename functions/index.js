import { defineSecret } from 'firebase-functions/params';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

/**
 * Publication du site depuis le back-office.
 *
 * Le site est un export statique : mettre en ligne une modification, c'est
 * relancer le build. Le workflow GitHub `publish.yml` s'en charge ; il faut un
 * jeton GitHub pour le déclencher, et ce jeton ne peut pas vivre dans le
 * navigateur. Ces deux fonctions sont donc le seul code serveur du projet :
 * elles vérifient que l'appelant est connecté, puis parlent à GitHub.
 *
 * Jeton : fine-grained token limité au dépôt, permission « Actions » en
 * lecture et écriture, enregistré avec
 *   firebase functions:secrets:set GITHUB_TOKEN
 */

const GITHUB_TOKEN = defineSecret('GITHUB_TOKEN');

const REPO = 'LouisGauvain/eco2bat';
const WORKFLOW = 'publish.yml';
const BRANCH = 'main';

const options = {
  region: 'europe-west1',
  secrets: [GITHUB_TOKEN],
  // Un seul gérant : inutile de laisser la fonction se multiplier.
  maxInstances: 1,
};

function requireAuth(request) {
  // Aucune inscription n'est ouverte : être connecté vaut « c'est le gérant »,
  // exactement comme dans `firestore.rules`.
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Connexion requise pour publier le site.');
  }
}

async function github(path, init = {}) {
  const response = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${GITHUB_TOKEN.value()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  if (!response.ok) {
    console.error('[publish] GitHub a refusé la requête', response.status, await response.text());
    throw new HttpsError('internal', 'GitHub a refusé la demande de publication.');
  }
  return response;
}

export const publishSite = onCall(options, async (request) => {
  requireAuth(request);

  await github(`/actions/workflows/${WORKFLOW}/dispatches`, {
    method: 'POST',
    body: JSON.stringify({ ref: BRANCH }),
  });

  console.info('[publish] publication demandée par', request.auth.token.email ?? request.auth.uid);
  return { ok: true };
});

export const publishStatus = onCall(options, async (request) => {
  requireAuth(request);

  const response = await github(`/actions/workflows/${WORKFLOW}/runs?per_page=1&branch=${BRANCH}`);
  const { workflow_runs: runs = [] } = await response.json();
  const run = runs[0];
  if (!run) return { run: null };

  // Étapes du job, pour afficher l'avancement dans le back-office. Tant que
  // GitHub n'a pas attribué de serveur, la liste est vide.
  const jobsResponse = await github(`/actions/runs/${run.id}/jobs`);
  const { jobs = [] } = await jobsResponse.json();
  const steps = (jobs[0]?.steps ?? []).map((step) => ({
    name: step.name,
    status: step.status,
    conclusion: step.conclusion,
  }));

  return {
    run: {
      status: run.status,
      conclusion: run.conclusion,
      createdAt: Date.parse(run.created_at),
      updatedAt: Date.parse(run.updated_at),
      url: run.html_url,
      steps,
    },
  };
});

/**
 * Email au gérant à chaque nouvelle demande de contact.
 *
 * Déclenchée par l'écriture de la demande dans Firestore : le formulaire ne
 * change pas, et si l'envoi échoue la demande reste visible dans le
 * back-office. L'email part par l'API de Brevo ; « Répondre » écrit
 * directement au visiteur.
 *
 * Clé API Brevo (SMTP & API › Clés API), enregistrée avec
 *   firebase functions:secrets:set BREVO_API_KEY
 * L'adresse d'expédition doit appartenir à un domaine authentifié dans Brevo
 * (SPF/DKIM), sinon l'email part en spam.
 */

const BREVO_API_KEY = defineSecret('BREVO_API_KEY');

const SITE_URL = 'https://eco2bat.fr';
const SENDER = { name: 'Site ECO2BAT', email: 'noreply@eco2bat.fr' };
const MANAGER = { name: 'ECO2BAT', email: 'contact@eco2bat.fr' };

// Libellés repris de `src/lib/leads.ts` (les fonctions ne lisent pas le code
// du site) : à garder alignés.
const LABELS = {
  prestation: {
    renovation: 'Rénovation énergétique (conseil)',
    dpe: 'DPE',
    'audit-energetique': 'Audit énergétique logement',
    'mesure-physique': 'Mesure physique du bâtiment',
    'controle-rt2012': 'Contrôle RT2012 fin de chantier',
    'amo-eau-energie': 'AMO économies d’eau et d’énergie',
    autre: 'Je ne sais pas encore',
  },
  propertyType: {
    maison: 'Maison individuelle',
    appartement: 'Appartement',
    immeuble: 'Immeuble / copropriété',
    tertiaire: 'Local tertiaire',
    neuf: 'Construction neuve',
    patrimoine: 'Patrimoine de plusieurs bâtiments',
  },
  deadline: {
    urgent: 'Sous 15 jours',
    mois: 'Dans le mois',
    trimestre: 'Dans les trois mois',
    renseignement: 'Je me renseigne',
  },
};

const label = (kind, value) => LABELS[kind][value] ?? value;

/**
 * Numéro saisi librement dans le formulaire (« 0612345678 », « +33 6 12… »,
 * « 06.12.34.56.78 »). Un numéro français est affiché « 06 12 34 56 78 » et
 * appelé au format international ; tout autre est laissé tel que saisi.
 */
function formatPhone(raw) {
  const digits = raw.replace(/[^\d+]/g, '').replace(/^00/, '+');
  const national = digits.startsWith('+33')
    ? `0${digits.slice(3).replace(/^0/, '')}`
    : digits;

  if (/^0[1-9]\d{8}$/.test(national)) {
    return {
      display: national.replace(/(\d{2})(?=\d)/g, '$1 '),
      href: `tel:+33${national.slice(1)}`,
    };
  }
  return { display: raw.trim(), href: `tel:${digits}` };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const notifyNewLead = onDocumentCreated(
  { document: 'leads/{leadId}', region: 'europe-west1', secrets: [BREVO_API_KEY], maxInstances: 1 },
  async (event) => {
    const lead = event.data?.data();
    if (!lead) return;

    const prestation = label('prestation', lead.prestation);
    const propertyType = label('propertyType', lead.propertyType);
    const deadline = label('deadline', lead.deadline);
    const receivedAt = (lead.createdAt?.toDate?.() ?? new Date()).toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY.value(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: SENDER,
        to: [MANAGER],
        replyTo: { name: lead.name, email: lead.email },
        subject: `Nouvelle demande — ${prestation} · ${propertyType} · ${lead.city}`,
        htmlContent: managerEmail({ lead, prestation, propertyType, deadline, receivedAt }),
        textContent: [
          `Nouvelle demande de ${lead.name}`,
          '',
          `Prestation : ${prestation}`,
          `Type de bien : ${propertyType}`,
          `Commune : ${lead.city}`,
          `Échéance : ${deadline}`,
          `Email : ${lead.email}`,
          lead.phone ? `Téléphone : ${formatPhone(lead.phone).display}` : null,
          lead.message ? `\nMessage :\n${lead.message}` : null,
          '',
          `Reçue le ${receivedAt}.`,
          `Back-office : ${SITE_URL}/admin/`,
        ]
          .filter((line) => line !== null)
          .join('\n'),
      }),
    });

    if (!response.ok) {
      console.error('[leads] Brevo a refusé l’envoi', response.status, await response.text());
      return;
    }
    console.info('[leads] gérant prévenu de la demande', event.params.leadId);
  },
);

/** Email au gérant, en tableaux et styles en ligne pour les messageries. */
function managerEmail({ lead, prestation, propertyType, deadline, receivedAt }) {
  const e = escapeHtml;
  const font = "'Source Sans 3', 'Segoe UI', Helvetica, Arial, sans-serif";
  const serif = "'Source Serif 4', Georgia, 'Times New Roman', serif";
  const phone = lead.phone ? formatPhone(lead.phone) : null;
  const phoneHref = phone?.href ?? null;

  const row = (name, value, last = false) => `
    <tr>
      <td class="row-label" style="padding:12px 0;width:150px;color:#78716c;font-size:15px;${last ? '' : 'border-bottom:1px solid #f0efec;'}">${name}</td>
      <td class="row-value" style="padding:12px 0;font-size:15px;font-weight:600;color:#1c1917;word-break:break-word;${last ? '' : 'border-bottom:1px solid #f0efec;'}">${value}</td>
    </tr>`;

  const rows = [
    ['Prestation', e(prestation)],
    ['Type de bien', e(propertyType)],
    ['Commune', e(lead.city)],
    ['Échéance', e(deadline)],
    ['Email', `<a href="mailto:${e(lead.email)}" style="color:#226b1f;">${e(lead.email)}</a>`],
    ...(lead.phone ? [['Téléphone', `<a href="${e(phoneHref)}" style="color:#226b1f;">${e(phone?.display)}</a>`]] : []),
    ['Newsletter', lead.newsletter ? 'Accepte de la recevoir' : 'Non'],
  ];

  const urgent = lead.deadline === 'urgent';

  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nouvelle demande</title>
<style>
  @media (max-width: 600px) {
    .outer { padding: 12px 8px !important; }
    .px { padding-left: 20px !important; padding-right: 20px !important; }
    .btn-cell { display: block !important; width: 100% !important; padding: 0 0 10px !important; }
    .row-label { display: block !important; width: auto !important; padding: 12px 0 2px !important; border-bottom: 0 !important; }
    .row-value { display: block !important; padding: 0 0 12px !important; }
    .title { font-size: 26px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f6f5f2;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f2;">
<tr><td class="outer" align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fffdfa;border:1px solid #ebe7e0;border-radius:8px;font-family:${font};color:#1c1917;">
  <tr><td class="px" style="padding:24px 32px;border-bottom:1px solid #ebe7e0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:${font};font-size:22px;font-weight:700;letter-spacing:0.02em;"><span style="color:#005ca9;">ECO2</span><span style="color:#379e32;">BAT</span></td>
      <td align="right" style="font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#78716c;">Nouvelle demande</td>
    </tr></table>
  </td></tr>

  <tr><td class="px" style="padding:32px 32px 8px;">
    <span style="display:inline-block;font-size:13px;font-weight:700;border-radius:999px;padding:4px 12px;${urgent ? 'color:#92400e;background:#fef3c7;' : 'color:#44403c;background:#f0efec;'}">${e(deadline)}</span>
    <span style="display:inline-block;font-size:13px;font-weight:600;color:#226b1f;background:#e2f1e0;border-radius:999px;padding:4px 12px;">${e(prestation)}</span>
    <h1 class="title" style="margin:14px 0 8px;font-family:${serif};font-weight:600;font-size:30px;line-height:1.2;color:#1c1917;">${e(lead.name)}</h1>
    <p style="margin:0;font-size:16px;line-height:1.5;color:#44403c;">${e(prestation)} · ${e(propertyType.toLowerCase())} à ${e(lead.city)}.</p>
  </td></tr>

  <tr><td class="px" style="padding:16px 32px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${
        phoneHref
          ? `<td class="btn-cell" width="50%" style="padding-right:6px;"><a href="${e(phoneHref)}" style="display:block;text-align:center;text-decoration:none;background:#2b8527;color:#ffffff;font-weight:700;font-size:16px;padding:14px 16px;border-radius:6px;">Appeler ${e(phone?.display)}</a></td>`
          : ''
      }
      <td class="btn-cell" width="50%" style="${phoneHref ? 'padding-left:6px;' : ''}"><a href="mailto:${e(lead.email)}" style="display:block;text-align:center;text-decoration:none;background:#ffffff;color:#1c1917;border:1px solid #d6d3d1;font-weight:600;font-size:16px;padding:13px 16px;border-radius:6px;">Répondre par email</a></td>
    </tr></table>
  </td></tr>

  <tr><td class="px" style="padding:0 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ebe7e0;">
      ${rows.map(([name, value], index) => row(name, value, index === rows.length - 1)).join('')}
    </table>
  </td></tr>

  ${
    lead.message
      ? `<tr><td class="px" style="padding:24px 32px 0;">
    <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#78716c;">Son message</p>
    <div style="background:#f6f5f2;border-radius:6px;padding:16px 20px;font-size:15px;line-height:1.6;color:#292524;white-space:pre-line;">${e(lead.message)}</div>
  </td></tr>`
      : ''
  }

  <tr><td class="px" style="padding:28px 32px 32px;">
    <a href="${SITE_URL}/admin/" style="color:#226b1f;font-weight:700;font-size:15px;text-decoration:none;">Ouvrir la demande dans l’administration →</a>
  </td></tr>

  <tr><td class="px" style="padding:20px 32px;background:#fafaf9;border-top:1px solid #ebe7e0;border-radius:0 0 8px 8px;font-size:13px;line-height:1.5;color:#57534e;">
    Reçue le ${e(receivedAt)} via le formulaire de eco2bat.fr.<br>
    Répondre à cet email écrit directement à ${e(lead.name)}.
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
