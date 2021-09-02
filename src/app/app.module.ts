import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from './app.component';
import {BackendService} from './backend.service';
import {TicketCardModule} from "./ticket-card/ticket-card.module";
import {TicketsListComponent} from "./tickets-list/tickets-list.component";

@NgModule({
    declarations: [
        AppComponent,
        TicketsListComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        TicketCardModule,
        ReactiveFormsModule,
    ],
    providers: [BackendService],
    bootstrap: [AppComponent]
})
export class AppModule {

}
