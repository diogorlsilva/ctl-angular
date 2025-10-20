import * as ExcelJS from 'exceljs';

export type Workbook = ExcelJS.Workbook
export type WorkbookModel = ExcelJS.WorkbookModel;
export type WorksheetModel = ExcelJS.WorksheetModel;

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
    modalId: string;
    title: string;
    description: string;
    iconSRC: string;
    photoSRCs: string[];
}

export type SectionItem = {
    smallDescription: string;
    description: string;
    leftTitle: string;
    leftBullets: string[];
    rightTitle: string;
    rightBullets: string[];
    photoSRCs: string[];
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
export const mobileNumber = '+351 999 999 999';
export const ctlEmail = 'ctlsc@outlook.com';

export const mission = {
    title: 'Missão, Visão, Valores',
    sections: [{
        title: 'MISSÃO',
        message: 'O Clube de Tempos Livres de Santa Clara tem como missão uma resposta social qualificada que se espelha no desenvolvimento de atividades culturais, recreativas e desportivas.'
    }, {
        title: 'VISÃO',
        message: 'O CTL pretende ser identificado como uma IPSS pró ativa de referência no apoio à família, à infância, à juventude, à pessoa idosa, bem como na implementação de políticas e práticas de apoio à integração social e comunitária.'
    }, {
        title: 'VALORES',
        message: 'Afetividade, Realização pessoal, Capacitação, Oportunidades, Igualdade, Respeito, Inovação social, Solidariedade'
    }]
}

export const institutionMessage = 'O CTL – Clube de Tempos Livres de Santa Clara é uma Instituição Particular de Solidariedade Social dedicada ao bem-estar, à inclusão e à dignidade de todos. Aqui, cada pessoa é acolhida com respeito, carinho e profissionalismo.\n' +
    '\n' +
    'Com uma equipa dedicada e programas que fazem a diferença, o CTL é um espaço de esperança, crescimento e partilha. Porque cuidar é mais do que ajudar — é transformar vidas com amor.'
