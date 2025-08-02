import {Routes} from "@angular/router";
import {ProjetosComponent} from "../components/projetos/projetos.component";
import {CatlComponent} from "../components/catl/catl.component";
import {InicioComponent} from "../components/inicio/inicio.component";
import {AecComponent} from "../components/aec/aec.component";
import {RefeicoesComponent} from "../components/refeicoes/refeicoes.component";
import {MusicaComponent} from "../components/musica/musica.component";
import {ExplicacoesComponent} from "../components/explicacoes/explicacoes.component";
import {NatacaoComponent} from "../components/natacao/natacao.component";
import {CrecheComponent} from "../components/creche/creche.component";

export const routes: Routes = [
    { path: '', component: InicioComponent },
    { path: 'aec', component: AecComponent },
    { path: 'creche', component: CrecheComponent },
    { path: 'catl', component: CatlComponent },
    { path: 'aec', component: AecComponent },
    { path: 'refeicoes', component: RefeicoesComponent },
    { path: 'musica', component: MusicaComponent },
    { path: 'natacao', component: NatacaoComponent },
    { path: 'explicacoes', component: ExplicacoesComponent },
    { path: 'projetos', component: ProjetosComponent },
    { path: '**', component: InicioComponent },
]
