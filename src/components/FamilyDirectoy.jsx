import React, { useMemo, useState } from "react";
import { createUseStyles } from "react-jss";

/**
 * Inline SVG Icons
 */
const CallIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l1.82-1.82a1 1 0 011.02-.24c1.12.37 2.33.57 3.55.57a1 1 0 011 1v2.99a1 1 0 01-1 1C11.07 21.89 2.11 12.93 2.11 2.4a1 1 0 011-1H6.1a1 1 0 011 1c0 1.22.19 2.43.57 3.55a1 1 0 01-.24 1.02l-1.81 1.82z" />
  </svg>
);

const PlusIcon = ({ className, open }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    {open ? (
      <path d="M5 12h14" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <>
        <path d="M12 5v14" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 12h14" strokeWidth="2" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M19.11 17.23c-.29-.15-1.71-.84-1.98-.94-.27-.1-.47-.15-.67.15-.2.29-.77.94-.94 1.13-.17.2-.35.22-.64.08-.29-.15-1.23-.45-2.34-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.14-.14.29-.35.44-.52.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.29-1.05 1.02-1.05 2.49 0 1.46 1.08 2.88 1.24 3.08.15.2 2.12 3.23 5.14 4.53.72.31 1.27.49 1.7.62.71.23 1.36.2 1.88.12.57-.09 1.71-.7 1.96-1.38.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34z" />
    <path d="M27.67 4.33A15.95 15.95 0 0016 0C7.16 0 0 7.16 0 16c0 2.82.73 5.56 2.12 7.98L0 32l8.2-2.15A15.92 15.92 0 0016 32c8.84 0 16-7.16 16-16 0-4.27-1.66-8.28-4.33-11.67zM16 29.3c-2.56 0-5.05-.69-7.23-2L8.2 27l-4.86 1.28 1.3-4.73-.29-.5A13.31 13.31 0 012.7 16C2.7 8.66 8.66 2.7 16 2.7S29.3 8.66 29.3 16 23.34 29.3 16 29.3z" />
  </svg>
);

const useStyles = createUseStyles({
  wrapper: {
    '@media (min-width: 1024px)': {
      maxWidth: 1100,
      margin: '0 auto',
    },
  },
  hero: {
    height: '30vh', // top 30%
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    borderBottomLeftRadius: '0.75rem',
    borderBottomRightRadius: '0.75rem',
  },
  cardShadow: {
    boxShadow:
      '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.1)',
  },
});

/**
 * Utilities to parse the flexible JSON keys
 */
function getMainPerson(record) {
  const name = record["m1 name"] || "";
  const phone = record["m1 phone"] || "";
  return { name, phone };
}

function getMemberEntries(record) {
  // Find all member indices from keys like "(Member-2) Name and relation with main member"
  const indices = new Set();
  Object.keys(record).forEach((k) => {
    const m = k.match(/\(Member-(\d+)\)/i);
    if (m) indices.add(m[1]);
  });

  const members = [];
  indices.forEach((idx) => {
    // try multiple possible key variants for name and phone
    const nameKeys = [
      `(Member-${idx}) Name and relation with main member`,
      `(Member-${idx}) Name`,
      `Member-${idx} Name`,
    ];
    const phoneKeys = [
      `Member-${idx}  Mobile no`,
      `(Member-${idx}) Mobile no`,
      `(Member-${idx})  Mobile no`,
      `(Member-${idx})   Mobile no`,
    ];

    const name =
      nameKeys.map((k) => record[k]).find((v) => v && String(v).trim()) || "";
    const phone =
      phoneKeys.map((k) => record[k]).find((v) => v && String(v).trim()) || "";

    if (name || phone) {
      members.push({ name: String(name || "").trim(), phone: String(phone || "").trim() });
    }
  });

  // Keep order by Member index
  return members.sort((a, b) => {
    const ai = parseInt((a.name.match(/\(Member-(\d+)/i) || [0, 0])[1]) || 0;
    const bi = parseInt((b.name.match(/\(Member-(\d+)/i) || [0, 0])[1]) || 0;
    return ai - bi;
  });
}

function phoneHref(num) {
  const cleaned = String(num || "").replace(/\s+/g, "");
  if (!cleaned) return "#";
  return `tel:${cleaned}`;
}

function waHref(num) {
  const cleaned = String(num || "").replace(/[^\d+]/g, "");
  if (!cleaned) return "#";
  // WhatsApp universal link
  return `https://wa.me/${cleaned.replace(/^\+/, "")}`;
}

/**
 * Single line row (icon - name - plus - whatsapp)
 */
const MemberRow = ({ name, phone, bold = false, onToggle, open }) => {
  return (
    <div className="flex items-center gap-3 py-2">
      <a
        href={phoneHref(phone)}
        className="text-emerald-600 hover:text-emerald-700 transition"
        aria-label="Call"
        onClick={(e) => {
          // allow default tel: on mobile; no-op for missing number
          if (!phone) e.preventDefault();
        }}
      >
        <CallIcon className="w-5 h-5" />
      </a>

      <div className={`flex-1 truncate ${bold ? "font-bold text-slate-800" : "text-slate-700"}`}>
        {name || "—"}
      </div>

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="text-slate-600 hover:text-slate-800 p-1 rounded hover:bg-slate-100 transition"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <PlusIcon className="w-5 h-5" open={open} />
        </button>
      )}

      <a
        href={waHref(phone)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-500 hover:text-green-600 transition"
        aria-label="WhatsApp"
        onClick={(e) => {
          if (!phone) e.preventDefault();
        }}
      >
        <WhatsAppIcon className="w-5 h-5" />
      </a>
    </div>
  );
};

const FamilyCard = ({ record }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const main = useMemo(() => getMainPerson(record), [record]);
  const others = useMemo(() => getMemberEntries(record), [record]);

  return (
    <div className={`bg-white rounded-xl ${classes.cardShadow} p-4`}>
      <MemberRow
        name={main.name}
        phone={main.phone}
        bold
        onToggle={() => setOpen((v) => !v)}
        open={open}
      />
      {open && (
        <div className="mt-2 border-t border-slate-100 pt-2 space-y-1">
          {others.length ? (
            others.map((m, idx) => (
              <MemberRow key={idx} name={m.name} phone={m.phone} />
            ))
          ) : (
            <div className="text-sm text-slate-500">પરિવારના અન્ય સભ્યોની એન્ટ્રી ઉપલબ્ધ નથી.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default function FamilyDirectory({ data, groupPhotoUrl }) {
  const classes = useStyles();

  const cleaned = useMemo(
    () =>
      (data || []).filter((r) => (r?.["m1 name"] || "").toString().trim() !== ""),
    [data]
  );

  return (
    <div className={`w-full ${classes.wrapper} px-4 pb-10`}>
      <div
        className={classes.hero}
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.35)), url('${groupPhotoUrl}')`,
        }}
      />

      <div className="-mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cleaned.map((record, i) => (
            <FamilyCard key={i} record={record} />
          ))}
        </div>
      </div>
    </div>
  );
}
