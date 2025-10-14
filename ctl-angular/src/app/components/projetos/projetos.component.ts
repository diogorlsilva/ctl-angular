import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
    CtlSectionBackgroundComponent
} from "../../shared-components/ctl-section-background/ctl-section-background.component";
import { ProjectItem } from "../../models/data.model";
import { FetchDataService } from "../../services/fetch-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ModalComponent } from "../modal/modal.component";
import {
    CtlSectionMessageBoxComponent
} from "../../shared-components/ctl-section-message-box/ctl-section-message-box.component";

@Component({
    selector: 'ctl-projects',
    standalone: true,
    imports: [
        CtlSectionBackgroundComponent,
        ModalComponent,
        CtlSectionMessageBoxComponent
    ],
    templateUrl: './projetos.component.html',
    styleUrl: './projetos.component.scss'
})
export class ProjetosComponent implements OnInit {
    messageBoxText = 'A nossa equipa é composta por profissionais experientes e dedicados, que trabalham em estreita colaboração com os nossos clientes para garantir que cada projeto é concluído com sucesso. Desde a conceção inicial até à execução final, estamos comprometidos em fornecer soluções inovadoras e eficientes que atendam às necessidades específicas de cada cliente.';

    projectItems: ProjectItem[];

    private readonly fetchDataService = inject(FetchDataService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        if (this.fetchDataService.isSectionsDataLoaded) {
            this.projectItems = this.fetchDataService.projectsItems;

            return;
        }

        this.fetchDataService.setSectionsData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.projectItems = this.fetchDataService.projectsItems);
    }
}
