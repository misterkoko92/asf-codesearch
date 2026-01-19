const GROUP_SEPARATOR = "\u001d";

const SYMBOLOGY_PREFIXES = [
  { id: "]C1", label: "GS1-128" },
  { id: "]c1", label: "GS1-128" },
  { id: "]d2", label: "GS1 DataMatrix" },
  { id: "]Q3", label: "GS1 QR" },
  { id: "]q3", label: "GS1 QR" }
];

const VARIABLE_LENGTH = -1 as const;

type AiEntry = {
  ai: string;
  value: string;
};

type AiSpec = {
  aiLength: number;
  dataLength: number | null;
  maxLength: number | null;
};

type AiRuleTuple = [string, number] | [string, typeof VARIABLE_LENGTH, number];

type AiSpecTables = {
  twoDigit: AiRuleTuple[];
  threeDigit: AiRuleTuple[];
  threeDigitPlusDigit: AiRuleTuple[];
  fourDigit: AiRuleTuple[];
};

const AI_TABLES: AiSpecTables = {
  twoDigit: [
    ["00", 18],
    ["01", 14],
    ["02", 14],
    ["10", VARIABLE_LENGTH, 20],
    ["11", 6],
    ["12", 6],
    ["13", 6],
    ["14", 6],
    ["15", 6],
    ["16", 6],
    ["17", 6],
    ["20", 2],
    ["21", VARIABLE_LENGTH, 20],
    ["22", VARIABLE_LENGTH, 29],
    ["30", VARIABLE_LENGTH, 8],
    ["37", VARIABLE_LENGTH, 8],
    ["90", VARIABLE_LENGTH, 30],
    ["91", VARIABLE_LENGTH, 30],
    ["92", VARIABLE_LENGTH, 30],
    ["93", VARIABLE_LENGTH, 30],
    ["94", VARIABLE_LENGTH, 30],
    ["95", VARIABLE_LENGTH, 30],
    ["96", VARIABLE_LENGTH, 30],
    ["97", VARIABLE_LENGTH, 3],
    ["98", VARIABLE_LENGTH, 30],
    ["99", VARIABLE_LENGTH, 30]
  ],
  threeDigit: [
    ["240", VARIABLE_LENGTH, 30],
    ["241", VARIABLE_LENGTH, 30],
    ["242", VARIABLE_LENGTH, 6],
    ["243", VARIABLE_LENGTH, 20],
    ["250", VARIABLE_LENGTH, 30],
    ["251", VARIABLE_LENGTH, 30],
    ["253", VARIABLE_LENGTH, 17],
    ["254", VARIABLE_LENGTH, 20],
    ["400", VARIABLE_LENGTH, 30],
    ["401", VARIABLE_LENGTH, 30],
    ["402", 17],
    ["403", VARIABLE_LENGTH, 30],
    ["410", 13],
    ["411", 13],
    ["412", 13],
    ["413", 13],
    ["414", 13],
    ["415", 13],
    ["416", 13],
    ["417", 13],
    ["420", VARIABLE_LENGTH, 20],
    ["421", VARIABLE_LENGTH, 15],
    ["422", 3],
    ["423", VARIABLE_LENGTH, 15],
    ["424", 3],
    ["425", 3],
    ["426", 3],
    ["427", 3]
  ],
  threeDigitPlusDigit: [
    ["310", 6],
    ["311", 6],
    ["312", 6],
    ["313", 6],
    ["314", 6],
    ["315", 6],
    ["316", 6],
    ["320", 6],
    ["321", 6],
    ["322", 6],
    ["323", 6],
    ["324", 6],
    ["325", 6],
    ["326", 6],
    ["327", 6],
    ["328", 6],
    ["329", 6],
    ["330", 6],
    ["331", 6],
    ["332", 6],
    ["333", 6],
    ["334", 6],
    ["335", 6],
    ["336", 6],
    ["337", 6],
    ["340", 6],
    ["341", 6],
    ["342", 6],
    ["343", 6],
    ["344", 6],
    ["345", 6],
    ["346", 6],
    ["347", 6],
    ["348", 6],
    ["349", 6],
    ["350", 6],
    ["351", 6],
    ["352", 6],
    ["353", 6],
    ["354", 6],
    ["355", 6],
    ["356", 6],
    ["357", 6],
    ["360", 6],
    ["361", 6],
    ["362", 6],
    ["363", 6],
    ["364", 6],
    ["365", 6],
    ["366", 6],
    ["367", 6],
    ["368", 6],
    ["369", 6],
    ["390", VARIABLE_LENGTH, 15],
    ["391", VARIABLE_LENGTH, 18],
    ["392", VARIABLE_LENGTH, 15],
    ["393", VARIABLE_LENGTH, 18],
    ["703", VARIABLE_LENGTH, 30]
  ],
  fourDigit: [
    ["7001", 13],
    ["7002", VARIABLE_LENGTH, 30],
    ["7003", 10],
    ["8001", 14],
    ["8002", VARIABLE_LENGTH, 20],
    ["8003", VARIABLE_LENGTH, 30],
    ["8004", VARIABLE_LENGTH, 30],
    ["8005", 6],
    ["8006", 18],
    ["8007", VARIABLE_LENGTH, 30],
    ["8008", VARIABLE_LENGTH, 12],
    ["8018", 18],
    ["8020", VARIABLE_LENGTH, 25],
    ["8100", 6],
    ["8101", 10],
    ["8102", 2],
    ["8110", VARIABLE_LENGTH, 70],
    ["8200", VARIABLE_LENGTH, 70]
  ]
};

const AI_MAPS = (() => {
  const map = new Map<string, AiSpec>();
  const prefixMap = new Map<string, AiSpec>();

  const addRule = (ai: string, dataLength: number, maxLength?: number) => {
    if (dataLength === VARIABLE_LENGTH) {
      map.set(ai, { aiLength: ai.length, dataLength: null, maxLength: maxLength ?? null });
    } else {
      map.set(ai, { aiLength: ai.length, dataLength, maxLength: null });
    }
  };

  const addPrefixRule = (prefix: string, dataLength: number, maxLength?: number) => {
    if (dataLength === VARIABLE_LENGTH) {
      prefixMap.set(prefix, { aiLength: 4, dataLength: null, maxLength: maxLength ?? null });
    } else {
      prefixMap.set(prefix, { aiLength: 4, dataLength, maxLength: null });
    }
  };

  AI_TABLES.twoDigit.forEach((entry) => addRule(entry[0], entry[1] as number, entry[2] as number | undefined));
  AI_TABLES.threeDigit.forEach((entry) => addRule(entry[0], entry[1] as number, entry[2] as number | undefined));
  AI_TABLES.fourDigit.forEach((entry) => addRule(entry[0], entry[1] as number, entry[2] as number | undefined));
  AI_TABLES.threeDigitPlusDigit.forEach((entry) => addPrefixRule(entry[0], entry[1] as number, entry[2] as number | undefined));

  return { map, prefixMap };
})();

export type Gs1BarcodeData = {
  raw: string;
  symbology: string | null;
  aiEntries: AiEntry[];
  aiMap: Record<string, string>;
  gtin?: string | null;
  ddm?: string | null;
  ddmFormatted?: string | null;
};

function stripSymbologyId(value: string) {
  const prefix = SYMBOLOGY_PREFIXES.find((entry) => value.startsWith(entry.id));
  if (prefix) {
    return {
      symbology: prefix.label,
      value: value.slice(prefix.id.length)
    };
  }
  return { symbology: null, value };
}

function extractAiEntries(value: string): AiEntry[] {
  const entries: AiEntry[] = [];
  const matches = [...value.matchAll(/\((\d{2,4})\)/g)];
  if (!matches.length) return entries;

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const ai = match[1];
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? value.length) : value.length;
    const rawValue = value.slice(start, end).replaceAll(GROUP_SEPARATOR, "");
    entries.push({ ai, value: rawValue });
  }

  return entries;
}

function matchAiSpec(value: string, index: number) {
  const four = value.slice(index, index + 4);
  const three = value.slice(index, index + 3);
  const two = value.slice(index, index + 2);

  if (four.length === 4 && AI_MAPS.map.has(four)) {
    return { ai: four, spec: AI_MAPS.map.get(four)! };
  }

  if (three.length === 3) {
    const prefixSpec = AI_MAPS.prefixMap.get(three);
    if (prefixSpec && value.length >= index + 4) {
      return { ai: value.slice(index, index + 4), spec: prefixSpec };
    }
    if (AI_MAPS.map.has(three)) {
      return { ai: three, spec: AI_MAPS.map.get(three)! };
    }
  }

  if (two.length === 2 && AI_MAPS.map.has(two)) {
    return { ai: two, spec: AI_MAPS.map.get(two)! };
  }

  if (/^\d{2}$/.test(two)) {
    return {
      ai: two,
      spec: {
        aiLength: 2,
        dataLength: null,
        maxLength: 30
      }
    };
  }

  return null;
}

function parseElementStringEntries(rawValue: string): AiEntry[] {
  const value = rawValue.replace(/[\r\n\t\s]/g, "");
  const entries: AiEntry[] = [];
  let index = 0;

  while (index < value.length) {
    if (value[index] === GROUP_SEPARATOR) {
      index += 1;
      continue;
    }

    const match = matchAiSpec(value, index);
    if (!match) {
      return [];
    }

    const { ai, spec } = match;
    const start = index + spec.aiLength;
    let end: number;

    if (spec.dataLength != null) {
      end = start + spec.dataLength;
    } else {
      const separatorIndex = value.indexOf(GROUP_SEPARATOR, start);
      const maxEnd = spec.maxLength ? start + spec.maxLength : value.length;
      if (separatorIndex !== -1 && separatorIndex < maxEnd) {
        end = separatorIndex;
      } else {
        end = Math.min(value.length, maxEnd);
      }
    }

    if (end > value.length) {
      return [];
    }

    const field = value.slice(start, end);
    entries.push({ ai, value: field });
    index = end;
  }

  return entries;
}

function entriesToMap(entries: AiEntry[]) {
  const map: Record<string, string> = {};
  entries.forEach((entry) => {
    map[entry.ai] = entry.value;
  });
  return map;
}

function onlyDigits(value: string | undefined | null) {
  if (!value) return null;
  const digits = value.replace(/[^\d]/g, "");
  return digits.length ? digits : null;
}

export function formatGs1Date(value: string | null | undefined) {
  if (!value || !/^\d{6}$/.test(value)) return null;
  const year = Number.parseInt(value.slice(0, 2), 10);
  const month = Number.parseInt(value.slice(2, 4), 10);
  const day = Number.parseInt(value.slice(4, 6), 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const fullYear = 2000 + year;
  return `${fullYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseGs1Barcode(input: string): Gs1BarcodeData | null {
  const raw = input.trim();
  if (!raw) return null;

  const { symbology, value: stripped } = stripSymbologyId(raw);
  const hasParens = /\(\d{2,4}\)/.test(stripped);
  const hasGs1Markers = Boolean(symbology) || stripped.includes(GROUP_SEPARATOR) || hasParens;

  const aiEntries = hasParens ? extractAiEntries(stripped) : hasGs1Markers ? parseElementStringEntries(stripped) : [];

  if (!aiEntries.length) {
    if (!hasGs1Markers) return null;

    const digits = onlyDigits(stripped) ?? "";
    const gtinMatch = digits.match(/01(\d{14})/);
    const ddmMatch = digits.match(/15(\d{6})/);
    if (!gtinMatch && !ddmMatch) {
      return null;
    }

    const gtin = gtinMatch ? gtinMatch[1] : null;
    const ddm = ddmMatch ? ddmMatch[1] : null;
    return {
      raw,
      symbology,
      aiEntries: [],
      aiMap: {},
      gtin,
      ddm,
      ddmFormatted: formatGs1Date(ddm)
    };
  }

  const aiMap = entriesToMap(aiEntries);
  const gtinValue = onlyDigits(aiMap["01"]) ?? onlyDigits(aiMap["02"]);
  const gtin = gtinValue && gtinValue.length >= 14 ? gtinValue.slice(0, 14) : gtinValue ?? null;
  const ddmValue = onlyDigits(aiMap["15"]);
  const ddm = ddmValue && ddmValue.length >= 6 ? ddmValue.slice(0, 6) : ddmValue ?? null;

  return {
    raw,
    symbology,
    aiEntries,
    aiMap,
    gtin,
    ddm,
    ddmFormatted: formatGs1Date(ddm)
  };
}
