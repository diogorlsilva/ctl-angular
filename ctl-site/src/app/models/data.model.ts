export type NewsItem = {
    title: string;
    description: string;
    photoSrc: string | null;
}

export type PersonItem = {
    name: string;
    description: string;
    photoSrc: string;
};

export type NumberItem = {
    description: string;
    value: string;
}

export type PartnerItem = {
    photoSrc: string;
    alt: string;
}

export type ProjectItem = {
    title: string;
    description: string;
    iconSRC: string;
    photoSRCs: string[];
    videoURL: string;
}

export type SectionItem = {
    smallDescription: string;
    description: string;
    leftTitle: string;
    leftBullets: string[];
    rightTitle: string;
    rightBullets: string[];
    photoSRCs: string[];
    videoTitle?: string;
    videoURL?: string;
}

export type AccountReport = {
    year: string;
    balanceSheetName: string;
    balanceSheetFile: string;
    profitAndLossName: string;
    profitAndLossFile: string;
}

export type OrganisationItem = {
    generalAssembly: { title: string; name: string; }[],
    direction: { title: string; name: string; }[],
    fiscalCouncil: { title: string; name: string; }[],
}

export const telephoneNumber = '239 445 810';
export const address = 'Edifício Arco-Íris';
export const ctlEmail = 'ctlsc@outlook.com';
export const mapsUrl = 'https://maps.app.goo.gl/g8QyPuTkq2U12ceP7';
export const postalAddress = [
    '(transversal) Rua Augusto Matos',
    'Alto do Carapito, Santa Clara',
    '3040-014 Coimbra',
    'Portugal',
];

export const mission: {
    title: string;
    sections: { title: string; message?: string; values?: string[] }[];
} = {
    title: 'Missão, visão e valores',
    sections: [{
        title: 'Missão / Propósito',
        message: 'Criar oportunidades e promover experiências significativas que contribuam para o desenvolvimento integral de cada criança, criando impacto social.'
    }, {
        title: 'Visão',
        message: 'Uma criança é uma oportunidade, valorizamos o seu percurso potenciando-a num agente de mudança.'
    }, {
        title: 'Valores',
        values: ['Respeito', 'Equidade', 'Empatia', 'Colaboração', 'Integridade']
    }]
}

export const institutionMessage = 'O CTL – Clube de Tempos Livres de Santa Clara é uma Instituição Particular de Solidariedade Social dedicada ao bem-estar, à inclusão e à dignidade de todos. Aqui, cada pessoa é acolhida com respeito, carinho e profissionalismo.\n' +
    '\n' +
    'Com uma equipa dedicada e programas que fazem a diferença, o CTL é um espaço de esperança, crescimento e partilha. Porque cuidar é mais do que ajudar — é transformar vidas com amor.'
