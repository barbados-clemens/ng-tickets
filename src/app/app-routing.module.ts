import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TicketsListComponent} from "./tickets-list/tickets-list.component";

const routes: Routes = [
    {path: '', component: TicketsListComponent},
    {
        path: 'ticket',
        loadChildren: () => import('./ticket-details/ticket-details.module').then(m => m.TicketDetailsModule)
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
