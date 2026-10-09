import { Routes } from "@angular/router";
import { InicioComponent } from "../components/inicio/inicio.component";

// Section pages are lazy-loaded so their code is only downloaded when visited.
export const routes: Routes = [
    { path: '', component: InicioComponent },
    { path: 'aec', loadComponent: () => import('../components/aec/aec.component').then(m => m.AecComponent) },
    {
        path: 'creche',
        loadComponent: () => import('../components/creche/creche.component').then(m => m.CrecheComponent)
    },
    { path: 'catl', loadComponent: () => import('../components/catl/catl.component').then(m => m.CatlComponent) },
    {
        path: 'refeicoes',
        loadComponent: () => import('../components/refeicoes/refeicoes.component').then(m => m.RefeicoesComponent)
    },
    {
        path: 'musica',
        loadComponent: () => import('../components/musica/musica.component').then(m => m.MusicaComponent)
    },
    {
        path: 'natacao',
        loadComponent: () => import('../components/natacao/natacao.component').then(m => m.NatacaoComponent)
    },
    {
        path: 'explicacoes',
        loadComponent: () => import('../components/explicacoes/explicacoes.component').then(m => m.ExplicacoesComponent)
    },
    {
        path: 'projetos',
        loadComponent: () => import('../components/projetos/projetos.component').then(m => m.ProjetosComponent)
    },
    { path: '**', redirectTo: '' },
]
